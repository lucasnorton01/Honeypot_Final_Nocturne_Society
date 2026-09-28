#!/usr/bin/env python3
"""
SSH Attack runner - executes SSH attacks against Cowrie from inside Docker network.
Uses paramiko for SSH connections.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import paramiko
import random
import time
from datetime import datetime, timezone

# Cowrie is accessible via hostname "cowrie" inside Docker network
HOST = "cowrie"
SSH_PORT = 2222

# Credentials from cowrie/userdb.txt
VALID_CREDS = {"admin": "test123", "guest": "guest123"}

# Pool de sesiones fallidas (credenciales invalidas) - se sortea un subconjunto
# distinto en cada corrida para no repetir exactamente la misma sesion siempre
# (la tabla iocs tiene UNIQUE(type, value): repetir user:pass/comandos idénticos
# entre corridas no aporta IoCs nuevos).
FAIL_POOL = [
    {"user": "admin", "pass": "123456", "cmds": ["whoami", "uname -a", "id"], "desc": "admin:123456 (fail)"},
    {"user": "root", "pass": "toor", "cmds": ["id", "cat /etc/passwd", "ls /"], "desc": "root:toor (fail)"},
    {"user": "admin", "pass": "admin", "cmds": ["w", "uptime", "df -h"], "desc": "admin:admin (fail)"},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"], "desc": "test:test (fail)"},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "uname -r"], "desc": "oracle:oracle (fail)"},
    {"user": "root", "pass": "password", "cmds": ["whoami", "cat /etc/shadow"], "desc": "root:password (fail)"},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home"], "desc": "deploy:deploy (fail)"},
    {"user": "git", "pass": "git123", "cmds": ["id", "find / -name .git -type d"], "desc": "git:git123 (fail)"},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"], "desc": "ci:ci (fail)"},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"], "desc": "devops:devops (fail)"},
    {"user": "backup", "pass": "backup2024", "cmds": ["id", "df -h", "ls -la /var"], "desc": "backup:backup2024 (fail)"},
    {"user": "jenkins", "pass": "jenkins", "cmds": ["whoami", "pwd", "cat /etc/hostname"], "desc": "jenkins:jenkins (fail)"},
    {"user": "postgres", "pass": "postgres", "cmds": ["id", "hostname"], "desc": "postgres:postgres (fail)"},
    {"user": "ubuntu", "pass": "ubuntu123", "cmds": ["whoami", "date", "uname -r"], "desc": "ubuntu:ubuntu123 (fail)"},
]

# Sesiones exitosas (credenciales validas de cowrie/userdb.txt). Se sortea un
# subconjunto de al menos 2 en cada corrida (nunca las 6 siempre en el mismo
# orden), con un subconjunto de comandos elegido al azar de un pool mas amplio.
# Nota: mas cuentas validas = mas diversidad de IoCs tipo "credential" nuevos
# por sesion exitosa (UNIQUE(type,value) en iocs descarta repetidos).
SUCCESS_CMD_POOL = ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "id",
                     "pwd", "hostname", "date", "uptime", "df -h", "free -m"]
SUCCESS_SESSIONS = [
    {"user": "guest", "pass": "guest123", "desc": "guest:guest123 (SUCCESS)"},
    {"user": "admin", "pass": "test123", "desc": "admin:test123 (SUCCESS)"},
    {"user": "oracle", "pass": "oracle2024", "desc": "oracle:oracle2024 (SUCCESS)"},
    {"user": "backup", "pass": "backupsvc99", "desc": "backup:backupsvc99 (SUCCESS)"},
    {"user": "deploy", "pass": "deployKey7", "desc": "deploy:deployKey7 (SUCCESS)"},
    {"user": "ftpuser", "pass": "ftpPass321", "desc": "ftpuser:ftpPass321 (SUCCESS)"},
]


def build_sessions():
    """Arma la lista de sesiones de esta corrida: subconjunto aleatorio del
    pool de fallidas (orden y comandos variables) + credenciales exitosas.

    Las exitosas se eligen por ROTACION horaria (no sorteo libre): con un
    numero finito de cuentas validas y UNIQUE(type,value) en iocs, gastar
    varias credenciales distintas en la misma corrida agota el pool y hace
    que todas las corridas siguientes repitan (0 IoCs nuevos). Rotando de a
    una por hora se maximiza cuantas sesiones exitosas son "primera vez" a
    lo largo de la ventana."""
    n_fail = random.randint(4, len(FAIL_POOL))
    fails = random.sample(FAIL_POOL, k=n_fail)

    hour_index = int(time.time() // 3600)
    primary = SUCCESS_SESSIONS[hour_index % len(SUCCESS_SESSIONS)]
    chosen_success = [primary]
    if random.random() < 0.3:
        others = [s for s in SUCCESS_SESSIONS if s is not primary]
        chosen_success.append(random.choice(others))

    successes = []
    for s in chosen_success:
        n_cmds = random.randint(3, 6)
        cmds = random.sample(SUCCESS_CMD_POOL, k=n_cmds) + ["exit"]
        successes.append({**s, "cmds": cmds})

    sessions = fails + successes
    random.shuffle(sessions)
    return sessions


SESSIONS = build_sessions()


def run_ssh_session(i, sess):
    """Run one SSH attack session."""
    print(f"\n[{i+1}/{len(SESSIONS)}] {sess['desc']}")
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(
            HOST,
            port=SSH_PORT,
            username=sess["user"],
            password=sess["pass"],
            timeout=10,
            allow_agent=False,
            look_for_keys=False
        )
        
        print(f"  + Login OK: {sess['user']}:{sess['pass']}")

        # Cowrie emula una shell interactiva y no soporta bien el canal "exec"
        # no interactivo de paramiko (el canal se cierra al primer comando).
        # Se abre un canal de shell interactivo (como haria un atacante real
        # por terminal) y se escriben los comandos como si fueran tecleados.
        chan = client.invoke_shell()
        time.sleep(1)
        if chan.recv_ready():
            chan.recv(4096)  # descartar banner/prompt inicial

        for cmd in sess["cmds"]:
            if cmd == "exit":
                break
            chan.send(cmd + "\n")
            time.sleep(0.8)
            output = ""
            if chan.recv_ready():
                output = chan.recv(4096).decode("utf-8", errors="replace")
            lines = [l.strip() for l in output.split("\n") if l.strip()]
            display = lines[-3:] if lines else []
            print(f"  $ {cmd}")
            for line in display:
                print(f"    {line}")

        chan.close()
        client.close()
        print(f"  -> SESSION OK")
        return {"session": i+1, "status": "success", "user": sess["user"]}
        
    except paramiko.AuthenticationException:
        print(f"  - Login FAIL: {sess['user']}:{sess['pass']}")
        return {"session": i+1, "status": "auth_failed", "user": sess["user"]}
        
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return {"session": i+1, "status": "error", "user": sess["user"], "error": str(e)}


print(f"SSH Attack Runner - {datetime.now(timezone.utc).isoformat()}")
print(f"Target: {HOST}:{SSH_PORT}")
print(f"Sessions: {len(SESSIONS)}")
print("=" * 60)

results = []
for i, sess in enumerate(SESSIONS):
    result = run_ssh_session(i, sess)
    results.append(result)
    time.sleep(1)

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
succeeded = sum(1 for r in results if r["status"] == "success")
failed_auth = sum(1 for r in results if r["status"] == "auth_failed")
errors = sum(1 for r in results if r["status"] == "error")
print(f"Total sessions: {len(SESSIONS)}")
print(f"Succeeded (login OK): {succeeded}")
print(f"Auth failed (expected): {failed_auth}")
print(f"Errors: {errors}")

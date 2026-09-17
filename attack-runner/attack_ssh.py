#!/usr/bin/env python3
"""
SSH Attack runner - executes SSH attacks against Cowrie from inside Docker network.
Uses paramiko for SSH connections.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import paramiko
import time
from datetime import datetime, timezone

# Cowrie is accessible via hostname "cowrie" inside Docker network
HOST = "cowrie"
SSH_PORT = 2222

# Credentials from cowrie/userdb.txt
VALID_CREDS = {"admin": "test123", "guest": "guest123"}

# 12 attack sessions - mix of failed and successful logins
SESSIONS = [
    {"user": "admin", "pass": "123456", "cmds": ["whoami", "uname -a", "id"], "desc": "admin:123456 (fail)"},
    {"user": "root", "pass": "toor", "cmds": ["id", "cat /etc/passwd", "ls /"], "desc": "root:toor (fail)"},
    {"user": "admin", "pass": "admin", "cmds": ["w", "uptime", "df -h"], "desc": "admin:admin (fail)"},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"], "desc": "test:test (fail)"},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "uname -r"], "desc": "oracle:oracle (fail)"},
    {"user": "root", "pass": "password", "cmds": ["whoami", "cat /etc/shadow"], "desc": "root:password (fail)"},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home"], "desc": "deploy:deploy (fail)"},
    {"user": "guest", "pass": "guest123", "cmds": ["whoami", "pwd", "ls"], "desc": "guest:guest123 (SUCCESS)"},
    {"user": "git", "pass": "git123", "cmds": ["id", "find / -name .git -type d"], "desc": "git:git123 (fail)"},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"], "desc": "ci:ci (fail)"},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"], "desc": "devops:devops (fail)"},
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "exit"], "desc": "admin:test123 (SUCCESS)"},
]


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
        
        # Execute commands
        for cmd in sess["cmds"]:
            if cmd == "exit":
                break
            stdin, stdout, stderr = client.exec_command(cmd, timeout=5)
            output = stdout.read().decode("utf-8", errors="replace")
            lines = [l.strip() for l in output.split("\n") if l.strip()]
            display = lines[-3:] if lines else []
            print(f"  $ {cmd}")
            for line in display:
                print(f"    {line}")
        
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

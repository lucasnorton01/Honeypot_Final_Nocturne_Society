#!/usr/bin/env python3
"""
Attack Simulator for Honeypot Lab
---------------------------------
Simula un atacante conectándose al honeypot Cowrie vía Telnet,
captura automáticamente los logs de todos los componentes y
genera un reporte formateado en pantalla + archivo.

Requiere: Python 3.11+, Docker Desktop, docker compose.
Nota: no depende de telnetlib (removido en Python 3.13); usa sockets.
"""

import argparse
import json
import os
import socket
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Configuración por defecto (override vía argumentos / env)
COMPOSE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_EVIDENCIA_DIR = COMPOSE_DIR / "evidencia"


def log(msg: str, end="\n"):
    print(msg, end=end)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + end)


def separator(title: str = ""):
    line = "─" * 60
    log(f"\n{line}")
    if title:
        log(f"  {title}")
        log(line)


def box_title(lines: list) -> str:
    width = max(len(l) for l in lines) + 4
    border = "═" * width
    out = f"╔{border}╗\n"
    for line in lines:
        out += f"║  {line.ljust(width - 4)}  ║\n"
    out += f"╚{border}╝"
    return out


def run(cmd: list) -> tuple:
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=COMPOSE_DIR)
    return result.stdout.strip(), result.stderr.strip()


def run_dc(*args: str) -> str:
    out, _ = run(["docker", "compose", *args])
    return out


def decode_telnet(data: bytes) -> str:
    """Decodifica la respuesta Telnet descartando bytes IAC (0xFF)
    y otros caracteres de control que ensucian la salida."""
    out = []
    i = 0
    n = len(data)
    while i < n:
        b = data[i]
        if b == 0xFF:  # IAC: negociación Telnet
            i += 1
            if i < n:
                cmd = data[i]
                i += 1
                if cmd == 0xFA:  # SB: saltear hasta IAC SE (0xFF 0xF0)
                    while i < n:
                        if data[i] == 0xFF and i + 1 < n and data[i + 1] == 0xF0:
                            i += 2
                            break
                        i += 1
            continue
        if b in (0x09, 0x0A, 0x0D) or 32 <= b <= 126 or b >= 160:
            out.append(chr(b))
        i += 1
    return "".join(out)


# ── FASE 1: ATAQUE SIMULADO VÍA TELNET ──
class TelnetSession:
    """Cliente Telnet minimalista basado en sockets (sin dependencias)."""

    def __init__(self, host: str, port: int, timeout: int = 10):
        self.sock = socket.create_connection((host, port), timeout=timeout)
        self.sock.settimeout(timeout)
        self.buffer = b""

    def read_until(self, marker: bytes, timeout: int = 5) -> bytes:
        end = time.time() + timeout
        while time.time() < end:
            if marker in self.buffer:
                idx = self.buffer.index(marker) + len(marker)
                data = self.buffer[:idx]
                self.buffer = self.buffer[idx:]
                return data
            try:
                chunk = self.sock.recv(4096)
            except socket.timeout:
                break
            if not chunk:
                break
            self.buffer += chunk
        if marker in self.buffer:
            idx = self.buffer.index(marker) + len(marker)
            data = self.buffer[:idx]
            self.buffer = self.buffer[idx:]
            return data
        data = self.buffer
        self.buffer = b""
        return data

    def read_eager(self, timeout: float = 0.5) -> bytes:
        end = time.time() + timeout
        data = b""
        while time.time() < end:
            try:
                chunk = self.sock.recv(4096)
            except socket.timeout:
                break
            except OSError:
                break
            if not chunk:
                break
            data += chunk
        if self.buffer:
            data = self.buffer + data
            self.buffer = b""
        return data

    def write(self, data: bytes):
        self.sock.sendall(data)

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


def fase_1_ataque(tn, valid_user, valid_pass, brute_creds, command_wait, cmds_to_run) -> dict:
    separator("FASE 1: ATAQUE SIMULADO")
    log(f"\n  Conectando a {TELNET_HOST}:{TELNET_PORT}...")

    banner = decode_telnet(tn.read_until(b"login:", timeout=5))
    log(f"  Banner recibido: {banner.strip()[:80]}...")

    attempts = []
    commands = []

    def try_login(user: str, pwd: str) -> bool:
        tn.write(user.encode() + b"\r\n")
        time.sleep(0.3)
        resp = decode_telnet(tn.read_until(b"Password:", timeout=5))
        tn.write(pwd.encode() + b"\r\n")
        time.sleep(command_wait)
        raw = decode_telnet(tn.read_eager(command_wait))
        time.sleep(command_wait)
        raw2 = decode_telnet(tn.read_eager(command_wait))
        full = raw + raw2

        # Clasificación robusta:
        #  - Fallido: "Login incorrect" o vuelve al prompt "login:"
        #  - Exitoso: aparece prompt de shell (contiene "@" y "$")
        failed_hint = "Login incorrect" in full or "login:" in full
        shell_hint = ("$" in full and "@" in full) or "~$" in full or "# " in full
        success = shell_hint and not failed_hint

        attempts.append({
            "username": user,
            "password": pwd,
            "success": success,
            "raw": (resp + full).strip()[-200:]
        })

        if success:
            log(f"  ✓ Login exitoso: {user} / {pwd}")
        else:
            log(f"  ✗ Login fallido:  {user} / {pwd}")
        return success

    log(f"\n  ── Intentos de login ──")
    for entry in brute_creds:
        u, _, p = entry.partition(":")
        try_login(u or "admin", p)

    log(f"")
    success = try_login(valid_user, valid_pass)

    if not success:
        log(f"\n  [!] No se pudo autenticar, abortando comandos")
        tn.close()
        return {"banner": banner.strip(), "attempts": attempts, "commands": []}

    time.sleep(0.5)
    try:
        tn.read_eager(0.3)
    except Exception:
        pass
    log(f"  Shell prompt detectado")

    log(f"\n  ── Ejecutando comandos ──")
    for cmd_str in cmds_to_run:
        tn.write(cmd_str.encode() + b"\r\n")
        time.sleep(command_wait)
        try:
            output = decode_telnet(tn.read_eager(command_wait))
        except Exception:
            output = ""
        lines = [l.strip() for l in output.split("\n") if l.strip()]
        display = lines[-3:] if lines else []
        log(f"  $ {cmd_str}")
        for line in display:
            log(f"    {line}")
        commands.append({"command": cmd_str, "output": output.strip()})

    tn.close()
    log(f"\n  ✓ Conexión cerrada")

    return {
        "banner": banner.strip(),
        "attempts": attempts,
        "commands": commands,
    }


# ── FASE 2: CAPTURA DE LOGS ──
def fase_2_captura_logs() -> dict:
    separator("FASE 2: CAPTURA DE LOGS")

    # Cowrie JSON log vía log-reader HTTP
    log(f"\n  [1/3] Leyendo cowrie.json vía log-reader :9000...")
    cowrie_report = ""
    try:
        import urllib.request
        with urllib.request.urlopen("http://127.0.0.1:9000/report", timeout=10) as r:
            cowrie_report = r.read().decode("utf-8")
        log(f"  OK ({len(cowrie_report)} bytes)")
    except Exception as e:
        log(f"  WARN: no se pudo leer log-reader ({e})")

    # Forwarder logs
    log(f"  [2/3] Leyendo forwarder logs...")
    fwd_logs = run_dc("logs", "forwarder", "--tail", "25")
    log(f"  OK ({len(fwd_logs)} líneas)")

    # n8n: verificación de entrega
    log(f"  [3/3] Verificando entrega en n8n...")
    n8n_check = run_dc("logs", "n8n", "--tail", "10")
    log(f"  OK")

    return {
        "cowrie_json": cowrie_report,
        "forwarder_logs": fwd_logs,
        "n8n_logs": n8n_check,
    }


# ── FASE 3: REPORTE ──
def fase_3_reporte(ataque: dict, logs: dict):
    separator("FASE 3: REPORTE DE ATAQUE")

    log(box_title([
        "HONEYPOT LAB - REPORTE DE ATAQUE",
        TIMESTAMP.replace("_", " "),
        "",
        f"Atacante simulado:  {TELNET_HOST}:{TELNET_PORT} (Telnet)",
        f"Servicio honeypot:  Cowrie (SSH/Telnet)",
        f"Total intentos:     {len(ataque.get('attempts', []))}",
        f"Comandos ejec.:     {len(ataque.get('commands', []))}",
        "Pipeline:           Cowrie -> Forwarder -> n8n -> PostgreSQL",
    ]))

    separator("INTENTOS DE LOGIN")
    for i, att in enumerate(ataque.get("attempts", []), 1):
        icon = "✓" if att["success"] else "✗"
        log(f"  #{i}  {icon}  {att['username']} / {att['password']}  "
            f"{'(EXITOSO)' if att['success'] else '(fallido)'}")

    if ataque.get("commands"):
        separator("COMANDOS EJECUTADOS POR EL ATACANTE")
        for cmd in ataque["commands"]:
            log(f"\n  $ {cmd['command']}")
            if cmd.get("output"):
                lines = cmd["output"].split("\n")[:5]
                for line in lines:
                    log(f"    {line}")

    separator("LOG CRUDO - COWRIE.JSON (reporte log-reader)")
    if logs.get("cowrie_json"):
        try:
            rep = json.loads(logs["cowrie_json"])
            resumen = rep.get("resumen", {})
            log(f"  total_eventos:   {resumen.get('total_eventos', '?')}")
            log(f"  conexiones:      {resumen.get('conexiones', '?')}")
            log(f"  logins_fallidos: {resumen.get('logins_fallidos', '?')}")
            log(f"  logins_exitosos: {resumen.get('logins_exitosos', '?')}")
            log(f"  comandos:        {resumen.get('comandos_ejecutados', '?')}")
            log(f"  sesiones_unicas: {resumen.get('sesiones_unicas', '?')}")
            log(f"  ips_unicas:      {resumen.get('ips_unicas', '?')}")
            ultimos = rep.get("ultimos_20_eventos", [])
            for ev in ultimos[-8:]:
                log(f"  [{ev.get('eventid', '?')}] {ev.get('src_ip', '?')} -> {ev.get('message', '')[:80]}")
        except json.JSONDecodeError:
            log(f"  (respuesta no JSON)")
    else:
        log(f"  (sin datos)")

    separator("FORWARDER - EVENTOS ENVIADOS A N8N")
    for line in logs.get("forwarder_logs", "").split("\n"):
        if line.strip():
            clean = line.split("forwarder  |")[-1] if "forwarder  |" in line else line
            log(f"  {clean.strip()}")

    separator("N8N - VERIFICACION")
    log(f"  Revisar en la UI de n8n (http://localhost:5678) las ejecuciones")
    log(f"  y en PostgreSQL las filas de la tabla events:")
    log(f"  docker compose exec postgres psql -U honeypot -d honeypot -c 'SELECT count(*) FROM events;'")

    separator()
    log(f"\n  Reporte guardado en: {LOG_FILE}")
    log(f"")


def main():
    # Consola Windows en cp1252 no soporta caracteres del reporte (╔═╗║╚╝✓✗)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description="Honeypot Lab - Attack Simulator")
    parser.add_argument("--host", default=os.environ.get("TELNET_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("TELNET_PORT", "2323")))
    parser.add_argument("--user", default="admin")
    parser.add_argument("--password", default="test123")
    parser.add_argument("--commands", default="whoami,uname -a,cat /etc/passwd,ls -la /home,w,exit")
    parser.add_argument("--brute", default="admin:123456,admin:admin")
    parser.add_argument("--evidencia-dir", default=str(DEFAULT_EVIDENCIA_DIR))
    parser.add_argument("--connect-timeout", type=int, default=10)
    parser.add_argument("--command-wait", type=float, default=0.8)
    args = parser.parse_args()

    global TELNET_HOST, TELNET_PORT, TIMESTAMP, LOG_FILE
    TELNET_HOST = args.host
    TELNET_PORT = args.port
    TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
    evidencia_dir = Path(args.evidencia_dir)
    evidencia_dir.mkdir(parents=True, exist_ok=True)
    LOG_FILE = evidencia_dir / f"ataque_{TIMESTAMP}.log"
    commands_to_run = [c.strip() for c in args.commands.split(",") if c.strip()]
    brute_creds = [c.strip() for c in args.brute.split(",") if c.strip()]

    print(box_title([
        "HONEYPOT LAB - ATTACK SIMULATOR",
        "Simula un atacante real conectándose al",
        "honeypot Cowrie, ejecuta comandos, y",
        "captura los logs de todo el pipeline.",
    ]))

    t_start = time.time()

    # Conexión con manejo de error explícito
    try:
        tn = TelnetSession(TELNET_HOST, TELNET_PORT, timeout=args.connect_timeout)
    except (socket.error, OSError) as e:
        print(f"\n[!] No se pudo conectar a {TELNET_HOST}:{TELNET_PORT}: {e}")
        print(f"    ¿Está el stack levantado? (docker compose up -d)")
        sys.exit(1)

    ataque = fase_1_ataque(tn, args.user, args.password, brute_creds, args.command_wait, commands_to_run)

    log(f"\n  Esperando 3s para que el forwarder procese...")
    time.sleep(3)

    logs = fase_2_captura_logs()

    fase_3_reporte(ataque, logs)

    elapsed = time.time() - t_start
    log(f"\n  Tiempo total: {elapsed:.1f}s")
    log(f"")


if __name__ == "__main__":
    main()

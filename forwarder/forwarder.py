import json
import os
import time
import threading
from pathlib import Path

import requests

# ─────────────────────────────────────────────────────────
# Configuración (todas vía variables de entorno)
# ─────────────────────────────────────────────────────────
N8N_URL = os.environ.get("N8N_URL", "http://n8n:5678/webhook/cowrie")
COWRIE_LOG = os.environ.get("COWRIE_LOG", "/cowrie/var/log/cowrie/cowrie.json")
POLL_INTERVAL = float(os.environ.get("POLL_INTERVAL", "0.3"))
RETRY_DELAY = float(os.environ.get("RETRY_DELAY", "5"))
MAX_ATTEMPTS = int(os.environ.get("MAX_ATTEMPTS", "3"))
SESSION_MAX_DURATION = float(os.environ.get("SESSION_MAX_DURATION", "1800"))
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage" if TELEGRAM_BOT_TOKEN else None
TELEGRAM_ENABLED = bool(TELEGRAM_API and TELEGRAM_CHAT_ID)

# Spool de eventos no entregados (sobrevive a reinicios del forwarder)
SPOOL_FILE = os.environ.get("SPOOL_FILE", "/spool/pending.jsonl")

_sessions = {}
_sessions_lock = threading.Lock()
_spool_lock = threading.Lock()


def log(msg: str):
    print(f"[{time.strftime('%Y-%m-%dT%H:%M:%S')}] {msg}", flush=True)


def wait_for_file(path, delay=2.0):
    while not Path(path).exists():
        log(f"[!] Waiting for log file: {path}")
        time.sleep(delay)


def follow(filepath):
    with open(filepath, "r") as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if line:
                yield line.rstrip("\n\r")
            else:
                time.sleep(POLL_INTERVAL)


def try_post(event: dict) -> bool:
    """Un solo intento de POST a n8n. Devuelve True si se entregó."""
    try:
        r = requests.post(N8N_URL, json=event, timeout=10)
        if r.status_code < 300:
            return True
        log(f"[ERR] n8n HTTP {r.status_code}: {r.text[:200]}")
        return False
    except requests.exceptions.ConnectionError:
        log(f"[!] n8n not reachable")
        return False
    except requests.exceptions.RequestException as e:
        log(f"[ERR] Request to n8n failed: {e}")
        return False


def spool_event(event: dict):
    """Guarda el evento en disco para reintentarlo después (pérdida cero)."""
    with _spool_lock:
        Path(SPOOL_FILE).parent.mkdir(parents=True, exist_ok=True)
        with open(SPOOL_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(event) + "\n")


def read_spool() -> list:
    with _spool_lock:
        if not Path(SPOOL_FILE).exists():
            return []
        with open(SPOOL_FILE, "r", encoding="utf-8") as f:
            return [line for line in f.read().splitlines() if line.strip()]


def rewrite_spool(lines: list):
    with _spool_lock:
        if not lines:
            try:
                Path(SPOOL_FILE).unlink(missing_ok=True)
            except OSError:
                pass
            return
        tmp = SPOOL_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            for line in lines:
                f.write(line + "\n")
        os.replace(tmp, SPOOL_FILE)


def deliver(event: dict) -> bool:
    """Reenvía el evento a n8n con reintentos y backoff.
    Si agota los intentos, lo spolea a disco (se reintenta en background)."""
    for attempt in range(1, MAX_ATTEMPTS + 1):
        if try_post(event):
            return True
        if attempt < MAX_ATTEMPTS:
            delay = RETRY_DELAY * attempt
            log(f"[!] retry {attempt}/{MAX_ATTEMPTS} in {delay:.0f}s...")
            time.sleep(delay)
    spool_event(event)
    log(f"[SPOOLED] {event.get('eventid', '?')} from {event.get('src_ip', '?')} -> {SPOOL_FILE}")
    return False


def drain_spool():
    """Reintenta periódicamente los eventos espooleados."""
    log(f"[*] Spool drainer started ({SPOOL_FILE})")
    while True:
        time.sleep(RETRY_DELAY)
        pending = read_spool()
        if not pending:
            continue
        remaining = []
        for line in pending:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if try_post(event):
                log(f"[OK][spool] {event.get('eventid', '?')} from {event.get('src_ip', '?')} -> n8n")
            else:
                remaining.append(line)
        rewrite_spool(remaining)


def build_telegram_payload(event, eventid, session=None):
    if eventid == "cowrie.session.connect":
        ip = event.get("src_ip", "desconocida")
        t = event.get("timestamp", "")
        text = (
            f"ATENCION alguien esta intentando acceder sin autorizacion a tu pc\n\n"
            f"Conexion sospechosa:\n\n"
            f"IP: {ip}\n"
            f"Servicio: SSH/Telnet\n"
            f"Hora: {t}\n\n"
            f"Honeypot Lab - Cowrie"
        )
    elif eventid == "cowrie.login.failed":
        ip = event.get("src_ip", "desconocida")
        user = event.get("username", "N/A")
        pw = event.get("password", "N/A")
        t = event.get("timestamp", "")
        text = (
            f"ATENCION alguien esta intentando acceder sin autorizacion a tu pc\n\n"
            f"Intento de login fallido\n\n"
            f"IP: {ip}\n"
            f"Usuario: {user}\n"
            f"Password: {pw}\n"
            f"Hora: {t}\n\n"
            f"Honeypot Lab - Cowrie"
        )
    elif eventid == "cowrie.session.summary":
        s = session or {}
        ip = s.get("src_ip", event.get("src_ip", "desconocida"))
        user = s.get("username", event.get("username", "N/A"))
        pw = s.get("password", event.get("password", "N/A"))
        login_t = s.get("login_time", event.get("login_time", ""))
        logout_t = s.get("logout_time", event.get("logout_time", "Activa"))
        dur = s.get("duration_formatted", event.get("duration_formatted", "N/A"))
        cmds = s.get("commands", event.get("commands", []))
        cmd_list = cmds if isinstance(cmds, list) else []
        cmd_count = len(cmd_list)
        cmd_text = "\n".join(str(c) for c in cmd_list) if cmd_count else "(ninguno)"
        text = (
            f"PELIGRO - Ataque completado, acceso exitoso\n\n"
            f"IP: {ip}\n"
            f"Usuario: {user} / {pw}\n"
            f"Ingreso: {login_t}\n"
            f"Salida:  {logout_t}\n"
            f"Duracion: {dur}\n\n"
            f"Comandos ejecutados ({cmd_count}):\n"
            f"{cmd_text}\n\n"
            f"Honeypot Lab - Cowrie"
        )
    else:
        return None

    return {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
    }


def send_telegram(payload):
    """Envía a Telegram SOLO si hay token y chat configurados."""
    if not TELEGRAM_ENABLED:
        return False
    try:
        r = requests.post(TELEGRAM_API, json=payload, timeout=10)
        return r.status_code < 300
    except requests.exceptions.RequestException:
        return False


def format_duration(seconds):
    try:
        secs = int(float(seconds))
    except (ValueError, TypeError):
        return "N/A"
    m, s = divmod(secs, 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    elif m > 0:
        return f"{m}m {s}s"
    return f"{s}s"


def send_summary(session_id):
    with _sessions_lock:
        session = _sessions.pop(session_id, None)
    if not session or not session.get("username"):
        return
    payload = build_telegram_payload({}, "cowrie.session.summary", session)
    if payload:
        send_telegram(payload)


def buffer_login(event):
    if not TELEGRAM_ENABLED:
        return
    session_id = event.get("session")
    if not session_id:
        return
    with _sessions_lock:
        if session_id in _sessions:
            return
        session = {
            "src_ip": event.get("src_ip", "unknown"),
            "username": event.get("username", "N/A"),
            "password": event.get("password", "N/A"),
            "login_time": event.get("timestamp", ""),
            "commands": [],
            "max_timer": None,
        }
        timer = threading.Timer(SESSION_MAX_DURATION, timed_out_session, args=[session_id])
        timer.daemon = True
        session["max_timer"] = timer
        _sessions[session_id] = session
        timer.start()


def buffer_command(event):
    if not TELEGRAM_ENABLED:
        return
    session_id = event.get("session")
    if not session_id:
        return
    with _sessions_lock:
        session = _sessions.get(session_id)
        if not session:
            return
        session["commands"].append(event.get("input", ""))


def close_session(event):
    if not TELEGRAM_ENABLED:
        return
    session_id = event.get("session")
    if not session_id:
        return
    with _sessions_lock:
        session = _sessions.get(session_id)
        if not session:
            return
        session["logout_time"] = event.get("timestamp", "")
        session["duration_formatted"] = format_duration(event.get("duration_ms", 0) / 1000)
        if session.get("max_timer"):
            session["max_timer"].cancel()
    send_summary(session_id)


def timed_out_session(session_id):
    with _sessions_lock:
        session = _sessions.get(session_id)
        if not session:
            return
        session["logout_time"] = f"Timeout ({int(SESSION_MAX_DURATION/60)}m)"
        if session.get("max_timer"):
            session["max_timer"].cancel()
            session["max_timer"] = None
    send_summary(session_id)


def main():
    log(f"[*] Cowrie -> n8n forwarder started")
    log(f"[*] Watching: {COWRIE_LOG}")
    log(f"[*] Target:   {N8N_URL}")
    if TELEGRAM_ENABLED:
        log(f"[*] Telegram alerts: ENABLED")
    else:
        log(f"[*] Telegram alerts: disabled (sin TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID)")
    log(f"[*] Max session duration: {int(SESSION_MAX_DURATION)}s ({int(SESSION_MAX_DURATION/60)} min)")
    log(f"[*] Spool: {SPOOL_FILE} (max attempts: {MAX_ATTEMPTS})")

    wait_for_file(COWRIE_LOG)

    # Vacia el spool previo (de reinicios anteriores) antes de seguir
    threading.Thread(target=drain_spool, daemon=True).start()

    for line in follow(COWRIE_LOG):
        if not line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue

        eventid = event.get("eventid", "")
        src_ip = event.get("src_ip", "?")

        # 1) Enviar SIEMPRE el evento a n8n (pipeline principal)
        if deliver(event):
            log(f"[OK] {eventid} from {src_ip} -> n8n")
        else:
            log(f"[ERR] no entregado a n8n: {eventid} from {src_ip}")

        # 2) Alertas Telegram (opcional)
        if eventid == "cowrie.session.connect":
            payload = build_telegram_payload(event, eventid)
            if payload:
                send_telegram(payload)
        elif eventid == "cowrie.login.failed":
            payload = build_telegram_payload(event, eventid)
            if payload:
                send_telegram(payload)
        elif eventid == "cowrie.login.success":
            buffer_login(event)
        elif eventid == "cowrie.command.input":
            buffer_command(event)
        elif eventid == "cowrie.session.closed":
            close_session(event)


if __name__ == "__main__":
    main()

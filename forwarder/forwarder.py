import html
import json
import os
import queue
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
MAX_REINTENTOS = int(os.environ.get("MAX_REINTENTOS", "60"))
SESSION_MAX_DURATION = float(os.environ.get("SESSION_MAX_DURATION", "1800"))
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage" if TELEGRAM_BOT_TOKEN else None
# Posición del log hasta la que se reenvió (C3, docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md)
STATE_FILE = os.environ.get("STATE_FILE", "/state/posicion.json")

_sessions = {}
_sessions_lock = threading.Lock()


def log(msg: str):
    print(f"[{time.strftime('%Y-%m-%dT%H:%M:%S')}] {msg}", flush=True)


def wait_for_file(path, delay=2.0):
    while not Path(path).exists():
        log(f"[!] Waiting for log file: {path}")
        time.sleep(delay)


def leer_posicion():
    try:
        with open(STATE_FILE) as f:
            st = json.load(f)
        return int(st["ino"]), int(st["pos"])
    except (OSError, ValueError, KeyError, TypeError):
        return None


def guardar_posicion(ino, pos):
    """Escritura atómica: un corte a mitad de camino no deja el archivo a medias."""
    tmp = STATE_FILE + ".tmp"
    try:
        with open(tmp, "w") as f:
            json.dump({"ino": ino, "pos": pos}, f)
        os.replace(tmp, STATE_FILE)
    except OSError as e:
        log(f"[!] No se pudo guardar la posición: {type(e).__name__}")


def follow(filepath):
    """Sigue el log desde la última posición reenviada (C3). Sin posición guardada empieza
    desde el final, como antes; si el archivo cambió (rotación o truncado), desde el principio."""
    f = open(filepath, "r")
    ino = os.fstat(f.fileno()).st_ino
    previa = leer_posicion()
    if previa is None:
        f.seek(0, os.SEEK_END)
        log("[*] Sin posición guardada: se empieza desde el final del log")
    elif previa[0] == ino and previa[1] <= os.fstat(f.fileno()).st_size:
        f.seek(previa[1])
        log(f"[*] Se retoma el log desde la posición guardada ({previa[1]} bytes)")
    else:
        log("[*] El log cambió desde la última posición guardada: se empieza desde el principio")
    while True:
        line = f.readline()
        if line:
            yield line.rstrip("\n\r")
            guardar_posicion(ino, f.tell())
            continue
        time.sleep(POLL_INTERVAL)
        try:
            Path("/tmp/latido").touch()  # healthcheck: el bucle principal sigue vivo
        except OSError:
            pass
        try:
            st = os.stat(filepath)
        except OSError:
            continue
        if st.st_ino != ino or st.st_size < f.tell():
            f.close()
            f = open(filepath, "r")
            ino = os.fstat(f.fileno()).st_ino
            log("[*] El log rotó o se truncó: se sigue el archivo nuevo desde el principio")


def forward_to_n8n(event: dict) -> bool:
    """Reenvía el evento completo a n8n vía webhook.
    C5 (docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO_ADENDA.md): reintenta el mismo evento ante n8n caído,
    arrancando (404: webhook sin registrar) o con error 5xx; no avanza al evento siguiente mientras tanto."""
    for intento in range(1, MAX_REINTENTOS + 1):
        try:
            r = requests.post(N8N_URL, json=event, timeout=10)
            if r.status_code < 300:
                return True
            log(f"[ERR] n8n HTTP {r.status_code} (intento {intento}/{MAX_REINTENTOS}): {r.text[:80]!r}")
            if r.status_code < 500 and r.status_code != 404:
                return False  # 4xx persistente: reintentar no cambia el resultado
        except requests.exceptions.ConnectionError:
            log(f"[!] n8n not reachable (intento {intento}/{MAX_REINTENTOS}), retrying in {RETRY_DELAY}s...")
        except requests.exceptions.RequestException as e:
            log(f"[ERR] Request to n8n failed (intento {intento}/{MAX_REINTENTOS}): {type(e).__name__}")
        if intento < MAX_REINTENTOS:
            time.sleep(RETRY_DELAY)
    return False


def esc(v):
    """Escapa para parse_mode HTML los valores que controla el atacante (C1)."""
    return html.escape(str(v), quote=False)


def build_telegram_payload(event, eventid, session=None):
    if eventid == "cowrie.session.connect":
        ip = esc(event.get("src_ip", "desconocida"))
        t = esc(event.get("timestamp", ""))
        text = (
            f"ATENCION alguien esta intentando acceder sin autorizacion a tu pc\n\n"
            f"Conexion sospechosa:\n\n"
            f"IP: {ip}\n"
            f"Servicio: SSH/Telnet\n"
            f"Hora: {t}\n\n"
            f"Honeypot Lab - Cowrie"
        )
    elif eventid == "cowrie.login.failed":
        ip = esc(event.get("src_ip", "desconocida"))
        user = esc(event.get("username", "N/A"))
        pw = esc(event.get("password", "N/A"))
        t = esc(event.get("timestamp", ""))
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
        ip = esc(s.get("src_ip", event.get("src_ip", "desconocida")))
        user = esc(s.get("username", event.get("username", "N/A")))
        pw = esc(s.get("password", event.get("password", "N/A")))
        login_t = esc(s.get("login_time", event.get("login_time", "")))
        logout_t = esc(s.get("logout_time", event.get("logout_time", "Activa")))
        dur = esc(s.get("duration_formatted", event.get("duration_formatted", "N/A")))
        cmds = s.get("commands", event.get("commands", []))
        cmd_list = cmds if isinstance(cmds, list) else []
        cmd_count = len(cmd_list)
        cmd_text = "\n".join(esc(c) for c in cmd_list) if cmd_count else "(ninguno)"
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


def send_telegram(payload, tipo):
    """Envía a Telegram SOLO si hay token y chat configurados.
    Registra cada intento sin el token, la URL ni el chat ID (docs/PRUEBAS_TELEGRAM.md, §2)."""
    if not TELEGRAM_API or not TELEGRAM_CHAT_ID:
        return False
    t0 = time.monotonic()
    try:
        r = requests.post(TELEGRAM_API, json=payload, timeout=10)
        ms = int((time.monotonic() - t0) * 1000)
        if r.status_code < 300:
            log(f"[TG] {tipo} enviado ({ms} ms)")
            return True
        try:
            desc = str(r.json().get("description", ""))[:150]
        except ValueError:
            desc = ""
        log(f"[TG] {tipo} rechazado HTTP {r.status_code}: {desc}")
        return False
    except requests.exceptions.RequestException as e:
        # Solo la clase: el mensaje de requests incluye la URL con el token
        log(f"[TG] {tipo} sin envío: {type(e).__name__} ({int((time.monotonic() - t0) * 1000)} ms)")
        return False


_cola_tg = queue.Queue(maxsize=1000)


def encolar_telegram(payload, tipo):
    """El bucle principal no espera a Telegram (C2): la alerta se encola y la envía otro hilo."""
    if not TELEGRAM_API or not TELEGRAM_CHAT_ID:
        return
    try:
        _cola_tg.put_nowait((payload, tipo))
    except queue.Full:
        log(f"[TG] {tipo} descartado: cola llena")


def _enviar_cola():
    while True:
        payload, tipo = _cola_tg.get()
        send_telegram(payload, tipo)


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
        encolar_telegram(payload, "resumen")


def buffer_login(event):
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
    session_id = event.get("session")
    if not session_id:
        return
    with _sessions_lock:
        session = _sessions.get(session_id)
        if not session:
            return
        session["commands"].append(event.get("input", ""))


def close_session(event):
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
    if TELEGRAM_API and TELEGRAM_CHAT_ID:
        log(f"[*] Telegram alerts: ENABLED")
    else:
        log(f"[*] Telegram alerts: disabled (sin TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID)")
    log(f"[*] Max session duration: {int(SESSION_MAX_DURATION)}s ({int(SESSION_MAX_DURATION/60)} min)")

    threading.Thread(target=_enviar_cola, daemon=True).start()
    wait_for_file(COWRIE_LOG)

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
        if forward_to_n8n(event):
            log(f"[OK] {eventid} from {src_ip} -> n8n")
        else:
            log(f"[ERR] no entregado a n8n: {eventid} from {src_ip}")

        # 2) Alertas Telegram (opcional)
        if eventid == "cowrie.session.connect":
            payload = build_telegram_payload(event, eventid)
            if payload:
                encolar_telegram(payload, "conexion")
        elif eventid == "cowrie.login.failed":
            payload = build_telegram_payload(event, eventid)
            if payload:
                encolar_telegram(payload, "login_fallido")
        elif eventid == "cowrie.login.success":
            buffer_login(event)
        elif eventid == "cowrie.command.input":
            buffer_command(event)
        elif eventid == "cowrie.session.closed":
            close_session(event)


if __name__ == "__main__":
    main()

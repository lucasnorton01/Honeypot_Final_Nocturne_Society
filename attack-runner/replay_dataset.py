#!/usr/bin/env python3
"""
Reproducción de sesiones reales (validación R1; registro previo: docs/PREREGISTRO_R1.md).

Por cada sesión de la muestra (docs/evidencia/r1/muestra_r1.jsonl, tomada del dataset de Wang et al., 2025):
se conecta a Cowrie por SSH desde attack-runner, se autentica con las credenciales de esa sesión (las del primer
login exitoso de su origen en el registro crudo del dataset) y escribe los comandos en el orden original, con la
demora original entre comandos acotada entre 0,3 s y 5 s (valores de la muestra).

Cada paso se registra en la salida estándar como una línea «REPLAY {json}»: ese registro es la verdad de referencia
de lo enviado. No se contacta ningún otro host: Cowrie no tiene salida a Internet, de modo que los wget y curl del
dataset fallan y solo quedan registrados.

Uso (dentro del contenedor):
  python -u replay_dataset.py --muestra /app/muestra_r1.jsonl --lote-tam 10 --t0 2026-10-11T00:30:00Z --ranura-min 15
  python -u replay_dataset.py --muestra /app/piloto_r1.jsonl --todas
"""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import argparse
import hashlib
import json
import re
import time
from datetime import datetime, timezone

import paramiko

REPLAY_VERSION = "r1-2026-10-10"
HOST = "cowrie"
SSH_PORT = 2222
PROMPT = re.compile(rb"[#$] $")
ESPERA_PROMPT_S = 8.0     # tiempo máximo de espera del prompt tras cada comando
ESPERA_FINAL_S = 1.0


def ahora():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def log(**kw):
    print("REPLAY " + json.dumps(kw, ensure_ascii=False), flush=True)


def leer_hasta_prompt(chan, limite):
    """Lee la salida del canal hasta ver el prompt o agotar el límite. Devuelve (bytes, visto, cerrado)."""
    buf = b""
    fin = time.monotonic() + limite
    while time.monotonic() < fin:
        if chan.recv_ready():
            buf += chan.recv(65536)
            if PROMPT.search(buf):
                return buf, True, False
            continue
        if chan.closed or chan.exit_status_ready():
            return buf, False, True
        time.sleep(0.05)
    return buf, False, chan.closed


def reproducir(s):
    idx = s["idx"]
    log(ev="sesion_inicio", idx=idx, session_id=s["session_id"], user=s["user"], n_comandos=len(s["comandos"]), t=ahora())
    cliente = paramiko.SSHClient()
    cliente.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    enviados = 0
    estado = "ok"
    try:
        cliente.connect(HOST, port=SSH_PORT, username=s["user"], password=s["pass"], timeout=10,
                        allow_agent=False, look_for_keys=False)
        log(ev="login_ok", idx=idx, t=ahora())
        chan = cliente.invoke_shell()
        _, visto, cerrado = leer_hasta_prompt(chan, 5.0)
        for i, (cmd, demora) in enumerate(zip(s["comandos"], s["demoras_s"])):
            if cerrado:
                estado = "canal_cerrado_antes"
                break
            time.sleep(demora)
            t_envio = ahora()
            chan.send(cmd + "\n")
            enviados += 1
            _, visto, cerrado = leer_hasta_prompt(chan, ESPERA_PROMPT_S)
            log(ev="comando_enviado", idx=idx, i=i + 1, comando=cmd, t=t_envio, prompt=visto, canal_cerrado=cerrado)
        time.sleep(ESPERA_FINAL_S)
        chan.close()
        cliente.close()
    except paramiko.AuthenticationException:
        estado = "auth_fallida"
    except Exception as e:  # noqa: BLE001
        estado = "error: " + type(e).__name__ + ": " + str(e)[:200]
    log(ev="sesion_fin", idx=idx, estado=estado, enviados=enviados, de=len(s["comandos"]), t=ahora())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--muestra", required=True)
    ap.add_argument("--lote-tam", type=int, default=10)
    ap.add_argument("--t0")
    ap.add_argument("--ranura-min", type=int, default=15)
    ap.add_argument("--todas", action="store_true")
    a = ap.parse_args()
    with open(a.muestra, "rb") as f:
        crudo = f.read()
    sesiones = [json.loads(l) for l in crudo.decode("utf-8").splitlines() if l.strip()]
    if a.todas:
        lote, sel = None, sesiones
    else:
        t0 = datetime.fromisoformat(a.t0.replace("Z", "+00:00"))
        lote = round((datetime.now(timezone.utc) - t0).total_seconds() / (a.ranura_min * 60))
        sel = sesiones[lote * a.lote_tam:(lote + 1) * a.lote_tam] if lote >= 0 else []
    log(ev="inicio", version=REPLAY_VERSION, muestra_sha256=hashlib.sha256(crudo).hexdigest(), sesiones_muestra=len(sesiones),
        lote=lote, sesiones_del_lote=[s["idx"] for s in sel], t=ahora())
    for s in sel:
        reproducir(s)
        time.sleep(1)
    log(ev="fin", lote=lote, t=ahora())


main()

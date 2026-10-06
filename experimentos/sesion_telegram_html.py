"""Sesiones para la prueba T2 de docs/PRUEBAS_TELEGRAM.md: el resumen de Telegram usa
parse_mode HTML, y estos comandos benignos contienen caracteres que HTML reserva (< y &).
La primera sesión es el control, sin esos caracteres.

Se ejecuta dentro del contenedor attack-runner, contra cowrie:2222:
  docker compose run --rm -T --no-deps -v ./experimentos:/x --entrypoint python attack-runner /x/sesion_telegram_html.py
"""
import time
import paramiko

HOST, PORT = "cowrie", 2222
CUENTA = ("admin", "test123")  # cuenta válida de cowrie/userdb.txt

SESIONES = [
    ("control", ["uname -a", "ls /tmp"]),
    ("con <", ["echo 'a<b'", "ls /tmp"]),
    ("con &", ["echo uno && echo dos", "ls /tmp"]),
]


def sesion(nombre, comandos):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        c.connect(HOST, PORT, username=CUENTA[0], password=CUENTA[1], timeout=10,
                  allow_agent=False, look_for_keys=False, banner_timeout=10, auth_timeout=10)
        ch = c.invoke_shell()
        time.sleep(1)
        for cmd in comandos:
            ch.send(cmd + "\n")
            time.sleep(1.5)
        ch.send("exit\n")
        time.sleep(1)
        ch.close()
        print(f"sesion {nombre}: OK")
    finally:
        c.close()


for nombre, comandos in SESIONES:
    sesion(nombre, comandos)
    time.sleep(5)

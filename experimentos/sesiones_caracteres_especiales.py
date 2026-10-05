"""Sesiones de prueba con caracteres que rompen el SQL armado por concatenación
(apóstrofo, barra invertida y comillas dobles), para las pruebas Q0 a Q3.

Se ejecuta dentro del contenedor attack-runner, contra cowrie:2222:
  docker compose run --rm -T --no-deps -v ./experimentos:/x --entrypoint python attack-runner /x/sesiones_caracteres_especiales.py
"""
import time
import paramiko

HOST, PORT = "cowrie", 2222

# Intentos fallidos con caracteres especiales en usuario y contraseña
FALLIDOS = [("o'brien", "it's-a-test"), ("d'angelo", 'back\\slash"quote')]

# Sesión exitosa con una cuenta válida de cowrie/userdb.txt y comandos benignos con esos caracteres
VALIDA = ("admin", "test123")
COMANDOS = ["echo 'hola mundo'", 'echo "comillas" \\ barra', "ls /bin", "bash -c 'echo hola'"]


def intentar(usuario, clave, comandos=()):
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        c.connect(HOST, PORT, username=usuario, password=clave, timeout=10,
                  allow_agent=False, look_for_keys=False, banner_timeout=10, auth_timeout=10)
        ch = c.invoke_shell()
        time.sleep(1)
        for cmd in comandos:
            ch.send(cmd + "\n")
            time.sleep(1.5)
        ch.close()
        print(f"login OK: {usuario!r}")
    except paramiko.AuthenticationException:
        print(f"login fallido: {usuario!r}")
    finally:
        c.close()


for u, p in FALLIDOS:
    intentar(u, p)
intentar(*VALIDA, comandos=COMANDOS)

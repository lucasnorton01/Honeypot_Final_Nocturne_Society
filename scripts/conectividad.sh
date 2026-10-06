#!/usr/bin/env bash
# Pruebas de conectividad de la red segmentada y del endurecimiento (docs/PRUEBAS_SEGMENTACION_MONITOREO.md, S1-S10,
# y docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md, PE2-PE4). Solo lectura: abre conexiones TCP de prueba.
# Uso, desde la raíz del repo, con el entorno levantado:  MSYS_NO_PATHCONV=1 bash scripts/conectividad.sh
cd "$(dirname "$0")/.." || exit 1

PY='import socket,sys
h,p=sys.argv[1],int(sys.argv[2])
try:
    socket.create_connection((h,p),4).close(); print("CONECTA")
except Exception as e:
    print("NO CONECTA (%s)" % type(e).__name__)'
NODE='const n=require("net");const s=n.connect({host:process.argv[1],port:+process.argv[2],timeout:4000});s.on("connect",()=>{console.log("CONECTA");s.destroy()});s.on("timeout",()=>{console.log("NO CONECTA (timeout)");s.destroy()});s.on("error",e=>console.log("NO CONECTA ("+e.code+")"))'

desde_python() { docker exec "$1" python -c "$PY" "$2" "$3" 2>&1 | tail -1; }
desde_runner() { docker compose run --rm -T --no-deps --entrypoint python attack-runner -c "$PY" "$1" "$2" 2>&1 | tail -1; }
desde_cowrie() { docker exec cowrie python3 -c "$PY" "$1" "$2" 2>&1 | tail -1; }
desde_node()   { docker exec n8n node -e "$NODE" "$1" "$2" 2>&1 | tail -1; }
desde_pg()     { if docker exec postgres bash -c "timeout 4 bash -c '</dev/tcp/$1/$2'" 2>/dev/null; then echo CONECTA; else echo "NO CONECTA"; fi; }
desde_host()   { node -e "$NODE" "$1" "$2"; }

echo "# Conectividad — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
PGIP=$(docker inspect postgres --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
echo "postgres IP: $PGIP"
echo
echo "## Segmentación (S1-S10)"
echo "S1  attack-runner -> cowrie:2222 : $(desde_runner cowrie 2222)"
echo "S2  attack-runner -> n8n:5678    : $(desde_runner n8n 5678)"
echo "S3  attack-runner -> postgres:5432 (nombre) : $(desde_runner postgres 5432)"
echo "S4  attack-runner -> $PGIP:5432 (IP) : $(desde_runner "$PGIP" 5432)"
echo "S5  forwarder -> n8n:5678 : $(desde_python forwarder n8n 5678)"
echo "S6a forwarder -> postgres:5432 (nombre) : $(desde_python forwarder postgres 5432)"
echo "S6b forwarder -> $PGIP:5432 (IP) : $(desde_python forwarder "$PGIP" 5432)"
echo "S7  n8n -> postgres:5432 : $(desde_node postgres 5432)"
echo "S8  postgres -> 1.1.1.1:443 : $(desde_pg 1.1.1.1 443)"
for p in 2222 2323 5678; do echo "S9  anfitrión -> 127.0.0.1:$p : $(desde_host 127.0.0.1 $p)"; done
echo "S9' anfitrión -> 127.0.0.1:9000 (log-reader, ya no publicado) : $(desde_host 127.0.0.1 9000)"
echo "S10 anfitrión -> 127.0.0.1:5433 : $(desde_host 127.0.0.1 5433)"
echo
echo "## Salida a Internet, 1.1.1.1:443 (PE2)"
echo "cowrie        : $(desde_cowrie 1.1.1.1 443)"
echo "attack-runner : $(desde_runner 1.1.1.1 443)"
echo "log-reader    : $(desde_python log-reader 1.1.1.1 443)"
echo "postgres      : $(desde_pg 1.1.1.1 443)"
echo "n8n (control positivo)       : $(desde_node 1.1.1.1 443)"
echo "forwarder (control positivo) : $(desde_python forwarder 1.1.1.1 443)"
echo
echo "## log-reader (PE4), desde el forwarder, en la red proceso"
TOKEN=$(docker exec log-reader printenv LOG_READER_TOKEN)
docker exec forwarder python -c "
import sys, urllib.request, urllib.error
tok = sys.argv[1]
def pedir(etiqueta, headers):
    try:
        r = urllib.request.urlopen(urllib.request.Request('http://log-reader:9000/count?desde=2026-01-01T00:00:00Z&hasta=2026-01-01T00:00:01Z', headers=headers), timeout=5)
        print(etiqueta, 'HTTP', r.status, '| Access-Control-Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'))
    except urllib.error.HTTPError as e:
        print(etiqueta, 'HTTP', e.code, '| Access-Control-Allow-Origin:', e.headers.get('Access-Control-Allow-Origin'))
pedir('sin token  ', {})
pedir('token malo ', {'X-Token': 'incorrecto'})
pedir('con token  ', {'X-Token': tok})
" "$TOKEN"

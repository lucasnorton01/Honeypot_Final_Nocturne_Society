# Cierre de la validación B2: exporta la evidencia y corre el análisis registrado.
# Ejecutar el 03/10/2026 a partir de las 08:10 hora local:  powershell -ExecutionPolicy Bypass -File scripts\b2_cerrar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\b2"

Write-Host "[1] Quitando la tarea del simulador..."
Unregister-ScheduledTask -TaskName "HoneypotB2Runner" -Confirm:$false -ErrorAction SilentlyContinue

function Copia($sql, $archivo) {
  docker exec postgres psql -U honeypot -d honeypot -c "\copy ($sql) TO STDOUT WITH CSV HEADER" | Set-Content -Encoding utf8 (Join-Path $ev $archivo)
}
$ini = Get-Content (Join-Path $ev "inicio.json") -Raw | ConvertFrom-Json
$cierre = (docker exec postgres psql -U honeypot -d honeypot -tA -c "SELECT to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS');").Trim()
Write-Host "    Cierre formal (UTC): $cierre"

Write-Host "[2] Exportando tablas..."
Copia "SELECT id,eventid,session,src_ip,src_port,username,password,input,timestamp,processed,created_at,country FROM events ORDER BY id" "events.csv"
Copia "SELECT id,type,value,confidence,event_id,source,created_at FROM iocs ORDER BY id" "iocs.csv"
Copia "SELECT id,ioc_id,event_id,session,created_at FROM ioc_sessions WHERE created_at <= TIMESTAMPTZ '$cierre+00' ORDER BY id" "ioc_sessions.csv"
Copia "SELECT id,period_start,period_end,created_at FROM reports ORDER BY id" "reports.csv"
Copia "SELECT id,workflow,node,error,created_at FROM error_log ORDER BY id" "error_log.csv"

Write-Host "[3] Exportando el log de Cowrie de la ventana..."
$tmpLog = Join-Path $ev "cowrie_log.tmp"; docker cp cowrie:/cowrie/cowrie-git/var/log/cowrie $tmpLog | Out-Null
Get-ChildItem $tmpLog -Filter "cowrie.json*" | ForEach-Object { Get-Content $_.FullName } | Set-Content -Encoding utf8 (Join-Path $ev "cowrie_completo.tmp")
Remove-Item -Recurse $tmpLog
$i0 = [datetime]::ParseExact($ini.inicio, "yyyy-MM-dd HH:mm:ss", $null); $i1 = [datetime]::ParseExact($cierre, "yyyy-MM-dd HH:mm:ss", $null)
$lineas = Get-Content (Join-Path $ev "cowrie_completo.tmp") | Where-Object { $_ -match '"timestamp":"([^"]+)"' -and ([datetime]::Parse($matches[1]).ToUniversalTime() -ge $i0) -and ([datetime]::Parse($matches[1]).ToUniversalTime() -le $i1) }
[IO.File]::WriteAllText((Join-Path $ev "cowrie_ventana.json"), (($lineas -join "`n") + "`n"))
Remove-Item (Join-Path $ev "cowrie_completo.tmp")

Write-Host "[4] Exportando el historial de ejecuciones de n8n..."
docker cp n8n:/home/node/.n8n/database.sqlite (Join-Path $ev "n8n.sqlite.tmp") | Out-Null
$py = @"
import sqlite3,csv,sys
c=sqlite3.connect(sys.argv[1]);w=csv.writer(open(sys.argv[2],'w',newline='',encoding='utf-8'))
w.writerow(['id','workflow','modo','estado','inicio','fin','duracion_ms'])
for r in c.execute("SELECT e.id,w.name,e.mode,e.status,e.startedAt,e.stoppedAt,(julianday(e.stoppedAt)-julianday(e.startedAt))*86400000 FROM execution_entity e JOIN workflow_entity w ON w.id=e.workflowId ORDER BY e.id"):
    w.writerow([r[0],r[1],r[2],r[3],r[4],r[5],round(r[6],1) if r[6] is not None else ''])
"@
$py | python - (Join-Path $ev "n8n.sqlite.tmp") (Join-Path $ev "ejecuciones.csv")
Remove-Item (Join-Path $ev "n8n.sqlite.tmp")

@{ inicio = $ini.inicio; cierre = $cierre } | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $ev "ventana.json")
Write-Host "[4b] Restituyendo el flujo de producción (0 8 * * *)..."
docker cp n8n/workflows/report-generator.json n8n:/tmp/rg.json | Out-Null
docker exec n8n n8n import:workflow --input=/tmp/rg.json | Out-Null
docker exec n8n n8n publish:workflow --id=wf-report-generator-0003 | Out-Null
docker exec -u root n8n rm /tmp/rg.json
docker restart n8n | Out-Null
Write-Host "[5] Analizando con el script registrado..."
node scripts\b2_analisis.js docs\evidencia\b2
Get-ChildItem $ev | ForEach-Object { "{0}  {1}" -f (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower(), $_.Name } | Set-Content -Encoding utf8 (Join-Path $ev "SHA256SUMS.txt")
Write-Host "Listo. Resultados en docs\evidencia\b2\resultados_b2.json" -ForegroundColor Green

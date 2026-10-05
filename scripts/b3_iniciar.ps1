# Inicio de la validación B3 (registro previo: docs/PREREGISTRO_B3.md)
# Ejecutar desde la raíz del repo, con Docker Desktop encendido, ANTES de las 19:25 ART del 05/10/2026:
#   powershell -ExecutionPolicy Bypass -File scripts\b3_iniciar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\b3"
$primero = Get-Date "2026-10-05 19:30"
$ultimo = Get-Date "2026-10-06 07:45"
$sinBom = New-Object System.Text.UTF8Encoding($false)

function Psql($sql) { docker exec postgres psql -U honeypot -d honeypot -tA -c $sql }
# n8n escribe avisos en stderr: se descartan sin que PowerShell 5.1 los convierta en un error fatal
function N8n { $ErrorActionPreference = "Continue"; docker exec n8n n8n @args 2>$null }

Write-Host "[0] Comprobando hora y equipo..."
if ((Get-Date) -ge $primero.AddMinutes(-5)) { throw "Ya son las 19:25 o mas: no se inicia una ventana distinta de la registrada." }
if (Test-Path (Join-Path $ev "inicio.json")) { throw "La ventana B3 ya fue iniciada (existe docs\evidencia\b3\inicio.json)." }
$ac = (powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE | Select-String "corriente alterna|AC Power Setting") -replace '.*:\s*', ''
if ($ac.Trim() -ne "0x00000000") { throw "La suspension con el cargador conectado no esta en 'Nunca'." }
$bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
if ($bat -and $bat.BatteryStatus -ne 2) { Write-Host "    ATENCION: el equipo no parece estar conectado al cargador." -ForegroundColor Yellow }

Write-Host "[1] Comprobando que los archivos registrados no tienen cambios sin publicar..."
$fijos = "scripts/b3_iniciar.ps1","scripts/b3_cerrar.ps1","scripts/b3_exportar.js","scripts/b3_analisis.js","docs/PREREGISTRO_B3.md",
         "attack-runner/attack_ssh.py","cowrie/userdb.txt","docker-compose.yml","n8n/workflows/event-ingest.json",
         "n8n/workflows/ioc-extractor.json","n8n/workflows/report-generator.json","n8n/workflows/health-monitor.json"
$cambios = git status --porcelain -- $fijos
if ($cambios) { throw "Hay cambios sin publicar en archivos registrados:`n$cambios" }
git fetch -q origin
if ((git rev-parse HEAD) -ne (git rev-parse origin/main)) { throw "HEAD no coincide con origin/main: el registro previo no esta publicado." }

Write-Host "[2] Comprobando servicios y workflows..."
$up = docker compose ps --services --filter status=running
foreach ($s in "cowrie","forwarder","log-reader","postgres","n8n") { if ($up -notcontains $s) { throw "El servicio $s no esta corriendo." } }
if ($up -contains "attack-runner") { throw "attack-runner esta corriendo: esperar a que termine." }
$act = N8n list:workflow --active=true
foreach ($w in "event-ingest","ioc-extractor","report-generator","health-monitor") { if (-not ($act -match "\|$w$")) { throw "El workflow $w no esta activo." } }
N8n export:workflow --id=wf-report-generator-0003 --output=/tmp/rg.json | Out-Null
$rg = (docker exec n8n cat /tmp/rg.json) -join "`n" | ConvertFrom-Json
docker exec -u root n8n rm /tmp/rg.json
$cron = @($rg)[0].nodes | Where-Object { $_.type -like "*scheduleTrigger" } | ForEach-Object { $_.parameters.rule.interval[0].expression }
if ($cron -ne "0 8 * * *") { throw "report-generator cargado en n8n no tiene el cron de produccion (0 8 * * *): $cron" }
if ((docker exec n8n printenv GENERIC_TIMEZONE) -ne "America/Argentina/Mendoza") { throw "Zona horaria de n8n distinta de America/Argentina/Mendoza." }

Write-Host "[3] Comprobando que Cowrie no tuvo actividad en los ultimos 25 minutos..."
$tmp = Join-Path $env:TEMP "b3_cowrie.json"
docker cp cowrie:/cowrie/cowrie-git/var/log/cowrie/cowrie.json $tmp | Out-Null
$ult = Get-Content $tmp -Tail 1; Remove-Item $tmp
if ($ult -match '"timestamp":"([^"]+)"') {
  $hace = (Get-Date).ToUniversalTime() - ([datetime]::Parse($matches[1])).ToUniversalTime()
  if ($hace.TotalMinutes -lt 25) { throw "El ultimo evento de Cowrie fue hace $([int]$hace.TotalMinutes) min; health-monitor compararia eventos previos al vaciado." }
}

Write-Host "[4] Respaldando la base actual (fuera del repo)..."
$resp = Join-Path (Split-Path -Parent $root) "respaldos"
New-Item -ItemType Directory -Force $resp | Out-Null
$archivo = "honeypot_antes_b3_{0}.sql" -f (Get-Date -Format "yyyyMMdd_HHmm")
docker exec postgres pg_dump -U honeypot -d honeypot -f /tmp/respaldo.sql
docker cp postgres:/tmp/respaldo.sql (Join-Path $resp $archivo) | Out-Null
docker exec postgres rm /tmp/respaldo.sql
if ((Get-Item (Join-Path $resp $archivo)).Length -lt 1000) { throw "El respaldo quedo vacio." }
Write-Host "    $resp\$archivo"

Write-Host "[5] Vaciando tablas..."
Psql "TRUNCATE events, iocs, reports, ioc_observations, ioc_sessions, error_log RESTART IDENTITY;" | Out-Null
$inicio = (Psql "SELECT to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS');").Trim()
Write-Host "    Inicio formal (UTC): $inicio"

Write-Host "[6] Programando el simulador cada 15 minutos (tarea oculta)..."
New-Item -ItemType Directory -Force $ev | Out-Null
$log = Join-Path $ev "attack-runner-cron_b3.log"
$cmd = "cd /d `"$root`" && echo ===== %date% %time% >> `"$log`" && docker compose run --rm -T attack-runner >> `"$log`" 2>&1"
$accion = New-ScheduledTaskAction -Execute "conhost.exe" -Argument "--headless cmd.exe /c $cmd"
$disp = New-ScheduledTaskTrigger -Once -At $primero -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ($ultimo.AddMinutes(1) - $primero)
$conf = New-ScheduledTaskSettingsSet -StartWhenAvailable:$false -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName "HoneypotB3Runner" -Action $accion -Trigger $disp -Settings $conf -Force | Out-Null
Write-Host "    Primera corrida $primero, ultima $ultimo (hora local ART): 50 corridas"

$ini = [ordered]@{ inicio = $inicio; cierre_utc = "2026-10-06 11:15:00"; primera_corrida_local = "2026-10-05 19:30"; ultima_corrida_local = "2026-10-06 07:45"; respaldo = $archivo }
[IO.File]::WriteAllText((Join-Path $ev "inicio.json"), ($ini | ConvertTo-Json) + "`n", $sinBom)
Write-Host ""
Write-Host "Ventana iniciada. No toques el entorno hasta el cierre: manana 06/10 a las 08:15 hora local." -ForegroundColor Green

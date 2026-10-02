# Inicio de la validación B2 (registro previo: docs/PREREGISTRO_B2.md)
# Ejecutar desde la raíz del repo, con Docker Desktop encendido:  powershell -ExecutionPolicy Bypass -File scripts\b2_iniciar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\b2"
New-Item -ItemType Directory -Force $ev | Out-Null

function Psql($sql) { docker exec postgres psql -U honeypot -d honeypot -tA -c $sql }

Write-Host "[1] Comprobando servicios..."
$up = docker compose ps --services --filter status=running
foreach ($s in "cowrie","forwarder","log-reader","postgres","n8n") { if ($up -notcontains $s) { throw "El servicio $s no está corriendo." } }

Write-Host "[2] Comprobando workflows activos y crons..."
$act = docker exec n8n n8n list:workflow --active=true 2>$null
foreach ($w in "event-ingest","ioc-extractor","report-generator") { if (-not ($act -match $w)) { throw "El workflow $w no está activo." } }
$cron = (Get-Content n8n\workflows\report-generator.json -Raw | ConvertFrom-Json).nodes | Where-Object { $_.type -like "*scheduleTrigger" } | ForEach-Object { $_.parameters.rule.interval[0].expression }
if ($cron -ne "0 8 * * *") { throw "report-generator no tiene el cron de producción (0 8 * * *): $cron" }
Write-Host "[2b] Cargando el flujo de la ventana (cron diario 50 11 * * *)..."
docker cp experimentos/report-generator-b2-2026-10-02.json n8n:/tmp/rg.json | Out-Null
docker exec n8n n8n import:workflow --input=/tmp/rg.json | Out-Null
docker exec n8n n8n publish:workflow --id=wf-report-generator-0003 | Out-Null
docker exec -u root n8n rm /tmp/rg.json
docker restart n8n | Out-Null; Start-Sleep -Seconds 20
if (-not ((docker exec n8n n8n list:workflow --active=true 2>$null) -match "report-generator")) { throw "report-generator no quedó activo" }

Write-Host "[3] Vaciando tablas..."
Psql "TRUNCATE events, iocs, reports, ioc_observations, ioc_sessions, error_log RESTART IDENTITY;" | Out-Null
$inicio = (Psql "SELECT to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS');").Trim()
Write-Host "    Inicio formal (UTC): $inicio"

Write-Host "[4] Programando el simulador cada 5 minutos..."
$ahora = Get-Date
$primero = Get-Date "2026-10-02 10:55"
$ultimo = Get-Date "2026-10-02 11:40"
if ($ahora -ge $primero) { throw "Ya pasó la hora de la primera corrida (10:55): no se inicia una ventana distinta de la registrada." }
$log = Join-Path $ev "attack-runner-cron_b2.log"
$cmd = "cd /d `"$root`" && echo ===== %date% %time% >> `"$log`" && docker compose run --rm attack-runner >> `"$log`" 2>&1"
$accion = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c $cmd"
$disp = New-ScheduledTaskTrigger -Once -At $primero -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ($ultimo.AddMinutes(1) - $primero)
$conf = New-ScheduledTaskSettingsSet -StartWhenAvailable:$false -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
Register-ScheduledTask -TaskName "HoneypotB2Runner" -Action $accion -Trigger $disp -Settings $conf -Force | Out-Null
Write-Host "    Simulador cada 5 min: primera corrida $primero, última $ultimo (hora local ART)"

@{ inicio = $inicio; cierre_previsto_utc = "2026-10-02 14:55:00"; primera_corrida_local = "2026-10-02 10:55"; ultima_corrida_local = "2026-10-02 11:40" } | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $ev "inicio.json")
Write-Host ""
Write-Host "Ventana iniciada. No toques el entorno hasta el cierre: hoy a las 11:55 hora local." -ForegroundColor Green

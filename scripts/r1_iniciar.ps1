# Inicio de la validación R1 (registro previo: docs/PREREGISTRO_R1.md)
# Ejecutar desde la raíz del repo, con Docker Desktop encendido, ANTES de las 21:25 ART del 10/10/2026:
#   powershell -ExecutionPolicy Bypass -File scripts\r1_iniciar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\r1"
$primero = Get-Date "2026-10-10 21:30"
$ultimo = Get-Date "2026-10-11 02:15"
$sinBom = New-Object System.Text.UTF8Encoding($false)

function Psql($sql) { docker exec postgres psql -U honeypot -d honeypot -tA -c $sql }
# n8n escribe avisos en stderr: se descartan sin que PowerShell 5.1 los convierta en un error fatal
function N8n { $ErrorActionPreference = "Continue"; docker exec n8n n8n @args 2>$null }

Write-Host "[0] Comprobando hora y equipo..."
if ((Get-Date) -ge $primero.AddMinutes(-5)) { throw "Ya son las 21:25 o mas: no se inicia una ventana distinta de la registrada." }
if (Test-Path (Join-Path $ev "inicio.json")) { throw "La ventana R1 ya fue iniciada (existe docs\evidencia\r1\inicio.json)." }
$ac = (powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE | Select-String "corriente alterna|AC Power Setting") -replace '.*:\s*', ''
if ($ac.Trim() -ne "0x00000000") { throw "La suspension con el cargador conectado no esta en 'Nunca'." }
$bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
if ($bat -and $bat.BatteryStatus -ne 2) { Write-Host "    ATENCION: el equipo no parece estar conectado al cargador." -ForegroundColor Yellow }

Write-Host "[1] Comprobando que los archivos registrados no tienen cambios sin publicar..."
$fijos = "scripts/r1_iniciar.ps1","scripts/r1_cerrar.ps1","scripts/r1_exportar.js","scripts/r1_analisis.js","scripts/r1_muestra.js","docs/PREREGISTRO_R1.md",
         "attack-runner/replay_dataset.py","docs/evidencia/r1/muestra_r1.jsonl","docs/evidencia/r1/muestra_r1_meta.json","docs/evidencia/r1/userdb_r1_agregado.txt",
         "attack-runner/attack_ssh.py","attack-runner/Dockerfile","cowrie/userdb.txt","docker-compose.yml","forwarder/forwarder.py","n8n/workflows/event-ingest.json",
         "n8n/workflows/ioc-extractor.json","n8n/workflows/report-generator.json","n8n/workflows/health-monitor.json","db/schema.sql"
$cambios = git status --porcelain -- $fijos
if ($cambios) { throw "Hay cambios sin publicar en archivos registrados:`n$cambios" }
git fetch -q origin
if ((git rev-parse HEAD) -ne (git rev-parse origin/main)) { throw "HEAD no coincide con origin/main: el registro previo no esta publicado." }
$remoto = git ls-remote --tags origin "refs/tags/Honeypot_R1_prereg^{}"
if (-not $remoto) { $remoto = git ls-remote --tags origin "refs/tags/Honeypot_R1_prereg" }
if (-not $remoto) { throw "El tag Honeypot_R1_prereg no esta publicado en origin." }
if ((git rev-parse "Honeypot_R1_prereg^{commit}") -ne (git rev-parse HEAD)) { throw "HEAD no coincide con el commit del tag Honeypot_R1_prereg." }

Write-Host "[2] Comprobando servicios, redes y workflows..."
$up = docker compose ps --services --filter status=running
foreach ($s in "cowrie","cowrie-proxy","forwarder","log-reader","postgres","n8n") { if ($up -notcontains $s) { throw "El servicio $s no esta corriendo." } }
if ($up -contains "attack-runner") { throw "attack-runner esta corriendo: esperar a que termine." }
foreach ($r in "captura","proceso","datos") { if ((docker network inspect "honeypot-b2_$r" --format "{{.Internal}}") -ne "true") { throw "La red $r no es internal." } }
$act = N8n list:workflow --active=true
foreach ($w in "event-ingest","ioc-extractor","report-generator","health-monitor") { if (-not ($act -match "\|$w$")) { throw "El workflow $w no esta activo." } }
N8n export:workflow --id=wf-report-generator-0003 --output=/tmp/rg.json | Out-Null
$rg = (docker exec n8n cat /tmp/rg.json) -join "`n" | ConvertFrom-Json
docker exec -u root n8n rm /tmp/rg.json
$cron = @($rg)[0].nodes | Where-Object { $_.type -like "*scheduleTrigger" } | ForEach-Object { $_.parameters.rule.interval[0].expression }
if ($cron -ne "0 8 * * *") { throw "report-generator cargado en n8n no tiene el cron de produccion (0 8 * * *): $cron" }
if ((docker exec n8n printenv GENERIC_TIMEZONE) -ne "America/Argentina/Mendoza") { throw "Zona horaria de n8n distinta de America/Argentina/Mendoza." }
$tg = docker exec forwarder sh -c 'test -n "$TELEGRAM_BOT_TOKEN" && test -n "$TELEGRAM_CHAT_ID" && echo si'
if ($tg -ne "si") { throw "El forwarder no tiene Telegram configurado: la configuracion final incluye las alertas activas." }

Write-Host "[2b] Comprobando que Cowrie tiene las cuentas de la muestra..."
$local = (Get-Content (Join-Path $root "cowrie\userdb.txt")).Count
$cont = [int](docker exec cowrie sh -c "wc -l < /cowrie/cowrie-git/etc/userdb.txt")
if ([math]::Abs($local - $cont) -gt 1) { throw "El userdb.txt cargado en Cowrie ($cont lineas) no coincide con el del repo ($local): reiniciar cowrie." }

Write-Host "[3] Comprobando que Cowrie no tuvo actividad en los ultimos 25 minutos..."
$tmp = Join-Path $env:TEMP "r1_cowrie.json"
docker cp cowrie:/cowrie/cowrie-git/var/log/cowrie/cowrie.json $tmp | Out-Null
$ult = Get-Content $tmp -Tail 1; Remove-Item $tmp
if ($ult -match '"timestamp":"([^"]+)"') {
  $hace = (Get-Date).ToUniversalTime() - ([datetime]::Parse($matches[1])).ToUniversalTime()
  if ($hace.TotalMinutes -lt 25) { throw "El ultimo evento de Cowrie fue hace $([int]$hace.TotalMinutes) min; health-monitor compararia eventos previos al vaciado." }
}

Write-Host "[4] Respaldando la base actual (fuera del repo)..."
$resp = Join-Path (Split-Path -Parent $root) "respaldos"
New-Item -ItemType Directory -Force $resp | Out-Null
$archivo = "honeypot_antes_r1_{0}.sql" -f (Get-Date -Format "yyyyMMdd_HHmm")
docker exec postgres pg_dump -U honeypot -d honeypot -f /tmp/respaldo.sql
docker cp postgres:/tmp/respaldo.sql (Join-Path $resp $archivo) | Out-Null
docker exec postgres rm /tmp/respaldo.sql
if ((Get-Item (Join-Path $resp $archivo)).Length -lt 1000) { throw "El respaldo quedo vacio." }
Write-Host "    $resp\$archivo"

Write-Host "[5] Vaciando tablas..."
Psql "TRUNCATE events, iocs, reports, ioc_observations, ioc_sessions, error_log RESTART IDENTITY;" | Out-Null
$inicio = (Psql "SELECT to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI:SS');").Trim()
Write-Host "    Inicio formal (UTC): $inicio"

Write-Host "[6] Programando la reproduccion de la muestra, un lote de 10 sesiones cada 15 minutos (tarea oculta)..."
New-Item -ItemType Directory -Force $ev | Out-Null
$log = Join-Path $ev "attack-runner-cron_r1.log"
$rp = "`"$root\attack-runner\replay_dataset.py:/app/replay_dataset.py:ro`""
$mu = "`"$root\docs\evidencia\r1\muestra_r1.jsonl:/app/muestra_r1.jsonl:ro`""
$cmd = "cd /d `"$root`" && echo ===== %date% %time% >> `"$log`" && docker compose run --rm -T -v $rp -v $mu attack-runner python -u replay_dataset.py --muestra /app/muestra_r1.jsonl --lote-tam 10 --t0 2026-10-11T00:30:00Z --ranura-min 15 >> `"$log`" 2>&1"
$accion = New-ScheduledTaskAction -Execute "conhost.exe" -Argument "--headless cmd.exe /c $cmd"
$disp = New-ScheduledTaskTrigger -Once -At $primero -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ($ultimo.AddMinutes(1) - $primero)
$conf = New-ScheduledTaskSettingsSet -StartWhenAvailable:$false -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 12)
Register-ScheduledTask -TaskName "HoneypotR1Runner" -Action $accion -Trigger $disp -Settings $conf -Force | Out-Null
$n = [int](($ultimo - $primero).TotalMinutes / 15) + 1  # 20 lotes
Write-Host "    Primera corrida $primero, ultima $ultimo (hora local ART): $n corridas"

$ini = [ordered]@{ inicio = $inicio; cierre_utc = "2026-10-11 11:15:00"; primera_corrida_local = "2026-10-10 21:30"; ultima_corrida_local = "2026-10-11 02:15"; lotes = 20; sesiones_por_lote = 10; respaldo = $archivo }
[IO.File]::WriteAllText((Join-Path $ev "inicio.json"), ($ini | ConvertTo-Json) + "`n", $sinBom)
Write-Host ""
Write-Host "Ventana iniciada. No toques el entorno hasta el cierre: manana 11/10 a las 08:15 hora local." -ForegroundColor Green

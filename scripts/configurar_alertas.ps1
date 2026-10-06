# Carga en n8n las credenciales de health-monitor y el workflow (docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md, C4).
# Los valores salen de .env (LOG_READER_TOKEN, TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID); se escriben solo en
# archivos temporales que se borran al terminar y quedan guardados cifrados en n8n. Nada se escribe en el repo.
# Uso, desde la raíz del repo, con el entorno levantado:  powershell -ExecutionPolicy Bypass -File scripts\configurar_alertas.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$sinBom = New-Object System.Text.UTF8Encoding($false)

function Leer-Env($nombre) {
  $l = Get-Content (Join-Path $root ".env") | Where-Object { $_ -match "^$nombre=" } | Select-Object -First 1
  if ($l) { return ($l -replace "^$nombre=", "").Trim() } else { return "" }
}
# n8n escribe avisos en stderr: se descartan sin que PowerShell 5.1 los convierta en un error fatal
function N8n { $ErrorActionPreference = "Continue"; docker exec n8n n8n @args 2>$null }

$tokenLr = Leer-Env "LOG_READER_TOKEN"
$tokenTg = Leer-Env "TELEGRAM_BOT_TOKEN"
$chat    = Leer-Env "TELEGRAM_CHAT_ID"
if (-not $tokenLr) { throw "Falta LOG_READER_TOKEN en .env" }
$telegram = [bool]($tokenTg -and $chat)
if (-not $telegram) { Write-Host "Telegram desactivado en .env: las alertas quedarán solo en error_log." -ForegroundColor Yellow }

$tmp = Join-Path $env:TEMP "alertas_n8n"
New-Item -ItemType Directory -Force $tmp | Out-Null
try {
  $creds = @(@{ id = "cred-logreader-hm"; name = "log-reader token"; type = "httpHeaderAuth"; data = @{ name = "X-Token"; value = $tokenLr } })
  if ($telegram) { $creds += @{ id = "cred-telegram-hm"; name = "Telegram health-monitor"; type = "telegramApi"; data = @{ accessToken = $tokenTg } } }
  [IO.File]::WriteAllText((Join-Path $tmp "creds.json"), (ConvertTo-Json -InputObject @($creds) -Depth 5), $sinBom)
  $wf = (Get-Content (Join-Path $root "n8n\workflows\health-monitor.json") -Raw) -replace "__TELEGRAM_CHAT_ID__", $(if ($chat) { $chat } else { "0" })
  [IO.File]::WriteAllText((Join-Path $tmp "health-monitor.json"), $wf, $sinBom)

  docker cp (Join-Path $tmp "creds.json") n8n:/tmp/creds.json | Out-Null
  docker cp (Join-Path $tmp "health-monitor.json") n8n:/tmp/health-monitor.json | Out-Null
  N8n import:credentials --input=/tmp/creds.json | Out-Null
  N8n import:workflow --input=/tmp/health-monitor.json | Out-Null
  N8n publish:workflow --id=wf-health-monitor-0004 | Out-Null
} finally {
  docker exec -u root n8n rm -f /tmp/creds.json /tmp/health-monitor.json 2>$null | Out-Null
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
docker restart n8n | Out-Null
# Espera a que n8n vuelva a estar sano antes de devolver el control (si no, los eventos que llegan mientras arranca se retrasan)
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 3
  if ((docker inspect n8n --format '{{.State.Health.Status}}') -eq "healthy") { break }
}
Write-Host "health-monitor configurado (Telegram: $(if ($telegram) { 'activado' } else { 'desactivado' }))." -ForegroundColor Green

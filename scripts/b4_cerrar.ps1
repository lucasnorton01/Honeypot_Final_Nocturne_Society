# Cierre de la validación B4: exporta la evidencia hasta el cierre fijo y corre el análisis registrado.
# Ejecutar el 09/10/2026 a partir de las 08:15 hora local:  powershell -ExecutionPolicy Bypass -File scripts\b4_cerrar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\b4"
$sinBom = New-Object System.Text.UTF8Encoding($false)

if ((Get-Date) -lt (Get-Date "2026-10-09 08:15")) { throw "Todavia no son las 08:15 del 09/10/2026: la ventana sigue abierta." }

Write-Host "[1] Quitando la tarea del simulador..."
Unregister-ScheduledTask -TaskName "HoneypotB4Runner" -Confirm:$false -ErrorAction SilentlyContinue

Write-Host "[2] Exportando la evidencia (cierre fijo: 11:15:00 UTC)..."
node scripts\b4_exportar.js docs\evidencia\b4
if ($LASTEXITCODE -ne 0) { throw "Fallo la exportacion." }

Write-Host "[3] Analizando con el script registrado..."
node scripts\b4_analisis.js docs\evidencia\b4
if ($LASTEXITCODE -ne 0) { throw "Fallo el analisis." }

$sumas = Get-ChildItem $ev -File | Where-Object { $_.Name -ne "SHA256SUMS.txt" } | Sort-Object Name |
  ForEach-Object { "{0}  {1}" -f (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower(), $_.Name }
[IO.File]::WriteAllText((Join-Path $ev "SHA256SUMS.txt"), ($sumas -join "`n") + "`n", $sinBom)
Write-Host "Listo. Resultados en docs\evidencia\b4\resultados_b4.json" -ForegroundColor Green

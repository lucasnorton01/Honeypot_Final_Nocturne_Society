# Cierre de la validación R1: exporta la evidencia hasta el cierre fijo y corre el análisis registrado.
# Ejecutar el 11/10/2026 a partir de las 08:15 hora local:  powershell -ExecutionPolicy Bypass -File scripts\r1_cerrar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$ev = Join-Path $root "docs\evidencia\r1"
$sinBom = New-Object System.Text.UTF8Encoding($false)

if ((Get-Date) -lt (Get-Date "2026-10-11 08:15")) { throw "Todavia no son las 08:15 del 11/10/2026: la ventana sigue abierta." }

Write-Host "[1] Quitando la tarea del simulador..."
Unregister-ScheduledTask -TaskName "HoneypotR1Runner" -Confirm:$false -ErrorAction SilentlyContinue

Write-Host "[2] Exportando la evidencia (cierre fijo: 11:15:00 UTC)..."
node scripts\r1_exportar.js docs\evidencia\r1
if ($LASTEXITCODE -ne 0) { throw "Fallo la exportacion." }

Write-Host "[3] Analizando con el script registrado..."
node scripts\r1_analisis.js docs\evidencia\r1
if ($LASTEXITCODE -ne 0) { throw "Fallo el analisis." }

$sumas = Get-ChildItem $ev -File | Where-Object { $_.Name -ne "SHA256SUMS.txt" } | Sort-Object Name |
  ForEach-Object { "{0}  {1}" -f (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower(), $_.Name }
[IO.File]::WriteAllText((Join-Path $ev "SHA256SUMS.txt"), ($sumas -join "`n") + "`n", $sinBom)
Write-Host "Listo. Resultados en docs\evidencia\r1\resultados_r1.json" -ForegroundColor Green

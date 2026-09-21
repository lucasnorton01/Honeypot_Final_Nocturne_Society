<#
.SYNOPSIS
    Recolecta evidencia del stack honeypot para una etiqueta dada.
.DESCRIPTION
    Crea evidencia/<Etiqueta>/, copia la base de n8n, ejecuta check_executions.js,
    extrae pg_dump, copia cowrie.json y genera MANIFIESTO.sha256.txt.
    Solo LEE del stack; nunca escribe en la base ni en n8n.
.PARAMETER Etiqueta
    Nombre de la carpeta de evidencia (obligatorio). Se usa como nombre de subcarpeta.
.EXAMPLE
    .\recolectar_evidencia.ps1 -Etiqueta "validacion-P3"
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$Etiqueta
)

$ErrorActionPreference = "Stop"

# ── Configuración ──────────────────────────────────────────────
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $BaseDir
$EvidDir = Join-Path $RepoRoot "evidencia\$Etiqueta"
$CheckScript = Join-Path $BaseDir "check_executions.js"

# ── Validaciones previas ───────────────────────────────────────
if (-not (Test-Path $CheckScript)) {
    Write-Error "No se encuentra $CheckScript"
    exit 1
}

# Verificar que los contenedores estén corriendo
$containers = docker compose ps --format '{{.Name}} {{.Status}}' 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se pudo listar contenedores. ¿Docker está corriendo?"
    exit 1
}

$running = ($containers | Select-String "Up").Count
if ($running -eq 0) {
    Write-Error "Ningún contenedor está corriendo. Ejecutá 'docker compose up -d' primero."
    exit 1
}

Write-Host "Contenedores activos: $running" -ForegroundColor Green

# ── Crear carpeta de evidencia ─────────────────────────────────
if (Test-Path $EvidDir) {
    Write-Warning "La carpeta $EvidDir ya existe. Los archivos se sobrescribirán."
} else {
    New-Item -ItemType Directory -Path $EvidDir -Force | Out-Null
}
Write-Host "Carpeta de evidencia: $EvidDir" -ForegroundColor Cyan

# ── 1. Copiar base de n8n y ejecutar check_executions.js ───────
Write-Host "`n[1/4] Copiando base de n8n y ejecutando check_executions.js..." -ForegroundColor Yellow
try {
    $n8nDbPath = Join-Path $EvidDir "n8n-database.sqlite"
    docker compose cp n8n:/home/node/.n8n/database.sqlite $n8nDbPath 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Error copiando base de n8n" }

    $checkResult = & node $CheckScript $n8nDbPath 2>&1
    $checkResult | Out-File -FilePath (Join-Path $EvidDir "check_executions.txt") -Encoding utf8
    Write-Host "  check_executions.js completado" -ForegroundColor Green
} catch {
    Write-Error "Error en paso 1: $_"
    exit 1
}

# ── 2. pg_dump ─────────────────────────────────────────────────
Write-Host "`n[2/4] Ejecutando pg_dump..." -ForegroundColor Yellow
try {
    $dumpPath = Join-Path $EvidDir "postgres-dump.sql"
    docker compose exec -T postgres sh -c "pg_dump -U honeypot -d honeypot" > $dumpPath 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Error en pg_dump" }
    Write-Host "  pg_dump completado" -ForegroundColor Green
} catch {
    Write-Error "Error en paso 2: $_"
    exit 1
}

# ── 3. Copiar cowrie.json ─────────────────────────────────────
Write-Host "`n[3/4] Copiando cowrie.json desde log-reader..." -ForegroundColor Yellow
try {
    $cowriePath = Join-Path $EvidDir "cowrie.json"
    docker compose cp log-reader:/cowrie/var/log/cowrie/cowrie.json $cowriePath 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Error copiando cowrie.json" }
    Write-Host "  cowrie.json copiado" -ForegroundColor Green
} catch {
    Write-Error "Error en paso 3: $_"
    exit 1
}

# ── 4. Generar MANIFIESTO.sha256.txt ──────────────────────────
Write-Host "`n[4/4] Generando MANIFIESTO.sha256.txt..." -ForegroundColor Yellow
try {
    $manifestPath = Join-Path $EvidDir "MANIFIESTO.sha256.txt"
    $files = Get-ChildItem -Path $EvidDir -File | Where-Object { $_.Name -ne "MANIFIESTO.sha256.txt" }
    $hashes = @()
    foreach ($f in $files) {
        $hash = (Get-FileHash -Path $f.FullName -Algorithm SHA256).Hash
        $hashes += "$hash  $($f.Name)"
    }
    $hashes | Out-File -FilePath $manifestPath -Encoding utf8
    Write-Host "  MANIFIESTO generado con $($files.Count) archivos" -ForegroundColor Green
} catch {
    Write-Error "Error en paso 4: $_"
    exit 1
}

# ── Resumen ────────────────────────────────────────────────────
Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Evidencia recolectada en: $EvidDir" -ForegroundColor Green
Get-ChildItem -Path $EvidDir | ForEach-Object {
    Write-Host "  $($_.Name) ($([math]::Round($_.Length / 1KB, 1)) KB)"
}
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan

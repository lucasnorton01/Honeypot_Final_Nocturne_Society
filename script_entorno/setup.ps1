# ============================================================
# Honeypot Lab - Script de Setup Automático (Windows)
# Ejecutar desde la raíz del proyecto: .\script_entorno\setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Honeypot Lab - Setup Automático" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── 0. Verificar prerequisitos ─────────────────────────────
Write-Host "[0] Verificando prerequisitos..." -ForegroundColor Yellow

# Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: Docker no está instalado. Instalar Docker Desktop primero." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker: $(docker --version)" -ForegroundColor Green

# Docker Compose
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: docker compose no disponible." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker Compose: OK" -ForegroundColor Green

# Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: Node.js no está instalado. Instalar v18+ desde https://nodejs.org" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: Git no está instalado." -ForegroundColor Red
    exit 1
}
Write-Host "  Git: OK" -ForegroundColor Green

Write-Host ""

# ─── 1. Crear .env si no existe ─────────────────────────────
Write-Host "[1] Configurando archivos de entorno..." -ForegroundColor Yellow

$rootEnv = Join-Path $PROJECT_ROOT ".env"
$rootEnvExample = Join-Path $PROJECT_ROOT ".env.example"
$apiEnv = Join-Path $PROJECT_ROOT "API\.env"
$apiEnvExample = Join-Path $PROJECT_ROOT "API\.env.example"

if (-not (Test-Path $rootEnv)) {
    if (Test-Path $rootEnvExample) {
        Copy-Item $rootEnvExample $rootEnv
        Write-Host "  .env creado desde .env.example — EDITAR con tus valores reales" -ForegroundColor Yellow
    } else {
        Write-Host "  WARN: .env.example no encontrado, saltando" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  .env ya existe — OK" -ForegroundColor Green
}

if (-not (Test-Path $apiEnv)) {
    if (Test-Path $apiEnvExample) {
        Copy-Item $apiEnvExample $apiEnv
        # Fix DB_PORT to match docker-compose mapping (5433:5432)
        (Get-Content $apiEnv) -replace 'DB_PORT=5432', 'DB_PORT=5433' | Set-Content $apiEnv
        Write-Host "  API/.env creado desde .env.example (DB_PORT=5433)" -ForegroundColor Yellow
    } else {
        Write-Host "  WARN: API/.env.example no encontrado, saltando" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  API/.env ya existe — OK" -ForegroundColor Green
}

Write-Host ""

# ─── 2. Levantar servicios Docker ───────────────────────────
Write-Host "[2] Levantando servicios Docker..." -ForegroundColor Yellow

Push-Location $PROJECT_ROOT
try {
    # Levantar todo excepto attack-runner (opcional)
    docker compose up -d postgres cowrie forwarder log-reader n8n
    Write-Host "  Servicios levantados. Esperando que PostgreSQL esté healthy..." -ForegroundColor Green
    
    # Esperar a que PostgreSQL esté sano
    $maxWait = 60
    $waited = 0
    while ($waited -lt $maxWait) {
        $status = docker inspect --format='{{.State.Health.Status}}' postgres 2>$null
        if ($status -eq "healthy") {
            Write-Host "  PostgreSQL: healthy" -ForegroundColor Green
            break
        }
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "  Esperando PostgreSQL... ($waited s)" -ForegroundColor DarkGray
    }
    
    if ($status -ne "healthy") {
        Write-Host "  WARN: PostgreSQL no reportó healthy, pero puede estar funcionando" -ForegroundColor DarkYellow
    }
} finally {
    Pop-Location
}

Write-Host ""

# ─── 3. Instalar dependencias del API ────────────────────────
Write-Host "[3] Instalando dependencias del API (Node.js)..." -ForegroundColor Yellow

$apiDir = Join-Path $PROJECT_ROOT "API"
if (Test-Path (Join-Path $apiDir "package.json")) {
    Push-Location $apiDir
    try {
        npm install --silent 2>&1 | Out-Null
        Write-Host "  npm install completado" -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  WARN: API/package.json no encontrado, saltando npm install" -ForegroundColor DarkYellow
}

Write-Host ""

# ─── 4. Configurar n8n ──────────────────────────────────────
Write-Host "[4] Configurando n8n (owner + credential + workflows)..." -ForegroundColor Yellow

$n8nScript = Join-Path $PSScriptRoot "import-n8n.js"
if (Test-Path $n8nScript) {
    # Esperar a que n8n esté listo
    Write-Host "  Esperando que n8n esté disponible..." -ForegroundColor DarkGray
    $n8nReady = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:5678/healthz" -Method GET -ErrorAction Stop
            $n8nReady = $true
            break
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    
    if ($n8nReady) {
        node $n8nScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  n8n configurado correctamente" -ForegroundColor Green
        } else {
            Write-Host "  WARN: Hubo errores en la configuración de n8n. Revisar logs." -ForegroundColor DarkYellow
        }
    } else {
        Write-Host "  ERROR: n8n no está disponible en http://localhost:5678" -ForegroundColor Red
        Write-Host "  Configurar manualmente: ver script_entorno/README.md" -ForegroundColor Yellow
    }
} else {
    Write-Host "  WARN: import-n8n.js no encontrado, configurar n8n manualmente" -ForegroundColor DarkYellow
}

Write-Host ""

# ─── 5. Verificar estado ────────────────────────────────────
Write-Host "[5] Verificación final..." -ForegroundColor Yellow

# Docker
Write-Host ""
Write-Host "  Servicios Docker:" -ForegroundColor Cyan
docker ps --format "    {{.Names}}: {{.Status}}" 2>$null

# PostgreSQL
Write-Host ""
Write-Host "  PostgreSQL:" -ForegroundColor Cyan
$pgCount = docker exec postgres psql -U honeypot -d honeypot -t -c "SELECT count(*) FROM events;" 2>$null
if ($pgCount) {
    Write-Host "    Events: $($pgCount.Trim())" -ForegroundColor Green
} else {
    Write-Host "    No se pudo consultar" -ForegroundColor DarkYellow
}

# n8n
Write-Host ""
Write-Host "  n8n:" -ForegroundColor Cyan
try {
    $n8nHealth = Invoke-RestMethod -Uri "http://localhost:5678/healthz" -Method GET -ErrorAction Stop
    Write-Host "    Status: OK" -ForegroundColor Green
} catch {
    Write-Host "    Status: No disponible" -ForegroundColor DarkYellow
}

Write-Host ""

# ─── Resumen ────────────────────────────────────────────────
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup completado!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Servicios:" -ForegroundColor White
Write-Host "    Cowrie:     http://localhost:2222 (SSH)" -ForegroundColor Gray
Write-Host "    n8n:        http://localhost:5678" -ForegroundColor Gray
Write-Host "    API:        http://localhost:4000" -ForegroundColor Gray
Write-Host "    Log Reader: http://localhost:9000" -ForegroundColor Gray
Write-Host ""
Write-Host "  Para correr el API:" -ForegroundColor White
Write-Host "    cd API && npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Credenciales n8n (definir en .env):" -ForegroundColor White
Write-Host "    Email:    `$env:N8N_EMAIL" -ForegroundColor Gray
Write-Host "    Password: `$env:N8N_PASS" -ForegroundColor Gray
Write-Host ""
Write-Host "  IMPORTANTE:" -ForegroundColor Red
Write-Host "    1. Editar .env con tus valores reales (Telegram token, etc.)" -ForegroundColor Yellow
Write-Host "    2. Verificar que los workflows de n8n estén activos" -ForegroundColor Yellow
Write-Host "    3. Probar: ssh -p 2222 admin@localhost (pass: test123)" -ForegroundColor Yellow
Write-Host ""

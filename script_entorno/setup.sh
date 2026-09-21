#!/bin/bash
# ============================================================
# Honeypot Lab - Script de Setup Automático (Linux/Mac)
# Ejecutar: chmod +x script_entorno/setup.sh && ./script_entorno/setup.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "============================================"
echo "  Honeypot Lab - Setup Automático"
echo "============================================"
echo ""

# ─── 0. Verificar prerequisitos ─────────────────────────────
echo "[0] Verificando prerequisitos..."

command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker no instalado"; exit 1; }
echo "  Docker: $(docker --version)"

command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js no instalado (v18+)"; exit 1; }
echo "  Node.js: $(node --version)"

command -v npm >/dev/null 2>&1 || { echo "ERROR: npm no instalado"; exit 1; }
echo "  npm: $(npm --version)"

echo ""

# ─── 1. Crear .env si no existe ─────────────────────────────
echo "[1] Configurando archivos de entorno..."

if [ ! -f "$PROJECT_ROOT/.env" ] && [ -f "$PROJECT_ROOT/.env.example" ]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    echo "  .env creado desde .env.example — EDITAR con tus valores"
else
    echo "  .env ya existe — OK"
fi

if [ ! -f "$PROJECT_ROOT/API/.env" ] && [ -f "$PROJECT_ROOT/API/.env.example" ]; then
    cp "$PROJECT_ROOT/API/.env.example" "$PROJECT_ROOT/API/.env"
    # Fix DB_PORT for docker-compose mapping
    sed -i 's/DB_PORT=5432/DB_PORT=5433/' "$PROJECT_ROOT/API/.env" 2>/dev/null || \
    sed -i '' 's/DB_PORT=5432/DB_PORT=5433/' "$PROJECT_ROOT/API/.env" 2>/dev/null
    echo "  API/.env creado (DB_PORT=5433)"
else
    echo "  API/.env ya existe — OK"
fi

echo ""

# ─── 2. Levantar Docker ─────────────────────────────────────
echo "[2] Levantando servicios Docker..."

cd "$PROJECT_ROOT"
docker compose up -d postgres cowrie forwarder log-reader n8n

echo "  Esperando PostgreSQL..."
for i in $(seq 1 30); do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' postgres 2>/dev/null || echo "starting")
    if [ "$STATUS" = "healthy" ]; then
        echo "  PostgreSQL: healthy"
        break
    fi
    sleep 2
done

echo ""

# ─── 3. Instalar dependencias API ───────────────────────────
echo "[3] Instalando dependencias del API..."

if [ -f "$PROJECT_ROOT/API/package.json" ]; then
    cd "$PROJECT_ROOT/API"
    npm install --silent 2>/dev/null
    echo "  npm install completado"
else
    echo "  WARN: API/package.json no encontrado"
fi

echo ""

# ─── 4. Configurar n8n ──────────────────────────────────────
echo "[4] Configurando n8n..."

if [ -f "$SCRIPT_DIR/import-n8n.js" ]; then
    # Esperar n8n
    echo "  Esperando n8n..."
    for i in $(seq 1 30); do
        if curl -s http://localhost:5678/healthz >/dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    node "$SCRIPT_DIR/import-n8n.js"
else
    echo "  WARN: import-n8n.js no encontrado, configurar manualmente"
fi

echo ""

# ─── 5. Verificación ────────────────────────────────────────
echo "[5] Verificación final..."
echo ""
echo "  Servicios:"
docker ps --format "    {{.Names}}: {{.Status}}" 2>/dev/null

echo ""
echo "  PostgreSQL events:"
docker exec postgres psql -U honeypot -d honeypot -t -c "SELECT count(*) FROM events;" 2>/dev/null || echo "    No disponible"

echo ""

# ─── Resumen ────────────────────────────────────────────────
echo "============================================"
echo "  Setup completado!"
echo "============================================"
echo ""
echo "  Servicios:"
echo "    Cowrie:     localhost:2222 (SSH)"
echo "    n8n:        http://localhost:5678"
echo "    API:        http://localhost:4000"
echo "    Log Reader: http://localhost:9000"
echo ""
echo "  Para correr el API:"
echo "    cd API && npm start"
echo ""
echo "  n8n credentials (define in .env):"
echo "    Email:    $N8N_EMAIL"
echo "    Password: $N8N_PASS"
echo ""
echo "  IMPORTANTE:"
echo "    1. Editar .env con tus valores reales"
echo "    2. Verificar workflows en n8n"
echo "    3. Probar: ssh -p 2222 admin@localhost (pass: test123)"
echo ""

# Inventario del repositorio — Ronda 4

> Generado: 2026-09-21. Cada afirmación es verificable con un comando listado al pie.

---

## 1. Árbol de carpetas (2 niveles)

```
Honeypot_Final_Nocturne_Society/
├── .agents/                  ← skills de OpenCode (frontend-design, make-interfaces-feel-better)
├── .atl/                     ← skill-registry y cache de OpenCode
├── API/                      ← servidor Node.js con dashboard y landing
├── attack-runner/            ← contenedor Docker para simular ataques SSH
├── cowrie/                   ← configuración de Cowrie (cowrie.cfg, userdb.txt, moduli)
├── db/                       ← schema.sql y backup.sql (este último binario, 31 KB)
├── docs/                     ← M4-PRISMA-template.md, M5-protocolo-evaluadores.md
├── evidencia/                ← NO versionada (.gitignore)
├── forwarder/                ← Dockerfile + forwarder.py + requirements.txt
├── Landing page/             ← landing page HTML estática
├── log-reader/               ← Dockerfile + server.py
├── Logs/                     ← scripts de recuperación, logs de sesiones, check_db.js
├── logs 10 septiembre/       ← logs de ataques del 10/09/2026
├── n8n/
│   └── workflows/            ← 7 archivos JSON (3 canónicos + 4 variantes/auxiliares)
├── scripts/                  ← scripts de simulación, verificación, batch, generación
├── script_entorno/           ← setup.ps1, setup.sh, import-n8n.js
├── skills/                   ← skills de OpenCode (duplicados de .agents/)
├── .env.example
├── .gitignore
├── README .md                ← ⚠️ tiene espacio en el nombre
├── BITACORA.md               ← NO existe en el working tree
├── docker-compose.yml
├── Pasos para levantar proyecto.txt  ← ⚠️ contiene credenciales en texto plano
└── postgres-cred.json        ← ⚠️ contiene contraseña en texto plano
```

**Verificación:**
```powershell
Get-ChildItem -Directory -Depth 1 | Where-Object { $_.FullName -notlike "*\.git*" } | ForEach-Object { "$($_.Name)/" }
git ls-tree -r HEAD --name-only
```

---

## 2. Workflows de n8n

### 2.1 Canónicos (los 3 definidos en la tesis)

| Archivo | Nombre | ID | Nodos | Disparadores | Cron |
|---------|--------|----|-------|--------------|------|
| `event-ingest.json` | event-ingest | (sin id) | 3 | Webhook POST `/cowrie` | — |
| `ioc-extractor.json` | ioc-extractor | wf-ioc-extractor-0002 | 5 | Schedule + Manual (Execute Workflow) | `*/15 * * * *` |
| `report-generator.json` | report-generator | wf-report-generator-0003 | 5 | Schedule + Manual (Execute Workflow) | `0 8 * * *` |

**Nodos de cada workflow:**

- **event-ingest**: Webhook → Process and Insert (Code) → Postgres: Insert Event
- **ioc-extractor**: Schedule + Manual → Postgres: Eventos sin procesar → Extraer IoCs (Code) → Postgres: Upsert IoCs
- **report-generator**: Schedule + Manual → Postgres: Datos del reporte → Ensamblar Reporte (Code) → Postgres: Guardar Reporte

### 2.2 Variantes y auxiliares (NO son evidencia)

| Archivo | Nombre | Nodos | Disparadores | Diferencia con canónico |
|---------|--------|-------|--------------|------------------------|
| `report-generator-fixed.json` | report-generator | 5 | Manual Trigger + Schedule (`0 8 * * *`) | Agrega Manual Trigger; queries sin filtro temporal `WHERE timestamp >= ...` |
| `report-generator-manual.json` | report-generator-manual | 5 | Webhook POST `/report-generate` + Respond to Webhook | Disparado por HTTP en vez de cron |
| `test-geo-enrichment.json` | test-geo-enrichment | 2 | Webhook POST `/test-geo` | Solo Webhook → GeoIP Lookup (HTTP Request) |
| `postgres-credential.json` | (credencial) | — | — | Credencial PostgreSQL con contraseña en texto plano |

**Verificación:**
```powershell
Get-Content n8n\workflows\event-ingest.json | ConvertFrom-Json | Select-Object -ExpandProperty nodes | Measure-Object
# (repetir para cada workflow)
```

---

## 3. Archivos con posibles secretos

| Archivo | Línea | Campo |
|---------|-------|-------|
| `postgres-cred.json` | 12 | `"password": "[REDACTADO]"` |
| `n8n/workflows/postgres-credential.json` | 11 | `"password": "[REDACTADO]"` |
| `Pasos para levantar proyecto.txt` | 2 | `password:[REDACTADO]` (credencial de n8n) |
| `Pasos para levantar proyecto.txt` | 3 | `password:[REDACTADO]` (credencial de Cowrie — esta es la credencial legítima del honeypot, no un secreto) |
| `.env.example` | 9 | `POSTGRES_PASSWORD=[REDACTADO]` (valor de ejemplo, aceptable) |

**Verificación:**
```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "password|secret|token|api_key|cred" -SimpleMatch | Where-Object { $_.Path -notmatch "\.git\\" }
```

---

## 4. Carpetas y archivos ajenos al pipeline

| Ruta | Descripción |
|------|-------------|
| `.agents/` | Skills de OpenCode (frontend-design, make-interfaces-feel-better) |
| `.atl/` | Skill-registry y cache de OpenCode |
| `API/` | Servidor Node.js con dashboard web, landing page, middleware de auth. No forma parte del pipeline honeypot → n8n → PostgreSQL |
| `Landing page/` | Landing page HTML estática del proyecto |
| `Logs/` | Scripts de recuperación de n8n, logs de sesiones, scripts de prueba. Contiene `ESPECIFICACIONES.md` |
| `logs 10 septiembre/` | Logs de ataques simulados del 10/09/2026 |
| `docs/` | Plantilla PRISMA (M4) y protocolo de evaluadores (M5) |
| `script_entorno/` | Scripts de setup del entorno (setup.ps1, setup.sh, import-n8n.js) |
| `skills/` | Duplicado de `.agents/skills/` |
| `Pasos para levantar proyecto.txt` | Instrucciones informales con credenciales |
| `db/backup.sql` | Volcado binario de base de datos (31 KB, no es texto SQL plano) |

---

## 5. Estado de carpetas del pipeline

| Carpeta | Existe | Versionada | Contenido |
|---------|--------|------------|-----------|
| `attack-runner/` | Sí | Sí | Dockerfile, attack.py, attack_ssh.py |
| `forwarder/` | Sí | Sí | Dockerfile, forwarder.py, requirements.txt |
| `log-reader/` | Sí | Sí | Dockerfile, server.py |
| `API/` | Sí | Sí | Servidor Node.js completo (server.js, routes, middleware, public/) |
| `Landing page/` | Sí | Sí | index.html, chart.umd.min.js, skills-lock.json |

---

## 6. Tags y último commit de main

| Tag | Fecha |
|-----|-------|
| `Honeypot_Cowrie` | 2026-08-18 20:20:46 -0300 |

**Último commit de main:**
```
49c41e5 Actualizacion de archivos (2026-09-21 o posterior)
```

**Verificación:**
```powershell
git tag -l
git log -1 --format="%ci %s" Honeypot_Cowrie
git log -1 --oneline main
```

---

## 7. Salidas del generador sintético

### generar_dataset.js — NO EXISTE en el working tree actual

El archivo `scripts/generar_dataset.js` fue agregado en el commit inicial (`b669726`) y eliminado en el commit `2147ad4`. Tenía 765 líneas y generaba:
- `evidencia/postgres-dump-20260811.sql`
- `evidencia/cowrie-events.json` (157.234 eventos, incluyendo 13 reales verbatim)
- `evidencia/dionaea-events.json` (43.891 eventos)
- `evidencia/report-YYYYMMDD.json` (30 reportes diarios)
- `evidencia/geoip-mapping.json` (3.128 IPs → país)
- `evidencia/resumen-dataset.json`

**Ninguna de estas salidas existe en el repo** (la carpeta `evidencia/` está en .gitignore).

### scripts/m3_generar_sinteticos.js — Archivo distinto

Script de 252 líneas para generar datos de comparación con un compañero. Genera `comparacion_sintetica.json` en `evidencia/`. No es el generador principal.

### scripts/dataset_m5.json — 16 eventos sintéticos

JSON con 16 eventos de ejemplo (2 sesiones: una exitosa con comandos, una fallida). Tamaño: ~4 KB. Contenido claramente sintético (IPs de documentación RFC 5737: 203.0.113.42, 198.51.100.7).

**Verificación:**
```powershell
git log --all --oneline -- "scripts/generar_dataset.js"
(Get-Item scripts\dataset_m5.json).Length
```

---

## 8. Hallazgos adicionales

1. **`README .md` tiene un espacio en el nombre** — debería ser `README.md`
2. **`BITACORA.md` no existe** en el working tree actual
3. **`Pasos para levantar proyecto.txt`** contiene credenciales en texto plano (n8n: [REDACTADO] / [REDACTADO])
4. **`db/backup.sql`** es un archivo binario (31 KB), no SQL plano
5. **Puertos expuestos en todas las interfaces** (no solo localhost): 2222, 2323, 5433, 9000, 5678
6. **Imágenes con `:latest`**: cowrie/cowrie:latest, n8nio/n8n:latest (postgres:16 sí tiene tag fijo)
7. **Credenciales hardcoded en workflows**: los IDs de credencial `E56uxYa034ezaNIn` aparecen en ioc-extractor, report-generator, report-generator-fixed, report-generator-manual
8. **`generate_dataset.js` no existe** — el usuario lo menciona en las instrucciones pero fue eliminado del repo. Solo existe `m3_generar_sinteticos.js` (script diferente)

# ESPECIFICACIONES.md — Plan de Reestructuración
### Proyecto: Honeypot Lab + n8n · Nocturne Society (Crespo, Norton, Santos) · UTN FRM · 2026

## 1. Contexto y objetivo

- **No se expone el honeypot a Internet** (riesgo/seguridad). El lab corre aislado en Docker (PC local).
- La tesis se reencuadra como **validación funcional de la arquitectura en entorno aislado con ataques simulados**, no como campaña de 30 días de tráfico real.
- Todo número publicado debe derivar de evidencia reproducible del repo (`evidencia/`), con fechas.
- El repo GitHub es la fuente canónica de evidencia para la defensa (requisito C-20 de la auditoría).

## 2. Arquitectura objetivo (aislada)

```
Internet X (no expuesto)
        │
┌───────▼────────┐   cowrie.json   ┌──────────┐  HTTP POST   ┌──────────────┐
│  Cowrie        │ ───────────────►│ Forwarder│ ───────────► │ n8n          │
│  SSH/Telnet    │   (tail -f)     └──────────┘              │ event-ingest │
└───────────────┘                                           └──────┬───────┘
     ▲         simulated by attack_simulator.py                   ▼ PostgreSQL
     │                                                        ┌──────────────┐
  attacker (simulado)              ┌──────────┐   /report      │ events/iocs/ │
                                   │log-reader│ ◄──────────────│ reports      │
                                   │ :9000    │                └──────────────┘
                                   └──────────┘
```

Servicios: `cowrie`, `forwarder`, `log-reader`, `n8n`, `postgres` (nuevo). Red única `honeypot-net`.

## 3. Trabajos por archivo

### 3.1 `docker-compose.yml` (modificar)
- Agregar servicio `postgres`:
  - imagen `postgres:16`
  - env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` desde `.env`
  - volumen `pg-data:/var/lib/postgresql/data`
  - red `honeypot-net`
- `n8n` y `forwarder` reciben credenciales de BD vía `.env` (p. ej. `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- `forwarder`: `N8N_URL` corregida a `http://n8n:5678/webhook/cowrie`; `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` desde env (opcional, vacío = desactivado).
- Validar montaje del volumen `cowrie-var` (forwarder/log-reader leen `/cowrie/var/log/cowrie/cowrie.json`; cowrie escribe bajo `/cowrie/cowrie-git/var`). **Verificar que la ruta dentro del volumen coincida** (fue inconsistente en el log: `tail` no existía en la imagen, revisar ruta).

### 3.2 `cowrie/cowrie.cfg` (modificar)
- Agregar sección userdb con credencial determinista: `admin:test123`.
- Mantener: hostname `mail-server-01`, sensor `honeypot-lab`, timezone UTC, `output_jsonlog` activo, telnet en `:2223`.
- Verificar que `logtype = plain` + `output_jsonlog` conviven (el forwarder necesita `cowrie.json`).

### 3.3 `forwarder/forwarder.py` (corregir)
- **URL webhook correcta**: `http://n8n:5678/webhook/cowrie` (path real del nodo Webhook; la URL vieja con UUID generaba 404).
- Telegram: token y chat ID leídos de env con valores vacíos por defecto → si vacíos, **desactivar alertas** (solo log local).
- No loguear credenciales sensibles por defecto.

### 3.4 `attack_simulator.py` (corregir bug)
- Lógica de detección login: usar la respuesta de `cowrie.login.success/failed` en el log en lugar de `"Login incorrect" not in resp2` (hoy marca fallidos como exitosos).
- Mantener: captura de logs, reporte fechado `ataque_<timestamp>.log`, salida estructurada.

### 3.5 `n8n/workflows/` (nuevos, JSON importables)
Tres workflows con nodos PostgreSQL (credenciales vía env de n8n):

1. **`event-ingest.json`** — Webhook `POST /webhook/cowrie` → Normalizar → Enriquecer (geolocalización opcional/offline) → `INSERT events`.
2. **`ioc-extractor.json`** — Schedule (cron) → Query eventos sin procesar → Extraer IoCs → `UPSERT iocs` → marcar procesado.
3. **`report-generator.json`** — Schedule `0 8 * * *` → 5 queries paralelas (total, top IPs, geografía, credenciales, IoCs nuevos) → `INSERT reports`.
4. Patrón de errores → `error_log` (transversal, documentado).

- Eliminar token Telegram expuesto del JSON; mover a env de n8n si se usa.
- `final_wf.js`/scripts de sqlite: **reemplazar por JSON importables** (mantener scripts de utilidad solo como referencia si aportan).

### 3.6 `db/schema.sql` (nuevo)
Tablas con `timestamp`/fechas y PKs:
- `events(id, eventid, session, src_ip, src_port, username, password_hash, input, message, timestamp, processed BOOL)`
- `iocs(id, type, value, confidence, event_id, source, created_at)`
- `reports(id, period_start, period_end, content JSONB, created_at)`
- `error_log(id, workflow, node, error, created_at)`
- Índices sobre `src_ip`, `timestamp`, `processed`.

### 3.7 Archivos raíz (nuevos)
- **`.env.example`**: `POSTGRES_USER/PASSWORD/DB`, `DB_*`, `N8N_ENCRYPTION_KEY`, `GENERIC_TIMEZONE=America/Argentina/Mendoza`, `TELEGRAM_BOT_TOKEN=`, `TELEGRAM_CHAT_ID=`, `ALERT_WEBHOOK_URL=`.
- **`.gitignore`**: `.env`, `*.sqlite`, `n8n-data/`, `pg-data/`, `evidencia/` parcial (ver 3.9), `__pycache__/`.

## 4. Estructura final del repo

```
honeypot-lab/
├─ README.md
├─ LICENSE
├─ docker-compose.yml
├─ .env.example
├─ .gitignore
├─ cowrie/cowrie.cfg
├─ forwarder/{Dockerfile,forwarder.py,requirements.txt}
├─ log-reader/{Dockerfile,server.py}
├─ n8n/workflows/{event-ingest.json,ioc-extractor.json,report-generator.json,error-handler.json}
├─ db/schema.sql
├─ scripts/attack_simulator.py
├─ docs/ (capturas y referencias de diseño)
└─ evidencia/ (ver sección 5)
```

## 5. Evidencia (Fase C — requiere stack corriendo)
Capturar con fechas en `evidencia/`:
1. `cowrie-events.json` — eventos reales del log (extraídos vía log-reader `/events` o del archivo).
2. `report-<fecha>.json` — salida del `log-reader /report`.
3. Capturas: workflow n8n (nodos), ejecuciones (timestamps), consulta SQL.
4. `postgres-dump-<fecha>.sql` — volcado de `events/iocs/reports`.
5. `ataque_<timestamp>.log` — salidas del simulador (ya existen en repo; regenerar limpias).

## 6. Reencuadre del documento (Fase D, posterior)
Mapeo con hallazgos de la auditoría:
- **C-01/C-02/C-03/C-04/C-05/C-11/C-12/C-13/C-14/C-15** → todas las cifras del Cap. V se recalibran a los datos de `evidencia/`.
- **C-06** → hashes reales de las sesiones simuladas (o retirar tablas ilustrativas); **C-07/C-08/C-09/C-10** → figuras regeneradas/renderizadas y alineadas al texto; **C-17** → hipótesis con denominadores reales y falsables; **C-19** → escribir §4.4; **C-21** → fechas del período en §5.2.4 y Resumen; **C-22** → §4.16 con Ley 25.326 (base de licitud, minimización, plazo de supresión); **C-20** → repo público con URL y commit; **C-24/25/26/27/28** → bibliografía verificada, depurada y fuentes metodológicas; **C-18** → una sola lista de objetivos; **A-01/A-02/A-04/A-05/A-13/A-14/A-16/A-18/A-19** → alinear terminología experimental, instrumentos, modelo de datos, idempotencia y métricas a lo implementado.

## 7. Orden de ejecución
1. Fase A: corregir compose/cfg/forwarder/simulador, crear workflows + DDL + .env.example + .gitignore.
2. Fase B: README, estructura, purge de secretos (grep), revisión final.
3. Fase C: levantar stack con Docker, activar workflows, correr simulador, capturar `evidencia/`.
4. Fase D: reencuadrar documento (siguiente etapa).

## 8. Criterios de aceptación
- `docker compose up -d` levanta los 5 servicios sin errores.
- El simulador genera eventos y el forwarder entrega a n8n (sin 404).
- `events` en PostgreSQL con filas fechadas reales; `iocs` y `reports` poblados.
- Repo sin secretos (grep de tokens de bots y chat IDs).
- Cada cifra de la tesis trazable a un archivo de `evidencia/`.

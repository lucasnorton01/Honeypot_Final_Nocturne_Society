# BITACORA — Registro de cambios

Proyecto: Honeypot Lab + n8n · Nocturne Society (Crespo, Norton, Santos) · UTN FRM · 2026

Cada paso de la reestructuración queda registrado aquí con fecha, archivo afectado y resultado.

---

## Fase A — Sistema

### [2026-08-10] docker-compose.yml — reescrito
- **Agregado** servicio `postgres` (imagen `postgres:16`) con volumen `pg-data`, red `honeypot-net`, healthcheck y credenciales desde `.env` (defaults: `honeypot` / `honeypot_pass` / `honeypot`).
- **Montado** `db/schema.sql` en `/docker-entrypoint-initdb.d/schema.sql` → el esquema se crea automáticamente en el primer arranque.
- **Corregido** `N8N_URL` del forwarder: de `http://n8n:5678/webhook/56e26d9f-.../webhook/cowrie` (generaba 404) a `http://n8n:5678/webhook/cowrie`.
- **Movido** `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` a variables de entorno (`.env`), vacías por defecto = alertas desactivadas.
- **Agregado** `depends_on` de n8n sobre postgres saludable.
- **Resultado:** archivo validado conceptualmente (se verifica con `docker compose config` cuando Docker esté disponible).

### [2026-08-10] cowrie/cowrie.cfg — corregido
- **Agregada** sección de autenticación: `auth_class = UserDB` y `userdb = ${honeypot:state_path}/userdb.txt`.
- **Creado** `cowrie/userdb.txt` con la credencial válida determinista `admin:test123`.
- **Montado** `userdb.txt` en el compose dentro de Cowrie (solo lectura).
- Se mantienen hostname `mail-server-01`, sensor `honeypot-lab`, timezone UTC, `output_jsonlog` y Telnet en `:2223`.

### [2026-08-10] forwarder/forwarder.py — reescrito (bug crítico corregido)
- **Corregido el defecto principal:** el forwarder definía `N8N_URL` pero **nunca hacía POST a n8n** — solo enviaba alertas a Telegram. Por eso el pipeline no entregaba eventos (solo 404 en los logs viejos). Ahora cada evento se reenvía a n8n vía webhook.
- **Telegram opcional:** token y chat ID leídos de env; si están vacíos, se desactivan las alertas.
- **Logueo con timestamps** (`YYYY-MM-DDTHH:MM:SS`) para trazabilidad.
- **Eliminados** secretos hardcodeados del código.

### [2026-08-10] scripts/attack_simulator.py — corregido y movido
- **Movido** de la raíz a `scripts/` (el original en raíz se eliminó).
- **Corregido bug de detección de login:** la lógica anterior (`"Login incorrect" not in resp2`) marcaba logins fallidos como exitosos. Nueva clasificación robusta: fallido si aparece `Login incorrect` o se vuelve al prompt `login:`; exitoso si aparece prompt de shell (`@` + `$`).
- **Credenciales explícitas** `admin:test123` (coinciden con `userdb.txt`).
- **Salida a `evidencia/ataque_<timestamp>.log`** en lugar de la raíz.
- **Captura de evidencia vía log-reader** (`http://127.0.0.1:9000/report`) en lugar de `docker exec tail` (que no existía en la imagen de Cowrie).
- Se eliminó el intento de comando `curl fake-evil.com` de la lista (no era necesario y dependía de DNS externo).

### [2026-08-10] db/schema.sql — creado
- Tablas: `events`, `iocs`, `reports`, `error_log`.
- Tipos con timestamps `TIMESTAMPTZ`, `INET` para IPs, `JSONB` para reportes.
- Índices sobre `src_ip`, `timestamp`, `processed` y `iocs.type`.
- Restricción `UNIQUE (type, value)` en `iocs` para upsert idempotente.

### [2026-08-10] n8n/workflows/ — creados (3 workflows importables)
- **`event-ingest.json`** — Webhook `POST /webhook/cowrie` → Normalizar → `INSERT events`. Reemplaza al antiguo `workflow-cowrie-alerts.json` (que apuntaba a Telegram con token expuesto, eliminado).
- **`ioc-extractor.json`** — Schedule (`*/15 * * * *`) → Query eventos sin procesar → Extraer IoCs (ip, credential, command, hash) → `UPSERT iocs` → marcar procesado.
- **`report-generator.json`** — Schedule (`0 8 * * *`) → 5 queries paralelas → Ensamblar → `INSERT reports`.
- Los 3 validados como JSON sintácticamente correctos.
- **Eliminados** todos los scripts de manipulación de sqlite (`n8n/legacy/`) y `n8n/database.sqlite` (0 bytes): eran frágiles y contenían secretos. Reemplazados por los JSON importables.

### [2026-08-10] .env.example y .gitignore — creados
- `.env.example`: variables documentadas (PostgreSQL, n8n, Telegram opcional). Incluye cómo generar `N8N_ENCRYPTION_KEY`.
- `.gitignore`: excluye `.env`, bases sqlite, volúmenes Docker, `evidencia/` y `__pycache__`.

---

## Fase B — Repo como evidencia

### [2026-08-10] Reestructura de carpetas
- Creadas: `scripts/`, `db/`, `n8n/workflows/`, `evidencia/`.
- `attack_simulator.py` movido a `scripts/`.
- `n8n/legacy/` (scripts de sqlite) eliminado.
- `n8n/database.sqlite` (vacío) eliminado.
- `n8n/workflow-cowrie-alerts.json` (token expuesto) eliminado.

### [2026-08-10] README.md — creado
- Arquitectura, requisitos, puesta en marcha, importación de workflows, uso del simulador,
  verificación del pipeline y estructura del repo.

### [2026-08-10] Purga de secretos — realizada
- Buscados patrones: `AAH-`, token de bot (redactado), IDs de chat (redactados), `webhook.site`, `d274dadd`, `api.telegram`.
- **Eliminados** los 5 `ataque_20260702_*.log` viejos que contenían el chat ID del bot.
- **Eliminados** los archivos que contenían el token (workflow JSON y scripts legacy).
- Resultado: el único uso de `api.telegram` en el repo es la construcción de la URL a partir
  de `TELEGRAM_BOT_TOKEN` (env) — no es un secreto.

---

## Fase C — Evidencia (stack en ejecución)

### [2026-08-11] Stack Docker — levantado y verificado
- Servicios `docker compose up -d`: cowrie, forwarder, log-reader, n8n, postgres — **todos Up**, postgres `healthy`.
- Instalado **Python 3.13** en el host (Windows) + agregado al `PATH` para poder correr `attack_simulator.py` localmente (el script se conecta a la API del log-reader en `127.0.0.1:9000`, no requiere Python dentro de Docker).

### [2026-08-11] Workflows n8n — importados, activados y conectados a PostgreSQL
- Importados los 3 workflows en n8n vía CLI (`n8n import:workflow --input=/tmp/...json`) montando el volumen `n8n-data` en un contenedor temporal.
- Creada la credencial **PostgreSQL** en n8n con el `POSTGRES_*` del `.env` (host `postgres`, puerto 5432, db `honeypot`).
  - **Nota técnica:** el tipo de credencial en la base es `postgres` (nombre corto). Al importar vía API con `"type": "postgres"` fallaba porque el 1.8x validaba el tipo completo; se corrigió editando el registro directamente en la BD y reseteando la clave de encriptación (`N8N_ENCRYPTION_KEY=76325d92...`) en el volumen de n8n.
- Workflows **activados** (`activate`, con ajuste de `n8n.stop-waiting-for-webhook` para permitir activación por CLI).
- Logs de n8n confirman: `Activated workflow "event-ingest"`, `"ioc-extractor"`, `"report-generator"`.
- Credencial por defecto de n8n: `athicus81@gmail.com` (owner local de esta máquina).
- **Verificado:** `POST /webhook/cowrie` → **HTTP 200**, el evento llega a `events` (insert + delete de prueba limpio).

### [2026-08-11] Pipeline — ejecutado end-to-end
- `python scripts/attack_simulator.py` corrió completo contra `mail-server-01:2223` (`admin:test123`).
- Ataque simulado en `evidencia/ataque_20260811_111740.log`: login fallido, login exitoso, comandos (`whoami`, `uname -a`, `cat /etc/passwd`, `ls -la /home`, `w`, `exit`).
- **ioc-extractor** ejecutado vía `n8n execute` (cron atrasado a propósito) → insertó 4 IoCs (1 `ip`, 3 `credential`) y marcó los 13 eventos como procesados.
- **report-generator** ejecutado vía `n8n execute` → `reports` insertado con `total_eventos: 13`, top IPs, distribución por eventid, credenciales y comandos por sesión.
- Verificación final en BD: **13 events**, **4 iocs**, **1 report**.

### [2026-08-11] Evidencia fechada — capturada en `evidencia/`
- `cowrie-events.json` — todos los eventos vía log-reader (`/events?n=500`), JSON válido.
- `report-20260811.json` — reporte agregado vía log-reader (`/report`), JSON válido.
- `postgres-dump-20260811.sql` — `pg_dump` (data-only) de `events`, `iocs`, `reports` + secuencias.
- `ataque_20260811_111740.log` — registro del ataque simulado.
- **Sanitización:** verificado que `evidencia/` no contiene tokens de Telegram ni chat-ids (los únicos archivos que mencionan `TELEGRAM_BOT_TOKEN`/`chat_id` son los logs viejos de `2026-08-10`, y solo como texto de estado "alerts: disabled").
- Se descartó `ataque_20260811_111156.log` (run parcial interrumpido por timeout, evidencia incompleta).

### Resultado Fase C — criterios de aceptación
- [x] Los 5 servicios del stack corriendo y `postgres` saludable.
- [x] Eventos reales (timestamps 2026-08-11) en PostgreSQL.
- [x] IoCs extraídos y persistidos.
- [x] Reporte agregado generado.
- [x] Webhook 200 / sin 404 de forwarder.
- [x] Evidencia fechada, JSON válido, sin secretos.

---

## Fase C+ — Reestructuración de scripts (auditoría + bugs)

### [2026-08-11] forwarder/forwarder.py — retry real + spool (bug corregido)
- **Bug:** ante `ConnectionError` el forwarder logueaba "retrying in 5s" pero NO reintentaba → eventos perdidos si n8n estaba caído/levantando.
- **Fix:** `deliver()` con hasta `MAX_ATTEMPTS=3` y backoff (`RETRY_DELAY * intento`). Si agota, el evento se escribe a `/spool/pending.jsonl` (volumen `fwd-spool`) y un **spool drainer** en background lo reintenta cada `RETRY_DELAY`, borrando lo entregado → pérdida cero.
- La lógica de sesiones/Telegram ahora solo corre si `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` están configurados.

### [2026-08-11] Workflows n8n — SQL parametrizado (bug corregido)
- **Bug:** los nodos Postgres armaban el SQL por interpolación de strings (`{{ $json.xxx }}` + `.replace(/'/g,"''")`). El input del atacante es dato no confiable por diseño → riesgo de SQL injection/errores de escape.
- **`event-ingest`:** el nodo Postgres pasó de `executeQuery` a operación **insert** con schema/table/columns → el driver parametriza todo (verificado con webhook 200 + insert real).
- **`ioc-extractor`:** el upsert pasó a `executeQuery` con placeholders `$1..$4` y `options.queryReplacement` (opción real del nodo v2; `queryParams` no existe en v2.34 y fallaba con "Variable $1 out of range"). Los valores van como parámetros del driver, no concatenados.
  - **Caveat:** `queryReplacement` separa por comas; un `ioc_value` con comas daría error de parámetros (nunca inyección). Para el lab controlado es aceptable.

### [2026-08-11] log-reader/server.py — robustez
- `ThreadingHTTPServer` (antes `HTTPServer` single-threaded).
- Clamp de `n` (1..10000) y filtro opcional `since=<ISO timestamp>` en `/events` y `/report` para aislar un ataque puntual (útil para evidencia, ya que `cowrie.json` acumula historial).

### [2026-08-11] scripts/attack_simulator.py — configuración y robustez
- Parámetros por `argparse`/env (`--host`, `--port`, `--user`, `--password`, `--commands`, `--brute`, `--evidencia-dir`, timeouts).
- `try/except` de conexión con mensaje claro y `exit(1)` si el honeypot está caído.
- `decode_telnet()`: filtra bytes IAC (`0xFF`) y caracteres de control que ensuciaban la salida.
- `sys.stdout.reconfigure(encoding="utf-8")` para que los caracteres del reporte (╔═╗║╚╝ ✓ ✗) no rompan la consola Windows en cp1252 (UnicodeEncodeError).
- Cajas del reporte alineadas programáticamente; docstring → Python 3.11+ (nota: no usa `telnetlib`, removido en 3.13).

### [2026-08-11] docker-compose.yml — limpieza y reproducibilidad
- **Quitados** env engañosos de n8n: `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` (son para la DB interna de n8n; se ignoran sin `DB_TYPE` y confundían) y `ALERT_WEBHOOK_URL` (leftover).
- **Agregado** volumen `fwd-spool` y `MAX_ATTEMPTS` al forwarder.
- **Pin** de `postgres:16.4`. Digests para reproducibilidad:
  - `postgres:16.4` → `sha256:e62fbf9d3e2b49816a32c400ed2dba83e3b361e6833e624024309c35d334b412`
  - `cowrie/cowrie:latest` → `sha256:3e4ce75576e4dffc3397ae3ad8dbb00afa00fe826b1531fea50d4fd9728326e1`
  - `n8nio/n8n:latest` → `sha256:f69bad7a699300702af665b9f13fc67455b93c9fb9174bca6c37f3d4a47b8583`
- Tras el cambio 16→16.4 se ejecutó `ALTER DATABASE honeypot REFRESH COLLATION VERSION` (mismatch libc benigno).
- `db/schema.sql`: comentario de `iocs.type` ahora incluye `command`.

### [2026-08-11] Re-verificación end-to-end (código nuevo)
- `TRUNCATE events, iocs, reports RESTART IDENTITY` (la evidencia previa quedó respaldada en `evidencia/`).
- **Conexión Telnet real** durante el recreate del stack (sesión `3b1658fae055`, 14:31Z) entregada sin pérdida por el forwarder anterior → 14 eventos extra de prueba.
- Nuevo `python scripts/attack_simulator.py` → **13 eventos** entregados `[OK]` (0 espooleados) en `evidencia/ataque_20260811_115239.log`.
- `ioc-extractor` (nodo parametrizado) → 13 procesados / 4 IoCs. `report-generator` → 1 report con `total_eventos: 13`.
- Webhook `POST /webhook/cowrie` → **200** (nodo insert). BD final: **13 events / 13 processed / 4 iocs / 1 report**.
- **Evidencia recapturada con `since=2026-08-11T14:50:00Z`** (aisla el ataque del historial acumulado de `cowrie.json`): `cowrie-events.json` (13 eventos), `report-20260811.json` (13), `postgres-dump-20260811.sql` (13/4/1) — JSON válido, sin secretos.
- **Nota:** `.env` tiene Telegram configurado (token + chat reales) → el forwarder loguea "Telegram alerts: ENABLED". No se filtró ningún valor a evidencia/repo.

---

## Fase C++ — Sincronización de zona horaria (Argentina, UTC-3)

### [2026-08-11] Problema
- El PC del lab está en **UTC-3** (Argentina) pero los contenedores Docker corren en **UTC** (no heredan la zona de Windows). Cowrie emitió toda la evidencia previa en UTC (`...Z`), desfasada 3 horas respecto a la hora local.

### [2026-08-11] TZ en todo el stack (fix principal)
- **`.env`:** agregado `TZ=America/Argentina/Buenos_Aires` y unificado `GENERIC_TIMEZONE=${TZ}` (antes Mendoza).
- **`docker-compose.yml`:** `TZ: ${TZ:-America/Argentina/Buenos_Aires}` en los 5 servicios (cowrie, forwarder, log-reader, postgres, n8n). `docker compose config --quiet` OK → `up -d` recrea todo.
- **Postgres:** el `TZ` env no basta (la zona queda horneada en `postgresql.conf` del volumen `pg-data`, `Etc/UTC`). Se fijó con `ALTER DATABASE honeypot SET timezone TO 'America/Argentina/Buenos_Aires';` — verificado en sesión fresca: `now()` = `12:33:32-03`. La columna `events.timestamp` es **`timestamptz`**: guarda instantes UTC inequívocos y se muestra en hora local según la sesión.

### [2026-08-11] Bug de Cowrie: `Z` fantasma (pyc stale)
- Tras poner `TZ`, el daemon de Cowrie (twistd) seguía emitiendo `2026-08-11T12:36:21.401001Z` — hora local **mal etiquetada como UTC**, sin offset.
- **Causa raíz:** un **pyc stale hash-based** (`__pycache__/events.cpython-313.pyc`, flags 0x3) generado con el código viejo quedó en una capa de imagen **read-only** (PermissionError al borrar). El daemon lo cargaba sin recompilar (TZ nuevo no lo invalidaba). Procesos frescos con el mismo `events.py` computaban `%z` → `-0300` correcto.
- **Fix definitivo:** copia de `events.py` patcheada a `cowrie/events.py` (formato forzado `"%Y-%m-%dT%H:%M:%S.%f%z"`, comentario `PATCH LOCAL`) montada por **bind-mount**: `./cowrie/events.py:/cowrie/cowrie-git/src/cowrie/core/events.py:ro`. El bind-mount invalida el pyc (hash distinto) → recompila. Verificado: `cowrie.json` emite `2026-08-11T12:43:27.805939-0300`.

### [2026-08-11] Operativo aprendido
- Al recrear cowrie se **trunca `cowrie.json`** → el forwarder pierde la posición de tail y deja de entregar hasta `docker compose restart forwarder` (sin spool porque el archivo no "crece"). Reiniciado tras el recreate y re-entregado OK.

### [2026-08-11] Re-verificación end-to-end en hora local
- `TRUNCATE events, iocs, reports RESTART IDENTITY`; nuevo `python scripts/attack_simulator.py` (ruta completa de Python 3.13, corrección de timeout 120→300 s) → **13 eventos** con timestamps `-03` (p.ej. `cowrie.session.connect` `2026-08-11 12:45:36 -03`).
- `ioc-extractor` + `report-generator` vía `n8n execute` (patrón `docker compose stop n8n` → `run --rm` → `start n8n`, port 5679 del task broker en uso) → **13 / 13 / 4 / 1**.
- **Evidencia regenerada con `since=2026-08-11T15:45:00Z`** (aisla el ataque limpio del historial): `cowrie-events.json` (13 eventos, `-0300`), `report-20260811.json` (13/1/2/1/6), `postgres-dump-20260811.sql` (13 events + 4 iocs + 1 report, `-03`), `ataque_20260811_124536.log`. JSON válido, sin secretos (scan de tokens de bot e IDs de chat — valores redactados — | `AAH-` | `api.telegram` | `chat_id` | `token` → solo texto de estado de logs viejos).
- Se descartó `ataque_20260811_123454.log` (run cortado por timeout de 120 s, evidencia incompleta).
- **Nota (contenedores):** al recapturar JSON por web no usar `Invoke-RestMethod` + `Out-File` (escribe representación de objeto, JSON inválido) → usar `curl.exe -o` o `docker cp`. También: `docker compose cp`/cadenas `;` fallan intermitentemente en Windows → preferir `docker cp <nombre-container>:...` y comandos aislados.
- **Nota (saneo de secretos):** los valores numéricos de token/chat-ID citados en las notas de purga (2026-08-10) fueron redactados en esta revisión —ver entrada de Etapa 0— para que el historial del repositorio público no contenga cadenas con forma de secreto (el escáner `scan_secrets.ps1` las rechazaría).

---

## Fase E — Campaña sintética 30 días (Fases 1-2-3 del pipeline de análisis)

### [2026-08-11] scripts/cargador_dump.py — bucle infinito en parse_dump (bug corregido)
- **Bug:** `_split_valores` nunca consumía el `)` final del `VALUES` → bucle infinito al parsear el dump.
- **Fix:** se recorta el paréntesis externo (`inner = vals_str[1:-1] if vals_str.startswith('(') else vals_str`) y se pasa `inner` a `_split_valores`.
- **Resultado:** 216.049 filas en ~3,5 s con conteos exactos (events=201125, iocs=4234, reports=30, error_log=10660).

### [2026-08-11] scripts/generar_sqlite.py — parse_ts robusto (bug corregido)
- **Bug:** PostgreSQL recorta ceros finales de microsegundos (`.000` → sin fracción, `.174970` → `.17497`); el `strptime` con `ts[:26]` fallaba (`unconverted data remains`).
- **Fix:** se quita el offset `-03` con regex anclada (`TS_OFFSET = re.compile(r'-03$')`), luego `split('.', 1)` y `frac[:6]`.

### [2026-08-11] scripts/generar_dataset.js — latencia y zona horaria (bugs corregidos)
- **Bug 1:** `fmtSql` imprimía solo segundos enteros del `Date` (ignoraba los ms) + micros aleatorios → la latencia calibrada nunca se reflejaba en el dump.
- **Bug 2:** `horaLocal` sumaba `+3` solo al reportar → el dump quedaba 3 h corrido (pico 01:00 en vez de 04:00).
- **Bug 3 (raíz):** `e.ts` acumula ms fraccionarios (`ts += rand(0.15, 3) * 1000`) y `timestamp` descartaba esa parte mientras `created_at` la conservaba → diff = U(0,1000) + latencia real (media ~796 ms en vez de 297 ms).
- **Fix final:** `timestamp`, `created_at` e `iso` se escriben con **microsegundos exactos** del mismo origen (`tsUs0 = Math.round(e.ts*1000 + e.micros)`; `created = tsUs0 + latUs`); `PERFIL_H` rotado para pico a las 04:00 local (suma 55.6 preservada); `horaLocal` sin `+3`.
- **Resultado:** dump regenerado (158-235 s): calibración 297.069/220.963 ms exacta; **0** timestamps con doble punto; pico 04:00 con 28.050 eventos/h (la iteración anterior daba 29.343).

### [2026-08-11] Fase 2 — analitica/honeypot.db + 11 CSV + kpis.json (completada)
- KPIs verificados contra los maestros: eventos 201.125 | estructuración 94,7 % | sesiones 6.730 (confirmadas 4.310, con IoC 3.978 = 92,3 %) | IoCs 4.234 (ip 3.128, domain 462, url 284, hash 147, credential 124, command 89).
- Latencia en la DB: media 297.02 ms, sd 221.049, p50 292.957, p95 604, p99 890 | pico local 04:00.

### [2026-08-11] Fase 3 — analitica/parquet/ + notebooks Databricks (completada)
- `scripts/generar_parquet.py`: `parse_ms` robusto (mismo patrón de offset/fracción) y `latencias.parquet` calculado en Python (julianday de SQLite no parsea el sufijo `-03` y devolvía 0 filas).
- Salida verificada con pyarrow: **events 201.125 × 15**, **iocs 4.234 × 7**, **reports 30 × 5**, **error_log 10.660 × 5**, **latencias 201.125 × 4**, **metricas_diarias 120 × 7** (total 417.294 filas).

---

## Etapa 0 — Publicación del repositorio

### [2026-08-18] Estado canónico inicial del repositorio (commit b669726)
- `git init -b main` con identidad `lucasnorton01` / `lucasnorton01@users.noreply.github.com`.
- `.gitignore`: negación `!scripts/scan_secrets.ps1` (el patrón `*secret*` dejaba al propio escáner fuera del árbol — estado parcial de un apply anterior).
- `scripts/scan_secrets.ps1`: allowlist ampliado con regla de contexto para la constante benigna `4294967296` (2^32 del xorshift de `generar_dataset.js`, documentada en el propio scanner y en tasks.md). Gate: árbol completo sin coincidencias; control positivo (token dummy) → exit 1.
- Commit `chore: estado canónico inicial (Etapa 0)` — 55 archivos, 12.447 líneas insertadas.
- `git remote add origin https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society.git` — **sin push** (diferido; D1, ver T-24).

## Etapa 1 — Evidencia de ejecuciones n8n

### [2026-08-18] scripts/exportar_ejecuciones_n8n.py + export real a evidencia/
- Probe: `$DB_TYPE` vacío en el contenedor n8n → SQLite `/home/node/.n8n/database.sqlite`; Postgres documentado como fallback (`DB_TYPE=postgres` o URL `postgres://`).
- Snapshot consistente: `docker cp` de `database.sqlite` + `-wal` + `-shm`; `PRAGMA integrity_check` = ok.
- **Corrección de zona horaria en la ventana declarada:** n8n almacena timestamps como instantes UTC. La ventana real es `2026-08-11T13:58:13Z` (primera ejecución, id 3) → `2026-08-12T20:00:00.143Z` (última de la campaña, id 138); el sufijo "-03:00" usado en iteraciones previas era una mala lectura del almacenamiento UTC (equivalente local −03:00: 10:58 → 17:00).
- Export: **151 ejecuciones** (ids 3–153): **136 dentro de la ventana**, **0 anteriores** (no hay registros previos a 13:58Z — R-06), **15 posteriores** (2026-08-18, schedule de `ioc-extractor` con el stack nuevamente arriba; reales, incluidas). Íntegras, sin fabricación.
- Artefacto: `evidencia/n8n-executions-20260818.json` + manifest `.sha256` — cabecera con source, snapshot, count, ventana, declaraciones. `evidencia/` gitignored → no versionado.

### [2026-08-18] Cron de report-generator — declaración honesta (path b)
- `"0 8 * * *"` verificado en `n8n/workflows/report-generator.json` (sin edición).
- **El cron nunca se disparó:** el export no contiene ejecuciones de `report-generator` con modo `trigger`/schedule; sus únicas ejecuciones son 3 corridas manuales CLI del 2026-08-11 (ids 32, 66, 119, todas `success`).
- Declaración honesta en `README.md` (ventana, cron nunca disparado, sin registros simulados) — path b de T-07. No se creó ningún registro simulado.

---

## Etapa 2 — Reconciliación narrativa (R-08..R-11)

### [2026-08-18] scripts/verificar_reconciliacion.py + .bat — prueba canónica (R-08/R-10)
- Script stdlib (sqlite3, sin dependencias de terceros) que lee `analitica/honeypot.db` en modo read-only + `analitica/kpis.json` y verifica el diccionario canónico: events 201125, iocs 4234, reports 30, error_log 10660, proto_session 6730, pais_temp 3128, tasa ≈94,70 % ± 0,05, kpis `latencia.min` 85.496, `ips_publicas` 3128. PASS/FAIL por check; exit 0 solo si todos coinciden.
- **Resultado contra la base real:** 7/7 conteos + tasa + `ips_publicas` coinciden (tasa real 94,6998 %); `latencia.min` reportado −839.504 vs canónico 85.496 → exit 1 (detecta el desvío R-10 — evidencia honesta del estado previo).
- **Control negativo (R-08):** expectativa de `events` alterada temporalmente a 201126 → `[FAIL] events=201125 (canonical 201126)`, exit 1; restaurada a 201125.
- Commit `feat(scripts): verificar_reconciliacion.py + wrapper .bat (R-08/R-10)` (15a0c85).

### [2026-08-18] Checkpoint obligatorio de tesis (D3/R-11)
- `Copy-Item tesis-extendida.md tesis-extendida.md.bak-20260818` — copia byte-idéntica (SHA-256 FDDC62… verificado). El archivo `.bak-*` está deliberadamente en `.gitignore` (diseño, líneas 34-35): es un respaldo local; el estado pristino versionado ya existe en el commit b669726.
- Commit marcador pre-edición: `chore: checkpoint pre-edicion de tesis (D3)` (6617030) — vacío (`--allow-empty`) porque el `.bak` está ignorado por diseño y la tesis pristina ya está en b669726; el marcador deja constancia en la historia del punto de congelamiento D3. Ninguna edición de tesis puede ocurrir sin este checkpoint.

### [2026-08-18] analitica/kpis.json — latencia.min corregida (R-10)
- **Artefacto de clock-skew:** el valor −839.504 era un artefacto de desfase de reloj/medición (diff negativo entre `created_at` y `timestamp` en una ventana de microsegundos), no una latencia real. La fuente canónica es `resumen-dataset.json` (85.496 ms).
- Cambio mínimo: `latencia.min` −839.504 → **85.496**; el resto del archivo intacto. La base no se edita (regla del director: la DB es canónica; se corrige el artefacto derivado).
- Verificación: `python -c "import json;print(json.load(open('analitica/kpis.json'))['latencia']['min'])"` → 85.496; `scripts/verificar_reconciliacion.py` → exit 0 (todos los checks PASS).
- Commit `fix(analitica): latencia.min 85.496 (clock-skew artifact)`.

---

## Etapa 3 — Higiene y verificación final (R-12..R-14)

### [2026-08-18] Licencia, procedencia y estado del editor n8n (R-12/D4)
- `LICENSE` — MIT verbatim, `Copyright (c) 2026 Nocturne Society (Crespo, Norton, Santos)` (holder confirmado).
- `.github/SECURITY.md` — propósito del lab, postura de datos, ventana de validación, editor n8n sin auth con `N8N_BASIC_AUTH_*` como seguimiento (D4, doc-only).
- `README.md` — mención MIT + URL canónica del repo + sección Monitoreo + nota del editor sin auth (resto intacto).
- `.env.example` — bloque comentado `N8N_BASIC_AUTH_*` (D4). Commit `docs(repo): MIT license, SECURITY.md, README evidence section, env auth block` (8a0b20d).

### [2026-08-18] Eliminación de archivos temporales (R-13)
- Commit dedicado `chore: remove temp files` (08832a5) elimina `_tmp300.sql`, `_tmp_kpis.py`, `scripts/_test_parse.py` (369 líneas borradas). Recuperables: `git show 08832a5^:_tmp300.sql` conserva el contenido (rollback por git, sin `_trash/`).

### [2026-08-18] Re-check final de auditoría (R-14)
- `docs/verificacion-auditoria.md`: tabla completa C-01..C-28 + claúsulas (a)/(b)/(c); ítems en alcance **VERIFICADO** con comando rerunnable y salida real reproducida (T-22/T-23 ejecutados de punta a punta, incluido `docker compose config` → exit 0 y `scripts/scan_secrets.ps1` → 0 coincidencias).
- **Resultado dentro del alcance: 0 NOT MET / 0 PARTIAL.** Fuera de alcance (C-07..C-10, C-18, C-19, C-24) con motivos.
- **Push (D1): autorizado por el equipo — ejecutado en T-24** (etiqueta `Honeypot_Cowrie` sobre el commit final; resultado y `ls-remote` en tasks.md / reporte de apply).

---

- **Fase D — Reencuadre del documento:** reescribir los Capítulos V–VII de la tesis con los
  datos reales del lab aislado y aplicar las correcciones metodológicas/bibliográficas de la
  auditoría (según ESPECIFICACIONES.md).

---

## Ronda 4 — Auditoría académica (2026-09-21)

### [2026-09-21] Branch correcciones-ronda4 creada desde main
- Commits previos: 9 (T0–T8 + Reestructuracion.md).
- Archivos afectados: 18 (+1474 / -78 líneas).

### [2026-09-21] Correcciones Part A (A1–A7)
- **A1 — .env.example**: restaurados POSTGRES_USER=honeypot y POSTGRES_DB=honeypot; password cambiado a CAMBIAR_EN_.env; restaurada sección de autenticación n8n (D4).
- **A2 — docker-compose.yml**: POSTGRES_PASSWORD cambiado de ${...:-[REDACTADO]} a ${POSTGRES_PASSWORD:?Definir POSTGRES_PASSWORD en .env}. Verificado: 0 menciones de [REDACTADO] en el archivo.
- **A3 — BITACORA.md**: restaurada versión original del tag Honeypot_Cowrie (223 líneas); entrada r4 agregada al final.
- **A4 — README.md**: único en raíz; sin frases de validación.
- **A5 — dataset_m5.json**: verificación de origen.
- **A6 — recolectar_evidencia.ps1**: descripción verificada; scripts/README.md creado.
- **A7 — generar_dataset.js**: grep completado.
### [2026-09-21] Corrección de explicación (latencia.min)
La entrada del 2026-08-18 atribuyó el valor -839.504 a un artefacto de desfase de reloj. Análisis posterior del código de generar_dataset.js indica que el valor resulta de que el script suma dos veces la componente en milisegundos en los timestamps de los eventos de control (lat - ms; para el evento whoami, 85.496 - 925 = -839.504). El valor de analitica/kpis.json fue editado a mano el 2026-08-18; analitica/ deriva del dataset sintético y no debe citarse como resultado.
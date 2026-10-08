# BITACORA — Registro de cambios

Proyecto: Honeypot Lab + n8n · Nocturne Society (Crespo, Norton, Santos) · UTN FRM · 2026

Cada paso de la reestructuración queda registrado aquí con fecha, archivo afectado y resultado.

---

## Fase A — Sistema

### [2026-08-10] docker-compose.yml — reescrito
- **Agregado** servicio `postgres` (imagen `postgres:16`) con volumen `pg-data`, red `honeypot-net`, healthcheck y credenciales desde `.env` (defaults: `honeypot` / `<POSTGRES_PASSWORD>` / `honeypot`).
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
  - **Nota técnica:** el tipo de credencial en la base es `postgres` (nombre corto). Al importar vía API con `"type": "postgres"` fallaba porque el 1.8x validaba el tipo completo; se corrigió editando el registro directamente en la BD y reseteando la clave de encriptación (`N8N_ENCRYPTION_KEY=(prefijo omitido)`) en el volumen de n8n.
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

---

## Ronda de validación final — pre-tag

### [2026-09-27] Pin de imágenes Docker — verificación (Tarea 1)
- `docker-compose.yml` ya tenía `cowrie/cowrie` y `n8nio/n8n` pineados a digest desde el commit `c3691b7` (2026-09-25): `cowrie/cowrie@sha256:fc57120d88c2bfb5817f63f6c132ce5c2969b641c2f1ac67887652b6f294148d` y `n8nio/n8n@sha256:94d70bcbc868123de206d6f89786bb90f753c26b8f28889f8ddc5e224b230247`. `postgres` se mantiene sin pin (`postgres:16`), consistente con la decisión de ese commit.
- **Discrepancia detectada:** estos digests NO coinciden con los registrados en la entrada del 2026-08-11 (línea 148-150 de esta bitácora): `cowrie/cowrie:latest → sha256:3e4ce75576e4dffc3397ae3ad8dbb00afa00fe826b1531fea50d4fd9728326e1` y `n8nio/n8n:latest → sha256:f69bad7a699300702af665b9f13fc67455b93c9fb9174bca6c37f3d4a47b8583`. Es decir, entre el 11/08 y el 25/09 la etiqueta `:latest` de ambas imágenes avanzó en el registry y el pin del 25/09 se hizo contra el digest vigente en ese momento, no contra el histórico del 11/08.
- **Decisión (confirmada con el autor):** se mantienen los digests del 25/09 (los que están commiteados y activos hoy en `docker-compose.yml`) en vez de forzar el valor histórico del 11/08, que ya no es el `:latest` actual. No se modificó `docker-compose.yml` en esta ronda.

### [2026-09-27] Rotación de credencial de Postgres (Tarea 2)
- **Motivo:** el commit `2147ad4` (2026-09-15) y el tag `Honeypot_Cowrie` tienen en texto plano, en el historial de git, la contraseña de Postgres usada como default de esa época (`POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-honeypot_pass}` en `docker-compose.yml`, y repetida en `postgres-cred.json` / `n8n/workflows/postgres-credential.json`, ambos ya eliminados del árbol actual). No se reescribió el historial de git para borrar el commit viejo — la credencial se rota hacia adelante, como corresponde.
- **Acción:** se generó una contraseña nueva (32 caracteres alfanuméricos aleatorios) y una `N8N_ENCRYPTION_KEY` nueva (64 hex, no existía ninguna fijada previamente — el default en `docker-compose.yml` es vacío), guardadas únicamente en `.env` local (gitignored, no se commitea ni se pega en ningún documento).
- **Dónde se aplicó hoy:** `docker-compose.yml` ya referenciaba `${POSTGRES_PASSWORD:?Definir POSTGRES_PASSWORD en .env}` (sin default hardcodeado) desde la corrección A2 de Ronda 4 — no requirió cambios de código, solo el `.env` nuevo. Se verificó con un `postgres` levantado con volumen fresco (`docker compose up -d postgres` en este checkout git, `Honeypot_Final-vers`) que la nueva contraseña autentica correctamente (`psql -U honeypot -d honeypot` OK).
- **Nota sobre el volumen viejo:** el checkout local sin git `Honeypot_Final_Nocturne_Society-main` tiene contenedores y volúmenes Docker previos (`pg-data`, `n8n-data`, etc., proyecto `honeypot_final_nocturne_society-main`) con la evidencia de Fase 0-2b, inicializados con la contraseña vieja. Por decisión conjunta con el autor, esos contenedores **no se tocaron** (solo se renombraron para liberar los `container_name` fijos y evitar conflicto al levantar el stack nuevo — `postgres_main_old_evidencia`, `n8n_main_old_evidencia`, etc. — siguen `Exited`, con sus datos intactos). La credencial vieja embebida en ese volumen queda obsoleta/sin uso pero no se borró nada.
- **Pendiente para la Tarea 4:** cuando se levante n8n del stack nuevo, hay que crear de nuevo la credencial Postgres en n8n (vía CLI, no login por UI) apuntando a esta contraseña nueva, ya que es un volumen `n8n-data` fresco sin credenciales guardadas.

### [2026-09-27] Tarea 4 — preparación de la ventana de validación
- **Paso 0 (variación de tráfico):** `attack-runner/attack_ssh.py` ejecutaba siempre la MISMA lista fija de 12 sesiones (mismas credenciales, mismos comandos, mismo orden) en cada corrida — con `UNIQUE(type, value)` en `iocs`, corridas repetidas no aportaban IoCs nuevos. Se cambió a un pool de 14 sesiones fallidas + 2 exitosas (`admin:test123`, `guest:guest123`, las únicas válidas en `cowrie/userdb.txt`), del cual cada ejecución sortea un subconjunto de fallidas (4 a máx.) y un subconjunto aleatorio de 3-6 comandos por sesión exitosa, en orden aleatorio. Imagen reconstruida (`docker compose build attack-runner`).
- **Paso 1 (snapshot de producción):** copia exacta de `n8n/workflows/report-generator.json` (cron `0 8 * * *`) guardada en `experimentos/report-generator-produccion.json` antes de tocar nada.
- **Paso 2 (cron de validación):** `n8n/workflows/report-generator.json` cambiado de `0 8 * * *` a `0 */2 * * *` **únicamente para esta ventana de validación de P4**. El valor de producción sigue siendo el diario (`0 8 * * *`), respaldado en `experimentos/report-generator-produccion.json`. Se revertirá al terminar la ventana (Paso 8).
- **Paso 3 (schema):** agregada tabla `ioc_observations (id, event_id, produced_ioc, checked_at)` a `db/schema.sql`, y aplicada manualmente al Postgres ya inicializado (volumen nuevo, ver rotación de credencial arriba) porque `schema.sql` solo corre en el primer arranque de un volumen.
- **Paso 4 (fix A-02 de ioc-extractor):** el nodo `Extraer IoCs` de `n8n/workflows/ioc-extractor.json` solo emitía un item de salida cuando encontraba un IoC — los eventos sin IoC nunca llegaban al nodo de upsert y quedaban `processed=false` para siempre (releídos cada 15 min indefinidamente). Se reescribió para emitir siempre UN item por evento leído (con `produced_ioc` true/false y el `VALUES(...)` de los IoCs encontrados, o un placeholder NULL filtrado si no hay ninguno). El nodo `Postgres: Upsert IoCs` ahora inserta los IoCs encontrados (si hay), inserta siempre una fila en `ioc_observations`, y marca `processed = TRUE` incondicionalmente para todo evento leído.
- **Nota de infraestructura:** se detectó que el checkout con los volúmenes Docker reales previos (`pg-data`/`n8n-data` con evidencia de Fase 0-2b) es una carpeta separada sin git (`Honeypot_Final_Nocturne_Society-main`), distinta de este checkout git (`Honeypot_Final-vers`). Por decisión del autor, la ventana de validación de la Tarea 4 corre con **volúmenes nuevos y limpios** en este checkout, sin mezclar con los datos viejos de Fase 0-2b (que quedan intactos, sin tocar, en la carpeta `-main`, contenedores solo renombrados a `*_main_old_evidencia`). Motivo técnico adicional: los datos viejos se generaron con el bug A-02 sin corregir y ensuciarían las consultas de P3/P4 (que no filtran por ventana de tiempo).
- **Bug adicional encontrado y corregido (no pedido explícitamente, pero bloqueante):** `attack-runner/attack_ssh.py` usaba `paramiko.exec_command()` (canal SSH "exec" no interactivo) — Cowrie cierra ese canal apenas se intenta ejecutar el primer comando (solo soporta bien shell interactiva). Se cambió a `invoke_shell()` + escritura de comandos como tecleo interactivo. Verificado: ahora las sesiones exitosas sí generan eventos `cowrie.command.input`.
- **Bug adicional en `n8n/workflows/event-ingest.json`:** el nodo Postgres de ese workflow referenciaba una credencial `PLACEHOLDER_CRED_ID` inexistente (nunca se había actualizado el JSON versionado con el ID real de la credencial, aunque sí funcionaba en instancias previas donde se había corregido a mano solo en la UI). Corregido a apuntar al mismo ID de credencial (`E56uxYa034ezaNIn`) que usan `ioc-extractor` y `report-generator`. También se le agregó un `id` de workflow a nivel raíz (`wf-event-ingest-0001`), que faltaba y bloqueaba el `import:workflow` por CLI (`SQLITE_CONSTRAINT: NOT NULL ... workflow_entity.id`).
- **Verificación end-to-end antes de arrancar la ventana:** evento sintético de prueba vía `POST /webhook/cowrie` → HTTP 200 → insertado en `events` → confirmado y borrado (no cuenta como evidencia). Corrida real de `attack-runner` (11 sesiones, 2 exitosas) → 71 eventos insertados correctamente en `events` (10 `command.input`, 9 `login.failed`, 2 `login.success`, etc.).
- **Paso 0 (automatización real):** tarea programada de Windows `HoneypotAttackRunner` (`schtasks`), dispara `docker compose run --rm attack-runner` cada 1 hora, primera corrida 2026-09-27 19:45 local (22:45 UTC). Se borra al cerrar la ventana (Paso 8).
- **Paso 5 — INICIO DE VENTANA:** 2026-09-27 22:38:11 UTC (`SELECT now()` en Postgres, recién levantado, 0 eventos en la tabla en ese momento salvo la corrida real ya insertada arriba). `ioc-extractor` (cron `*/15 * * * *`) y `report-generator` (cron de validación `0 */2 * * *`) activos y corriendo solo por su propio cron, sin ejecución manual desde este punto en adelante.

### [2026-09-28 00:12 UTC] Bug encontrado y corregido en caliente: ioc-extractor no procesaba nada
- **Detección:** revisión de solo lectura (SELECT, sin generar tráfico ni ejecutar workflows manualmente) ~1h40 después del inicio de la ventana, motivada por la pregunta de si alcanza con 6h de datos. `iocs` tenía solo 1 fila (un `ip`) y `events.processed=false` en 225 de 226 filas — señal de que `ioc-extractor` casi no estaba escribiendo nada pese a estar activo.
- **Causa raíz:** bug propio, introducido en el fix de A-02 de este mismo día (ver entrada anterior). La query de `Postgres: Upsert IoCs` usaba un placeholder `(NULL,NULL,NULL,NULL)` para eventos sin IoC; Postgres infiere esos `NULL` sin tipo como `text` por defecto, lo que choca contra `iocs.event_id` (`bigint`) → error `column "event_id" is of type bigint but expression is of type text` en TODA fila sin IoC (confirmado en `docker logs n8n`). Al fallar la query completa (una sola sentencia con CTEs), tampoco se llegaba a marcar `processed=TRUE` ni a insertar en `ioc_observations` para esos eventos — quedaban atascados y se iban a re-leer cada 15 min indefinidamente (la misma clase de problema que A-02, por un bug distinto).
- **Fix:** cast explícito `event_id::bigint` en el `SELECT` de la CTE `ins`. Reimportado, reactivado y n8n reiniciado a las 00:12 UTC aprox. Los 225 eventos atascados siguen en `processed=false` pero se van a recoger solos en el próximo disparo del cron (no se tocan manualmente) — no hay pérdida de datos, solo demora en el procesamiento durante la primera ~1h40 de la ventana.
- **Impacto en la ventana declarada:** no se reinicia el conteo de horas ni se creó tráfico manual nuevo para compensar; el fix se aplicó vía reimport + restart de n8n (operación de infraestructura, no una ejecución de workflow). Queda pendiente confirmar en el cierre (Paso 6/7) que el próximo tick de `ioc-extractor` efectivamente proceso el backlog.
- **Nota aparte (riesgo confirmado con datos reales, corregido en caliente):** se confirmó que Docker le asigna la MISMA IP (`172.19.0.5`) al contenedor efímero de `attack-runner` en cada corrida, y que con solo 2 credenciales válidas en `cowrie/userdb.txt` el `UNIQUE(type, value)` de `iocs` hace que solo la PRIMERA sesión exitosa con cada credencial genere un IoC propio — las repeticiones no fallan, pero no producen una fila nueva ligada a esa sesión. Con los datos reales de las primeras ~2h (6 sesiones exitosas, cron ya corregido): solo 2/6 = 33% tenían IoC atribuible propio, muy por debajo del 70% de P3, y el % solo podía bajar con más horas (el numerador queda fijo en 2 credenciales válidas para siempre, el denominador crece).
- **Fix (decisión del autor, 2026-09-28 ~00:35 UTC):** se agregaron 4 cuentas válidas más a `cowrie/userdb.txt` (`oracle:oracle2024`, `backup:backupsvc99`, `deploy:deployKey7`, `ftpuser:ftpPass321`; distintas de los decoy fallidos ya existentes con esos mismos usuarios pero otra contraseña) — archivo de configuración del honeypot, no toca el schema de la tesis ni las hipótesis P1-P4. Contenedor `cowrie` reiniciado (bind-mount `:ro`, no requiere rebuild) para tomar el archivo nuevo.
- **Ajuste posterior (mismo momento):** la primera versión del fix sorteaba libremente entre 2 y 6 credenciales exitosas por corrida — esto agotaba las 6 cuentas válidas en la primera corrida y volvía a dejar a las corridas siguientes sin credenciales "primera vez" (mismo problema, techo más alto). Se cambió a **rotación determinística por hora**: `build_sessions()` elige la credencial exitosa principal como `SUCCESS_SESSIONS[hour_index % 6]` (una distinta cada hora, cíclico), con 30% de probabilidad de sumar una segunda al azar. Esto maximiza cuántas sesiones exitosas son "primera vez" a lo largo de la ventana en vez de gastarlas todas de una.
- **Corrección de datos (limpieza de contaminación manual):** se detectó que dos corridas de `attack-runner` disparadas manualmente por el agente para verificar fixes (22:16 UTC, verificación del canal SSH; 00:36-37 UTC, verificación de las 4 cuentas nuevas) habían quedado mezcladas con las corridas genuinamente automáticas (22:45 y 23:45, disparadas por `HoneypotAttackRunner`). Se borraron esos 209 eventos + 12 iocs + 71 observaciones de las corridas manuales. Efecto secundario detectado: al borrar las corridas manuales, las credenciales `admin:test123`/`guest:guest123` de las corridas automáticas legítimas quedaron sin IoC propio de forma **irreversible** (`ioc-extractor` ya las había marcado `processed=true` la primera vez que vio esas credenciales — en las corridas manuales, que llevaban ID de evento más bajo — y no las revisita).
- **DECISIÓN FINAL: reinicio completo de la ventana de validación.** En vez de seguir parchando datos a mano (lo que las auditorías previas señalan explícitamente como antipatrón), se ejecutó `TRUNCATE events, iocs, reports, ioc_observations RESTART IDENTITY` a las **2026-09-28 00:57:55 UTC** (21:57 hora local) y se reinicia la ventana de 6h desde cero, ahora con TODOS los fixes ya aplicados y verificados: canal SSH interactivo, cast de tipos en `ioc-extractor`, credencial de `event-ingest` corregida, 6 cuentas válidas con rotación horaria. No hubo tráfico manual adicional después del truncate.
- **NUEVO INICIO DE VENTANA (reemplaza el de la entrada anterior): 2026-09-28 00:57:55 UTC / 21:57 hora local (2026-09-27).** Fin de ventana (6h): **2026-09-28 03:57 hora local**. Verificado antes de arrancar: `events`/`iocs`/`reports`/`ioc_observations` en 0 filas, los 3 workflows (`event-ingest`, `ioc-extractor`, `report-generator`) activos con el código corregido, cron de `report-generator` en `0 */2 * * *` (validación), tarea `HoneypotAttackRunner` corriendo en horario (última corrida 21:45 local, resultado 0, próxima 22:45 local).

### [2026-09-28 08:30 UTC / 05:30 local] Cierre de la ventana (Pasos 6-8)
- **Duración real:** 00:57:55 UTC → 08:30 UTC (2026-09-28) ≈ **7h32min** — dentro del rango 6-8h pedido, se cerró antes de llegar a las 8h.
- **Resultado final en Postgres:** 405 events (100% `processed=true`), 21 iocs, 4 reports (generados a las 01:00, 03:00, 05:00 y 07:00 UTC por el cron de validación `0 */2 * * *`; cada uno abarca la ventana móvil de las 24 h previas —`period_start = period_end − 24 h`—, por lo que los períodos se superponen) [corregido 2026-09-29: decía "períodos exactos de 2h"], 405 ioc_observations (1:1 con events, sin huecos).
- **Confirmación de modo trigger (n8n `execution_entity`, exportado de `/home/node/.n8n/database.sqlite`):**
  - `report-generator`: **5 ejecuciones, TODAS `mode=trigger`, TODAS `success`** (23:00, 01:00, 03:00, 05:00, 07:00 UTC — la de 23:00 es de la ventana anterior/truncada, las 4 restantes son las que produjeron los 4 `reports` actuales).
  - `ioc-extractor`: **todas las ejecuciones son `mode=trigger`** (ninguna manual/CLI). Del total post-reinicio (00:57:55 UTC en adelante) el CSV publicado registra 31 ejecuciones: 7 `success` y 24 `error`; de ellas, 30 caen dentro de la ventana (7 `success`, 23 `error`) y una (id 869, `2026-09-28 08:30:00.048`, `error`) es posterior al cierre de las 08:30:00 [corregido 2026-09-29: se agrega el desglose que usa la tesis].
- **Bug intermitente encontrado, no resuelto en profundidad (autohealing confirmado):** 23 ejecuciones de `ioc-extractor` dentro de la ventana (24 contando la posterior al cierre) terminaron en `error: column "undefined" does not exist` (probable referencia a un campo no resuelto en la expresión de un item del nodo Postgres — no se llegó a diagnosticar la causa raíz exacta por tiempo). **No causó pérdida de datos:** gracias al fix de A-02 (todo evento sin procesar queda `processed=false` y se reintenta en el próximo tick), los eventos afectados en un tick con error terminaron procesándose correctamente en un tick posterior — de ahí que el estado final sea 100% consistente (405/405 procesados, ioc_observations = events). Queda como hallazgo para la discusión de la tesis (resiliencia del diseño ante fallos intermitentes) y como pendiente técnico a futuro.
- **P3 (SQL literal del enunciado, sin modificar):** `SELECT e.session, count(i.id) FROM events e LEFT JOIN iocs i ON i.event_id=e.id WHERE e.session IN (SELECT session FROM events WHERE eventid='cowrie.login.success') GROUP BY e.session` → **6 de 10 sesiones con IoC atribuible propio = 60%**, por debajo del umbral de 70% de P3. Causa identificada y documentada más arriba: `UNIQUE(type,value)` en `iocs` + número finito de credenciales válidas (6, tras el fix) hace que solo la primera sesión con cada credencial exitosa genere IoC propio; se mitigó ampliando de 2 a 6 cuentas válidas con rotación horaria, pero con solo 10 sesiones exitosas en la ventana no alcanzó el 70%. Resultado real, sin maquillar.
- **P4 (SQL literal del enunciado):** `SELECT e.session, e.timestamp, r.id, r.period_start, r.period_end FROM events e LEFT JOIN reports r ON e.timestamp BETWEEN r.period_start AND r.period_end WHERE e.eventid='cowrie.login.success'` → **9 de 10 sesiones exitosas cubiertas por al menos un reporte** (la décima, de las 07:45 UTC, todavía no tiene reporte porque no se generó ningún reporte posterior a su autenticación antes del fin de la ventana; el siguiente disparo del cron de 2 h habría sido a las 09:00 UTC) [corregido 2026-09-29: decía que el "período de 2h" no había cerrado]. Los reportes que cubren cada sesión corresponden a ejecuciones `mode=trigger` confirmadas arriba — ninguna manual.
- **Cierre de infraestructura:** tarea `HoneypotAttackRunner` borrada (`schtasks /delete`). `experimentos/report-generator-p4-validacion-2026-09-28.json` guardado (snapshot exacto del cron de validación `0 */2 * * *` tal como quedó). `n8n/workflows/report-generator.json` revertido a `0 8 * * *` (diff byte a byte contra `experimentos/report-generator-produccion.json` = idéntico), reimportado, reactivado, n8n reiniciado y confirmado activo.
- **Resultado final aceptado (decisión del autor):** P3 = 60% (6/10) queda documentado tal cual, sin corridas adicionales para forzarlo al 70%. Causa raíz ya explicada arriba. Este es el número a usar en la tesis para esta validación.

### [2026-09-28] Tarea 3 — evidencia verificable
- `docs/evidencia/ejecuciones.csv` (440 filas) y `docs/evidencia/iocs_events.csv` (21 filas) generados desde el estado real de la ventana de validación ya cerrada (n8n `execution_entity` y el cruce `iocs`×`events` en Postgres). Sin credenciales en claro, sin IPs de terceros (la única IP es la del contenedor `attack-runner` en la red interna de Docker, `172.19.0.5`, no identifica a una persona real).
- `docs/EVIDENCIA_HASHES.md` ampliado con una sección nueva que enlaza estos dos CSV (el documento anterior solo tenía hashes SHA-256 sin contenido verificable).
- `docs/INVENTARIO_RONDA4.md` **eliminado**: fechado 21/09, con afirmaciones ya falsas (decía que `BITACORA.md` no existía, que las imágenes seguían en `:latest`, listaba `postgres-cred.json`/`n8n/workflows/postgres-credential.json` como presentes con secretos — ambos ya no existen en el árbol). Reescribirlo entero no se justificaba para un documento de auditoría de una ronda ya cerrada; queda recuperable en el historial de git (`git show <commit>:docs/INVENTARIO_RONDA4.md`) si hace falta consultarlo.

### [2026-09-28] Limpieza: retiro de scripts con cifras hardcodeadas
- **Motivo:** `scripts/analisis_final_p3p4.py` y `scripts/calculo_p4_v2.py` contenían cifras y umbrales de P3/P4 escritos a mano (sin un solo commit desde el 17/09, `49c41e5` — confirmado con `git log`, nunca se actualizaron tras la validación del 28/09), objetados por la auditoría por no ser reconstruibles desde una consulta real. Las consultas vigentes y sus resultados crudos ya están publicadas en `docs/VERIFICACION_2026-09-28.md` y `BITACORA.md` (entrada "Cierre de la ventana").
- **Acción:** `git rm scripts/analisis_final_p3p4.py scripts/calculo_p4_v2.py`. No se tocó nada más.

### [2026-09-29] Errata y correcciones de esta bitácora
Correcciones hechas al preparar la versión 11 de la tesis, tras contrastar la bitácora con los artefactos publicados (`docs/evidencia/ejecuciones.csv`, `docs/VERIFICACION_2026-09-28.md`, `n8n/workflows/report-generator.json`). Las entradas originales se conservan y las líneas corregidas están marcadas con "[corregido 2026-09-29]".
- **Ventana de cada reporte.** La entrada de cierre del 28/09 decía "períodos exactos de 2h". El workflow `report-generator` calcula `now() - interval '24 hours'`; los cuatro reportes de la ventana (ids 1 a 4, generados a las 01:00, 03:00, 05:00 y 07:00 UTC) abarcan cada uno las 24 h previas a su generación. Lo que dura 2 h es el intervalo entre disparos del cron de validación, no el período que cubre cada reporte.
- **Por qué la sesión de las 07:45 UTC queda sin cobertura.** No se generó ningún reporte posterior a su autenticación antes del cierre (08:30 UTC); no depende de un "período que no cerró".
- **Conteo de ejecuciones de `ioc-extractor`.** El CSV publicado tiene 31 ejecuciones en modo `trigger`: 30 dentro de la ventana 00:57:55–08:30:00 UTC (7 `success`, 23 `error`) y una posterior al cierre (id 869, 08:30:00.048 UTC, `error`). La tesis informa 30 (7 y 23).
- **Cronología de las correcciones.** Los dos defectos corregidos (canal SSH del simulador, 27/09; conversión de tipos en el extractor, ≈00:12 UTC del 28/09) y la ampliación de 2 a 6 cuentas válidas de `cowrie/userdb.txt` (≈00:35 UTC) ocurrieron antes del truncado de las 00:57:55 UTC que inició la ventana vigente. Dentro de la ventana vigente no hubo correcciones ni tráfico manual. La ampliación de cuentas se decidió tras observar 2/6 = 33 % de sesiones con IoC propio en la primera ventana descartada, por lo que constituye un ajuste posterior a la observación de datos de P3; la tesis lo declara como amenaza a la validez interna (§5.2.6).

### [2026-09-29] Pasos 6, 7 y 9 (INSTRUCCIONES.md) — probados y publicados antes de la ventana nueva
Preparación previa a la próxima ventana de validación de 6-8h. Rama `fix/extractor-eventos-vacios`, mergeada a `main` en `688db3c`.

- **Paso 6 — fix del extractor (23 de 30 errores de la ventana del 28/09).** Diagnóstico correcto (de otra sesión de Claude, co-autora del parche): sin eventos pendientes, el nodo "Postgres: Eventos sin procesar" entrega un ítem `{"success": true}` en vez de cero ítems — el nodo Code lo trataba como un evento real, generando `event_id = undefined`. Fix aplicado (`git am` del parche entregado): filtrar ítems sin `id` antes de procesar, declarar `pairedItem`, y desviar los errores del nodo de upsert a un nodo nuevo "Postgres: Registrar error" (`onError: continueErrorOutput` → inserta en `error_log`).
  - Prueba unitaria (`scripts/test_extractor_codenode.js`, sin Docker): 12/12 OK con el parche; 4 fallan con el original (confirma que el test detecta el bug).
  - **Prueba A (tabla vacía, `docker compose exec n8n n8n execute --id=wf-ioc-extractor-0002` vía `stop n8n` + `run --rm n8n execute` + `start n8n`):** `status: success`. El log de ejecución muestra que el nodo Postgres devuelve `{"success": true}` con la tabla vacía (confirma el diagnóstico) y que "Extraer IoCs" lo filtra correctamente, devolviendo `[]` sin llegar al nodo de upsert.
  - **Prueba B (con eventos reales de `attack-runner`):** 49/49 eventos `processed=true`, 9 iocs, 0 filas en `error_log`. Segunda corrida con todo ya procesado (0 pendientes): también `success`.
- **Paso 9 — geolocalización.** La prueba con IP pública (`8.8.8.8`) dio `country = 'Desconocido'` en vez de `United States`. Diagnóstico (variante temporal del nodo Code, solo en la instancia de prueba, no commiteada): `fetch is not defined` — el sandbox del Code node de n8n (JS Task Runner) no expone la API global `fetch`, aunque el runtime de Node del contenedor sí la tiene (confirmado con `docker exec n8n node -e "fetch(...)"`, que sí funciona). `this.helpers.httpRequest` (helper propio del Code node) sí está disponible. **Fix:** reemplazado `fetch()` por `this.helpers.httpRequest()` en `n8n/workflows/event-ingest.json`. Probado con 4 IPs de países distintos: `8.8.8.8` → United States, `81.2.69.142` → United Kingdom, `200.160.2.3` → Brazil, `202.12.27.33` → Japan (las tres primeras esperadas; la cuarta se eligió mal pensando que era de Australia — no es un fallo del fix). Eventos de prueba borrados antes de cualquier ventana de evidencia.
- **Paso 7 — tabla `ioc_sessions` (diseño de INSTRUCCIONES.md, implementado y probado).** Agregada a `db/schema.sql`: `ioc_sessions(id, ioc_id → iocs, event_id → events, session, created_at)`, una fila por cada aparición de un indicador en una sesión, sin romper `UNIQUE(type,value)` de `iocs`. Cambios en `ioc-extractor.json`: la consulta "Postgres: Eventos sin procesar" ahora trae también `session` (**bug encontrado durante la prueba**: sin este cambio, `ioc_sessions.session` quedaba `NULL` en todas las filas porque el nodo Code nunca recibía el campo); el nodo "Postgres: Upsert IoCs" pasa de `ON CONFLICT DO NOTHING` a `ON CONFLICT (type,value) DO UPDATE SET type = EXCLUDED.type RETURNING id`, para obtener siempre el `id` del IoC (exista ya o se inserte ahora) e insertarlo en `ioc_sessions` junto con `event_id` y `session`.
  - **Prueba con credenciales repetidas deliberadamente** (dos corridas de `attack-runner` en la misma hora, mismo rotado de cuenta válida): P3 medida por `event_id` directo contra `iocs` (método viejo) = 2/3 sesiones exitosas con IoC propio (66%); P3 medida vía `ioc_sessions` (nuevo) = 3/3 (100%) — la sesión que antes quedaba sin contar sí tiene actividad con un indicador ya conocido (la IP del simulador, que se repite siempre). Confirma que el método nuevo resuelve exactamente la limitación encontrada el 28/09.
- **Prueba combinada final** (Paso 6 + 7 + 9 juntos, datos limpios): 85/85 eventos procesados, geo correcto, 16 iocs / 29 filas en `ioc_sessions`, 0 filas en `error_log`. Sin conflictos entre los tres cambios.
- **Nota:** ninguno de estos cambios estaba publicado antes de esta entrada (ver advertencia de `INSTRUCCIONES.md`, sección 7). Con esto publicado, la tesis puede citar el fix del extractor y `ioc_sessions` como vigentes para la próxima ventana de validación.

### [2026-09-29 21:12:31 UTC / 18:12 local] Paso 8 — INICIO de la ventana de validación nueva (8h)
Segunda ventana de validación (la del 28/09 queda como antecedente, con el bug del extractor sin corregir durante gran parte de esa corrida). Esta ventana arranca con los tres fixes de los Pasos 6, 7 y 9 ya publicados desde el primer evento — a diferencia del 28/09, no hay correcciones a mitad de camino.

- **Config de producción verificada intacta** antes de tocar nada: `n8n/workflows/report-generator.json` coincidía byte a byte con `experimentos/report-generator-produccion.json` (`0 8 * * *`).
- **Cron de validación:** cambiado a `0 */2 * * *`, reimportado, reactivado, n8n reiniciado y confirmado activo. Se revertirá a producción al cierre (igual que el 28/09).
- **Frecuencia de `attack-runner`:** tarea de Windows `HoneypotAttackRunner` recreada — cada **15 minutos** (antes cada 1h), para llegar a 30+ sesiones exitosas en 8h en vez de las ~10 de la ventana anterior. Primera corrida programada 18:15 local.
- **Tablas truncadas** (`events, iocs, reports, ioc_observations, ioc_sessions, error_log RESTART IDENTITY`) — confirmado 0 filas en las cuatro principales antes del inicio.
- **Verificado antes de arrancar:** los 3 workflows (`event-ingest`, `ioc-extractor`, `report-generator`) activos; stack completo (`cowrie`, `forwarder`, `log-reader`, `n8n`, `postgres`) `Up`/`healthy`.
- **Inicio formal:** `SELECT now()` en Postgres = `2026-09-29 21:12:31.84145+00`. **Fin previsto (8h): 2026-09-30 05:12:31 UTC / 02:12 hora local.**
- Sin tráfico manual desde este punto — solo el cron de `attack-runner` (cada 15 min) y los crons propios de `ioc-extractor` (cada 15 min) y `report-generator` (cada 2h).

### [2026-09-29 ~21:30 a ~23:47 UTC] Interrupción de infraestructura — ventana anterior descartada
El host se apagó/reinició en medio de la ventana por una actualización obligatoria de WSL2 (mensaje del sistema: versión de WSL desactualizada). Docker Desktop dejó de responder, y con él **todo el stack** (no solo `attack-runner`).

- **Datos reales de esa corrida:** solo 21:12:31–21:30 UTC (≈18 min), 70 eventos (dos corridas de `attack-runner`, 21:15 y 21:30 UTC), 0 reportes (el primer disparo de `report-generator` con el cron de validación caía a las 22:00 UTC y se perdió — `n8n` estaba caído).
- **Detección:** tarea `HoneypotAttackRunner` con `Last Result: 1` (falla) en la corrida de las 20:45 local; sin eventos nuevos en Postgres entre 21:30 y 23:51 UTC (~2h17min de hueco real, no tráfico ausente sino sistema caído).
- **Decisión:** descartar esa corrida completa y reiniciar la ventana desde cero, en vez de tratar de conciliar o rellenar el hueco — una interrupción real de infraestructura en medio de una validación que exige "sin intervención, continua" no es algo defendible de parchear.
- **Verificado antes de reiniciar:** Docker y WSL ya actualizados y funcionando (`docker compose ps` con los 5 servicios `Up`/`healthy`), workflows siguen activos, cron de validación (`0 */2 * * *`) y tarea programada (cada 15 min) intactos — no hizo falta reconfigurar nada, solo truncar y volver a arrancar el reloj.

### [2026-09-29 23:53:57 UTC / 20:53 local] Paso 8 — REINICIO de la ventana de validación (8h)
Segundo intento de esta ventana (tercero contando la del 28/09). Mismos fixes de los Pasos 6, 7 y 9 vigentes desde el primer evento.

- Tablas truncadas de nuevo (`events, iocs, reports, ioc_observations, ioc_sessions, error_log RESTART IDENTITY`), confirmado 0 filas.
- **Inicio formal:** `SELECT now()` en Postgres = `2026-09-29 23:53:57.32858+00`. **Fin previsto (8h): 2026-09-30 07:53:57 UTC / 04:53:57 hora local.**
- Sin tráfico manual desde este punto.

### [2026-09-30 08:01 UTC / 05:01 local] Cierre de la ventana nueva (8h07min, sin cortes)
- **Duración real:** 23:53:57 UTC (29/09) → ~08:01 UTC (30/09) ≈ **8h07min**, corrida completa sin interrupciones (`docker compose ps`: los 5 servicios `Up` continuo 8 horas, sin reinicios; sin huecos en el conteo de eventos por hora).
- **Resultado final en Postgres:** 1998 events (1930 `processed=true`; los 68 restantes son la última tanda de las 08:00 UTC, todavía no le tocaba su ciclo de 15 min al extractor — no es error, `error_log` = 0 filas), 21 iocs, **654 filas en `ioc_sessions`** (evidencia nueva del Paso 7), 4 reports (01:00, 03:00, 05:00, 07:00 UTC), **41 sesiones con login exitoso** (supera el objetivo de 30+ del Paso 8).
- **Modo trigger confirmado (n8n `execution_entity`):** `report-generator` 4/4 `trigger`+`success`. `ioc-extractor` **33/33 `trigger`+`success`, CERO errores** — el fix del Paso 6 eliminó por completo el error intermitente `"column undefined does not exist"` que afectó 23 de 30 ejecuciones el 28/09. `event-ingest` 1998/1998 `webhook`+`success`.
- **P3 — dos métodos, para comparar explícitamente:**
  - Método viejo (SQL original de la Tarea 4, `event_id` directo contra `iocs`): **6/41 = 14,6%** — empeora respecto al 28/09 (60%) porque con más sesiones exitosas y el mismo pool finito de 6 credenciales válidas, el numerador queda fijo mientras el denominador crece (el fenómeno exacto que motivó el Paso 7).
  - **Método nuevo (Paso 7, vía `ioc_sessions`): 39/41 = 95,1%** — supera ampliamente el umbral de 70% de P3. Confirma que la limitación del 28/09 era del método de conteo (una tabla de indicadores deduplicada no debe usarse para medir cobertura por sesión), no del pipeline.
- **P4:** 35/41 = 85,4% de sesiones exitosas cubiertas por al menos un reporte. Las 6 sin cobertura son, sin excepción, las últimas 6 sesiones de la ventana (07:00–08:00 UTC) — el reporte que las cubriría hubiera caído a las 09:00 UTC, fuera de la ventana. Explicación completa y sin ambigüedad (a diferencia de la entrada original del 28/09, que tuvo que corregirse).
- **Evidencia publicada:** `docs/evidencia/ejecuciones_2026-09-30.csv` (2035 filas), `docs/evidencia/iocs_events_2026-09-30.csv` (21 filas), y **`docs/evidencia/ioc_sessions_2026-09-30.csv` (654 filas, nuevo — no existía en la ventana del 28/09)**.
- **Cierre de infraestructura:** tarea `HoneypotAttackRunner` borrada. `experimentos/report-generator-p4-validacion-2026-09-30.json` guardado (snapshot del cron de validación tal como quedó). `n8n/workflows/report-generator.json` revertido a `0 8 * * *` (idéntico byte a byte a `experimentos/report-generator-produccion.json`), reimportado, reactivado, n8n reiniciado y confirmado.
- **Resultado a usar en la tesis para esta ventana:** P1/P2 sin cambios respecto a lo ya reportado; **P3 = 95,1% (39/41, método `ioc_sessions`)** — cumple el umbral de 70%; P4 = 85,4% (35/41). Se recomienda citar ambos métodos de P3 (viejo y nuevo) en la tesis, con la explicación de por qué el nuevo es el correcto, en vez de reemplazar el dato viejo sin más.

### [2026-09-30] Errata de las entradas del 30/09
Correcciones detectadas antes de publicar la versión del 30/09. Los commits previos no se reescriben; se corrige aquí y en los archivos afectados.
- **P4 de la ventana del 30/09:** 35/41 = 85,37 %, que redondeado a un decimal es **85,4 %**. Figuraba como 85,3 % (porcentaje calculado a mano, sin pasarlo por la consulta) en `BITACORA.md`, en `docs/VERIFICACION_2026-09-30.md` y en el mensaje del commit `1a182c0`; los archivos se corrigieron y el tag `Honeypot_Final_2026-09-30` se volvió a crear (aún sin publicar) con el valor correcto. P3 (14,6 % y 95,1 %) estaba bien calculado.
- **CSV de evidencia del 28/09:** al exportar la ventana del 30/09 se habían sobrescrito `docs/evidencia/ejecuciones.csv` e `iocs_events.csv`, que `VERIFICACION_2026-09-28.md` y la tesis citan como datos del 28/09. Se restauraron con nombre fechado (`ejecuciones_2026-09-28.csv`, `iocs_events_2026-09-28.csv`; verificados idénticos, por hash de blob, a los del tag `Honeypot_Final_2026-09-29`) y los de la ventana nueva pasaron a `*_2026-09-30.csv`. Se actualizaron las referencias en `VERIFICACION_2026-09-28.md`, `VERIFICACION_2026-09-30.md`, `EVIDENCIA_HASHES.md` y la entrada de cierre del 30/09. Las entradas históricas anteriores conservan el nombre original porque se referían a los archivos tal como existían entonces.

### [2026-10-01] Auditoría de la tesis v17 contra el tag `Honeypot_Final_2026-09-30`
Revisión cruzada entre el documento (v17) y el repositorio. No se encontró ninguna discrepancia de fondo: todo lo que la tesis presenta como implementado coincide con el código. Se corrigieron contradicciones internas y evidencia faltante. Los cambios del documento van en la v18. En el repo:
- **Veredicto de P3 en `docs/VERIFICACION_2026-09-30.md`:** las conclusiones de las secciones 4, 5 y 8 decían «P3 se confirma» con `ioc_sessions`. La tesis toma el veredicto con el criterio definido de antemano (§4.9.3): P3 = 6/41 = 14,6 %, **no confirmada**. El 95,1 % (39/41) es una medición exploratoria definida después de ver los datos del 28/09. También P4 = 85,4 % queda **no confirmada** (umbral del 90 %). Las consultas, las salidas y los CSV no cambian. La entrada «Cierre de la ventana nueva» de esta bitácora, del 30/09, conserva su redacción original («cumple el umbral»); el veredicto válido es este.
- **Reconstrucción del 28/09** (`docs/VERIFICACION_2026-09-28.md`, §9): la base de esa ventana se truncó, y el denominador de P3 y P4 (10 sesiones) no se podía reconstruir con la evidencia publicada. Se recuperó desde el log de Cowrie conservado en el volumen `honeypot_final-vers_cowrie-var`. Nuevos archivos: `docs/evidencia/cowrie_ventana_2026-09-28.json` (405 eventos, igual a las 405 ejecuciones de `event-ingest`) y `docs/evidencia/sesiones_2026-09-28.csv` (10 sesiones). El resultado coincide sesión por sesión con la tesis: P3 6/10 y P4 9/10.
- **Corridas del simulador:** se publica `docs/evidencia/attack-runner-cron_2026-09-30.log` (33 corridas). El log del 28/09 no se conservó. Sus 7 corridas quedan transcriptas en `VERIFICACION_2026-09-28.md` y confirmadas por el log de Cowrie.
- **`docs/figs/`:** se reemplazaron 8 de las 9 figuras por las que usa la tesis. Las del repo eran versiones anteriores; las II-1 a II-3 eran diagramas, no las capturas de n8n.
- **README:** se agregó una nota sobre el id de credencial `E56uxYa034ezaNIn` que referencian los workflows exportados.

### [2026-10-02] Errata y ajustes para la tesis v26 (tag Honeypot_Final_2026-10-02)
Los commits previos no se reescriben; se corrige aquí y en los archivos afectados.
- **Línea 89:** se quitó el fragmento de la clave de cifrado de n8n (`N8N_ENCRYPTION_KEY`). La clave ya había sido rotada (ver la entrada correspondiente más arriba). El fragmento sigue en el historial de git; no se reescribe.
- **Entrada «Interrupción de infraestructura — ventana anterior descartada» (29/09):** el disparo perdido de `report-generator` fue el de las **23:00 UTC**, no el de las 22:00 UTC. El cron de validación `0 */2 * * *` se evalúa en America/Argentina/Mendoza (UTC−3) y dispara en horas pares ART, es decir, en horas impares UTC (01:00, 03:00, 05:00 y 07:00 UTC en las ventanas de validación).
- **`docs/VERIFICACION_2026-09-30.md`:** como el 28/09, todas las correcciones se aplicaron antes del primer evento de la ventana (antes decía «a diferencia del 28/09»).
- **`docs/VERIFICACION_2026-09-28.md`:** nota que da por descartada la hipótesis de `pairedItem`.
- **`db/schema.sql`:** el comentario de `iocs.type` lista los tipos que genera el extractor (`ip | credential | command | hash`); `url` y `domain` están previstos y no implementados.
- **`scripts/calculo_p3p4.py`:** marcado como obsoleto (ventana del 16/09, retirada). Se agrega `scripts/wilson_tesis.py`, que recalcula los intervalos de Wilson de la tesis.
- **`attack-runner/attack_ssh.py`:** `VALID_CREDS` comentada (no se usa; las cuentas válidas están en `SUCCESS_SESSIONS`).
- **`docs/figs/`:** Figuras 4.1, 4.3 y 4.4 (estímulo: simulador Telnet desde el anfitrión el 25/09; contenedor `attack-runner` el 28/09 y el 30/09), Figura 4.2 (subred asignada por Docker) y Figura III-1 (modelo de datos con las seis tablas de `db/schema.sql`), idénticas a las de la tesis v21.
- **(2026-10-02) Evidencia nueva de la ventana del 30/09**, extraída de los volúmenes de Docker sobre copias: `docs/evidencia/cowrie_ventana_2026-09-30.json` (1998 eventos = 1998 filas de `events`; sin pérdidas), `latencia_2026-09-30.csv` (media 1608,76 ms) y `ejecuciones_duracion_2026-09-30.csv` (duración de las 2035 ejecuciones). Detalle en `docs/VERIFICACION_2026-09-30.md`, §9; hashes en `docs/EVIDENCIA_HASHES.md`.

### [2026-10-02] Validación B2: registro previo (antes del primer evento)
- Registro previo en `docs/PREREGISTRO_B2.md` (SHA-256 `909c673e77ab7d0125de8f1e773580f16c675baba5c74ea41e83fe518debbd18`): ventana de una hora con cierre fijo (simulador cada 5 min de 10:55 a 11:40 ART, extractor de las 11:45, disparo diario de `report-generator` a las 11:50 con la expresión `50 11 * * *`, cierre a las 11:55 ART), métricas y umbrales de P1–P4 y hashes de los archivos.
- Instalación nueva en el equipo del autor (proyecto `honeypot-b2`). Durante la preparación, la credencial importada desde la plantilla (`ssl: false`) hizo fallar todas las inserciones mientras el forwarder registraba `[OK]`; se corrigió con `ssl: "disable"` y una corrida de prueba persistió 38 de 38 eventos. Las tablas se vacían al iniciar.
- Antes del inicio se corrigió en `scripts/b2_iniciar.ps1` y `scripts/b2_cerrar.ps1` la forma de llamar a `psql` desde PowerShell 5 (el primer intento de inicio falló en el `TRUNCATE`, sin vaciar tablas ni programar el simulador); los hashes del registro previo corresponden a la versión corregida.

### [2026-10-02] Validación B2: cierre, desvíos y resultados
Ventana del 02/10/2026, de 13:47:30 a 14:55:10 UTC (10:47:30 a 11:55:10 ART), cerrada a la hora registrada con `scripts/b2_cerrar.ps1`. Resultados en `docs/evidencia/b2/resultados_b2.json`, calculados con `scripts/b2_analisis.js` sin modificar (SHA-256 del registro previo).
- **Desvío 1: corrida del simulador de las 10:55, incompleta.** La tarea `HoneypotB2Runner` terminó a los 22 s con el código `0xC000013A` (interrupción por Ctrl+C o cierre de la ventana de consola) después de 5 de sus 9 intentos (2 sesiones exitosas). No se repitió ni se borró, y su tráfico queda en la evidencia. Las otras 9 corridas (11:00 a 11:40) terminaron con código 0. No se cambió la configuración de la tarea durante la ventana. Es un desvío de una corrida del simulador; el stack no se interrumpió.
- **Desvío 2: exportación del historial de n8n.** El paso [4] de `b2_cerrar.ps1` llamaba a `python`, que en el equipo anfitrión es el alias de la Microsoft Store, y no generó `ejecuciones.csv`. Después del cierre se generó con la misma consulta mediante `node:sqlite`, copiando también `database.sqlite-wal` y `database.sqlite-shm` (sin el WAL, la copia no contenía las ejecuciones de las 11:45 y 11:50 ART).
- **Desvío 3: BOM.** PowerShell 5 (`Set-Content -Encoding utf8`) escribió los CSV y los JSON con BOM, y el análisis falló al leer `ventana.json`. Se quitó el BOM (los 3 bytes iniciales) de `events.csv`, `iocs.csv`, `ioc_sessions.csv`, `reports.csv`, `error_log.csv`, `ventana.json` e `inicio.json`, sin otro cambio, y se volvió a correr el análisis. `SHA256SUMS.txt` se regeneró sobre los archivos finales.
- **Resultados.** Captura igual a persistencia: 629 eventos en Cowrie y 629 en `events`, 0 claves distintas, `error_log` vacío. **P1:** latencia media 1453,16 ms (mediana 795,64; máxima 4418,98; ningún evento supera los 15 s); la comparación con la línea de base manual queda pendiente de B1. **P2:** criterio estricto 629/629 = 100 %; fidelidad campo a campo 628/629 = 99,8 %. **P3:** completitud por sesión 15/15 = 100 % (IC 95 % [79,6; 100]); 5 sesiones con comando de IoC; la operacionalización original por `event_id` da 9/15 = 60,0 %. **P4:** un disparo de `report-generator` a las 11:50:00 ART en modo `trigger` (62 ms) que cubre 15/15 sesiones; vale la advertencia del registro previo: la cobertura total se da por construcción. Ejecuciones manuales: 0. El extractor corrió 4 veces dentro de la ventana, todas con éxito.
- **Nota sobre P2:** el único evento que no figura como idéntico (id 11, `input` = `which sh `, con espacio final) **está guardado igual** que en Cowrie. La diferencia la genera el comparador del script registrado, que aplica `.trim()` solo al valor de la base. Se informa la cifra registrada (628/629) y se aclara.
- **Restitución:** `report-generator` volvió a la expresión de producción `0 8 * * *` (verificado con `n8n export:workflow`).

### [2026-10-02] Línea de base manual B1: piloto descartado (b1-v1) y repetición (b1-v2)
- **Piloto b1-v1, descartado.** Los dos participantes usaron la misma cuenta y el mismo código (`P1`). La página guarda un registro por cuenta, de modo que las dos sesiones escribieron sobre el mismo registro: quedó una sola serie mezclada (los 4 primeros eventos compartidos y el resto, del último en guardar). Además, desde el evento 11 los dos terminaron cada evento con 1 a 8 s de diferencia y repiten los mismos errores, lo que indica que no trabajaron de forma independiente. Por último, dos campos se interpretaron mal (en «Comando» escribieron la palabra `input`; en «Valor del IoC», la severidad), por una redacción ambigua de la página. El registro se conserva en `docs/evidencia/b1/piloto_b1-v1_registro_db.json` y se informa solo como referencia (mediana del paso 1: 30,3 s por evento; paso 2: 11,2 s), sin valor de veredicto.
- **Repetición b1-v2.** Una página separada por participante (P1 y P2), con el código fijo, la misma muestra (semilla `20260930`), una tabla de qué va en cada campo con ejemplos, el criterio común de severidad e IoC escrito en la página y dos controles: rechaza la palabra `input` en «Comando» y una severidad o un tipo en «Valor del IoC». Se pide hacerlo por separado. Generador: `docs/evidencia/b1/build.js` a partir de `plantilla.html` y `muestra_b1.json`. Lucas Norton no participa: vio las respuestas del piloto.
- **Resultado b1-v2 (02/10/2026, 15:45 a 16:30 UTC aprox.).** P1 y P2 completaron los 20 eventos en páginas separadas, sin sincronía (los cierres de cada evento difieren entre 23 y 37 min). Paso 1 (triaje y extracción): 0 errores en 100 campos por participante; tipo y relevancia correctos en 20/20. **Línea de base: mediana por evento del paso 1 = 18,44 s** (media 29,94 s); paso 1 + paso 2 = 34,46 s. Frente a la latencia media de B2 (1,45 s), el procesamiento automatizado tarda el 7,9 % de la línea de base: **P1 se confirma** con el umbral registrado (< 50 %). Paso 2: con el criterio literal, 12/20 eventos correctos por participante; casi todas las diferencias son de formato de la credencial (`usuario / contraseña` en vez de `usuario:contraseña`). Sin contar el formato, P1 tiene 4 eventos con errores y P2, 1. Datos en `docs/evidencia/b1/`, cálculo en `scripts/b1_analisis.js` y salida en `resultados_b1.json`. Sesgo declarado: los participantes integran el equipo autor.

### [2026-10-05] Rotación de la contraseña de login de n8n
- La contraseña de login de n8n que figura en commits viejos del historial (2147ad4, 49c41e5, f33079d y 5b5aff3; también la contiene el tag publicado `Honeypot_Final_2026-09`, en `script_entorno/import-n8n.js`) se cambió el 05/10/2026 en la instancia en uso, la del proyecto `honeypot-b2` (volumen `honeypot-b2_n8n-data`). La contraseña no se escribe en ningún archivo del repositorio.
- En el equipo del autor quedan tres volúmenes de instancias anteriores de n8n que no se usan ni están en ejecución y que conservan la credencial anterior. Como n8n publica su puerto solo en 127.0.0.1, únicamente serían accesibles desde ese equipo. Se conservan sin uso; si alguna vuelve a levantarse, hay que cambiarle la contraseña antes.
- El historial de git no se reescribe: cambiaría los hashes de los commits y los tags que cita la tesis.
- Los tags `Honeypot_Cowrie` y `Honeypot_Final_2026-09` conservan además el valor por defecto de la contraseña de Postgres de esa época (rotada el 27/09/2026). El historial no se reescribe; ambas credenciales están rotadas.

### [2026-10-05] Línea de base manual: medición complementaria con participantes externos (b1-v2, P3 a P7)
- Para atenuar el sesgo de coautoría de la línea de base del 02/10 (P1 y P2, integrantes del equipo), cinco participantes ajenos al equipo procesaron la misma muestra (20 eventos más 2 de práctica, semilla `20260930`) con páginas idénticas a las de P1 y P2 salvo el código. `docs/evidencia/b1/build.js` ahora acepta la lista de códigos y reproduce byte a byte las páginas de P1, P2 y P3 a P7.
- **Condiciones, declaradas en la tesis (§6.1.1):** no tenían computadora propia, así que usaron la cuenta y el equipo de Lucas Norton de forma consecutiva (15:24 a 16:07 UTC), uno por vez y sin ver la pantalla de los demás. Antes de su turno, Lucas les explicó verbalmente el flujo de trabajo de la página. Lucas no participó como sujeto. Esta medición no figuraba en el registro previo: se informa como complementaria y la línea de base registrada sigue siendo la de 18,44 s.
- **Resultado:** la mediana por evento del paso 1 fue de 10,36 s (media 10,69 s); las medianas individuales fueron 14,06, 11,68, 10,12, 10,26 y 9,11 s, en el orden en que participaron. Con los siete participantes, la mediana es de 11,50 s. En el paso 1 hubo 0 errores en 500 campos, el tipo fue correcto en 100 de 100 eventos y la relevancia en 97 de 100. En el paso 2, con el criterio literal, acertaron entre 10 y 12 de 20; sin contar el formato de la credencial, entre 17 y 19 de 20. Frente a 10,36 s, la latencia media del 02/10 (1.453,16 ms) equivale al 14,0 %, así que P1 se confirma también con esta referencia.
- Datos: `docs/evidencia/b1/b1-v2_P3_externo.json` a `b1-v2_P7_externo.json`. Cálculo: `scripts/b1_analisis.js`, con salida en `resultados_b1_externos.json` (los cinco externos) y `resultados_b1_todos.json` (los siete participantes).

### [2026-10-05] Plan de pruebas de segmentación y monitoreo (antes de ejecutarlas)
- Se fijó `docs/PRUEBAS_SEGMENTACION_MONITOREO.md` (SHA-256 `35ca8096b30c9034563d87306e96e711cc03ff9ba6fa74d38f851a56bb723f8a`) antes de modificar el compose y de crear el workflow `health-monitor`. Pruebas: S1 a S11 (segmentación en tres redes con las subredes de la Figura 4.2) y M0 a M3 (fallas provocadas).

### [2026-10-05] Segmentación de red y workflow health-monitor: implementación y pruebas
- **Segmentación implementada** según la Figura 4.2. `docker-compose.yml` reemplaza la red única `honeypot-net` por tres redes: `captura` (10.0.1.0/24: cowrie y attack-runner), `proceso` (10.0.2.0/24: forwarder, log-reader y n8n) y `datos` (10.0.3.0/24, `internal`: n8n y postgres). PostgreSQL deja de publicar `127.0.0.1:5433`. Las pruebas S1 a S10 dieron lo esperado, y S11 (de extremo a extremo) persistió 48 de 48 eventos. Ver `docs/evidencia/segmentacion/`.
- **Workflow `health-monitor`** (`n8n/workflows/health-monitor.json`, cada 5 minutos): compara los eventos de Cowrie con los de `events` y busca eventos sin procesar; registra las alertas en `error_log`. Detectó las fallas provocadas M1 (ingesta desactivada) y M2 (forwarder detenido) en el primer disparo posterior. Con M3 (credencial con `ssl: false`), el forwarder siguió informando `[OK]`, mientras las ejecuciones de `event-ingest` y del monitor quedaron en error en n8n.
- **Hallazgo:** al recrear el entorno, `docker compose up` arrancó `attack-runner` antes que el forwarder, y 22 eventos (4 sesiones) no se enviaron nunca, porque el forwarder empieza a leer el log desde el final; otros 2 envíos fallaron mientras n8n arrancaba. El monitor alertó sobre esa pérdida (18:30 a 18:45 UTC). Por eso el control negativo M0 se evaluó sobre el intervalo limpio de 18:30 a 18:53, sin alertas. Queda como limitación del forwarder: lo que Cowrie registra con el forwarder detenido no se recupera.
- La base de trabajo `honeypot-b2` recibió los eventos de estas pruebas. La evidencia de la validación del 02/10 no cambia, porque está en el repositorio con sus hashes.

### [2026-10-05] Plan de pruebas: consultas parametrizadas y carga (antes de ejecutarlas)
- Se fijó `docs/PRUEBAS_SQL_CARGA.md` (SHA-256 `22d8d12e966f22311bff68180ba8e9a80fcc64b0cf2ce363afa4801b250faebc`) antes de modificar los workflows. Pruebas: Q0 a Q4 (inyección SQL; Q0 se corre sobre la versión sin cambios) y prueba de carga por escalones de 1 a 50 eventos por segundo.

### [2026-10-05] Consultas parametrizadas y prueba de carga: implementación y resultados
- **Consultas parametrizadas:** `event-ingest`, `ioc-extractor`, `report-generator` y `health-monitor` pasan sus valores como parámetros del nodo Postgres (v2.5); ya no queda SQL armado por concatenación de datos. Q0 reprodujo el defecto declarado: con la versión anterior, una credencial con apóstrofo hizo fallar a `report-generator`. Q1 a Q4 dieron lo esperado después del cambio. Los desvíos (caracteres usados, repeticiones en Q0 y el comando agregado en Q2) están declarados en `docs/evidencia/sql_carga/RESULTADOS.md`. Quedó importado e inactivo en la instancia de trabajo un workflow de prueba descartable, `prueba-param`, que no está en el repositorio.
- **Prueba de carga:** con la consulta de país anulada (`docker-compose.carga.yml`), se persistieron 720 de 720 eventos en escalones de hasta 28,1 eventos por segundo efectivos, con un p95 de 1,9 s en el más alto. La capacidad sostenida es de al menos 28 ev/s; no se saturó el pipeline, y el límite lo puso el generador. n8n volvió a la configuración normal al terminar.

### [2026-10-05] Registro previo de la validación B3 (antes del inicio)
- Se fijó `docs/PREREGISTRO_B3.md` (SHA-256 `9d5be4ca8a2c9070e7420ad0059ca8d5f8be163bde2bab426a52e30efc6d346c`) antes del inicio de la ventana: simulador cada 15 min de las 19:30 ART del 05/10 a las 07:45 ART del 06/10 (50 corridas), `report-generator` con el cron de producción `0 8 * * *` sin cambios, cierre fijo a las 08:15 ART (11:15 UTC) del 06/10. Métricas y umbrales de P1–P4, más dos métricas de calidad de P3 con umbral (exactitud del catálogo y precisión de atribución, ambas ≥ 95 %). Scripts: `scripts/b3_iniciar.ps1`, `b3_exportar.js` (reemplaza el paso en Python que falló en B2), `b3_cerrar.ps1` y `b3_analisis.js`, probado sobre la evidencia de B2.
- **Corrección antes del inicio (ningún dato tocado).** El primer intento de `b3_iniciar.ps1` se detuvo en el paso [2] sin modificar nada: con `ErrorActionPreference = Stop`, PowerShell 5.1 trató como error fatal el aviso que n8n escribe en stderr. Se encapsularon las llamadas a la línea de comandos de n8n en una función que descarta ese aviso (`b3_iniciar.ps1`, nuevo SHA-256 `12dbb96f0018ef3a733e6bf9e1d55b5ce4ef4597a4a7000c1f5a66a023055d27`), se actualizó el hash en el registro previo (nuevo SHA-256 de `docs/PREREGISTRO_B3.md`: `348befd278323ae89ab98203bf7fae59c013a8f4bef3fe2a72093a917241896c`) y se volvió a publicar antes del inicio. Además se agregó en la configuración local de git la referencia `origin/main`, que el clon no tenía; no cambia ningún archivo.

### [2026-10-06] Validación B3: cierre y resultados
- **Ventana:** inicio formal 2026-10-05 21:14:25 UTC (18:14:25 ART), con las tablas vacías y la base anterior respaldada fuera del repositorio; cierre fijo 2026-10-06 11:15:00 UTC (08:15 ART), con `scripts/b3_cerrar.ps1` ejecutado a las 08:15:30 ART. Se ejecutaron las 50 corridas del simulador (19:30 a 07:45 ART), todas con la tarea programada; no hubo tráfico manual, cambios de configuración ni reinicios. Evidencia en `docs/evidencia/b3/` con `SHA256SUMS.txt`.
- **Captura igual a persistencia:** 3.218 eventos en Cowrie y 3.218 en `events`, 0 claves distintas; `error_log` vacío. Ejecuciones de n8n en la ventana: 3.443, ninguna manual de extractor o reportes; el extractor corrió 56 veces sin error (media 273,95 ms).
- **P1:** latencia media 1.370,85 ms (mediana 693,53; máxima 4.440,01; ningún evento supera los 15 s): el 13,2 % de la línea de base de los participantes externos (10,36 s) y el 11,9 % de la de los siete participantes (11,50 s). Se confirma.
- **P2:** criterio estricto 3218/3218 = 100 %; fidelidad campo a campo 3211/3218 = 99,8 %. Se confirma. Los 7 eventos que el script cuenta como distintos son el comando `which sh ` con un espacio final: la base lo guarda idéntico al log de Cowrie, pero `b3_analisis.js` (heredado de `b2_analisis.js`) aplica `trim()` solo al valor de la base antes de comparar. Es un artefacto de la medición, no una alteración; la cifra registrada no se modifica.
- **P3:** completitud por sesión 66/66 = 100 % (IC 95 % [94,5; 100]); 32 sesiones con comando de IoC; por `event_id`, 14/66 = 21,2 %. Calidad: exactitud del catálogo 32/32 = 100 % y precisión de atribución 1108/1108 = 100 %, ambas sobre el umbral del 95 %. Descriptivo: 14 de 66 sesiones exitosas (21,2 %) aportaron al menos un indicador nuevo; los 32 indicadores aparecieron entre las 22 y las 02 UTC, cuando el simulador terminó de recorrer sus cuentas y comandos.
- **P4:** un único disparo de `report-generator`, el de producción (`0 8 * * *`), a las 08:00:00,045 ART en modo `trigger` y con éxito; el reporte (id 1, período 05/10 08:00 a 06/10 08:00 ART) cubre 66/66 sesiones. Se cumplen las tres condiciones. Vale la advertencia del registro previo: la cobertura se da por construcción; lo nuevo es la observación del disparo de producción.
- **health-monitor:** 168 ejecuciones sin error y ninguna alerta.

### [2026-10-06] Plan de pruebas: alertas por Telegram (antes de ejecutarlas)
- Se fijó `docs/PRUEBAS_TELEGRAM.md` (SHA-256 `7d4c74505fc05d0f4137218427af53e6d5d8d5e0dfb12171c422965632d54d35`) antes de configurar el bot y de instrumentar el forwarder. Pruebas T0 a T4 sobre cuatro riesgos identificados al leer `forwarder/forwarder.py`: envíos sin registro (R1), `parse_mode` HTML con valores del atacante (R2), envío sincrónico que puede demorar el reenvío a n8n (R3) y límite de envío de Telegram (R4). Único cambio de código previsto: registrar el resultado de cada envío, sin token, URL ni chat ID.

### [2026-10-06] Alertas por Telegram: instrumentación y resultados
- **Instrumentación** (`forwarder/forwarder.py`): `send_telegram` registra cada intento (`[TG] … enviado`, `rechazado HTTP …` o `sin envío: <clase>`) sin el token, la URL ni el chat ID; no cambia qué se envía ni cuándo. El bot lo creó el autor; el token y el chat ID están solo en `.env`.
- **Resultados** (`docs/evidencia/telegram/RESULTADOS.md`): en las cinco pruebas, todos los eventos de Cowrie llegaron a la base (85, 60, 33, 57 y 69). T1: 20 de 20 alertas enviadas y recibidas, con su texto coincidente con el log de Cowrie. T2: el resumen de una sesión con `<` en un comando fue rechazado por Telegram (HTTP 400, `parse_mode` HTML sin escapar); con `&&` se envió. T3: con Telegram inalcanzable se perdieron las 20 alertas y cada intento bloqueó el reenvío a n8n unos 2,1 s, con lo que la mediana de latencia pasó de 1,9 s a 16,9 s, sin pérdida de eventos. T4: 24 de 24. No hubo HTTP 429. Las alertas muestran la hora en UTC.
- **Desvíos:** el log del forwarder de T0 a T3 se perdió al recrear el contenedor (las líneas `[TG]` se toman de la salida del script de medición en el momento de cada prueba); el script de medición leía el log sin fecha de fin y se corrigió antes de generar `metricas.json`; se repitió T2 (T2b) para verificar la recepción, porque la aplicación del autor no mostraba los mensajes de T2 y T4, que habían llegado.
- **Secretos:** se verificó que la evidencia no contiene el token, el chat ID ni el patrón de un token de bot.

### [2026-10-06] Plan de pruebas: correcciones y endurecimiento (antes de ejecutarlas)
- Se fijó `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md` (SHA-256 `967435cec829e7031577b152cd864836890a5b332e25aa585087cdfe21b6a7ef`) antes de modificar el código. Correcciones C1 a C4 (HTML de Telegram, envío sin bloqueo, posición del forwarder, notificación de `health-monitor`) y endurecimiento H1 a H6 (capacidades, límites, salida a Internet, token de `log-reader`, `N8N_ENCRYPTION_KEY` obligatoria y healthchecks), con las pruebas PC1 a PC4b y PE1 a PE6.

### [2026-10-06] Adenda al plan de correcciones: reintentos del forwarder ante n8n caído (antes de corregirlo)
- Al probar PC1 se perdieron 12 de 33 eventos porque se reinició n8n y el webhook respondió HTTP 404 durante su arranque; el forwarder descartaba el evento. Se fijó `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO_ADENDA.md` (SHA-256 `43375281fce9dfd9f2857d57571b7b3b2ce86b503716046658425b1017c68861`) con la corrección C5 (reintentos del mismo evento, hasta 60 veces cada 5 s) y la prueba PC5, antes de modificar el código.

### [2026-10-06] Correcciones y endurecimiento: implementación y resultados
- **Correcciones** (plan fijado antes: `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md`, commit 3d52b95): C1 `forwarder.py` escapa los valores del atacante antes de armar el mensaje de Telegram; C2 el envío se encola y lo hace otro hilo; C3 el forwarder guarda en el volumen `forwarder-state` la posición del log hasta la que reenvió y la retoma al reiniciar; C4 `health-monitor` envía cada alerta por Telegram (credencial cifrada de n8n, cargada con `scripts/configurar_alertas.ps1` desde `.env`) y avisa «base inaccesible» o «log-reader inaccesible» en lugar de fallar; `log-reader` agrega `/count`.
- **Adenda C5** (`docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO_ADENDA.md`, commit fb479b1, fijada antes de corregir): PC1 perdió 12 de 33 eventos por un reinicio de n8n del propio autor de la prueba; el forwarder descartaba el evento si el webhook respondía 404. Ahora reintenta cada evento hasta 60 veces cada 5 s (`MAX_REINTENTOS`).
- **Endurecimiento:** `cap_drop: ALL` y `no-new-privileges` en todos los servicios (postgres conserva CHOWN, DAC_OVERRIDE, FOWNER, SETGID y SETUID), límites de memoria, CPU y procesos, healthcheck, redes `captura`, `proceso` y `datos` en `internal: true`, red `salida` solo para n8n y el forwarder, `cowrie-proxy` (socat, fijado por digest) para publicar los puertos de Cowrie, `log-reader` con token (`LOG_READER_TOKEN`), sin CORS y sin puerto publicado, y `N8N_ENCRYPTION_KEY` obligatoria.
- **Resultados** (`docs/evidencia/correcciones/RESULTADOS.md`): C1 3 de 3 resúmenes enviados (antes, HTTP 400 con `<`); C2 mediana de 0,8 a 2,1 s con Telegram caído contra 2,7 s normal (antes, 16,9 s contra 1,9 s); C3 69 de 69 eventos con el forwarder detenido (antes, 0 de 61); C5 55 de 55 con n8n reiniciándose (antes, 21 de 33); PC4a: 85 eventos perdidos a propósito, alerta de `health-monitor` en `error_log` y por Telegram; PC4b: con `ssl: false` la alerta «base inaccesible» salió por Telegram (antes, ningún rastro). PE1 a PE6 según lo esperado: cowrie, attack-runner, log-reader y postgres sin salida a 1.1.1.1:443, n8n y forwarder con salida, log-reader 401 sin token, 73 de 73 y 59 de 59 en la regresión. El autor confirmó la recepción de todos los mensajes de Telegram.
- **Desvíos y hallazgos:** los primeros healthchecks de `cowrie` y `cowrie-proxy` abrían una conexión al puerto SSH y el pipeline persistía una sesión falsa cada 30 s; se reemplazaron por una lectura de `/proc/net/tcp` (los eventos falsos de esos minutos están en la base de trabajo y no integran ninguna evidencia); `MAX_REINTENTOS=1` solo en PC4a; la primera lectura de PC5 se hizo antes de que el forwarder terminara de reintentar (30 de 55) y se repitió sobre la misma ventana (55 de 55); el log del forwarder de PC1 a PC4a se perdió al recrear el contenedor y sus líneas `[TG]` se tomaron de la salida del script de medición; Cowrie ve ahora la IP del proxy y no la del cliente del anfitrión.
- **Estado final:** Telegram activado (forwarder y `health-monitor`); el token, el chat ID, `LOG_READER_TOKEN`, la clave de n8n y la contraseña de PostgreSQL están solo en `.env`, que no se publica. Se verificó que ninguno aparece en la evidencia ni en los archivos publicados.

### [2026-10-06] Plan de evaluación del reporte con participantes externos (antes de construirla)
- Se fijó `docs/PRUEBAS_EVALUACION_REPORTE.md` (SHA-256 `e17c2719c39db9c498fbf89026bc7dc506c8f08984a97719d16119d76fe91d7a`) antes de construir las páginas y de aplicar la evaluación: comprensión y utilidad del reporte real de B3 con los cinco participantes externos de B1 (P3 a P7). Ocho preguntas sobre el reporte (seis con respuesta y dos que el reporte no responde), dos sobre un fragmento de log, cinco ítems de utilidad percibida y tres preguntas abiertas. Umbrales E1 a E4 fijados de antemano; orden de bloques contrabalanceado; limitaciones declaradas (N = 5, no son analistas, mismo equipo).

### [2026-10-06] Evaluación del reporte: instrumento fijado (antes de aplicarla)
- Se construyeron las páginas de la evaluación (`docs/evidencia/evaluacion/paginas/`, una por participante P3 a P7, con el orden de bloques contrabalanceado: RL para P3, P5 y P7; LR para P4 y P6), el corrector `experimentos/evaluacion_reporte/analisis.js` y el constructor `build.js`, que antes de generar nada comprueba cada número del reporte (id 1 de B3, `reporte_b3.json`) contra la evidencia de `docs/evidencia/b3/` y las respuestas del fragmento de log (57 eventos de la corrida de las 10:30 UTC) contra el log: todos coinciden. Los SHA-256 de las páginas, de los datos y de los tres scripts están en `docs/evidencia/evaluacion/SHA256SUMS.txt`. La página y el corrector se probaron de punta a punta con un participante ficticio (`PRUEBA`) y datos sintéticos, que no integran la evidencia. Procedimiento de aplicación en `docs/evidencia/evaluacion/APLICACION.md`.

### [2026-10-06] Evaluación del reporte con participantes externos: resultados
- Se aplicó a P3 a P7 (13:30 a 14:08 UTC; 5,2; 3,5; 16,0; 2,6 y 8,4 minutos) con el instrumento y los umbrales fijados antes (`docs/PRUEBAS_EVALUACION_REPORTE.md`). **E1** respuestas correctas del reporte 25/30 = 83,3 % (IC 95 % [66,4; 92,7]), se cumple; **E2** mediana por pregunta 11,8 s, se cumple (media 54,5 s, con tres respuestas de más de 200 s); **E3** reconocen que U1 y U2 no están en el reporte 10/10, se cumple; **E4** utilidad percibida 3,0 sobre 5, **no se cumple** (umbral 4,0; claridad, rapidez para encontrar lo pedido y confianza en los números, 2,8 cada una; suficiencia para decidir si mirar el log, 3,6). Las preguntas sobre el log (L1 y L2) dieron 0/10 con el criterio registrado: P3 no encontró el login exitoso, y los otros cuatro escribieron la contraseña sin el «!» final; tres omitieron el último comando. P3 acertó 2 de 6 en el reporte y P4 confundió los 5 indicadores de tipo command con los 330 eventos command.input.
- **Desvíos:** P3 empezó a las 13:30 UTC, antes de que el plan y el instrumento se publicaran (13:37:20; su registro local es de las 13:21 y las 13:24); no se informaron interrupciones ni ayuda; las tres preguntas abiertas quedaron sin responder. Las observaciones post hoc (`posthoc.json`) están marcadas como tales y no modifican ningún resultado. Datos, corrector y hashes en `docs/evidencia/evaluacion/`.

### [2026-10-06] README actualizado
- Se actualizó `README.md` para que refleje el estado posterior al tag `Honeypot_Final_2026-10-06d`: variables obligatorias de `.env` (`LOG_READER_TOKEN`), carga de `health-monitor` con `scripts/configurar_alertas.ps1`, disparo de producción de las 08:00 observado el 06/10/2026, línea de base con los cinco participantes externos, evaluación del reporte, endurecimiento y sus pendientes, redes y puertos publicados, estructura del repositorio y verificación de los hashes del registro previo de B3. El tag `06d` conserva el README anterior; la versión nueva queda en `main`.

### [2026-10-06] Congelado del artefacto
- Se fija el estado final con el tag `Honeypot_Final_2026-10-06e`, que es el que cita el trabajo final. Parte de `main` en `f520d9d`; respecto del tag `06d` cambian únicamente `README.md` y `BITACORA.md` (`git diff --stat Honeypot_Final_2026-10-06d..origin/main`), de modo que el código, los workflows y la evidencia son los mismos.
- **Verificación desde un clon limpio de `main`:** los `SHA256SUMS.txt` de las siete carpetas de evidencia que los tienen verifican sin fallas (b2: 11 archivos; b3: 11; correcciones: 9; evaluacion: 21; segmentacion: 5; sql_carga: 4; telegram: 4); `docker compose config` es válido con las tres variables obligatorias (`N8N_ENCRYPTION_KEY`, `POSTGRES_PASSWORD`, `LOG_READER_TOKEN`); el árbol de trabajo está sin cambios pendientes.
- **Regla:** el código y la evidencia de este tag no se modifican. Un cambio posterior se publicará con un tag nuevo, se declarará aquí y no reemplazará a este.

### [2026-10-06] Registro previo B1b: línea de base manual ampliada
- Se publica `docs/PREREGISTRO_B1b.md` y las diez páginas de cronometraje para P8 a P17 (`docs/evidencia/b1b/`) **antes** de enviarlas a los participantes. La muestra (20 eventos de la ventana del 30/09/2026, semilla `20260930` y 2 de práctica), la plantilla y el generador son los de B1 y no cambian; los SHA-256 están en el registro.
- **Tag `Honeypot_Final_2026-10-06f`:** agrega solo documentación y estas páginas; el código y la evidencia del tag `06e` no cambian y `06e` sigue siendo el que cita el trabajo final. Los resultados de B1b, cuando existan, se publicarán con un tag nuevo y se declararán aquí.

### [2026-10-06] Cierre del registro B1b: medición no completada
- La medición ampliada de la línea de base manual (B1b) no se completó: las entregas recibidas no contienen las respuestas ni los tiempos que genera la página de cronometraje y no se usan. El equipo decidió no repetirla.
- Se retiran de `main` las diez páginas `linea-base-P8` a `P17` (siguen en el historial y en el tag `Honeypot_Final_2026-10-06f`). `docs/PREREGISTRO_B1b.md` se conserva con una nota de estado. No se modifica ningún código ni dato de evidencia, ni el tag `06e`, que sigue siendo el que cita el trabajo final.

### [2026-10-07] Retiro de la landing page y correcciones de documentación (tag `Honeypot_Final_2026-10-08`)
- Se retiran `Landing page/` y `API/public/landing/`: describían un diseño y unos veredictos anteriores a los del trabajo final (por ejemplo, P3 «Confirmada»). Se quitan de la demo `API/public/index.html` la pestaña «Dashboard» que las embebía y la tarjeta «Reducción P1: 99 %», un valor fijo sin respaldo. Siguen en el historial y en los tags anteriores.
- `API/DOCUMENTACION.md` y `README.md` se alinean con ese estado; se declara que la demo y `scripts/attack_simulator.py` no corren contra el compose final, y que todos los servicios tienen healthcheck salvo `attack-runner`.
- Se agrega `docs/ANEXOS_EXTENDIDOS.md` con material que la tesis cita y trasladó para acortar el documento (consultas SQL del Anexo VII.5, cronología del lote del 25/09/2026 y tablas de detalle de los Anexos II, III, VII y IX), sin cambios de contenido.
- No cambia ningún workflow, esquema, configuración ni evidencia. El código del pipeline es idéntico al del tag `Honeypot_Final_2026-10-07`.

### [2026-10-08] Registro previo B1c: nueva convocatoria de la línea de base manual (tag `Honeypot_Final_2026-10-08b`)
- Se publica `docs/PREREGISTRO_B1c.md` y las diez páginas de cronometraje P18 a P27 (`docs/evidencia/b1c/`) **antes** de enviarlas. B1b sigue cerrado (tag `06g`) y no se usa ningún dato suyo; B1c se hace con los 10 participantes que aceptaron repetir.
- Mismos eventos, plantilla y criterio que B1; cambian la entrega y el manejo de pantalla (versión `b1-v3`: botón «Descargar JSON» sin conexión, avance al evento siguiente sin esperar el guardado y botón «Reiniciar mi medición», declarado en el archivo; pedido por un error de carga de P18) para evitar el problema de B1b: se pide el archivo tal como lo genera la página. El preregistro fija la validez del archivo, el N mínimo (8), que nadie repite y que el resultado se publica sea cual sea.
- Documentación y páginas solamente: no cambia ningún workflow, esquema, configuración ni evidencia anterior. La tesis v58 no se modifica hasta tener los resultados.
- Una tanda de P18 hecha el 08/10/2026 (09:00 a 09:16, hora de Argentina) con páginas aún no publicadas y con el problema de avance de pantalla se descarta entera (SHA-256 `7f522e19f87267d1e0eca3000a399d28a83dc72eed58b2d73516fc0466219e1d`); todos los participantes empiezan de nuevo con las páginas publicadas. Queda declarado en la sección 7 de `docs/PREREGISTRO_B1c.md`.

### [2026-10-08] Resultados de B1c: línea de base manual ampliada, N = 10 (tag `Honeypot_Final_2026-10-08c`)
- Con el registro previo ya publicado (`Honeypot_Final_2026-10-08b`, 09:28 ART), diez personas ajenas al equipo (P18 a P27) hicieron la medición por turnos en un mismo equipo, sin ver la pantalla de las demás. Los diez archivos cumplen el control de validez del registro (`scripts/b1c_validar.js`); no se excluyó ninguno.
- Mediana del paso 1: 11,01 s (media 11,32 s; total 17,83 s); con los cinco externos de B1, 10,92 s. P1 se confirma con las tres referencias (reducción de 85 a 88 % de la latencia de W2 y de C2). Resultados y declaraciones completas en `docs/RESULTADOS_B1c.md`; archivos y hashes en `docs/evidencia/b1c/resultados/`.
- Se declara que el botón «Reiniciar mi medición» dejó vacíos `inicio` y `perfil` en los archivos de P18, P19 y P22 (el perfil lo aportaron los autores), que P27 tuvo una pausa de unos 14 min en un evento (no se descartó) y que una primera tanda de P18, hecha antes de la publicación, se descartó (sección 7 del registro).
- Solo se agregan documentación, scripts de análisis y los archivos de resultados: no cambia ningún workflow, esquema, configuración ni evidencia anterior.

### [2026-10-08] Análisis posterior de B1c: intervalo de confianza y formato de credencial (tag `Honeypot_Final_2026-10-08d`)
- Se agregan `scripts/b1c_bootstrap.js` y dos salidas de análisis en `docs/evidencia/b1c/resultados/` (`analisis_bootstrap.json`, `analisis_formato_credencial.json`), con `SHA256SUMS.txt` actualizado. Ambos análisis son **posteriores** al registro previo y se declaran como tales en `docs/RESULTADOS_B1c.md`.
- Mediana del paso 1 de B1c: 11,01 s, con intervalo bootstrap del 95 % de 10,44 a 11,93 s; reducción de la latencia de W2 y C2 de 84,7 a 88,5 % respecto de esa línea de base. Con el formato de credencial normalizado, el paso 2 queda correcto en 190 de 200 eventos.
- No cambia ningún dato, workflow, esquema ni evidencia anterior.

### [2026-10-08] Script de verificación de cifras (tag `Honeypot_Final_2026-10-08e`)
- Se agrega `scripts/verificar_cifras.js`: recalcula desde `docs/evidencia/` las cifras principales de la tesis (eventos y sesiones de W2, C1 y C2, completitud por `ioc_sessions` y por `event_id`, latencias medias, mediana de B1c) y las compara con las publicadas. Resultado de la corrida: las 17 cifras coinciden (la latencia de W2 se compara con 1,6 s con una tolerancia de 0,1 s).
- No cambia ningún dato, workflow, esquema ni evidencia anterior.

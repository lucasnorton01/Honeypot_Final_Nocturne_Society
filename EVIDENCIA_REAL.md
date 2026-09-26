# EVIDENCIA REAL — Fase 0 (Inventario)

Generado por lectura directa de archivos y comandos Docker de solo lectura (`docker network ls`, `docker network inspect`, `docker ps -a`). Ningún archivo del proyecto fue modificado. No se levantó ni bajó ningún contenedor (ya estaban corriendo previamente, ver sección Red).

## Red

Red única bridge, definida en `docker-compose.yml` como `honeypot-net` (driver `bridge`, sin configuración de subred explícita en el compose — Docker la asigna automáticamente).

- **Nombre real en Docker** (con prefijo de proyecto Compose): `honeypot_final_nocturne_society-main_honeypot-net`
- **Driver**: bridge
- **Subred real (CIDR)**: `172.18.0.0/16`, gateway `172.18.0.1` (verificado con `docker network inspect`)
- **Contenedores conectados** (IPs asignadas al momento de la inspección): postgres 172.18.0.2, cowrie 172.18.0.3, log-reader 172.18.0.5, n8n 172.18.0.6, forwarder 172.18.0.7
- **Servicio Dionaea en docker-compose.yml**: NO. El compose define 6 servicios: `cowrie`, `forwarder`, `log-reader`, `postgres`, `n8n`, `attack-runner`. No existe ningún servicio Dionaea.
- **VLANs tipo 10.0.x**: NO. La única red es la bridge `honeypot-net` con subred `172.18.0.0/16` (no `10.0.x`).
- **Reglas de firewall entre servicios en el compose**: NO. No hay directivas `internal:`, `driver_opts` de aislamiento, ni reglas iptables/firewall definidas en `docker-compose.yml`. Todos los servicios comparten la misma red plana sin segmentación.

### Puertos publicados (según `ports:` en docker-compose.yml)

| Servicio | Puerto(s) publicados | Binding |
|---|---|---|
| cowrie | `127.0.0.1:2222:2222`, `127.0.0.1:2323:2223` | Solo loopback (127.0.0.1) |
| log-reader | `127.0.0.1:9000:9000` | Solo loopback (127.0.0.1) |
| postgres | `127.0.0.1:5433:5432` | Solo loopback (127.0.0.1) |
| n8n | `127.0.0.1:5678:5678` | Solo loopback (127.0.0.1) |
| forwarder | (ninguno declarado) | N/A |
| attack-runner | (ninguno declarado) | N/A |

Todos los puertos publicados usan el formato `127.0.0.1:X:Y` — ninguno está expuesto en todas las interfaces (formato `X:Y` sin IP). Confirmado también en runtime con `docker ps -a`, que muestra exactamente los mismos bindings (`127.0.0.1:9000->9000/tcp`, `127.0.0.1:5678->5678/tcp`, `127.0.0.1:2222->2222/tcp`, `127.0.0.1:2323->2223/tcp`, `127.0.0.1:5433->5432/tcp`).

Estado runtime al momento de la inspección: `forwarder`, `log-reader`, `n8n`, `cowrie`, `postgres` (healthy) están "Up"; `attack-runner` está "Exited (0)".

## Workflows n8n

Ubicación: `n8n/workflows/`. Nota: existe también `n8n/workflows/postgres-credential.example.json`, que no fue solicitado y no se reporta aquí. Existe una carpeta `experimentos/` en la raíz del proyecto (no dentro de `n8n/workflows/`), ignorada según instrucción.

### event-ingest.json
- **3 nodos**:
  1. `Webhook` — `n8n-nodes-base.webhook`
  2. `Process and Insert` — `n8n-nodes-base.code`
  3. `Postgres: Insert Event` — `n8n-nodes-base.postgres`
- **AbuseIPDB**: NO
- **Rama error** (nodo error / onError / continueOnFail): NO — no se encontró ningún parámetro `onError` ni `continueOnFail` ni nodo de manejo de errores en el archivo.
- **Cron**: NO tiene trigger cron/schedule — el disparador es un `Webhook` (HTTP POST), no un `scheduleTrigger`.

### ioc-extractor.json
- **5 nodos**:
  1. `Schedule` — `n8n-nodes-base.scheduleTrigger`
  2. `Manual (Execute Workflow)` — `n8n-nodes-base.executeWorkflowTrigger`
  3. `Postgres: Eventos sin procesar` — `n8n-nodes-base.postgres`
  4. `Extraer IoCs` — `n8n-nodes-base.code`
  5. `Postgres: Upsert IoCs` — `n8n-nodes-base.postgres`
- **AbuseIPDB**: NO — no aparece en ningún nodo del archivo.
- **Rama error**: NO — no se encontró `onError`/`continueOnFail` en el JSON.
- **Cron semanal**: NO. Tiene un trigger cron, pero es `*/15 * * * *` (cada 15 minutos), no semanal.

### report-generator.json
- **5 nodos**:
  1. `Schedule` — `n8n-nodes-base.scheduleTrigger`
  2. `Manual (Execute Workflow)` — `n8n-nodes-base.executeWorkflowTrigger`
  3. `Postgres: Datos del reporte` — `n8n-nodes-base.postgres`
  4. `Ensamblar Reporte` — `n8n-nodes-base.code`
  5. `Postgres: Guardar Reporte` — `n8n-nodes-base.postgres`
- **AbuseIPDB**: NO — no aparece en ningún nodo del archivo.
- **Rama error**: NO — no se encontró `onError`/`continueOnFail` en el JSON.
- **Cron semanal**: NO. Tiene un trigger cron, pero es `0 8 * * *` (diario a las 8:00), no semanal.

## Schema DB (db/schema.sql, literal)

Tablas definidas:
- **`events`**: `id BIGSERIAL PK`, `eventid TEXT NOT NULL`, `session TEXT`, `src_ip INET`, `src_port INTEGER`, `username TEXT`, `password TEXT`, `input TEXT`, `message TEXT`, `timestamp TIMESTAMPTZ NOT NULL`, `processed BOOLEAN NOT NULL DEFAULT FALSE`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`. Además, vía `ALTER TABLE`, columna `country TEXT` agregada.
- **`iocs`**: `id BIGSERIAL PK`, `type TEXT NOT NULL` (comentario: ip | credential | hash | url | domain), `value TEXT NOT NULL`, `confidence TEXT DEFAULT 'BAJO'` (comentario: ALTO | MEDIO | BAJO), `event_id BIGINT REFERENCES events(id)`, `source TEXT DEFAULT 'cowrie'`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`. Tiene constraint **`UNIQUE (type, value)`** — confirmado literalmente en el archivo (línea 33).
- **`reports`**: `id BIGSERIAL PK`, `period_start TIMESTAMPTZ`, `period_end TIMESTAMPTZ`, `content JSONB`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- **`error_log`**: `id BIGSERIAL PK`, `workflow TEXT`, `node TEXT`, `error TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`. (Nota: existe la tabla en el schema, pero no se verificó en esta fase si algún workflow n8n efectivamente inserta en ella — en los 3 JSON leídos no aparece ningún nodo que referencie `error_log`.)

Índices: `idx_events_src_ip`, `idx_events_timestamp`, `idx_events_processed`, `idx_events_country` (todos sobre `events`), `idx_iocs_type` (sobre `iocs`).

## Credenciales cowrie (cowrie/userdb.txt, literal)

```
# Cowrie UserDB - valid honeypot credentials
# Format: username:hashmethod:password (one per line)
admin:x:test123
guest:x:guest123
```

## Fase 2 — Recolección lote 1 (5 sesiones simuladas)

Todo el "ataque" de esta fase es **100% simulado** por `scripts/attack_simulator.py`, un cliente Telnet basado en sockets (sin dependencias) que se conecta a Cowrie en `127.0.0.1:2323`, hace 2 intentos de login fallidos + 1 exitoso, y ejecuta 6 comandos con pausas fijas (~0.8-1s entre I/O, más overhead de red) — **no hay ningún atacante humano ni interacción manual real** en ningún momento de esta fase. Todas las horas se registraron en UTC con `date -u` (Git Bash en Windows no tiene zoneinfo cargado y `TZ=America/Argentina/Mendoza date` no convertía); se muestran ambas, UTC y ART = UTC-3 (Argentina/Mendoza no tiene horario de verano).

### Baseline (antes de la primera corrida)
- `events` (antes): **0**
- `iocs` (antes): **0**
- Timestamp baseline: 2026-09-25 04:21:39 UTC = **2026-09-25 01:21:39 ART**

### Columna de sesión real
```sql
SELECT column_name FROM information_schema.columns WHERE table_name='events';
```
- Columna identificada: **`session`** (no `session_id`; tipo `TEXT`)

### ⚠️ Hallazgo crítico — Lote 1 (intento inicial): 0 de 5 sesiones persistidas

Se ejecutaron las 5 corridas del simulador exactamente como indica el plan (30s de espera real entre el fin de una y el inicio de la siguiente):

| # | Inicio (UTC) | Fin (UTC) | Inicio (ART) | Fin (ART) | Resultado simulador |
|---|---|---|---|---|---|
| 1 | 04:28:50 | 04:31:07 | 01:28:50 | 01:31:07 | OK (2 fallidos + 1 éxito + 6 comandos) |
| 2 | 04:35:39 | 04:37:55 | 01:35:39 | 01:37:55 | OK |
| 3 | 04:38:43 | 04:40:58 | 01:38:43 | 01:40:58 | OK |
| 4 | 04:41:36 | 04:43:51 | 01:41:36 | 01:43:51 | OK |
| 5 | 04:44:33 | 04:46:48 | 01:44:33 | 01:46:48 | OK |

Las 5 corridas terminaron sin errores desde el punto de vista del simulador (login exitoso + 6 comandos ejecutados en cada una). Sin embargo, al verificar Postgres después del lote:

```sql
SELECT count(*) FROM events;  -- 0
SELECT count(*) FROM iocs;    -- 0
```

**Intentadas: 5 / Persistidas: 0.** Ningún evento llegó a la base de datos. Investigando `docker logs forwarder --tail 30` se encontró la causa raíz real:

```
[2026-09-25T04:46:43] [ERR] n8n HTTP 404: {"code":404,"message":"The requested webhook \"POST cowrie\" is not registered.",
"hint":"The workflow must be active for a production URL to run successfully..."}
[2026-09-25T04:46:43] [ERR] no entregado a n8n: cowrie.session.closed from 172.18.0.1
```

Confirmado también en `docker logs n8n --tail 30`: `Received request for unknown webhook: The requested webhook "POST cowrie" is not registered.` para las **65 llamadas** del forwarder (13 eventos x 5 sesiones), sin excepción.

**Causa raíz:** el workflow `event-ingest.json` (el que expone el webhook `POST /webhook/cowrie` que consume el forwarder) **no estaba activo** en la instancia de n8n. Un workflow con trigger `Webhook` que no está activado no registra su URL de producción, por lo que Cowrie → forwarder → n8n se rompía en el último salto, silenciosamente desde el punto de vista del simulador (el simulador no valida si el evento llegó a Postgres, solo si Cowrie respondió).

### Corrección aplicada (fuera del plan original, necesaria para poder recolectar datos reales)

No fue posible activar el workflow desde la UI de n8n (`http://localhost:5678`) porque exige login (`/signin`) y no se dispone de credenciales; además, entrar una contraseña en un formulario de autenticación está fuera de lo que este agente puede hacer aunque el usuario lo autorizara. En su lugar se usó el **CLI de n8n dentro del contenedor** (no requiere login):

```
docker exec n8n n8n update:workflow --id=T1MtUBk3OW79VT9q --active=true
docker restart n8n
```

Tras el restart se confirmó con `n8n list:workflow --active=true` que `event-ingest` quedó activo, y se probó con un ping sintético (`curl -X POST http://localhost:5678/webhook/cowrie -d '{"eventid":"test.ping"}'`) que devolvió `HTTP 200` y generó **1 fila** en `events` (evento sintético de prueba, no proviene del simulador — se excluye de los conteos de "sesiones simuladas").

**Esto es una intervención de configuración de la aplicación (activar un workflow del propio laboratorio), no un cambio de sistema/seguridad.** Se documenta explícitamente porque cambia el resultado del lote.

### Segunda baseline (post-corrección)
- `events` (antes del lote real): **1** (el ping sintético de prueba)
- `iocs` (antes): **0**
- Timestamp: 2026-09-25 04:59:42 UTC = **2026-09-25 01:59:42 ART**

### Corridas del simulador — Lote 2 (real, el que cuenta como "Fase 2 lote 1")
Script: `scripts/attack_simulator.py`, 100% simulado, Telnet `localhost:2323`, sin interacción humana. 5 corridas, 30s reales entre el fin de una y el inicio de la siguiente:

1. Inicio 2026-09-25 04:59:57 UTC (01:59:57 ART) — Fin 05:02:13 UTC (02:02:13 ART)
2. Inicio 05:03:00 UTC (02:03:00 ART) — Fin 05:05:16 UTC (02:05:16 ART)
3. Inicio 05:05:58 UTC (02:05:58 ART) — Fin 05:08:14 UTC (02:08:14 ART)
4. Inicio 05:09:14 UTC (02:09:14 ART) — Fin 05:11:30 UTC (02:11:30 ART)
5. Inicio 05:12:14 UTC (02:12:14 ART) — Fin 05:14:30 UTC (02:14:30 ART)

### Verificación del lote 2
```sql
SELECT count(*) FROM events;  -- 66
SELECT count(*) FROM iocs;    -- 0 (antes de correr ioc-extractor manualmente, ver abajo)
```
- `events` (después): **66** (delta: **+65** sobre la segunda baseline de 1 → los 65 son 100% del lote real; el "1" restante es el ping sintético de prueba, no una sesión)
- `iocs` (después, antes de ejecutar ioc-extractor): delta: **+0**
- **Intentadas: 5 / Persistidas: 5** (lote 2, ya con el bug corregido)

### 5 sesiones nuevas (columna `session`)
```sql
SELECT session, count(*), min(timestamp), max(timestamp)
FROM events GROUP BY session ORDER BY max(timestamp) DESC LIMIT 6;
```

| session | count eventos | min timestamp (UTC) | max timestamp (UTC) |
|---|---|---|---|
| a3f0aaaa0cca | 13 | 2026-09-25 05:12:14.804728+00 | 2026-09-25 05:14:25.184052+00 |
| d1e20e2ea9b9 | 13 | 2026-09-25 05:09:15.299433+00 | 2026-09-25 05:11:25.621091+00 |
| 5e6fe1c13050 | 13 | 2026-09-25 05:05:59.177549+00 | 2026-09-25 05:08:09.526671+00 |
| 54cf066a37cd | 13 | 2026-09-25 05:03:01.241454+00 | 2026-09-25 05:05:11.601035+00 |
| e355bc9ba0d1 | 13 | 2026-09-25 04:59:58.113564+00 | 2026-09-25 05:02:08.450260+00 |
| (vacío, ping de prueba) | 1 | 2026-09-25 04:58:31.715+00 | 2026-09-25 04:58:31.715+00 |

Cada sesión real generó exactamente 13 eventos (2 login fallidos + 1 exitoso + session.connect/params/closed + log.closed + 6 command.input = coincide con lo esperado por el simulador). 5 sesiones x 13 = 65, cuadra exactamente con el delta medido.

### Ejecución manual de workflows (mode=manual/cli, NO cuenta como automático)

No fue posible usar la UI de n8n ("Execute Workflow" desde el editor) porque `http://localhost:5678` exige login y no hay credenciales disponibles ni está permitido para este agente introducir una contraseña en un formulario de autenticación. **Alternativa usada, declarada explícitamente:** el CLI nativo de n8n dentro del contenedor (`n8n execute --id=<workflowId>`), que ejecuta el workflow una vez de punta a punta contra la base real, sin pasar por el trigger Schedule ni por el webhook — es decir, un disparo manual equivalente al botón "Execute Workflow", pero desde línea de comandos (`"mode": "cli"` en el resultado de ejecución, visible en el JSON devuelto).

- **ioc-extractor** (`id=aDnuBfhuyiR2PK5g`): `docker exec n8n n8n execute --id=aDnuBfhuyiR2PK5g` → `Execution was successful`. Resultado real en Postgres: tabla `iocs` pasó de 0 a **4** filas:
  | type | value | confidence | source |
  |---|---|---|---|
  | ip | 172.18.0.1 | BAJO | cowrie |
  | credential | admin:123456 | BAJO | cowrie |
  | credential | admin:admin | BAJO | cowrie |
  | credential | admin:test123 | BAJO | cowrie |

  Nota: son solo 4 IoCs (no 5x algo) porque el constraint `UNIQUE(type, value)` en `iocs` deduplica — las 5 sesiones usaron siempre la misma IP y las mismas 3 combinaciones user:pass, así que el upsert colapsa todo en 4 filas únicas. Esto es comportamiento esperado del schema, no una pérdida de datos.

- **report-generator** (`id=LnAKjWiSmnVvfrZO`): `docker exec n8n n8n execute --id=LnAKjWiSmnVvfrZO` → `"status": "success", "finished": true, "lastNodeExecuted": "Postgres: Guardar Reporte"`. Resultado real en Postgres: tabla `reports` pasó de 1 a **2** filas; la nueva fila `id=2` tiene `period_start=2026-09-24 05:16:53 UTC`, `period_end=2026-09-25 05:16:53 UTC` (ventana rolling de 24h calculada en el momento de la corrida manual).

**Aclaración explícita:** ambas ejecuciones fueron disparadas manualmente (`mode=cli`, equivalente a "Execute Workflow" manual) en el momento de esta evidencia. **No** reemplazan ni prueban el disparo automático real: el cron de `ioc-extractor` sigue definido como `*/15 * * * *` y el de `report-generator` como `0 8 * * *` dentro de sus respectivos JSON, pero **NO se verificó que esos crons se disparen solos**, porque:

**Hallazgo adicional (fuera del plan, relevante):** `docker exec n8n n8n list:workflow --active=true` después de todas las corridas solo devuelve `event-ingest`. **`ioc-extractor` y `report-generator` NO están activos en esta instancia de n8n.** Un workflow inactivo con un nodo `Schedule Trigger` no se ejecuta solo aunque el JSON tenga el cron definido — la activación es un estado separado por workflow en n8n. Esto significa que, tal como está el entorno ahora mismo, los crons de 15 min y diario 8am **no están corriendo automáticamente**; solo se ejecutaron porque se dispararon a mano vía CLI. Se deja constancia de esto para que quede claro que la automatización programada no fue validada en esta fase, solo la ejecución manual.

### Logs forwarder (`--tail 20`, capturados al final del lote 2, todos exitosos)
```
[2026-09-25T05:10:42] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:10:53] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:11:04] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:11:14] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:11:25] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:11:26] [OK] cowrie.log.closed from 172.18.0.1 -> n8n
[2026-09-25T05:11:26] [OK] cowrie.session.closed from 172.18.0.1 -> n8n
[2026-09-25T05:12:15] [OK] cowrie.session.connect from 172.18.0.1 -> n8n
[2026-09-25T05:12:15] [OK] cowrie.login.failed from 172.18.0.1 -> n8n
[2026-09-25T05:12:37] [OK] cowrie.login.failed from 172.18.0.1 -> n8n
[2026-09-25T05:12:59] [OK] cowrie.login.success from 172.18.0.1 -> n8n
[2026-09-25T05:12:59] [OK] cowrie.session.params from 172.18.0.1 -> n8n
[2026-09-25T05:13:31] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:13:42] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:13:53] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:14:03] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:14:14] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:14:25] [OK] cowrie.command.input from 172.18.0.1 -> n8n
[2026-09-25T05:14:25] [OK] cowrie.log.closed from 172.18.0.1 -> n8n
[2026-09-25T05:14:25] [OK] cowrie.session.closed from 172.18.0.1 -> n8n
```

### Resumen honesto de discrepancias
1. **Lote 1 (primer intento) falló por completo**: intentadas 5, persistidas 0, por bug de configuración (workflow `event-ingest` inactivo), no por límite del forwarder ni pérdida de red.
2. Se corrigió el bug (activación vía CLI + restart de n8n) y se corrió un **lote 2** limpio: intentadas 5, persistidas 5, 65 eventos exactos (13 x 5).
3. Los workflows `ioc-extractor` y `report-generator` se ejecutaron manualmente vía CLI (no vía UI, por falta de acceso/credenciales) — resultado real: 4 IoCs y 1 reporte nuevo, ambos verificados en Postgres.
4. Se descubrió que `ioc-extractor` y `report-generator` **no están activos** en n8n, por lo que sus crons (15 min / diario 8am) no se están disparando solos en este momento — esto no se puede confirmar ni desmentir con la evidencia recolectada más allá de constatar que ahora mismo no figuran como workflows activos.

## Fase 2b — Activación de workflows restantes (ioc-extractor, report-generator)

IDs confirmados con `docker exec n8n n8n list:workflow` (listado completo, antes de tocar nada):
```
T1MtUBk3OW79VT9q|event-ingest
aDnuBfhuyiR2PK5g|ioc-extractor
LnAKjWiSmnVvfrZO|report-generator
```

- **ioc-extractor**: ID `aDnuBfhuyiR2PK5g`, activado vía `docker exec n8n n8n update:workflow --id=aDnuBfhuyiR2PK5g --active=true`, confirmado ACTIVO.
- **report-generator**: ID `LnAKjWiSmnVvfrZO`, activado vía `docker exec n8n n8n update:workflow --id=LnAKjWiSmnVvfrZO --active=true`, confirmado ACTIVO.
- **event-ingest**: ID `T1MtUBk3OW79VT9q`, ya estaba activo desde la corrección previa (Fase 2).

Nota honesta sobre el comando: ambas invocaciones de `update:workflow` devolvieron una advertencia real de n8n:
```
⚠️  WARNING: The "update:workflow" command is deprecated.
Publishing workflow <id> with current version
Please use: publish:workflow --id=<id>
Note: Changes will not take effect if n8n is running.
Please restart n8n for changes to take effect if n8n is currently running.
```
Por eso, igual que en la Fase 2, se ejecutó `docker restart n8n` después de los dos `update:workflow`, y se esperó a que el contenedor volviera a estado `Up` antes de verificar.

### Estado final de los 3 workflows (output real de `n8n list:workflow --active=true`, post-restart)
```
T1MtUBk3OW79VT9q|event-ingest
aDnuBfhuyiR2PK5g|ioc-extractor
LnAKjWiSmnVvfrZO|report-generator
```
Este output es idéntico al del listado completo (`n8n list:workflow` sin filtro), lo que confirma que **los 3 workflows están activos** — no hay ningún workflow inactivo en esta instancia al momento de esta verificación.

### Implicancia
A partir de este momento los 3 cron/triggers quedan operativos de forma automática:
- event-ingest: webhook (siempre activo, no depende de cron)
- ioc-extractor: cron `*/15 * * * *` (cada 15 min)
- report-generator: cron `0 8 * * *` (diario 8am America/Argentina/Mendoza)

**Aclaración honesta:** esta sección confirma que el *estado* de los 3 workflows es "activo" según la CLI de n8n inmediatamente después del restart. No se dejó pasar tiempo suficiente en esta fase para observar una ejecución automática real del cron de 15 minutos ni del diario de las 8am — esa validación (ver disparos automáticos reales en `docker logs n8n` o nuevas filas en `iocs`/`reports` sin intervención manual) queda pendiente para una fase posterior si se requiere evidencia de disparo automático, no solo de estado activo.

## Tabla III-1 (v9) — Latencia de persistencia (agregados)

### Verificación previa de columnas (obligatoria, no se asumió nada)

```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='events' ORDER BY ordinal_position;
```

Resultado real:

```
 column_name |        data_type
-------------+--------------------------
 id          | bigint
 eventid     | text
 session     | text
 src_ip      | inet
 src_port    | integer
 username    | text
 password    | text
 input       | text
 message     | text
 timestamp   | timestamp with time zone
 processed   | boolean
 created_at  | timestamp with time zone
 country     | text
(13 rows)
```

Confirmado: existen dos columnas de tiempo distintas, ambas `timestamptz`: `timestamp` (momento del evento original, generado por Cowrie/forwarder) y `created_at` (momento en que la fila se insertó en Postgres, `DEFAULT now()`). El delta `created_at - timestamp` representa la latencia real de persistencia (evento ocurrido → evento persistido en DB). No fue necesario ajustar la query original: los nombres de columna coinciden exactamente con lo asumido.

### Query real ejecutada (lote 25/09, las 5 sesiones reales del lote 2)

```sql
SELECT
  count(*) AS n,
  min(EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000) AS min_ms,
  avg(EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000) AS avg_ms,
  max(EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000) AS max_ms,
  stddev(EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000) AS sd_ms,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000) AS median_ms
FROM events
WHERE session IN ('a3f0aaaa0cca','d1e20e2ea9b9','5e6fe1c13050','54cf066a37cd','e355bc9ba0d1');
```

Resultado real (`docker exec postgres psql -U honeypot -d honeypot`):

```
 n  |   min_ms   |        avg_ms        |   max_ms   |      sd_ms       | median_ms
----+------------+----------------------+------------+------------------+-----------
 65 | 100.163000 | 348.0190461538461538 | 798.338000 | 160.077283446683 |   330.557
```

Chequeo de sanidad adicional (nulls y deltas negativos):

```sql
SELECT
  count(*) AS total_rows,
  count(*) FILTER (WHERE created_at IS NULL) AS null_created_at,
  count(*) FILTER (WHERE timestamp IS NULL) AS null_timestamp,
  count(*) FILTER (WHERE created_at < timestamp) AS negative_delta
FROM events
WHERE session IN ('a3f0aaaa0cca','d1e20e2ea9b9','5e6fe1c13050','54cf066a37cd','e355bc9ba0d1');
```

```
 total_rows | null_created_at | null_timestamp | negative_delta
------------+-----------------+----------------+----------------
         65 |               0 |              0 |              0
```

`n=65` real (no forzado): coincide exactamente con las 5 sesiones x 13 eventos documentadas en la sección "5 sesiones nuevas" de Fase 2. Sin NULLs, sin deltas negativos — el resultado es consistente y no requiere corrección manual.

### Tabla III-1 (v9)

| Fuente / Lote | N | Media (ms) | Mediana (ms) | SD (ms) | Min (ms) | Max (ms) |
|---|---|---|---|---|---|---|
| v8 (Anexo III, agregado histórico) | 13 | 297 | 293 | 221.2 | 85.5 | 961.6 |
| lote 25/09 (real, este trabajo) | 65 | 348.02 | 330.56 | 160.08 | 100.16 | 798.34 |

Nota: la fila v8 es una referencia complementaria citada del Anexo III histórico (agregado publicado, sin las 13 mediciones individuales disponibles), no constituye base de P1. Ver §5.2.5.

**Aclaración explícita sobre la naturaleza de cada fila:**
- La fila **v8** es una **cita textual** de un agregado publicado en una versión previa del documento (Anexo III). No fue recalculada, no fue reverificada, y las 13 mediciones individuales que la originaron nunca se encontraron en este trabajo — se transcribe tal como está documentada en v8, sin alteración.
- La fila **lote 25/09** es una **medición real**, ejecutada ahora mismo contra la base Postgres viva del laboratorio (`docker exec postgres psql`), sobre las 5 sesiones reales del lote 2 de Fase 2 (65 eventos reales, verificados fila por fila arriba). No es una simulación ni una extrapolación.

Ambas filas no son directamente comparables sin reservas: v8 no se sabe si mide la misma definición de "latencia de persistencia" (mismas columnas, mismo pipeline) que la medida acá, dado que no hay acceso a su metodología original más allá del agregado citado.

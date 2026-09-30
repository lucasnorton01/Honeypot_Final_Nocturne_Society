# Verificación post-validación — 2026-09-28

Verificación de los artefactos reales tras la validación de P3/P4 del
28/09/2026 (tag `Honeypot_Final_2026-09-28`, commit `7882a30`). Tarea de
solo lectura: no se modificó código, workflows, esquema ni datos (salvo lo
explícitamente indicado). Toda la salida de abajo es literal (DDL, JSON,
SQL, `git diff`), no parafraseada.

---

## 1 — Tabla `ioc_observations`

**`CREATE TABLE` en `db/schema.sql`:**

```sql
CREATE TABLE IF NOT EXISTS ioc_observations (
    id           BIGSERIAL PRIMARY KEY,
    event_id     BIGINT      REFERENCES events(id),
    produced_ioc BOOLEAN     NOT NULL DEFAULT FALSE,
    checked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**`\d ioc_observations` (base real):**

```
                                       Table "public.ioc_observations"
    Column    |           Type           | Collation | Nullable |                   Default
--------------+--------------------------+-----------+----------+----------------------------------------------
 id           | bigint                   |           | not null | nextval('ioc_observations_id_seq'::regclass)
 event_id     | bigint                   |           |          |
 produced_ioc | boolean                  |           | not null | false
 checked_at   | timestamp with time zone |           | not null | now()
Indexes:
    "ioc_observations_pkey" PRIMARY KEY, btree (id)
    "idx_ioc_observations_event_id" btree (event_id)
Foreign-key constraints:
    "ioc_observations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id)
```

**Conteo `produced_ioc`:**

```
 produced_ioc | count
--------------+-------
 f            |   273
 t            |   132
```

---

## 2 — Workflow `ioc-extractor` tal como quedó

**a) Nodos (5):**

- `Schedule` | `n8n-nodes-base.scheduleTrigger`
- `Manual (Execute Workflow)` | `n8n-nodes-base.executeWorkflowTrigger`
- `Postgres: Eventos sin procesar` | `n8n-nodes-base.postgres`
- `Extraer IoCs` | `n8n-nodes-base.code`
- `Postgres: Upsert IoCs` | `n8n-nodes-base.postgres`

**b) Cron del Schedule Trigger:** `*/15 * * * *`

**c) Query literal (`Postgres: Upsert IoCs`), la que marca `processed` e inserta en `ioc_observations`:**

```sql
WITH ins AS (
  INSERT INTO iocs (type, value, event_id, source)
  SELECT type, value, event_id::bigint, source FROM (VALUES {{ $json.values_sql }}) AS v(type, value, event_id, source)
  WHERE type IS NOT NULL
  ON CONFLICT (type, value) DO NOTHING
), obs AS (
  INSERT INTO ioc_observations (event_id, produced_ioc) VALUES ({{ $json.event_id }}, {{ $json.produced_ioc }})
)
UPDATE events SET processed = TRUE WHERE id = {{ $json.event_id }}
```

---

## 3 — Credenciales que acepta el honeypot

**`cowrie/userdb.txt` (literal):**

```
# Cowrie UserDB - valid honeypot credentials
# Format: username:hashmethod:password (one per line)
admin:x:test123
guest:x:guest123
oracle:x:oracle2024
backup:x:backupsvc99
deploy:x:deployKey7
ftpuser:x:ftpPass321
```

6 cuentas — confirma el número citado durante la validación.

**`SUCCESS_SESSIONS` en `attack-runner/attack_ssh.py` (credenciales válidas usadas por el simulador):**

```python
SUCCESS_SESSIONS = [
    {"user": "guest", "pass": "guest123", "desc": "guest:guest123 (SUCCESS)"},
    {"user": "admin", "pass": "test123", "desc": "admin:test123 (SUCCESS)"},
    {"user": "oracle", "pass": "oracle2024", "desc": "oracle:oracle2024 (SUCCESS)"},
    {"user": "backup", "pass": "backupsvc99", "desc": "backup:backupsvc99 (SUCCESS)"},
    {"user": "deploy", "pass": "deployKey7", "desc": "deploy:deployKey7 (SUCCESS)"},
    {"user": "ftpuser", "pass": "ftpPass321", "desc": "ftpuser:ftpPass321 (SUCCESS)"},
]
```

**`SELECT value, event_id FROM iocs WHERE type = 'credential' ORDER BY id;` (20 filas):**

```
       value        | event_id
--------------------+----------
 root:password      |        4
 ci:ci              |        8
 admin:123456       |       12
 backup:backup2024  |       14
 git:git123         |       19
 admin:admin        |       23
 oracle:oracle      |       28
 ubuntu:ubuntu123   |       32
 root:toor          |       36
 deploy:deploy      |       40
 admin:test123      |       44
 test:test          |       54
 oracle:oracle2024  |       88
 postgres:postgres  |      101
 jenkins:jenkins    |      113
 backup:backupsvc99 |      132
 deploy:deployKey7  |      192
 ftpuser:ftpPass321 |      236
 devops:devops      |      264
 guest:guest123     |      342
```

---

## 4 — Programación del simulador (`attack-runner`)

No fue un workflow de n8n: fue una tarea programada de Windows (`schtasks`),
ya borrada al cerrar la ventana (Paso 8 de la Tarea 4). Definición literal
usada:

```
schtasks /create /tn "HoneypotAttackRunner" /tr "cmd /c cd /d C:\Users\Manu\Downloads\Iteracion\Lab\Honeypot_Final-vers && docker compose run --rm attack-runner >> attack-runner-cron.log 2>&1" /sc hourly /mo 1 /st 19:45
```

Confirmación de que ya no existe:

```
> schtasks /query /tn "HoneypotAttackRunner"
ERROR: The system cannot find the file specified.
```

`attack-runner-cron.log` registra 10 corridas, todas a los `:45`:

```
SSH Attack Runner - 2026-09-27T22:45:02.709825+00:00
SSH Attack Runner - 2026-09-27T23:45:02.478324+00:00
SSH Attack Runner - 2026-09-28T00:45:06.692652+00:00
SSH Attack Runner - 2026-09-28T01:45:03.508605+00:00
SSH Attack Runner - 2026-09-28T02:45:04.229401+00:00
SSH Attack Runner - 2026-09-28T03:45:02.813592+00:00
SSH Attack Runner - 2026-09-28T04:45:03.343324+00:00
SSH Attack Runner - 2026-09-28T05:45:03.803812+00:00
SSH Attack Runner - 2026-09-28T06:45:03.937704+00:00
SSH Attack Runner - 2026-09-28T07:45:04.130908+00:00
```

Coincide con `/sc hourly /st 19:45`.

**Minutos de `cowrie.session.connect` en `events` (dentro de la ventana final, post-reinicio de las 00:57:55 UTC):**

```
         minuto         | count
------------------------+-------
 2026-09-28 01:45:00+00 |    12
 2026-09-28 02:45:00+00 |     7
 2026-09-28 03:45:00+00 |    12
 2026-09-28 04:45:00+00 |     7
 2026-09-28 05:45:00+00 |     8
 2026-09-28 06:45:00+00 |    13
 2026-09-28 07:45:00+00 |     7
```

Confirmado: coincide exactamente con los `:45` programados.

---

## 5 — ¿Cambió `event-ingest` entre el 25/09 y el 28/09?

**`git diff Honeypot_Final_2026-09-25 -- n8n/workflows/event-ingest.json`:**

```diff
diff --git a/n8n/workflows/event-ingest.json b/n8n/workflows/event-ingest.json
index b42aa3e..d694f5f 100644
--- a/n8n/workflows/event-ingest.json
+++ b/n8n/workflows/event-ingest.json
@@ -1,4 +1,5 @@
 {
+    "id": "wf-event-ingest-0001",
     "name": "event-ingest",
     "nodes": [
         {
@@ -40,7 +41,7 @@
             "credentials": {
                 "postgres": {
                     "name": "Postgres",
-                    "id": "PLACEHOLDER_CRED_ID"
+                    "id": "E56uxYa034ezaNIn"
                 }
             }
         }
```

Resumen: se agregó el `id` de workflow (faltaba y bloqueaba el `import:workflow` por CLI con `SQLITE_CONSTRAINT: NOT NULL ... workflow_entity.id`) y se corrigió una credencial placeholder (`PLACEHOLDER_CRED_ID`) que nunca se había actualizado en el JSON versionado, apuntándola al mismo id de credencial real que usan `ioc-extractor` y `report-generator`.

**`git diff Honeypot_Final_2026-09-25 -- scripts/forwarder* forwarder/`:**

```
(diff vacío)
```

`forwarder/` no cambió.

---

## 6 — Reportes que cubren las sesiones (P4)

**`SELECT id, period_start, period_end, created_at FROM reports ORDER BY id;`:**

```
 id |         period_start          |          period_end           |          created_at
----+-------------------------------+-------------------------------+-------------------------------
  1 | 2026-09-27 01:00:01.053622+00 | 2026-09-28 01:00:01.053622+00 | 2026-09-28 01:00:01.053622+00
  2 | 2026-09-27 03:00:00.37663+00  | 2026-09-28 03:00:00.37663+00  | 2026-09-28 03:00:00.37663+00
  3 | 2026-09-27 05:00:00.7716+00   | 2026-09-28 05:00:00.7716+00   | 2026-09-28 05:00:00.7716+00
  4 | 2026-09-27 07:00:01.146983+00 | 2026-09-28 07:00:01.146983+00 | 2026-09-28 07:00:01.146983+00
```

**Ejecuciones de `report-generator` dentro de la ventana final (`docs/evidencia/ejecuciones_2026-09-28.csv`):**

```
430,report-generator,trigger,2026-09-28 01:00:00.171,success
550,report-generator,trigger,2026-09-28 03:00:00.076,success
677,report-generator,trigger,2026-09-28 05:00:00.071,success
819,report-generator,trigger,2026-09-28 07:00:00.074,success
```

**Aclaración:** son 4, no 5. Hubo una 5ª ejecución en modo trigger a las 23:00:00 UTC del 27/09, pero es anterior al reinicio limpio de la ventana (00:57:55 UTC del 28/09) — pertenece a datos que se truncaron antes de la corrida final, no a este dataset. El CSV publicado ya está filtrado a la ventana correcta.

**Confirmación explícita — ejecuciones NO-`trigger` de `report-generator`/`ioc-extractor` dentro de 00:57:55–08:30 UTC del 28/09:**

```sql
SELECT e.id, w.name, e.mode, e.startedAt, e.status
FROM execution_entity e JOIN workflow_entity w ON w.id=e.workflowId
WHERE e.startedAt >= '2026-09-28 00:57:55' AND e.startedAt <= '2026-09-28 08:30:00'
  AND w.name IN ('report-generator','ioc-extractor')
  AND e.mode NOT IN ('trigger')
```

```
ejecuciones NO trigger de report-generator/ioc-extractor en la ventana: 0
```

Cero — ninguna ejecución manual/CLI de ninguno de los dos workflows en la ventana.

---

## 7 — Errores de `ioc-extractor` (`"column undefined does not exist"`)

**Mensaje completo de una ejecución fallida real** (execution id 431, 2026-09-28 01:00:00 UTC, nodo `Postgres: Upsert IoCs`):

```
Failed query: WITH ins AS (
  INSERT INTO iocs (type, value, event_id, source)
  SELECT type, value, event_id::bigint, source FROM (VALUES (NULL,NULL,NULL,NULL)) AS v(type, value, event_id, source)
  WHERE type IS NOT NULL
  ON CONFLICT (type, value) DO NOTHING
), obs AS (
  INSERT INTO ioc_observations (event_id, produced_ioc) VALUES (undefined, false)
)
UPDATE events SET processed = TRUE WHERE id = undefined

NodeOperationError: column "undefined" does not exist
```

**Lectura del error:** en este ítem puntual, `{{ $json.values_sql }}` resolvió bien (dio el placeholder `(NULL,NULL,NULL,NULL)`), pero `{{ $json.event_id }}` resolvió a la palabra literal `undefined` — no faltaba el campo en general, faltaba específicamente en el contexto de ítem que usó el nodo Postgres para esa fila puntual.

**Hipótesis (no confirmada, no investigada en profundidad por tiempo):** el nodo Postgres corre con `queryBatching: "independently"` (una consulta por ítem de entrada). El Code node (`Extraer IoCs`) no setea explícitamente `pairedItem` en los objetos que devuelve, así que n8n infiere el enlace ítem-a-ítem automáticamente; en tandas grandes (hasta 500 eventos por corrida) esa inferencia automática pudo desalinearse para algún ítem puntual, haciendo que el nodo Postgres evaluara `$json` contra un objeto sin `event_id`. Es una hipótesis, no una causa raíz verificada.

**Conteo exacto dentro de la ventana declarada (00:57:55–08:30 UTC del 28/09, no "desde el reinicio"):**

```sql
SELECT status, count(*) FROM execution_entity
WHERE workflowId='wf-ioc-extractor-0002'
  AND startedAt >= '2026-09-28 00:57:55' AND startedAt <= '2026-09-28 08:30:00'
GROUP BY status
```

```
('error', 23)
('success', 7)
```

30 ejecuciones totales de `ioc-extractor` en la ventana: 23 error, 7 success.

**Hora del reinicio que aplicó el fix del cast (`event_id::bigint`):** `2026-09-28T00:17:13.872Z` (log: `Activated workflow "ioc-extractor"`). Es el reinicio que corrigió el bug anterior (`bigint` vs `text`); el error `"undefined"` de este punto es **distinto y posterior**, no relacionado con ese cast — no causó pérdida de datos porque los eventos fallidos quedan `processed=false` y se reintentan en el tick siguiente (fix de A-02).

---

## 8 — Estado del repo y tags

**`git status`:**

```
On branch main
Your branch is ahead of 'origin/main' by 3 commits.
Untracked files:
	docs/CONTENIDO_PARA_TESIS_LATENCIA_P1.md
nothing added to commit but untracked files present
```

*(nota: al momento de esta verificación los 3 commits todavía no se habían pusheado; se pushearon inmediatamente después)*

**`git log --oneline -5`:**

```
7882a30 Tareas 1-4: pin de imagenes verificado, rotacion de credencial Postgres, fix A-02 ioc-extractor, validacion P3/P4 en modo automatico
7de06ba docs: figuras 4.1/4.3/4.4/4.5, II-1..3, III-1 ER + Tabla III-1 v9 (agregado v8 citado + lote 25/09 real)
c3691b7 fix: pin cowrie y n8n a digest + EVIDENCIA_REAL.md (Fase 0-2b), deja postgres:16
7ff60e0 Limpieza final: eliminar attack_simulator.py residual y variantes .new/.tmp con encoding corrupto
742593e Ronda 4: cierre publicacion - fix scanner, gitignore y docs finales
```

**`git tag --list 'Honeypot_Final*' -n1`:**

```
Honeypot_Final_2026-09 Estado entregado: ver README y BITACORA
Honeypot_Final_2026-09-23 Estado final entregado: auditoria de ronda 4 resuelta completa (30/30 hallazgos). Ver BITACORA.md y docs/EVIDENCIA_HASHES.md.
Honeypot_Final_2026-09-25 docs: figuras 4.1/4.3/4.4/4.5, II-1..3, III-1 ER + Tabla III-1 v9 (agregado v8 citado + lote 25/09 real)
Honeypot_Final_2026-09-28 Validacion P3/P4 en modo automatico (ventana real ~7h32, 2026-09-28), rotacion de credencial Postgres, pin de imagenes verificado.
```

**`git grep -n "Honeypot_Final_2026-09-25"`:**

```
(sin resultados)
```

Ningún archivo del repo cita ese tag anterior.

---

## Estado post-verificación

- `main` y el tag `Honeypot_Final_2026-09-28` ya fueron pusheados a `origin` (`7ff60e0..7882a30`, nuevo tag publicado).
- No se modificó código, workflows, esquema ni datos durante esta verificación.

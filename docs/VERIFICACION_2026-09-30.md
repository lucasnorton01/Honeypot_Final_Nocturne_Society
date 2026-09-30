# Verificación de la ventana de validación — 2026-09-30

Cierre de la segunda ventana de validación completa (la primera fue el
28/09; ver `docs/VERIFICACION_2026-09-28.md`). Esta corre con los fixes
de los Pasos 6 (extractor), 7 (`ioc_sessions`) y 9 (geolocalización) de
`INSTRUCCIONES.md` ya aplicados **antes** del primer evento — a
diferencia del 28/09, no hubo correcciones a mitad de la ventana.

Todo lo de abajo es salida literal de consultas SQL y de la base interna
de n8n (`execution_entity`), no parafraseada.

---

## 0 — Incidente descartado (mismo día, antes de esta ventana)

Un primer intento de esta ventana arrancó a las 21:12:31 UTC del 29/09 y
se cortó a los ~18 minutos por una caída real de WSL2/Docker Desktop (el
host pidió actualizar WSL y se reinició solo). Hubo un hueco de ~2h17min
con el stack completamente caído. Esa corrida se descartó entera — no se
intentó conciliar ni rellenar el hueco — y se truncaron las tablas para
reiniciar. Detalle completo en `BITACORA.md`, entrada
"Interrupción de infraestructura — ventana anterior descartada".

---

## 1 — Ventana vigente: duración y continuidad

- **Inicio:** `SELECT now()` en Postgres = `2026-09-29 23:53:57.32858+00`.
- **Cierre:** ~`2026-09-30 08:01:00 UTC`.
- **Duración:** ≈ 8h07min.
- **Continuidad verificada:** `docker compose ps` mostró los 5 servicios
  (`cowrie`, `forwarder`, `log-reader`, `n8n`, `postgres`) con
  `Up 8 hours` corrido, sin reinicios, al momento del cierre. El conteo
  de eventos por hora no tiene huecos:

```
          hora          | count
------------------------+-------
 2026-09-30 00:00:00+00 |   249
 2026-09-30 01:00:00+00 |   234
 2026-09-30 02:00:00+00 |   247
 2026-09-30 03:00:00+00 |   278
 2026-09-30 04:00:00+00 |   196
 2026-09-30 05:00:00+00 |   252
 2026-09-30 06:00:00+00 |   224
 2026-09-30 07:00:00+00 |   250
 2026-09-30 08:00:00+00 |    68
```

---

## 2 — Resumen general (Postgres)

```
 events | procesados | iocs | ioc_sessions | reports | errores | sesiones_exitosas
--------+------------+------+--------------+---------+---------+-------------------
   1998 |       1930 |   21 |          654 |       4 |       0 |                41
```

Los 68 eventos sin procesar son la última tanda (08:00 UTC), que todavía
no le tocaba su ciclo de 15 min al extractor al momento del cierre — no
es un error (`error_log` = 0 filas).

**Reportes generados:**

```
 id |         period_start          |          period_end           |          created_at
----+-------------------------------+-------------------------------+-------------------------------
  1 | 2026-09-29 01:00:00.329769+00 | 2026-09-30 01:00:00.329769+00 | 2026-09-30 01:00:00.329769+00
  2 | 2026-09-29 03:00:01.463068+00 | 2026-09-30 03:00:01.463068+00 | 2026-09-30 03:00:01.463068+00
  3 | 2026-09-29 05:00:00.549836+00 | 2026-09-30 05:00:00.549836+00 | 2026-09-30 05:00:00.549836+00
  4 | 2026-09-29 07:00:00.752521+00 | 2026-09-30 07:00:00.752521+00 | 2026-09-30 07:00:00.752521+00
```

(Cada reporte cubre las 24 h previas a su generación, `now() - interval
'24 hours'`; el intervalo de 2 h es entre disparos del cron de
validación, no el período que cubre cada reporte — misma aclaración que
en la ventana del 28/09.)

---

## 3 — Modo trigger, sin ejecuciones manuales

Consulta contra `execution_entity` de la base interna de n8n
(`/home/node/.n8n/database.sqlite`):

```sql
SELECT e.id, w.name, e.mode, e.startedAt, e.status
FROM execution_entity e JOIN workflow_entity w ON w.id=e.workflowId
WHERE e.startedAt >= '2026-09-29 23:53:57'
  AND w.name IN ('report-generator','ioc-extractor')
  AND e.mode NOT IN ('trigger')
```

```
ejecuciones NO trigger de report-generator/ioc-extractor en la ventana: 0
```

**Conteo por workflow, modo y estado:**

```
('event-ingest',      'webhook', 'success', 1998)
('ioc-extractor',     'trigger', 'success',   33)
('report-generator',  'trigger', 'success',    4)
```

**33/33 ejecuciones de `ioc-extractor` exitosas, cero errores** — el fix
del Paso 6 (ignorar ítems vacíos sin eventos pendientes) eliminó por
completo el bug `"column undefined does not exist"` que afectó 23 de 30
ejecuciones el 28/09. Confirmado también por conteo directo:

```sql
SELECT count(*) FROM execution_entity e JOIN workflow_entity w ON w.id=e.workflowId
WHERE w.name='ioc-extractor' AND e.startedAt >= '2026-09-29 23:53:57' AND e.status != 'success'
```
```
(0,)
```

---

## 4 — P3, dos métodos (comparación explícita)

### 4a — Método viejo (SQL original de la Tarea 4, sin modificar)

```sql
SELECT e.session, count(i.id) AS iocs
FROM events e LEFT JOIN iocs i ON i.event_id = e.id
WHERE e.session IN (SELECT session FROM events WHERE eventid = 'cowrie.login.success')
GROUP BY e.session ORDER BY e.session;
```

Resultado completo (41 filas):

```
   session    | iocs
--------------+------
 0176df2d684b |    0
 020e32b06f0c |    0
 0248257ef1f6 |    0
 0543da996a4f |    0
 0f14b762e452 |    0
 13ebebd83aed |    0
 263f3431c24e |    0
 2bef45452c95 |    0
 455f83de0743 |    0
 49f31d37ef4a |    0
 4ad293babf75 |    0
 58bf11c95e71 |    1
 65824cd55f9d |    0
 74dbe0ba1388 |    1
 77751d138ec3 |    0
 8375a0cc8547 |    0
 83d7864b9ccd |    1
 85c705b89d14 |    1
 89d78abf875c |    0
 930f265270de |    0
 94fd767264c6 |    0
 953f51b1ec1f |    1
 99d106dbaafc |    1
 a56fb2b57443 |    0
 a9ef53d74ab3 |    0
 aed6b0778f02 |    0
 b5fd8edd14a4 |    0
 c3127d6eef5f |    0
 c3e3016e2c63 |    0
 c7cae8df13e8 |    0
 c8880db1d1e5 |    0
 cdbcecd46703 |    0
 da535c860e51 |    0
 dfef48204dfc |    0
 e33f8afebd7a |    0
 e6e724010458 |    0
 e6f0e4da206f |    0
 f3e98de9c507 |    0
 f74dcf42d69f |    0
 fd5275d67fee |    0
 ff922597da7f |    0
```

**P3 (método viejo) = 6/41 = 14,6%** — empeora respecto al 28/09 (60%):
con más sesiones exitosas y el mismo pool finito de 6 credenciales
válidas, el numerador queda fijo (solo la primera sesión con cada
credencial genera un IoC propio) mientras el denominador crece. Es el
fenómeno exacto que motivó el Paso 7, ahora con más datos.

### 4b — Método nuevo (`ioc_sessions`, Paso 7)

```sql
SELECT e.session,
  (SELECT count(*) FROM ioc_sessions s WHERE s.session = e.session) AS apariciones
FROM (SELECT DISTINCT session FROM events WHERE eventid='cowrie.login.success') e
ORDER BY e.session;
```

Resultado completo (41 filas):

```
   session    | apariciones
--------------+-------------
 0176df2d684b |           2
 020e32b06f0c |           2
 0248257ef1f6 |           2
 0543da996a4f |           2
 0f14b762e452 |           2
 13ebebd83aed |           2
 263f3431c24e |           2
 2bef45452c95 |           2
 455f83de0743 |           0
 49f31d37ef4a |           2
 4ad293babf75 |           2
 58bf11c95e71 |           2
 65824cd55f9d |           2
 74dbe0ba1388 |           2
 77751d138ec3 |           2
 8375a0cc8547 |           2
 83d7864b9ccd |           2
 85c705b89d14 |           2
 89d78abf875c |           2
 930f265270de |           2
 94fd767264c6 |           2
 953f51b1ec1f |           2
 99d106dbaafc |           2
 a56fb2b57443 |           2
 a9ef53d74ab3 |           2
 aed6b0778f02 |           2
 b5fd8edd14a4 |           2
 c3127d6eef5f |           2
 c3e3016e2c63 |           2
 c7cae8df13e8 |           2
 c8880db1d1e5 |           2
 cdbcecd46703 |           2
 da535c860e51 |           2
 dfef48204dfc |           2
 e33f8afebd7a |           2
 e6e724010458 |           0
 e6f0e4da206f |           2
 f3e98de9c507 |           2
 f74dcf42d69f |           2
 fd5275d67fee |           2
 ff922597da7f |           2
```

**P3 (método nuevo) = 39/41 = 95,1%** — supera ampliamente el umbral de
70%. Las 2 sesiones en 0 (`455f83de0743`, `e6e724010458`) son exactamente
las 2 últimas sesiones exitosas de la ventana (08:00:07 y 08:00:13 UTC),
parte de la tanda que todavía no había pasado por el extractor al cierre
(sección 2) — no son un fallo del método, es la cola natural de la
ventana.

**Conclusión:** la limitación encontrada el 28/09 era del método de
conteo (una tabla de indicadores deduplicada, correcta por diseño, no
sirve para medir cobertura por sesión), no del pipeline. Con el método
correcto (`ioc_sessions`), P3 se confirma.

---

## 5 — P4

```sql
SELECT e.session, min(e.timestamp) AS login, count(DISTINCT r.id) AS reportes
FROM events e LEFT JOIN reports r ON e.timestamp BETWEEN r.period_start AND r.period_end
WHERE e.eventid = 'cowrie.login.success'
GROUP BY e.session ORDER BY login;
```

Resultado completo (41 filas):

```
   session    |             login             | reportes
--------------+-------------------------------+----------
 58bf11c95e71 | 2026-09-30 00:00:05.819548+00 |        4
 4ad293babf75 | 2026-09-30 00:15:06.497626+00 |        4
 49f31d37ef4a | 2026-09-30 00:30:20.762927+00 |        4
 77751d138ec3 | 2026-09-30 00:45:16.563446+00 |        4
 85c705b89d14 | 2026-09-30 01:00:12.62356+00  |        3
 83d7864b9ccd | 2026-09-30 01:15:02.665049+00 |        3
 a9ef53d74ab3 | 2026-09-30 01:15:21.103181+00 |        3
 0543da996a4f | 2026-09-30 01:30:13.177568+00 |        3
 cdbcecd46703 | 2026-09-30 01:45:15.827363+00 |        3
 0248257ef1f6 | 2026-09-30 01:45:22.351044+00 |        3
 99d106dbaafc | 2026-09-30 02:00:07.56924+00  |        3
 e33f8afebd7a | 2026-09-30 02:15:15.84513+00  |        3
 fd5275d67fee | 2026-09-30 02:15:31.37004+00  |        3
 0176df2d684b | 2026-09-30 02:30:13.341412+00 |        3
 e6f0e4da206f | 2026-09-30 02:30:20.254162+00 |        3
 94fd767264c6 | 2026-09-30 02:45:09.367086+00 |        3
 13ebebd83aed | 2026-09-30 03:00:13.709687+00 |        2
 dfef48204dfc | 2026-09-30 03:15:08.86733+00  |        2
 c8880db1d1e5 | 2026-09-30 03:15:29.547763+00 |        2
 f74dcf42d69f | 2026-09-30 03:30:02.519161+00 |        2
 aed6b0778f02 | 2026-09-30 03:45:18.72519+00  |        2
 953f51b1ec1f | 2026-09-30 04:00:06.548174+00 |        2
 da535c860e51 | 2026-09-30 04:00:13.300521+00 |        2
 74dbe0ba1388 | 2026-09-30 04:15:10.689339+00 |        2
 b5fd8edd14a4 | 2026-09-30 04:15:17.833037+00 |        2
 930f265270de | 2026-09-30 04:30:08.660572+00 |        2
 c3e3016e2c63 | 2026-09-30 04:45:10.800187+00 |        2
 c3127d6eef5f | 2026-09-30 05:00:16.786996+00 |        1
 ff922597da7f | 2026-09-30 05:15:16.909538+00 |        1
 8375a0cc8547 | 2026-09-30 05:30:06.39657+00  |        1
 f3e98de9c507 | 2026-09-30 05:45:12.16585+00  |        1
 c7cae8df13e8 | 2026-09-30 06:00:26.213685+00 |        1
 263f3431c24e | 2026-09-30 06:15:06.53029+00  |        1
 a56fb2b57443 | 2026-09-30 06:30:05.685353+00 |        1
 2bef45452c95 | 2026-09-30 06:45:03.010495+00 |        1
 020e32b06f0c | 2026-09-30 07:00:13.89477+00  |        0
 65824cd55f9d | 2026-09-30 07:15:21.91296+00  |        0
 89d78abf875c | 2026-09-30 07:30:11.747581+00 |        0
 0f14b762e452 | 2026-09-30 07:45:26.05758+00  |        0
 455f83de0743 | 2026-09-30 08:00:07.626054+00 |        0
 e6e724010458 | 2026-09-30 08:00:13.785999+00 |        0
```

**P4 = 35/41 = 85,4%.** Las 6 sesiones sin cobertura (`reportes = 0`)
son, sin excepción, las últimas 6 de la ventana (07:00–08:00 UTC): el
último reporte se generó a las 07:00:00 UTC y cubre hasta esa hora; el
siguiente disparo del cron de validación hubiera sido a las 09:00 UTC,
después del cierre de la ventana (~08:01 UTC). Explicación completa,
sin ambigüedad — a diferencia de la entrada original del 28/09, que tuvo
que corregirse después.

---

## 6 — Evidencia publicada

| Archivo | Contenido | Filas |
|---------|-----------|-------|
| `docs/evidencia/ejecuciones_2026-09-30.csv` | Historial de ejecuciones de n8n de esta ventana (`id, workflow, modo, inicio, estado`) | 2035 |
| `docs/evidencia/iocs_events_2026-09-30.csv` | Cruce `iocs` × `events` por `event_id` | 21 |
| `docs/evidencia/ioc_sessions_2026-09-30.csv` | **Nuevo** — cruce `ioc_sessions` × `iocs` (`ioc_session_id, ioc_id, ioc_type, ioc_value, event_id, session`), la evidencia que sustenta el 95,1% de P3 | 654 |

---

## 7 — Cierre de infraestructura

- Tarea programada de Windows `HoneypotAttackRunner` (cada 15 min) borrada.
- `experimentos/report-generator-p4-validacion-2026-09-30.json` guardado
  (snapshot exacto del cron de validación `0 */2 * * *` tal como quedó).
- `n8n/workflows/report-generator.json` revertido a `0 8 * * *` —
  verificado idéntico byte a byte a `experimentos/report-generator-produccion.json`,
  reimportado, reactivado, n8n reiniciado y confirmado activo.

---

## 8 — Números a usar en la tesis para esta ventana

- P1/P2: sin cambios respecto a lo ya reportado para el 25/09 y 28/09.
- **P3: recomendado citar ambos métodos** — 14,6% (6/41, método viejo,
  el mismo que reportó la tesis hasta ahora) y **95,1% (39/41, método
  `ioc_sessions`, Paso 7)** — con la explicación de la sección 4. No
  reemplazar el número viejo sin explicar por qué cambia: el argumento
  de que el método de conteo estaba mal medido es más fuerte que
  mostrar solo el número que da bien.
- P4: 85,4% (35/41).

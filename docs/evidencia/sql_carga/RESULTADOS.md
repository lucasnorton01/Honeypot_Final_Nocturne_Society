# Resultados: consultas parametrizadas y prueba de carga (05/10/2026)

Plan fijado antes de ejecutar: `docs/PRUEBAS_SQL_CARGA.md` (registrado en BITACORA.md). Todas las horas son UTC.

## Consultas parametrizadas (Q0 a Q4)

**Cambio.** `event-ingest`, `ioc-extractor`, `report-generator` y `health-monitor` pasan sus valores como parámetros (`$1`, `$2`, …) del nodo Postgres, en su versión 2.5. En ningún workflow queda SQL armado por concatenación de datos. Antes de modificarlos se comprobó, con un workflow de prueba descartable (`prueba-param`, que quedó importado e inactivo en la instancia de trabajo), que este n8n acepta los parámetros como lista: las comas, los apóstrofos y los valores nulos llegan intactos, y `json_to_recordset` lee un JSON con varios indicadores.

Las sesiones de prueba se generan con `experimentos/sesiones_caracteres_especiales.py`: dos intentos fallidos con `o'brien` / `it's-a-test` y `d'angelo` / una contraseña con barra invertida y comillas dobles, y una sesión exitosa (`admin`) con comandos benignos que contienen comillas y barras.

| ID | Resultado | ¿Como lo esperado? |
|---|---|---|
| Q0 | Con los workflows sin modificar, `report-generator` falló con `Syntax error at line 1 near "brien"` y no guardó el reporte (`q0_report_generator_antes.txt`). Se reproduce el defecto declarado en el §5.13.6 | Sí (ver desvío 2) |
| Q1 | 21 de 21 eventos de las sesiones (20:20:03–20:20:12) idénticos al log de Cowrie campo por campo; la tabla `events` sigue existiendo | Sí (ver desvío 1) |
| Q2 | El extractor guardó como indicadores `credential o'brien:it's-a-test`, `credential d'angelo:…` y `command bash -c 'echo hola'`; 12 filas en `ioc_sessions` con apóstrofo y ninguna fila nueva en `error_log` | Sí (ver desvío 3) |
| Q3 | `report-generator` generó el reporte id 3 (20:21:25), que contiene las dos credenciales con sus caracteres, idénticas a las de `events` | Sí |
| Q4 | Una corrida normal del simulador (20:20:25–20:20:59) dejó 65 de 65 eventos idénticos al log de Cowrie, todos procesados | Sí |

**Desvíos respecto del plan:**
1. **Q1:** no se usó la cadena `'; DROP TABLE events; --` del plan. Se usaron caracteres comunes en contraseñas y comandos (apóstrofo, barra invertida y comillas dobles), que bastan para romper el SQL concatenado, como muestra Q0.
2. **Q0:** con un solo intento, la credencial con apóstrofo no entraba entre las 10 que incluye el reporte, y la ejecución terminó bien sin ejercitar el defecto (reporte id 2). Se repitieron las sesiones cuatro veces más (cinco intentos por credencial) y la ejecución siguiente falló.
3. **Q2:** ninguno de los comandos con comillas coincidía con el patrón de IoC de tipo comando. Se agregó `bash -c 'echo hola'`, una nueva corrida de 20:31:40 a 20:31:51, procesada por el extractor de las 20:45.

Las ejecuciones de `report-generator` de Q0 y Q3 se lanzaron por línea de comandos (modo manual): son pruebas funcionales, no mediciones de P4.

## Prueba de carga

Seis escalones de 120 eventos sintéticos enviados al webhook (`carga_envios.json`), con `ip-api.com` resuelto a 127.0.0.1 dentro de n8n (`docker-compose.carga.yml`), de modo que la consulta de país falla en el acto y no se consulta el servicio externo. Latencias en `carga_latencia.csv`.

| Tasa objetivo (ev/s) | Tasa efectiva (ev/s) | Persistidos | Mediana | p95 | Máximo |
|---|---|---|---|---|---|
| 1 | 1,0 | 120/120 | 45 ms | 60 ms | 345 ms |
| 2 | 2,0 | 120/120 | 43 ms | 52 ms | 62 ms |
| 5 | 5,0 | 120/120 | 38 ms | 44 ms | 60 ms |
| 10 | 10,1 | 120/120 | 35 ms | 43 ms | 62 ms |
| 20 | 20,1 | 120/120 | 125 ms | 273 ms | 327 ms |
| 50 | **28,1** | 120/120 | 1.444 ms | 1.924 ms | 1.945 ms |

- Las 720 ejecuciones de `event-ingest` de la prueba terminaron con éxito; el webhook aceptó los 720 envíos.
- **En el escalón de 50, el cliente de prueba alcanzó solo 28,1 eventos por segundo:** ese es el límite del generador, no del pipeline.
- **Según el criterio del plan** (100 % persistido y p95 de hasta 5 s), la capacidad sostenida es de **al menos 28 eventos por segundo**, sin la consulta de país. No se llegó a saturar el pipeline.
- **A partir de 20 eventos por segundo la latencia crece** (de ≈40 ms a ≈1,4 s de mediana), lo que indica que empiezan a formarse colas.
- **El resultado reemplaza la estimación de 0,6 a 2,9 eventos por segundo del §6.1.3**, que se había obtenido como 1 ÷ latencia media con la consulta de país incluida. Una parte de la diferencia se explica porque en esta prueba la consulta de país no se hace.

Los 720 eventos de la prueba (sesiones `carga-…`, IP 10.99.x.x) quedaron en la base de trabajo, y el extractor los procesa como a cualquier otro evento. No forman parte de ninguna evidencia de la tesis.

# Resultados: segmentación de red y monitoreo de fallas silenciosas (05/10/2026)

Plan fijado antes de ejecutar: `docs/PRUEBAS_SEGMENTACION_MONITOREO.md` (SHA-256 `35ca8096b30c9034563d87306e96e711cc03ff9ba6fa74d38f851a56bb723f8a`, registrado en BITACORA.md). Todas las horas son UTC.

## Segmentación (S1 a S11)

Salida literal en `conectividad.txt`. **Las diez pruebas de conectividad dieron el resultado esperado.**

| ID | Prueba | Esperado | Obtenido |
|---|---|---|---|
| S1 | attack-runner → cowrie:2222 | Conecta | Conecta |
| S2 | attack-runner → n8n:5678 | No conecta | No conecta (el nombre no resuelve) |
| S3 | attack-runner → postgres:5432 por nombre | No conecta | No conecta (el nombre no resuelve) |
| S4 | attack-runner → 10.0.3.2:5432 por IP | No conecta | No conecta (timeout) |
| S5 | forwarder → n8n:5678 | Conecta | Conecta |
| S6 | forwarder → postgres por nombre y por IP | No conecta | No conecta |
| S7 | n8n → postgres:5432 | Conecta | Conecta |
| S8 | postgres → 1.1.1.1:443 | No conecta | No conecta |
| S9 | anfitrión → 127.0.0.1:2222, 2323, 5678 y 9000 | Conectan | Conectan |
| S10 | anfitrión → 127.0.0.1:5433 | No conecta | No conecta |

Controles positivos agregados al ver S8 (no figuraban en el plan): el forwarder, que está en una red con salida, sí conecta con 1.1.1.1:443, y la misma herramienta usada en S8 sí conecta dentro de postgres con 127.0.0.1:5432. Así se descarta que el "no conecta" de S8 se deba a la herramienta.

**S11 (de extremo a extremo):** la corrida de 18:30:09 a 18:30:37 dejó 48 eventos en Cowrie y los mismos 48 en `events`, todos procesados por el extractor de las 18:45.

## Monitoreo (M0 a M3)

Alertas en `alertas_monitor.csv`, ejecuciones de n8n en `ejecuciones_n8n.csv` y log del forwarder en `forwarder.log`.

| ID | Falla y corrida del simulador | Eventos en Cowrie / en la base | Detección | ¿Como lo esperado? |
|---|---|---|---|---|
| M0 | Ninguna (S11, 18:30) | 48 / 48 | Los disparos de 18:50 y 18:55, sobre el intervalo 18:30–18:53, no generaron alertas | Sí, en el intervalo limpio (ver nota) |
| M1 | `event-ingest` desactivado (18:57:03–18:57:19) | 29 / 0 | Alerta a las 19:00 («33 eventos en Cowrie y 0 en la base»); el forwarder registró 66 líneas `[ERR]` | Sí |
| M2 | `forwarder` detenido (19:01:59–19:02:31) | 61 / 0 | Alerta a las 19:05 («106 eventos en Cowrie y 0 en la base», que suma M1 y M2) | Sí |
| M3 | Credencial con `ssl: false` (19:08:05–19:08:21) | 30 / 0 | El forwarder registró 34 entregas `[OK]` y ningún error (falla silenciosa reproducida). En n8n, 34 ejecuciones de `event-ingest` en error, el monitor en error a las 19:10 y a las 19:15, y el extractor en error a las 19:15. Sin filas en `error_log`, porque la base era inaccesible | Sí |

**Recuperación.** Tras restituir cada condición, la ingesta volvió a ser completa: 55 de 55 eventos (19:06:30–19:06:56) y 52 de 52 (19:16:47–19:17:10). El monitor siguió alertando a las 19:20 y a las 19:25, mientras los eventos perdidos seguían dentro de su intervalo de 20 minutos, y dejó de alertar a las 19:30 y a las 19:35. Todas las ejecuciones posteriores terminaron con éxito y no quedaron eventos sin procesar.

**Nota sobre M0 (hallazgo).** Al recrear el entorno con la red nueva, `docker compose up` arrancó también `attack-runner`, que corrió el simulador a las 18:27:43, unos segundos antes de que arrancara el forwarder (18:27:52). Como el forwarder empieza a leer el log desde el final, esos 22 eventos (4 sesiones) nunca se enviaron, y otros 2 envíos fallaron mientras n8n arrancaba. El monitor alertó sobre esa pérdida real a las 18:30, 18:35, 18:40 y 18:45, con 116 eventos en Cowrie y 94 en la base. Por eso el control negativo se evaluó sobre el intervalo limpio de 18:30 a 18:53. La pérdida deja al descubierto una limitación del forwarder: lo que Cowrie registra mientras el forwarder está detenido no se recupera al reiniciarlo, como también se ve en M2.

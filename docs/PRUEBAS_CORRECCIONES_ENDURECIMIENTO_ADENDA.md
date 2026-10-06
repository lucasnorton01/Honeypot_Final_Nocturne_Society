# Adenda al plan de correcciones y endurecimiento

Escrita el 06/10/2026, **antes** de corregir el defecto y de probar la corrección. Complementa `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md`; no modifica ninguna de sus pruebas.

## Hallazgo

Al probar PC1 (HTML de Telegram), solo 21 de los 33 eventos de Cowrie llegaron a la base. La causa no fue la corrección C1: el autor de la prueba reinició n8n a las 12:30:41 UTC para cargar un workflow, y durante su arranque el webhook respondió HTTP 404 (todavía no registrado). `forward_to_n8n` registra `[ERR]` y **descarta el evento**, que no se vuelve a enviar: con C3, la posición guardada avanza igual. Es el mismo mecanismo de falla silenciosa del lote 1 (§5.4), ahora ante cualquier indisponibilidad de n8n, y también afecta a un reinicio de n8n en producción.

## Corrección C5

`forward_to_n8n` reintenta el mismo evento, cada `RETRY_DELAY` segundos (5 s), hasta `MAX_REINTENTOS` veces (60, unos 5 minutos), ante errores de conexión, tiempos de espera, HTTP 404 (webhook sin registrar) y HTTP 5xx. Las respuestas 4xx restantes no se reintentan. Mientras reintenta, el forwarder no avanza: los eventos siguientes quedan en el log y no se pierden. Si se agotan los reintentos, el evento se descarta y se registra `[ERR]`, como antes.

## Prueba PC5

| ID | Procedimiento | Esperado |
|---|---|---|
| PC5 | Reiniciar n8n (`docker restart n8n`) e iniciar de inmediato una corrida del simulador, mientras n8n arranca | El 100 % de los eventos de Cowrie persiste en la base, idénticos al log; el log del forwarder muestra reintentos y ninguna línea de evento descartado |

Se informa además que, con la versión anterior, la misma situación perdió 12 de 33 eventos (PC1, 12:31 UTC).

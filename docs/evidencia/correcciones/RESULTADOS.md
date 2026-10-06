# Resultados: correcciones y endurecimiento (06/10/2026)

Plan fijado antes de ejecutar: `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO.md` (registrado en BITACORA.md) y su adenda, `docs/PRUEBAS_CORRECCIONES_ENDURECIMIENTO_ADENDA.md` (C5 y PC5, fijada después de encontrar el defecto y antes de corregirlo). Todas las horas son UTC. Métricas por ventana en `metricas.json` (eventos de Cowrie y de la base, identidad campo a campo y latencia, recalculados desde el log de Cowrie y PostgreSQL), intervalos en `ventanas_utc.txt`.

El honeypot no se expuso a Internet en ninguna prueba.

## Correcciones (C1 a C5)

| ID | Defecto | Prueba | Resultado | ¿Como lo esperado? |
|---|---|---|---|---|
| C1 | Un `<` en un comando hacía que Telegram rechazara el resumen (T2, 06/10) | PC1b: las mismas tres sesiones (control, `<`, `&&`), n8n estable | 3 de 3 resúmenes **enviados**, incluido el del comando `echo 'a<b'` (antes, HTTP 400). 33 de 33 eventos persistidos e idénticos al log | Sí |
| C2 | Con Telegram caído, la mediana de latencia pasó de 1,9 a 16,9 s (T3) | PC2: una corrida normal y tres con `api.telegram.org` no enrutable | Mediana normal: 2,68 s (93 eventos). Con Telegram caído: 0,83 s (34), 1,20 s (58) y 2,11 s (60); las 5 conexiones, 4 logins fallidos y 1 resumen de la primera corrida figuran `sin envío: ConnectionError`. 100 % de los eventos persistidos en las cuatro. Cociente máximo 0,79 (el criterio era hasta 1,5; antes: 8,9) | Sí |
| C3 | Lo que Cowrie registra con el forwarder detenido no se recupera (M2: 0 de 61) | PC3: forwarder detenido, una corrida del simulador y reinicio | **69 de 69** eventos persistidos e idénticos al log; el forwarder registró «Se retoma el log desde la posición guardada». Latencia mediana de 25,9 s: son los eventos recuperados tras la interrupción | Sí |
| C4 | Las alertas de `health-monitor` solo quedaban en `error_log`, y con la base inaccesible no dejaban rastro (M3) | PC4a y PC4b (abajo) | Las dos alertas llegan por Telegram | Sí |
| C5 (adenda) | El forwarder descartaba el evento si n8n no respondía (404 durante su arranque) | PC5: reinicio de n8n y corrida del simulador en el acto | **55 de 55** eventos persistidos e idénticos al log, con reintentos en el log del forwarder (antes: 21 de 33 en PC1) | Sí |

**PC4a (M1 repetida).** Con `event-ingest` desactivado y el forwarder con `MAX_REINTENTOS=1`, los 85 eventos de la corrida no llegaron a la base. `health-monitor` alertó en el disparo siguiente, a las 12:50:01: «520 eventos en Cowrie y 423 en la base», una diferencia de 97 que es la suma de esos 85 y de los 12 perdidos en PC1. La alerta quedó en `error_log` y la ejecución recibió el `message_id` de Telegram, es decir, el mensaje salió. Se usó `MAX_REINTENTOS=1` solo en esta prueba: con los 60 reintentos de C5, una interrupción corta ya no pierde eventos y no habría nada que detectar.

**PC4b (M3 repetida).** Con la credencial de PostgreSQL en `ssl: false`, 53 eventos llegaron a n8n (el forwarder informó `[OK]` en los 53) y ninguno a la base. A las 12:55:00 la ejecución de `health-monitor` generó la alerta «base inaccesible: no se pudo consultar PostgreSQL» y la envió por Telegram (`message_id` recibido). No quedó fila en `error_log`, porque la base estaba inaccesible, pero la alerta salió. Antes de C4, esta falla no dejaba ningún rastro. La credencial original se restituyó desde una copia exportada, y la regresión posterior dio 59 de 59.

**Recepción en Telegram.** El autor confirmó que le llegaron todos los mensajes: el resumen con el comando `echo 'a<b'` completo, las alertas «ingesta: …» de `health-monitor` y la de «base inaccesible».

## Endurecimiento (H1 a H6)

| ID | Medida | Prueba | Resultado | ¿Como lo esperado? |
|---|---|---|---|---|
| H1 | `cap_drop: ALL` y `no-new-privileges` | PE1 (`endurecimiento_pe1.txt`) | Todos los servicios con `CapDrop = ALL` y `no-new-privileges`. Solo postgres agrega cinco capacidades (CHOWN, DAC_OVERRIDE, FOWNER, SETGID, SETUID), que necesita su imagen para arrancar como root y bajar a `postgres`; el resto arranca sin ninguna | Sí |
| H2 | Límites de memoria, CPU y procesos | PE1 | Definidos en los seis servicios (memoria de 64 MB a 1,5 GB; CPU de 0,25 a 1,5; procesos de 64 a 512) | Sí |
| H3 | Salida a Internet solo donde hace falta | PE2 y PE3 (`conectividad.txt`) | Con las redes `captura`, `proceso` y `datos` en `internal: true`, **no conectan** a 1.1.1.1:443: cowrie, attack-runner, log-reader y postgres. **Conectan** (controles positivos): n8n y forwarder. S1 a S10 iguales que el 05/10, salvo S9 al puerto 9000, que ahora no conecta | Sí |
| H4 | `log-reader` con token, sin CORS, sin puerto publicado | PE4 | Sin token y con token incorrecto: HTTP 401; con token: 200; ninguna respuesta con `Access-Control-Allow-Origin`; el puerto 9000 del anfitrión rechaza la conexión | Sí |
| H5 | `N8N_ENCRYPTION_KEY` obligatoria | PE5 (`pe5_variables_obligatorias.txt`) | `docker compose config` falla con el mensaje definido si la variable está vacía; lo mismo con `LOG_READER_TOKEN` | Sí |
| H6 | Healthcheck en todos los servicios de larga duración | PE1 | Los seis servicios en estado `healthy` | Sí |

**PE6 (regresión).** Con Telegram desactivado, 73 de 73 eventos persistidos, idénticos al log de Cowrie campo a campo y procesados por el extractor, sin alertas. Al final, 59 de 59 tras restituir la credencial.

## Cambios que el plan no preveía (desvíos y hallazgos)

1. **C5 y su adenda.** PC1 perdió 12 de 33 eventos porque el autor de la prueba reinició n8n 30 s antes. El defecto era del forwarder y está descripto arriba.
2. **Healthchecks que generaban sesiones falsas.** Los primeros healthchecks de `cowrie` y de `cowrie-proxy` abrían una conexión al puerto SSH, y Cowrie la registraba como una sesión (`session.connect` y `session.closed`) cada 30 s, que el pipeline persistía como evento. Se detectó a los pocos minutos y se reemplazaron por una lectura de `/proc/net/tcp`, que verifica que el puerto escucha sin abrir ninguna conexión; luego no aparecieron eventos nuevos en 75 s. Los eventos falsos de esos minutos están en la base de trabajo y no integran ninguna evidencia.
3. **Origen de los eventos.** Como los puertos del anfitrión pasan ahora por `cowrie-proxy`, Cowrie registra como IP de origen la del proxy (10.0.1.x) y no la del cliente del anfitrión. Las sesiones del simulador, que se conectan desde `attack-runner`, no cambian.
4. **Alertas de `error_log`.** Las filas 1 y 2 (12:25 y 12:30: 6 eventos en Cowrie y 4 en la base; 8 y 6) son dos eventos del healthcheck de Cowrie, registrados a las 12:18:46, siete segundos antes de que arrancara el forwarder, que todavía no tenía una posición guardada y empieza por el final del log; el monitor las detectó, pero Telegram todavía no estaba cargado en el workflow. Las filas 3 a 5 (diferencias de 14, 12 y 12) suman a esos dos los 12 eventos perdidos en PC1, que siguen dentro de la ventana de 20 minutos del monitor, y desde la fila 6 (diferencia de 97) se suman los 85 de PC4a. Las filas 7 a 9 (13:00, 13:05 y 13:10; diferencias de 138, 95 y 53) incluyen los eventos perdidos de PC4a y PC4b mientras siguen dentro de la ventana de 20 minutos; el disparo de las 13:15 ya no alertó. A las 12:55 no hay fila por tratarse de la alerta «base inaccesible», que solo salió por Telegram. En total salieron por Telegram 7 alertas «ingesta» (filas 3 a 9) y 1 «base inaccesible»; las filas 1 y 2 no, porque Telegram todavía no estaba cargado en el workflow. El autor confirmó haberlas recibido.
5. **Primer disparo.** La ejecución de las 12:20 terminó en error: era el workflow anterior, que llamaba a `log-reader` sin token, ya exigido por H4.
6. **PC5: medición.** La primera lectura se hizo antes de que el forwarder terminara de reintentar (30 de 55); se volvió a medir la misma ventana minutos después (55 de 55).
7. **Credenciales en n8n.** El token de `log-reader` y el de Telegram se cargaron como credenciales cifradas de n8n con `scripts/configurar_alertas.ps1`, que las toma de `.env`. El identificador del chat se guarda en el workflow dentro de n8n, no en el repositorio, donde figura como marcador. En n8n, el nodo Code no puede leer variables de entorno (se comprobó: «access to env vars denied»).
8. **Registros del forwarder.** Al recrear el contenedor se pierden sus líneas `[TG]`; para PC1 a PC4a se tomaron de la salida del script de medición en el momento de cada prueba (`metricas.json`, campo `lineas_TG`).

## Secretos

El token del bot, el identificador del chat, el token de `log-reader`, la clave de n8n y la contraseña de PostgreSQL están solo en `.env`, que no se publica. Antes de publicar se verificó que ninguno aparece en la evidencia, en los archivos modificados ni en el workflow.

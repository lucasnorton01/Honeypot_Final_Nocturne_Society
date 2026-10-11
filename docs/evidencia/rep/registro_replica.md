# Réplica C: registro de la corrida

Transcripción del registro entregado por la persona (documento propio, sin identificación). El equipo solo transcribió; no corrigió ni completó datos. Protocolo: `docs/PROTOCOLO_REPLICA.md`. Código: tag `Honeypot_Final_2026-10-08g`.

## 1. Condiciones declaradas

| Dato | Valor |
|---|---|
| Fecha | 2026-10-11 |
| Persona | Ajena al equipo y a la dirección del trabajo; no participó en el desarrollo ni leyó la tesis (declarado por el autor de la tesis) |
| Experiencia previa con Docker | Intermedia |
| Máquina | Equipo propio, sin contenedores ni imágenes del proyecto (declarado); clon nuevo del repositorio |
| Sistema operativo | Windows 11 Pro 10.0.26300 |
| RAM | 63,78 GB |
| Docker Engine / Compose | 29.8.2 (build 7fc2dff) / v5.5.1 |
| Fuente de instrucciones | Solo el `README.md` del tag. La persona usó una IA para automatizar la ejecución de los comandos; no recibió instrucciones del equipo |
| Intervenciones del equipo | **Ninguna** (declarado por el autor de la tesis) |
| Telegram | Configurado en `.env` (`TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`); `health-monitor` informó «Telegram: activado» |

Verificación del clon: `git rev-parse HEAD` = `930acf617ca8c2cb20860aec812deccb074afd5e` (`docs: evidencia y resultados de la validación B4 (configuración final)`), `HEAD detached at Honeypot_Final_2026-10-08g`, árbol de trabajo limpio. El `cowrie/userdb.txt` entregado tiene las doce cuentas del tag (`admin:x:test123`, `guest:x:guest123`, …, `user:x:user1234`).

## 2. Cronología (hora local, −0300)

| Hora | Paso | Tiempo |
|---|---|---|
| 12:48:31 | Paso 1: clonar y ubicarse en el tag | — |
| 13:31:31 | Paso 2: crear `.env` (`N8N_ENCRYPTION_KEY`, `POSTGRES_PASSWORD`, `LOG_READER_TOKEN`, Telegram) | 43 min desde el paso 1 (no se registró el detalle) |
| (no registrada) | Paso 3: primer `docker compose up -d --build` y esquema | No registrada. Entre el `up` y la corrida el simulador ya había atacado una vez al levantar el stack |
| 13:36:49 | Paso 4: importar `event-ingest` | — |
| 13:36:54 | Importar `ioc-extractor` | +5 s |
| 13:37:00 | Importar `report-generator` | +6 s |
| 13:37:47 | Configurar `health-monitor` (`scripts\configurar_alertas.ps1`) | +47 s (58 s en total desde el primer import) |
| 13:40:22 | Reconocimiento de entorno (versiones, sistema operativo, RAM) | — |
| 13:40:44 | Línea base: `cowrie.json` = 38 líneas / 22.061 bytes; `events` = 1 | 22 s |
| 13:41:28 | Forwarder al día (`pos` = 22.061 = tamaño del log) | 44 s |
| 13:45:16.873 | RUN_START: `docker compose run --rm attack-runner` | — |
| 13:46:02.634 | RUN_END | 45,8 s |
| 13:46:04 | El forwarder reenvió el último evento (según su log) | +2 s |
| 13:46:22 | Convergencia: `file = pos = 81117`, diferencia 0 | ~20 s |
| 13:47:15 | Conteo final de `events` (103) | — |

Desde el clon hasta el conteo final: 58 min 44 s.

## 3. Resultado

| Medición | Valor |
|---|---|
| Eventos de Cowrie de la corrida (140 líneas finales − 38 de base) | 102 |
| Filas creadas en `events` desde RUN_START | 102 |
| Total histórico en `events` | 103 (1 de una prueba de webhook previa) |
| Clasificación según el protocolo | **Exitosa** (102 = 102) |

Simulador (SUMMARY): 16 sesiones, 3 inicios de sesión correctos (`pi:raspberry`, `support:support01` y un tercero), 13 fallidos esperados, 0 errores, código de salida 0. Los inicios correctos (UTC): 16:45:24.599949, 16:45:46.005146 y 16:45:55.674827.

**Dato sin verificar.** El registro original atribuyó el tercer inicio correcto a `admin:admin`, por una cuenta `admin:x:admin` de R1 en `userdb.txt`. Esa explicación no corresponde: el `userdb.txt` del tag y el entregado por la persona no tienen esa cuenta, y `admin:admin` está en el grupo de intentos fallidos del simulador. No se pudo verificar qué cuenta fue; la salida del simulador no se guardó (`--rm`). No afecta a la comparación de eventos.

Estado del pipeline al final: `iocs` = 1 (IP previa), `reports` = 0, `error_log` = 2 filas (alertas de `health-monitor` por los 38 eventos que el simulador generó al levantar el stack, anteriores a la corrida); 102 eventos pendientes de procesar, que el extractor toma en su próximo múltiplo de 15 min.

## 4. Errores y dificultades (texto de la persona)

1. `docker exec cowrie sh -c …` falló: `OCI runtime exec failed: exec: "sh": executable file not found in $PATH`. La imagen de Cowrie no trae shell. Resuelto en segundos con `docker cp` y `python3` dentro del contenedor.
2. Línea base ambigua: `attack-runner` ejecuta el ataque al hacer `up` (su comando es el ataque), de modo que había 38 líneas en Cowrie y solo 1 fila en `events`. Resuelto capturando la línea base antes de disparar.
3. El forwarder tuvo 2 reintentos al arrancar el stack (`n8n not reachable`), antes de la corrida (16:33:48–16:33:53 UTC) y ninguno durante ella.
4. `error_log` con 2 filas de `health-monitor`, ajenas a la corrida (ventanas 16:20–16:38 y 16:25–16:43 UTC).

## 5. Respuestas finales

**¿Qué fue lo más difícil?** «Nada de la corrida en sí: el disparo y el pipeline fueron limpios. Lo más engorroso fue establecer una medición limpia: entender que `attack-runner` ya corre el ataque al hacer `docker compose up` (dejando 38 líneas de base en Cowrie sin persistir), y que la imagen de Cowrie no tiene shell (`sh`/`wc`) para contar el log, obligando a usar `docker cp` + `python3`.»

**¿Qué agregaría al README?**
1. Un fragmento (PowerShell y bash) que automatice la verificación: capturar la línea base, disparar el ataque, esperar la convergencia del forwarder y comparar los dos números, con la salida esperada y el criterio exitosa/parcial/fallida.
2. Una advertencia de que `attack-runner` ejecuta el ataque al levantar el stack, así que la primera línea base nunca es cero y hay que medir la diferencia.
3. La ruta real del log dentro del contenedor (`/cowrie/cowrie-git/var/log/cowrie/cowrie.json`) y la nota de que la imagen no incluye shell.

## 6. Declaraciones del equipo

- Intervenciones del equipo: ninguna.
- La persona usó una IA para automatizar la ejecución de los comandos; la réplica se informa con esa asistencia.
- Se conservan: este registro y las siete capturas de comandos del documento original (no se publican: el archivo trae los nombres del autor y de quien lo editó en sus propiedades).
- No se registraron los tiempos del primer arranque del stack, y el paso 2 incluye 43 min sin detalle.
- La salida de `docker compose run --rm attack-runner` no es recuperable.

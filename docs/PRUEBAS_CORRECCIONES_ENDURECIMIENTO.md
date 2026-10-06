# Plan de pruebas: corrección de los defectos encontrados y endurecimiento

Este plan se escribió el 06/10/2026, **antes** de modificar el código y de ejecutar las pruebas. Lo que efectivamente ocurra se registra en `docs/evidencia/correcciones/`. Si un resultado no coincide con lo esperado, se informa así.

El honeypot **no se expone a Internet** en ninguna de estas pruebas. Todo ocurre en el laboratorio local.

## 1. Correcciones de los defectos encontrados

| ID | Defecto (dónde se encontró) | Corrección |
|---|---|---|
| C1 | Un `<` en un comando hace que Telegram rechace el resumen (T2, `docs/evidencia/telegram/`) | `forwarder.py` escapa con `html.escape` los valores que vienen del atacante antes de armar el mensaje |
| C2 | El envío a Telegram es sincrónico: con Telegram caído, la mediana de latencia de la ingesta pasó de 1,9 s a 16,9 s (T3) | Las alertas se encolan y las envía un hilo aparte; el bucle que reenvía los eventos a n8n no espera |
| C3 | Lo que Cowrie registra con el forwarder detenido no se recupera (M0 y M2, `docs/evidencia/segmentacion/`) | El forwarder guarda en un volumen propio la posición del log hasta la que reenvió (archivo y desplazamiento). Al reiniciar, sigue desde ahí. Sin posición guardada, empieza desde el final, como antes. Si el archivo cambió (rotación), empieza desde el principio del archivo nuevo |
| C4 | Las alertas de `health-monitor` quedan solo en `error_log`, y con la base inaccesible (M3) no se registran | `health-monitor` envía cada alerta por Telegram. Si la consulta a la base falla, genera la alerta «base inaccesible» en lugar de fallar. El token es una credencial cifrada de n8n y el chat ID se carga al importar desde `.env`, de modo que ninguno de los dos queda en el repositorio |

### Pruebas

Para C1, C2 y C4, Telegram se reactiva temporalmente, con el mismo bot de las pruebas T, y se desactiva al terminar.

| ID | Procedimiento | Esperado |
|---|---|---|
| PC1 | Repetir T2 (`experimentos/sesion_telegram_html.py`) | Los 3 resúmenes `enviado`, incluido el del comando con `<`; el autor ve el texto `echo 'a<b'` en el mensaje |
| PC2 | Repetir T3 (Telegram inalcanzable) y T1 (normal) | 100 % de los eventos persistidos en ambas. Mediana de latencia en T3 de **hasta 1,5 veces la de T1** (antes: 8,9 veces). Las alertas de T3 figuran como `sin envío` |
| PC3 | Repetir M2: detener el forwarder, una corrida del simulador y volver a arrancarlo | **100 % de los eventos de esa corrida persistidos** (antes: 0 de 61); `health-monitor` no alerta después de la recuperación |
| PC4a | Repetir M1: desactivar `event-ingest` y una corrida del simulador | Alerta en `error_log` y **mensaje de Telegram** en el disparo siguiente |
| PC4b | Repetir M3: credencial de PostgreSQL con `ssl: false` | **Mensaje de Telegram «base inaccesible»** en el disparo siguiente (antes: ningún registro) |

## 2. Endurecimiento

| ID | Medida |
|---|---|
| H1 | `cap_drop: ALL` y `no-new-privileges` en todos los servicios; se agregan solo las capacidades que cada imagen necesite para arrancar, y se informan |
| H2 | Límites de memoria, CPU y cantidad de procesos en todos los servicios |
| H3 | Salida a Internet solo donde hace falta. Las redes `captura` y `proceso` pasan a `internal: true`. Una red nueva, `salida`, conecta solo a n8n (ip-api.com y Telegram) y al forwarder (Telegram). Los puertos de Cowrie se publican en el anfitrión con un contenedor de reenvío TCP (`cowrie-proxy`), porque Docker no publica puertos de redes `internal` |
| H4 | `log-reader` exige un token en cada pedido (variable `LOG_READER_TOKEN` en `.env`), quita la cabecera CORS `*` y deja de publicar el puerto 9000 en el anfitrión |
| H5 | `docker-compose.yml` exige `N8N_ENCRYPTION_KEY` (`${N8N_ENCRYPTION_KEY:?…}`): sin ella, el entorno no arranca, en lugar de generar una clave no portable |
| H6 | Healthcheck en todos los servicios de larga duración |

### Pruebas

| ID | Procedimiento | Esperado |
|---|---|---|
| PE1 | `docker inspect` de cada servicio | `CapDrop` = ALL, `no-new-privileges`, límites de memoria, CPU y procesos definidos; todos los servicios en estado `healthy` |
| PE2 | Conexión a 1.1.1.1:443 desde cada contenedor | **No conectan:** cowrie, attack-runner, log-reader y postgres. **Conectan** (control positivo): n8n y forwarder |
| PE3 | Repetir S1 a S10 (`scripts/conectividad.sh`) | Iguales que el 05/10, salvo S9 para el puerto 9000, que ahora **no** debe conectar |
| PE4 | `log-reader` sin token y con token | Sin token: HTTP 401. Con token: 200. Ninguna respuesta con `Access-Control-Allow-Origin` |
| PE5 | `docker compose config` con `N8N_ENCRYPTION_KEY` vacía | Falla con el mensaje definido |
| PE6 | Regresión de extremo a extremo: una corrida del simulador | 100 % de los eventos persistidos e idénticos al log de Cowrie, procesados por el extractor, sin alertas de `health-monitor` |

## 3. Criterio

No hay umbral global. Cada prueba se informa como cumplida o no cumplida frente a lo esperado. Las correcciones o medidas que no se puedan aplicar se informan como no aplicadas, con su motivo.

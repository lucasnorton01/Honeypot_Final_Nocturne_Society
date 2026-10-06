# Plan de pruebas: alertas por Telegram

Este plan se escribió el 06/10/2026, **antes** de configurar el bot y de ejecutar las pruebas. Lo que efectivamente ocurra se registra en `docs/evidencia/telegram/`. Si un resultado no coincide con lo esperado, se informa así.

## 1. Qué se prueba

La tesis declara en el §5.13.5 que las alertas por Telegram residen en el forwarder (`forwarder/forwarder.py`) y que su funcionamiento no se verificó. El forwarder envía tres tipos de alerta:
- una por cada `cowrie.session.connect`;
- una por cada `cowrie.login.failed`;
- un resumen por cada sesión autenticada (`cowrie.login.success`), al recibir su `cowrie.session.closed`, con la credencial y los comandos.

Las alertas no pasan por n8n.

Leyendo el código, antes de probar, se identifican cuatro riesgos. Cada uno se formula como hipótesis:

| ID | Riesgo | Hipótesis |
|---|---|---|
| R1 | `send_telegram` no registra el resultado del envío | Una alerta rechazada o no enviada no deja rastro (falla silenciosa) |
| R2 | Los mensajes usan `parse_mode: HTML` con valores del atacante sin escapar | Un comando con `<` o `&` hace que Telegram rechace el mensaje |
| R3 | El envío es sincrónico, en el mismo bucle que reenvía los eventos a n8n | Si Telegram no responde, cada alerta demora hasta 10 s el reenvío a n8n |
| R4 | Un mensaje por conexión y por login fallido | Una corrida del simulador (hasta unas 30 alertas en menos de un minuto) puede chocar con el límite de envío de Telegram (HTTP 429) |

## 2. Instrumentación (único cambio de código)

Para poder medir, `send_telegram` pasa a registrar en el log del forwarder cada intento, **sin cambiar qué se envía ni cuándo**:
- `[TG] <tipo> enviado (<ms> ms)`;
- `[TG] <tipo> rechazado HTTP <código>: <descripción de Telegram>`;
- `[TG] <tipo> sin envío: <clase de la excepción> (<ms> ms)`.

**El registro no incluye el token, la URL de la API ni el chat ID.** Ante una excepción se registra solo su clase, porque el mensaje de `requests` contiene la URL con el token.

## 3. Configuración y resguardo de secretos

- **Bot:** lo crea el autor con @BotFather. El token y el chat ID se escriben solo en `.env`, que no se publica; nadie más los copia ni los transcribe.
- **Recreación del forwarder:** se recrea con `docker compose up -d forwarder` para que lea las variables. Durante la recreación no corre el simulador; según el hallazgo del 05/10, lo que Cowrie registra con el forwarder detenido no se recupera.
- **Revisión antes de publicar:** la evidencia (log del forwarder y CSV) se revisa antes de publicarla buscando el patrón de un token de bot (`<dígitos>:<35 caracteres>`) y `api.telegram.org/bot`. No debe aparecer ninguno.
- **Contenido de las alertas:** incluyen credenciales de laboratorio en claro, las mismas que se publican en el repositorio.

## 4. Pruebas

| ID | Condición | Procedimiento | Esperado |
|---|---|---|---|
| T0 | Telegram desactivado, forwarder instrumentado | Una corrida del simulador | El pipeline persiste el 100 % de los eventos; no hay líneas `[TG]` |
| T1 | Telegram activado | Una corrida del simulador (`attack_ssh.py`, sin cambios) | Una línea `[TG]` por cada alerta esperada según el log de Cowrie (conexiones + logins fallidos + sesiones autenticadas cerradas). Se informan cuántas fueron `enviado` y cuántas `rechazado`; si hay 429, se confirma R4. El autor cuenta los mensajes recibidos en la aplicación. El pipeline persiste el 100 % |
| T2 | Telegram activado | Una sesión autenticada con comandos benignos que contienen `<` y `&` (`experimentos/sesion_telegram_html.py`), más un control con comandos sin esos caracteres | R2: el resumen con `<` o `&` es **rechazado** (HTTP 400) y el de control se envía. El pipeline persiste los eventos idénticos al log de Cowrie |
| T3 | Telegram inalcanzable: `api.telegram.org` resuelve a una dirección no enrutable (`docker-compose.telegram-caido.yml`) | Una corrida del simulador | R3: líneas `[TG] … sin envío` de unos 10 s cada una; la latencia `created_at − timestamp` crece frente a T1 en proporción a las alertas; el pipeline igual persiste el 100 % (se informa si `health-monitor` alerta) |
| T4 | Configuración normal, Telegram activado | Una corrida del simulador | Vuelve a ser como T1 |

**Métricas por prueba:**
- alertas esperadas, según el log de Cowrie;
- líneas `[TG]` por tipo y resultado;
- eventos en Cowrie frente a eventos en `events`;
- latencia `created_at − timestamp` (mediana, p95 y máxima);
- filas nuevas en `error_log`.

Entre una prueba y la siguiente se espera a que el forwarder termine de procesar la corrida.

**Sin umbral de aprobación:** el resultado describe el funcionamiento real de las alertas y reemplaza la frase «no verificado» del §5.13.5. Los defectos que se confirmen se informan como hallazgos. No se corrigen en esta prueba, salvo la instrumentación del §2.

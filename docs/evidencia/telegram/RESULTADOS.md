# Resultados: alertas por Telegram (06/10/2026)

Plan fijado antes de ejecutar: `docs/PRUEBAS_TELEGRAM.md` (registrado en BITACORA.md). Todas las horas son UTC. Métricas por prueba en `metricas.json`, intervalos en `ventanas_utc.txt` y líneas `[TG]` del forwarder en `forwarder_tg.log`.

## Pruebas

| ID | Condición | Eventos Cowrie / base | Alertas esperadas | Resultado del envío | Latencia mediana / p95 / máx. | ¿Como lo esperado? |
|---|---|---|---|---|---|---|
| T0 | Telegram desactivado | 85 / 85 | — | Ninguna línea `[TG]` | 2,2 s / 2,6 s / 4,4 s | Sí |
| T1 | Telegram activado | 60 / 60 | 20 (10 conexiones, 9 logins fallidos, 1 resumen) | 20 enviadas | 1,9 s / 3,2 s / 3,3 s | Sí; R4 no se confirma |
| T2 | Comandos con `<` y `&` | 33 / 33 | 6 (3 conexiones, 3 resúmenes) | 5 enviadas; el resumen con `echo 'a<b'`, **rechazado** (HTTP 400: `can't parse entities: Unsupported start tag`) | 1,3 s / 2,3 s / 2,4 s | En parte: R2 se confirma con `<`, no con `&` |
| T3 | `api.telegram.org` no enrutable | 57 / 57 | 20 | **0 enviadas**: las 20, `ConnectionError`, de 2,1 s cada una | **16,9 s / 25,3 s / 25,4 s** | Sí (R3) |
| T4 | Configuración normal | 69 / 69 | 24 | 24 enviadas | 2,3 s / 3,2 s / 4,3 s | Sí |
| T2b | Repetición de T2 (fuera del plan) | 33 / 33 | 6 | Igual que T2 | — | Sí |

En ninguna prueba hubo filas nuevas en `error_log` ni entregas `[ERR]` del forwarder a n8n.

## Recepción

- **T1:** el autor recibió los 20 mensajes. Copió su texto, que coincide con el log de Cowrie: las IP, las credenciales y los 7 comandos del resumen.
- **T2 y T4:** al principio no se vieron en la aplicación. Por eso se repitió T2 (T2b), y llegaron los 5 mensajes aceptados. El autor confirmó después que habían llegado todos: la aplicación se había trabado y no los mostraba.
- No se observó ninguna diferencia entre los envíos aceptados por Telegram (HTTP 200) y los recibidos.

## Hallazgos

1. **R1, falla silenciosa (se confirma).** Antes de la instrumentación, `send_telegram` descartaba el resultado. El rechazo de T2 y las 20 alertas perdidas de T3 no habrían dejado rastro. Desde esta prueba, el forwarder registra cada intento sin el token, la URL ni el chat ID.
2. **R2, HTML sin escapar (se confirma con `<`).** Un comando con `<` hace que Telegram rechace el resumen completo de la sesión: se pierden la credencial y todos sus comandos. `&&` no provocó el rechazo.
3. **R3, envío sincrónico (se confirma).** Cada envío bloquea el bucle que reenvía los eventos a n8n: unos 0,8 s cuando Telegram responde y unos 2,1 s cuando no es alcanzable. En T3, la mediana de latencia pasó de 1,9 s (T1) a 16,9 s. No se perdió ningún evento y `health-monitor` no alertó, porque los eventos llegaron dentro de su margen de 2 minutos. Con más tráfico, la demora se acumularía.
4. **R4, límite de envío (no se confirma).** Con hasta 24 alertas por corrida no hubo respuestas HTTP 429. No se probó con volúmenes mayores.
5. **Usabilidad.** Las alertas muestran la hora en UTC (`2026-10-06T11:27:00Z`), no en la hora local del operador.

## Desvíos

1. **Pérdida del log del forwarder de T0 a T3.** Al recrear el contenedor para T3 y T4, Docker descartó los logs anteriores. Las líneas `[TG]` de esas pruebas se toman de la salida del script de medición en el momento de cada prueba (`metricas.json`, campo `fuente_lineas_TG`). Los conteos de Cowrie, de la base y de latencia no se ven afectados, porque se leen del log de Cowrie y de PostgreSQL.
2. **Error en el script de medición.** La primera versión leía el log del forwarder sin fecha de fin y atribuía a cada prueba las líneas de las siguientes. Se corrigió (`--until`) antes de generar `metricas.json`.
3. **T2b**, repetición de T2 fuera del plan, para verificar la recepción.

## Secretos

El token del bot y el chat ID están solo en `.env`, que no se publica. Antes de publicar se verificó que ningún archivo de esta carpeta contiene el token, el chat ID, el patrón de un token de bot ni `api.telegram.org/bot`.

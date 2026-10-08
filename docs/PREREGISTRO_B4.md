# Registro previo de la validación B4

Registrado el 08/10/2026, **antes** del primer evento de la ventana, y publicado en el repositorio antes del inicio: `scripts/b4_iniciar.ps1` se niega a empezar si este archivo o cualquiera de los de la §6 tiene cambios sin publicar. Cualquier cambio posterior al inicio invalida la ventana y se declara.

## 1. Objetivo

La configuración final del 06/10/2026 (tag `Honeypot_Final_2026-10-06e`, idéntica en código al tag de la portada de la tesis) **nunca tuvo una ventana de validación propia**: la ventana B3 (05–06/10) corrió sobre el tag `Honeypot_Final_2026-10-05e`, antes de las siguientes correcciones. Esta ventana responde tres puntos:
1. **Validar la configuración final con una ventana propia**: cinco redes Docker (tres `internal`), `log-reader` con token, forwarder con posición guardada y envío de Telegram en un hilo aparte, consultas parametrizadas, `health-monitor` y PostgreSQL sin puerto publicado.
2. **Observar las alertas de Telegram activas** bajo la carga de una ventana. Es descriptivo: no tiene umbral.
3. **Repetir la observación del disparo de producción de las 08:00** (`0 8 * * *`), sin modificar `report-generator`, en una segunda noche.

No modifica ningún veredicto de la tesis: es un contraste más, como C1 y C2.

## 2. Ventana (fija)

- **Inicio:** `SELECT now()` en PostgreSQL inmediatamente después de vaciar las tablas, con `scripts/b4_iniciar.ps1`, **antes de las 22:25 ART del 08/10/2026**. Si no se completa antes de esa hora, la ventana no se inicia con otro horario sin registrarlo de nuevo.
- **Simulador:** `attack-runner` cada 15 minutos, desde las **22:30 ART del 08/10** hasta la corrida de las **07:45 ART del 09/10**, inclusive (38 corridas).
- **Extractor:** `ioc-extractor` con su cron de siempre (`*/15`); el disparo de las 08:00 procesa la última corrida.
- **Reporte:** el disparo de producción de `report-generator` a las **08:00 ART del 09/10** (11:00 UTC).
- **Cierre fijo: 08:15 ART del 09/10/2026 (11:15:00 UTC).** `scripts/b4_cerrar.ps1` no se ejecuta antes de esa hora. Si se ejecuta más tarde, `scripts/b4_exportar.js` igual descarta todo dato posterior a las 11:15:00 UTC.
- **La ventana no se extiende ni se acorta.** Si una falla de infraestructura interrumpe el stack (por ejemplo, un reinicio del equipo), se informa la ventana completa con la falla declarada; no se rellenan huecos ni se repiten corridas.
- No hay tráfico manual ni ejecuciones manuales de workflows durante la ventana.
- Telegram queda **activo**: el celular del autor recibirá las alertas de conexión, de login fallido y de resumen de sesión.

**Duración: unas 9,5 horas.** Es la disponibilidad del equipo anfitrión, que queda encendido durante la noche. Incluye el disparo de las 08:00.

## 3. Configuración (fija)

| Componente | Valor |
|---|---|
| Base del código | tag `Honeypot_Final_2026-10-08e` (commit `290a5c3`), cuyo código y evidencia son los del tag `Honeypot_Final_2026-10-06e`, más los archivos de este registro |
| Entorno | proyecto Docker `honeypot-b2`, tal como quedó el 06/10: cinco redes (`captura`, `proceso` y `datos` internal; `entrada` y `salida`), PostgreSQL y `log-reader` sin puerto publicado. Antes de vaciar las tablas, la base se respalda fuera del repositorio |
| Simulador | `attack-runner/attack_ssh.py` sin cambios desde B2 (`SIM_VERSION = "b3-2026-10-02"`): por corrida, de 4 a 14 intentos fallidos, una sesión exitosa con la cuenta de la franja de 15 min (rotación sobre 12 cuentas) y, con probabilidad 0,3, una segunda sesión exitosa; en la mitad de las sesiones exitosas, un comando benigno del patrón de IoC de tipo comando |
| Frecuencia del simulador | cada 15 minutos (tarea programada `HoneypotB4Runner`, que corre oculta) |
| `event-ingest`, `ioc-extractor`, `report-generator` | sin cambios respecto de B3; `report-generator` con el cron de producción `0 8 * * *`, zona `America/Argentina/Mendoza`. No se carga ningún flujo de validación |
| `health-monitor` | cron `*/5 * * * *` |
| Forwarder | `forwarder/forwarder.py` del tag, con Telegram configurado |

## 4. Hipótesis, métricas y umbrales (fijos)

Todas se calculan con `scripts/b4_analisis.js` sobre la evidencia exportada en `docs/evidencia/b4/`. Población: sesiones con `cowrie.login.success` en el log de Cowrie de la ventana. Intervalos de Wilson al 95 %.

`b4_analisis.js` es `b3_analisis.js` con estos cambios:
1. el disparo de las 08:00 se ubica 15 minutos antes del cierre fijo (11:00 UTC del 09/10);
2. P1 se informa también frente a la mediana de B1c (11,01 s);
3. se agrega la comprobación de la configuración final al cierre;
4. se agrega el resumen del forwarder y de Telegram.

Las definiciones de P1 a P4 y de la calidad de P3 son las de B3.

| Hipótesis | Métrica principal (veredicto) | Umbral |
|---|---|---|
| **P1** | Media de `created_at − timestamp` de todos los eventos de `events` frente a la mediana de B1 con los cinco participantes externos: **10,36 s** (la misma de B3). Se informa también frente a 11,50 s (siete participantes) y a 11,01 s (B1c) | media < 50 % de 10,36 s |
| **P2** | Proporción de eventos que cumplen el criterio estricto por tipo **y** proporción idéntica campo a campo al log de Cowrie | ambas ≥ 80 % |
| **P3** | **Completitud de extracción por sesión**: proporción de sesiones exitosas en las que `ioc_sessions` contiene todos los indicadores que las reglas del extractor derivan del log de Cowrie de esa sesión | ≥ 70 % |
| **P4** | Las tres condiciones: (a) en la ventana hay **una única** ejecución de `report-generator`, en modo `trigger`, con éxito, iniciada entre las 08:00:00 y las 08:01:00 ART del 09/10; (b) esa ejecución guarda su reporte en `reports`; (c) ese reporte cubre al menos el 90 % de las sesiones exitosas | (a), (b) y (c) |
| **Configuración final** (objetivo de B4) | Al cierre, los seis servicios (`cowrie`, `cowrie-proxy`, `forwarder`, `log-reader`, `postgres`, `n8n`) están corriendo; los únicos puertos publicados son `127.0.0.1:2222`, `127.0.0.1:2323` (hacia el 2223 de Cowrie) y `127.0.0.1:5678`; y las redes `captura`, `proceso` y `datos` son `internal` | todas las condiciones |

**P3, calidad (métrica secundaria, con umbral):** exactitud del catálogo y precisión de atribución, como en B3, **ambas ≥ 95 %**.

**Se informan sin valor de veredicto:**
- la operacionalización original de P3, por `event_id`;
- los indicadores nuevos por hora y las sesiones con un indicador nuevo;
- las ejecuciones de `health-monitor` y sus alertas (esperado: ninguna);
- la igualdad entre eventos capturados y persistidos;
- la duración de las ejecuciones del extractor;
- que no haya ejecuciones manuales;
- **el forwarder y Telegram:** entregas a n8n con y sin error, y alertas enviadas, rechazadas o sin envío por tipo (conexión, login fallido y resumen) frente a las que se esperan según el log de Cowrie, con la mediana de su tiempo de envío. Se obtienen del registro del forwarder, que no contiene el token ni el identificador del chat. Se informan los números tal como salgan.

**Advertencias registradas de antemano:**
- **P4:** cada reporte abarca las 24 horas previas y la ventana dura menos, así que el disparo de las 08:00 cubre, por construcción, todas las sesiones. Lo que P4 verifica es que el disparo de producción ocurre solo, en modo `trigger`, y guarda el reporte.
- **P3, calidad:** mide la exactitud del extractor respecto de **sus propias reglas**, no si un indicador es realmente malicioso.
- **Configuración final:** se verifica con el mismo guion simulado de siempre, desde una sola IP interna; no se prueba con tráfico real ni la resistencia a un atacante.
- **Telegram** depende de un servicio externo: un rechazo (por ejemplo, un límite de mensajes) se informa tal como ocurra y no invalida la ventana.
- **ip-api.com:** el origen es una dirección privada, por lo que el país queda «Desconocido»; no se evalúa.
- **Anticipaciones de los autores, antes de medir:** P1, P2, P3 y la configuración final deberían cumplirse, porque B3 cumplió las tres primeras y nada del extractor cambió. P4 se cumpliría por construcción. La incógnita real son las alertas de Telegram bajo carga.

## 5. Preparación y comprobaciones del inicio

`scripts/b4_iniciar.ps1` no inicia la ventana si falla alguna de estas condiciones:
- la hora es posterior a las 22:25 ART;
- la suspensión con el cargador conectado no está en «Nunca»;
- los archivos de la §6 tienen cambios sin publicar o `HEAD` no coincide con `origin/main`;
- los seis servicios no están corriendo, las redes `captura`, `proceso` y `datos` no son `internal`, o los cuatro workflows no están activos;
- el `report-generator` **cargado en n8n** no tiene `0 8 * * *`, o la zona de n8n no es `America/Argentina/Mendoza`;
- el forwarder no tiene Telegram configurado;
- Cowrie tuvo actividad en los últimos 25 minutos.

Después respalda la base, vacía las tablas y programa el simulador.

Pruebas previas:
- `b4_analisis.js` se corrió sobre una copia de la evidencia publicada de B3 y dio los mismos resultados en conteos, P1 a P4, calidad de P3, ejecuciones y `health-monitor`; solo agrega los campos nuevos.
- `b4_exportar.js` se probó contra el entorno de trabajo, en una carpeta temporal y en modo de solo lectura; produjo `configuracion_cierre.json` y `forwarder_resumen.json`, y el análisis dio «cumple» en la configuración final.
- La expresión que lee las alertas de Telegram del registro del forwarder se probó con líneas de ejemplo.

## 6. Integridad

| Archivo | SHA-256 |
|---|---|
| `scripts/b4_analisis.js` | `590e8b4276f9f04081a45b406ae18f15ba0e85646079f6c021eb7fd9899a0476` |
| `scripts/b4_exportar.js` | `082c30fe6a1774f3b8b1f0b3f81739722bf345d8314f951ae3a6f8721eb7e647` |
| `scripts/b4_iniciar.ps1` | `e0e55d95f626a703f720916436ef80a18b46478def417ebefd17a7aff1f715a2` |
| `scripts/b4_cerrar.ps1` | `ae7f13b81e3a59509d5824eb79da0c9546df2fecaea287854d60299738ddd6e0` |
| `attack-runner/attack_ssh.py` | `431935f641c115b97af2e562f88b706874bc62b0aa8231e0380b0e10f3f7b95e` |
| `cowrie/userdb.txt` | `7f33cfeac97bc8e245af949a30e1e70f76a34e43e274dde11a53e3129973486a` |
| `docker-compose.yml` | `2a67f708c5f9acd603640aba649d2896291a363e46ae5cb1f845c737bf945c34` |
| `forwarder/forwarder.py` | `4d60580a7a483ef6cccb3a9dd7f57575362152a9a401e535716d9ca5459f885b` |
| `db/schema.sql` | `4adc0b3a55d1e2564c8aacdff276bc105ac76cbc29e6bc1e42fa28066084c35c` |
| `n8n/workflows/event-ingest.json` | `1a8877c8a0f2ab5a4be6160890a888ccef749868b2e0af581808adb5c654440e` |
| `n8n/workflows/ioc-extractor.json` | `3b089c0fbcfba45441c034a2631166e14762381320565065e43331cbe51da451` |
| `n8n/workflows/report-generator.json` | `4315274a91918d49e16a156237f70ee49a54ef96e6262310b498af4a42ce6474` |
| `n8n/workflows/health-monitor.json` | `5464d6a55ab31f43f4914457c0d59e38e910e546f54215566e4aa320f44f6e2f` |

El SHA-256 de este archivo se registra en `BITACORA.md`.

## 7. Qué se hace con el resultado

Se publica salga lo que salga, también si algún umbral no se cumple o si la ventana se interrumpe. Si algo falla, se informa la causa y se la incorpora a la discusión; no se vuelve a medir dentro de B4.

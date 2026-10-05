# Registro previo de la validación B3

Registrado el 05/10/2026, **antes** del primer evento de la ventana, y publicado en el repositorio antes del inicio: `scripts/b3_iniciar.ps1` se niega a empezar si este archivo o cualquiera de los de la §6 tiene cambios sin publicar. Cualquier cambio posterior al inicio invalida la ventana y se declara.

## 1. Objetivo

B2 (02/10/2026) dejó tres puntos abiertos, que esta ventana responde:
1. **El disparo de las 08:00 ART de producción nunca se observó.** B2 adelantó el disparo diario a las 11:50 con la expresión `50 11 * * *`. En B3, `report-generator` corre **sin ninguna modificación**, con el cron de producción `0 8 * * *`.
2. **La muestra de B2 fue chica** (una hora, 15 sesiones exitosas). B3 dura unas 13 horas, con unas 50 corridas del simulador.
3. **P3 no tenía una métrica de calidad.** Se agregan dos, con umbral (§4).

Además, B3 es la primera ventana sobre el entorno con la red segmentada, las consultas parametrizadas y el workflow `health-monitor` (tag `Honeypot_Final_2026-10-05e`).

## 2. Ventana (fija)

- **Inicio:** `SELECT now()` en PostgreSQL inmediatamente después de vaciar las tablas, con `scripts/b3_iniciar.ps1`, **antes de las 19:25 ART del 05/10/2026**. Si no se completa antes de esa hora, la ventana no se inicia con otro horario sin registrarlo de nuevo.
- **Simulador:** `attack-runner` cada 15 minutos, desde las **19:30 ART del 05/10** hasta la corrida de las **07:45 ART del 06/10**, inclusive (50 corridas).
- **Extractor:** `ioc-extractor` con su cron de siempre (`*/15`); el disparo de las 08:00 procesa la última corrida.
- **Reporte:** el disparo de producción de `report-generator` a las **08:00 ART del 06/10** (11:00 UTC).
- **Cierre fijo: 08:15 ART del 06/10/2026 (11:15:00 UTC).** `scripts/b3_cerrar.ps1` no se ejecuta antes de esa hora. Si se ejecuta más tarde, `scripts/b3_exportar.js` igual descarta todo dato posterior a las 11:15:00 UTC.
- **La ventana no se extiende ni se acorta.** Si una falla de infraestructura interrumpe el stack (por ejemplo, un reinicio del equipo), se informa la ventana completa con la falla declarada; no se rellenan huecos ni se repiten corridas.
- No hay tráfico manual ni ejecuciones manuales de workflows durante la ventana.

**Duración: unas 13 horas, no 24.** Es la disponibilidad del equipo anfitrión, que queda encendido durante la noche. Alcanza para incluir el disparo de las 08:00.

## 3. Configuración (fija)

| Componente | Valor |
|---|---|
| Base del código | tag `Honeypot_Final_2026-10-05e` (commit `fa01b95`) más los archivos de este registro |
| Entorno | el mismo de las pruebas del 05/10 (proyecto Docker `honeypot-b2`), con la red segmentada en tres redes y PostgreSQL sin puerto publicado. Antes de vaciar las tablas, la base se respalda fuera del repositorio |
| Simulador | `attack-runner/attack_ssh.py` sin cambios desde B2 (`SIM_VERSION = "b3-2026-10-02"`): por corrida, de 4 a 14 intentos fallidos, una sesión exitosa con la cuenta de la franja de 15 min (rotación sobre 12 cuentas, cada cuenta vuelve cada 3 horas) y, con probabilidad 0,3, una segunda sesión exitosa; en la mitad de las sesiones exitosas, un comando benigno del patrón de IoC de tipo comando |
| Frecuencia del simulador | cada 15 minutos (tarea programada `HoneypotB3Runner`, que corre oculta) |
| `event-ingest` | sin cambios (consultas parametrizadas) |
| `ioc-extractor` | cron `*/15 * * * *`, sin cambios |
| `report-generator` | **cron de producción `0 8 * * *`**, zona `America/Argentina/Mendoza`, sin cambios. No se carga ningún flujo de validación |
| `health-monitor` | cron `*/5 * * * *`, sin cambios |

## 4. Hipótesis, métricas y umbrales (fijos)

Todas se calculan con `scripts/b3_analisis.js` sobre la evidencia exportada en `docs/evidencia/b3/`. Población: sesiones con `cowrie.login.success` en el log de Cowrie de la ventana. Intervalos de Wilson al 95 %.

`b3_analisis.js` es `b2_analisis.js` con estos cambios:
1. el veredicto de P1 frente a B1;
2. la calidad de P3;
3. la condición del disparo de las 08:00 en P4;
4. el resumen de `health-monitor`;
5. tolerancia a CSV con BOM.

Las definiciones de P2 y P3 (completitud) son las mismas de B2.

| Hipótesis | Métrica principal (veredicto) | Umbral |
|---|---|---|
| **P1** | Media de `created_at − timestamp` de todos los eventos de `events` frente a la línea de base manual de B1 con los cinco participantes externos: **10,36 s** (mediana por evento del paso 1). Se informa también frente a la de los siete participantes (11,50 s) | media < 50 % de 10,36 s |
| **P2** | Proporción de eventos que cumplen el criterio estricto por tipo **y** proporción idéntica campo a campo al log de Cowrie (como en B2) | ambas ≥ 80 % |
| **P3** | **Completitud de extracción por sesión** (como en B2): proporción de sesiones exitosas en las que `ioc_sessions` contiene todos los indicadores que las reglas del extractor derivan del log de Cowrie de esa sesión | ≥ 70 % |
| **P4** | Las tres condiciones: (a) en la ventana hay **una única** ejecución de `report-generator`, en modo `trigger`, con éxito, iniciada entre las 08:00:00 y las 08:01:00 ART del 06/10; (b) esa ejecución guarda su reporte en `reports`; (c) ese reporte cubre al menos el 90 % de las sesiones exitosas (autenticación dentro de su período) | (a), (b) y (c) |

**P3, calidad (métrica secundaria, con umbral):**
- **Exactitud del catálogo:** proporción de filas de `iocs` cuyo tipo y valor están entre los indicadores que las reglas derivan del log de Cowrie de la ventana. Detecta valores alterados, truncados o inventados; por ejemplo, por el escape de caracteres.
- **Precisión de atribución:** proporción de filas de `ioc_sessions` cuyo indicador es uno de los esperados para **esa** sesión. Detecta indicadores atribuidos a la sesión equivocada.
- **Umbral:** ambas ≥ 95 %.

**Se informan sin valor de veredicto:**
- la operacionalización original de P3, por `event_id`;
- la proporción de sesiones exitosas con al menos un indicador que aparece por primera vez en la ventana, y los indicadores nuevos por hora. La novedad depende sobre todo de la rotación del simulador;
- las ejecuciones de `health-monitor` y sus alertas (esperado: ninguna alerta);
- la igualdad entre eventos capturados y persistidos;
- la duración de las ejecuciones del extractor;
- que no haya ejecuciones manuales.

**Advertencias registradas de antemano:**
- **P4:** cada reporte abarca las 24 horas previas y la ventana dura 13, así que el disparo de las 08:00 cubre, por construcción, todas las sesiones. Lo que P4 verifica en B3 es que el **disparo de producción de las 08:00 ocurre solo, en modo `trigger`, y guarda el reporte**. No mide la frecuencia óptima del disparador.
- **P3, calidad:** mide la exactitud del extractor respecto de **sus propias reglas**, no si un indicador es realmente malicioso. Con un simulador de comandos benignos, esa precisión semántica no se puede medir. Por ejemplo, `ls /bin` coincide con el patrón de comando aunque no sea malicioso; es una limitación conocida de la regla.
- **Volumen:** se esperan unos 3.000 eventos, cada uno con su ejecución de `event-ingest`. El historial de n8n conserva hasta 10.000 ejecuciones (valor por omisión), por encima de lo esperado.

## 5. Preparación y comprobaciones del inicio

`scripts/b3_iniciar.ps1` no inicia la ventana si falla alguna de estas condiciones:
- la hora es anterior a las 19:25 ART;
- la suspensión con el cargador conectado está en «Nunca»;
- los archivos de la §6 no tienen cambios sin publicar y `HEAD` coincide con `origin/main`;
- los cinco servicios están corriendo y los cuatro workflows están activos;
- el `report-generator` **cargado en n8n** tiene `0 8 * * *` y la zona de n8n es `America/Argentina/Mendoza`;
- Cowrie no tuvo actividad en los últimos 25 minutos, para que `health-monitor` no compare eventos anteriores al vaciado.

Después respalda la base, vacía las tablas y programa el simulador.

`scripts/b3_exportar.js` reemplaza el paso en Python de B2, que falló porque `python` era el alias de la Microsoft Store (desvío 2 de B2). Usa `node:sqlite` con la copia del WAL y escribe los archivos en UTF-8 sin BOM.

Pruebas previas:
- `b3_analisis.js` se corrió sobre una copia de la evidencia publicada de B2 y reprodujo sus cifras:
  - P1: 1.453,16 ms, el 14,0 % de 10,36 s;
  - P2: 629/629 y 628/629;
  - P3: 15/15, y 9/15 por `event_id`;
  - P4: cobertura 15/15, pero **no cumple** la condición (a), porque el disparo de B2 fue a las 11:50.
  - La calidad de P3 en B2 da 26/26 y 211/211.
- `b3_exportar.js` se probó contra el entorno de trabajo, en una carpeta temporal y en modo de solo lectura.

## 6. Integridad

| Archivo | SHA-256 |
|---|---|
| `scripts/b3_analisis.js` | `0aed9757daac627fa92d8f65a7d663874085a28229bb4068fdd4c12faac4f4f5` |
| `scripts/b3_exportar.js` | `1c03ce98bc72a798f4ebac8e404e95ae6e17e1434054c3130895b5fda8678608` |
| `scripts/b3_iniciar.ps1` | `12dbb96f0018ef3a733e6bf9e1d55b5ce4ef4597a4a7000c1f5a66a023055d27` |
| `scripts/b3_cerrar.ps1` | `88f5a0c82d3e75def140a16fe17eba323f5d44f0d08d0e57770cb2c1b8e46aba` |
| `attack-runner/attack_ssh.py` | `431935f641c115b97af2e562f88b706874bc62b0aa8231e0380b0e10f3f7b95e` |
| `cowrie/userdb.txt` | `7f33cfeac97bc8e245af949a30e1e70f76a34e43e274dde11a53e3129973486a` |
| `docker-compose.yml` | `33c903619e39ced12425f4af20f7761ae1d5161f7e3c4a45b966115ffb681d52` |
| `n8n/workflows/event-ingest.json` | `1a8877c8a0f2ab5a4be6160890a888ccef749868b2e0af581808adb5c654440e` |
| `n8n/workflows/ioc-extractor.json` | `3b089c0fbcfba45441c034a2631166e14762381320565065e43331cbe51da451` |
| `n8n/workflows/report-generator.json` | `4315274a91918d49e16a156237f70ee49a54ef96e6262310b498af4a42ce6474` |
| `n8n/workflows/health-monitor.json` | `d975e25647aab7fb3a79065337749aead9342e0cdc753aa4a3aeb1287feca754` |

El SHA-256 de este archivo se registra en `BITACORA.md`.

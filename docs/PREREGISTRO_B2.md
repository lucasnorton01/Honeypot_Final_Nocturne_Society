# Registro previo de la validación B2

Registrado el 2026-10-02, **antes** del primer evento de la ventana. Este archivo, el script de análisis, el simulador y los flujos de n8n quedan fijados con sus SHA-256; cualquier cambio posterior al inicio invalida la ventana y se declara.

## 1. Objetivo

Repetir el contraste de P1–P4 con las reglas fijadas de antemano, para responder a tres debilidades de las validaciones del 28/09 y del 30/09/2026: el cierre de la ventana no estaba prefijado (P4 sensible al momento de cierre), el disparo diario de `report-generator` nunca se observó y la medición de P3 sobre `ioc_sessions` se definió después de ver los datos.

## 2. Ventana (fija)

- **Inicio:** `SELECT now()` en PostgreSQL inmediatamente después de vaciar las tablas (`scripts/b2_iniciar.ps1`), antes de las 10:55 ART del 02/10/2026. Si el inicio no se completa antes de esa hora, la ventana no se inicia con otro horario sin registrarlo de nuevo.
- **Simulador:** `attack-runner` cada 5 minutos, desde las **10:55 ART** hasta la corrida de las **11:40 ART del 02/10/2026**, inclusive (10 corridas).
- **Extractor:** el disparo de las **11:45 ART** de `ioc-extractor` (cron `*/15`, sin cambios) procesa la última corrida.
- **Reporte:** disparo diario de `report-generator` a las **11:50 ART** (expresión `50 11 * * *`).
- **Cierre:** **11:55 ART (14:55 UTC) del 02/10/2026**, con `scripts/b2_cerrar.ps1`, que además restituye el flujo de producción (`0 8 * * *`).
- La ventana **no se extiende ni se acorta**. Si una falla de infraestructura interrumpe el stack, la ventana se descarta entera y se declara; no se rellenan huecos.
- No hay tráfico manual ni ejecuciones manuales de workflows durante la ventana.

Duración elegida: **una hora**, por disponibilidad del equipo anfitrión. Se compensa con el simulador cada 5 minutos; la muestra esperada es de unas 15 sesiones exitosas, menor que la del 30/09/2026 (41).

## 3. Configuración (fija)

| Componente | Valor |
|---|---|
| Base del código | commit `4f44f83` (tag `Honeypot_Final_2026-10-02`) más los cambios de este registro |
| Entorno | instalación nueva en el equipo del autor (proyecto Docker `honeypot-b2`, volúmenes nuevos) |
| Simulador | `attack-runner/attack_ssh.py`, `SIM_VERSION = "b3-2026-10-02"`: 12 cuentas válidas con rotación por franja de 15 min, 20 comandos de reconocimiento y, en el 50 % de las sesiones exitosas, un comando benigno del patrón de IoC de tipo comando (`ls /bin`, `bash --version`, `python3 -V`, `which sh`, `ls -la /usr/bin`) |
| Frecuencia del simulador | cada 5 minutos (tarea programada de Windows `HoneypotB2Runner`) |
| Cuentas válidas | `cowrie/userdb.txt`, 12 cuentas |
| `ioc-extractor` | cron `*/15 * * * *` (sin cambios) |
| `report-generator` | **expresión diaria `50 11 * * *`**: un único disparo por día, como el de producción (`0 8 * * *`), adelantado a las 11:50 ART para observarlo dentro de la ventana. El flujo de la ventana (`experimentos/report-generator-b2-2026-10-02.json`) es idéntico al de producción salvo esa expresión; no se usa el cron de validación de 2 horas |
| `event-ingest` | sin cambios |

## 4. Hipótesis, métricas y umbrales (fijos)

Todas se calculan con `scripts/b2_analisis.js` sobre la evidencia exportada en `docs/evidencia/b2/`. Población: sesiones con `cowrie.login.success` en el log de Cowrie de la ventana. Intervalos de Wilson al 95 %.

| Hipótesis | Métrica principal (veredicto) | Umbral |
|---|---|---|
| **P1** | Media de `created_at − timestamp` de todos los eventos de `events`, frente a la línea de base manual **medida** en B1 (mediana por evento del paso 1, triaje y extracción). Si B1 no se completa, frente a la estimación de ≈30 s, y se declara. | media < 50 % de la línea de base |
| **P2** | Proporción de eventos que cumplen el criterio estricto por tipo (eventid, session y timestamp; usuario y contraseña en `cowrie.login.*`; input en `cowrie.command.input`; src_ip y src_port en `cowrie.session.connect`) **y** proporción idéntica campo a campo al log de Cowrie | ambas ≥ 80 % |
| **P3** | **Completitud de extracción por sesión**: proporción de sesiones exitosas en las que `ioc_sessions` (creadas hasta el cierre) contiene **todos** los indicadores que las reglas del extractor derivan del log de Cowrie de esa sesión (IP de `session.connect`, `usuario:contraseña`, comandos que coinciden con el patrón, hashes) | ≥ 70 % |
| **P4** | Proporción de sesiones exitosas cuya autenticación queda dentro del período de algún reporte generado por el **disparo diario** en modo `trigger` | ≥ 90 % |

**Se informan además, sin valor de veredicto:** la operacionalización original de P3 (fila en `iocs` atribuida por `event_id`), por continuidad con el 28/09 y el 30/09; la cantidad de sesiones con comando de IoC; la duración de las ejecuciones; la igualdad entre eventos capturados y persistidos; y cero ejecuciones manuales.

**Advertencia registrada de antemano sobre P4:** cada reporte abarca las 24 horas previas a su generación y la ventana dura una hora, por lo que un único disparo diario posterior a la última sesión cubre, por construcción, todas las sesiones. Lo que P4 verifica en B2 es que el **disparo diario programado ocurre en modo `trigger`, sin intervención**, y que su reporte cubre las sesiones; no mide la frecuencia óptima del disparador ni el disparo de las 08:00 ART de producción, que sigue sin observarse.

## 5. Preparación y prueba previa (antes del inicio)

En la instalación nueva, la credencial de PostgreSQL importada desde la plantilla (`ssl: false`) hizo fallar todas las inserciones con «The server does not support SSL connections», mientras el forwarder registraba las entregas como `[OK]`: es la misma falla silenciosa que la tesis declara para el lote 1. Se corrigió importando la credencial con `ssl: "disable"`; una segunda corrida de prueba persistió los 38 eventos que registró Cowrie. Las tablas se vacían al iniciar la ventana, de modo que ningún dato de prueba integra la evidencia.

## 6. Integridad

| Archivo | SHA-256 |
|---|---|
| `scripts/b2_analisis.js` | `0b7739759032df8b2172932354db0aab69ffa2787d340d94dd1fc47329be9837` |
| `scripts/b2_iniciar.ps1` | `fe5520396247888db87819baaeb1276ae9d96dff524a8e0b78f38e8eb4a2a4cb` |
| `scripts/b2_cerrar.ps1` | `5beb9f3bed98c1a9c904b0bc429b8b8405e5e8df5d3db64bb9c5851029cecf0f` |
| `attack-runner/attack_ssh.py` | `431935f641c115b97af2e562f88b706874bc62b0aa8231e0380b0e10f3f7b95e` |
| `cowrie/userdb.txt` | `7f33cfeac97bc8e245af949a30e1e70f76a34e43e274dde11a53e3129973486a` |
| `n8n/workflows/event-ingest.json` | `8db4dbaca4efbd5916434537037b21859ceb4f0b17613ab682398aea0eb926d5` |
| `n8n/workflows/ioc-extractor.json` | `129891d9f1475d1a9e7b9a673e7a1a46780d194dcbe11db82427845e1105732b` |
| `n8n/workflows/report-generator.json` (producción) | `59ec0c32469b38f84413914e5644da26a387aea2ad628fe2cc296e21ba434022` |
| `experimentos/report-generator-b2-2026-10-02.json` (ventana) | `2da736dc2b90a1104a85c5850ad08aab87dfacbb7a465043ea6b12e16c0ff8ea` |

El script de análisis se probó antes del inicio sobre la evidencia publicada del 30/09/2026 y reprodujo sus cifras (P2 1998/1998; P3 por `event_id` 6/41 y sobre `ioc_sessions` 39/41; P4 35/41).

## 7. Línea de base manual (B1)

Página de cronometraje: 20 eventos reales del 30/09/2026 (muestra con semilla fija `20260930`) más 2 de práctica. Mide por separado el paso 1 (triaje y extracción, fases 1-2 de la Tabla 6.1) y el paso 2 (clasificación y documentación, fases 4-5). La fase 3 (enriquecimiento externo) no se mide porque todas las IP son internas del laboratorio. **Los participantes son integrantes del equipo autor**: conocen el sistema y los datos, lo que tiende a acortar sus tiempos y favorece al procesamiento manual en la comparación; se declara como sesgo.

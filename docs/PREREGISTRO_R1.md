# Registro previo de la validación R1

Registrado el 10/10/2026, **antes** de la primera sesión válida de la ventana, y publicado en el repositorio (commit y tag `Honeypot_R1_prereg`) antes del inicio: `scripts/r1_iniciar.ps1` se niega a empezar si este archivo o cualquiera de los de la §7 tiene cambios sin publicar, si `HEAD` no coincide con `origin/main` o si el tag no está publicado y apuntando a `HEAD`. Cualquier cambio posterior al inicio invalida la ventana y se declara; toda decisión que se tome después de ver los datos se declara como **posterior**.

## 1. Objetivo

Todas las validaciones anteriores (L0, W1, W2, C1, C2, C3) usaron un estímulo escrito por el propio equipo: un guion fijo de doce cuentas y comandos de reconocimiento benignos. R1 responde una pregunta distinta: **¿el pipeline captura, estructura e indexa bien el comportamiento de atacantes reales?**

El estímulo son sesiones reales de un dataset público (Wang et al., 2025), reproducidas por los autores contra Cowrie, dentro del laboratorio y **sin exponer ningún servicio a Internet**. R1 entra en la tesis como validación ampliada: **no modifica ningún veredicto** (P1 a P4, ventana de veredicto W2), ni los umbrales, ni los objetivos.

## 2. Dataset y muestra (fijos)

- **Dataset:** Wang et al. (2025), «Unveiling Evolving Threats: A Data Analysis for Next-Generation Honeypot Development», IEEE SRDS. https://github.com/zyw-286/shell-attack-evolution-dataset, commit `d5f7fe120ebd921e04026b6348c3ec5d399c5df6`, licencia CC BY 4.0 (código MIT). Formato y campos: `docs/evidencia/r1/DATASET_CAMPOS.md`. El archivo de sesiones usado, `dataset/sessions/2024.jsonl`, tiene SHA-256 `7ea4b916841708c36dbe24f95b882f06335e85ed2e77bdc70ba985c9c9653752`.
- **Período y unidad:** 2024 (01/03 a 26/06/2024), 6.658 «sesiones efectivas». Una sesión del dataset es el conjunto ordenado de comandos únicos posteriores a la autenticación de una misma dirección de origen, no una conexión TCP.
- **Elegibilidad** (`scripts/r1_muestra.js`): de 1 a 30 comandos; ningún comando con más de 500 caracteres, vacío, con caracteres de control o no ASCII; y credenciales del primer login exitoso de su origen, en el registro crudo del dataset, con usuario y contraseña que cumplan `^[A-Za-z0-9._@%+=,-]{1,32}$`. De 6.658 sesiones, 5.540 son elegibles (descartes: 3 por cantidad de comandos, 4 por caracteres, 111 por longitud, 1.000 por credencial).
- **Muestra:** **N = 200** sesiones elegibles, con la semilla **20261010** (mulberry32 y Fisher-Yates sobre las elegibles ordenadas por `session_id`). N se fijó por el tiempo disponible (la reproducción de 200 sesiones lleva unas 5 horas de ventana con los lotes de la §3), no por el contenido de la muestra, que no se examinó antes de fijar la semilla. La muestra tiene 1.020 comandos (de 1 a 28 por sesión; promedio, 5,1), 165 cuentas distintas (muestra y piloto) y estas sesiones por protocolo de origen: 161 SSH, 37 Telnet y 2 SSH y Telnet. `docs/evidencia/r1/muestra_r1.jsonl` (SHA-256 en la §7) y su metadato `muestra_r1_meta.json` registran todo. No incluyen direcciones IP de origen.
- **Piloto** (no computa): las 5 sesiones siguientes de la misma lista, que no están en la muestra (`piloto_r1.jsonl`).

## 3. Procedimiento y ventana (fijos)

**Reproductor** (`attack-runner/replay_dataset.py`): por cada sesión de la muestra se conecta a Cowrie por SSH desde `attack-runner`, se autentica con las credenciales de esa sesión, espera 1 s, y envía cada comando en el orden original, con la demora original entre comandos acotada entre 0,3 s y 5 s (813 de los 1.020 comandos tienen demora original; los demás, 1 s). Tras cada comando espera el prompt (hasta 8 s) antes de seguir. Cierra el canal 1 s después del último comando. El reproductor escribe por la salida estándar una línea «REPLAY» por paso (inicio y fin de sesión, login y cada comando enviado, con su hora UTC): ese registro es la **verdad de referencia** de lo enviado.

**Cowrie:** sin salida a Internet (comprobado el 10/10/2026: las conexiones salientes desde el contenedor fallan), de modo que los `wget` y `curl` del dataset fallan y solo quedan registrados; por eso no habrá hashes de archivos descargados. La configuración de red y de contenedores no cambia respecto de C3. El único cambio de configuración es `cowrie/userdb.txt`: se agregaron las 165 cuentas de la muestra y del piloto (`userdb_r1_agregado.txt`). Cowrie se reinició después de agregarlas.

**Ventana:**
- **Inicio:** `SELECT now()` en PostgreSQL inmediatamente después de respaldar y vaciar las tablas, con `scripts/r1_iniciar.ps1`, **antes de las 21:25 ART del 10/10/2026**. Si no se completa antes de esa hora, la ventana no se inicia con otro horario sin registrarlo de nuevo.
- **Reproducción:** 20 lotes de 10 sesiones (las sesiones 1 a 200 de la muestra, en orden), uno cada 15 minutos, desde las **21:30 ART del 10/10** hasta las **02:15 ART del 11/10** (tarea programada `HoneypotR1Runner`, oculta). El lote de cada corrida se calcula por la hora de inicio (21:30 ART = lote 0); una corrida que no se ejecute no se repite.
- **Extractor:** `ioc-extractor` con su cron de siempre (`*/15`). **Reporte:** el disparo de producción de `report-generator` a las **08:00 ART del 11/10** (11:00 UTC), sin modificarlo.
- **Cierre fijo: 08:15 ART del 11/10/2026 (11:15:00 UTC).** `scripts/r1_cerrar.ps1` no se ejecuta antes de esa hora y `scripts/r1_exportar.js` descarta todo dato posterior. La ventana no se extiende ni se acorta. Si una falla de infraestructura interrumpe el stack, se informa la ventana completa con la falla declarada; no se rellenan huecos ni se repiten corridas.
- **Sin intervención manual** durante la ventana: ni tráfico propio ni ejecuciones manuales de workflows. Telegram queda **activo**, como en la configuración final.

## 4. Configuración (fija)

Como en el registro previo de C3 (`docs/PREREGISTRO_B4.md`, §3): proyecto Docker `honeypot-b2` con cinco redes (`captura`, `proceso` y `datos` internal; `entrada` y `salida`), PostgreSQL y `log-reader` sin puerto publicado, workflows `event-ingest`, `ioc-extractor`, `report-generator` (cron `0 8 * * *`, zona `America/Argentina/Mendoza`) y `health-monitor` (`*/5 * * * *`) sin cambios, forwarder con Telegram y `attack-runner` sin cambios de imagen ni de compose: el reproductor y la muestra se montan en el contenedor al ejecutarlo. Los SHA-256 de los archivos de código, de los workflows y de `docker-compose.yml` son **idénticos a los de C3**; solo cambia `cowrie/userdb.txt`.

## 5. Criterios (fijos)

Todos se calculan con `scripts/r1_analisis.js` sobre la evidencia exportada en `docs/evidencia/r1/`. Población: sesiones con `cowrie.login.success` en el log de Cowrie de la ventana. Intervalos de Wilson al 95 %. Cada sesión reproducida se asocia con la única sesión de Cowrie cuyo `cowrie.session.connect` cae entre 0,5 s antes del inicio de su reproducción y 0,5 s después de su login; una sesión sin pareja única cuenta sus comandos como no capturados.

| # | Criterio | Definición | Umbral |
|---|---|---|---|
| 1 | **Captura** (exhaustividad) | Proporción de los comandos enviados (verdad de referencia) que aparecen como `cowrie.command.input` en la tabla `events`, en la sesión que corresponde, con el mismo texto sin espacios en los extremos, cada evento contado una sola vez. Se informa también contra el log de Cowrie (diagnóstico) | **≥ 95 %** |
| 2 | **Ingesta** | Todos los eventos del log de Cowrie están persistidos en `events` y no hay claves sin par (`sesión`, `eventid`, `timestamp`) | **100 %** y 0 claves sin par |
| 3 | **P2 estricto** | Como en C3: proporción de eventos que cumplen el criterio estricto por tipo **y** proporción idéntica campo a campo al log de Cowrie | **ambas ≥ 80 %** |
| 4 | **P3′** (completitud por sesión) | Proporción de sesiones autenticadas en las que `ioc_sessions` contiene todos los indicadores que las reglas del extractor derivan del log de Cowrie de esa sesión (IP de `cowrie.session.connect`, `usuario:contraseña` de todo evento que lo tenga, comandos que coinciden con el patrón `wget\|curl\|nc \|python\|/bin\|sh \|bash\|chmod\|tftp` y hashes SHA-256) | **≥ 70 %** |
| 5 | **Indicadores de tipo comando** | Precisión y exhaustividad del extractor contra los comandos de la verdad de referencia que cumplen su patrón, en el catálogo (`iocs`) y por sesión (`ioc_sessions`), con el comando sin espacios en los extremos y limitado a 500 caracteres | Sin umbral: se informa |
| 6 | **Descriptivo** | Técnicas ATT&CK de las sesiones de la muestra (las que asigna el dataset) frente a los tipos de IoC que genera el pipeline: por técnica, cuántas sesiones tienen al menos un indicador de tipo comando; y cantidad de IoC por tipo. Comandos enviados que no cumplen el patrón, por su primera palabra | Sin umbral |
| 7 | **P4** | Solo si el disparo de producción de las 08:00 ART cae dentro de la ventana (así está planeado): una única ejecución de `report-generator`, en modo `trigger`, con éxito, entre las 08:00:00 y las 08:01:00 ART; su reporte guardado en `reports`; y cobertura de al menos el 90 % de las sesiones autenticadas. Si el disparo no ocurre, **no se evalúa** y se declara | Informativo: P4 ya tiene veredicto (W2) |

**Se informan sin valor de veredicto:** latencia de persistencia (P1 ya tiene veredicto), exactitud del catálogo y precisión de atribución de P3, ejecuciones del extractor y de `health-monitor` (esperado: sin errores ni alertas), ejecuciones manuales (esperado: cero), configuración al cierre (seis servicios corriendo, puertos publicados solo en `127.0.0.1` y redes `captura`, `proceso` y `datos` internal), y el forwarder y Telegram (entregas, alertas enviadas y rechazadas, y tiempos). Las cifras se informan tal como salgan.

## 6. Advertencias registradas de antemano

- **El comportamiento es real, pero lo reproducen los autores:** los comandos son los de atacantes reales, pero la conexión, el orden de las sesiones, la temporización (acotada a un máximo de 5 s) y la ausencia de reintentos y de respuestas ante la emulación son decisiones del reproductor. No se evalúa cómo reaccionaría un atacante real ante el honeypot.
- **El origen sigue siendo una dirección interna:** todas las sesiones llegan desde `attack-runner` (red `captura`). No se ejerce la geolocalización (el país queda «Desconocido») ni se prueba la diversidad de orígenes.
- **Las descargas fallan por diseño:** Cowrie no tiene salida a Internet. No habrá archivos descargados ni hashes, y los indicadores de tipo hash no se ejercen.
- **La sesión del dataset es la unidad del dataset, no una conexión:** reúne comandos únicos de un origen durante el período; las repeticiones del mismo comando no se reproducen. Las sesiones de Telnet del dataset se reproducen por SSH.
- **Credenciales:** vienen del primer login exitoso del origen y se filtran por formato; 1.000 de 6.658 sesiones se excluyen por ese criterio. La población de R1 no es una muestra aleatoria de todos los ataques de 2024, sino de las sesiones elegibles.
- **Criterio 5:** la verdad de referencia usa el patrón del propio extractor. Mide su fidelidad a sus reglas, no si un comando es malicioso, ni qué comandos maliciosos omite; lo segundo se describe en el criterio 6.
- **Criterio 1:** mide la captura de lo que el reproductor consigue enviar; el reproductor espera el prompt tras cada comando para no perder entradas. Un comando que el reproductor no envía (por ejemplo, tras un `exit`) no entra en la verdad de referencia.
- **P4 se cumpliría por construcción** (cada reporte abarca las 24 horas previas).
- **Telegram** depende de un servicio externo: un rechazo se informa y no invalida la ventana. **ip-api.com:** no se evalúa.
- **R1 no es una réplica independiente** de las validaciones previas: usa la misma arquitectura y los mismos autores.
- **Anticipaciones de los autores, antes de medir:** el piloto de 5 sesiones (28 comandos) dio 28 de 28 comandos capturados, ingesta del 100 %, P2 estricto del 100 % y P3′ de 5 de 5; por eso se espera que los criterios 1 a 4 se cumplan. La incógnita real es el comportamiento con comandos más largos, con caracteres especiales y con comandos que se encadenan; y cuántas técnicas del dataset no producen ningún indicador de tipo comando.

## 7. Preparación, pruebas previas e integridad

Piloto del 10/10/2026 (12:35 ART, no computa): 5 sesiones, 28 comandos, `docs/evidencia/r1/piloto_replay.log`. El log de Cowrie tiene los 28 comandos como `cowrie.command.input` y la tabla `events` los 80 eventos de las 5 sesiones; el extractor los procesó sin errores. `r1_analisis.js` y `r1_exportar.js` se corrieron sobre los datos del piloto (en una carpeta temporal): emparejaron las 5 sesiones y dieron captura de 28 de 28, ingesta de 80 de 80, P2 estricto de 80 de 80 y P3′ de 5 de 5. Antes de la ventana, `r1_iniciar.ps1` respalda la base (fuera del repositorio) y vacía las tablas, con lo que el piloto no entra en la ventana.

`scripts/r1_iniciar.ps1` no inicia la ventana si falla alguna de las condiciones del registro de C3 (§5 de `docs/PREREGISTRO_B4.md`: hora, suspensión, archivos publicados, servicios, redes, workflows, cron de producción, zona de n8n, Telegram y Cowrie sin actividad en los últimos 25 minutos) o, además: si el tag `Honeypot_R1_prereg` no está publicado y apuntando a `HEAD`, o si el `userdb.txt` cargado en Cowrie no tiene las cuentas del repositorio.

| Archivo | SHA-256 |
|---|---|
| `scripts/r1_analisis.js` | `edf1e35333c73d2dfa9eda4a3e95e6471a91aeb194e0cadde559853fdebbc8ae` |
| `scripts/r1_exportar.js` | `5732c2e8a0563a6642a06f75d063c9d1609f1527a16ac8f506ce03974494cb4c` |
| `scripts/r1_iniciar.ps1` | `ab92eb3bdaa5bb1cfffb009ce4def8c2a20adc854e599e8df2f8d3321df03118` (versión corregida; ver §9) |
| `scripts/r1_cerrar.ps1` | `7a8160ad1bd75370e69a87a194d67471bd174233a5a9b283804d3a6ecd248623` |
| `scripts/r1_muestra.js` | `47bc8f5061deb386a1ab1787aafaf0d3b2371776add5412b09ee5d4bfda733e0` |
| `attack-runner/replay_dataset.py` | `20d746077216cee2e01ef989c304784ed46b6ab6f4631882c25946e1e4851b97` |
| `docs/evidencia/r1/muestra_r1.jsonl` | `d94987144ebe6e74eb412cd012061cad0bc39b4d450c4a5adc3c9f206ea20002` |
| `docs/evidencia/r1/muestra_r1_meta.json` | `e0c6af4b05d62d4e5ff59b2d73db1bf1ba60776ad6a08702352881d763e5e44e` |
| `docs/evidencia/r1/userdb_r1_agregado.txt` | `f2c1a965bd0edf83d793aaeaee695719ac9b1cce24e9ec0100187c72aa6c09be` |
| `docs/evidencia/r1/DATASET_CAMPOS.md` | `97d8152a0c0961c118105cce3923499234673cf5e06de2c47df1c7058c254386` |
| `cowrie/userdb.txt` | `8337c39c42a95d92f6e470a045dd9e89170fdd67c44b9a5561125181f8bbf4b8` |
| `attack-runner/attack_ssh.py` | `431935f641c115b97af2e562f88b706874bc62b0aa8231e0380b0e10f3f7b95e` |
| `attack-runner/Dockerfile` | `1621fa555d734b14ca9faef1cfcb10fbc5e7d9e119d0fd3584d85f3d2b71dcff` |
| `docker-compose.yml` | `2a67f708c5f9acd603640aba649d2896291a363e46ae5cb1f845c737bf945c34` |
| `forwarder/forwarder.py` | `4d60580a7a483ef6cccb3a9dd7f57575362152a9a401e535716d9ca5459f885b` |
| `db/schema.sql` | `4adc0b3a55d1e2564c8aacdff276bc105ac76cbc29e6bc1e42fa28066084c35c` |
| `n8n/workflows/event-ingest.json` | `1a8877c8a0f2ab5a4be6160890a888ccef749868b2e0af581808adb5c654440e` |
| `n8n/workflows/ioc-extractor.json` | `3b089c0fbcfba45441c034a2631166e14762381320565065e43331cbe51da451` |
| `n8n/workflows/report-generator.json` | `4315274a91918d49e16a156237f70ee49a54ef96e6262310b498af4a42ce6474` |
| `n8n/workflows/health-monitor.json` | `5464d6a55ab31f43f4914457c0d59e38e910e546f54215566e4aa320f44f6e2f` |

Los archivos con extremos de línea CRLF en el equipo (`cowrie/userdb.txt`, `attack-runner/attack_ssh.py` y `attack-runner/Dockerfile`) se registran con los bytes del equipo, como en los registros anteriores. El SHA-256 de este archivo se registra en `BITACORA.md`.

## 8. Qué se hace con el resultado

Se publica salga lo que salga, también si algún umbral no se cumple o si la ventana se interrumpe. Si algo falla, se informa la causa y se la incorpora a la discusión; no se vuelve a medir dentro de R1. R1 entra en la tesis como validación ampliada y **no modifica los veredictos de P1 a P4**.

## 9. Corrección anterior al inicio (10/10/2026)

Al ejecutar `scripts/r1_iniciar.ps1` por primera vez, falló la comprobación del `userdb.txt` cargado en Cowrie, antes de cualquier cambio de estado (no se respaldó ni se vació nada, y no hubo ninguna sesión de la ventana): la imagen de Cowrie no tiene `sh`, que el script usaba para contar las líneas del archivo. Se corrigió ese comando (ahora usa `python3`, que la imagen sí tiene) y se cambió el tag de referencia que comprueba el script a `Honeypot_R1_prereg2`, que apunta al commit con la corrección. El tag `Honeypot_R1_prereg` (commit `81748dc`) sigue publicado sin cambios. Se corrigió únicamente `scripts/r1_iniciar.ps1` y la fila de su SHA-256 en la §7; ningún criterio, umbral, muestra ni otro script cambió. La corrección se publica (commit y tag) antes de iniciar la ventana y, por lo tanto, antes de la primera sesión válida.

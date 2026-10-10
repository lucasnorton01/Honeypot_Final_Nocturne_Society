# Dataset usado en R1: formato y campos

**Fuente.** Wang et al. (2025), «Unveiling Evolving Threats: A Data Analysis for Next-Generation Honeypot Development», IEEE SRDS 2025. Repositorio: https://github.com/zyw-286/shell-attack-evolution-dataset, commit `d5f7fe120ebd921e04026b6348c3ec5d399c5df6` (descargado el 10/10/2026). Datos bajo CC BY 4.0; código bajo MIT. El dataset se leyó solo como datos: no se ejecutó ningún código ni ningún archivo del repositorio.

**Contenido (según su README y su tarjeta de datos).** Ataques de shell posteriores al login, capturados por honeypots Cowrie expuestos a Internet en dos períodos: 2021–2022 y 2024 (del 01/03/2024 al 26/06/2024). El período 2024 reúne 3.914.173 ataques y 6.658 «sesiones efectivas». Los datos tienen etiquetas MITRE ATT&CK por sesión. No distribuye binarios de malware; las URL y los nombres de archivo están neutralizados.

## Lo que se usó de cada parte

| Parte | Archivo | Qué trae | Uso en R1 |
|---|---|---|---|
| Sesiones (curado) | `dataset/sessions/2024.jsonl` (6.658 filas; SHA-256 `7ea4b916841708c36dbe24f95b882f06335e85ed2e77bdc70ba985c9c9653752`) | `session_id` (`sha1(período\|ip)[:12]`), `period`, `src_ip`, `commands` (lista ordenada de comandos únicos tras la autenticación, agrupados por dirección de origen), `command_count`, `session_pattern`, `attack_techniques` (técnicas ATT&CK en orden, sin repeticiones consecutivas) | Unidad de muestreo, comandos y su orden, técnicas |
| Registros crudos de Cowrie | `2024/cowrie/ssh_MM_DD.json` y `telnet_MM_DD.json` (236 archivos, 1,7 GB) | Un evento por línea, con los campos `info`, `alert`, `tshark`, `src_host`, `src_port`, `dst_host`, `dst_port`, `protocol`, `pot_id`, `request` y `timestamp`. Tipos de `info`: `session.connect`, `session.kex`, `session.closed`, `session.loseConnection`, `userlogin`, `command.input`, `command.process` y `command.failed`. Las credenciales están en `tshark` (`login attempt [b'usuario'/b'contraseña'] succeeded`) y el comando, en `tshark` de los eventos `command.input` | Credenciales del primer login exitoso de cada origen y marcas de tiempo de los comandos (demora original) |
| Otras partes | `dataset/commands`, `dataset/request_response`, `dataset/attack_ttp`, `analysis/`, `scripts/` | Comandos únicos con frecuencia, pares comando–respuesta (2021–2022 y una versión curada), frecuencias de tácticas y técnicas | No se usaron |

## Lo que el dataset **no** trae (y cómo se resolvió)

- **Credenciales en el archivo de sesiones:** no están. Se tomaron del primer `userlogin … succeeded` del registro crudo de la misma dirección de origen, solo si usuario y contraseña cumplen `^[A-Za-z0-9._@%+=,-]{1,32}$` (así `userdb.txt` de Cowrie las interpreta sin ambigüedad). Las demás sesiones se descartan de la población elegible (1.000 de 6.658).
- **Demoras entre comandos en el archivo de sesiones:** no están. Se calcularon con la marca de tiempo de la primera aparición de cada comando en el registro crudo de esa dirección de origen, acotada entre 0,3 s y 5 s. Si el comando no se encuentra en el registro crudo, la demora es 1 s. El comando inicial espera 1 s tras el login. 813 de los 1.020 comandos de la muestra tienen demora original.
- **Una «sesión» es la unidad del dataset, no una conexión TCP:** reúne los comandos únicos de una misma dirección de origen durante todo el período. Una dirección que repitió el mismo comando en cientos de conexiones aparece con un solo comando. Por eso las sesiones del dataset son más cortas (en promedio, 5,0 comandos) que lo que verían los honeypots en conexiones sueltas.
- **Protocolo:** el dataset mezcla SSH y Telnet. R1 reproduce todas las sesiones por SSH; el protocolo original queda en `muestra_r1.jsonl` (`protocolo_original`).

## Ética

Las direcciones IP de origen del dataset **no** se copian a la evidencia de R1: `muestra_r1.jsonl` conserva solo el `session_id` anonimizado. Las credenciales y los comandos son valores que escribieron los atacantes (es decir, no son secretos de terceros), y se publican porque son el estímulo de la validación.

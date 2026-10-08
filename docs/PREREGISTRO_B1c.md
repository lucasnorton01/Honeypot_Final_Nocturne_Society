# Registro previo B1c — línea de base manual ampliada, nueva convocatoria (P1)

Fecha de redacción: 2026-10-08. Este documento se publica en el repositorio **antes** de enviar las páginas a los participantes.

## 0. Relación con B1b
B1b (`docs/PREREGISTRO_B1b.md`) quedó cerrado sin datos utilizables: los participantes no devolvieron el archivo que genera la página, sino una conversión hecha por script a partir del HTML, sin los tiempos propios de la página. B1c repite la medición con **un procedimiento de entrega que evita ese problema**. B1b no se reabre: sus archivos y su cierre (tag `Honeypot_Final_2026-10-06g`) no cambian, y ningún dato de esa convocatoria se usa.

## 1. Objetivo
Ampliar la línea de base manual de P1 (hoy N = 2 del equipo y N = 5 externos) con **10 participantes ajenos al equipo**, para estimar con menos dependencia de pocas personas el tiempo de triaje y extracción por evento. No modifica ningún veredicto: P1 se confirmó frente a la línea de base registrada y se informa también frente a esta.

## 2. Material
- Mismos 20 eventos reales de la ventana del 30/09/2026 (semilla fija `20260930`) y los mismos 2 de práctica: `docs/evidencia/b1/muestra_b1.json`, para poder juntarlos con B1.
- Misma página de cronometraje y mismo criterio común que B1 (versión `b1-v2`), con **cambios solo en la entrega y en el manejo de la pantalla**: versión `b1-v3`; un botón «Descargar JSON» que guarda el archivo sin conexión; el avance al evento siguiente no espera el guardado y la pantalla vuelve arriba; y un botón «Reiniciar mi medición» (pide confirmación, borra el avance de ese navegador y vuelve a la práctica) (`docs/evidencia/b1c/build_b1c.js` parchea las páginas que genera `docs/evidencia/b1/build.js`). No cambian los eventos, los campos, el criterio ni la medición de tiempos.
- Una página por participante, con códigos **P18 a P27** (códigos nuevos, distintos de los de B1 y B1b).
- Mide el paso 1 (triaje y extracción) y el paso 2 (clasificación y documentación), por separado.

## 3. Procedimiento
Cada participante trabaja solo, sin consultar servicios externos ni comentar los eventos con otros hasta que todos terminen. Abre su página, completa su formación en seguridad (cuatro opciones de la página), hace 2 eventos de práctica y 20 eventos medidos, toca «Descargar JSON» y **envía el archivo `linea-base-Pxx.json` tal como se descargó**, sin abrirlo, convertirlo ni editarlo. Los autores no instruyen sobre el contenido de los eventos. Se cronometra en una sola sesión continua; si se interrumpe, se informa en la nota de la página. Quien se equivoque puede tocar «Reiniciar mi medición»: el archivo registra el campo `reinicios` (cantidad de reinicios) y solo cuenta la última tanda completa; se informa cuántos reiniciaron. El reinicio es por error de carga, no para mejorar el resultado, y no se ofrece a quien ya terminó y vio su mediana. Ventana de entrega: hasta el 2026-10-12.

Mensaje que se envía a cada participante:
> Abrí tu archivo `linea-base-Pxx.html` en el navegador (doble clic), hacelo de corrido y solo/a, sin buscar nada en Internet. Al terminar tocá «Descargar JSON» y mandame el archivo `linea-base-Pxx.json` **sin abrirlo ni convertirlo a otro formato** (no copies el contenido a un .md, .txt ni a una planilla). Si el botón no descarga, usá «Copiar respuestas», pegá el texto en un archivo nuevo de nombre `linea-base-Pxx.json` y no cambies nada.

## 4. Validez del archivo (fijada antes)
Un archivo cuenta si cumple **todo** lo siguiente, comprobado con `scripts/b1_analisis.js` y un control adicional que se publica con los resultados:
1. Es JSON con `version = "b1-v3"`, el `codigo` asignado a esa persona y el campo `reinicios`.
2. Tiene 22 respuestas (2 de práctica y 20 medidas), con `orden` 1 a 22 y los eventos de la muestra en el orden de `muestra_b1.json`.
3. En cada respuesta `ms_total = ms_paso1 + ms_paso2` y los tiempos son positivos.
4. `inicio`, `fin` y `actualizado` son coherentes (las horas `fin` crecen con `orden` y el tiempo total medido cabe entre `inicio` y `actualizado`).
Un archivo que no cumple (por ejemplo, convertido a otro formato o sin tiempos) **no se usa**. Si el problema es solo de entrega, se puede reenviar el archivo original; **nadie repite la medición**. No se corrige ni se completa ningún dato.

## 5. Resultado principal y análisis (fijados antes)
- **Resultado principal:** mediana por evento del paso 1 entre los participantes con archivo válido y, luego, mediana de los 20 eventos (mismo método que B1).
- **Secundarios:** la misma medida con los externos de B1 (P3 a P7) más los nuevos; mediana por perfil de formación; tasa de errores de campos, de tipo de evento y de relevancia (`scripts/b1_analisis.js`).
- **P1:** se informa la media de latencia de ingesta de C2 (1,37 s) y la de W2 (1,6 s) frente a la mediana principal, sin umbral nuevo (el umbral sigue siendo 50 %).
- **N mínimo:** con 8 o más archivos válidos, B1c se presenta como línea de base ampliada. Con menos, se presenta como antecedente descriptivo y no se usa para sostener ni refutar nada.
- **Exclusiones:** solo los archivos que no cumplan la sección 4; se informa cuántos y por qué. No se descartan datos por ser lentos, rápidos o con errores. No se reemplaza ni se repite a nadie.
- **Se publica el resultado salga lo que salga**, también si no mejora la línea de base o si va contra la hipótesis.
- **Sesgos que se declaran:** participantes reclutados por los autores; perfiles heterogéneos y, probablemente, pocos analistas; muestra de 20 eventos de un ataque simulado; efecto de aprendizaje dentro de la página; y, **si algún participante ya había procesado estos mismos eventos en la convocatoria cerrada B1b, un efecto de repetición** que acorta sus tiempos y favorece al procesamiento manual, es decir, va en contra de P1. Los autores registran, al recibir cada archivo, si la persona ya había hecho B1b.

## 6. Archivos
| Archivo | SHA-256 |
|---|---|
| `docs/evidencia/b1/muestra_b1.json` | `380eb635d911ddae11236abcd608da2a5b65fbf126f34508cee79fd5928806a0` |
| `docs/evidencia/b1/plantilla.html` | `0a1a6b1519d4d6fad174a9325faf14bed60e7233f85846c8c72f27b02640f9f1` |
| `docs/evidencia/b1/build.js` | `e23fbf796f28f1a069adde4e81b954e9c831c01ae2ef79edb63f063bb3339894` |
| `docs/evidencia/b1c/build_b1c.js` | `aebeacea5b4a8e350e230e9aa3cfb1207d7a7fbdef57bb56d071401c8ce79777` |
| `docs/evidencia/b1c/linea-base-P18.html` | `43e1a08c478ae54af3960eb8b20d4464c0de4f9f3da3a19e9215d1c2a5b7b655` |
| `docs/evidencia/b1c/linea-base-P19.html` | `d15fe540f540f179d5d38af57a56738f790776db3ebd0eeef284fcc64e8c51bd` |
| `docs/evidencia/b1c/linea-base-P20.html` | `fccfd7893b52b9cf1d1af729a6fbb0e02980fc8607f86da4819ad594847abe90` |
| `docs/evidencia/b1c/linea-base-P21.html` | `0a544e3c62b13eb8cb701338ee1e4348f78928cb1f7835421dc7d73214f34ee5` |
| `docs/evidencia/b1c/linea-base-P22.html` | `27b568b55b8ffd811aafd20d1da99f45a393af5223503019a0d8b607aab8eff8` |
| `docs/evidencia/b1c/linea-base-P23.html` | `4a30a99e85afcf2f36e7c1095bd6f4e5430ea843386374475c8bc693eae12933` |
| `docs/evidencia/b1c/linea-base-P24.html` | `a11c4cbe2027ce8dff3998d124c7973c8643615182f08960c2e2ddd2b8d48bf9` |
| `docs/evidencia/b1c/linea-base-P25.html` | `6dd28dc888914e56fe8b8b74b9c21cca1f074837201ac4cd34869bcf38062c97` |
| `docs/evidencia/b1c/linea-base-P26.html` | `13e600f25acb5ba1738bb752c1e2e788b71bf69ccd2b1adc68e41b41bb69f619` |
| `docs/evidencia/b1c/linea-base-P27.html` | `8c1cc6b93ae28365a7c2c586b30b775139171998217e91e5af7b5e848cd48f93` |

Los SHA-256 corresponden a los archivos tal como se envían (saltos de línea LF; `.gitattributes` fija `docs/evidencia/b1c/**` como `-text`).

## 7. Medición descartada antes de la publicación
La persona asignada a P18 completó una tanda el 2026-10-08 entre las 09:00 y las 09:16 (ART), **antes** de que este registro estuviera publicado, y con una versión de la página que todavía tenía los problemas de avance de pantalla descriptos en la sección 2. Ese archivo (SHA-256 `7f522e19f87267d1e0eca3000a399d28a83dc72eed58b2d73516fc0466219e1d`) **se descarta por completo**: no se analiza ni se incluye en ningún resultado, y no se publica. Todos los participantes, P18 incluido, empiezan desde cero con las páginas de este registro una vez publicado, y la tanda que cuenta es la de cada persona posterior a la publicación.

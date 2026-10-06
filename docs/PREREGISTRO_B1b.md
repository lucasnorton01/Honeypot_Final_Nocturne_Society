# Registro previo B1b — línea de base manual ampliada (P1)

Fecha de redacción: 2026-10-06. Este documento se publica en el repositorio **antes** de enviar las páginas a los participantes.

## 1. Objetivo
Ampliar la línea de base manual de P1 (hoy N = 2 del equipo y N = 5 externos) con **10 participantes nuevos ajenos al equipo**, para estimar con menos dependencia de pocas personas el tiempo de triaje y extracción por evento. No modifica ningún veredicto: P1 se confirmó frente a la línea de base registrada y se informa también frente a esta.

## 2. Material (sin cambios respecto de B1)
- Mismos 20 eventos reales de la ventana del 30/09/2026 (muestra con semilla fija `20260930`) y los mismos 2 de práctica: `docs/evidencia/b1/muestra_b1.json`.
- Misma página de cronometraje (`plantilla.html`, versión `b1-v2`), generada por `build.js`, una por participante, con códigos **P8 a P17** (`docs/evidencia/b1b/`).
- Mide el paso 1 (triaje y extracción) y el paso 2 (clasificación y documentación), por separado.

## 3. Procedimiento
Cada participante trabaja solo, sin consultar servicios externos ni comentar los eventos con otros hasta que todos terminen; abre su página, completa su formación en seguridad (cuatro opciones de la página), hace 2 eventos de práctica y 20 eventos medidos, y devuelve el archivo JSON que genera la página. Los autores no instruyen sobre el contenido de los eventos.

## 4. Resultado principal y análisis (fijados antes)
- **Resultado principal:** mediana por evento del paso 1 entre los 10 participantes nuevos y, luego, mediana de los 20 eventos (mismo método que B1).
- **Secundarios:** la misma medida con los 15 participantes externos (P3 a P7 y P8 a P17); la mediana por perfil de formación; tasa de errores de campos, de tipo de evento y de relevancia (`scripts/b1_analisis.js`).
- **P1:** se informa la media de latencia de ingesta de C2 (1,37 s) y la de W2 (1,6 s) frente a la mediana principal, sin umbral nuevo (el umbral sigue siendo 50 %).
- **Exclusiones:** solo quien no complete los 20 eventos medidos; se informa cuántos y por qué. No se descartan datos por ser lentos, rápidos o con errores.
- **Si hay menos de 10 válidos:** se informa el N real; no se reemplaza ni se repite a nadie.
- **Sesgos que se declaran:** participantes reclutados por los autores; perfiles heterogéneos y, probablemente, pocos analistas; muestra de 20 eventos de un ataque simulado; efecto de aprendizaje dentro de la página.

## 5. Archivos
| Archivo | SHA-256 |
|---|---|
| `docs/evidencia/b1/muestra_b1.json` | `380eb635d911ddae11236abcd608da2a5b65fbf126f34508cee79fd5928806a0` |
| `docs/evidencia/b1/plantilla.html` | `0a1a6b1519d4d6fad174a9325faf14bed60e7233f85846c8c72f27b02640f9f1` |
| `docs/evidencia/b1/build.js` | `e23fbf796f28f1a069adde4e81b954e9c831c01ae2ef79edb63f063bb3339894` |
| `docs/evidencia/b1b/linea-base-P10.html` | `c701db161fcc06ae5bb1c2f3af3fa6183ab88d87630a4fc9d8c5f06db735bf2d` |
| `docs/evidencia/b1b/linea-base-P11.html` | `375a27a3669c58b7130c4f3402a34105c892f53a83a8e154827abed18c78f3df` |
| `docs/evidencia/b1b/linea-base-P12.html` | `322a6aca44208424b948a369c3f4bd51175697bc6066a1f00a1abd717a7845cd` |
| `docs/evidencia/b1b/linea-base-P13.html` | `6685dacd4324784493a1bd29c3e38674bcf7115a002a65cc81a0a8d4a69f82c8` |
| `docs/evidencia/b1b/linea-base-P14.html` | `351a7699de988e899e7e88aa99fa4d2ef61f6cd7f4c90306b8055c320242fc30` |
| `docs/evidencia/b1b/linea-base-P15.html` | `d8990b94cdcd837a13701388e094437a3351e53c3ec213cb70467faf0c8aacae` |
| `docs/evidencia/b1b/linea-base-P16.html` | `d4f889f59a04fef42b51f0cd6847a2ca966dc80826eac05956b2134b8949650a` |
| `docs/evidencia/b1b/linea-base-P17.html` | `88d1a15d9c0feaf978415dd85dd61733ddc32b87f1d1f5feeddf5f873bdc0b10` |
| `docs/evidencia/b1b/linea-base-P8.html` | `67f61de1ce153ee0564d476c216282334713ddb1dd06e8dc80cc7bc7b7f80f72` |
| `docs/evidencia/b1b/linea-base-P9.html` | `14a778aeb55cc6f07ac05e2b2a4cf6dabdd3661c1f255906e548eb00c2d7bd9c` |

Los SHA-256 corresponden a los archivos tal como se envían (saltos de línea LF). Una copia de trabajo en Windows puede convertirlos a CRLF y dar otro hash; el contenido versionado en Git es el de LF.

# v83 (borrador): cuatro puntos del editor

Base: la v82 (borrador, rama local `v82-dictamen`). La v81 sigue congelada y no se modificó. La v83 no está congelada ni tiene tag.

| Control | Resultado |
|---|---|
| Páginas | 125 (límite: 125) |
| Errores de referencia cruzada (Word) | 0 |
| Referencias «§» | sin remisiones a apartados inexistentes; ninguna oración con más de un «§» |
| Corrector ortográfico (Word, español) | solo marca anglicismos técnicos ya usados (honeypot, Cowrie, feeds, dashboards, forwarder, Telegram, user agents) |
| Veredictos y cifras | Sin cambios |

SHA-256 del PDF: `d29ff871fb91880bb098e029a0e4708d930de272b7f342f063ca334e41bca5b0`
SHA-256 del DOCX: `885d810a4bb25491450688441d3ee10bf03bfa28f9912d03ecb6ef1bf942d917`

| Punto | Qué se cambió | Sección |
|---|---|---|
| P1 | «Objetivo general: reformulado el 12/10/2026 a propuesta del equipo, para ajustarlo a lo que valida la prueba funcional, en coherencia con el título.» La redacción original, la frase «el objetivo general se cumple solo en parte con ambas redacciones» y la nota de los objetivos 3 y 5 no se tocaron. El grep de «12/10/2026», «objetivo general» y «reformul» en todo el documento (Resumen, Abstract, §1.4, Tabla 6.8, §6.10, §8.3) muestra que la fecha figura solo en la nota del §1.4.2 y que ninguna mención del cambio del objetivo general alude a la dirección ni a los profesores. | §1.4.2 |
| P2 | Los ejemplos estratégico y técnico de la Tabla 3.3 ya no traen cifras: «Predominan los ataques automatizados de fuerza bruta contra SSH; se recomienda priorizar los controles de autenticación.» y «Lista de indicadores (direcciones IP, hashes SHA-256, user agents) en formato estructurado, lista para su consumo por firewalls y sistemas de detección.» Los ejemplos operacional y táctico no tenían cifras. La nota de la tabla se mantiene. | §3.6.2 |
| P3 | La columna pasó a «Actividades del modelo (referencia)»; la nota dice lo pedido (con «WHOIS» y «dashboards» agregados). La columna «Componentes responsables» se revisó fila por fila: solo menciona componentes implementados (Cowrie, volumen Docker, nodos de n8n, report-generator, alertas por Telegram del forwarder). El texto previo a la tabla dice «actividades del modelo». | §3.7, Tabla 3.4 |
| P4 | No pude comprobar que Almeshekah y Spafford (2016) ni Javadpour et al. (2024) sustenten alguno de los cinco principios con el contenido que la tesis ya les atribuye (solo la afirmación general sobre el engaño). Siguen como «síntesis propia del equipo» y se agrega una oración que vincula cada principio con una decisión del prototipo: honeypot aislado (Tabla 3.5), sesión retenida en un sistema emulado, captura de credenciales y comandos por Cowrie, alertas por Telegram del forwarder, e indicadores y reporte de n8n (§5.6). No se agregó ninguna cita. | §3.4 |

Salvedad: la Tabla 3.5 tiene una fila para el primer principio (desviar la atención); los otros cuatro vínculos se apoyan en el §5.6 y no se agregaron filas a la Tabla 3.5 para no mover páginas ni tablas.
Los cuatro puntos están en un solo commit porque se aplican al mismo documento Word.

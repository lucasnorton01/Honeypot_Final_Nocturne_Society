# v83 (borrador): puntos P1 a P8 del editor

Base: la v82 (borrador, rama local `v82-dictamen`). La v81 sigue congelada y no se modificó. La v83 no está congelada ni tiene tag.

| Control | Resultado |
|---|---|
| Páginas | 125 (límite: 125) |
| Errores de referencia cruzada (Word) | 0 |
| Referencias «§» | sin remisiones a apartados inexistentes; ninguna oración con más de un «§» |
| Corrector ortográfico (Word, español) | solo marca anglicismos técnicos ya usados (honeypot, Cowrie, feeds, dashboards, forwarder, Telegram, user agents) |
| Veredictos y cifras | Sin cambios |

SHA-256 del PDF: `65c7871cced029cef4426f241955b262f27e297b2f5aaa5bc9f4601344167e47`
SHA-256 del DOCX: `e41207f1e98f702e962b07c7453b6c0095b756c6831d9cf848894f72b378c37e`

| Punto | Qué se cambió | Sección |
|---|---|---|
| P1 | «Objetivo general: reformulado el 12/10/2026 a propuesta del equipo, para ajustarlo a lo que valida la prueba funcional, en coherencia con el título.» La redacción original, la frase «el objetivo general se cumple solo en parte con ambas redacciones» y la nota de los objetivos 3 y 5 no se tocaron. El grep de «12/10/2026», «objetivo general» y «reformul» en todo el documento (Resumen, Abstract, §1.4, Tabla 6.8, §6.10, §8.3) muestra que la fecha figura solo en la nota del §1.4.2 y que ninguna mención del cambio del objetivo general alude a la dirección ni a los profesores. | §1.4.2 |
| P2 | Los ejemplos estratégico y técnico de la Tabla 3.3 ya no traen cifras: «Predominan los ataques automatizados de fuerza bruta contra SSH; se recomienda priorizar los controles de autenticación.» y «Lista de indicadores (direcciones IP, hashes SHA-256, user agents) en formato estructurado, lista para su consumo por firewalls y sistemas de detección.» Los ejemplos operacional y táctico no tenían cifras. La nota de la tabla se mantiene. | §3.6.2 |
| P3 | La columna pasó a «Actividades del modelo (referencia)»; la nota dice lo pedido (con «WHOIS» y «dashboards» agregados). La columna «Componentes responsables» se revisó fila por fila: solo menciona componentes implementados (Cowrie, volumen Docker, nodos de n8n, report-generator, alertas por Telegram del forwarder). El texto previo a la tabla dice «actividades del modelo». | §3.7, Tabla 3.4 |
| P4 | No pude comprobar que Almeshekah y Spafford (2016) ni Javadpour et al. (2024) sustenten alguno de los cinco principios con el contenido que la tesis ya les atribuye (solo la afirmación general sobre el engaño). Siguen como «síntesis propia del equipo» y se agrega una oración que vincula cada principio con una decisión del prototipo: honeypot aislado (Tabla 3.5), sesión retenida en un sistema emulado, captura de credenciales y comandos por Cowrie, alertas por Telegram del forwarder, e indicadores y reporte de n8n (§5.6). No se agregó ninguna cita. | §3.4 |
| P5 | Opción (b): la relación con las prioridades 3 a 5 de la Tabla 8.2 no es sostenible, porque en el Anexo IX las brechas de SIM3 (diseminación externa e integración con el ecosistema de compartición) se remiten al §9.4 y al §8.4, y las prioridades 3 a 5 de la Tabla 8.2 son robustez, endurecimiento y validez externa. El §3.10 queda en una oración que remite al Anexo IX | §3.10 | Hecho |
| P6 | docs/DETALLES_CUERPO.md existe y contiene las 15 filas de la Tabla VI-3 de la v81 (se cotejaron fechas, rutas, tags y expresiones cron contra el texto de la v81: no falta ninguna). No está en el tag de la portada (Honeypot_Final_2026-10-08g, commit 930acf6; se creó el 12/10/2026): no se creó ni movió ningún tag; se dejó [[CONFIRMAR: tag]] en la portada. BITACORA.md registra las cinco fuentes retiradas (entrada del 12/10/2026) | Portada, repositorio | Requiere humano |
| P7 | §4.6 ya remitía al §1.6 sin repetir las hipótesis: queda la regla de decisión y la Tabla 4.2; solo se acortó el punto «Operacionalizaciones de P3» con remisión al §4.9.3. §8.3.1 pasó a una oración que remite a la Tabla 6.8. En el §6.9 se quitaron las definiciones de umbral y de operacionalización repetidas de P2, P3, P3′ y P4 y se dejó la remisión al §4.9. Sin cambios de cifras ni de veredictos | §4.6, §6.9, §8.3.1 | Hecho |
| P8 | Sin ocurrencias de «Tabla VI-3», «Anexo VI.5», «Tabla III-10/12/14», «Tabla X -N», palabras partidas, dobles espacios en el cuerpo ni puntuación doble. Remisiones §, Tabla, Figura y Anexo con destino existente (único falso positivo: «Tabla 1.2» de Tounsi). Resumen, Abstract, Tabla 6.8, Tabla 8.1 y §8.6 sin cambios respecto de la v82. Revisadas a ojo en el PDF las Tablas 3.2, 3.3, 3.4 y 4.2: sin columnas cortadas ni encabezados repetidos | Todo el documento | Hecho |

Salvedades: la Tabla 3.5 tiene una fila para el primer principio del engaño; los otros cuatro vínculos se apoyan en el §5.6 y no se agregaron filas. Los puntos P1 a P4 están en un commit y P5 a P8 en otro, porque todos se aplican al mismo documento Word. El prompt traía el punto P4 con «No agregues fuentes nuevas»: no se agregó ninguna.

# v82 (borrador): recomendaciones del segundo dictamen

Base: la v81, congelada (`Honeypot_Final_v81_entrega`), que **no se modificó**. La v82 no está congelada ni tiene tag. Está en la rama local `v82-dictamen` del repositorio, sin publicar.

| Control | Resultado |
|---|---|
| Páginas | 125 (límite: 125) |
| Errores de referencia cruzada (Word) | 0 |
| Referencias «§» | 168 apartados numerados; ninguna remisión a un apartado, anexo o tabla de anexo inexistente |
| Referencias bibliográficas | 72; todas citadas en el texto; ninguna cita sin referencia |
| Tablas (orden) | 2.1, 3.1 a 3.5, 4.1 a 4.3, 5.1 a 5.3, 6.1 a 6.11, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2 (consecutivas) |
| Corrector ortográfico de Word | 1.609 palabras de los 87 párrafos cambiados; sin errores en español |
| Veredictos, umbrales y cifras | Sin cambios (Resumen, Abstract, Tabla 6.8, Tabla 8.1 y §8.6 coinciden) |

SHA-256 del PDF: `59b591b1d3c25e4b8905687272f446944a947aa18a39d82ba9fa70361a0649e2`
SHA-256 del DOCX: `c815a7b22aefe7e5a513f8bd43f9c350107a347b04b0731f909faaed28e26f61`

## Cambios por recomendación
| ID | Qué se cambió | Sección | Estado |
|---|---|---|---|
| A1 | «Ataque de interés» vuelve al Resumen y al Abstract. En la BITACORA del 28/09 las consultas de P3 y P4 aparecen como «literal del enunciado» y usan `cowrie.login.success`: es un indicio de que la definición podía ser anterior, pero no una prueba; se dejó la versión que ya declara la tesis | Resumen, Abstract | Hecho; consulta pendiente (PENDIENTES_HUMANOS, 1) |
| A2 | Remisión «(§6.7)» → «(§6.2.4, Tabla 6.2)» | §7.6.1, punto 3 | Hecho |
| A3 | cowrie-proxy: «no existía de L0 a C2; C3 y R1 corrieron con él, aunque el tráfico del simulador no pasó por él (apartado 6.2.7)»; §5.3: «C3 y R1, con los siete» servicios | Nota de la Tabla 5.2, §5.3 | Hecho |
| A4 | «Un lote (L0) y cinco ventanas (W1, W2, C1, C2 y C3)» en las tres ocurrencias y «seis validaciones (L0, W1, W2, C1, C2 y C3)» en la Tabla 6.8 y el §6.10 | §1.4.2, §1.5, Tabla 6.8, §6.10 | Hecho |
| A5 | Una sola nota con las tres reformulaciones (objetivos 3 y 5, y general): redacción original, fecha, motivo y estado. Sin marcador `[[CONFIRMAR]]` ni afirmación de conformidad para el objetivo general, por decisión del equipo | §1.4.2 | Hecho, con la salvedad indicada |
| A6 | Barrido de consistencia: (1) «ataque de interés» ausente del Resumen; (2) remisión del §7.6.1; (3) nota de la Tabla 5.2; (4) conteo de validaciones; (5) «todas las muestras son simuladas» y «un ataque simulado» en ocho lugares, que no contemplaban las sesiones reales reproducidas de R1; (6) fechas y N de L0, W1, W2, C1, C2, C3 y R1 sin contradicciones. Las cifras de Resumen, Tabla 8.1, Tabla 6.8 y §8.6 coinciden | Resumen, §6.10, §8.2.2, §8.3.2, §8.6, Cap. IX | Hecho |
| B1 | Una sola pregunta de grado en el §1.2, con las tres dimensiones medidas; el §4.5 la remite y conserva la operacionalización; la capacidad de respuesta pasa a lo excluido en el §1.5 | §1.2, §1.5, §4.5 | Hecho; requiere visto bueno (PENDIENTES_HUMANOS, 2) |
| B2 | Tabla 4.2 «Decisiones tomadas antes y después de observar los datos»; la operacionalización de variables pasa a Tabla 4.3 | §4.6 | Hecho |
| B3 | Con la regla binaria original, la hipótesis general «no se sostiene en su totalidad»: la conclusión no depende de «parcialmente sostenida» | §8.2.2 | Hecho |
| B4 | Por qué no se corrigió el esquema ni se repitió la ventana de veredicto (criterio fijado de antemano; P3′ como reformulación en C1 a C3) | §7.2.3 | Hecho |
| C1 | Se movieron al cuerpo las Tablas III-10 (taxonomía, §3.5.3.1, ahora 3.2), III-14 (niveles de inteligencia, §3.6.2, ahora 3.3) y III-12 (PCPAD, §3.7, ahora 3.4); la antigua 3.2 pasó a 3.5. La III-8 (línea temporal) se evaluó y quedó en el anexo: el Capítulo II no tiene margen de páginas | Cap. III, Anexo III | Parcial (3 de 4) |
| C2 | Se justifica la omisión de la retroalimentación: el prototipo no tiene un consumidor que devuelva requerimientos; queda como trabajo futuro ligado a la evaluación con analistas | §3.7 | Hecho |
| C3 | No se cambió. Almeshekah y Spafford (2016) respaldan la afirmación general sobre el engaño, pero no pude verificar que sustenten los cinco principios; siguen declarados como síntesis propia | §3.4 | No hecho (no verificable) |
| C4 | Se vincula el §3.3 con el problema: los modelos tradicionales registran el evento pero no reconstruyen credenciales, comandos ni comportamiento (§1.2). La Tabla 3.1 se mantiene | §3.3 | Hecho |
| C5 | Se reemplazó «no se halló literatura regional» por la búsqueda real: Crossref, 11/10/2026, términos y resultado | §2.4 | Hecho |
| C6 | Ya estaba en dos líneas con remisión al Anexo IX (v79) | §3.10 | Ya cumplido |
| D1 | El párrafo de las cinco fuentes retiradas salió del §2.8 y quedó en BITACORA.md | §2.8, Tabla III-9 (remisión) | Hecho |
| D2 | Se sacó la Tabla VI-3; sus 15 filas están en docs/DETALLES_CUERPO.md | Anexo VI | Hecho |
| D3 | Sin menciones a la landing page, a «versiones v8, v11» ni a «tags intermedios» en los Capítulos I a IX: solo quedan en el Anexo X | Cap. I a IX | Verificado |
| D4 | Las 13 remisiones «Detalles: Anexo VI.5» se reemplazaron por una nota al inicio del Capítulo VI | §6.1 | Hecho |
| E1 | Nombre descriptivo de los códigos y menos de cuatro seguidos en el §4.6, el §8.2 y la Tabla 8.1; el Capítulo I y el III no usan códigos | Cap. IV, VIII | Parcial |
| E2 | Oraciones de más de 60 palabras en cuerpo: de 37 a 34 | §1.4.2, §2.5.2, §4.12, §4.15, entre otros | Parcial |
| E3 | Las repeticiones entre §1.6 y §4.6, §4.9 y §6.9 son de formulación distinta (definición frente a operacionalización); se consolidaron las de la regla de decisión | §4.6, §8.2.2 | Parcial |
| E4 | Se agregan los tres elementos transferibles: protocolo con registro previo, conciliación SQL contra el log y health-monitor para fallas silenciosas | §8.2.3 | Hecho |
| E5 | Tabla 9.1: «estimación orientativa del equipo, sin cotización verificada ni fuente de precios». No se agregó marcador | Cap. IX | Hecho; falta la fuente (PENDIENTES_HUMANOS, 3) |
| F1 | 72 referencias, todas citadas; sin citas huérfanas; el desglose del §2.8 no cambia | Referencias, §2.8 | Hecho |
| F2 | Wang et al. (2025): DOI 10.1109/SRDS69199.2025.00032, pp. 207–217 (Crossref). Chin et al. (2025): arXiv:2512.05321, publicado el 04/12/2025, autores coinciden | Referencias | Hecho |
| F3 | Rangos con guion largo; «NIST SP 800-61» conserva el guion; «Recuperado el…» uniforme. Hay entradas con doble espacio que no se tocaron | Referencias | Parcial |
| G1 | Sin palabras partidas, sin «Tabla X -N», sin puntuación doble; 3 tramos con doble espacio corregidos | Todo el documento | Hecho |
| G2 | Todas las remisiones `§`, `Anexo` y `Tabla` apuntan a un destino existente | Todo el documento | Hecho |
| G3 | Resumen, Abstract, Tabla 6.8, Tabla 8.1 y §8.6: cifras y veredictos idénticos | Resumen y Caps. VI y VIII | Hecho |
| G4 | PDF regenerado y revisado a ojo en las Tablas 3.2, 4.2, 6.8 y 8.1: sin columnas cortadas | PDF | Hecho |

## Páginas
Mover las tablas al cuerpo y agregar texto llevó el documento a 127 páginas; se volvió a 125 sacando la Tabla VI-3, el párrafo de fuentes retiradas y condensando el párrafo de R1 del Anexo X.

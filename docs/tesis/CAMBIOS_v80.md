# v80: Tablas 5.2 y 6.10 y literatura empírica sobre Cowrie

Base: la v79 congelada (`Honeypot_Final_v79_entrega`), que **no se modificó**. Esta es una versión nueva; no está en el repositorio ni tiene tag.

| Control | Resultado |
|---|---|
| Páginas | 125 (igual que la v79; límite: 125) |
| Corrector ortográfico de Word | Sin errores en el texto nuevo (solo marcó términos técnicos: botnets, Cowrie, Crossref, honeypots) |
| Errores de referencia cruzada (Word) | 0 |
| Cifras previas | Ninguna cambió; solo entran 72 y 31 (conteo de referencias) |
| «§» | Una por oración; el único párrafo con más de dos sigue siendo el de P1 a P4 del §1.6 |
| Veredictos, umbrales y objetivos | Sin cambios |

## Revisión de las dos tablas
- **Tabla 5.2: el problema era real.** La fila de `cowrie` mostraba los mismos puertos publicados que la de `cowrie-proxy`. En la configuración final, `docker-compose.yml` publica los puertos solo con `cowrie-proxy`; Cowrie los publicaba directamente antes del 06/10/2026. Ahora la fila de `cowrie` dice «Ninguno desde el 06/10/2026 (los publica cowrie-proxy); antes, 127.0.0.1:2222 → 2222 (SSH) y 127.0.0.1:2323 → 2223 (Telnet)».
- **Tabla 6.10: la advertencia ya existía, pero el rótulo decía «Mejora».** La columna se llama ahora «Reducción relativa (indicativa)» y la nota ᵃ agrega que es una comparación indicativa entre tareas no equivalentes (§6.11). Las cifras (92,1 %, 91,3 %, 98,1 %) no cambian.

## Literatura empírica sobre Cowrie (§2.4 y Referencias)
Tres estudios, con autores, páginas y DOI verificados en Crossref:
- Baser, Guven y Aydin (2021), UBMK, pp. 806–811, doi:10.1109/UBMK52708.2021.9558948.
- Lingenfelter, Vakilinia y Sengupta (2020), CCWC, pp. 761–767, doi:10.1109/CCWC47524.2020.9031234.
- Năstase et al. (2024), RoEduNet, pp. 1–7, doi:10.1109/RoEduNet64292.2024.10722609.

Se citan en el §2.4 como contexto y la tesis declara que se describen por sus títulos y resúmenes, sin haber revisado su texto completo, y que se localizaron en Crossref. También declara que una búsqueda acotada no halló literatura regional. El §2.8 pasa de 69 a 72 referencias y de 28 a 31 artículos.

## Contraste de las citas con el texto de las fuentes (11/10/2026)
| Fuente | Qué se contrastó | Resultado |
|---|---|---|
| Nawrocki et al. (2016), arXiv 1608.06249 (texto completo leído) | Spam de mensajería: picos diarios y semanales | **Respaldado** («dos picos diarios y uno semanal»); se aclara que es en otros servicios, no en SSH |
| | Honeypots expuestos a ataques; volumen no comparable con sensores expuestos | **Respaldado** (atacados a los pocos minutos si son accesibles desde Internet); el §3.2 ahora lo dice así |
| | Riesgo operativo y riqueza de datos de cada nivel de interacción | **Respaldado** (ventajas y desventajas, riesgo al entorno); la cita se acotó a esos dos puntos |
| | Conpot (ICS/SCADA) | **Respaldado** |
| | T-Pot y MHN | **No figuran** en el artículo (2016): la cita de T-Pot quedó con Deutsche Telekom (2023) y se quitó Nawrocki de la frase de MHN |
| Kinyua y Awuah (2021) | «Revisan la investigación y las prácticas de la industria sobre SOAR» | **Respaldado**: el resumen dice que estudian trabajos de investigadores y de profesionales de la industria |
| Shackleford (2015), SANS | 45 % de aprovechamiento de sistemas e inteligencia internos; comentarios sobre automatización, inteligencia en tiempo real y verificación | **Respaldado** (texto completo) |
| Chismon y Ruks (2015) | Cuatro niveles: estratégico, operacional, táctico y técnico | **Respaldado** (índice y resumen); la tesis lo cita a través de Tounsi (2019) |
| Neiva et al. (2017), Gartner | Término SOAR popularizado por Gartner en 2017 | **Respaldado solo en forma indirecta**: el documento es de acceso restringido; fuentes secundarias lo fechan el 30/11/2017 |

## Qué no se hizo y por qué
- **Literatura regional:** una búsqueda en Crossref con términos regionales no devolvió estudios sobre Cowrie en la región; no se agregó nada.
- **Resto de las recomendaciones del dictamen** (reducir códigos, mover tablas del Anexo III, reformular el objetivo general, unificar hipótesis): no se aplicaron.
- **Literatura de pago o no accesible:** no se leyeron los textos completos de los tres estudios.

SHA-256 del PDF: `9e20e79ae87c3ddae909bd679f9c74b8fe0018c3baaba955ce36c397555e55bd`
SHA-256 del DOCX: `b025a2a9f4ce2e37f3f6c40f28de7c9be534c28b26dffa37fd487ba0d34dae7f`

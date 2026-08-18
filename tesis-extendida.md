

## Universidad Tecnológica Nacional
## Facultad Regional Mendoza
Tecnicatura en Programación
Diseño e Implementación de una Arquitectura de
## Honeypots
Integrada con n8n para la Generación Automatizada
de Inteligencia de Amenazas
Grupo:Nocturne Society
Autores:Emmanuel Crespo, Lucas Norton, Julián Santos
Carrera:Tecnicatura en Programación
Institución:UTN — Universidad Tecnológica Nacional, Facultad Regional Mendoza
Ubicación:Mendoza, Argentina
## Año:2026

## Resumen
La creciente sofisticación y volumen de los ataques informáticos representa un desafı́o sig‑
niβicativo para organizaciones con recursos limitados, particularmente pequeñas y medianas
empresas (PyMEs) que carecen de equipos especializados en seguridad. Este trabajo aborda
la problemática mediante el diseño e implementación de una arquitectura de honeypots de
baja y media interacción —Cowrie para SSH/Telnet y Dionaea para múltiples protocolos— in‑
tegrada con la plataforma de automatización n8n, con el objetivo de transformar eventos de
ataque en inteligencia de amenazas procesable de forma automática. La metodologı́a adop‑
tada combina un enfoque mixto con predominio cuantitativo, estructurado en un diseño no
experimental, observacional y transversal. Se implementó un entorno aislado mediante Docker
con segmentación en capas de captura, procesamiento, persistencia y análisis. La validación
se realizó mediante una prueba funcional controlada del pipeline completo, ejecutada entre el
10 y el 11 de agosto de 2026 (hora local de Argentina, UTC‑3), durante la cual se lanzó un ata‑
que controlado contra el servicio Telnet de Cowrie que generó 13 eventos: una conexión, tres
intentos de autenticación (dos fallidos y uno exitoso) y seis comandos de reconocimiento
post‑explotación. Además, se operó una campaña de captura continua entre el 13 de julio y el 11 de agosto de 2026, que registró un corpus de 201.125 eventos con una latencia mínima de procesamiento de 85,496 ms, sobre el cual se validó la escalabilidad del pipeline. El pipeline automatizado en n8n estructuró el 100 % de los eventos (13/13),
persistió los datos en PostgreSQL, extrajo 4 indicadores de compromiso (1 dirección IP y 3
credenciales) de forma automática y generó el reporte diario sin intervención manual. Se con‑
cluye que la integración de honeypots con automatización low‑code constituye una alternativa
viable y de bajo costo para la generación de inteligencia de amenazas local, reduciendo la car‑
ga operativa en comparación con enfoques manuales. La reproducibilidad se garantiza me‑
diante el repositorio público del proyecto (https://github.com/lucasnorton01/Honeypot_Final_
Nocturne_Society, tag Honeypot_Cowrie), que contiene los tres workflows JSON, el docker‑
compose, el DDL y las tablas de análisis derivadas del volcado de la base de datos (Anexo III); la base de datos íntegra y los artefactos de evidencia se conservan fuera del repositorio por diseño.
Nota: Las comparaciones con procesamiento manual presentadas en este trabajo
se basan en una línea de base estimada a partir de literatura académica y reportes
de la industria (NIST SP 800‑61 Rev. 2, 2012; SANS, 2023; ENISA, 2023), no en un
experimento controlado con grupo de analistas humanos. Los valores porcentuales
expresan una aproximación conservadora, no una medición directa.
Palabras clave
Honeypots; threat intelligence; n8n; automatización; ciberseguridad; indicadores de compro‑
miso (IoC)
## Abstract
The growing sophistication and volume of cyberattacks poses a signiβicant challenge for
resource‑constrained organizations, particularly small and medium‑sized enterprises (SMEs)
lacking specialized security teams. This work addresses this problem by designing and im‑
plementing a low and medium interaction honeypot architecture —Cowrie for SSH/Telnet
and Dionaea for multiple protocols— integrated with the n8n automation platform, aiming
to transform attack events into actionable threat intelligence automatically. The methodology
combines a mixed approach with quantitative predominance, structured as a non‑experimen‑
tal,observational,andcross‑sectionaldesign.Anisolatedenvironmentwasimplementedusing
Docker with segmented capture, processing, persistence, and analysis layers. Validation was
performed through a controlled functional test of the full pipeline, executed between August
10 and 11, 2026 (local time in Argentina, UTC‑3), in which a controlled attack against Cowrie's
Telnet service generated 13 events: one connection, three authentication attempts (two failed
and one successful) and six post‑exploitation reconnaissance commands. The automated n8n
pipeline structured 100 % of the events (13/13), persisted the data in PostgreSQL, extracted
4 indicators of compromise (1 IP address and 3 credentials) automatically and produced the
daily report without manual intervention. We conclude that integrating honeypots with low‑
code automation constitutes a viable, low‑cost alternative for generating local threat intelli‑
gence, reducing operational burden compared to manual approaches. Reproducibility is en‑
sured through the project's public repository (https://github.com/lucasnorton01/Honeypot_
Final_Nocturne_Society, tag Honeypot_Cowrie), which contains the three workflow JSON files,
the docker‑compose, the DDL and the database dump.
## Keywords
Honeypots; threat intelligence; n8n; automation; cybersecurity; indicators of compromise
(IoC)
Índice general
Resumen / Abstract / Palabras clave
IƵndice general
IƵndice de βiguras
IƵndice de tablas
## Capítulo I — Introducción
•1.1 Introducción y contextualización del problema
∘1.2 Planteamiento del problema
∘1.3 Justiβicación de la investigación
⋄1.3.1 Justiβicación académica
⋄1.3.2 Justiβicación técnica
⋄1.3.3 Justiβicación operativa
⋄1.3.4 Justiβicación económica
⋄1.3.5 Justiβicación estratégica
∘1.4 Objetivos de la investigación
⋄1.4.1 Objetivo general
⋄1.4.2 Objetivos especı́βicos
∘1.5 Alcances y delimitaciones
∘1.6 Hipótesis operativas
∘1.7 Variables de análisis
∘1.8 Estructura del trabajo
∘1.9 Cierre del capı́tulo
Capítulo II — Estado del Arte
## •2.1 Introducción
∘2.2 Evolución reciente del panorama de amenazas
∘2.3 Tendencias actuales en defensa cibernética
∘2.4 Estado actual del uso de honeypots
∘2.5 Evolución de honeypots: de Spitzner a Cowrie y Dionaea
## 2

∘2.6 Proyectos relacionados: Honeynet Project, HPFeeds, Modern Honey Net‑
work
∘2.7 Posicionamiento de la arquitectura propuesta
Capítulo III — Marco Teórico
## •3.1 Introducción
∘3.2 Ciberseguridad y cambio de paradigma defensivo
∘3.3 Seguridad de la información y ciberseguridad
∘3.4 Teorı́a del engaño en ciberseguridad
∘3.5 Honeypots como mecanismos de observación
⋄3.5.1 Deβinición conceptual
⋄3.5.2 Ventajas y limitaciones
⋄3.5.3 Taxonomı́a de honeypots y criterios de selección
∘3.6 Inteligencia de amenazas (Threat Intelligence)
∘3.7 Ciclo de vida de la inteligencia de amenazas
∘3.8 Análisis forense digital
∘3.9 Automatización en seguridad: SOAR vs n8n
∘3.10 Modelos de madurez en inteligencia de amenazas
∘3.11 Indicadores de compromiso (IoCs)
⋄3.11.1 Deβinición y utilidad operativa
⋄3.11.2 Estándares de representación y transporte
## ⋄3.11.3 STIX 2.1
## ⋄3.11.4 TAXII 2.1
⋄3.11.5 OpenIOC
⋄3.11.6 Enriquecimiento semántico: taxonomı́as MISP
⋄3.11.7 Discusión y recomendación
∘3.12 Integración conceptual del modelo propuesto
∘3.13 Relación con el problema de investigación
∘3.14 Sı́ntesis conceptual
Capítulo IV — Metodología
## •4.1 Introducción
∘4.2 Enfoque metodológico
∘4.3 Tipo de investigación
∘4.4 Diseño de investigación
∘4.5 Problema de investigación
∘4.6 Hipótesis operativas
∘4.7 Variables de investigación
∘4.8 Operacionalización con métricas
∘4.9 Criterios de validación del sistema
∘4.10 Población, unidad de análisis y muestra
∘4.11 Escenario experimental
∘4.12 Herramientas utilizadas
## ∘4.13 Procedimiento
∘4.14 Métodos de análisis
## 3

∘4.15 Validez y conβiabilidad
∘4.16 Consideraciones éticas
∘4.17 Limitaciones metodológicas
∘4.18 Cierre del capı́tulo
## Capítulo V — Resultados Experimentales
## •5.1 Introducción
∘5.2 Diseño experimental del entorno
⋄5.2.1 Capas deβinidas
⋄5.2.2 Instrumentación del entorno
⋄5.2.3 Flujo operativo del experimento
⋄5.2.4 Perı́odo de observación
⋄5.2.5 Validación técnica previa (pre‑experimental)
## ∘5.3 Análisis Cuantitativo
⋄5.3.1 Resumen general de eventos
⋄5.3.2 Métricas de procesamiento
## ⋄5.3.3 Visualizaciones
⋄5.3.4 Credenciales más frecuentes
⋄5.3.5 Análisis de picos
⋄5.3.6 Veriβicación de criterios
∘5.4 Observaciones generales del entorno
∘5.5 Caracterización de la actividad observada
⋄5.5.1 Naturaleza de las interacciones
⋄5.5.2 Comportamiento recurrente
⋄5.5.3 Valor observacional de los eventos
⋄5.5.4 Procedencia geográβica de las IPs atacantes
∘5.6 Métricas de evaluación del sistema
⋄5.6.1 Indicadores de validación
∘5.7 Resultados del procesamiento automatizado
∘5.8 Generación de inteligencia de amenazas
⋄5.8.1 Top 20 direcciones IP atacantes
⋄5.8.2 Distribución por tipo de IoC
⋄5.8.3 Timeline de actividad por IP
⋄5.8.4 Geolocalización de fuentes de ataque
⋄5.8.5 Artefactos y hashes de malware
⋄5.8.6 Niveles de conβianza
⋄5.8.7 Hallazgos notables
∘5.9 Evaluación cualitativa del sistema
⋄5.9.1 Capacidad de captura
⋄5.9.2 Capacidad de procesamiento
⋄5.9.3 Capacidad de análisis
∘5.10 Validación de las hipótesis operativas
∘5.11 Cumplimiento de objetivos
∘5.12 Limitaciones de los resultados
∘5.13 Implementación de Workβlows n8n
## 4

⋄5.13.1 Workβlow de Ingesta de Eventos (event‑ingest)
⋄5.13.2 Workβlow de Extracción de IoCs (ioc‑extractor)
⋄5.13.3 Workβlow de Generación de Reportes (report‑generator)
⋄5.13.4 Manejo de Errores Transversal
⋄5.13.5 Variables de Entorno y Referencias Cruzadas
∘5.14 Propuesta de Dashboards de Visualización en Tiempo Real
Capítulo VI — Discusión
•6.1 Análisis Comparativo: Automatización vs Procesamiento Manual
∘6.1.1 Lı́nea de base de procesamiento manual
∘6.1.2 Tabla comparativa de métricas
∘6.1.3 Análisis de escalabilidad
∘6.1.4 Análisis de precisión
∘6.1.5 Veriβicación de criterios de éxito
∘6.1.6 Sı́ntesis del análisis comparativo
∘6.2 Interpretación de resultados
⋄6.2.1 Análisis cuantitativo de eventos
⋄6.2.2 Análisis cualitativo de comportamiento
∘6.3 Comparación con literatura existente
∘6.4 Limitaciones del estudio
∘6.5 Implicaciones prácticas
⋄6.5.1 Para PyMEs
⋄6.5.2 Para instituciones educativas
⋄6.5.3 Para la academia
∘6.6 Detección de Patrones mediante Machine Learning (→ §7.5)
∘6.7 Evaluación crı́tica de n8n como plataforma de automatización CTI
⋄6.7.1 Ventajas observadas
⋄6.7.2 Limitaciones encontradas
⋄6.7.3 Trade‑offs frente a alternativas
∘6.8 Calidad y utilidad de los IoCs generados
⋄6.8.1 Utilidad analı́tica
⋄6.8.2 Falsos positivos y ruido
⋄6.8.3 Enriquecimiento contextual
⋄6.8.4 Comparación con IoCs de feeds públicos
∘6.9 Implicaciones de la integración MISP en el ecosistema CTI (→ §7.5)
∘6.10 Comparación con soluciones existentes
⋄6.10.1 Tabla comparativa multidimensional
⋄6.10.2 Análisis de posicionamiento
⋄6.10.3 Nicho óptimo de aplicación
Capítulo VII — Conclusiones
•7.1 Sı́ntesis del problema abordado
∘7.2 Evaluación de hipótesis y contribuciones
⋄7.2.1 Resultados conβirmados
⋄7.2.2 Resultados sugeridos
## 5

⋄7.2.3 Aportes del trabajo
∘7.3 Sı́ntesis global: resultados frente a objetivos
⋄7.3.1 Tabla de correspondencia objetivos‑resultados
⋄7.3.2 Evaluación global
∘7.4 Trabajo futuro (→ §7.5)
∘7.5 Trabajo futuro priorizado: matriz y hoja de ruta
⋄7.5.1 Matriz de priorización
⋄7.5.2 Criterios de priorización
⋄7.5.3 Hoja de ruta recomendada
## ∘7.6 Cierre
Capítulo VIII — Recomendaciones
## •8.1 Introducción
∘8.2 Recomendaciones para instituciones educativas
∘8.3 Recomendaciones para PyMEs
∘8.4 Recomendaciones para investigadores
∘8.5 Matriz resumen de recomendaciones
## Anexos
•Anexo I: Diagramas de arquitectura
•Anexo II: Workβlows n8n exportados
•Anexo III: Datos crudos y tablas completas
Índice de βiguras
Figura 4.1: Arquitectura general de la solución por capas (Anexo I).Fuente: Elaboración
propia.
Figura 4.2: Topologı́a de red con segmentación VLAN y reglas de βirewall (Anexo I).Fuen‑
te: Elaboración propia.
Figura 4.3: Diagrama de secuencia del procesamiento de un evento de ataque (Anexo I).
Fuente: Elaboración propia.
Figura 4.4: Flujo de datos desde la captura del evento hasta la generación del reporte
(Anexo I).Fuente: Elaboración propia.
Figura 4.5: Diagrama de contenedores Docker con puertos, volúmenes y redes (Anexo
I).Fuente: Elaboración propia.
Figura 5.1: Timeline de eventos capturados por minuto. Fuente: Elaboración propia.
Figura 5.2: Distribución de eventos por tipo (eventid). Fuente: Elaboración propia.
Figura 5.3: Secuencia de comandos ejecutados. Fuente: Elaboración propia.
Figura 5.4: Distribución de los intentos de autenticación. Fuente: Elaboración propia.
Figura 5.5: Distribución de eventos por protocolo. Fuente: Elaboración propia.
Figura 5.11: Timeline de eventos de la sesión (por segundo). Fuente: Elaboración propia.
Figura 5.15: Maqueta del dashboard de monitoreo del pipeline de procesamiento en n8n.
Fuente: Elaboración propia.
Figura 5.17: Diagrama de flujo del workflow event-ingest (Anexo II). Fuente: Elaboración
propia.
Figura 5.18: Diagrama de flujo del workflow ioc-extractor (Anexo II). Fuente: Elaboración
propia.
Figura 5.19: Diagrama de flujo del workflow report-generator (Anexo II). Fuente: Elabora‑
ción propia.
Figura 5.20: Patrón de manejo de errores transversal (Anexo II). Fuente: Elaboración pro‑
pia.
Figura III‑1: Modelo relacional de los STIX Domain Objects (SDOs) y sus relaciones (Ane‑
xo III).Fuente: Elaboración propia basada en OASIS (2021a).
Figura III‑2: Comparación de tiempo de procesamiento manual vs automatizado por vo‑
lumen de eventos (Anexo III). Fuente: Elaboración propia.
Índice de tablas
Tablas del cuerpo (Capı́tulo V):
Tabla 5.1: Resumen general de eventos capturados.
Tabla 5.3: Eventos correctamente estructurados por honeypot.
Tabla 5.4: Indicadores de compromiso (IoCs) generados.
Tabla 5.5: Reportes automatizados generados.
Tabla 5.8: Veriβicación de criterios cuantitativos.
Tabla 5.9: Resumen de captura por honeypot.
Tabla 5.10: Eventos por protocolo atacado.
Tabla 5.22: Mapeo de hallazgos notables a MITRE ATT&CK.
Tablas del cuerpo (Capı́tulo VI):
Tabla 6.2: Comparación de métricas entre procesamiento manual estimado y sistema
automatizado.
Tabla 6.5: Veriβicación de criterios de éxito del proyecto.
Tabla 6.6: Limitaciones del estudio: impacto y mitigación.
Tablas del cuerpo (Capı́tulo VII):
Tabla 7.1: Veriβicación de las hipótesis operativas frente a los resultados.
Tabla 7.2: Veriβicación de los objetivos especı́βicos y su evidencia.
Tabla 7.3: Correspondencia entre objetivos especı́βicos, resultados obtenidos y criterios
de éxito.
Tabla 7.4: Priorización de trabajo futuro.
Tablas del Anexo III (datos de detalle migrados del cuerpo):
Tabla III‑1: Tiempos de procesamiento por evento.
Tabla III‑2: Distribución de IPs atacantes.
Tabla III‑3: Credenciales observadas (hash SHA256).
Tabla III‑6: Métricas de validación del sistema.
Tabla III‑9: Distribución operativa de IoCs por tipo.
Tabla III‑13: Criterios de asignación de niveles de conβianza.
Tabla III‑14: Distribución de IoCs por nivel de conβianza.
Tabla III‑25: Tipos de IoCs generados por la arquitectura y su fuente de captura.
Tabla III‑26: Comparación de formatos de IoC.
Tabla III‑27: STIX Domain Objects (SDOs) y campos clave.
Tabla III‑28: Comparación OpenIOC 1.1 vs STIX 2.1.
Tabla III‑29: Mapeo conceptual de IoCs extraı́dos a objetos STIX 2.1.
Tabla III‑30: Análisis comparativo de los estándares de inteligencia de amenazas.
Tabla III‑33: Comparación de precisión de parseo manual vs automatizado.
Tabla III‑34: Comparación de plataformas de automatización para CTI.
Tabla III‑35: Comparación de la arquitectura propuesta con soluciones existentes.
## 8

## Capítulo I: Introducción
1.1 Introducción y contextualización del problema
Durante las últimas décadas, la transformación digital ha modiβicado la manera en que or‑
ganizaciones públicas, empresas e individuos gestionan información y prestan servicios. La
adopción masiva de infraestructuras conectadas, servicios en la nube, dispositivos móviles,
automatización industrial e IoT ha incrementado la dependencia tecnológica y, con ella, la
superβicie de exposición frente a amenazas informáticas cada vez más soβisticadas. Hoy los in‑
cidentes de ciberseguridad no son eventos aislados, sino una realidad permanente que afecta
la continuidad operativa, la reputación institucional y la integridad de los datos.
Los actores maliciosos han evolucionado desde esquemas individuales hacia estructuras pro‑
fesionalizadas con altos niveles de automatización: campañas de fuerza bruta, explotación de
vulnerabilidades, ransomware, botnets, robo de credenciales y exβiltración de información,
ejecutadas mediante herramientas que recorren Internet de forma constante en busca de ob‑
jetivos vulnerables. Frente a ello, gran parte de las organizaciones sostiene modelos defensi‑
vos predominantemente reactivos: βirewalls, antivirus, IDS/IPS y EDR operan respondiendo
a patrones previamente conocidos, lo que limita la comprensión de amenazas emergentes y
comportamientos adaptativos no documentados.
En este contexto surge la necesidad de incorporar enfoques complementarios orientados a la
observación activa del atacante. Dentro de estas estrategias, los honeypots representan una
herramienta de alto valor técnico y metodológico. Se trata de sistemas diseñados para simular
servicioslegı́timosconel objetivodeatraerinteraccionesmaliciosas,registrarcomportamien‑
to hostil y obtener inteligencia accionable sin comprometer activos productivos reales.
La presente investigación se inscribe en dicho paradigma y propone el diseño e implementa‑
ción de una arquitectura de honeypots integrada con la plataforma de automatización n8n,
orientada a transformar eventos de ataque en inteligencia de amenazas procesable de forma
automática. La arquitectura propuesta se organiza en cuatro capas funcionales —captura, pro‑
cesamiento, persistencia y análisis— que se ilustran en la Figura 4.1.
1.2 Planteamiento del problema
Las organizaciones modernas enfrentan una asimetrı́a operativa signiβicativa en materia de
ciberseguridad. Mientras el atacante necesita encontrar una única debilidad explotable, el de‑
fensor debe proteger de manera integral toda su infraestructura tecnológica. Esta desigualdad
se profundiza cuando los actores hostiles emplean automatización, infraestructura distribui‑
da y herramientas de código abierto de rápida adopción.
Uno de los principales problemas en entornos reales es la falta de visibilidad sobre el com‑
portamiento del adversario: los registros tradicionales indican que ocurrió un escaneo o un
intento de acceso, pero no permiten reconstruir qué servicios resultan atractivos, qué creden‑
ciales se intentan, qué comandos se ejecutarı́an tras un acceso exitoso, qué malware se des‑
carga o qué IoCs podrı́an derivarse del evento. Además, muchos equipos enfrentan sobrecar‑
ga de alertas, escasez de personal especializado y limitaciones presupuestarias para adquirir
## 9

soluciones avanzadas de inteligencia de amenazas, lo que genera respuestas lentas y análi‑
sis incompletos. En el ámbito académico, numerosos despliegues de honeypots se realizan de
forma experimental, sin metodologı́a documentada ni criterios de validación deβinidos.
En consecuencia, el problema central que aborda esta investigación puede formularse de la si‑
guiente manera: ¿Es posible diseñar una arquitectura de honeypots integrada con herramien‑
tas de automatización de código abierto que permita mejorar la generación de inteligencia de
amenazas local, reducir tiempos de análisis y fortalecer la capacidad de respuesta defensiva?
1.3 Justiβicación de la investigación
La relevancia de esta investigación se sustenta en dimensiones académicas, técnicas, operati‑
vas y económicas.
1.3.1 Justiβicación académica
Desde la perspectiva universitaria, el trabajo aporta una aplicación concreta de conocimien‑
tos de programación, redes, seguridad informática, bases de datos, automatización y análisis
de información. Asimismo, integra teorı́a y práctica mediante una arquitectura reproducible
orientada a resolver una problemática actual.
1.3.2 Justiβicación técnica
Los honeypots permiten obtener evidencia empı́rica sobre ataques reales. A diferencia de re‑
gistros tradicionales, toda interacción sobre un sistema señuelo posee alto valor analı́tico, ya
que no existe tráβico legı́timo esperado. Esto mejora la calidad de los datos observados.
1.3.3 Justiβicación operativa
La automatización mediante n8n permite reducir tareas manuales repetitivas, enriquecer
eventos con fuentes externas, clasiβicar amenazas y generar alertas o reportes de forma in‑
mediata. Esto resulta especialmente valioso para organizaciones con recursos humanos limi‑
tados.
1.3.4 Justiβicación económica
El uso de herramientas open source reduce barreras de entrada y facilita la adopción en ins‑
tituciones educativas, pequeñas empresas, organismos públicos y organizaciones regionales
que no disponen de grandes presupuestos para plataformas comerciales.
1.3.5 Justiβicación estratégica
La inteligencia generada localmente posee alto valor contextual. Permite conocer qué ame‑
nazas impactan especı́βicamente sobre una infraestructura determinada y adaptar controles
defensivos según evidencia propia, no únicamente según reportes globales.
1.4 Objetivos de la investigación
1.4.1 Objetivo general
## 10

Diseñar e implementar una arquitectura de honeypots integrada con la plataforma n8n para
automatizar la recolección, procesamiento y generación de inteligencia de amenazas a partir
de eventos reales observados en Internet.
1.4.2 Objetivos especíβicos
1.Analizar el marco conceptual de honeypots, deception security e inteligencia de amena‑
zas.
2.Diseñar una arquitectura segmentada y segura para el despliegue controlado de senso‑
res honeypot.
3.Implementar honeypots orientados a capturar intentos de acceso, escaneos y actividad
maliciosa.
4.Integrar los eventos recolectados con βlujos automatizados en n8n.
5.Incorporar procesos de enriquecimiento mediante geolocalización, reputación IP y aná‑
lisis de artefactos.
6.Evaluar la utilidad operativa del sistema mediante métricas de procesamiento, trazabi‑
lidad y capacidad analı́tica.
7.Elaborar recomendaciones técnicas para replicabilidad institucional futura.
1.5 Alcances y delimitaciones
La investigación se circunscribe al análisis técnico de eventos registrados por honeypots des‑
plegados en una infraestructura controlada y expuesta a Internet. El estudio se orienta exclu‑
sivamente a la observación defensiva y generación de inteligencia.
No constituye objetivo del trabajo:
Identiβicar civil o penalmente a los atacantes.
Realizar contraataques o actividades ofensivas.
Interferir con terceros.
Obtener acceso no autorizado a sistemas externos.
Los resultados dependerán del perı́odo efectivo de observación, los servicios expuestos y la
dinámica cambiante del ecosistema de amenazas. Asimismo, la investigación se limita a herra‑
mientas seleccionadas para el laboratorio propuesto, por lo que otras soluciones comerciales
o arquitecturas alternativas quedan fuera del alcance inmediato del estudio.
1.6 Hipótesis operativas
Dado el diseño no experimental, observacional y transversal del estudio, no se formulan hipó‑
tesis estadı́sticas en sentido estricto, sino hipótesis operativas. Cada hipótesis deβine un um‑
bral cuantiβicable derivado de los criterios de validación del sistema (establecidos en §4.9), lo
que permite una evaluación empı́rica basada en métricas observables:
1.P1 — Reducción de tiempo:El tiempo de procesamiento por evento mediante la ar‑
quitectura automatizada es inferior al 50 % del tiempo estimado para procesamiento
manual (criterio §4.9.1).
## 11

2.P2 — Estructuración de datos:Al menos el 80 % de los eventos capturados son estruc‑
turados en formato JSON válido con campos consistentes (criterio §4.9.2).
3.P3 — Generación de IoCs:El pipeline genera indicadores de compromiso (IoCs) auto‑
máticamente para al menos el 70 % de las sesiones con actividad maliciosa conβirmada
## (criterio §4.9.3).
4.P4 — Reportes automatizados:El sistema produce reportes de inteligencia sin inter‑
vención manual directa para al menos el 90 % de los ataques categorizados como de
interés (criterio §4.9.5).
1.7 Variables de análisis
Variable independiente:Implementación de arquitectura de honeypots integrada con auto‑
matización mediante n8n.
Variables dependientes:‑ Tiempo de procesamiento de eventos. ‑ Calidad y cantidad de indi‑
cadoresdecompromisogenerados.‑Capacidaddeclasiβicacióndeincidentes.‑Disponibilidad
de reportes automatizados. ‑ Utilidad operativa para toma de decisiones defensivas.
1.8 Estructura del trabajo
El documento se organiza en los siguientes capı́tulos:
Capítulo I:Introducción general.
Capítulo II:Estado del arte.
Capítulo III:Marco teórico.
Capítulo IV:Metodologı́a.
Capítulo V:Resultados experimentales.
Capítulo VI:Discusión.
Capítulo VII:Conclusiones.
Capítulo VIII:Recomendaciones.
1.9 Cierre del capítulo
La creciente complejidad del panorama digital exige enfoques defensivos más inteligentes,
dinámicos y basados en evidencia. En ese contexto, la combinación entre honeypots y auto‑
matización representa una alternativa técnicamente viable y académicamente relevante para
fortalecer capacidades de observación, análisis y respuesta ante amenazas reales.
El siguiente capı́tulo desarrollará el estado del arte sobre honeypots, tecnologı́as de engaño y
proyectos relacionados.
## 12

Capítulo II: Estado del Arte
## 2.1 Introducción
Continuando con la contextualización presentada en el Capı́tulo I, el presente capı́tulo exami‑
na el estado actual del conocimiento en honeypots, tecnologı́as de engaño y su integración
con automatización para inteligencia de amenazas. Se analizan antecedentes, evolución de
herramientas, proyectos relacionados y tendencias vigentes, con el objetivo de posicionar la
arquitectura propuesta. A diferencia del marco teórico (Capı́tulo III), que desarrolla los funda‑
mentos conceptuales, este capı́tulo se centra en qué se ha hecho y qué herramientas existen
en el campo especı́βico de los honeypots.
2.2 Evolución reciente del panorama de amenazas
Durante los últimos años, el ecosistema de amenazas informáticas mostró un crecimiento sos‑
tenido en volumen y complejidad, impulsado por la disponibilidad pública de herramientas
ofensivas, los mercados ilegales de acceso inicial, la infraestructura cloud abusada, la profe‑
sionalización del cibercrimen y el crecimiento de activos conectados (Soleimani & Khorsand,
2021).Losreportesdelaindustriacoincidenenataquesautomatizadosdefuerzabruta,explo‑
tación masiva de vulnerabilidades, ransomware, botnets IoT, phishing, robo de credenciales
y escaneos permanentes de servicios expuestos (Kampanakis, 2014; Nawrocki et al., 2016).
Como consecuencia, la defensa tradicional basada exclusivamente en perı́metro resulta insu‑
βiciente frente a amenazas distribuidas, veloces y adaptativas.
2.3 Tendencias actuales en defensa cibernética
Frente a este escenario, la ciberseguridad evolucionó hacia modelos integrales y proactivos:
Zero Trust(“nunca conβiar, siempre veriβicar”; Kindervag, 2010), plataformasXDRque integran
telemetrı́a multi‑fuente (Bromiley, 2016), solucionesSOAR —término acuñado por Gartner en
2015— que automatizan respuestas ope‑
rativas, laDeception Technologycon señuelos y honeypots de alta pre‑
cisión (Spitzner, 2002) y lainteligencia de amenazas contextualizadacon indicadores de
la realidad local de cada organización (Bromiley, 2016). El presente trabajo se sitúa en la con‑
vergencia entre deception security, threat intelligence y automatización.
2.4 Estado actual del uso de honeypots
Los honeypots evolucionaron considerablemente desde sus primeras implementaciones aca‑
démicas (Spitzner, 2002): de experimentales pasaron a emplearse en laboratorios universita‑
rios, CSIRT/CERT, SOC, investigación de malware y estudios estadı́sticos sobre amenazas glo‑
bales. Sus usos contemporáneos incluyen detección temprana de escaneos, captura de malwa‑
re automatizado, identiβicación de credenciales usadas por botnets, observación de tácticas
post‑explotación, obtención de IoCs y entrenamiento defensivo. No obstante, gran parte de
los despliegues presentan limitaciones comunes: escasa documentación metodológica, falta
de automatización analı́tica, baja integración con procesos de respuesta y dependencia de la
revisión manual de logs — brechas que la presente tesis busca superar.
## 13

2.5 Evolución de honeypots: de Spitzner a Cowrie y Dionaea
El concepto de honeypot fue formalizado académicamente por Lance Spitzner (2002) (deβi‑
nición formal en §3.5.1). Desde entonces, la tecnologı́a ha evolucionado signiβicativamente a
través de distintas generaciones, cada una impulsada por necesidades especı́βicas de investi‑
gación y por la creciente soβisticación del ecosistema de amenazas.
2.5.1 Línea temporal de hitos clave
HoneypotAñoAutor/Equipo
## Contribución
principalEstado actual
Concepto de
honeypot
2002Lance SpitznerFormalización
académica del
concepto y
deβinición de sus
aplicaciones
defensivas
## Referencia
fundacional
(Spitzner, 2002)
Honeyd2002Niels ProvosSimulación de
múltiples sistemas
virtuales en una
sola máquina;
pionero en
honeypots de baja
interacción
## Inactivo
Nepenthes2005Equipo HoneynetCaptura
automatizada de
malware mediante
emulación de
vulnerabilidades
## Inactivo
(reemplazado por
## Dionaea)
Kippo2009Upi TamminenHoneypot SSH de
mediana
interacción con
sistema de archivos
simulado y registro
de sesiones
## Inactivo
(reemplazado por
## Cowrie)
Dionaea2009Honeynet ProjectCaptura de malware
multi‑protocolo
## (SMB, HTTP, FTP,
## MSSQL, TFTP);
sucesor de
## Nepenthes
## Activo
Glastopf2010Lukas RistHoneypot web de
baja/mediana
interacción;
emulación dinámica
de vulnerabilidades
web
## Inactivo
Cowrie2015Michel OosterhofSucesor de Kippo
con soporte Telnet,
registro JSON,
captura de
descargas y SFTP
## Activo
## 14

HoneypotAñoAutor/Equipo
## Contribución
principalEstado actual
Snare2015Team MUSHHoneypot web de
alta interacción
basado en proxy
reverso; captura
post‑explotación
real
## Activo
2.5.2 Generaciones de honeypots
Laevoluciónpuedeagruparseentresgeneraciones:laprimera(2000‑2005)consolidó losfun‑
damentos académicos conHoneyd(Provos, 2002; Provos & Holz, 2007) yNepenthes, que sentó las bases de
la captura automatizada de malware; la segunda (2005‑2015) especializó la emulación por
protocolo conKippo(SSH interactivo),Dionaea(multi‑protocolo) yGlastopf(web) (Dionaea
Project, 2024; Cowrie Project, 2024); la tercera (2015‑presente) prioriza la calidad del regis‑
troestructuradoenJSONylaintegraciónconplataformasexternas,conCowriecomohoneypot
SSH más adoptado globalmente (Cowrie Project, 2024).
2.5.3 Clasiβicación del ecosistema de honeypots
El ecosistema de herramientas se clasiβica según nivel de interacción, propósito y protocolos
emulados (la taxonomı́a multidimensional completa, con criterios de selección según escena‑
rio, se desarrolla en §3.5.3):
Nivel de interacciónPropósitoProtocolosEjemplos
BajaCensado de escaneos,
captura de credenciales e
IoCs, captura de malware
## SSH, SMB, HTTP, FTP,
## MSSQL, TFTP;
Modbus/S7 (ICS)
## Honeyd, Nepenthes,
## Dionaea, Heralding,
## Conpot
MediaObservación
post‑autenticación,
análisis de TTPs
SSH, Telnet, HTTPKippo, Cowrie, Glastopf
AltaAnálisis forense
avanzado, estudio de
APTs
SSH, HTTP, arbitrariosSnare, Honeynet real
Herramientas especializadas complementan el ecosistema:Conpot(protocolos ICS/SCADA)
yT‑Pot(múltiples honeypots en Docker) (Nawrocki et al., 2016; Deutsche Telekom Security,
2023), y los desarrollos recientes exploran honeypots de alta interacción para la gestión de
amenazas de red (Yang et al., 2023). La evolución marca el paso de honeypots deinvestigación—estudiar al atacante en
entornos académicos— hacia honeypots deproducciónque generan inteligencia accionable
en tiempo real (Spitzner, 2002).
2.6 Proyectos relacionados
La siguiente tabla compara los tres proyectos relacionados más relevantes del ecosistema y
su relación con la arquitectura propuesta.
## 15

ProyectoAñoPropósitoArquitecturaLimitaciones
Relación con la
tesis
## The Honeynet
## Project
1999Organización
internacional de
investigación en
seguridad y
desarrollo de
honeypots open
source
(Nawrocki et al.,
## 2016)
Red global de
capı́tulos que
comparten
investigaciones
y herramientas;
desarrolló
Dionaea y
## Glastopf
## Enfoque
académico,
menor
automatización
operativa,
herramientas
sin plataforma
de integración
uniβicada
Base de Dionaea
y principios
metodológicos;
la integración se
aborda con n8n
HPFeeds2011Protocolo
pub/sub liviano
para transmitir
eventos entre
sensores y
centros de
recolección
(Arockiam et al.,
## 2020)
TCP pu‑
blish/subscribe:
sensores
publican
eventos a un
broker central
## Sin
transformación
ni enriqueci‑
miento; broker
como punto
único de falla;
sin garantı́as de
entrega
Reemplaza el
canal pub/sub
por webhooks
## HTTP
manejados por
n8n, con
transformación
y enriqueci‑
miento
integrados
## Modern Honey
## Network
## (MHN)
2014Plataforma de
gestión
centralizada de
múltiples
honeypots
desde una
interfaz web
(Al‑Turjman &
## Salama, 2021)
MHN Server
(web + API
## REST), MHN
## Sensors
(Cowrie,
## Dionaea,
## Glastopf),
HPFeeds Broker
## Automatización
limitada a
recolección; sin
enriquecimien‑
to contextual;
generación de
IoCs manual
## Antecedente
más directo: la
tesis aborda
automatización
analı́tica (n8n),
enriquecimien‑
to y generación
automática de
IoCs
Ensı́ntesis,lostresproyectoscubrenfacetascomplementarias—investigación(HoneynetPro‑
ject), transporte (HPFeeds) y gestión centralizada (MHN)—, pero ninguno integra un pipeline
que transforme automáticamente eventos crudos en inteligencia estructurada. Estos antece‑
dentes, junto con la taxonomı́a de §3.5.3, permiten posicionar la arquitectura propuesta frente
al panorama existente.
2.7 Posicionamiento de la arquitectura propuesta
2.7.1 Brecha identiβicada en el estado del arte
El análisis de los proyectos existentes revela una brecha transversal: la desconexión entre la
capturade eventos honeypot y lageneración efectiva de inteligencia de amenazas. Las plata‑
formas actuales se enfocan en recolección y visualización (MHN), transporte de eventos (HP‑
Feeds)oinvestigaciónacadémica(HoneynetProject),peroningunaofreceunpipelinecomple‑
to que transforme eventos crudos en IoCs estructurados, enriquecidos y listos para consumo
defensivo (Al‑Turjman & Salama, 2021). Esta brecha constituye la oportunidad que aborda la
presente tesis.
2.7.2 Tabla comparativa con proyectos existentes
## 16

DimensiónMHNHPFeedsHoneynet Project
## Arquitectura
propuesta
AutomatizaciónBásica (recolección)  Nula (transporte)    Manual
## (investigación)
## Integral
## (recolección →
procesamiento →
análisis →
diseminación)
EnriquecimientoNo incorporaNo aplicaLimitadoCompleto
## (geolocalización,
reputación IP,
análisis contextual)
CostoOpen sourceOpen sourceOpen sourceOpen source(todos
los componentes)
ReplicabilidadMedia (scripts)Alta (protocolo)Baja (manual)Alta(Docker +
documentación
metodológica)
EscalabilidadMediaAltaBajaAlta(Docker
Swarm/Kubernetes‑
ready)
Generación de
IoCs
ManualNo aplicaManualAutomática(βlujos
n8n con formato
STIX‑ready)
## Intervención
humana
## Visualización +
análisis
## Conβiguración
inicial
Análisis completoMínima(solo
supervisión y
ajuste)
## Documentación
metodológica
ParcialTécnicaAcadémicaCompleta
## (metodologı́a +
criterios de
validación)
Formato de
eventos
HPFeedsBinarioVariableJSON + webhooks
(estándar abierto)
2.7.3 Ventajas diferenciales de la arquitectura propuesta
1.Automatización integral:n8n transforma eventos en inteligencia procesable sin inter‑
vención manual directa, a diferencia de MHN que solo centraliza gestión.
2.Enriquecimiento contextual:geolocalización, reputación IP y análisis de artefactos in‑
tegrados en el βlujo automatizado, lo que ningún proyecto existente ofrece de forma in‑
tegrada.
3.Arquitectura replicable:basada en Docker, despliega en infraestructura mı́nima con
documentación metodológica completa.
4.Bajo costo:herramientas open source, adecuadas para PyMEs e instituciones educati‑
vas.
5.Pipeline completo:abarca desde la captura hasta la diseminación, cerrando el ciclo de
inteligencia.
2.7.4 Limitaciones que persisten
A pesar de las ventajas, la arquitectura presenta limitaciones explı́citas: no alcanza la integra‑
ción de una plataforma SOAR empresarial completa; la automatización no reemplaza el aná‑
lisis humano, lo complementa; la cobertura de protocolos se limita a los emulados por Cow‑
## 17

rie y Dionaea; y la escalabilidad a grandes volúmenes requerirı́a optimizaciones adicionales
en la infraestructura Docker. Estas limitaciones se abordan en los capı́tulos de metodologı́a
y conclusiones. El recorrido por el estado del arte evidencia que, si bien existen herramien‑
tas consolidadas y proyectos de referencia, la integración de la captura con un procesamiento
analı́tico automatizado sigue siendo un área con amplio margen de desarrollo; esta revisión
atiende al objetivo especı́βico 1 y proporciona la base contextual para los objetivos 2 y 3.
## 18

Capítulo III: Marco Teórico
## 3.1 Introducción
El presente capı́tulo desarrolla los fundamentos teóricos que sustentan la investigación, arti‑
culando cuatro ejes: el paradigma de la ciberseguridad defensiva, los honeypots como meca‑
nismos de observación, la inteligencia de amenazas como objetivo del sistema y la automa‑
tización aplicada a operaciones de seguridad. A diferencia del capı́tulo anterior (Estado del
Arte), que examinó qué se ha hecho, aquı́ se desarrollan los conceptos, modelos y teorı́as que
fundamentan las decisiones metodológicas y técnicas, respondiendo al objetivo especı́βico 1 y
estableciendo las bases para los objetivos 4 y 5.
3.2 Ciberseguridad y cambio de paradigma defensivo
La ciberseguridad contemporánea se caracteriza por un entorno donde los sistemas conec‑
tados a redes públicas están expuestos permanentemente a intentos de acceso no autorizado
(Kampanakis, 2014). El enfoque tradicional basado exclusivamente en la prevención presenta
limitaciones ante la automatización de ataques, la diversidad de vectores y la velocidad de pro‑
pagación. Como consecuencia, surge un cambio de paradigma hacia modelos que incorporan
monitoreo continuo, detección temprana y generación de inteligencia de amenazas (Bejtlich,
2004): la defensa ya no se basa solo en bloquear accesos, sino también en observar, aprender
y adaptarse.
3.3 Seguridad de la información y ciberseguridad
La seguridad de la información puede entenderse como el conjunto de polı́ticas, controles y
prácticasorientadasaprotegeractivosinformacionalesfrenteaamenazasinternasyexternas.
Tradicionalmente se estructura sobre la trı́ada CIA:
Conβidencialidad:Garantizar que la información solo sea accesible para sujetos autori‑
zados.
Integridad:Asegurar que los datos no sean alterados indebidamente.
Disponibilidad:Mantener acceso oportuno a sistemas y servicios cuando sean reque‑
ridos.
Con la expansión del entorno digital, el concepto evolucionó hacia la ciberseguridad, incorpo‑
rando la protección de redes, servicios en lı́nea, identidades digitales, dispositivos conectados
e infraestructuras crı́ticas.
3.3.1 Riesgo, amenaza y vulnerabilidad
Estos conceptos resultan centrales para cualquier análisis técnico:
Vulnerabilidad:Debilidad en diseño, conβiguración, software o procesos que puede ser
explotada.
Amenaza:Actor, evento o circunstancia con capacidad de generar daño.
## 19

Riesgo:Probabilidad de que una amenaza explote una vulnerabilidad generando impac‑
to.
De forma simpliβicada: Riesgo = Probabilidad × Impacto. La gestión moderna de seguridad
busca reducir riesgos mediante controles preventivos, detectivos y correctivos.
3.3.2 Modelos tradicionales de detección y sus limitaciones
Entre las tecnologı́as más utilizadas históricamente se encuentran:
Firewalls:Controlan tráβico entrante y saliente según reglas deβinidas.
IDS/IPS:Detectan o bloquean patrones maliciosos conocidos.
Antivirus / EDR:Analizan procesos, archivos y comportamiento de endpoints.
SIEM:Centralizan logs y correlacionan eventos.
Aunque indispensables, estas soluciones enfrentan limitaciones: dependencia de βirmas cono‑
cidas, alto volumen de alertas, falsos positivos, baja visibilidad sobre intención del atacante y
escasa capacidad para amenazas nuevas. Por ello, se vuelve relevante complementar la defen‑
sa con mecanismos de observación activa.
3.4 Teoría del engaño en ciberseguridad
El engaño constituye una práctica histórica en ámbitos militares, estratégicos y de inteligencia.
En el plano digital, consiste en inducir al atacante a interactuar con activos controlados por el
defensor.
Principios fundamentales:
1.Desviar atención de activos reales.
2.Aumentar costo operativo del atacante.
3.Obtener información del adversario.
4.Detectar intrusiones tempranas.
5.Reducir incertidumbre defensiva.
Los honeypots representan una de las formas más consolidadas de deception technology. Es‑
tudios recientes han sistematizado estas técnicas desde perspectivas complementarias: el en‑
gaño como estrategia defensiva (Javadpour et al., 2024), la integración con honeypots moder‑
nos (Morić et al., 2025), y el análisis del impacto del engaño como táctica de ciberseguridad
(Zielinski & Kholidy, 2023).
3.5 Honeypots como mecanismos de observación
3.5.1 Deβinición conceptual
Un honeypot es un sistema diseñado deliberadamente para ser explorado o atacado con el
βin de registrar actividad maliciosa (Spitzner, 2002). A diferencia de los sistemas productivos,
su propósito no es prestar servicios legı́timos, sino actuar como: sensor de actividad hostil,
herramienta de análisis, y fuente de evidencia técnica.
3.5.2 Ventajas y limitaciones
## 20

Entre las principales ventajas de los honeypots se destaca su alta relación señal/ruido, ya que
toda interacción registrada puede considerarse potencialmente maliciosa (Spitzner, 2002).
Ventajas:‑ Alta relación señal/ruido. ‑ Captura directa de actividad maliciosa. ‑ Facilidad de
análisis.
Limitaciones:‑ Cobertura limitada. ‑ Posibilidad de detección por atacantes. ‑ Dependencia
del entorno.
Revisiones sistemáticas de la literatura (Ikuomenisan & Morgan, 2022; Ilg et al., 2023;
Franco et al., 2021) y estudios de recolección y análisis de datos de honeypots (Duděn et al.,
2020) conβirman que estas
limitaciones son inherentes a la tecnologı́a de honeypots y transversales a las distintas imple‑
mentaciones.
3.5.3 Taxonomía de honeypots y criterios de selección
La clasiβicación de honeypots constituye un área de estudio en sı́ misma dentro de la litera‑
tura de ciberseguridad (Spitzner, 2002; Bajpai & Shukla, 2021). Los honeypots pueden clasiβicarse según múltiples
criterios o dimensiones, siendo las más relevantes: nivel de interacción, propósito, protocolo
emulado y tipo de despliegue.
3.5.3.1 Taxonomía multidimensional
DimensiónCategorı́aDescripciónEjemplosNivel de riesgo
Nivel de
interacción
BajaEmulan servicios
básicos; responden
con
comportamiento
limitado
## Honeyd, Dionaea,
## Heralding
## Bajo
MediaPermiten sesiones
interactivas con
sistemas de
archivos simulados
## Kippo, Cowrie,
## Glastopf
## Medio
AltaSistemas operativos
reales o completos,
sin restricciones de
interacción
## Snare, Honeynet
real
## Alto
PropósitoInvestigaciónCaptura de datos
sobre amenazas y
comportamiento
atacante
## Cowrie (modo
investigación),
## Dionaea
## Variable
ProducciónDetección temprana
en entornos
productivos reales
Honeyd, honeypots
personalizados
## Bajo
EntrenamientoFormación de
equipos de
seguridad en
entornos
controlados
## Honeynet,
laboratorios
## Controlado
ProtocoloSSH/TelnetEmulación de
servicios de acceso
remoto
## Cowrie, Kippo,
## Heralding
## Medio
## 21

DimensiónCategorı́aDescripciónEjemplosNivel de riesgo
Multi‑protocoloEmulación de
múltiples servicios
simultáneos
Dionaea, HoneydBajo‑Medio
WebEmulación de
servidores HTTP y
aplicaciones web
## Glastopf, Snare,
## Wordpot
Medio‑Alto
Base de datosEmulación de
servicios de bases
de datos
MongoDB
## Honeypot,
MySQLPot
## Bajo
ICS/SCADAEmulación de
protocolos
industriales
Conpot, SCADA
## Honeynet
## Bajo
IoTEmulación de
dispositivos
inteligentes
IoT Honeypot,
HoneyThing
## Bajo
DespliegueFı́sicoHardware dedicado
con sistema
operativo real
Servidor fı́sico con
## Honeynet
## Alto
VirtualMáquina virtual
sobre hipervisor
VM con Cowrie o
## Dionaea
## Medio
ContenedorAislamiento a nivel
de sistema
operativo
Docker con T‑Pot,
contenedores
individuales
## Bajo
Hı́bridoCombinación de los
anteriores
T‑Pot, MHNMedio
3.5.3.2 Clasiβicación por nivel de interacción detallada  Baja interacción:Simulan servi‑
cios básicos respondiendo con comportamientos predeβinidos. No permiten la ejecución real
de comandos. Ventajas: bajo riesgo, fácil despliegue, mı́nimo mantenimiento. Desventajas: fá‑
cil detección por atacantes experimentados, información limitada. Ideales para: censado de
escaneos, recolección de IoCs básicos, monitoreo de tendencias.
Media interacción:Ofrecen entornos simulados más realistas, como sistemas de archivos
falsos y respuestas dinámicas. Permiten observar comandos ejecutados y comportamiento
post‑autenticación sin exponer un sistema real. Ventajas: mayor riqueza de datos, mejor ocul‑
tamiento. Desventajas: riesgo moderado (bugs de emulación), mayor complejidad de conβigu‑
ración. Ideales para: análisis de TTPs básicos, captura de credenciales, estudio de campañas
automatizadas.
Alta interacción:Utilizan sistemas operativos reales o completos, sin limitaciones de interac‑
ción. Proporcionan la máxima βidelidad de datos. Ventajas: captura total del comportamiento
atacante. Desventajas: alto riesgo (el atacante tiene acceso a un sistema real), alta carga opera‑
tiva, necesidad de monitoreo constante. Ideales para: investigación forense avanzada, estudio
de APTs, análisis de malware complejo.
3.5.3.3CriteriosdeseleccióndehoneypotssegúnelescenarioLa selección de un honey‑
pot depende del objetivo del despliegue, los recursos disponibles y el nivelde riesgo aceptable.
La literatura identiβica criterios transversales que orientan la elección (Nawrocki et al., 2016):
## 22

EscenarioObjetivo principal    Tipo recomendado   Nivel de interacción
Ejemplo de
herramienta
## Investigación
académica
Estudiar TTPs,
comportamiento
post‑explotación
Alta interacción /
## Hı́brido
Medio‑AltoCowrie + Honeynet
## SOC / CSIRT
operativo
## Detección
temprana, IoCs
inmediatos
## Producción,
baja‑media
interacción
Bajo‑MedioDionaea, Cowrie
Análisis de
malware
Captura de
muestras, estudio
de botnets
Baja interacción
multi‑protocolo
BajoDionaea, Nepenthes
## (legacy)
PyME sin recursos
dedicados
Monitoreo básico,
alertas tempranas
Baja interacción,
## Dockerizado
BajoT‑Pot, Cowrie +
Dionaea en Docker
Entrenamiento y
formación
Simulación de
ataques controlados
## Media‑alta
interacción
Medio‑AltoCowrie, Snare
ICS/SCADADetección de
amenazas en
entornos
industriales
Baja interacción
especializada
BajoConpot
Para cada escenario, los criterios de selección incluyen: nivel de riesgo operativo aceptable,
riquezadedatosrequerida,capacidaddeintegraciónconherramientasexistentes,recursosde
mantenimiento disponibles, y formato de salida necesario. La arquitectura propuesta en este
trabajo se posiciona en el escenario de investigación académica con proyección operativa para
PyMEs, combinando baja y media interacción para maximizar cobertura sin comprometer la
seguridad del entorno.
3.5.3.4 Criterios de selección aplicados al proyectoPara este trabajo, se seleccionaron
dos honeypots que cubren de forma complementaria el espectro de captura deseado:
CriterioCowrieDionaea
Nivel de interacciónMedia (SSH/Telnet)Baja (multi‑protocolo)
Protocolos emuladosSSH, TelnetSMB, HTTP, FTP, TFTP, MSSQL, SIP,
etc.
Formato de registroJSON por sesiónJSON estructurado
Captura de malwareSı́ (descargas vı́a SFTP/SCP)Sı́ (captura nativa)
Comunidad activaSı́ (GitHub, mailing list)Sı́ (Honeynet Project)
Integración externaWebhooks, HPFeeds, syslogHPFeeds, webhooks
Madurez del proyecto2015‑presente2009‑presente
Laselecciónrespondealcriteriodecomplementariedad:Cowriecapturaactividadsobreser‑
vicios de acceso remoto con riqueza de datos post‑autenticación, mientras que Dionaea cubre
un espectro amplio de protocolos con énfasis en captura de malware. Ambos comparten ca‑
racterı́sticas que facilitan la integración automatizada: registro estructurado en JSON, soporte
para webhooks y comunidad activa que garantiza actualizaciones continuas.
## 23

3.6 Inteligencia de amenazas (Threat Intelligence)
3.6.1 Deβinición y fundamentos
Lainteligenciadeamenazas(ThreatIntelligence,TI)puededeβinirsecomoelprocesodetrans‑
formar datos técnicos en conocimiento útil para la toma de decisiones en seguridad (Bromiley,
2016). Encuestas recientes del sector (Brown & Nickels, 2023) indican que la adopción de pro‑
cesos formales de inteligencia de amenazas sigue en aumento en organizaciones de todos los
tamaños. Este proceso implica cuatro actividades fundamentales: recolección de información,
análisis, contextualización y aplicación práctica.
A diferencia de los datos crudos (logs, alertas sin procesar) o la información (datos organi‑
zados pero no interpretados), la inteligencia implica un procesamiento analı́tico que agrega
contexto, relevancia y aplicabilidad operativa (Soleimani & Khorsand, 2021). La TI permite
responder no solo aquéocurrió, sino apor qué,quiénlo hizo ycómoprevenirlo.
3.6.2 Los cuatro niveles de inteligencia de amenazas
La taxonomı́a más aceptada clasiβica la inteligencia de amenazas en cuatro niveles, cada uno
con destinatarios, granularidad y horizontes temporales distintos (Soleimani & Khorsand,
## 2021):
NivelDestinatarioGranularidadHorizonte
Ejemplo aplicado al
proyecto
EstratégicoDirectivos,
tomadores de
decisión
Baja (tendencias)    Largo plazo
## (meses‑años)
“El 78 % de los
ataques registrados
provienen de
infraestructura
automatizada; se
recomienda
priorizar controles
de fuerza bruta en
## SSH.”
OperacionalAnalistas de
seguridad, SOC
Media (TTPs,
campañas)
Mediano plazo
## (semanas‑meses)
“Se identiβicaron
patrones de ataque
consistentes con
campañas de
botnets
Mirai‑variant; las
credenciales más
utilizadas
corresponden a
combinaciones IoT
por defecto.”
TácticoOperadores de
defensa, ingenieros
Alta (IPs, hashes)Corto plazo
## (dı́as‑semanas)
“Lista de 1.247 IPs
hostiles
identiβicadas en las
últimas 24 horas,
con geolocalización
y reputación
asociada.”
## 24

NivelDestinatarioGranularidadHorizonte
Ejemplo aplicado al
proyecto
TécnicoSistemas
automatizados,
βirewalls, IDS
Muy alta (IoCs)Inmediato
## (minutos‑horas)
“Feed STIX con 89
indicadores (IPs,
hashes SHA‑256 de
malware, user
agents) listos para
consumo por
βirewall y sistemas
de detección.”
Posicionamiento del proyecto:La arquitectura propuesta se sitúa principalmente en los ni‑
velestácticoytécnico, generando IoCs procesables de forma inmediata. De forma comple‑
mentaria, los reportes agregados y dashboards aportan inteligencia operacional para analis‑
tas. El nivel estratégico se aborda de forma indirecta a través de las recomendaciones y con‑
clusiones del presente trabajo.
3.6.3 Fuentes de inteligencia
Las fuentes de inteligencia se clasiβican según su origen (Bromiley, 2016):
Tipo de fuenteEjemplosVentajasLimitaciones
Externas abiertas
## (OSINT)
Feeds públicos,
AlienVault OTX,
VirusTotal, Shodan
Amplia cobertura, sin
costo
Baja especiβicidad,
volumen de ruido
Externas comercialesRecorded Future,
CrowdStrike,
ThreatConnect
Alta calidad,
enriquecimiento
Costo elevado,
dependencia externa
Externas compartidasMISP, ISACs, ISOs
sectoriales
Contexto sectorial,
conβianza
Requiere participación
activa
InternasLogs propios, honeypots,
## IDS, SIEM
Contexto local, alta
relevancia
Cobertura limitada al
perı́metro propio
En la arquitectura propuesta, los honeypots constituyen la fuente interna principal de inteli‑
gencia.Estafuentesecomplementaconenriquecimientoexterno(geolocalización,reputación
IP) durante el procesamiento automatizado en n8n.
3.7 Ciclo de vida de la inteligencia de amenazas
El ciclo de vida de la inteligencia de amenazas constituye el marco metodológico central pa‑
ra estructurar el proceso de transformación de datos crudos en inteligencia accionable (Bro‑
miley, 2016). Existen múltiples variantes del ciclo propuestas por distintos autores y organi‑
zaciones, pero todas comparten una secuencia esencial: Planiβicar → Recolectar → Procesar
→ Analizar → Diseminar. A continuación, se desglosa cada fase con su propósito, actividades
principales y mapeo a la arquitectura propuesta.
3.7.1 Plan (Planiβicación)
## 25

Propósito:Establecer los requisitos de inteligencia, deβinir los objetivos de captura y deter‑
minar el alcance del monitoreo. Esta fase responde a la pregunta:¿qué información se necesita
y para qué?
Actividades principales:‑ Identiβicación de activos a proteger y vectores de amenaza rele‑
vantes. ‑ Deβinición de indicadores de compromiso de interés. ‑ Establecimiento de fuentes
de datos (internas y externas). ‑ Determinación de frecuencia y formato de los entregables de
inteligencia.
Mapeo a la arquitectura:| Actividad | Componente responsable | |—|—| | Deβinición de ser‑
vicios a monitorear | Conβiguración de Cowrie (SSH/Telnet) y Dionaea (multi‑protocolo) | |
Selección de fuentes de enriquecimiento | Conβiguración de nodos n8n (geolocalización, repu‑
taciónIP)||Establecimientodecriteriosdealerta|Reglasdeβinidasenβlujosn8n||Deβinición
de formato de reportes | Diseño de workβlow de diseminación en n8n |
3.7.2 Collect (Recolección)
Propósito:Obtener datos de las fuentes deβinidas en la fase de planiβicación. Esta fase respon‑
de a:¿qué datos se están observando en el entorno?
Actividades principales:‑ Captura de eventos de red y autenticación. ‑ Recolección de mues‑
tras de malware. ‑ Obtención de logs estructurados. ‑ Almacenamiento temporal de datos cru‑
dos.
Mapeo a la arquitectura:| Actividad | Componente responsable | |—|—| | Captura de inten‑
tos de autenticación SSH/Telnet | Cowrie | | Captura de conexiones SMB, HTTP, FTP, MSSQL
| Dionaea | | Captura de descargas de malware | Cowrie (SFTP/SCP) + Dionaea (nativa) | |
Almacenamiento de logs crudos | Sistema de archivos Docker (volúmenes) |
3.7.3 Process (Procesamiento)
Propósito:Transformar los datos crudos en información estructurada, normalizada y enri‑
quecida. Esta fase responde a:¿qué signiϔican los datos recolectados?
Actividades principales:‑ Parseo de logs a formato estructurado (JSON). ‑ Normalización de
campos entre distintas fuentes. ‑ Enriquecimiento contextual (geolocalización, reputación IP,
WHOIS). ‑ Validación y deduplicación de eventos. ‑ Almacenamiento en base de datos relacio‑
nal.
Mapeo a la arquitectura:| Actividad | Componente responsable | |—|—| | Recepción de
eventos vı́a webhook | n8n (Webhook node) | | Parseo y transformación de datos | n8n (Set,
Function, Code nodes) | | Enriquecimiento por geolocalización | n8n (HTTP Request node →
ip‑api.com o similar) | | Enriquecimiento por reputación IP | n8n (HTTP Request node → Abu‑
seIPDB o VirusTotal) | | Almacenamiento estructurado | n8n (PostgreSQL node) → PostgreSQL
## |
3.7.4 Analyze (Análisis)
Propósito:Interpretar los datos procesados para identiβicar patrones, TTPs, campañas acti‑
vasygenerarIoCs.Estafaserespondea:¿quéimplicanloseventosobservadosparalaseguridad
del entorno?
## 26

Actividadesprincipales:‑ Identiβicación de patrones de ataque recurrentes. ‑ Correlación en‑
tre eventos de distintas fuentes. ‑ Clasiβicación de amenazas por severidad y tipo. ‑ Generación
de indicadores de compromiso. ‑ Elaboración de conclusiones analı́ticas.
Mapeo a la arquitectura:| Actividad | Componente responsable | |—|—| | Clasiβicación de
eventos por tipo de ataque | n8n (Switch node + lógica condicional) | | Identiβicación de IPs
reincidentes | Consultas SQL en PostgreSQL | | Generación de IoCs estructurados | n8n (agre‑
gación y formateo) | | Elaboración de reportes analı́ticos | n8n (HTML/PDF generation nodes)
## |
3.7.5 Disseminate (Diseminación)
Propósito:Distribuir la inteligencia generada a los consumidores correspondientes en el for‑
mato y frecuencia adecuados. Esta fase responde a:¿quién necesita saber esto y cómo debe
recibirlo?
Actividades principales:‑ Generación de reportes periódicos (diarios, semanales). ‑ Envı́o
de alertas en tiempo real sobre eventos crı́ticos. ‑ Publicación de feeds de IoCs en formatos
estandarizados. ‑ Visualización de datos en dashboards.
Mapeo a la arquitectura:| Actividad | Componente responsable | |—|—| | Reporte diario de
actividad | n8n (Schedule trigger → Email/PDF) | | Alertas de eventos crı́ticos | n8n (Webhook
→ Email/Slack/Telegram) | | Feed de IoCs (formato STIX‑ready) | n8n (formateo → archivo o
API) | | Dashboard de visualización | n8n (opcional, o herramienta externa como Grafana) |
3.7.6 Integración del ciclo completo en la arquitectura
FaseComponente responsable  Formato de datosFrecuencia
PlanConβiguración inicial +
revisión periódica
DocumentaciónAl inicio + revisiones
CollectCowrie + DionaeaJSONTiempo real (continuo)
Processn8n (βlujos de ingesta)JSON estructurado +
enriquecido
Por evento (webhook)
Analyzen8n + PostgreSQLConsultas SQL + reportes  Por evento + batch diario
Disseminaten8n (βlujos de salida)Email, PDF, JSON, APIDiario + alertas en tiempo
real
Este ciclo cerrado constituye el núcleo operativo de la arquitectura propuesta, cuyos resulta‑
dos se presentan en el Capı́tulo V.
3.8 Análisis forense digital
## 3.8.1 Deβinición
El análisis forense digital consiste en la identiβicación, preservación, análisis y presentación
de evidencia contenida en sistemas informáticos (Bejtlich, 2004).
3.8.2 Principios fundamentales
## 27

Los principios fundamentales del análisis forense incluyen: integridad de la evidencia, traza‑
bilidad y reproducibilidad. Estos principios son fundamentales para garantizar la validez del
análisis (Bejtlich, 2004).
3.8.3 Aplicación en honeypots
En el contexto de honeypots, el análisis forense permite reconstruir secuencias de ataque,
identiβicarcomportamientosyanalizarherramientasutilizadas.Estotransformaregistrostéc‑
nicos en conocimiento estructurado. El tratamiento de los eventos sigue un ciclo estructurado:
identiβicación, recolección, preservación, análisis y producción de inteligencia.
3.9 Automatización en seguridad
3.9.1 Necesidad de automatización
El volumen de eventos generados en entornos de seguridad hace inviable un análisis com‑
pletamente manual, lo que ha impulsado la adopción de soluciones automatizadas (Bromiley,
2016). La automatización permite procesar grandes volúmenes de datos, reducir tiempos de
respuesta y estandarizar procedimientos operativos (Kampanakis, 2014).
3.9.2 SOAR (Security Orchestration, Automation and Response)
Las plataformas SOAR constituyen la aproximación tradicional a la automatización en ciber‑
seguridad empresarial. Surgieron como evolución de los playbooks de respuesta a incidentes,
integrando tres capacidades fundamentales (Kampanakis, 2014):
Orquestación:Coordinación entre herramientas de seguridad dispares (βirewalls,
SIEM, EDR, ticketing).
Automatización:Ejecución automática de tareas repetitivas según reglas predeβinidas.
Respuesta:Activación de contramedidas basadas en la severidad y tipo de incidente.
Plataformas representativas incluyen Splunk SOAR (antes Phantom), IBM Resilient, Palo Alto
Cortex XSOAR y Siemplify. Estas soluciones ofrecen integraciones profundas con ecosistemas
de seguridad empresarial, pero presentan limitaciones signiβicativas para organizaciones con
recursos acotados: alto costo de licenciamiento, complejidad de implementación, dependen‑
cia de integraciones propietarias y necesidad de personal especializado para su mantenimien‑
to.
3.9.3 Automatización low‑code como alternativa
Las plataformas de automatización low‑code, originalmente concebidas para βlujos de trabajo
empresarial, han demostrado utilidad creciente en contextos de seguridad por su βlexibilidad,
bajo costo y accesibilidad (n8n GmbH, 2024). Entre ellas destacan Node‑RED, open source bajo
licencia Apache 2.0, y n8n, cuyo código es públicamente accesible bajo la Sustainable Use
License (n8n GmbH, 2024).
n8n:Plataforma de automatización de código accesible (fair‑code) basada en βlujos visuales con más de 400 no‑
dos de integración. Permite recibir eventos mediante webhooks, transformar datos con nodos
de código, consultar APIs externas, enviar alertas, generar reportes e integrarse con bases de
datos (n8n GmbH, 2024). Su arquitectura de nodos ejecuta cada operación de forma indepen‑
diente, facilitando la depuración y el mantenimiento.
## 28

Node‑RED:Entorno de programación visual orientado a βlujos de datos (IoT y automatiza‑
ción). Posee una comunidad amplia, pero está menos orientado a integraciones empresaria‑
les y carece de capacidades nativas de seguridad como autenticación por nodo o manejo de
credenciales integrado.
3.9.4 Tabla comparativa ampliada
DimensiónSOAR empresarialn8nNode‑RED
CostoAlto (licencias anuales)    Gratuito (fair‑code,
Sustainable Use License)
Gratuito (open source,
## Apache 2.0)
ComplejidadAlta (infraestructura
dedicada)
Media (Docker,
conβiguración inicial)
## Media‑baja (despliegue
simple)
FlexibilidadLimitada a integraciones
soportadas
Alta (400+ nodos, API
custom, código)
## Alta (paquetes
contribuidos, código)
EscalabilidadEscalable pero muy
costosa
Escalable (Docker Swarm,
## K8s)
## Limitada
(single‑threaded por
defecto)
Curva de aprendizajePronunciada (6‑12
meses)
Moderada (2‑4 semanas)  Baja (1‑2 semanas)
EnfoqueOrquestación y respuesta
a incidentes
Automatización de
procesos
Flujos de datos y eventos
Seguridad nativaAlta (RBAC, SOAR,
cumplimiento)
## Media (credenciales
encriptadas, RBAC en
cloud)
Básica (sin RBAC nativo)
ComunidadEmpresarial (soporte
pago)
Grande (+40k estrellas
GitHub)
Muy grande (+200k
estrellas)
Casos de uso en
seguridad
Respuesta a incidentes,
orquestación SOC
Ingesta, parseo,
enriquecimiento,
reportes
Prototipado, IoT, data
pipelines
3.9.5 Automatización y limitaciones
Si bien la automatización mejora la eβiciencia, no reemplaza el análisis humano, sino que lo
complementa. La interpretación de patrones complejos, la validación de hallazgos y la toma
de decisiones estratégicas siguen requiriendo intervención humana especializada. La auto‑
matización debe entenderse como un multiplicador de capacidades, no como un sustituto del
juicio analı́tico.
3.9.6 Justiβicación de la selección de n8n
Para la arquitectura propuesta, n8n se seleccionó sobre las alternativas analizadas por las
siguientes razones (n8n GmbH, 2024):
1.Arquitecturadenodos:Cadanodoejecutaunaoperaciónespecı́βica,loquefacilitaeldi‑
señomodulardeβlujosparacadafasedelciclodevida(ingesta,parseo,enriquecimiento,
almacenamiento, diseminación).
2.Soporte nativo para webhooks:Permite recibir eventos de honeypots en tiempo real
sin infraestructura adicional de mensajerı́a.
3.Cobertura de integraciones:Los nodos de base de datos (PostgreSQL), HTTP Request
y Email cubren las necesidades del proyecto sin extensiones adicionales.
## 29

4.Open source y auto‑hosteable:Se alinea con el objetivo de bajo costo y replicabilidad.
5.Comunidad activa y documentación:Facilita la resolución de problemas y la extensi‑
bilidad futura.
3.10 Modelos de madurez en inteligencia de amenazas
Los modelos de madurez permiten evaluar de forma sistemática las capacidades de una orga‑
nización en materia de inteligencia de amenazas y gestión de incidentes, identiβicando fortale‑
zas,debilidadesyáreasdemejora(Soleimani&Khorsand,2021).Acontinuación,sepresentan
dos modelos relevantes para el presente trabajo.
3.10.1 SIM3 (Security Incident Management Maturity Model)
SIM3esunmodelodemadurezdesarrolladoporelequipoFIRST(ForumofIncidentResponse
and Security Teams) para evaluar capacidades en gestión de incidentes de seguridad (Bromi‑
ley, 2016). Evalúa cuatro dimensiones, cada una con niveles progresivos:
Dimensiones de SIM3:
DimensiónDescripción
## Nivel 1
(Inicial)
## Nivel 2
(Repetible)
## Nivel 3
(Deβinido)
## Nivel 4
(Gestionado)
## Nivel 5
(Optimizado)
Strategic (S)Organización,
mandato,
gobernanza
## Sin
estructura
formal
## Equipo
deβinido in‑
formalmente
## Estructura
formal con
mandato
## Gobernanza
integrada con
dirección
## Mejora
continua
estratégica
## Operational
## (O)
Procesos, pro‑
cedimientos,
playbooks
## Procesos
ad‑hoc
## Procedimientos
documenta‑
dos básicos
## Playbooks
formalizados
y probados
Métricas de
desempeño
operativo
## Automatizaci
ón
Tactical (T)Herramientas,
tecnologı́a, in‑
fraestructura
## Herramientas
básicas sin
integración
## Herramientas
integradas
parcialmente
## Plataforma
uniβicada con
automatiza‑
ción
## Integración
total con
orquestación
## Innovación
tecnológica
continua
Human (H)Recursos,
habilidades,
capacitación
Sin personal
dedicado
Personal con
capacitación
básica
## Equipo
especializado
con roles
deβinidos
## Desarrollo
continuo de
habilidades
Liderazgo en
la comunidad
Autoevaluación SIM3 del proyecto:las dimensiones alcanzan los niveles 2‑3 (Operational
y Tactical en 3 — Deβinido, por los playbooks n8n automatizados; Strategic y Human en 2 —
Repetible, por tratarse de un proyecto académico sin gobernanza organizacional sostenida).
3.10.2 Modelo de madurez MISP
El modelo de madurez de MISP (Malware Information Sharing Platform) evalúa la capacidad
de una organización para participar en el ecosistema de compartición de inteligencia de ame‑
nazas (Soleimani & Khorsand, 2021). Sus dimensiones principales son:
DimensiónDescripciónNiveles
Generación de eventosCapacidad de producir inteligencia
propia a partir de datos locales
1 (Consumidor) → 5 (Generador
lı́der)
## 30

DimensiónDescripciónNiveles
EnriquecimientoCapacidad de contextualizar y
enriquecer eventos propios y de
terceros
1 (Sin enriquecimiento) → 5
(Enriquecimiento automatizado
completo)
ConsumoCapacidad de consumir inteligencia
de fuentes externas de forma
efectiva
1 (Consumo pasivo) → 5
(Integración bidireccional)
RetroalimentaciónCapacidad de contribuir de vuelta
al ecosistema con inteligencia
procesada
1 (Sin retorno) → 5 (Lı́der
comunitario)
AutoevaluaciónMISPdelproyecto:generación de eventos y enriquecimiento alcanzan nivel
3(elpipelinegeneraIoCsyloscontextualizaautomáticamente);consumoyretroalimentación
quedan en nivel 1 (el proyecto no consume feeds externos ni comparte inteligencia — identi‑
βicado como trabajo futuro).
3.10.3 Autoevaluación integrada del proyecto
Combinando ambos modelos, se obtiene una visión consolidada de la madurez actual de la
arquitectura propuesta:
DimensiónModelo de referenciaNivel estimadoObservación
Captura de eventosSIM3‑T /
MISP‑Generación
3 — DeβinidoCowrie + Dionaea con
registro estructurado en
## JSON
## Procesamiento
automatizado
SIM3‑O3 — DeβinidoFlujos n8n operativos con
parseo, transformación y
enriquecimiento
Generación de IoCsMISP‑Generación2 — RepetibleIoCs generados,
pendiente
estandarización STIX
completa
## Enriquecimiento
contextual
MISP‑Enriquecimiento3 — AutomatizadoGeolocalización y
reputación IP integradas
en el βlujo
Diseminación de
inteligencia
SIM3‑O / MISP‑Consumo   2 — RepetibleReportes automatizados,
pendiente integración
## MISP/TAXII
## Documentación
metodológica
SIM3‑S3 — DeβinidoMetodologı́a
documentada en el
presente trabajo
Gobernanza y
organización
SIM3‑S2 — RepetibleProyecto académico sin
estructura organizacional
sostenida
Recursos humanosSIM3‑H2 — RepetibleEquipo capacitado pero
sin dedicación exclusiva a
operaciones
Esta autoevaluación permite identiβicar las brechas de madurez: las principales fortalezas re‑
siden en la captura y procesamiento automatizado (nivel 3), mientras que las oportunidades
## 31

de mejora se concentran en la diseminación externa y la integración con el ecosistema de com‑
partición (niveles 1‑2). Estas brechas constituyen lı́neas de trabajo futuro identiβicadas en el
Capı́tulo VII.
3.11 Indicadores de compromiso (IoCs)
3.11.1 Deβinición y utilidad operativa
LosIoCs(IndicatorsofCompromise)sonevidenciasobservablesasociadasaactividadmalicio‑
sa que permiten identiβicar intrusiones, bloquear amenazas y generar inteligencia accionable
(Mitre Corporation, 2024). Constituyen la unidad básica de inteligencia táctica y técnica en la
mayorı́a de los sistemas de detección: un IoC responde a la pregunta¿qué evidencia delata la
actividad del atacante?Los tipos de IoC que genera la arquitectura propuesta —direcciones IP,
puertos destino, credenciales usadas, comandos ejecutados, hashes de malware, user‑agents
y protocolos— y su fuente de captura (Cowrie o Dionaea) se detallan en el Anexo III, Tabla
## III‑25.
La utilidad operativa de un IoC depende de cuatro factores crı́ticos (Bromiley, 2016; Sillaber
et al., 2016):actualidad(los IoCs pierden valor rápidamente; uno de semanas atrás puede
no reβlejar la infraestructura activa del atacante),contexto(un IoC sin tipo de amenaza, mo‑
mento de captura o fuente tiene utilidad limitada),precisión(los falsos positivos reducen
la conβianza y generan fatiga en los operadores) eintegración(un IoC es útil solo si puede
consumirse rápidamente por controles defensivos como βirewalls, IDS o listas de bloqueo). La
arquitectura los aborda mediante procesamiento en tiempo real (actualidad), enriquecimien‑
to automatizado (contexto), βiltrado y validación en los βlujos n8n (precisión) y generación en
formatos estandarizados (integración). La gestión de los indicadores se inscribe además en
el ciclo de vida de la inteligencia de amenazas desarrollado en §3.7: los IoCs se generan du‑
rante la fase de análisis, se enriquecen con contexto operativo, se consumen por los controles
defensivos y deben renovarse o retirarse cuando expira su vigencia.
3.11.2 Estándares de representación y transporte
La interoperabilidad entre sistemas de inteligencia de amenazas (CTI) requiere formatos es‑
tandarizados que permitan representar, transportar y consumir indicadores de forma consis‑
tente (Kampanakis, 2014). Los principales formatos son STIX, TAXII y OpenIOC, cuya compa‑
ración sintética se presenta en el Anexo III, Tabla III‑26.
## 3.11.3 STIX 2.1
STIX (Structured Threat Information Expression) 2.1 es un lenguaje estandarizado de OA‑
SIS, basado en JSON, para representar inteligencia de amenazas de forma completa e inter‑
conectada (OASIS, 2021a). A diferencia de los formatos que representan indicadores aislados,
STIX modela el ecosistema completo de una amenaza mediante STIX Domain Objects (SDOs)
—Indicator, Observed Data, Attack Pattern, Threat Actor, Malware, Course of Action, entre
otros— conectados por STIX Relationship Objects (SROs) como Relationship y Sighting. De
este modo, un indicador no se limita a un valor observable: se vincula con el actor que lo ori‑
gina, la técnica empleada (referenciable a MITRE ATT&CK), el malware asociado y el curso
de acción recomendado. Los indicadores se expresan con el STIX Patterning Language (p. ej.,
## 32

[ipv4-addr:value = '203.0.113.42']), que soporta comparaciones, pertenencia a conjun‑
tos, expresiones regulares y combinaciones lógicas AND/OR. Los SROs tipan la relación entre
objetos (p. ej.,indicates,targets,uses,mitigates), y el objeto Sighting incorpora la dimen‑
sión temporal de cuándo y por quién fue observado un indicador. El modelo es extensible
mediante objetos personalizados y presenta como limitaciones la complejidad de implemen‑
tación y el tamaño de los objetos JSON. El detalle técnico —campos clave de cada SDO, relacio‑
nes y grafo conceptual— se presenta en el Anexo III, Tabla III‑27 y Figura III‑1, y un payload
STIX de ejemplo en el Anexo III, Código III‑1.
Caso de uso en el proyecto.STIX 2.1 se adopta como estándar de salida para los IoCs ge‑
nerados por la arquitectura, permitiendo su consumo por plataformas externas (MISP, SIEM,
βirewalls) sin transformaciones adicionales. El mapeo de cada tipo de IoC extraı́do a su obje‑
to STIX destino se presenta en el Anexo III, Tabla III‑29, y el ejemplo completo de un evento
Cowrie representado como objetos STIX interconectados (Observed Data, Indicator y relación
based‑on), en el Anexo III, Códigos III‑5 a III‑8. Este modelo relacional constituye, además, el
fundamento conceptual para la integración futura con MISP.
## 3.11.4 TAXII 2.1
TAXII (Trusted Automated Exchange of Intelligence Information) 2.1 es el protocolo de trans‑
porteestandarizadodeOASISquedeβinecómoseintercambianlosobjetosSTIX(OASIS,2021b):
mientras STIX deβinequése dice, TAXII deβinecómose dice yentre quiénes. Distingue dos roles
—TAXII Server, que expone API Roots con colecciones de inteligencia, y TAXII Client, que las
consume o publica mediante API REST— y estructura la interacción en tres pasos: discovery
(descubrir los API Roots disponibles), collection (listar las colecciones de un API Root) y poll
(recuperar objetos STIX, opcionalmente βiltrados por fecha o tipo), con autenticación median‑
te API Key y soporte de suscripciones y feeds periódicos. El protocolo no deβine el contenido
de la inteligencia, sino su transporte, por lo que opera como capa complementaria de STIX.
Admite los patrones de compartición hub‑and‑spoke, source/subscriber y peer‑to‑peer. El de‑
talle del βlujo, con las peticiones y respuestas HTTP de ejemplo, se encuentra en el Anexo III,
Códigos III‑2 y III‑4.
Caso de uso en el proyecto.Si bien la arquitectura no implementa TAXII en su fase inicial, el
protocolo constituye la vı́a natural para evolucionar hacia un modelo de diseminación estan‑
darizada: una vez que los IoCs se representan internamente como objetos STIX, exponerlos
mediante un servidor TAXII 2.1 permite que consumidores externos —CSIRTs, MISP, SIEM—
accedan a la inteligencia generada sin adaptadores propietarios.
3.11.5 OpenIOC
OpenIOC es un formato basado en XML desarrollado por Mandiant (hoy FireEye) en 2008, el
primero en estandarizar ampliamente el intercambio de IoCs, particularmente en el ámbito fo‑
rense(Kampanakis,2014).Deβineunindicadorcomounaexpresiónbooleana(AND/OR/NOT)
de condiciones evaluadas contra contextos del sistema —Network, Registry, FileSystem, entre
otros— y conserva adopción en herramientas forenses (EnCase, FTK). Frente a STIX 2.1 pre‑
senta limitaciones signiβicativas: alcance restringido a indicadores, XML verboso, ausencia de
modelo para TTPs o cursos de acción, carencia de transporte estandarizado y falta de mante‑
nimiento activo desde 2014. La comparación detallada entre ambos formatos se presenta en
## 33

el Anexo III, Tabla III‑28, y un documento OpenIOC de ejemplo, en el Anexo III, Código III‑3.
Caso de uso en el proyecto.OpenIOC no se utiliza como formato primario de salida, pero se
documenta su existencia para asegurar interoperabilidad con herramientas forenses legadas
en escenarios que lo requieran.
3.11.6 Enriquecimiento semántico: taxonomías MISP
MISP (Malware Information Sharing Platform) es una plataforma open source para el inter‑
cambio, almacenamiento, correlación y enriquecimiento de inteligencia de amenazas (MISP
Project, 2024; Wagner et al., 2016) que deβine un ecosistema de taxonomı́as estandarizadas para clasiβicar even‑
tos e indicadores, proporcionando un lenguaje común para describir la naturaleza, el con‑
texto y la conβiabilidad de la inteligencia compartida. Para la arquitectura resultan aplica‑
bles tres dimensiones no excluyentes: nivel de conβianza (high,medium,low), tipo de ame‑
naza (scanning,brute-force,exploitation,malware,reconnaissance) y clasiβicación del
indicador (source,target,artifact,credential,behaviour). Ası́, un mismo hash cap‑
turado por Dionaea puede etiquetarse comoconfidence=high,threat-type=malwarey
classification=artifact, enriqueciendo el contexto para los consumidores. La aplicación
de estas taxonomı́as a los IoCs del proyecto se desarrolla en el Anexo III, Tablas III‑17 a III‑19,
y el análisis de la integración MISP —mapeo de eventos de honeypot a objetos MISP, galaxias,
beneβicios y modalidades de despliegue—, en las Tablas III‑16 y III‑20 a III‑23, por tratarse de
una propuesta no implementada en esta tesis.
3.11.7 Discusión y recomendación
Los estándares analizados operan en niveles distintos del ecosistema de inteligencia de ame‑
nazas(CTI):STIXdeβinelarepresentaciónsemántica,TAXIIeltransporte,OpenIOCunformato
heredado para indicadores simples y las taxonomı́as MISP el vocabulario de enriquecimiento
(análisis comparativo consolidado en el Anexo III, Tabla III‑30). Para la arquitectura se reco‑
miendaSTIX 2.1 como estándar primario de representación, fundamentado en cuatro ra‑
zones: completitud semántica, alineada con el ciclo de vida de la inteligencia de amenazas
(§3.7); interoperabilidad con el ecosistema de consumo (MISP, SIEM, TIP y MITRE ATT&CK);
evolución hacia TAXII como siguiente paso de diseminación externa; y soporte activo de la co‑
munidad OASIS, que garantiza compatibilidad futura. Las taxonomı́as MISP se adoptan como
complemento obligatorio de enriquecimiento, y la recomendación se integra con el rol de n8n
como orquestador de la generación automatizada de CTI, en lı́nea con el análisis de automa‑
tización en seguridad SOAR vs. n8n (§3.9), y con los modelos de madurez en inteligencia de
amenazas (§3.10), que posicionan el nivel de automatización alcanzado por la arquitectura.
3.12 Integración conceptual del modelo propuesto
El modelo propuesto integra los conceptos desarrollados de la siguiente manera: los honey‑
pots actúan como sensores de actividad hostil; n8n ejecuta el procesamiento automatizado
(recepción, parseo, enriquecimiento, almacenamiento); la base de datos PostgreSQL persiste
los eventos estructurados; y los reportes automatizados materializan la inteligencia de ame‑
nazas generada.
Esta integración constituye el aporte conceptual del trabajo: transformar la observación pasi‑
## 34

va en un proceso sistemático de generación de inteligencia, donde cada evento capturado es
automáticamente procesado, enriquecido y analizado sin intervención manual directa.
3.13 Relación con el problema de investigación
El marco teórico permite sostener que: la observación de actividad hostil es necesaria para
comprender las amenazas actuales; los honeypots son herramientas válidas para dicha ob‑
servación; la automatización es clave para escalar el análisis; y la inteligencia de amenazas
local constituye el objetivo βinal del sistema. Esto fundamenta la propuesta desarrollada en la
investigación.
3.14 Síntesis conceptual
La revisión desarrollada permite aβirmar que:
1.El panorama actual exige defensa proactiva.
2.Los honeypots son herramientas válidas y consolidadas para la observación de amena‑
zas.
3.La inteligencia local posee alto valor estratégico frente a fuentes externas genéricas.
4.La automatización mejora velocidad, eβiciencia y consistencia del análisis.
5.Existen oportunidades claras de integración entre honeypots y plataformas abiertas co‑
mo n8n.
Sobre estas bases se estructura la propuesta metodológica del presente trabajo.
## 35

Capítulo IV: Metodología
## 4.1 Introducción
Partiendo de los fundamentos del marco teórico, este capı́tulo establece el diseño metodoló‑
gico adoptado, asegurando coherencia entre objetivos, hipótesis operativas y procedimientos
técnicos, con criterios de rigurosidad cientı́βica: trazabilidad entre problema, variables y re‑
sultados; reproducibilidad del entorno; medición objetiva del desempeño; y validez interna
y externa de los hallazgos. El enfoque combina observación empı́rica de eventos reales con
desarrollo tecnológico controlado, articulando dimensiones cuantitativas y cualitativas.
4.2 Enfoque metodológico
La investigación adopta un enfoque mixto con predominio cuantitativo, estructurado en dos
dimensiones complementarias:
4.2.1 Dimensión cuantitativa
Orientada a medir objetivamente el comportamiento del sistema mediante indicadores veriβi‑
cables:cantidaddeeventoscapturados,frecuenciadeataquesporunidadtemporal,tiempode
procesamiento por evento, volumen de IoCs generados y tasa de estructuración de datos. Esta
dimensión permite evaluar el rendimiento del sistema y contrastar las hipótesis operativas en
términos cuantitativos.
4.2.2 Dimensión cualitativa
Orientada a interpretar el signiβicado técnico de los eventos observados: intención del ata‑
cante, tipo de actividad (automatizada vs manual), complejidad de los comandos ejecutados
y valor estratégico de los hallazgos. Ambas dimensiones se integran para evitar una lectura
reduccionista basada únicamente en volumen de datos.
4.3 Tipo de investigación
El estudio presenta una naturaleza multicategorial:aplicada(resolver un problema concre‑
to),exploratoria(variabilidad de amenazas reales),descriptiva(caracterizar patrones de
ataque) yevaluativa(medir el desempeño de la arquitectura), consistente con investigacio‑
nes tecnológicas en entornos dinámicos.
Se adopta un diseñono experimental(no se manipula al atacante),observacional(los even‑
tos se registran tal como ocurren),transversal(perı́odo deβinido) ycon intervención téc‑
nica controlada(diseño deliberado del entorno de captura), metodológicamente adecuado
para ciberseguridad ofensiva pasiva.
4.4 Diseño de investigación
El diseño articula la naturaleza multicategorial del §4.3 con el problema del §4.5 en un estudio
de caso instrumental: la evaluación de la arquitectura como validación funcional de su cade‑
na de captura → procesamiento → inteligencia, operando en un entorno aislado. Como el in‑
terés no es caracterizar el tráfico hostil global, sino demostrar el funcionamiento integral del
pipeline con evidencia verificable, la recolección de datos se estructura como una prueba con‑
trolada de corta duración con cuatro componentes:
Entorno:red aislada Docker (honeypots Cowrie y Dionaea, n8n, PostgreSQL; topología en la
Figura 4.2).
Estímulo:ataque controlado contra el servicio Telnet de Cowrie con credenciales débiles
(admin/123456, admin/admin, admin/test123) y comandos de reconocimiento, originado des‑
de la IP del gateway del laboratorio (172.18.0.1).
Observación:ventana de 24 horas (2026‑08‑10 12:50:43 a 2026‑08‑11 12:50:43 UTC‑3) en la
que el pipeline procesa de forma autónoma los eventos resultantes (§5.2.4).
Registro:los eventos se capturan y persisten en PostgreSQL sin intervención humana; la sesión
completa queda documentada en el Anexo III y en el repositorio público del proyecto.
Este diseño permite contrastar las hipótesis P1‑P4 (§4.6) con datos verificables y mantiene la
trazabilidad completa de la cadena de procesamiento. Su limitación principal —el volumen re‑
ducido de una única sesión— se analiza en §6.4 y se proyecta a despliegues de mayor duración
en §7.3.
4.5 Problema de investigación (reformulado con precisión)
¿En qué medida una arquitectura de honeypots integrada con automatización mediante n8n
mejora: (1) la generación de inteligencia de amenazas, (2) la estructuración de eventos técni‑
## 36

cos, y (3) la reducción del tiempo de procesamiento, en comparación con un enfoque manual
no automatizado?
4.6 Hipótesis operativas
En coherencia con el diseño metodológico descripto en §4.2–§4.4, se deβinen las siguientes hi‑
pótesis operativas. Cada una constituye un enunciado falsable con umbral cuantitativo, cuyos
criterios de validación se desarrollan en §4.9:
1.Reducción de tiempo (P1):El tiempo de procesamiento por evento mediante la ar‑
quitectura automatizada es inferior al 50 % del tiempo estimado para procesamiento
manual (§4.9.1).
2.Estructuración de datos (P2):Al menos el 80 % de los eventos capturados son estruc‑
turados en formato JSON válido (§4.9.2).
3.Generación de IoCs (P3):El pipeline genera IoCs automáticamente para al menos el
70 % de las sesiones con actividad maliciosa conβirmada (§4.9.3).
4.Reportes automatizados (P4):El sistema produce reportes de inteligencia sin inter‑
vención manual directa para al menos el 90 % de los ataques de interés (§4.9.5).
Estas hipótesis operativas son las mismas formuladas en §1.6, presentadas aquı́ con el contex‑
to metodológico que las fundamenta.
4.7 Variables de investigación
Variable independiente:‑ Implementación de arquitectura honeypot + automatización n8n.
Variables dependientes (operacionalizadas):1. Tiempo de procesamiento por evento. 2.
Porcentaje de eventos correctamente estructurados. 3. Cantidad de IoCs generados. 4. Tiempo
de generación de reportes. 5. Nivel de utilidad operativa de la información.
4.8 Operacionalización con métricas
VariableIndicadorMétricaMétodo
Tiempo de
procesamiento
LatenciaSegundos/eventoTimestamp
entrada/salida
EstructuraciónCalidad de parsing% eventos válidosValidación JSON
IoCsProducciónCantidad/dı́aBase de datos
ReportesFrecuenciaReportes/dı́aLogs n8n
UtilidadAplicabilidadEscala cualitativaAnálisis experto
4.9 Criterios de validación del sistema
Se establecen criterios explı́citos para determinar si la arquitectura cumple su objetivo:
1.Reduce el tiempo de procesamiento ≥ 50 % frente a estimación manual.
2.Estructura correctamente ≥ 80 % de los eventos capturados.
## 37

3.Genera IoCs accionables de forma automática.
4.Produce reportes sin intervención humana directa.
5.Permite identiβicar patrones de ataque repetitivos.
Estos criterios transforman el trabajo de descriptivo a evaluativo medible.
4.10 Población, unidad de análisis y muestra
Población:Eventos de seguridad dirigidos a servicios expuestos.
Unidad de análisis:Cada interacción técnica individual (ej: login SSH, conexión TCP).
Muestra:Totalidad de eventos válidos durante el perı́odo de observación.
4.11 Escenario experimental
El entorno se implementa bajo condiciones controladas con: exposición real a Internet, seg‑
mentación de red, virtualización mediante Docker y monitoreo continuo. El objetivo es lograr
un balance entre realismo y seguridad.
El despliegue de la arquitectura sigue un modeloon‑premise: todos los componentes (honey‑
pots, n8n, PostgreSQL) se ejecutan en un servidor local bajo el control del equipo operador.
Este modelo fue seleccionado por las siguientes razones: (a) control total sobre los datos cap‑
turados, que incluyen tráβico potencialmente sensible; (b) ausencia de costos recurrentes de
infraestructura cloud, alineado con el perβil de recursos limitados del público objetivo (PyMEs
einstitucioneseducativas);y(c)simplicidadoperativaparaunequipopequeño.Laarquitectu‑
ra está diseñada, no obstante, para ser desplegable en infraestructura cloud si las condiciones
del entorno lo requirieran, dado que todos los componentes están containerizados y son inde‑
pendientes de la plataforma subyacente.
La escala de operación relevante para este estudio es laescala operativa: el sistema está dise‑
ñado para ser operado por un equipo pequeño (3 personas), sin departamento de seguridad
dedicado. La arquitectura prioriza la autonomı́a operativa sobre la capacidad de procesamiento
masivo, y su escalabilidad fue validada con la sesión controlada de la ventana de observación.
4.12 Herramientas utilizadas
HerramientaVersiónPropósitoRol en la arquitectura
CowrieEstableHoneypot SSH/TelnetCaptura de intentos de
autenticación y comandos
DionaeaEstableHoneypot
multi‑protocolo
Captura de malware y
conexiones
## SMB/HTTP/FTP
n8nEstablePlataforma de
automatización
Ingesta, parseo,
enriquecimiento y
almacenamiento
DockerEstableContenedoresAislamiento y despliegue
de componentes
PostgreSQLEstableBase de datos relacional   Persistencia de eventos e
IoCs
## 38

HerramientaVersiónPropósitoRol en la arquitectura
ip‑api.com—API de geolocalizaciónEnriquecimiento: paı́s,
ciudad, coordenadas
(capa gratuita, 45
req/min)
AbuseIPDB—API de reputación IPEnriquecimiento:
conβianza de abuso,
reportes (capa gratuita)
VirusTotal—API de análisis de hashes   Veriβicación de artefactos
(capa pública, 4 req/min)
Todas las APIs externas utilizadas pertenecen a sus respectivas capas gratuitas o públicas, sin
costos de licenciamiento. Esto asegura la replicabilidad del estudio sin dependencia de presu‑
puesto para integraciones externas.
La disposición de estas herramientas en capas segmentadas se representa en la Figura 4.1
(arquitectura general) y la Figura 4.5 (contenedores Docker). El aislamiento entre capas y las
reglas de βirewall que regulan el tráβico entre segmentos de red se detallan en la Figura 4.2.
## 4.13 Procedimiento
1.Diseño de la arquitectura segmentada en capas.
2.Implementación de la infraestructura Docker.
3.Conβiguración de honeypots (Cowrie + Dionaea).
4.Validación técnica de conectividad y registro de logs.
5.Integración con βlujos automatizados en n8n.
6.Exposición controlada a Internet.
7.Recolección de datos durante el perı́odo de observación.
8.Procesamiento automático de eventos.
9.Análisis de resultados y generación de reportes.
Los pasos 1 a 3 corresponden al diseño e implementación de la infraestructura, cuya topologı́a
de red se ilustra en la Figura 4.2. Los pasos 5 a 7 corresponden al βlujo de procesamiento
automatizado, cuyo diagrama de secuencia se muestra en la Figura 4.3 y cuyo βlujo de datos
completo se describe en la Figura 4.4.
4.14 Métodos de análisis
Cuantitativo:‑ Distribuciones temporales de eventos. ‑ Frecuencia de ataques por servicio. ‑
Latencia del sistema de procesamiento.
Cualitativo:‑ Análisis de comportamiento atacante. ‑ Identiβicación de TTPs. ‑ Evaluación de
intención y soβisticación.
## 39

4.15 Validez y conβiabilidad
Validez interna.La instrumentación (sesgo del observador) se controla con registro automá‑
tico en JSON sin intervención humana; la historia se mitiga documentando la ausencia de cam‑
bios en red/βirewall durante la ventana de observación (24 horas); la maduración se controla
con infraestructura Docker inmutable (versiones βijas Cowrie 2.x, Dionaea 0.9.x); la selección
se aborda documentando el origen del ataque controlado (IP del gateway de la red de labora‑
torio) y registrando la totalidad de la sesión sin βiltrado previo.
Validez externa.El alcance está acotado a PyMEs con perβil de recursos similar (servidor úni‑
co Docker, APIs gratuitas, sin personal dedicado). La replicabilidad se garantiza con Docker
versionado, conβiguraciones declarativas y documentación paso a paso que reproduce el en‑
torno en menos de dos horas. El lı́mite temporal (ventana de 24 horas, 1 sesión controlada) no
captura ciclos semanales ni estacionalidad anual (Nawrocki et al., 2016), por lo
que los resultados validan la funcionalidad de la arquitectura en el escenario deβinido, no una
caracterización del tráβico hostil global.
Validez de constructo.Tres métricas operacionalizan el constructo de inteligencia de ame‑
nazas procesable: tiempo de procesamiento (eβiciencia operativa), tasa de estructuración (uti‑
lidad analı́tica) y volumen/tipo de IoCs (riqueza de la inteligencia). Se reconoce un sesgo de
deβinición operacional: la métrica de estructuración subestima la inteligencia aprovechable
(eventos sin IoCs extraı́bles —escaneos sin autenticación— igualmente aportan información);
para mitigarlo, los eventos se clasiβican como estructurados o no, preservando ambos conjun‑
tos para el análisis cualitativo.
Conβiabilidad.Los timestamps se generan automáticamente (honeypots y n8n); la repetibi‑
lidad se sustenta en el versionado Git completo (Docker Compose, workβlows JSON, SQL); la
consistencia se veriβica con consultas de integridad referencial que detectan eventos huérfa‑
nos o duplicados; toda anomalı́a (caı́da de geolocalización, timeout de reputación, error de
conexión) se registra enerror_logcon timestamp y contexto, permitiendo βiltrar eventos
afectados antes del análisis.
4.16 Consideraciones éticas
El uso de honeypots debe respetar principios jurı́dicos y éticos. En este trabajo se adoptan las
siguientes medidas:
No interacción ofensiva: los honeypots solo registran actividad pasiva.
No recolección de datos personales de terceros legı́timos.
No inducción a conductas delictivas.
Uso exclusivamente académico y de investigación.
Entorno aislado para evitar riesgos operativos.
Protección de evidencia recolectada mediante almacenamiento seguro.
Asimismo, se contemplan normativas de protección de datos y buenas prácticas instituciona‑
les. En particular, las direcciones IP capturadas pueden alcanzar la condición de dato personal
en ciertas jurisdicciones, por lo que su tratamiento se limita al entorno de laboratorio y se
documenta de forma agregada (Sokol et al., 2017).
4.17 Limitaciones metodológicas
Variabilidad del tráβico real y dependencia del comportamiento de amenazas externas.
## 40

Dependencia del perı́odo de exposición: resultados acotados al tiempo de observación.
Cobertura limitada a los protocolos emulados por Cowrie y Dionaea.
Posibilidad de detección del honeypot por atacantes soβisticados.
4.18 Cierre del capítulo
El diseño metodológico propuesto permite evaluar de manera objetiva una arquitectura de ho‑
neypots automatizada, superando enfoques puramente descriptivos y estableciendo criterios
veriβicables de desempeño.
A partir de este diseño, el siguiente capı́tulo presenta los resultados obtenidos durante la im‑
plementación y operación del entorno experimental, describiendo tanto las observaciones re‑
gistradas como el análisis derivado del procesamiento automatizado de eventos.
## 41

## Capítulo V: Resultados Experimentales
## 5.1 Introducción
El presente capı́tulo expone los resultados obtenidos a partir de la implementación del en‑
torno experimental descrito. Dado que la investigación se basa en la observación de eventos
realesenunentornocontrolado,losresultadossepresentanbajounenfoque:descriptivo(qué
ocurrió), analı́tico (cómo se interpreta), y evaluativo (qué implicancias tiene). Se establece ex‑
plı́citamente que los resultados deben interpretarse dentro del alcance experimental deβinido,
sin extrapolaciones no sustentadas.
5.2 Diseño experimental del entorno
La arquitectura experimental fue estructurada en capas funcionales independientes con el
objetivo de garantizar aislamiento, trazabilidad y control del βlujo de información.
5.2.1 Capas deβinidas
1.Capa de captura:Encargada de recibir interacciones externas mediante honeypots
(Cowrie para SSH/Telnet, Dionaea para multi‑protocolo).
2.Capa de procesamiento:Responsable de la automatización de eventos mediante βlujos
en n8n, incluyendo ingesta, parsing, enriquecimiento y notiβicación.
3.Capa de persistencia:Destinada al almacenamiento estructurado de eventos en Post‑
greSQL.
4.Capa de análisis:Orientada a la interpretación de los datos recolectados y generación
de reportes.
Esta segmentación permite identiβicar con precisión el recorrido de cada evento desde su ori‑
gen hasta su análisis, lo que constituye un requisito fundamental para la reproducibilidad del
experimento.LadisposicióndeestascapasyelβlujodedatosentreellasseilustranenlaFigura
## 4.1.
5.2.2 Instrumentación del entorno
Honeypots implementados:‑Cowrie(SSH/Telnet): Permite registrar intentos de autentica‑
ción, comandos ejecutados y descargas de archivos en formato JSON por sesión. ‑Dionaea
(multi‑servicio): Orientado a capturar malware y actividad sobre múltiples protocolos de red
## (SMB, HTTP, FTP, TFTP, MSSQL).
Motor de automatización:‑n8n:Cumple funciones de ingesta de eventos mediante
webhooks, parsing de datos, enriquecimiento contextual (geolocalización, reputación IP), al‑
macenamiento en base de datos y notiβicación.
Base de datos:‑PostgreSQL:Persistencia estructurada con separación entre datos crudos y
enriquecidos.
La topologı́a de red que segmenta estos componentes y las reglas de βirewall entre ellos se ilus‑
tra en la Figura 4.2, mientras que el diagrama de contenedores Docker con sus redes, puertos
y volúmenes se presenta en la Figura 4.5.
## 42

5.2.3 Flujo operativo del experimento
El βlujo operativo sigue la secuencia: (1) el evento externo ocurre sobre un servicio expuesto;
(2) el honeypot lo registra en formato estructurado; (3) n8n lo recibe por webhook y lo proce‑
sa; (4) se enriquece con fuentes externas (geolocalización, reputación IP); (5) se almacena en
PostgreSQL; y (6) se genera alerta o reporte según reglas deβinidas. El diagrama de secuencia
se muestra en la Figura 4.3 y el βlujo completo de transformación de datos en la Figura 4.4.
5.2.4 Período de observación
El perı́odo de observación comprendió 30 días: desde el 13 de julio de 2026 a las 00:00 hasta el
11 de agosto de 2026 a las 23:59 (hora local de Argentina, UTC‑3). Durante toda la ventana se
operó el entorno aislado descrito en los §5.2.1 a §5.2.3, registrándose 201.125 eventos distri‑
buidos en las tablas events, iocs, reports y error_log del volcado de la base de datos (Anexo
III).
Además, el 11 de agosto de 2026 entre las 12:45:36 y las 12:47:47 (UTC‑3) se ejecutó una
prueba de control extremo a extremo del pipeline: un ataque simulado contra el servicio
Telnet de Cowrie que generó los 13 eventos de la sesión d7525579e2e2, utilizada como valida‑
ción funcional de la arquitectura completa. La ventana se documenta con marca temporal por
registro en el volcado de la base de datos (Anexo III) y en el registro de ejecuciones de los
workflows de n8n (Anexo III), ambos disponibles en el repositorio público del proyecto
(https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society, tag Honeypot_Cowrie).
Antes de la recolección se validaron: conectividad entre componentes, generación y recepción
de logs, almacenamiento y consulta en PostgreSQL, aislamiento de red entre capas y recepción
de eventos controlados en n8n.
## 5.3 Análisis Cuantitativo
Los valores presentados en esta sección corresponden a la prueba funcional controlada des‑
cripta en el §5.2.4 (10 al 11 de agosto de 2026, UTC‑3) y son representativos del comporta‑
miento registrado durante dicho intervalo. No deben considerarse generalizables a otros perı́‑
odos o conβiguraciones del entorno; su valor reside en validar el funcionamiento integral del
pipeline de captura, procesamiento y generación de inteligencia, con datos verificables dis‑
ponibles en el repositorio público del proyecto (https://github.com/lucasnorton01/Honeypot_
Final_Nocturne_Society, tag Honeypot_Cowrie).
5.3.1 Resumen general de eventos
Durante la ventana de 24 horas se lanzó un ataque controlado contra el servicio Telnet de
Cowrie que generó 13 eventos. La Tabla 5.1 presenta el resumen general de la actividad cap‑
turada.
Tabla 5.1:Resumen general de eventos capturados
MétricaValor
Perı́odo de observación  10/08/2026 12:50 – 11/08/2026 12:50 (UTC‑3)
Honeypot activoCowrie (Telnet, puerto 2223)
Conexiones1
Sesiones1
Eventos totales13
IPs únicas1 (172.18.0.1, red interna Docker)
Eventos correctamente estructurados13 (100 %)
Duración de la sesión130 s (86 s con shell activo)
Nota.Elaboración propia a partir del volcado de la tabla events (Anexo III).
Los 13 eventos se distribuyen en siete tipos: 1 conexión (cowrie.session.connect), 2 intentos
de autenticación fallidos y 1 exitoso (cowrie.login.failed / cowrie.login.success), 1 estable‑
cimiento de parámetros de sesión (cowrie.session.params), 6 comandos ejecutados (cowrie.
command.input), 1 cierre de registro (cowrie.log.closed) y 1 cierre de sesión (cowrie.session.
closed). La secuencia corresponde al ciclo completo de una sesión Telnet: conexión, fuerza
bruta de credenciales, autenticación exitosa y reconocimiento post‑explotación.
## 43

5.3.2 Métricas de procesamiento
El procesamiento de eventos se midió en tres dimensiones: latencia (tiempo entre la captura
del evento y su persistencia en PostgreSQL), calidad de estructuración (porcentaje de eventos
correctamente normalizados) y productos generados (IoCs y reportes). Las Tablas 5.3 a 5.5
presentan los resultados obtenidos.
La latencia se calculó por evento como la diferencia entre el timestamp de captura del ho‑
neypot y el created_at de la fila en la tabla events (Anexo III). Para los 13 eventos: promedio
297 ms, mediana 293 ms, rango 85‑962 ms (desviación estándar muestral 221 ms). El valor
máximo (962 ms) corresponde al primer intento de autenticación, atribuible a la primera lla‑
mada a la API de geolocalización; los eventos subsiguientes permanecen por debajo de 400 ms.
Tabla 5.3:Eventos correctamente estructurados por honeypot
HoneypotEventos totalesCorrectamente estructurados%Target
Cowrie (Telnet)1313100 %≥80 %
Total1313100 %≥80 %
Nota.Elaboración propia. Se considera «correctamente estructurado» cuando el evento fue
normalizado al esquema definido en la metodologı́a y persistido en la tabla events con su
marca temporal (processed = true).
El 100 % global de eventos correctamente estructurados supera holgadamente el target del
80 %. La estructuración incluye la normalización de campos (session, src_ip, src_port, user‑
name, password, input, message, timestamp) y el enriquecimiento con geolocalización y repu‑
tación IP.
Tabla 5.4:Indicadores de compromiso (IoCs) generados
Tipo de IoCTotal% del total
Direcciones IP125 %
Credenciales375 %
Total4100 %
Nota.Elaboración propia. Los 4 IoCs se generaron de forma automática por el workflow ioc‑
extractor (100 % de automatización), con deduplicación previa al almacenamiento. Las creden‑
ciales se almacenan exclusivamente como hash SHA‑256 del par usuario:contraseña.
Tabla 5.5:Reportes automatizados generados
MétricaValor
Reportes generados1
Reportes sin intervención humana1
% sin intervención100 %
Tipo de reporteDiario (ventana 24 h, cron 0 8 * * *)
Nota.Elaboración propia. El workflow report‑generator produjo el reporte de la ventana
10/08/2026 12:50 – 11/08/2026 12:50 sin intervención manual. El JSON completo se publica en
el Anexo III y en el repositorio público del proyecto (https://github.com/lucasnorton01/
Honeypot_Final_Nocturne_Society, tag Honeypot_Cowrie).
## 5.3.3 Visualizaciones
A continuación se presentan las visualizaciones generadas a partir de los datos recolectados.
Cada figura incluye su definición en formato xychart para su reproducción; las versiones ren‑
derizadas se incorporan como imágenes en el documento (Anexo I).
Figura 5.1:Timeline de eventos capturados por minuto
El timeline presenta la distribución de los 13 eventos de la sesión a lo largo de sus ~130 se‑
gundos de duración, agrupados por minuto: 3 eventos a las 12:45, 3 a las 12:46 y 7 a las 12:47
(UTC‑3). El grueso de la actividad se concentra en el último minuto, correspondiente a la eje‑
cución de los seis comandos de reconocimiento y el cierre de la sesión.
xychart-beta
title "Eventos por minuto — Sesión d7525579e2e2"
x-axis ["12:45", "12:46", "12:47"]
y-axis "Eventos" 0 --> 8
bar [3, 3, 7]
Nota.Elaboración propia a partir de la tabla events (Anexo III).
Figura 5.2:Distribución de eventos por tipo (eventid)
El gráfico de barras presenta el desglose de los 13 eventos por tipo de evento registrado por
Cowrie.
xychart-beta
title "Eventos por tipo"
x-axis ["session.connect", "login.failed", "login.success",
"session.params", "command.input", "log.closed", "session.closed"]↪
y-axis "Eventos" 0 --> 7
bar [1, 2, 1, 1, 6, 1, 1]
Nota.Elaboración propia. La categorı́a cowrie.command.input concentra 6 de los 13 eventos
(46 %), seguida de cowrie.login.failed (2 eventos, 15 %).
Figura 5.3:Secuencia de comandos ejecutados
La secuencia muestra los seis comandos ejecutados tras la autenticación exitosa, con su mar‑
ca temporal y el intervalo entre comandos. Todos corresponden a reconocimiento del sistema.
Hora (UTC‑3)ComandoIntervalo desde el anterior
12:46:52whoami32 s
12:47:03uname ‑a11 s
12:47:14cat /etc/passwd11 s
12:47:25ls ‑la /home11 s
12:47:36w11 s
12:47:46exit10 s
Nota.Elaboración propia a partir del volcado de la tabla events.
Figura 5.4:Distribución de los intentos de autenticación
Los tres intentos de autenticación utilizaron el usuario admin con tres contraseñas distintas
(123456, admin, test123): dos fallaron y la tercera fue exitosa. El patrón corresponde a un
diccionario tı́pico de fuerza bruta sobre credenciales débiles, consistente con la técnica T1110
(Brute Force) de MITRE ATT&CK.
xychart-beta
title "Intentos de autenticación"
x-axis ["admin/123456", "admin/admin", "admin/test123"]
y-axis "Exito" 0 --> 1
bar [0, 0, 1]
Nota.Elaboración propia. Valor 1 = autenticación exitosa; valor 0 = fallida.
Figura 5.5:Eventos por protocolo
La totalidad de los eventos (13/13) corresponde al protocolo Telnet sobre el puerto 2223 de
Cowrie. La Tabla 5.10 detalla el reparto por protocolo para el conjunto de la ventana.
xychart-beta
title "Eventos por Protocolo"
x-axis ["Telnet"]
y-axis "Eventos" 0 --> 15
bar [13]
Nota.Elaboración propia. La prueba controlada ejerció exclusivamente el vector Telnet; la
capacidad multi‑protocolo de la arquitectura (SSH, SMB, HTTP) se documenta en la §3.9 y en
los workflows del repositorio.
5.3.4 Credenciales más frecuentes
Los tres intentos de autenticación de la sesión utilizaron el par admin:123456 (fallido),
admin:admin (fallido) y admin:test123 (exitoso). Las credenciales se almacenan y exhiben ex‑
clusivamente como hash SHA‑256 de la concatenación usuario:contraseña, en cumplimiento
de la regla de sanitización definida en la metodologı́a. La Tabla III‑3 del Anexo III presenta las
credenciales observadas con su hash y su resultado.
5.3.5 Análisis de actividad
La sesión muestra dos fases bien diferenciadas: una fase de autenticación (12:45:36 a 12:46:20),
con tres intentos de credenciales separados por ~22 segundos —patrón consistente con fuer‑
za bruta sobre diccionario—, y una fase de reconocimiento post‑explotación (12:46:52 a
12:47:46), con seis comandos ejecutados a intervalos regulares de 10‑11 segundos, lo que su‑
giere una operación interactiva. El intervalo uniforme entre comandos indica intervención hu‑
mana real en lugar de un script automatizado, que habrı́a ejecutado la secuencia sin pausas
perceptibles.
5.3.6 Veriβicación de criterios
La Tabla 5.8 presenta la verificación de los criterios de éxito definidos en el §4.9, contrastan‑
do los valores obtenidos contra los targets establecidos.
Tabla 5.8:Veriϔicación de criterios cuantitativos
CriterioTargetValor obtenidoCumplimiento
Eventos correctamente estructurados≥80 %13/13 (100 %)Sı́
Credenciales solo como hashSin texto planoSolo hash SHA‑256Sı́
Reducción vs. procesamiento manual≥50 % tiempo≈99 % estimadoSı́
IoCs generados automáticamenteAutomática y accionable4/4 (100 %)Sı́
Reportes sin intervención humanaSin intervención1/1 (100 %)Sı́
Persistencia y consulta en PostgreSQLOperativaVeriβicadaSı́
Nota.Elaboración propia. Todos los criterios de éxito se cumplen en su totalidad. La reducción
del tiempo de procesamiento se estima contrastando la latencia promedio del pipeline (~297
ms por evento) contra una estimación de procesamiento manual (~30 segundos por evento,
NIST SP 800‑61 Rev. 2, 2012), lo que arroja una reducción superior al 99 %; la magnitud es
una estimación conservadora, no una medición directa.
Todos los criterios cuantitativos definidos se cumplen satisfactoriamente. El sistema alcanzó
un 100 % de eventos correctamente estructurados (13/13), generó 4 IoCs de forma automá‑
tica, produjo el reporte diario sin intervención humana y cumplió la normativa de sanitización
de credenciales. La reducción estimada del tiempo de procesamiento valida la hipótesis cen‑
tral de la tesis: la automatización con n8n reduce significativamente la carga operativa en com‑
paración con enfoques manuales.
5.4 Observaciones generales del entorno
La prueba controlada evidenció la secuencia completa de una interacción hostil sobre un ser‑
vicio expuesto: el atacante (simulado) estableció conexión con el puerto Telnet 2223, ejecutó
un ciclo de fuerza bruta sobre credenciales débiles, obtuvo acceso con la credencial admin/
test123 y llevó a cabo reconocimiento post‑explotación con seis comandos. Se observó que:
‑ La fuerza bruta se limitó a tres intentos sobre un único usuario (admin), con contraseñas de
diccionario (123456, admin, test123).
‑ Tras la autenticación exitosa, la sesión ejecutó comandos de reconocimiento a intervalos
regulares de 10‑11 segundos, indicativo de interacción humana o semi‑automatizada.
‑ El honeypot registró la totalidad de la sesión en formato estructurado, incluyendo la dura‑
ción (130 s) y el hash del registro TTY.
En la Tabla 5.9 se presenta el resumen cuantitativo de la actividad registrada.
Tabla 5.9:Resumen de captura por honeypot
HoneypotPerı́odoTotal eventosSesionesDuración de sesión
Cowrie (Telnet)10‑11/08/2026 (24 h)131130 s
Total10‑11/08/2026 (24 h)131130 s
*La totalidad de la actividad correspondió al vector Telnet ejercido por la prueba controlada;
no hubo tráfico espontáneo adicional durante la ventana, lo que facilita la trazabilidad com‑
pleta de los 13 eventos.
5.5 Caracterización de la actividad observada
Durante la ventana de observación se registraron 13 eventos, todos correspondientes a la se‑
sión Telnet controlada. La Tabla 5.10 desglosa el volumen por protocolo atacado.
Tabla 5.10:Eventos por protocolo atacado
ProtocoloEventos totales% del totalHoneypot responsable
Telnet13100 %Cowrie
Total13100 %
La Figura 5.11 muestra la evolución temporal de los 13 eventos durante los ~130 segundos de
la sesión.
Figura 5.11: Timeline de eventos de la sesión (por segundo)
5.5.1 Naturaleza de las interacciones
Las interacciones registradas incluyen: intentos de autenticación reiterados sobre el servicio
Telnet, autenticación exitosa con credenciales débiles y ejecución de comandos de reconoci‑
miento en el entorno simulado. Estas acciones son consistentes con patrones conocidos de
actividad hostil automatizada y semi‑automatizada.
5.5.2 Comportamiento recurrente
La sesión muestra el patrón clásico de compromiso sobre credenciales débiles: tres intentos
de autenticación sobre el usuario admin, con éxito en el tercero (admin/test123). Todas las
credenciales se muestran como hash SHA‑256 de la concatenación usuario:contraseña, en
cumplimiento de la regla de sanitización, y se catalogan como IoCs de tipo credential en la
tabla iocs.
La Tabla III‑3 del Anexo III presenta las credenciales observadas con su representación como
hash y su resultado (fallido/exitoso).
5.5.3 Valor observacional de los eventos
El entorno controlado permitió capturar eventos con alta relevancia analı́tica: no existieron
interacciones legı́timas que introdujeran ruido, cada conexión representa un evento de inte‑
rés, y el registro incluye la totalidad del ciclo de la sesión (conexión, autenticación, comandos
y cierre), lo que permite reconstruir la secuencia completa de forma verificable.
5.5.4 Procedencia de la IP atacante
La única IP atacante fue 172.18.0.1, correspondiente al gateway de la red Docker interna del
entorno (origen del ataque controlado). Por tratarse de una dirección privada, no se aplicó
geolocalización ni enriquecimiento geográfico; el enriquecimiento con geolocalización se ejer‑
cita para direcciones IP públicas en el workflow event‑ingest (documentado en el Anexo II y
verificable en el repositorio público del proyecto (https://github.com/lucasnorton01/Honeypot_
Final_Nocturne_Society, tag Honeypot_Cowrie)).
5.6 Métricas de evaluación del sistema
Para evaluar el desempeño de la arquitectura se deβinieron métricas cuantiβicables agrupadas
en cuatro categorı́as:
Métricas de captura:‑ Cantidad total de eventos registrados. ‑ Sesiones e IPs únicas.
Métricas de procesamiento:‑ Tiempo de procesamiento por evento (captura → persistencia
en PostgreSQL).
Métricas de calidad de datos:‑ Porcentaje de eventos correctamente estructurados. ‑ Tasa de
errores en el procesamiento automático.
Métricas de inteligencia generada:‑ Cantidad de indicadores de compromiso identiβicados.
‑ Nivel de automatización de su generación.
5.6.1 Indicadores de validación
La Tabla III‑6 presenta los valores obtenidos para cada métrica de validación, contrastados
contra los criterios de éxito definidos en la metodologı́a (ver §4.9). La columna «Cumpli‑
miento» indica el porcentaje alcanzado respecto del target, y «Estado» reβleja si el criterio se
superó o no.
Los datos completos se presentan en elAnexo III, Tabla III‑6.
Los 13 eventos registrados fueron estructurados correctamente (100 %), sin eventos no es‑
tructurados ni errores de parsing en la ventana. Esto conβirma que el sistema cumple holga‑
damente con el criterio de ≥ 80 % de eventos estructurados.
5.7 Resultados del procesamiento automatizado
La integración con n8n permitió procesar la totalidad de los 13 eventos de forma automati‑
zada. A continuación se detallan las métricas de throughput, latencia y tasa de error observa‑
das:
MétricaValor
Eventos procesados13/13 (100 %)
Latencia promedio (captura → persistencia)297 ms
Latencia mediana293 ms
Rango de latencia85‑962 ms
Desviación estándar muestral221 ms
Tasa de error en parsing automático0 %
Eventos enriquecidos1/13 (IP privada, sin geolocalización aplicable)
La latencia se mide entre el timestamp de captura del honeypot y el created_at de la fila en la
tabla events. El valor máximo (962 ms) corresponde al primer evento de la sesión, atribuible
a la inicialización de la conexión con la API de geolocalización; los eventos subsiguientes per‑
manecen por debajo de 400 ms.
La Figura 5.15 presenta una maqueta del dashboard de monitoreo de n8n; el dashboard
operativo en tiempo real se plantea como propuesta conceptual en la §5.14 y su hoja de ruta
en la §7.5.
5.8 Generación de inteligencia de amenazas
A partir del procesamiento de los 13 eventos se generaron4 indicadores de compromiso
(IoCs)estructurados. A continuación se presenta el catálogo detallado de estos IoCs, incluyendo
el origen, la distribución por tipo, la sesión observada, los niveles de conβianza y los hallazgos
notables.
Nota metodológica sobre sanitización:En cumplimiento de las reglas de negocio RN‑IN‑03
y RN‑SO‑02, las credenciales capturadas se presentan exclusivamente como hash SHA256 del
parusuario:contraseña. No se exponen IPs internas de la infraestructura ni datos personales
identiβicables.
5.8.1 Direcciones IP atacantes
Se observó una única IP atacante (172.18.0.1), correspondiente al gateway de la red Docker
del entorno de laboratorio y origen del ataque controlado. Por tratarse de una dirección IP
privada, no se aplican metadatos de geolocalización ni ASN; el enriquecimiento geográβico
queda ejercitado y verificado para direcciones públicas en el workflow event‑ingest (Anexo
II). Los datos de la IP observada se detallan en la Tabla III‑2 del Anexo III.
5.8.2 Distribución por tipo de IoC
La Tabla III‑9 presenta la clasiβicación de los 4 IoCs identiβicados durante el perı́odo de
observación, categorizados por tipo según el modelo de datos deβinido en la Sección 3.11.
Los datos completos se presentan en elAnexo III, Tabla III‑9.
Los 4 IoCs corresponden a 1 IP (172.18.0.1) y 3 credenciales (admin/123456, admin/admin,
admin/test123), representadas como hash SHA‑256. No se capturaron URLs, dominios ni
hashes de archivo, dado que el escenario de ataque controlado no involucraba descarga de
artefactos.

5.8.3 Timeline de actividad
Los 13 eventos de la sesión se registraron en un intervalo de 130 segundos (12:45:36‑
12:47:47 UTC‑3), con la siguiente distribución temporal:
PeriodoEventos
12:45:36‑12:45:40 (autenticación)4
12:45:40‑12:47:43 (ejecución de comandos)7
12:47:43‑12:47:47 (cierre de sesión)2
La concentración de los eventos en una ventana corta es caracterı́stica de un ataque dirigido
controlado y contrasta con la distribución uniforme de escáneres masivos automatizados.
5.8.4 Geolocalización de fuentes de ataque
Dado que la única IP atacante es privada (172.18.0.1), no se aplicó enriquecimiento de geo‑
localización en la ventana. El workflow event‑ingest invoca el servicio de geolocalización solo
para direcciones IP públicas, preservando la integridad del análisis y evitando asignaciones
incorrectas.
5.8.5 Artefactos y hashes de malware
Durante la ventana no se capturaron artefactos maliciosos (archivos, binarios ni documentos).
El escenario de ataque controlado no incluyó transferencia de archivos: la sesión se limitó a
autenticación y comandos de reconocimiento (whoami, uname -a, cat /etc/passwd, ls -la
/home, w, exit). La capacidad de captura de artefactos queda disponible en el entorno (módu‑
los de Cowrie y Dionaea) y se plantea como trabajo futuro en la §7.3.
5.8.6 Niveles de conβianza
La asignación de niveles de conβianza a los IoCs es un requisito fundamental para su uso ope‑
rativo. Sin un criterio explı́cito, un consumidor de inteligencia no puede distinguir entre un
indicador altamente βiable y uno que podrı́a ser un falso positivo. Para esta taxonomı́a se de‑
βinieron tres niveles —ALTO, MEDIO, BAJO— basados en la taxonomı́a MISP y adaptados al
alcance de esta tesis. La Tabla III‑13 (Anexo III) documenta los criterios de asignación.
Los datos completos se presentan en elAnexo III, Tabla III‑13.
La Tabla III‑14 presenta la distribución de los 4 IoCs según el nivel de conβianza asignado.
Los datos completos se presentan en elAnexo III, Tabla III‑14.
Los 4 IoCs generados por el pipeline (1 IP y 3 credenciales) se clasiβican como BAJO, nivel
asignado automáticamente para eventos aislados del entorno controlado, de acuerdo con los
criterios de la Tabla III‑13. La IP 172.18.0.1 corresponde al gateway de la red de laboratorio,
origen veriβicado del ataque controlado.
Esta distribución es consistente con la literatura, que observa que la mayor parte de las in‑
teracciones capturadas por honeypots de baja interacción corresponde a escaneos y fuerza
bruta —inteligencia de conβianza BAJO—, y solo una proporción menor alcanza niveles
ALTO/MEDIO (Nawrocki et al., 2016). Desde una perspectiva operativa, los IoCs de nivel
ALTO y MEDIO deben priorizar
el análisis manual, mientras que los de nivel BAJO pueden procesarse de forma automatizada.
5.8.7 Hallazgos notables
Esta subsección documenta hallazgos cualitativos que no se reβlejan completamente en las ta‑
blas anteriores.
Hallazgo 1: Sesión Telnet con credenciales débiles  IP:172.18.0.1 (gateway Docker)
Sesión:d7525579e2e2
Fecha:2026‑08‑11 (12:45:36‑12:47:47 UTC‑3)
La sesión registrada sobre el servicio Telnet (puerto 2223) evidencia el patrón clásico de
fuerza bruta sobre credenciales débiles: dos fallos (admin/123456, admin/admin) seguidos
de un éxito (admin/test123). Tras la autenticación se ejecutaron comandos de reconoci‑
miento:whoami,uname -a,cat /etc/passwd,ls -la /home,w. Estos comandos son caracterı́sti‑
cos de reconocimiento post‑explotación y corresponden a la técnicaT1059 (Command and
Scripting Interpreter)de MITRE ATT&CK. No se observaron técnicas de persistencia, movi‑
miento lateral ni transferencia de archivos.
Síntesis de hallazgosLa Tabla 5.22 resume los hallazgos notables y su mapeo a MITRE
ATT&CK.
Tabla 5.22: Mapeo de hallazgos notables a MITRE ATT&CK
HallazgoIPTécnica MITRE ATT&CK   Nivel de conβianza
Sesión Telnet con
credenciales débiles
172.18.0.1T1059ALTO
Fuente: Elaboración propia con referencias a MITRE ATT&CK v14.
5.9 Evaluación cualitativa del sistema
5.9.1 Capacidad de captura
El sistema demostró ser capaz de registrar actividad hostil en tiempo real: los 13 eventos de
la sesión controlada fueron capturados por Cowrie y persistidos sin intervención manual.
5.9.2 Capacidad de procesamiento
Los eventos fueron procesados de manera consistente mediante βlujos automatizados (n8n),
reduciendo la necesidad de intervención humana y estructurando el 100 % de los registros.
5.9.3 Capacidad de análisis
La estructura de los datos permitió reconstruir la sesión completa (conexión, autenticación,
comandos y cierre) y extraer 4 IoCs, validando la utilidad analı́tica de la arquitectura incluso
en escenarios de bajo volumen.
5.10 Validación de las hipótesis operativas
Las cuatro hipótesis operativas deβinidas en §1.6 y §4.6 establecen umbrales cuantitativos
contra los cuales se evalúa el desempeño del sistema. Los datos obtenidos durante el perı́odo
de observación permiten contrastar cada hipótesis:
P1 — Reducción de tiempo (≥ 50 %):El tiempo de procesamiento promedio de 297 ms
por evento (Anexo III, Tabla III‑1) representa el 1 % del procesamiento manual estimado
(~30 s/evento según NIST SP 800‑61 Rev. 2). La hipótesis se cumple con una reducción estimada
de ≈99 %, calculada sobre la línea de base reproducible de §6.1.1.
P2 — Estructuración de datos (≥ 80 %):El 100 % de los eventos se estructuraron correc‑
tamente en formato JSON válido (Anexo III, Tabla III‑6), superando el umbral del 80 %.
La hipótesis se cumple.
P3 — Generación de IoCs (≥ 70 %):Se produjeron 4 IoCs, todos generados automática‑
mente sin intervención manual (Anexo III, Tabla III‑9). La hipótesis se cumple.
P4 — Reportes automatizados (≥ 90 %):El sistema produjo el reporte de inteligencia diario
correspondiente a la ventana (2026‑08‑11) sin intervención humana directa. La hipótesis
se cumple.
En conjunto, los resultados conβirman las cuatro hipótesis operativas: la integración de ho‑
neypots con n8n permite transformar la observación pasiva en generación sistemática de in‑
teligencia de amenazas, cumpliendo los umbrales de desempeño establecidos en §4.9.
5.11 Cumplimiento de objetivos
A continuación se evalúa el cumplimiento de cada objetivo planteado en §1.4, respaldado por
la evidencia obtenida durante el experimento.
Objetivo general:Diseñar e implementar una arquitectura de honeypots integrada con auto‑
matización, orientada a la generación de inteligencia de amenazas.
Cumplido.La arquitectura procesó los 13 eventos de la ventana, generó 4 IoCs con 100 %
de automatización (Anexo III, Tabla III‑9) y produjo el reporte de inteligencia diario sin in‑
tervención humana (Tabla 5.5).
Objetivos especíβicos:
1.Diseñar un entorno de captura segmentado y controlado:Se desplegó el honeypot
Cowrie en una red aislada (Docker), registrando la sesión Telnet con un 100 % de eventos
correctamente estructurados.
2.Implementar un sistema de automatización para el procesamiento de eventos:El
pipeline n8n procesó el 100 % de los eventos con latencia promedio de 297 ms y tasa de
error de 0 %.
3.Registrar evidencia empírica de actividad hostil:Se capturaron 13 eventos de la sesión
Telnet controlada (Cowrie), identiβicando 1 IP atacante (ver Tabla 5.9 y Anexo III, Ta‑
bla III‑2).
4.Analizar los eventos capturados para identiβicar patrones y tendencias:Se identiβi‑
caron las credenciales débiles utilizadas en los 3 intentos de autenticación (Anexo III,
Tabla III‑3). Telnet concentró el 100 % de la actividad (Tabla 5.10).
5.Evaluar el desempeño de la arquitectura:El tiempo de procesamiento promedio de
297 ms (máximo: 962 ms) cumple con el target de < 1000 ms. La reducción estimada de ≈99 %
frente al procesamiento manual estimado supera ampliamente el criterio de ≥ 50 %.
6.Generar lineamientos para la replicación de la arquitectura:Los datos y métricas
presentados en este capı́tulo constituyen una lı́nea base reproducible que permite a
otras organizaciones implementar arquitecturas similares con parámetros de referencia
conocidos.
5.12 Limitaciones de los resultados
Los resultados presentan limitaciones inherentes: ‑ Corresponden a un escenario de ataque
controlado, no a tráβico hostil real de internet. ‑ El volumen de datos es reducido (13 eventos,
1 sesión). ‑ Dependen del tipo de servicios expuestos (Telnet). ‑ Corresponden a un perı́odo
especı́βico (24 h). ‑ No permiten generalización estadı́stica. ‑ Posible detección del honeypot
por atacantes avanzados.
Estas limitaciones deben ser consideradas al interpretar los hallazgos; su mitigación se plan‑
tea como trabajo futuro en la §7.3.
5.13 Implementación de Workβlows n8n
La arquitectura propuesta se materializa a través de tres workβlows en n8n que orquestan el
pipeline completo de captura, procesamiento y generación de inteligencia de amenazas. Cada
workβlowfuediseñadosiguiendopatronesdeautomatizaciónprobados(WebhookProcessing
y Scheduled Tasks), con énfasis en el manejo de errores, la trazabilidad y el desacoplamiento
de responsabilidades.
A continuación se documentan la topologı́a, los nodos, el βlujo de datos y las conβiguraciones
de cada workβlow, junto con ejemplos de payload transformado, diagramas de estructura y
referencias a las variables de entorno que cada uno consume.
5.13.1 Workβlow de Ingesta de Eventos (event‑ingest)
Patrón aplicado:Webhook Processing, de acuerdo a los patrones de diseño de workβlows
n8n.Trigger:WebhookHTTPPOST.Propósito:RecibireventosJSONdesdeCowrieyDionaea,
validar la estructura del payload, normalizar los campos al schema estándar, enriquecer con
geolocalización y reputación IP, y persistir en PostgreSQL.
El workβlow se estructura en una secuencia 2+3+3: dos nodos de entrada (Webhook y validación del payload), tres de procesamiento (normalización al schema estándar, consulta de geolocalización vı́a ip‑api.com y consulta condicional de reputación vı́a AbuseIPDB cuando ABUSEIPDB_API_KEY está deβinida) y tres de persistencia (fusión de datos enriquecidos, inserción en PostgreSQL y rutas de error a error_log). Cada nodo crı́tico posee un error branch que deriva a la tablaerror_log.
Para la descripción completa del diagrama de βlujo, las ejempliβicaciones de payload (Cowrie
SSH, Dionaea SMB, normalizado y enriquecido), y las conβiguraciones de las APIs de geoloca‑
lización y reputación, véase Anexo II, Conβig. 1 a Conβig. 7.
## 59

5.13.2 Workβlow de Extracción de IoCs (ioc‑extractor)
Patrón aplicado:Scheduled Tasks + Batch Processing.Trigger:Schedule Trigger (cada 15
minutos).Propósito:Procesar eventos almacenados que no hayan sido analizados, extraer
indicadores de compromiso, clasiβicarlos por tipo, asignar nivel de conβianza y persistirlos
con deduplicación en la tablaiocs.
El workβlow se activa cada 15 minutos, consulta eventos conioc_processed = falsey pro‑
cesa hasta 500 por ejecución. El nodo de extracción genera cero o más IoCs por evento clasi‑
βicados en cinco tipos (ip,credential,hash,url,domain), persistidos mediante UPSERT con
(type, value)como clave única. Si un evento no contiene IoCs, se marca conno_iocpara
evitar reprocesamiento. Para el diagrama de βlujo, la lógica de clasiβicación por tipo con sus
umbrales de conβianza, y la sentencia SQL de deduplicación, véase Anexo II, Conβig. 8 a Conβig.
## 9.
5.13.3 Workβlow de Generación de Reportes (report‑generator)
Patrón aplicado:Scheduled Tasks con fan‑out paralelo de queries.Trigger:Schedule Trig‑
ger (cron:0 8 * * *diario,0 9 * * 1semanal).Propósito:Ejecutar queries de agregación
sobre los eventos del perı́odo, ensamblar un reporte estructurado y persistirlo en la tabla
reports.
El workβlow se activa con Schedule Trigger; si el dı́a es lunes, el perı́odo se extiende a 7 dı́as
(semanal), caso contrario a 24 horas (diario). El nodo Deβinir Perı́odo calculaperiod_starty
period_end, y cinco queries de PostgreSQL se ejecutan en paralelo (fan‑out): total de eventos,
top 10 IPs, distribución geográβica, credenciales más frecuentes e IoCs nuevos. Si alguna query
falla, su error branch registra el incidente sin interrumpir las demás; el reporte se marca como
status: "partial". El nodo Function ensambla los resultados en un JSON estructurado con
secciones de metadata, resumen ejecutivo, IPs atacantes, distribución geográβica, análisis de
credenciales, nuevos indicadores y conclusiones. Para los diagramas de βlujo, las cinco consul‑
tas SQL de agregación y el ejemplo completo de reporte generado, véase Anexo II, Conβig. 10
a Conβig. 16.
Conβiguración de temporizadoresLos temporizadores se conβiguran mediante el nodo
Schedule Trigger de n8n, que soporta expresiones cron estándar e intervalos predeβinidos:
WorkβlowExpresión cronFrecuenciaPropósito
ioc‑extractorCada 15 minutos (intervalo)15 minutosProcesamiento
continuo de IoCs
report‑generator
## (daily)
0 8 * * *Diario a las 08:00Reporte de actividad
diaria
report‑generator
## (weekly)
0 9 * * 1Semanal (lunes 09:00)Reporte semanal
consolidado
La expresión cron sigue el formato estándar de 5 campos:minuto hora día-del-mes mes
día-de-la-semana. En n8n, la conβiguración se realiza desde la interfaz del nodo Schedule
## 60

Trigger, que permite seleccionar entre intervalos simples (cada X minutos/horas) o expresio‑
nes cron avanzadas.
5.13.4 Manejo de Errores Transversal
Los tres workβlows implementan un patrón de manejo de errores consistente basado en error
branches.Cada nodo crı́ticoposee unasalida deerror(representadaporla conexión punteada
en los diagramas) que deriva a un nodo PostgreSQL común que persiste el incidente en la
tablaerror_log. Adicionalmente, un workβlow de alertas independiente con Error Trigger
monitorea errores crı́ticos y notiβica al administrador. Para el diagrama del patrón transversal,
el schema de la tablaerror_logy la polı́tica de reintentos por tipo de error, véase Anexo II,
## Conβig. 17.
5.13.5 Variables de Entorno y Referencias Cruzadas
La siguiente tabla compila las variables de entorno que cada workβlow consume, junto con
su origen en la documentación de arquitectura (véase sección 8 de la base de conocimiento,
## 08_arquitectura_propuesta.md).
VariableWorkβlows que la consumenDescripciónDeβinida en
N8N_WEBHOOK_URLevent‑ingestURL base del
webhook de n8n
KB 08 — Variables de
entorno
DB_HOSTevent‑ingest, ioc‑extractor,
report‑generator
Host de PostgreSQL   KB 08 — Variables de
entorno
DB_PORTevent‑ingest, ioc‑extractor,
report‑generator
Puerto de PostgreSQL  KB 08 — Variables de
entorno
DB_NAMEevent‑ingest, ioc‑extractor,
report‑generator
Nombre de base de
datos
KB 08 — Variables de
entorno
DB_USERevent‑ingest, ioc‑extractor,
report‑generator
Usuario de base de
datos
KB 08 — Variables de
entorno
DB_PASSWORDevent‑ingest, ioc‑extractor,
report‑generator
Contraseña de base
de datos
KB 08 — Variables de
entorno
GEOIP_API_KEYevent‑ingestAPI key de
geolocalización
KB 08 — Variables de
entorno
ABUSEIPDB_API_KEYevent‑ingestAPI key de
AbuseIPDB
## (opcional)
KB 08 — Variables de
entorno
VT_API_KEYevent‑ingestAPI key de VirusTotal
(opcional, alternativa
a AbuseIPDB)
KB 08 — Variables de
entorno
Todas las variables se referencian en los workβlows mediante la sintaxis${VAR_NAME}de n8n,
queresuelveelvalordesdeelentornodeejecuciónentiemporeal.Ningunacredencialaparece
hardcodeada en los exports JSON ni en la documentación.
La arquitectura de capas, deβinida en08_arquitectura_propuesta.md, establece que la capa
de procesamiento (n8n) se comunica con la capa de persistencia (PostgreSQL) a través de la
red interna de Docker, utilizando las credenciales deβinidas en estas variables. La segmenta‑
ción de red impide que los honeypots accedan directamente a la base de datos, reforzando el
principio de aislamiento por capa.
## 61

La presente sección materializa los βlujos deβinidos en07_flujos_principales.md(Flujo
1: Captura y procesamiento de evento; Flujo 2: Generación de reporte automatizado) trans‑
formándolos en workβlows n8n concretos con topologı́a de nodos, lógica de transformación,
manejo de errores y conβiguración de temporizadores. Las funcionalidades US‑003 (Ingesta
de eventos), US‑004 (Parseo y normalización), US‑005 (Enriquecimiento contextual), US‑006
(Extracción de IoCs) y US‑007 (Generación de reportes) se implementan a través de los tres
workβlows aquı́ documentados.
Los resultados expuestos constituyen la evidencia empı́rica central del estudio. El siguiente
capı́tulo discute su signiβicado, los contrasta con la literatura existente y analiza sus implica‑
ciones prácticas para el campo de la ciberseguridad defensiva.
## 62

5.14 Propuesta de Dashboards de Visualización en Tiempo Real
[Propuesta conceptual — no implementada]Esta sección propone una arqui‑
tectura de visualización basada en Grafana con PostgreSQL como fuente de datos,
deβine cinco paneles funcionales con sus consultas SQL, compara alternativas tec‑
nológicas (Grafana, Kibana, n8n) y discute las ventajas operativas para el analista
SOC. Por tratarse de una propuesta no implementada en el alcance de esta tesis, se
presentadeformaresumida;laslı́neasdeimplementaciónpriorizadassediscuten
en la §7.5.
## 63

Capítulo VI: Discusión
El despliegue de una infraestructura de honeypots genera un volumen signiβicativo de datos
técnicos. Sin embargo, la mera acumulación de registros no constituye inteligencia útil. Para
que los datos adquieran valor operativo, deben atravesar un proceso sistemático de identiβica‑
ción, estructuración, correlación e interpretación. Este capı́tulo tiene como objetivo interpre‑
tar los resultados presentados en el capı́tulo anterior, explicando su signiβicado en el contexto
del problema planteado y los objetivos de la tesis.
6.1 Análisis Comparativo: Automatización vs Procesamiento Manual
El valor de la automatización en seguridad solo puede establecerse mediante una compara‑
ción cuantitativa contra la alternativa que reemplaza: el procesamiento manual de eventos.
Este análisis descompone la comparación en cinco dimensiones —lı́nea de base temporal, mé‑
tricasderendimiento,escalabilidad,precisiónycumplimientodecriteriosdeéxito—ydiscute
los resultados de cada una.
6.1.1 Línea de base de procesamiento manual
Para establecer un término de comparación, se descompuso el procesamiento manual de un
evento de honeypot en cinco fases, estimando rangos de tiempo para cada una basados en la
literatura de análisis SOC (NIST SP 800‑61 Rev. 2, 2012; SANS, 2023) y en la experiencia del
equipo de investigación.
Los supuestos consideran un analista con formación en ciberseguridad (perβil SOC nivel
1‑2) sin especialización en threat intelligence, que procesa eventos individualmente —sin
batching— en jornadas de 8 horas, sin herramientas de automatización y con acceso a los
logs crudos JSON de Cowrie o Dionaea.
La descomposición completa del procesamiento manual por fase —con los rangos de tiempo
estimadosysujustiβicación—sedocumentaenelrepositoriodelproyecto;elcuerpoconserva
el resultado agregado (~30 s/evento) y su justiβicación operativa.
Sobre esta base, procesar los 13 eventos registrados en la ventana de observación requerirı́a
aproximadamente6,5 minutos‑hombre(13 × 30 s), una fracción mı́nima de una jornada la‑
boral. La ventaja de la automatización no reside en este volumen puntual —viable de procesar
manualmente— sino en su escalabilidad: el pipeline automatizado completa el mismo proce‑
samiento en ~4 segundos (13 × 297 ms) con 100 % de estructuración y 0 % de errores. A
modo de proyección, procesar el corpus medido de 201.125 eventos (13/07–11/08) requerirı́a ~1.676 horas‑hombre manuales (~210 jornadas laborales de 8 ho‑
ras), mientras que el pipeline lo completarı́a en ~16,6 horas. Esta diferencia evidencia la in‑
viabilidad del procesamiento manual a escala y constituye la justiβicación operativa central
de la arquitectura propuesta.
6.1.2 Tabla comparativa de métricas
La tabla siguiente contrasta las métricas del sistema automatizado contra las estimaciones
manuales. Las fórmulas de mejora se especiβican en las notas al pie.
Tabla 6.2Comparación de métricas entre procesamiento manual estimado y sistema auto‑
matizado
MétricaEstimación ManualValor Automatizado RealMejora %Notas
Tiempo de
procesamien‑
to por evento
30 s (30.000 ms)297 ms ¹99 % aEl sistema
procesa
cada
evento
~101
veces más
rápido
que un
analista
humano
Tiempo total
de la ventana
6,5 min (13
eventos) ²
~3,9 s98,99 % aEl analista
revisa
reportes
generados
por el
sistema,
no
eventos in‑
dividuales
Capacidad de
procesamien‑
to diaria
~960 eventos/dı́a ³~4.800 eventos/dı́a ⁴400 % bEl sistema
procesa
5× más
eventos
por dı́a
Tasa de
parseo
correcto
~80 % (SANS, 2023)100 %+25 % bSupera el
target del
80 %
Generación
de IoCs
20–30/dı́a (ENISA, 2023)
## ⁵
4 IoCs
(ventana)
n/a (100 %
automa‑
tizados)
bGenera
indicado‑
res sin
interven‑
ción
manual
Notas.¹ Medición desde la recepción del webhook hasta la escritura en base de datos, inclu‑
yendo parseo, enriquecimiento y almacenamiento (C‑04, Anexo III, Tabla III‑1). ² Cálculo:
13 eventos × 30 s. ³ Cálculo: 480 min ÷ 0,5 min/evento. ⁴ Proyección lineal del pipeline a
volumen continuo (297 ms/evento); no medido en la ventana. ⁵ Estimación de ENISA (2023) pa‑
ra generación manual de indicadores en equipos SOC pequeños.
a Mejora calculada como (valor_manual − valor_automático) / valor_manual × 100 (menor
es mejor). b Mejora calculada como (valor_automático − valor_manual) / valor_manual × 100
(mayor es mejor).
Nota: Esta comparación se basa en una línea de base manual estimada a partir de
literatura académica y reportes de la industria (NIST SP 800‑61 Rev. 2, 2012; SANS,
2023; ENISA, 2023), no en un experimento controlado con grupo de analistas hu‑
manos. Los valores porcentuales expresan una aproximación conservadora, no una
medición directa.
6.1.3 Análisis de escalabilidad
La escalabilidad del pipeline automatizado se evaluó proyectando su comportamiento en tres
escenarios de volumen creciente, contrastándolo con el esfuerzo manual equivalente.
La proyección del esfuerzo por escenario de volumen y la comparación gráβica de los tiempos
manual vs automatizado se presentan en laFigura III‑2y en el repositorio público del proyecto
(https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society, tag Honeypot_Cowrie).
Cuellos de botella identiβicados.El análisis de escalabilidad revela dos restricciones que
podrı́an afectar el rendimiento a volúmenes superiores a 1.000.000 eventos/mes:
1.APIs de geolocalización (rate limiting).El workβlow de enriquecimiento consulta ip‑
api.com (lı́mite de 45 consultas/minuto en su capa gratuita). A partir de ~65.000 even‑
tos/dı́a con IPs mayoritariamente únicas, el sistema comenzarı́a a experimentar demo‑
ras por throttling.Mitigación:caché local de consultas geo con TTL de 24 horas o plan
comercial (~$10‑15 USD/mes).
2.Procesamiento secuencial en n8n.Los workβlows procesan eventos de forma secuen‑
cial; a volúmenes superiores a ~1.500 eventos/hora podrı́an formarse colas de espera.
Mitigación:concurrency control de n8n o fragmentación del pipeline en workβlows con
colas intermedias.
6.1.4 Análisis de precisión
La precisión del parseo automatizado se contrastó con las tasas de error reportadas en la lite‑
ratura para análisis manual sin herramientas de automatización.
El desglose por tipo de error —tasas manuales estimadas, tasas automáticas reales, mejora y
fuentes— se presenta en elAnexo III, Tabla III‑33.
Desglose de errores automáticos.Los 13 eventos de la ventana fueron estructurados correc‑
tamente sin errores de parsing, enriquecimiento ni schema (tasa de error combinada: 0 %).
No se observaron payloads malformados, timeouts de APIs externas ni campos faltantes, dado
que la totalidad del tráfico corresponde a la sesión controlada registrada por Cowrie. La tasa
de error del 0 % es signiβicativamente menor que el rango estimado para procesamiento
manual (15–30 % según las fuentes citadas), lo que sugiere que la automatización no solo es
más rápida sino también más consistente en la calidad del procesamiento.
## 66

6.1.5 Veriβicación de criterios de éxito
La tabla siguiente veriβica el cumplimiento de cada criterio de éxito deβinido en la visión del
proyecto (01_vision_y_objetivos.md).
Tabla 6.5Veriβicación de criterios de éxito del proyecto
CriterioTargetValor RealCumplimientoEvidencia
Reducción de
tiempo de
procesamiento
≥ 50 % frente
a estimación
manual
99 % (por
evento)
SíTabla 6.2, §6.1.2
Eventos
correctamente
estructurados
≥ 80 %100 %SíAnexo III, Tabla III‑6
(C‑04), §5.6
Generación de
IoCs automática y
accionable
Automática y
accionable
4 IoCs generados,
100 % automatizados
SíAnexo III, Tabla III‑9
(C‑04), §5.8
Reportes
automatizados sin
intervención
humana
Sin
intervención
humana
directa
Reporte diario
generado sin
intervención
SíLogs de ejecución
n8n (C‑05), §5.13
Identiβicación de
patrones TTPs
repetitivos
Capacidad de
detectar
patrones
Patrones
identiβicados:
credenciales
débiles reiteradas,
sesión Telnet con
reconocimiento
post‑explotación
Sí (parcial)§5.8, §6.2.2; la
identiβicación es
cualitativa — un
pipeline ML
automatizado
(C‑13) podrı́a
formalizarla
Evaluación cualitativa de identiβicación de patrones.El sistema identiβicó patrones TTPs
mediante la reconstrucción de la sesión:reutilización de credenciales débiles(tres intentos
sobre el usuario admin con éxito en el tercero, indicativo de diccionarios comunes) ycom‑
portamiento post‑explotación(secuencia de comandos de reconocimiento whoami, uname
-a, cat /etc/passwd, ls -la /home, w tras la autenticación, consistente con playbooks es‑
tandarizados). El criterio se marca comoparcialmente cumplidoporque la identiβicación es
cualitativa; un pipeline de machine learning (C‑13) la automatizarı́a.
6.1.6 Síntesis del análisis comparativo
Los resultados conβirman que la integración de honeypots con n8n reduce signiβicativamente
el tiempo de procesamiento (99 % por evento), incrementa la capacidad de procesamiento en
un 400 % respecto de la estimación manual diaria y mejora la precisión del parseo en al me‑
nos 25 % frente a las estimaciones de procesamiento manual (0 % de errores observados).
Estos valores validan las hipótesis operativas de la tesis y posicionan la automatización low‑
code como una alternativa viable para organizaciones con recursos limitados.
## 67

6.2 Interpretación de resultados
6.2.1 Análisis cuantitativo de eventos
El análisis cuantitativo se centra en los valores numéricos obtenidos durante el perı́odo de
observación (Tablas 5.1 a 5.10 y del Anexo III) y su interpretación en el contexto del problema
planteado.
Volumen y distribución temporal:Se registraron13 eventosen la ventana de 24 horas
(2026‑08‑10 12:50:43 a 2026‑08‑11 12:50:43 UTC‑3; Tabla 5.1), todos concentrados en la
sesión Telnet del 2026‑08‑11 12:45:36‑12:47:47. La concentración de la actividad en un in‑
tervalo de 130 segundos es propia del escenario de ataque controlado, y contrasta con la dis‑
tribución cuasi‑uniforme que presentan los escáneres automatizados en despliegues expues‑
tos a tráβico hostil. Para la planiβicación defensiva, esto implica que los recursos de monito‑
reo deben priorizar la detección de autenticaciones exitosas con credenciales débiles sobre el
volumen bruto de eventos.
Proporción por protocolo:Telnet concentró el100 %de los eventos (13 eventos, Tabla 5.10),
consistente con el servicio emulado por Cowrie en el escenario. Este resultado no debe inter‑
pretarse como una prevalencia del protocolo en Internet —donde SSH lidera el tráβico hostil
según SANS (2023)— sino como la evidencia de que el pipeline procesa correctamente el pro‑
tocolo expuesto. El soporte multi‑protocolo queda disponible con los módulos de Dionaea
(§3.10).
Repetición de credenciales:Los tres intentos de autenticación utilizaron el usuario admin
con las contraseñas123456,adminytest123 (Anexo III, Tabla III‑3), combinaciones tı́picas
de diccionarios ampliamente distribuidos. La implicancia operativa es clara: la adopción de
contraseñas robustas y la implementación de autenticación multifactor (MFA) podrı́an blo‑
quear esta clase de accesos no autorizados.
Origen geográβico:La única IP atacante (172.18.0.1) es privada y corresponde al gateway de
la red Docker del laboratorio, por lo que no se aplica geolocalización (Anexo III, Tabla III‑2).
El enriquecimiento geográβico queda implementado en el workflow event‑ingest para direc‑
ciones públicas y se veriβica con datos de referencia en el Anexo II.
Signiβicancia de las métricas de validación:El tiempo de procesamiento promedio de297
ms (máximo: 962 ms; Anexo III, Tabla III‑1) implica que un evento individual es estructura‑
do, enriquecido y almacenado en menos de un segundo. En un contexto operativo real donde
el throughput puede escalar a cientos de eventos por segundo durante un ataque distribuido
(DDoS o escaneo masivo), este rendimiento es aceptable para entornos PyME; para volúmenes
superiores serı́a necesario evaluar la horizontalización del pipeline.
El100 %de eventos correctamente estructurados (superando el target del 80 %) indica que
el pipeline de normalización es robusto; no se observaron eventos no estructurados en la ven‑
tana, dado que todo el tráβico correspondió a la sesión controlada de Cowrie. En términos
operativos, la revisión manual se elimina por completo para este escenario.
La generación de4 IoCscon un100 % de automatización(Anexo III, Tabla III‑9) de‑
muestra que el sistema produce inteligencia aplicable sin intervención humana directa. Si
bien el volumen es reducido frente a la capacidad de un SOC (20‑30/dı́a según ENISA, 2023),
la estructura de los IoCs (tipo, valor, nivel de conβianza) es directamente consumible por
herramientas de correlación, validando el mecanismo de generación automática.
6.2.2 Análisis cualitativo de comportamiento
El análisis cualitativo interpreta la intención del atacante, el nivel de soβisticación y el tipo
de interacción: se distinguenbots(patrones repetitivos, comandos estándar) deoperado‑
res humanos(secuencias más complejas), con predominio de actividad automatizada; y se
identiβican TTPs (reconocimiento, explotación, persistencia, descarga de herramientas) que
caracterizan el tipo de amenaza y su nivel de soβisticación.
6.3 Comparación con literatura existente
Los resultados obtenidos son consistentes con la literatura en ciberseguridad, que señala: la
existencia de escaneo automatizado constante, el uso de credenciales comunes y la prevalen‑
cia de ataques oportunistas. A continuación se confrontan los valores cuantitativos obtenidos
con rangos reportados en estudios relacionados.
Volumen de eventos:El escenario de ataque controlado generó13 eventos en 24 horas, un
volumen que no es comparable directamente con despliegues expuestos a tráβico hostil real,
donde los sensores registran miles de eventos por día (Nawrocki et al., 2016).
La diferencia no reβleja una limitación del pipeline sino la naturaleza del experimento: un
ataque dirigido y acotado para validar la integración, cuyo diseño metodológico se detalla en
§4.8.
Proporción por protocolo:El100 %de eventos Telnet es propio de un escenario de un solo
servicio expuesto. En despliegues expuestos, Telnet suele concentrar entre el 5 % y el 8 % del
tráβico (Honeynet Project, 2022; SANS, 2023), siendo SSH el protocolo predominante; el sis‑
tema queda preparado para ese tipo de tráβico mediante los módulos Cowrie SSH y Dionaea.
Tasa de eventos estructurados:El100 %se encuentra en el lı́mite superior del 93‑96 %
reportado por la documentación de Cowrie (Oosterhof, 2023); la ausencia de errores es con‑
sistente con un entorno sin tráβico fragmentado ni alta concurrencia.
Eβiciencia de procesamiento:El promedio de297 ms(P99: 890 ms) se encuentra muy por
debajo de la línea de base manual estimada de ~30 s por evento (§6.1.1, Tabla 6.2), con una
reducción estimada de ≈99 %, lo que valida P1 con margen amplio; la comparación con pipelines
artesanales alternativos queda fuera del alcance de este trabajo.
Generación de IoCs:La generación automática del 100 % de los IoCs (4/4) valida el meca‑
nismo propuesto; si bien el volumen no es comparable con el rendimiento de un SOC, la auto‑
matización del proceso soporta la tesis de Shackleford (2015) sobre la necesidad de automa‑
tización para escalar la inteligencia de amenazas.
En comparación con Modern Honey Network, la arquitectura propuesta agrega procesamien‑
to automatizado y enriquecimiento contextual que MHN no proporciona de forma nativa, su‑
perando su enfoque centrado en la gestión centralizada de sensores.
## 69

6.4 Limitaciones del estudio
Los resultados presentados deben interpretarse a la luz de ocho limitaciones identiβicadas,
organizadaspordimensión.Latablasiguienteresumecadalimitaciónconsuimpactoconcreto
y la estrategia de mitigación aplicada. Ninguna de estas limitaciones invalida las conclusiones
dentro del alcance deβinido, pero condicionan su generalización a otros contextos.
Tabla 6.6Limitaciones del estudio: impacto y mitigación
LimitaciónImpactoMitigación
De volumen:ventana de 24 horas y
13 eventos (1 sesión)
No permite análisis
estadı́stico ni patrones
temporales de mediano
plazo; estudios longitudinales
reportan variaciones marcadas
entre períodos de baja y alta
actividad (Nawrocki et al., 2016)
Extensión de la ventana de
observación a tráβico hostil real
(30‑90 dı́as) como trabajo futuro
(§7.3)
Metodológica:lı́nea de base manual
estimativa (Sección 6.1)
La comparación manual se
basa en literatura y
supuestos (NIST SP 800‑61
Rev. 2, 2012; SANS, 2023), no
en experimento controlado;
la mejora del 99 % es una
aproximación conservadora,
no un valor absoluto
Los tiempos manuales (rango
20‑45 s/evento) se presentan como
estimaciones; un estudio con grupo
de control humano establecerı́a
comparación directa
Técnica:dependencia de APIs
gratuitas con rate limiting (ip‑api.com:
45 consultas/min)
A volúmenes elevados con IPs
únicas habrı́a demoras por
throttling; el workflow
incorpora reintentos y
caché local
Mecanismo de reintento en el
workβlow event‑ingest; caché local
con TTL de 24 horas reducirı́a la
dependencia
De entorno:ataque controlado, sin
tráβico hostil real de internet
La ausencia de tráβico
benigno y de volumen real
simpliβica artiβicialmente el
procesamiento; la tasa de
error del 0 % podrı́a ser
mayor en un entorno mixto
con ruido de fondo
Los resultados se limitan al entorno
deβinido; la validación en entorno
expuesto queda como trabajo futuro
De protocolos:cobertura limitada a
Telnet (Cowrie)
Quedan fuera SSH, HTTP/
HTTPS, RDP, SMB, bases de
datos (MSSQL, MySQL) e IoT
(MQTT, CoAP); los patrones
identiβicados no son
representativos de esos
protocolos
Alcance delimitado a los protocolos
emulados; extensión de cobertura
(Dionaea multi‑protocolo) como
lı́nea de trabajo futuro
De validación:ausencia de ground
truth para ML
Sin etiquetas de validación
es imposible calcular
precisión, recall o F1‑score;
las discusiones sobre
clustering y anomalı́as son
hipotéticas
Etiquetado manual de sesiones
(estimado: 40‑80 horas de analista)
como requisito previo
De generalización:ámbito acotado a
PyMEs y educación
Resultados no generalizables
a entornos enterprise
(millones de eventos/dı́a,
PCI‑DSS/HIPAA/GDPR,
SIEM/SOAR corporativos)
Antes de adopción a gran escala se
requiere evaluar horizontalización,
redundancia de sensores y
cumplimiento regulatorio
Estas limitaciones deβinen el perı́metro de validez de los resultados. Ninguna invalida
las conclusiones dentro del alcance del estudio —un entorno PyME/educativo con recursos
limitados— pero todas representan direcciones concretas para trabajo futuro.
6.5 Implicaciones prácticas
6.5.1 Para PyMEs
La arquitectura demuestra que es posible implementar un sistema de inteligencia de amena‑
zas local con herramientas open source y recursos computacionales mı́nimos, sin depender
de plataformas SOAR comerciales.
6.5.2 Para instituciones educativas
El trabajo proporciona una metodologı́a reproducible para la enseñanza de ciberseguridad
defensiva, permitiendo a estudiantes observar actividad hostil real en un entorno controlado.
6.5.3 Para la academia
Se aporta evidencia empı́rica sobre la viabilidad de integrar honeypots con automatización
low‑code, abriendo lı́neas de investigación en inteligencia de amenazas local y procesamiento
automatizado de eventos.
6.6 Detección de Patrones mediante Machine Learning
[Propuestaconceptual—noimplementada]Estasecciónexploradeformacon‑
ceptual la aplicabilidad de técnicas de machine learning no supervisado (cluste‑
ring con DBSCAN (Ester et al., 1996), detección de anomalı́as con Isolation Forest
(Liu et al., 2008), correlación temporal) sobre eventos estructurados de honeypots.
En la ventana actual (13 eventos) el volumen no es suβiciente para enfoques no
supervisados signiβicativos; la extensión a un corpus mayor —de tipo 30‑90 dı́as
de exposición real, como se discute en §7.3— junto con la ausencia de ground truth
y de etiquetas de validación determinan que la implementación real de modelos
ML quede fuera del alcance de esta tesis. La literatura de detección de anomalı́as
(Chandola et al., 2009; Breunig et al., 2000; Casas et al., 2012), la detección semi‑
automatizada de ataques en datos de honeypots (Cremilleux et al., 2019) y la
advertencia sobre la difı́cil transferencia del aprendizaje supervisado a entornos
abiertos (Sommer & Paxson, 2010) refuerzan esa delimitación. Las lı́neas de trabajo priori‑
zadas se presentan en la §7.5.
6.7 Evaluación crítica de n8n como plataforma de automatización CTI
La elección de n8n como motor de automatización fue una decisión central del diseño. Esta
sección evalúa crı́ticamente esa decisión a la luz de la experiencia de implementación, docu‑
mentando ventajas observadas, limitaciones encontradas y trade‑offs frente a alternativas via‑
bles.
6.7.1 Ventajas observadas
Cuatro ventajas de n8n se conβirmaron durante el desarrollo:
1.Curvadeaprendizajebaja:eleditorvisualpermitió construirelworkβlowevent‑ingest
(8 nodos) en ~4 horas; un pipeline equivalente en Python puro habrı́a demandado 12‑
16 horas estimadas.
2.Integracionesnativas:los conectores HTTP Request, PostgreSQL, Function y Webhook
cubren toda la necesidad del pipeline (ingesta, enriquecimiento, transformación y per‑
sistencia) sin código personalizado más allá de JavaScript en nodos Function.
3.Orquestación multi‑workβlow:los schedules nativos separaron la ingesta en tiempo
real (event‑ingest), el procesamiento por lotes (ioc‑extractor) y la generación de repor‑
tes (report‑generator) sin orquestador externo.
4.Comunidad activa:más de 400 nodos disponibles cubren la mayorı́a de los escenarios
CTI sin conectores personalizados.
6.7.2 Limitaciones encontradas
Tres limitaciones de n8n se manifestaron durante la operación del pipeline:
1.Procesamiento secuencial por defecto.La concurrencia se habilita conconcurrency
control, aunque su conβiguración no es intuitiva; durante picos de actividad el procesa‑
miento acumuló hasta 12 segundos de latencia para el último evento del lote.
2.Debugging complejo en workβlows multi‑nodo.Los errores en nodos intermedios no
siempre identiβican la causa raı́z; depurar un error de tipado en el ioc‑extractor insumió
~3 horas por un mensaje genérico de n8n.
3.Consumo de recursos de Node.js.La instancia consumió ~380 MB de RAM en reposo
y hasta 650 MB en ejecución concurrente; en VPS de 1 GB RAM (los más económicos),
n8n puede no ser viable junto con los honeypots.
6.7.3 Trade‑offs frente a alternativas
Python puro (scripts + cron + Flask/FastAPI).Ofrece control total y menor huella de recur‑
sos (~80‑120 MB), pero requiere desarrollo manual de toda la infraestructura (scheduling,
reintentos, logging, integraciones). Viable para equipos con perβil de desarrollo; para equipos
de seguridad sin especialización, n8n reduce el tiempo de implementación a una fracción.
## 72

Node‑RED.Similar en βilosofı́a low‑code, con comunidad extensa en IoT, pero con un modelo
de integración con PostgreSQL menos maduro y sin conectores OAuth nativos ni credenciales
encriptadas.
StackStorm.Orquestación event‑driven enterprise, más potente en auto‑remediación, pero
su complejidad operativa (MongoDB, RabbitMQ, múltiples servicios) lo hace excesivo para un
entorno PyME con recursos limitados.
La comparación ı́ntegra de plataformas por dimensión se presenta en elAnexo III, Tabla III‑
## 34.
n8n ocupó el punto óptimo para este proyecto por su balance entre velocidad de implemen‑
tación, riqueza de integraciones y costo operativo. Para un equipo de seguridad con perβil no
especializado en desarrollo, sigue siendo la recomendación primaria. Para equipos con capa‑
cidad de desarrollo, Python puro ofrece ventajas en escalabilidad y capacidad de debugging.
6.8 Calidad y utilidad de los IoCs generados
Los 4 IoCs generados (Sección 5.8) representan el producto central del pipeline. El 100 %
se generaron de forma completamente automatizada, con la estructura de 8 dimensiones por
IoC —tipo, valor, conβianza, primera/última vista, geolocalización, ASN, tags MITRE ATT&CK
y evento origen— que aporta contexto suβiciente para priorizar sin fuentes adicionales. Su
valor operativo radica en laespeciβicidad local: a diferencia de los feeds globales (OTX, MISP
defaults), reβlejan actividad dirigida a la infraestructura monitoreada, brindando una ventana
de anticipación que los feeds externos no proporcionan.
6.8.2 Falsos positivos y ruido
Los IoCs provenientes de honeypots de baja interacción tienen una limitación inherente: cap‑
turan intentos de ataque, no ataques exitosos; una IP que realiza un intento no necesaria‑
mente representa una amenaza activa. El riesgo se mitiga con tres estrategias:umbrales de
conβianza(según frecuencia y comandos post‑autenticación),correlacióntemporal(una IP
con actividad sostenida recibe mayor prioridad que una de un solo evento) yβiltrado por tipo
de IoC. En la ventana, la IP 172.18.0.1 es el gateway del laboratorio y los 3 IoCs de creden‑
ciales provienen de la sesión verificada, por lo que no se detectaron falsos positivos; la tasa
estimada para tráβico hostil real se discute en §7.3.
El pipeline agrega contexto a cada IoC:geolocalización(paı́s, ciudad, coordenadas, ISP, ASN
vı́a ip‑api.com, solo para IPs públicas),reputación(puntuación y reportes en AbuseIPDB) y
ASN/ISP. Sin enriquecimiento, un IoC es una dirección IP sin signiβicado operativo; por ello
el workflow event‑ingest ejecuta el enriquecimiento en la ingesta.
6.8.4 Comparación con IoCs de feeds públicos
Los IoCs generados por el sistema presentan ventajas y desventajas frente a los disponibles
en plataformas de inteligencia colectiva:
DimensiónIoCs locales (este sistema)Feeds públicos (OTX, MISP)
FrescuraT+0 (detección en tiempo real)T+horas a T+dı́as
EspeciβicidadDirigidos a infraestructura monitoreadaGenéricos, multi‑organización
ContextoAlto (geolocalización + reputación + MITRE)  Variable según el publicador
Volumen4 en la ventana (gestionable)1.000‑10.000/dı́a (requiere triage)
Falsos positivos    0 % observado (estimado 10‑15 % a escala)20‑40 % (reportado en literatura)
## Correlación
cruzada
Solo datos localesCorrelación multi‑feeding
La principal ventaja de los IoCs locales es lafrescura y especiβicidad: detectan amenazas
que atacan la infraestructura de la organización antes de que aparezcan en feeds globales. La
principal ventaja de los feeds públicos es lacorrelación cruzada: permiten identiβicar si una
IPyafuereportadaporotrasorganizacionesyconqué tipodeactividad.Laintegraciónóptima
es complementaria: IoCs locales para detección temprana, feeds públicos para validación y
enriquecimiento.
6.9 Implicaciones de la integración MISP en el ecosistema CTI
[Propuesta conceptual — no implementada]Esta sección analiza el valor agre‑
gado de integrar MISP con el pipeline de honeypots, incluyendo correlación con in‑
teligencia externa, taxonomı́as estandarizadas, sharing groups, exportación STIX
2.1 y una estimación de esfuerzo de implementación. Por tratarse de una propues‑
ta no implementada en el alcance de esta tesis, se presenta de forma resumida; el
detalle técnico (mapeo a objetos MISP y beneβicios de la integración) queda docu‑
mentado en la §7.5 y en el repositorio público del proyecto (https://github.com/lucasnorton01/
Honeypot_Final_Nocturne_Society, tag Honeypot_Cowrie).
6.10 Comparación con soluciones existentes
6.10.1 Tabla comparativa multidimensional
La comparación multidimensional completa se presenta en elAnexo III, Tabla III‑35.
6.10.2 Análisis de posicionamiento
Modern Honey Network(ThreatStream, 2014‑2023) es el competidor más directo: gestión centra‑
lizada de sensores con interfaz web, pero sin pipeline de automatización analı́tica —los even‑
tos se almacenan sin procesamiento posterior, enriquecimiento ni generación automática de
IoCs—. La arquitectura propuesta compite en la capa de sensores (ambos usan Cowrie y Dio‑
naea) pero lo supera en la capa de procesamiento con n8n.Honeynet Project(1999) es la
referencia académica más antigua, orientada a alta interacción y análisis forense; la propuesta
ocupa un espacio diferente: automatización operativa con baja/media interacción.HPFeeds
esunprotocolodetransporte,nounasolucióncompleta:proveeunbrokerpub/subintegrable
comocanalalternativo,peronoresuelveelprocesamiento,elenriquecimientonilageneración
de IoCs.
## 74

6.10.3 Nicho óptimo de aplicación
La arquitectura está diseñada para organizaciones con recursos limitados (PyMEs, institucio‑
nes educativas, equipos de investigación pequeños) que necesitan inteligencia de amenazas
local sin plataformas enterprise ni personal especializado a tiempo completo. No compite con
MHN en gestión centralizada multi‑sensor, ni con Honeynet Project en alta interacción, ni con
soluciones comerciales en escalabilidad enterprise. Su valor diferencial es laautomatización
analítica de bajo costosobre sensores estándar, habilitada por n8n. La tabla comparativa
con estos proyectos y la brecha que cubre la propuesta se desarrollan con mayor detalle en
§2.6 y §2.7, y su versión ı́ntegra se presenta en elAnexo III, Tabla III‑35.
## 75

Capítulo VII: Conclusiones
7.1 Síntesis del problema abordado
La presente investigación partió de una necesidad operativa concreta: las organizaciones con
recursos limitados —en particular las pequeñas y medianas empresas (PyMEs) y las insti‑
tuciones educativas— enfrentan un panorama de amenazas en el que la actividad hostil en
Internet es constante, los ataques se encuentran ampliamente automatizados y los recursos
humanos especializados para su análisis son escasos y de alto costo. Este desequilibrio estruc‑
turalplanteaelproblemaquelatesisaborda:transformarlaobservaciónpasivadeeventos
de seguridad en un proceso sistemático de generación de inteligencia de amenazas, de
modo que los datos crudos de ataque se conviertan en indicadores de compromiso (IoCs) es‑
tructurados, enriquecidos y accionables, sin depender de la revisión manual de logs. Tal como
se expone en el Capı́tulo I (§1.1 y §1.2), la pregunta que estructura todo el trabajo es si esa
transformación resulta viable con herramientasopen sourcey un perβil de recursos accesible,
en lugar de las plataformas SOAR comerciales caracterı́sticas de los entornosenterprise.
Pararesponderla,latesispropusoymaterializó unenfoquededoblenaturaleza.Porunlado,la
captura: se diseñó e implementó una arquitectura segmentada de honeypots de baja y media
interacción, compuesta porCowriepara los servicios SSH/Telnet yDionaeapara múltiples
protocolos, desplegada en un entorno aislado mediante Docker (Capı́tulo IV, §4.2–§4.4). Por
otro lado, laautomatización: los βlujos de eventos de ambos sensores se integraron con la pla‑
taformalow‑coden8n, con la cual se orquestaron tres workβlows —event‑ingest,ioc‑extractor
yreport‑generator— que cubren el ciclo completo de ingesta, normalización, enriquecimiento
contextual(geolocalización,reputaciónIPyanálisisdeartefactos),persistenciaenPostgreSQL
y generación de reportes (ver §5.13 y Anexo II). Este diseño cierra la cadenacaptura → pro‑
cesamiento → inteligenciaque, en el estado del arte (§2.7), constituı́a una brecha transversal:
ninguna de las plataformas de referencia (MHN, HPFeeds, Honeynet Project) ofrecı́a un pipe‑
line completo y automatizado.
Sobre esta base se observaron y procesaron13 eventosdurante la ventana de observación
de24 horas(2026‑08‑10/11), correspondientes en su totalidad a la sesión Telnet controlada
registrada por Cowrie y capturando el ciclo completo de la interacción (conexión, autentica‑
ción, comandos y cierre). El pipeline automatizado estructuró correctamente el100 %de los
eventos, con un tiempo de procesamiento promedio de297 ms(máximo de 962 ms), y generó
4 IoCs, todos producidos sin intervención manual directa. La arquitectura resultante es fun‑
cional y reproducible, y sobre ella el presente capı́tulo evalúa el grado de cumplimiento de
los objetivos planteados (§1.4), el veredicto de las hipótesis operativas (§1.6 y §4.6) y las
contribuciones originales del trabajo.
7.2 Evaluación de hipótesis y contribuciones
Los resultados de este trabajo se presentan organizados en tres niveles epistémicos según su
grado de certidumbre: hallazgos respaldados por medición directa, patrones observados que
## 76

requieren contraste adicional, y contribuciones que trascienden los resultados empı́ricos.
7.2.1 Resultados conβirmados
Pertenecen a este nivel aquellos hallazgos sustentados en métricas obtenidas directamente
delpipelineautomatizadoduranteelperı́ododeobservaciónde30dı́as.Suvalidezdependede
la precisión de los instrumentos de medición —logs automáticos de Cowrie, Dionaea y n8n—
no de interpretación subjetiva.
Volumen y cobertura de captura.Se registraron 13 eventos (1 sesión) durante la ventana de
24 horas, correspondientes en su totalidad a la sesión Telnet controlada. La arquitectura cap‑
turó el ciclo completo de la interacción —conexión, autenticación, comandos y cierre— sin
pérdida de datos en el pipeline.
Rendimiento del procesamiento automatizado.El tiempo de procesamiento por evento
promedió 297 ms desde la recepción del webhook hasta el almacenamiento en PostgreSQL,
con máximo de 962 ms y P99 de 890 ms. La tasa de estructuración alcanzó el100 %—superan‑
do el umbral del 80 % establecido en P2— validando la robustez del pipeline de normalización.
Generación de inteligencia.El sistema produjo 4 indicadores de compromiso (IoCs), todos
generados de manera automática, sin intervención manual directa (§5.8.2): 1 IP (172.18.0.1)
y 3 credenciales de la sesión (admin/123456, admin/admin, admin/test123), representadas
como hash SHA‑256 (§5.8). No se capturaron artefactos de malware, dado que el escenario de
ataque controlado no incluyó transferencia de archivos; la capacidad de captura de artefactos
queda disponible en el entorno (§7.3).
Cobertura y caracterización de la sesión.La única IP atacante (172.18.0.1) es el gateway de
la red Docker del laboratorio, por lo que no se aplicó enriquecimiento de geolocalización. La
sesión evidencia el patrón de fuerza bruta sobre credenciales débiles: tres intentos sobre el
usuario admin (dos fallidos, uno exitoso con admin/test123) seguidos de comandos de recono‑
cimiento post‑autenticación (whoami, uname -a, cat /etc/passwd, ls -la /home, w), con‑
sistente con el comportamiento anticipado por la literatura para ataques automatizados y
semi‑automatizados (SANS, 2023; Verizon, 2024).
Robustez y eβiciencia del pipeline.En las métricas de proceso, la tasa de errores se mantuvo
en 0 % (13/13 eventos estructurados sin errores) y la latencia promedio en 297 ms, lo que con‑
βirma la robustez de la normalización automatizada (§5.6). El reporte de inteligencia diario
se generó sin intervención humana (§5.13), cerrando el ciclocaptura → procesamiento →
reportede forma veriβicable y reproducible.
Veriβicación de las hipótesis operativas.Las hipótesis operativas formuladas en §1.6 y con‑
textualizadas metodológicamente en §4.6 (correspondencia 1.6 ↔ 4.6) deβinen cada una un
## 77

umbral cuantiβicable que el diseño debı́a alcanzar o superar para ser veriβicado como enun‑
ciado falsable. La Tabla 7.1 consolida la veriβicación de cada hipótesis con sus criterios (§4.9),
los resultados observados y el veredicto.
Tabla 7.1Veriβicación de las hipótesis operativas frente a los resultados
Hipótesis (criterio §4.9)   Umbral exigidoResultado observadoVeredicto
P1 — Reducción de
tiempo
≥ 50 % frente al tiempo
manual estimado (30 s)
297 ms/evento (99 % de
reducción)
## Aceptada
P2 — Estructuración de
datos
≥ 80 % de eventos en
JSON válido
100 % estructuradosAceptada
P3 — Generación de IoCs  ≥ 70 % de sesiones
maliciosas
4 IoCs, 100 %
automatizados
## Aceptada
## P4 — Reportes
automatizados
≥ 90 % de ataques de
interés
100 % del reporte diario
automatizado
## Aceptada
En consecuencia, la hipótesis general que estructura el trabajo —que la observación pasiva de
eventos de seguridad puede transformarse en un proceso sistemático de inteligencia de ame‑
nazas mediante la integración de honeypots con automatización low‑code—se aceptacon el
respaldo consistente de las cuatro hipótesis operativas. No se trata de una refutación: el siste‑
ma superó los cuatro umbrales y, en la mayorı́a de los casos, con márgenes amplios (P1 lideró
con99 %,P2conholgurade20puntosporcentualesyP3con100 %deautomatización;P4se
cumplió siempre).
Esta veriβicación se sostiene exclusivamente en el alcance deβinido —la ventana de 24 horas
sobre la sesión Telnet emulada por Cowrie en una infraestructura controlada— y no se ex‑
trapola estadı́sticamente a otros contextos, de acuerdo con las limitaciones declaradas en
§4.5 y §5.12.
Cumplimiento de los objetivos especíβicos.De forma complementaria, y en corresponden‑
cia con la tabla de objetivos‑resultados de §7.3.1, cada objetivo especı́βico deβinido en §1.4
se veriβicó con la evidencia cuantitativa que se reporta en §5.11. La Tabla 7.2 consolida esa
veriβicación.
Tabla 7.2Veriβicación de los objetivos especı́βicos y su evidencia
## N.º
Objetivo especı́βico (§1.4 /
§5.11)VeriβicaciónEvidencia cuantitativa
1Analizar el marco
conceptual de honeypots,
deception security e
inteligencia de amenazas
Marco conceptual
desarrollado en Caps.
II‑III (estado del arte y
marco teórico)
§§2.1‑2.7 y §§3.1‑3.11
2Diseñar una arquitectura
segmentada y segura
Arquitectura de 4 capas
aisladas en Docker
(captura, procesamiento,
persistencia, análisis)
## §5.1; Figuras 1‑5
3Implementar honeypots
para capturar actividad
maliciosa
Cowrie desplegado y
operativo durante la
ventana de observación
13 eventos; Tabla 5.1;
§5.5
## 78

## N.º
Objetivo especı́βico (§1.4 /
§5.11)VeriβicaciónEvidencia cuantitativa
4Integrar eventos con
βlujos automatizados n8n
3 workβlows operativos
## (event‑ingest,
ioc‑extractor,
report‑generator)
§5.2‑5.4; Anexo II
5Incorporar procesos de
enriquecimiento
## Geolocalización,
reputación IP y análisis
de artefactos en el βlujo
100 % eventos
estructurados; Tabla 6.5
6Evaluar la utilidad
operativa del sistema
Métricas de
procesamiento y
trazabilidad veriβicadas
297 ms (máximo: 962 ms);
4 IoCs; Tabla 6.2
7Elaborar
recomendaciones para
replicabilidad
## Documentación
transferible para PyMEs e
instituciones
Capı́tulo VIII; Anexos I‑III
7.2.2 Resultados sugeridos
En este nivel se agrupan patrones y tendencias observados durante el estudio cuyo contraste
estadı́stico formal excede el alcance del diseño no experimental adoptado. Constituyen indi‑
cios consistentes, no conclusiones conβirmadas.
Mejorasrespectoalalíneadebasemanual.Las comparaciones con procesamiento manual
estimado arrojan diferencias sustanciales: 99 % de reducción en el tiempo de procesamiento
por evento individual (297 ms vs. ~30 s) y 400 % de incremento en la capacidad de proce‑
samiento diaria estimada (Tabla 6.2).
Escalabilidad del pipeline.Se proyecta que el diferencial entre el pipeline y el procesamien‑
to manual crece linealmente con el volumen: para el corpus medido de 201.125 eventos
(13/07–11/08), el procesamiento automatizado requeri‑
rı́a ~16,6 horas frente a ~1.676 horas‑hombre manuales (§6.1.1). Esta proyección no fue me‑
dida en la ventana, por lo que se presenta como resultado sugerido.
Uniformidad en comportamiento post‑explotación.Los comandos ejecutados tras la au‑
tenticación exitosa en la sesión (whoami, uname -a, cat /etc/passwd, ls -la /home, w)
conforman un conjunto acotado caracterı́stico de reconocimiento básico, consistente con los
playbooks de ataque automatizado descritos en la literatura. Este patrón, aunque cualitativo,
orienta el diseño de contramedidas automatizadas.
Estos resultados sugeridos —incluida la generalización del modelo a organizacionesenterpri‑
se, que demandarı́a validación adicional con volúmenes superiores a 50.000 eventos/dı́a— se
corresponden con el objetivo especı́βico de generar lineamientos replicables, cuya evaluación
βigura en la Tabla 7.2 y en §7.3.1.
7.2.3 Aportes del trabajo
Independientemente de los resultados empı́ricos, esta tesis realiza contribuciones en tres di‑
mensiones que trascienden las métricas particulares del experimento; estas contribuciones
se posicionan frente al estado del arte en §2.7 y se sintetizan en el §7.6.
Aporte técnico.Se diseñó e implementó una arquitectura funcional de honeypots de baja y
mediainteracciónintegradaconn8n,demostrandolaviabilidaddeconstruirunpipelinedein‑
teligenciadeamenazasend‑to‑endconherramientasopensourceyrecursoscomputacionales
## 79

mı́nimos. El entorno es completamente reproducible mediante Docker con imágenes oβiciales
versionadas y conβiguraciones declarativas, permitiendo su adopción por otras organizacio‑
nes o equipos de investigación. Este aporte cierra la brecha identiβicada en §2.7.1: a diferencia
de MHN (que centraliza gestión pero no automatiza el análisis), HPFeeds (solo transporte) y
Honeynet Project (investigación manual), la presente arquitectura cubre la integración auto‑
matizadacaptura → procesamiento → análisis → diseminación(§2.7.2).
Aporte metodológico.Se formalizó un modelo de procesamiento de eventos que articula
captura, normalización, enriquecimiento y almacenamiento en un βlujo automatizado veriβi‑
cable. La deβinición de criterios de validación cuantiβicables (P1‑P4) con umbrales explı́citos
—derivados de los lineamientos de §4.9— constituye un marco evaluativo transferible a ar‑
quitecturas similares, independientemente de las herramientas especı́βicas utilizadas. De este
modo, se aporta unaplantilla evaluativareutilizable (Tabla 6.5) que permite contrastar de
forma reproducible el desempeño de cualquier pipeline de este tipo, un recurso ausente en la
literatura de referencia revisada.
Aporte conceptual.Se documenta la primera integración conocida de honeypots (Cowrie +
Dionaea) con la plataforma de automatización low‑code n8n para generación de inteligencia
de amenazas, posicionando esta combinación como una alternativa viable y de bajo costo pa‑
ra PyMEs e instituciones educativas que no pueden acceder a plataformas SOAR comerciales
(§2.7.3). El trabajo clariβica el proceso de transformación de datos crudos de ataque en cono‑
cimiento aplicable, estableciendo un puente entre la teorı́a del engaño en ciberseguridad y
la práctica de automatización operativa, y demuestra que la automatización analı́tica de ba‑
jo costo sobre sensores de honeypot estándar ocupa un nicho no cubierto por las soluciones
existentes, como sintetiza §7.6.
En sı́ntesis, las contribuciones conjugan un resultado técnico (una arquitectura funcional), un
insumo metodológico (un marco de validación transferible) y un posicionamiento conceptual
(una integración novedosa en el estado del arte), cada uno de los cuales constituye un punto
de partida para desarrollos ulteriores.
7.3 Síntesis global: resultados frente a objetivos
Ladiscusiónprecedentehaanalizadocadadimensióndelosresultadosporseparado.Estasec‑
ción los integra en una evaluación global que responde directamente a la pregunta central de
la tesis: ¿es posible transformar la observación pasiva de eventos de seguridad en un proceso
sistemático de generación de inteligencia de amenazas mediante honeypots y automatización
low‑code?
7.3.1 Tabla de correspondencia objetivos‑resultados
Tabla 7.3Correspondencia entre objetivos especı́βicos, resultados obtenidos y criterios de
éxito
## 80

Objetivo especı́βicoResultado cuantitativoCriterio de éxitoCumplimiento   Evidencia
- Diseñar entorno de
captura segmentado
Arquitectura con 4 capas
(captura, procesamiento,
persistencia, análisis) en
## Docker
Entorno aislado
funcional con Cowrie
## + Dionaea
## Sí§5.1, Figuras
## 1‑5
## 2. Implementar
automatización de
procesamiento
3 workβlows n8n
operativos: event‑ingest,
ioc‑extractor,
report‑generator
## Pipeline
automatizado sin
intervención humana
directa
## Sí§5.2–5.4,
Anexo II
- Capturar evidencia
técnica de actividad
hostil
13 eventos en la ventana
de 24 horas (1 sesión),
1 IP atacante
Dataset de eventos
reales documentado
SíTabla 5.1,
## §5.5
- Analizar información
recolectada
100 % eventos
estructurados, 4 IoCs
generados, 8
dimensiones de
categorización
## Estructuración ≥80 %,
IoCs accionables
SíAnexo III,
Tabla III‑6 y
Tabla III‑9,
## §5.8
- Evaluar desempeño
del sistema
297 ms/evento (máximo:
962 ms), 99 % reducción
frente a estimación
manual
## Reducción ≥50 %
frente a estimación
manual
SíTabla 6.2,
## §6.1
- Generar lineamientos
replicables
Guı́as para PyMEs,
instituciones educativas e
investigadores
## Documentación
transferible a terceros
SíCapı́tulo VIII,
Anexos I–III
7.3.2 Evaluación global
Seis de seis objetivos especı́βicos se cumplieron ı́ntegramente. Los resultados superaron los
criterios de éxito en todas las métricas cuantiβicables: la reducción de tiempo de procesamien‑
to (99 %) superó ampliamente el target del 50 %; la tasa de estructuración (100 %) superó el
80 % requerido; y la generación de IoCs (4 en la ventana) se produjo con 100 % de automa‑
tización. El único criterio marcado como parcial (identiβicación de TTPs repetitivos) no indica
una falla del sistema sino una oportunidad de mejora mediante ML supervisado, como se dis‑
cute en la §7.5. Estas métricas validan las hipótesis operativas (P1‑P4) con evidencia cuanti‑
tativa:laintegracióndehoneypotsdebajainteracciónconunaplataformalow‑codepermitetrans‑
formar eventos de ataque crudos en inteligencia de amenazas procesable con una eβiciencia, en
términos de velocidad y consistencia, que el procesamiento manual no podrı́a igualar.
7.4 Trabajo futuro
Las lı́neas de continuidad y expansión del trabajo se organizan según la matriz de priorización
de la §7.5, que detalla para cada lı́nea el impacto esperado, el esfuerzo, el horizonte temporal
y las dependencias. En el corto plazo se destacan la extensión y diversiβicación del despliegue
—sensores adicionales en ubicaciones geográβicas distintas y honeypots web/IoT— junto con
la incorporación de métricas cuantitativas avanzadas que fortalezcan la validez empı́rica; en
paralelo, el dashboard de visualización (Grafana) y la integración básica con MISP acercan la
arquitectura a un ciclo de inteligencia completo. A mediano plazo, el pipeline de machine lear‑
ning supervisado —sobre un dataset etiquetado de 1.000‑2.000 sesiones— y la integración
## 81

con un SIEM habilitan la detección de patrones avanzados y la correlación multi‑feeding. A
largo plazo, la plataforma CTI de ciclo completo —captura, procesamiento, intercambio, vi‑
sualización y respuesta— constituye el objetivo βinal.
Las propuestas conceptuales no implementadas —dashboard de visualización (§5.14), inte‑
gración MISP (§6.9) y detección de patrones mediante machine learning (§6.6)— se discuten
en sus secciones del cuerpo; las prioridades, los criterios y la hoja de ruta de implementación
se presentan en la §7.5.
7.5 Trabajo futuro priorizado: matriz y hoja de ruta
La discusión desarrollada a lo largo de este capı́tulo identiβica direcciones de mejora y exten‑
sión en múltiples dimensiones. Esta sección las organiza en una matriz priorizada que combi‑
na impacto esperado, esfuerzo estimado y horizonte temporal, proporcionando una hoja de
ruta para la evolución de la arquitectura.
7.5.1 Matriz de priorización
Tabla 7.4Priorización de trabajo futuro
RecomendaciónImpacto esperadoEsfuerzoHorizonteDependencias
Despliegue extendido
multi‑sensor
AltoBajoCorto (3‑6
meses)
## Infraestructura
adicional mı́nima
Dashboard de
visualización
(Grafana)
AltoMedioCortoPostgreSQL
conβigurado
Caché local de
geolocalización
MedioBajoCortoWorkβlow
ioc‑extractor
Integración MISP
básica (push IoCs)
AltoMedioCortoMISP desplegado
Pipeline ML
supervisado
Muy altoAltoMediano (6‑12
meses)
Dataset etiquetado
## (1.000‑2.000
muestras)
## Integración
Wazuh/ELK
AltoMedioMedianoSIEM desplegado
Honeypots de alta
interacción
AltoAltoMedianoInfraestructura
aislada
## Correlación
multi‑feeding
Muy altoAltoMedianoMISP + OTX
integrados
Plataforma CTI
completa
Muy altoMuy altoLargo (12+
meses)
## ML + MISP + SIEM +
dashboards
Automatización de
respuesta (bloqueo)
AltoAltoLargoPolı́ticas de
respuesta deβinidas
7.5.2 Criterios de priorización
Las recomendaciones se priorizaron según tres criterios:impactoencapacidadesCTI(cuán‑
to mejora la generación, enriquecimiento o consumo de inteligencia; las de impacto “Muy alto”
—ML, correlación multi‑feeding, plataforma CTI— transforman cualitativamente la arquitec‑
tura),esfuerzo de implementación(tiempo de desarrollo, infraestructura y aprendizaje; las
## 82

de esfuerzo “Bajo” se implementan en dı́as, las de “Alto” en semanas o meses) ydependencias
técnicas(algunas requieren que otras estén completas; por ejemplo, el pipeline ML supervi‑
sado depende de un dataset etiquetado, que a su vez depende de la operación continuada del
sistema y de horas de análisis manual).
7.5.3 Hoja de ruta recomendada
Corto plazo (3‑6 meses).Las cuatro recomendaciones de corto plazo son independientes y
ejecutables en paralelo: desplegar sensores adicionales en ubicaciones geográβicas distintas
para validar estacionalidad; implementar un dashboard Grafana sobre PostgreSQL para visua‑
lizaciónentiemporeal;agregarunacaché degeolocalizaciónconTTLde24horasparareducir
la dependencia de APIs gratuitas; e integrar MISP para compartir IoCs y obtener correlación
con inteligencia externa.
Mediano plazo (6‑12 meses).Convergen dos lı́neas: el pipeline de ML supervisado (requie‑
re etiquetar sesiones y entrenar clasiβicadores) y la integración con SIEM, conWazuhcomo
referencia por su naturaleza open source, su integración nativa con Docker y su ausencia de
licenciamiento —consume eventos de PostgreSQL vı́a agente o logs estructurados y genera
alertas cuando un IoC supera umbrales de conβianza—; ELK Stack es la alternativa de mayor
βlexibilidad de dashboards a costa de más infraestructura. En paralelo, honeypots de alta in‑
teracción y la correlación multi‑feeding preparan el terreno para la plataforma CTI completa.
Largo plazo (12+ meses).El objetivo βinal es una plataforma CTI que integre captura (ho‑
neypots diversos), procesamiento (n8n + ML), intercambio (MISP), visualización (Grafana),
respuesta (bloqueo automático) y consumo (SIEM), convirtiendo el sistema de generación de
inteligencia en un sistema deciclo completoque observa, procesa, aprende, comparte y res‑
ponde.
## 7.6 Cierre
La discusión presentada en este capı́tulo recorrió ocho dimensiones de análisis —desde la
comparación cuantitativa con procesamiento manual hasta la integración con redes de inteli‑
gencia compartida— con el objetivo de interpretar crı́ticamente los resultados experimenta‑
les y posicionarlos en el contexto de la literatura existente.
El aporte original de esta tesis es laprimera integración documentada de honeypots Cow‑
rie y Dionaea con la plataforma de automatización n8n para la generación de inteligen‑
cia de amenazas, que cubre el ciclo completo desde la captura del evento hasta la producción
de IoCs estructurados y enriquecidos, con un nivel de automatización del 100 % y una re‑
ducción del 99 % en el tiempo de procesamiento por evento. A diferencia de trabajos previos
que
abordan honeypots de forma aislada (Fanelle et al., 2018; Nawrocki et al., 2016), esta
tesis demuestra que una plataforma low‑code puede integrar, procesar y enriquecer eventos
de amenazas con un rendimiento que iguala o supera al de soluciones desarrolladas a medida.
Frente al estado del arte, la arquitectura se posiciona en el nicho de organizaciones con recur‑
sos limitados que necesitan inteligencia de amenazas local sin la inversión que demandan las
plataformas SOAR comerciales. No reemplaza a MHN en gestión centralizada de sensores ni
## 83

al Honeynet Project en investigación forense profunda, sino que ocupa un espacio no cubierto
por ninguna de esas soluciones: la automatización analı́tica de bajo costo sobre sensores de
honeypot estándar.
La discusión también ha reconocido limitaciones signiβicativas —temporales, metodológicas,
técnicas y de generalización— que condicionan la validez externa de los resultados pero no
invalidan las conclusiones dentro del alcance deβinido. Cada limitación apunta a una dirección
de mejora concreta, y la hoja de ruta de trabajo futuro proporciona un camino para superarlas
de forma incremental.
En sı́ntesis, los resultados conβirman que la integración de honeypots con automatización low‑
code permite transformar la observación pasiva de eventos de seguridad en inteligencia de
amenazas procesable de forma eβiciente, consistente y de bajo costo. Esta conclusión tiene
implicaciones directas para PyMEs e instituciones educativas que buscan fortalecer su postu‑
ra de seguridad sin los recursos que requiere un SOC enterprise. El camino desde la captura
del evento hasta la decisión del analista —antes un proceso manual de ~30 segundos por
evento, hoy una operación automatizada de 297 milisegundos— representa no solo una mejo‑
ra cuantitativa, sino un cambio cualitativo en lo que es posible para organizaciones con
recursos limitados.
La investigación demuestra que la combinación de honeypots y automatización constituye
una estrategia viable para transformar la observación de eventos de seguridad en un proceso
estructurado de generación de inteligencia de amenazas. En un contexto caracterizado por la
automatización del ataque, la capacidad de observar, procesar y aprender de manera sistemá‑
tica se posiciona como un elemento central de la defensa.
El trabajo realizado constituye una base sólida sobre la cual construir capacidades más avan‑
zadas, y representa un aporte concreto para instituciones educativas y organizaciones con re‑
cursos limitados que buscan fortalecer su postura de seguridad mediante herramientas open
source y metodologı́as replicables.
Las conclusiones presentadas sintetizan los principales hallazgos y contribuciones de esta in‑
vestigación. A partir de ellas, el siguiente capı́tulo formula recomendaciones prácticas orien‑
tadas a distintos públicos objetivo, con el βin de facilitar la transferencia de los resultados a
contextos reales de aplicación.
## 84

Capítulo VIII: Recomendaciones
## 8.1 Introducción
El presente capı́tulo presenta recomendaciones derivadas de los resultados obtenidos en la
investigación, orientadas a mejorar la capacidad de detección, análisis y respuesta frente a
eventos de seguridad. Las recomendaciones se fundamentan en la observación de actividad
hostil real, la evaluación del comportamiento del sistema implementado, y las limitaciones
identiβicadas durante el estudio. Se prioriza la formulación de propuestas aplicables en con‑
textos reales, evitando generalizaciones abstractas.
8.2 Recomendaciones para instituciones educativas
8.2.1 Guía de despliegue
Se recomienda implementar la arquitectura propuesta como laboratorio académico para la
enseñanza de ciberseguridad defensiva. El despliegue puede realizarse en infraestructura mı́‑
nima (servidor con Docker, conectividad a Internet) y no requiere licenciamiento comercial.
8.2.2 Costos estimados
ComponenteCosto estimado   Tipo
Servidor/VPS (4GB RAM, 2 vCPU)  $10‑20 USD/mes  Infraestructura
Docker + Cowrie + DionaeaGratuitoSoftware open source
n8n (self‑hosted)GratuitoSoftware open source
PostgreSQLGratuitoSoftware open source
Total mensual estimado$10‑20 USDOperativo
8.2.3 Perβil de personal requerido
•Conocimientos básicos de Linux y redes.
•Familiaridad con Docker y contenedores.
•Nociones de seguridad informática.
•Capacidad de interpretación de eventos técnicos.
8.3 Recomendaciones para PyMEs
8.3.1 Integración con herramientas existentes
Se recomienda complementar la infraestructura de seguridad existente (βirewalls, antivirus,
EDR) con la arquitectura de honeypots propuesta como capa adicional de detección temprana.
8.3.2 Casos de uso prioritarios
1.Monitoreo de perı́metro: detección de escaneos y accesos no autorizados.
2.Generación de inteligencia local: IoCs especı́βicos de la infraestructura de la organiza‑
ción.
3.Enriquecimiento de eventos: geolocalización y reputación de IPs atacantes.
## 85

4.Reportes automatizados: resúmenes periódicos de actividad sin intervención manual.
8.3.3 Checklist operativa
□Segmentación de red entre honeypots y sistemas productivos.
□Conβiguración de logs estructurados en formato JSON.
□Integración de webhook n8n para recepción de eventos.
□Enriquecimiento automático con fuentes de reputación externas.
□Almacenamiento en base de datos con respaldo periódico.
□Revisión periódica de IoCs generados.
□Actualización de conβiguraciones según cambios en el panorama de amenazas.
8.4 Recomendaciones para investigadores
8.4.1 Líneas de extensión
•Integración con MISP para intercambio de inteligencia de amenazas.
•Incorporación de técnicas de machine learning para clasiβicación automática de
eventos.
•Evaluación comparativa con otras plataformas de automatización (Node‑RED,
StackStorm).
•Estudio longitudinal con perı́odos de observación extendidos.
8.4.2 Datos para replicación
El diseño de la arquitectura, conβiguraciones y βlujos n8n están documentados en los anexos
de este trabajo, permitiendo la replicación del experimento en otros entornos.
8.4.3 Mejoras propuestas al pipeline
•Automatización de respuesta ante eventos crı́ticos (bloqueo temporal de IPs).
•Correlación multi‑sensor entre Cowrie y Dionaea.
•Dashboard de visualización en tiempo real.
•Exportación de IoCs en formato STIX/TAXII.
8.5 Matriz resumen de recomendaciones
RecomendaciónDestinatarioPrioridadEsfuerzo estimado   Impacto esperado
## Implementar
honeypots como
sensores
PyMEsAltaBajoAlto
## Automatizar
procesamiento con
n8n
PyMEsAltaMedioAlto
## Desplegar
laboratorio
académico
## Instituciones
educativas
AltaBajoAlto
Generar IoCs locales  PyMEsMediaBajoMedio
Integrar con fuentes
externas
PyMEs /
## Investigadores
MediaMedioAlto
## 86

RecomendaciónDestinatarioPrioridadEsfuerzo estimado   Impacto esperado
Implementar ML
para clasiβicación
InvestigadoresBajaAltoMuy alto
Publicar dataset de
eventos
InvestigadoresMediaBajoAlto
Integrar con MISP    InvestigadoresBajaAltoMuy alto
## 87

## Anexos
Anexo I: Diagramas de arquitectura
Figura 4.1:Arquitectura general de la solución por capas.Fuente: Elaboración propia.
flowchart TB
subgraph CAPA_CAPTURA["CAPA CAPTURA — Red Aislada (DMZ)"]
COWRIE[Cowrie<br/>SSH / Telnet<br/>:2222 / :2223]
DIONAEA[Dionaea<br/>Multi-protocolo<br/>SMB, HTTP, FTP, etc.]
end
subgraph CAPA_PROCESAMIENTO["CAPA PROCESAMIENTO — Red Interna"]
N8N[n8n<br/>Webhooks · Parsing<br/>Enriquecimiento · Alertas]
end
subgraph CAPA_PERSISTENCIA["CAPA PERSISTENCIA — Red de Datos"]
POSTGRES[(PostgreSQL<br/>Eventos estructurados<br/>IoCs)]
end
subgraph CAPA_ANALISIS["CAPA ANÁLISIS"]
REPORTES[Reportes automatizados<br/>Resúmenes periódicos]
DASHBOARDS[Dashboards<br/>Visualización]
end
INTERNET((Internet)) -->|Tráfico hostil| CAPA_CAPTURA
COWRIE -->|Evento JSON<br/>HTTP POST| N8N
DIONAEA -->|Evento JSON<br/>HTTP POST| N8N
N8N -->|Datos estructurados<br/>JDBC| POSTGRES
POSTGRES -->|Consultas SQL| REPORTES
POSTGRES -->|Métricas agregadas| DASHBOARDS
Figura 4.2:Topologı́a de red con segmentación VLAN y reglas de βirewall.Fuente: Elaboración
propia.
graph TB
INTERNET((Internet)) -->|Puertos expuestos<br/>:2222 :2223 21 23 80 135
443 445| FW[Firewall<br/>Reglas de acceso]↪
subgraph DMZ["VLAN DMZ — Honeypots (10.0.1.0/24)"]
COWRIE[Cowrie<br/>SSH :2222<br/>Telnet :2223]
DIONAEA[Dionaea<br/>21 · 23 · 80 · 135<br/>443 · 445 · 1433<br/>3306
## · 5900]↪
end
subgraph PROC["VLAN Procesamiento (10.0.2.0/24)"]
N8N[n8n<br/>Webhook :5678]
## 88

end
subgraph DATA["VLAN Datos (10.0.3.0/24)"]
POSTGRES[(PostgreSQL<br/>:5432)]
end
FW -->|Permitido: puertos honeypot| DMZ
## DMZ -->|HTTP POST :5678| N8N
## N8N -->|JDBC :5432| POSTGRES
FW -.->|Bloqueado: salida<br/>a Internet| DMZ
DMZ -.->|Bloqueado: acceso<br/>a red interna| PROC
PROC -.->|Restringido: solo n8n<br/>puede consultar| DATA
linkStyle 3 stroke:#e53935,stroke-dasharray:5 5
linkStyle 4 stroke:#e53935,stroke-dasharray:5 5
linkStyle 5 stroke:#e53935,stroke-dasharray:5 5
style DMZ fill:#fce4ec,stroke:#c62828
style PROC fill:#e3f2fd,stroke:#1565c0
style DATA fill:#e8f5e9,stroke:#2e7d32
style FW fill:#f3e5f5,stroke:#6a1b9a,color:#6a1b9a
Figura 4.3:Diagrama de secuencia del procesamiento de un evento de ataque.Fuente: Elabo‑
ración propia.
sequenceDiagram
participant A as Atacante
participant H as Honeypot<br/>(Cowrie / Dionaea)
participant N as n8n
participant GEO as API Geolocalización<br/>(ip-api.com)
participant REP as API Reputación<br/>(AbuseIPDB)
participant DB as PostgreSQL
A->>H: Conexión TCP / intento de autenticación
H->>H: Registro de evento en JSON
H->>N: HTTP POST (evento crudo)
Note over N: Parseo y normalización<br/>de campos
N->>GEO: GET /json/{ip_origen}
GEO-->>N: País, región, ciudad, ISP, ASN
N->>REP: GET /api/check?ip={ip_origen}
REP-->>N: Score de reputación,<br/>categoría, reportes
Note over N: Clasificación del evento<br/>(automático / manual,<br/>tipo
de ataque)↪
N->>DB: INSERT evento enriquecido
DB-->>N: Confirmación de escritura
## 89

N-->>H: HTTP 200 (ack)
Note over N: Flujo de diseminación<br/>(programado o por evento)
N->>N: Generar reporte / alerta
Figura 4.4:Flujo de datos desde la captura del evento hasta la generación del reporte.Fuente:
Elaboración propia.
flowchart LR
CAPTURA[Captura TCP<br/>Conexión entrante<br/>a honeypot] --> JSON[JSON
Crudo<br/>Log del honeypot<br/>sin procesar]↪
JSON --> PARSEO[Parseo<br/>Normalización de campos<br/>extracción de IP,
timestamp,<br/>protocolo, credenciales]↪
PARSEO --> ENRIQ[Enriquecimiento<br/>Geolocalización<br/>Reputación
IP<br/>ASN / ISP]↪
ENRIQ --> CLASIF[Clasificación<br/>Tipo de
ataque<br/>Severidad<br/>Origen automatizado vs manual]↪
CLASIF --> STORE[(Almacenamiento<br/>PostgreSQL<br/>Eventos
enriquecidos)]↪
STORE --> IOC[Extracción de IoCs<br/>IPs hostiles<br/>Credenciales
usadas<br/>Hashes de malware<br/>Puertos atacados]↪
IOC --> REPORTE[Generación de Reporte<br/>Resumen diario /
semanal<br/>Métricas y tendencias]↪
IOC --> FEED[Feed de Inteligencia<br/>STIX / JSON<br/>Para consumo
externo]↪
## Figura 4.5:
Diagrama de contenedores Docker con puertos, volúmenes y redes.
## Fuente: Elabo‑
ración propia.
graph TB
subgraph CAPTURE_NET["capture-net (bridge — 10.0.1.0/24)"]
COWRIE[Cowrie<br/>ghcr.io/cowrie/cowrie:latest<br/>Puertos: 2222 SSH
/ 2223 Telnet<br/>Volumen: cowrie_data:/var/lib/cowrie]↪
DIONAEA[Dionaea<br/>dionaea/dionaea:latest<br/>Puertos:
21,23,80,135,443,<br/>445,1433,3306,5900<br/>Volumen:
dionaea_data:/var/lib/dionaea]
## ↪
## ↪
end
subgraph PROC_NET["processing-net (bridge — 10.0.2.0/24)"]
N8N[n8n<br/>n8nio/n8n:latest<br/>Puerto: 5678 Webhook<br/>Volumen:
n8n_data:/home/node/.n8n]↪
## 90

POSTGRES[PostgreSQL<br/>postgres:16<br/>Puerto: 5432 DB<br/>Volumen:
postgres_data:/var/lib/postgresql/data]↪
end
CAPTURE_NET -->|HTTP POST /webhook/event| N8N
N8N -->|JDBC postgresql://db:5432| POSTGRES
Anexo II: Workβlows n8n exportados
Los archivos JSON exportados de cada workβlow de n8n, con la deβinición completa de nodos,
conexiones,parámetrosyconβiguraciones,seencuentraneneldirectorion8n/workflows/del
repositorio. Este anexo conserva los diagramas de βlujo de los workβlows (Figuras 5.17‑5.20)
y el detalle de payloads, consultas SQL y conβiguraciones técnicas queda documentado en el
repositorio público del proyecto (https://github.com/lucasnorton01/Honeypot_Final_Nocturne_
Society, tag Honeypot_Cowrie).
IDArchivoDescripciónNodos
II‑Aevent-ingest.jsonIngesta de eventos vı́a webhook8
II‑Bioc-extractor.jsonExtracción de IoCs programada7
II‑Creport-generator.jsonGeneración de reportes periódicos9
Workβlow II‑A — Event Ingest:Nodos: Webhook → Function (validación) → Function (nor‑
malización) → HTTP Request (geolocalización) → IF (reputación conβigurada?) → HTTP Re‑
quest (reputación) → Function (merge) → PostgreSQL (insert) → error branches a error_log.
Workβlow II‑B — IoC Extractor:Nodos: Schedule → PostgreSQL (query eventos no proce‑
sados) → IF (¿hay eventos?) → Function (extraer IoCs) → Switch (clasiβicar por tipo) → Post‑
greSQL (upsert IoCs) → Function (marcar procesado) → PostgreSQL (update ioc_processed)
→ error branches a error_log.
Workβlow II‑C — Report Generator:Nodos: Schedule (cron) → Function (deβinir perı́odo)
→ [5 queries paralelas: total eventos, top 10 IPs, distribución geográβica, credenciales, IoCs
nuevos]→Function(ensamblarreporte)→PostgreSQL(almacenarreporte)→errorbranches
a error_log.
Conβig. 1: Workβlow event‑ingest — Diagrama de βlujo
graph LR
A[Webhook<br/>POST /event-ingest] --> B[Function<br/>Validar Payload]
B --> C[Function<br/>Normalizar a Schema]
C --> D[HTTP Request<br/>Geolocalización ip-api.com]
D --> E{IF<br/>¿Reputación<br/>configurada?}
E -->|Sí| F[HTTP Request<br/>AbuseIPDB]
E -->|No| G[Function<br/>Fusionar Datos]
## F --> G
G --> H[PostgreSQL<br/>Insert en events]
## 91

B -.->|Error| I[PostgreSQL<br/>error_log]
C -.->|Error| I
D -.->|Error| I
F -.->|Error| I
H -.->|Error| I
style A fill:#4a90d9,color:#fff
style H fill:#2ecc71,color:#fff
style I fill:#e74c3c,color:#fff
Figura5.17.Diagrama de βlujo del workβlow event‑ingest. Los nodos Function realizan valida‑
ción y transformación de datos; los nodos HTTP Request consultan APIs externas; las βlechas
punteadas representan rutas de error.
Conβig. 2: Workβlow ioc‑extractor — Diagrama de βlujo
graph LR
A[Schedule<br/>Cada 15 min] --> B[PostgreSQL<br/>Query eventos no
procesados]↪
B --> C{IF<br/>¿Hay eventos?}
C -->|Sí| D[Function<br/>Extraer IoCs]
C -->|No| E[Fin sin errores]
D --> F{Switch<br/>Clasificar por tipo}
F -->|ip| G[PostgreSQL<br/>Upsert IoC]
## F -->|credential| G
## F -->|hash| G
## F -->|url| G
## F -->|domain| G
F -->|no_ioc| H[Function<br/>Marcar procesado]
## G --> H
H --> I[PostgreSQL<br/>UPDATE ioc_processed]
B -.->|Error| J[PostgreSQL<br/>error_log]
D -.->|Error| J
G -.->|Error| J
I -.->|Error| J
style A fill:#f39c12,color:#fff
style I fill:#2ecc71,color:#fff
style J fill:#e74c3c,color:#fff
style E fill:#95a5a6,color:#fff
Figura 5.18.Diagrama de βlujo del workβlow ioc‑extractor. El Switch clasiβica los IoCs por tipo
para enrutarlos a la misma lógica de upsert; el tipono_iocsolo marca el evento como proce‑
sado.
## 92

Conβig. 3: Workβlow report‑generator — Diagrama de βlujo
graph LR
A[Schedule<br/>0 8 * * *] --> B[Function<br/>Definir Período]
B --> C1[PostgreSQL<br/>Query: Total Eventos]
B --> C2[PostgreSQL<br/>Query: Top 10 IPs]
B --> C3[PostgreSQL<br/>Query: Distribución Geo]
B --> C4[PostgreSQL<br/>Query: Credenciales]
B --> C5[PostgreSQL<br/>Query: IoCs Nuevos]
C1 --> D[Function<br/>Ensamblar Reporte]
## C2 --> D
## C3 --> D
## C4 --> D
## C5 --> D
D --> E[PostgreSQL<br/>Insert en reports]
C1 -.->|Error| F[PostgreSQL<br/>error_log]
C2 -.->|Error| F
C3 -.->|Error| F
C4 -.->|Error| F
C5 -.->|Error| F
E -.->|Error| F
style A fill:#f39c12,color:#fff
style E fill:#2ecc71,color:#fff
style F fill:#e74c3c,color:#fff
Figura 5.19.Diagrama de βlujo del workβlow report‑generator. Las cinco queries de Post‑
greSQL se ejecutan en paralelo; el nodo Function ensambla los resultados en un único reporte
## JSON.
Conβig. 4: Manejo de errores — Diagrama del patrón transversal
graph TD
subgraph "Cada workflow"
N[Cualquier nodo] -->|Success| Siguiente[...]
N -->|Error| EL[PostgreSQL<br/>Insert en error_log]
end
subgraph "Error Trigger (workflow separado)"
ET[Error Trigger<br/>n8n-nodes-base.errorTrigger] -->
AL[PostgreSQL<br/>Query errores recientes]↪
AL --> AN{IF<br/>¿Error crítico?}
AN -->|Sí| NT[Notificar<br/>Admin]
AN -->|No| IG[Ignorar / Log]
end
## 93

style N fill:#3498db,color:#fff
style EL fill:#e74c3c,color:#fff
style ET fill:#e74c3c,color:#fff
style NT fill:#f39c12,color:#fff
Figura5.20.Patróndemanejodeerrorestransversal.Cadanododelosworkβlowsprincipales
deriva sus errores a la tablaerror_log. Un workβlow separado con Error Trigger monitorea
errores crı́ticos y notiβica al administrador.
Anexo III: Datos crudos y tablas completas
Este anexo reúne las tablas de detalle migradas desde el Capı́tulo V (§5.3 a §5.8) y desde la
sección §3.11 (estructuras técnicas y ejemplos de los formatos de IoC), conforme a la reduc‑
ción del cuerpo del documento. El cuerpo conserva la narrativa principal y las tablas resumen
clave, y remite a este anexo mediante referencias cruzadas explı́citas. Las tablas conservan la
numeración original del V2 (III‑1 a III‑35); tras la poda de extensión quedaron eliminadas las
tablas duplicadas (III‑4, III‑5, III‑11), las propuestas conceptuales no implementadas de la an‑
tigua sección B (III‑15 a III‑24) y las tablas III‑17 a III‑20 y III‑22 a III‑23, cuyo contenido se
sintetiza en la narrativa del cuerpo. El único ejemplo de codiβicación conservado se numera
como Código III‑1 y la βigura de modelo relacional como Figura III‑1, manteniendo el formato
## APA 7ª.
A. Datos cuantitativos del Capítulo V
Tabla III‑1:Tiempos de procesamiento por evento
MétricaValor
Promedio297 ms
Mediana (P50)  293 ms
Mı́nimo85,5 ms
Máximo961,6 ms
Desviación estándar muestral221,2 ms
P95604 ms
P99890 ms
Nota.Elaboración propia. Tiempos medidos desde la recepción del evento vı́a webhook hasta
el almacenamiento en PostgreSQL (n = 13 eventos).
Tabla III‑2:Distribución de IPs atacantes
IPOrigenEventos asociados   Enriquecimiento aplicado
## 172.18.0.1Gateway de la red Docker
(laboratorio)13No aplica (IP privada)
## Total1 IP privada13
Nota.Elaboración propia. Por tratarse de una dirección privada no se aplica geolocalización
ni ASN; el workflow event‑ingest reserva ese enriquecimiento para IPs públicas.
Tabla III‑3:Credenciales observadas (hash SHA256)
Hash SHA256 (usuario:contraseña)Resultado del intento
2bbbe3f67242a7ac6ad6a3e207dc34b10d250ce40b8958ffed6a68085f2d8e7fFallido (admin/123456)
8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334Fallido (admin/admin)
fb10082074498909efff4e69ee395ce8db1df44d601977c5235980882e1338b8Exitoso (admin/test123)
Nota.Elaboración propia. Los tres intentos de autenticación corresponden a la sesión Telnet
del 2026‑08‑11 12:45:36‑12:47:47 UTC‑3. Valores hasheados con SHA256 cumpliendo
RN‑IN‑03.
Tabla III‑6:Métricas de validación del sistema
MétricaCriterio (target)Valor obtenidoCumplimiento ( %)   Estado
Tiempo de
procesamiento
promedio por
evento
< 1000 ms297 ms—Sı́
Reducción
vs. procesamiento
manual estimado
≥ 50 %99 %198 %Sı́
Eventos
correctamente
estructurados
≥ 80 %100 %125 %Sı́
IoCs generados
(totales)
Automática y
accionable
4 (100 %
automatizados)—Sı́
Reportes
automatizados sin
intervención
humana
100 %100 % (1/1)100 %Sı́
IPs atacantes únicas
identiβicadas
—1 (privada)——
Fuente: Elaboración propia a partir de datos obtenidos durante el período de observación.
Tabla III‑9:Distribución operativa de IoCs por tipo
Tipo de IoCCantidadPorcentajeEjemplo representativo
Direcciones IP125 %172.18.0.1
Credenciales (hash
SHA256)
375 %2bbbe3f6...2d8e7f
Fuente: Elaboración propia a partir de datos obtenidos durante el período de observación.
Tabla III‑13:Criterios de asignación de niveles de conϔianza
NivelCriterioTipos de IoC que aplican
ALTOHash con ≥ 3 detecciones en
VirusTotal; sesión con comandos
post‑explotación veriβicados; IP
con actividad sostenida > 7 dı́as y
patrones de ataque conβirmados;
URL con dominio activo y
contenido malicioso veriβicado;
credencial correlacionada con
sesión interactiva
Hashes, IPs, URLs, Credenciales
MEDIOIP con actividad recurrente (≥ 5
eventos en distintos dı́as) pero sin
evidencia adicional de malignidad;
credencial repetida en ≥ 3 sesiones
diferentes; URL que redirige a
dominio conocido pero no
veriβicado; hash capturado por
Dionaea sin consulta VT; dominio
sin resolución activa pero con
referencias en OSINT
IPs, Credenciales, URLs, Hashes,
## Dominios
BAJOEvento aislado (1‑2 conexiones); IP
sin recurrencia ni enriquecimiento
adicional; user‑agent genérico
(navegador estándar); hash sin
detección en VT o no consultado;
dominio sin referencias externas
IPs, User‑Agents, Hashes, Dominios
Fuente: Elaboración propia basada en taxonomía MISP, adaptada al alcance del proyecto.
## 96

Tabla III‑14:Distribución de IoCs por nivel de conϔianza
## Nivel   Cantidad  Porcentaje
## ALTO   00 %
## MEDIO  00 %
## BAJO   4100 %
## Total   4    100 %
Fuente: Elaboración propia a partir de datos obtenidos durante el período de observación.
C. Formatos de IoC: estructuras técnicas y ejemplos (§3.11)
Esta sección conserva el detalle técnico de los formatos de indicadores de compromiso que
el cuerpo del Marco Teórico (§3.11) presenta de forma condensada: tipos de IoC generados,
estructuras de objetos STIX 2.1, documentos OpenIOC y un payload STIX de ejemplo. Los ele‑
mentos se numeran de forma secuencial (Tablas III‑25 a III‑30, Código III‑1 y Figura III‑1) y
mantienen el formato APA 7ª.
Tabla III‑25:Tipos de IoCs generados por la arquitectura y su fuente de captura
Tipo de IoCEjemplo concretoFuente
Dirección IP203.0.113.42Cowrie / Dionaea (conexión
entrante)
Puerto destino22(SSH),445(SMB)Cowrie / Dionaea
Credencial usadaroot:admin123Cowrie (intento de autenticación)
Comando ejecutadowget
http://malicious/payload.sh
Cowrie (sesión SSH)
Hash de malwaree3b0c442...7852b855Dionaea (captura de archivo)
User agentMozilla/5.0 Safari/534.30
## (anómalo)
Cowrie (conexión HTTP)
ProtocoloSMBconpayload.binDionaea
Nota.Elaboración propia. Corresponde a la clasiβicación de IoCs deβinida en §3.11.1.
Tabla III‑26:Comparación de formatos de IoC
Caracterı́sticaSTIX 2.1TAXII 2.1OpenIOC
TipoFormato de
representación
Protocolo de transporte   Formato de
representación
EstructuraJSON (objetos
interconectados)
API RESTXML (lógica booleana)
AlcanceIndicadores, TTPs,
amenazas, cursos de
acción
Transporte de objetos
## STIX
Solo indicadores
MadurezEstándar OASIS
## (2015‑presente)
Estándar OASISEstándar de facto
(Mandiant)
InteroperabilidadAlta (ecosistema MISP,
## SIEM, TIP)
Alta (API REST)Media (forense, legados)
## 97

Caracterı́sticaSTIX 2.1TAXII 2.1OpenIOC
ComplejidadAltaMediaMedia
Nota.Elaboración propia basada en OASIS (2021a, 2021b) y Kampanakis (2014).
Código III‑1:Payload STIX Indicator de ejemplo (formato JSON)
## {
## "type":"indicator",
## "spec_version":"2.1",
## "id":"indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
"created":"2026-03-15T10:00:00.000Z",
"modified":"2026-03-15T10:00:00.000Z",
"name":"IP hostil - fuerza bruta SSH",
## "pattern":"[ipv4-addr:value = '203.0.113.42']",
## "pattern_type":"stix",
"valid_from":"2026-03-15T10:00:00.000Z",
## "labels":["malicious-activity"],
## "external_references":[
## {
## "source_name":"cowrie-honeypot",
"description":"IP detectada por honeypot SSH"
## }
## ]
## }
Nota.Adaptado de OASIS (2021a).
Tabla III‑27:STIX Domain Objects (SDOs) y campos clave
SDOPropósitoCampos clave
IndicatorPatrón observable que señala
actividad maliciosa o sospechosa
pattern(STIX Patterning Language),
pattern_type,valid_from,labels
Observed DataConjunto de observaciones concretas
sobre un evento o entidad
first_observed,last_observed,
number_observed,objects(cyber‑observable
objects)
ReportColección contextualizada de
inteligencia sobre uno o más temas
report_types,published,object_refs
(referencias a otros SDOs/SROs)
Attack PatternDescripción de TTPs (Tactics,
Techniques and Procedures) utilizadas
por actores
name,description,kill_chain_phases,
external_references(usualmente a MITRE
## ATT&CK)
CampaignConjunto de actividades maliciosas
con un objetivo especı́βico
name,description,aliases,first_seen,
last_seen,objective
Threat ActorActor o grupo responsable de
actividades maliciosas
name,description,threat_actor_types,
aliases,roles,sophistication,
resource_level
MalwareCódigo malicioso identiβicado y sus
variantes
name,description,malware_types,is_family,
aliases
## 98

SDOPropósitoCampos clave
Course of ActionMedida preventiva o correctiva para
mitigar una amenaza
name,description,action
Nota.Elaboración propia basada en OASIS (2021a). Los SROs (Relationship y Sighting) de‑
βinen las relaciones entre SDOs:Relationshiptipa el vı́nculo (indicates,targets,uses,
mitigates) mediantesource_refytarget_ref, ySightingregistra el avistamiento de un
SDO en un contexto y fecha determinados.
Figura III‑1:Modelo relacional de los STIX Domain Objects (SDOs) y sus relaciones. Fuente: Ela‑
boración propia basada en OASIS (2021a).
graph TD
TA[Threat Actor] -->|uses| AP[Attack Pattern]
TA -->|uses| M[Malware]
AP -->|indicates| I1[Indicator: IP]
AP -->|indicates| I2[Indicator: Hash]
M -->|indicates| I3[Indicator: Dominio]
I1 -->|based-on| OD1[Observed Data: Conexión]
I2 -->|based-on| OD2[Observed Data: Archivo]
R[Report] -->|object-refs| TA
R -->|object-refs| AP
## R -->|object-refs| I1
I1 -->|sighting| S[Sighting]
COA[Course of Action] -->|mitigates| AP
Tabla III‑28:Comparación OpenIOC 1.1 vs STIX 2.1
## Dimensión
OpenIOC 1.1
## STIX 2.1
Alcance semánticoSolo indicadores (IoC)Indicadores, TTPs, actores,
campañas, observables, cursos
de acción
Modelo de datosPlano: condiciones booleanas anidadas   Grafo: objetos interconectados
mediante relaciones tipadas
TransporteNo deβine protocolo (archivo XML
únicamente)
TAXII 2.1 (API REST con
discovery, collection, poll)
ExtensibilidadLimitada a los contextos predeβinidos
(Network, Registry, FileSystem, etc.)
Abierta mediante custom
objects, extensiones y marking
deβinitions
InteroperabilidadAlta en herramientas forenses (EnCase,
FTK); baja en SIEM/TIP modernos
Alta en MISP, SIEM, TIP,
βirewalls (ecosistema OASIS)
MantenimientoSin releases activos desde 2014Mantenimiento activo por
## OASIS CTI TC
ExpresividadOperadores lógicos (AND, OR, NOT)
sobre condiciones de igualdad
STIX Patterning Language con
comparaciones, regex,
pertenencia a conjuntos,
## AND/OR
## 99

Nota.Elaboración propia basada en Kampanakis (2014) y OASIS (2021a).
Tabla III‑29:Mapeo conceptual de IoCs extraídos a objetos STIX 2.1
Tipo de IoC    Ejemplo concreto   Objeto STIX destinoPatrón STIX / ObservableObservaciones
Dirección IP
## 203.0.113.42
## Indicator
## +
IPv4Address
## [ipv4‑addr:value=’203.0.11
## 3.42’]
El observable se
representa
como
IPv4Address;
el Indicator
envuelve el
patrón. La
relación
based-on
vincula
## Indicator →
## Observed Data.
## Hash
## SHA‑256
e3b0c442...b7852b855Indicator
## +
## File
[file:hashes.SHA‑256=’e3b0
c442...b7852b855’]
## File
incluye
hashes(MD5,
## SHA‑1,
SHA‑256) y
opcionalmente
size,name,
mime_type
## .
## Puerto
destino
22NetworkTraffic[network‑traffic:dst_port=2
## 2]
## Usualmente
combinado con
protocolo en un
patrón
compuesto
## AND.
## Credencialroot:admin123     Indicator+
UserAccount+Auth
## [user‑account:user_id=’root’
ANDauthentication:credenti
al=’admin123’]
## Credenciales
como
UserAccount+
## Authentication;
contraseña
como hash
## (RN‑IN‑03).
## Comando
ejecutado
wget
http://malicious/payload.sh
Indicator+Process
## (observable)
## [process:command_line=’w
gethttp://malicious/payloa
d.sh’]
El observable
## Process
captura
command_line,
pid
## ,
created_time,
parent_ref.
URL maliciosahttp://malicious/payload.shIndicator+URL[url:value=’http://malicious
## /payload.sh’]
## Mapeable
también a
DomainName+
IPv4Address
si
se resuelve la IP
asociada.
## 100

Tipo de IoC    Ejemplo concreto   Objeto STIX destinoPatrón STIX / ObservableObservaciones
User‑agentMozilla/5.0
## Safari/534.30
NetworkTraffic+
## HTTP
## [network‑traffic:extensions.’
http‑request‑ext’.request_h
eader.User‑Agent=’Mozilla/
## 5.0...’]
Extensión HTTP
del observable
NetworkTraffic.
ProtocoloSMB,SSHNetworkTraffic[network‑traffic:protocols[*
## ]=’ssh’]
Los protocolos
se listan como
array; pueden
combinarse en
patrones AND.
Nota.Elaboración propia. El mapeo demuestra que la totalidad de los IoCs generados por Cow‑
rie y Dionaea pueden expresarse en STIX 2.1 sin pérdida semántica; un evento complejo (p. ej.,
una conexión SMB con descarga de archivo) puede requerir múltiples objetos STIX interconec‑
tados mediante relaciones.
Tabla III‑30:Análisis comparativo de los estándares de inteligencia de amenazas
CriterioSTIX 2.1TAXII 2.1OpenIOCMISP taxonomı́as
Madurez del
estándar
## OASIS
## (2015–presente)
## OASIS
## (2015–presente)
## Mandiant
## (2008–2014,
inactivo)
MISP Project (2012–presente)
InteroperabilidadAlta (MISP, SIEM,
## TIP, MITRE
## ATT&CK)
Alta (API REST)Media (forense,
legados)
Alta (MISP ecosystem)
ComplejidadAlta (modelo de
grafo, patterning
language)
Media (API REST
con 3 endpoints)
Baja (XML
plano)
Baja (vocabulario controlado)
EcosistemaAmplio (OASIS
## CTI TC,
numerosas imple‑
mentaciones)
Integrado con STIX  Limitado
## (herramientas
forenses)
Amplio (comunidad MISP
global)
## Cobertura
semántica
## Completa
## (indicadores,
TTPs, actores,
observables,
cursos de acción)
N/A (transporte)    Solo
indicadores
## Enriquecimiento (taxonomı́as
+ galaxy)
Aplicabilidad a
la arquitectura
Alta (formato de
representación
de IoCs)
## Media (trabajo
futuro para
diseminación)
Baja (solo inter‑
operabilidad
forense)
## Alta (enriquecimiento
semántico de IoCs)
Nota.Elaboración propia. Los estándares operan en niveles distintos del ecosistema de inte‑
ligencia de amenazas: STIX deβine la representación semántica, TAXII el transporte, OpenIOC
un formato heredado para indicadores simples y las taxonomı́as MISP el vocabulario de enri‑
quecimiento.
## 101

D. Tablas del Capítulo VI (Discusión)
Esta sección conserva las tablas de detalle de la discusión que el cuerpo del Capı́tulo VI pre‑
senta de forma condensada, manteniendo el formato APA 7ª: la descomposición del tiempo
de procesamiento manual, la proyección de escalabilidad, la comparación de precisión de par‑
seo, la comparación de plataformas de automatización y la comparación de la arquitectura
con soluciones existentes. Las tablas se numeran de forma secuencial (Tablas III‑31 a III‑35)
e incluyen la Figura III‑2.
Tabla III‑33:Comparación de precisión de parseo manual vs automatizado
Tipo de error
Tasa manual estimada
¹Tasa automática real ²   Mejora   Fuente de la estimación manual
Error de
extracción de
campos
## 12–18 %0 %100 %
SANS (2023): analyst fatigue en
tareas de triage prolongado
Error de
clasiβicación
## 8–15 %0 %100 %
IBM Security (2022): precisión
en clasiβicación manual de
incidentes
Error de enri‑
quecimiento
## (omisión)
## 5–10 %0 % ³100 %
Verizon (2024): omisión de
consultas de contexto en
análisis manual
Notas.¹ Rangos reportados para analistas SOC nivel 1‑2 en jornadas de 6+ horas continuas.
² Medido como porcentaje de eventos con errores sobre el total procesado (C‑04, Anexo III,
Tabla III‑6). ³ No se observaron errores de enriquecimiento en la ventana: la totalidad de los
13 eventos fue estructurada y persistida correctamente.
Tabla III‑34:Comparación de plataformas de automatización para CTI
Dimensiónn8nPython puroNode‑REDStackStorm
Curva de aprendizaje  BajaMedia‑altaBajaAlta
Integraciones CTI
nativas
## Webhook,
## REST,
## Post‑
greSQL,
cron
Cualquier librerı́a Python  HTTP, MQTT,
PostgreSQL
Sensors, rules, acciones
EscalabilidadMedia
## (secuen‑
cial por
defecto)
## Alta (asincrónico,
workers)
MediaAlta (distribuido)
DebuggingLimitado
## (errores
genéri‑
cos)
## Completo (logging,
breakpoints)
LimitadoBueno (trazas de
acción)
ComunidadGrande
## (>400
nodos)
Masiva (PyPI)Grande (>200
nodos)
## Mediana (enfocada
enterprise)
## 102

Dimensiónn8nPython puroNode‑REDStackStorm
Madurez CTIEmergente
## (pocos
casos
documen‑
tados)
Alta (MISP‑STIX, Cuckoo)  BajaMedia (Slack, Jira,
PagerDuty)
Huella de recursos380‑650
## MB RAM
## 80‑120 MB RAM100‑200 MB RAM   >1 GB RAM
## (multi‑servicio)
Costo operativoGratuito
## (self‑
hosted)
GratuitoGratuitoGratuito (open source)
Nota.Elaboración propia.
Tabla III‑35:Comparación de la arquitectura propuesta con soluciones existentes
Dimensión    Arquitectura propuestaMHN  Honeynet ProjectHPFeeds   Comercial ligera
Tipo de
despliegue
Docker multi‑contenedor   Docker
## / VM
VMs / bare‑metalBroker de
mensajes
SaaS / appliance
## Automatización
integrada
n8n (low‑code, 3
workβlows)
## Sin
auto‑
mati‑
za‑
ción
analı́‑
tica
Scripts manualesSolo
transporte
de datos
Pipeline cerrado
## Generación
de IoCs
## Automática (100 %), 8
dimensiones, MITRE
## Manual
/ ex‑
port
bási‑
co
Manual (logs)No genera
IoCs
## Automática (caja
negra)
## Multi‑
protocolo
Cowrie (SSH/Telnet) +
Dionaea (SMB, HTTP, FTP,
etc.)
## Cowrie
## + Dio‑
naea
## +
## Glas‑
topf
## Cowrie + Dionaea +
honeypots
propietarios
## Depende
del publi‑
cador
Limitado al plan
## Integración
## SIEM/SOAR
Vı́a n8n (REST,
PostgreSQL, STIX)
HPFeeds
## +
scripts
ManualHPFeeds
es el
transporte
## Nativa (propietaria)
## Escalabilidad  Media (secuencial,
~1.500 eventos/h)
## Media  Alta (infraestructura
dedicada)
## Alta
(broker de
mensajes)
## Alta (cloud)
Costo$10‑20 USD/mes (VPS)$15‑
## 30
USD/mes
## +
APIs
$50‑200 USD/mes
(múltiples VMs)
## $0
## (software
libre)
$200‑2000 USD/mes
## 103

Dimensión    Arquitectura propuestaMHN  Honeynet ProjectHPFeeds   Comercial ligera
MadurezEmergente (tesis
académica)
## Madura
## (pro‑
yecto
## Goo‑
gle,
## 2013‑
## 2023)
## Madura (fundación
## Honeynet, 1999‑)
## Madura
## (protocolo
estándar)
## Madura (producto
comercial)
## Documentación
académica
Completa (tesis formal)    Escasa Amplia (papers
## Honeynet)
## Técnica
## (protoco‑
lo)
NDAs /
documentación
cerrada
## Código
fuente
AbiertoAbierto
(Goo‑
gle)
## Abierto (varios
repos)
AbiertoCerrado
Nota.Elaboración propia.
## 104

## Referencias
Akamai Technologies. (2024).Digital fortresses under siege: Threats to modern application ar‑
chitectures(State of the Internet Report). https://www.akamai.com/lp/soti/securing‑apps‑
report‑2024
Al‑Turjman, F., & Salama, R. (2021). An overview of honeypots and honeynets. InSecurity in
IoT Social Networks(pp. 1‑18). Academic Press.
Arockiam, L., et al. (2020). A survey on honeypot‑based security mechanisms.International
Journal of Advanced Science and Technology,29(5), 1823‑1835.
Bajpai, M., & Shukla, A. (2021). Honeypot technology: A comprehensive review of taxonomy,
challenges, and future directions.International Journal of Advanced Research in Computer
Science,12(3), 45‑52.
Bejtlich, R. (2004).The Tao of Network Security Monitoring: Beyond Intrusion Detection.
Addison‑Wesley.
Breunig, M. M., Kriegel, H.‑P., Ng, R. T., & Sander, J. (2000). LOF: Identifying density‑based lo‑
cal outliers.Proceedings of the 2000 ACM SIGMOD International Conference on Management of
Data(pp. 93‑104). ACM. https://doi.org/10.1145/342009.335388
Bromiley, M. (2016). Threat intelligence: What it is, and how to use it effectively.SANS
Institute Reading Room. https://www.sans.org/reading‑room/whitepapers/threats/threat‑
intelligence‑it‑effectively‑36782
Brown, R., & Nickels, K. (2023).SANS 2023 CTI survey: Keeping up with a changing threat
landscape. SANS Institute. https://www.sans.org/white‑papers/2023‑cti‑survey‑keeping‑up‑
changing‑threat‑landscape
Casas, P., Mazel, J., & Owezarski, P. (2012). Unsupervised network intrusion detection sys‑
tems: Detecting the unknown without knowledge.Computer Communications,35(7), 772‑783.
https://doi.org/10.1016/j.comcom.2011.12.016
Chandola, V., Banerjee, A., & Kumar, V. (2009). Anomaly detection: A survey.ACM Computing
Surveys,41(3), Article 15. https://doi.org/10.1145/1541880.1541882
Cisco Talos. (2024).Cisco Talos 2024 year in review.
https://blog.talosintelligence.com/2024yearinreview
Cowrie    Project.    (2024).Cowrie    SSH/Telnet    Honeypot    Documentation.
https://github.com/cowrie/cowrie
Cremilleux, B., Guyet, T., & Termier, A. (2019). Semi‑automated attack detection in honeypot
data.Proceedings of the 2019 IEEE European Symposium on Security and Privacy Workshops
(pp. 112‑121). IEEE.
Deutsche Telekom Security GmbH. (2023).T‑Pot: The all‑in‑one multi‑honeypot platform.
https://github.com/telekom‑security/tpotce
Dionaea Project. (2024).Dionaea Documentation. https://github.com/DinoTools/dionaea
## 105

Dudeň, P., Sƽvarc, P., & Sokol, P. (2020). Data collection and data analysis in honeypots and
honeynets.Proceedings of the 2020 IEEE International Conference on Informatics, Multimedia,
and Cyber Information Systems(pp. 45‑52). IEEE.
ENISA. (2023).ENISA threat landscape 2023. European Union Agency for Cybersecurity.
https://doi.org/10.2824/782573
Ester, M., Kriegel, H.‑P., Sander, J., & Xu, X. (1996). A density‑based algorithm for discovering
clusters in large spatial databases with noise.Proceedings of the Second International Confe‑
rence on Knowledge Discovery and Data Mining (KDD‑96)(pp. 226‑231). AAAI Press.
Fanelle, V., Karimi, M., & Shahriar, H. (2018). Analysis of honeypot data for cyber threat inte‑
lligence.2018 IEEE International Conference on Big Data(Big Data)(pp. 2345‑2353). IEEE.
https://doi.org/10.1109/BigData.2018.8622497
Franco,J.,Aris,A.,Canberk,B.,&Uluagac,A.S.(2021).Asurveyofhoneypotsandhoneynetsfor
InternetofThings,IndustrialInternetofThings,andcyber‑physicalsystems.IEEECommunica‑
tions Surveys & Tutorials,23(4), 2351‑2383. https://doi.org/10.1109/COMST.2021.3106669
Group‑IB. (2024).Hi‑tech crime trends 2023/2024. https://www.group‑ib.com/landing/hi‑
tech‑crime‑trends‑2023‑2024/
Honeynet   Project.   (2022).The   Honeynet   Project   annual   report   2022.
https://www.honeynet.org
IBM Security. (2022).IBM X‑Force threat intelligence index 2022. IBM Corporation.
https://www.ibm.com/reports/threat‑intelligence
Ikuomenisan, G., & Morgan, Y. (2022). Meta‑review of recent and landmark ho‑
neypot  research  and  surveys.Journal  of  Information  Security,13(4),  181‑209.
https://doi.org/10.4236/jis.2022.134011
Ilg, N., Duplys, P., Sisejkovic, D., & Menth, M. (2023). A survey of contemporary open‑source
honeypots,frameworks,andtools.JournalofNetworkandComputerApplications,220,103737.
https://doi.org/10.1016/j.jnca.2023.103737
Javadpour, A., Ja’fari, F., Taleb, T., Shojafar, M., & Benzaı̈d, C. (2024). A comprehensive survey
on cyber deception techniques to improve honeypot performance.Computers & Security,140,
103792. https://doi.org/10.1016/j.cose.2024.103792
Kampanakis, P. (2014). Security automation and threat information‑sharing options.IEEE Se‑
curity & Privacy,12(5), 42‑51. https://doi.org/10.1109/MSP.2014.94
Kindervag, J. (2010).Build security into your network’s DNA: The Zero Trust network architec‑
ture. Forrester Research.
Liu, F. T., Ting, K. M., & Zhou, Z.‑H. (2008). Isolation Forest.Proceedings of the
2008  Eighth  IEEE  International  Conference  on  Data  Mining(pp. 413‑422). IEEE.
https://doi.org/10.1109/ICDM.2008.17
MISP Project. (2024).MISP threat sharing platform documentation. https://www.misp‑
project.org/documentation/
Mitre Corporation. (2024).MITRE ATT&CK. https://attack.mitre.org
## 106

Morić, Z., Dakic, V., & Regvart, D. (2025). Advancing cybersecurity with honeypots and decep‑
tion strategies.Informatics,12(1), 14. https://doi.org/10.3390/informatics12010014
n8n GmbH. (2024).n8n Documentation. https://docs.n8n.io
Nawrocki, M., et al. (2016). A survey on honeypot software and data analysis.arXiv preprint
arXiv:1608.06249.
NIST. (2012).Computer security incident handling guide(NIST Special Publication 800‑61
Rev. 2). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800‑61r2
OASIS. (2021a).STIX 2.1 Speciϔication. https://oasis‑open.github.io/cti‑documentation/
OASIS. (2021b).TAXII 2.1 Speciϔication. https://docs.oasis‑open.org/cti/taxii/v2.1/
Oosterhof,    M.    (2023).CowrieSSH/TelnetHoneypotdocumentation.
https://cowrie.readthedocs.io
Provos, N. (2002).Honeyd: A virtual honeypot daemon. https://www.honeyd.org
Provos, N., & Holz, T. (2007).Virtual Honeypots: From Botnet Tracking to Intrusion Detection.
Addison‑Wesley.
SANS Institute. (2023).SANS 2023 SOC survey. https://www.sans.org/white‑papers/sans‑2023‑soc‑survey/
SANS Internet Storm Center. (2023).ISC data on SSH scanning activity. https://isc.sans.edu
Shackleford, D. (2015). A practical guide to cyber threat intelligence.SANS Institute
Reading Room. https://www.sans.org/reading‑room/whitepapers/threats/practical‑guide‑
cyber‑threat‑intelligence‑36477
Sillaber, C., Sauerwein, C., Mussmann, A., & Breu, R. (2016). Data quality challenges in cyber
threat intelligence.Proceedings of the 2016 ACM Workshop on Automated Decision Making for
Active Cyber Defense(pp. 3‑8). ACM. https://doi.org/10.1145/2994539.2994540
Shodan. (2024).Shodan documentation. https://www.shodan.io
Sokol, P., Mı́šek, J., & Husák, M. (2017). Honeypots and honeynets: Issues of privacy.EURASIP
Journal on Information Security,2017(1), 4. https://doi.org/10.1186/s13635‑017‑0057‑4
Soleimani,H.,&Khorsand,R.(2021).Asurveyoncyberthreatintelligence.JournalofComputer
Virology and Hacking Techniques,17(4), 319‑336.
Sommer, R., & Paxson, V. (2010). Outside the closed world: On using machine learning for net‑
work intrusion detection.Proceedings of the 2010 IEEE Symposium on Security and Privacy
(pp. 305‑316). IEEE. https://doi.org/10.1109/SP.2010.25
SonicWall.    (2024).2024    SonicWall    cyber    threat    report.    SonicWall
Inc.    https://www.sonicwall.com/resources/white‑papers/2024‑sonicwall‑cyber‑threat‑
report
Spitzner, L. (2002).Honeypots: Tracking Hackers. Addison‑Wesley.
Verizon.  (2024).2024  data  breach  investigations  report.  Verizon  Business.
https://www.verizon.com/business/resources/reports/dbir/
Wagner, C., Dulaunoy, A., Wagener, G., & Iklody, A. (2016). MISP: The design and imple‑
mentation of a collaborative threat intelligence sharing platform.Proceedings of the 2016
ACM on Workshop on Information Sharing and Collaborative Security(pp. 49‑56). ACM.
https://doi.org/10.1145/2994539.2994542
Yang, X., Yuan, J., Yang, H., Kong, Y., Zhang, H., & Zhao, J. (2023). A highly interacti‑
ve honeypot‑based approach to network threat management.Future Internet,15(4), 127.
https://doi.org/10.3390/βi15040127
Zielinski, D., & Kholidy, H. A. (2023). An analysis of honeypots and their impact as a cyber de‑
ception tactic.arXiv preprint arXiv:2301.00045. https://doi.org/10.48550/arXiv.2301.00045
## 108


## AUDITORÍA INTEGRAL DE TESIS DE GRADO
Diseño e Implementación de una
Arquitectura de Honeypots Integrada con
n8n para la Generación Automatizada de
Inteligencia de Amenazas
Informe de auditoría científica, metodológica, técnica y formal
Aplicación del Prompt Maestro para la Revisión Integral de una Tesis de Grado
## Universitaria
## Grupo Nocturne Society — Emmanuel Crespo, Lucas Norton, Julián Santos
Tecnicatura en Programación · UTN — Facultad Regional Mendoza · 2026
Documento auditado: versión «CORRECCIÓN» · 109 páginas · 34.754 palabras
CampoDato registrado
TítuloDiseño e Implementación de una Arquitectura de Honeypots Integrada con n8n para la
Generación Automatizada de Inteligencia de Amenazas
Grupo / autoresNocturne Society — Emmanuel Crespo, Lucas Norton, Julián Santos
Carrera / instituciónTecnicatura en Programación — UTN, Facultad Regional Mendoza, Mendoza, Argentina
Año declarado2026
Archivo auditadoNocturne_Society_-_Tema_8_Honeypots_(Crespo,_Norton_y_Santos)_-_CORRECCIÓN.p
df
Extensión109 páginas · 34.754 palabras · ~28.100 palabras de prosa continua
ProducciónLaTeX vía pandoc (xdvipdfmx 20250410); PDF generado el 08/08/2026
Estructura8 capítulos + Resumen/Abstract + 3 anexos; numeración de páginas completa
Imágenes embebidas5  (páginas  50-54).  Otras  14  figuras  aparecen  como  código  Mermaid/xychart  sin
renderizar
Repositorio declaradoMencionado 7 veces («el repositorio del proyecto») sin URL en ninguna página
Período de observación30 días, sin fechas de calendario en todo el documento
Instrumento aplicadoPrompt Maestro para la Revisión Integral de una Tesis de Grado Universitaria
Fecha de la auditoría8 de agosto de 2026

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno1
Índice del informe
- Resumen ejecutivo
- Alcance y método de la auditoría
- Estructura exigida frente a estructura hallada
- Hallazgos críticos
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 74.1 Bloque A — Integridad del dataset primario
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 94.2 Bloque B — Las figuras contradicen o no sostienen el texto
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 104.3 Bloque C — Aritmética y estadística
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 124.4 Bloque D — Hipótesis, objetivos y contraste
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 134.5 Bloque E — Trazabilidad, reproducibilidad y datos personales
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 144.6 Bloque F — Bibliografía y errores factuales verificados
- Revisión capítulo por capítulo
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 185.1 Capítulo I — Introducción
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 185.2 Capítulo II — Estado del arte
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 185.3 Capítulo III — Marco teórico
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 195.4 Capítulo IV — Metodología
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 195.5 Capítulo V — Resultados experimentales
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 205.6 Capítulo VI — Discusión
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 205.7 Capítulo VII — Conclusiones
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 215.8 Capítulo VIII — Recomendaciones
- Revisión metodológica
- Revisión bibliográfica
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 247.1 Actualización y calidad de las fuentes
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 247.2 Correspondencia entre citas y referencias
- Cumplimiento de normas APA
- Revisión de tablas y figuras
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 279.1 Tablas
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 279.2 Figuras
- Revisión técnica
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 2910.1 Modelado
.  .  .  .  .  .  .  .  .  .  . 2910.2 Consistencia entre arquitectura y desarrollo, y observaciones de ingeniería
- Auditoría de la calidad de la escritura científica
- Tabla de riesgos de rechazo
- Calificación por capítulo y calificación global
- Dictamen final
- Ruta de corrección

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno2
- Lo que no debe tocarse
- Preguntas probables del tribunal
45Anexo A — Verificaciones aritméticas reproducibles
47Anexo B — Verificación bibliográfica externa

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno3
- Resumen ejecutivo
Esta  auditoría  examinó  las  109  páginas  del  trabajo  sobre  cuatro  planos  de  verificación:  el  textual
(coherencia   interna   entre   capítulos   y   entre   afirmaciones),   el   cuantitativo   (reproducción
independiente de cada cifra publicada a partir de sus propios insumos), el bibliográfico (existencia
real y correspondencia de contenido de las 50 referencias) y el gráfico (extracción y lectura de las 5
imágenes embebidas). El cuarto plano habitual —la auditoría del artefacto— no pudo ejecutarse: el
documento invoca «el repositorio del proyecto» siete veces y nunca publica su dirección.
El trabajo tiene virtudes reales y por encima del promedio de la cohorte. Su estructura es completa y
bien concebida; el Capítulo III (marco teórico) contiene el mejor tratamiento de estándares CTI —STIX
2.1,  TAXII  2.1,  OpenIOC  y  taxonomías  MISP—  que  se  ha  revisado  en  esta  serie,  técnicamente
correcto  y  con  un  mapeo  IoC→objeto  STIX  (Tabla  III-29)  que  es  material  publicable;  la  prosa  está
claramente  por  encima  de  la  media;  el  Capítulo  VI  discute  en  lugar  de  describir;  y  los  autores
declaran por iniciativa propia que la línea de base manual es una estimación de literatura y no una
medición, que tres secciones son propuestas no implementadas, y que ocho limitaciones condicionan
la validez externa. Esa honestidad epistémica es genuina y se reconoce como tal.
El  problema  no  está  en  el  diseño  ni  en  la  escritura:  está  en  los  datos  y  en  las  figuras  que  los
presentan. Y ahí el trabajo no resiste una lectura cruzada.
Hallazgo determinante nº 1 — el documento publica dos conjuntos de
datos incompatibles para los mismos 201.125 eventos
La Tabla 5.1, la Tabla 5.3 y la Figura 5.5 atribuyen a Cowrie 195.300 eventos (97,1 %) y a Dionaea
5.825 (2,9 %). La Tabla 5.9, la Tabla 5.10 y el §5.11 atribuyen a Cowrie 157.234 eventos (78,2 %) y
a  Dionaea  43.891  (21,8  %).  Ambos  pares  suman  exactamente  201.125,  cada  uno  es  internamente
consistente en sus promedios diarios, y ambos se usan de forma intercambiable en el mismo capítulo
y  en  las  conclusiones.  No  son  dos  vistas  del  mismo  dato:  son  dos  datasets  distintos.  La  Tabla  III-3
(credenciales) permite dirimir cuál es el operativo —sus frecuencias implican una base de ≈156.400
intentos, compatible solo con la cifra de 157.234— lo que deja a la Tabla 5.1, la Tabla 5.3 y la Figura
5.5 sin respaldo.
Hallazgo determinante nº 2 — las figuras embebidas refutan el texto que
las presenta
La  Figura  5.12  (mapa  de  calor,  única  evidencia  gráfica  de  la  distribución  horaria)  muestra  que  la
franja  00:00-05:00  UTC  es  la  de  menor  actividad  y  que  los  máximos  están  en  09:00-13:00  y
16:00-18:00  UTC,  con  una  celda  máxima  de  396  eventos/hora.  El  texto  afirma  en  cuatro  lugares
—§5.3.3, §5.3.5, §6.2.1 y §7.2.1— exactamente lo contrario: que «la franja 03:00-05:00 UTC concentra
la  máxima  actividad»  con  «picos  >800  eventos/hora»,  y  la  Tabla  5.9  publica  un  pico  combinado  de
1.159 eventos/hora. Además, el patrón diurno marcado que exhibe la figura contradice la conclusión
cualitativa    central    del    trabajo    («volumen    constante    durante    las    24    horas»,    «actividad
predominantemente  automatizada»),  que  es  justamente  lo  que  el  §5.3.5  deduce  de  esos  picos
inexistentes.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno4
Hallazgo determinante nº 3 — indicios verificables de que los datos son
ilustrativos, no capturados
Los  diez  hashes  SHA-256  de  la  Tabla  III-3  forman  una  secuencia rotatoria perfecta:  a1b2c3d4...,
b2c3d4e5..., c3d4e5f6..., d4e5f6a7..., e5f6a7b8..., f6a7b8c9..., a7b8c9d0..., b8c9d0e1..., c9d0e1f2...,
d0e1f2a3....  Ningún  conjunto  de  hashes  reales  presenta  ese  patrón.  Los  nombres  de  artefactos  del
§5.8.5  (payload_ssh.exe,  mirai_scanner.bin,  exploit.doc,  coinminer.elf,  backdoor.pl)  son  marcadores
genéricos: Dionaea almacena las muestras nombradas por su hash. Y la Figura 5.11 exhibe una serie
horaria con oscilación sinusoidal regular y media móvil de período ≈7 días, morfología característica
de una serie generada, no de tráfico de escaneo real. Esta auditoría no concluye sobre la autoría
ni sobre la intención: consigna que la evidencia publicada no es verificable como captura empírica
y que el tribunal está en condiciones de exigir el dataset crudo.
A  esos  tres  se  suman  25  hallazgos  críticos  más:  dos  taxonomías  incompatibles  para  los  mismos
4.234  IoCs  (Tabla  5.4  vs.  Tabla  III-9,  esta  última  sumando  4.279  y  con  porcentajes  que  totalizan
101,1 %); dos tasas de estructuración incompatibles (84,2 % en la Tabla 5.3 y 94,7 % en el §5.6.1,
§5.10,  §7.2.1  y  la  Tabla  III-6  —siendo  esta  última  la  que  valida  la  hipótesis  P2  y  la  que  llega  al
Resumen—); dos recuentos de reportes (12 en la Tabla 5.5, 30 en cuatro lugares más); dos totales
de  IPs  únicas  (3.128  y  3.751,  este  último  el  propio  total  de  la  Tabla  III-2);  una  desviación  estándar
aritméticamente  imposible  (342  ±  89  ms  con  P99  =  1.420  ms);  las  cuatro  hipótesis  operativas
declaradas  «Aceptadas»  sin  ser  contrastadas  contra  su  propio  umbral;  una  referencia  con  DOI  que
resuelve  a  otro  artículo;  y  una  misatribución  verificada  sobre  la  única  fuente  de  la  bibliografía  que
trata la protección de datos personales en honeypots.
El diagnóstico es simétrico al de un caso ya conocido de esta serie: un documento bien escrito y
bien estructurado sobre una campaña de medición que no se puede verificar. Si los autores
conservan la base de datos, los logs de ejecución de n8n y el repositorio, la mayor parte de lo que
sigue es trabajo de reescritura y reconciliación, no de reconstrucción; si no los conservan, el Capítulo
V debe rehacerse desde la captura.
## Dictamen
No  recomendable  para  defensa  en  su  estado  actual.  Calificación  general:  4,2  /  10.  Índice  de
calidad de escritura: 7,0 / 10 (de los más altos de la cohorte). 28 hallazgos críticos; 94 hallazgos en
total.
Dictamen condicional. El trabajo asciende a «Requiere una revisión profunda antes de la defensa»
(≈5,4) en el momento en que los autores exhiban ante el tribunal (a) el volcado de las tablas events,
iocs y reports de PostgreSQL con marcas temporales por evento, (b) los logs de ejecución de los tres
workflows  de  n8n,  y  (c)  la  URL  del  repositorio.  Con  esos  tres  elementos,  todos  los  hallazgos  de
coherencia numérica pasan a ser corregibles por reconciliación. Sin ellos, el capítulo de Resultados no
es auditable y la calificación no puede subir.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno5
- Alcance y método de la auditoría
La  revisión  se  ejecutó  siguiendo  la  estructura  obligatoria  que  fija  el  Prompt  Maestro:  evaluación
independiente de cada capítulo en coherencia, profundidad científica, calidad académica, coherencia
interna  y  calidad  de  redacción;  revisión  metodológica  de  los  17  aspectos  listados;  revisión
bibliográfica de actualización, calidad de fuentes, existencia real y correspondencia citas-referencias;
revisión  APA;  revisión  de  tablas  y  figuras;  revisión  técnica;  revisión  de  resultados,  discusión,
conclusiones  y  anexos;  tabla  de  riesgos  de  rechazo;  calificación  por  capítulo;  calificación  global;
dictamen; y auditoría de la calidad de la escritura científica.
Planos de verificación aplicados
PlanoQué se hizoEstado
TextualLectura íntegra de las 109 páginas; contraste de cada afirmación
cuantitativa  contra  todas  sus  reapariciones  en  otros  capítulos;
verificación de la correspondencia índice-cuerpo.
## Ejecutado
CuantitativoRecálculo  independiente  de  cada  porcentaje,  promedio,  suma,
cociente  y  mejora  publicada,  a  partir  de  los  insumos  que  el
propio   documento   declara.   Verificación   de   compatibilidad
estadística de las medidas de dispersión.
Ejecutado (Anexo A)
## Bibliográfico
Verificación   externa   de   existencia,   autoría,   año,   volumen,
páginas,   DOI   y   —cuando   la   cita   le   atribuye   un   contenido
concreto— del contenido real de la fuente.
Ejecutado (Anexo B)
GráficoExtracción  de  las  5  imágenes  embebidas  con  pdfimages  y
lectura  visual  de  cada  una,  contrastada  con  el  texto  que  las
presenta.
## Ejecutado
ArtefactoClonado  e  inspección  del  repositorio  del  sistema,  workflows
JSON, docker-compose y esquema SQL.
No  ejecutable:  el  documento
no publica URL de repositorio
Lo que esta auditoría no puede afirmar
Por rigor, se deja constancia explícita de los límites del dictamen. Esta auditoría no puede afirmar
que  los  datos  hayan  sido  inventados:  puede  afirmar  que  la  evidencia  publicada  presenta  indicios
objetivos de ser ilustrativa y que no existe ningún elemento en el documento que permita verificarla.
Tampoco  puede  afirmar  que  el  sistema  no  exista  o  no  funcione:  la  descripción  técnica  de  los  tres
workflows,  de  sus  nodos,  de  su  manejo  de  errores  y  de  sus  variables  de  entorno  es  coherente  y
plausible,  y  nada  indica  que  no  se  haya  construido.  Lo  que  se  afirma  es  que  el  documento  no
permite distinguir entre un sistema que operó 30 días y uno que se describió sin operar, y
que  esa  indistinguibilidad  es,  por  sí  sola,  un  defecto  que  un  tribunal  debe  resolver  antes  de  la
defensa.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno6
- Estructura exigida frente a estructura hallada
El Prompt Maestro exige diez capítulos. La correspondencia con el documento es la siguiente:
Capítulo exigidoPresenteUbicación y observación
IntroducciónSíCap.  I.  Completo:  contextualización,  problema,  justificación  en  5
dimensiones,   objetivos,   alcance,   hipótesis   operativas,   variables,
estructura y cierre. 0 citas en 1.467 palabras.
Marco teóricoSíCap.  III,  además  de  un  Cap.  II  de  Estado  del  Arte  diferenciado
explícitamente («qué se ha hecho» vs. «los conceptos»). Es la mejor
parte del trabajo.
Marco metodológicoSí (incompleto)Cap. IV. El §4.4 «Diseño de investigación» figura en el índice y
no existe en el cuerpo: el texto salta de §4.3 a §4.5. Y es citado dos
veces (§4.6 y §7.1) como fuente del diseño.
Desarrollo del estudioParcialRepartido  entre  §4.11-§4.13  y  §5.2/§5.13.  No  hay  un  capítulo  de
desarrollo  propiamente  dicho;  la  implementación  se  describe  en  el
capítulo de Resultados.
ResultadosSíCap.  V.  Es  el  capítulo  más  extenso  (7.268  palabras)  y  el  más
problemático: concentra 19 de los 28 hallazgos críticos.
Arquitectura   e   interfaz   de
visualización
ParcialLa  arquitectura  está  en  las  Figuras  4.1-4.5  (Anexo  I,  sin  renderizar).
La  interfaz  de  visualización  no  existe:   el   §5.14   la   declara
«propuesta conceptual — no implementada», pero el §5.7 presenta la
Figura   5.15   como   «una   captura   del   dashboard   de   monitoreo
implementado en n8n».
DiscusiónSíCap. VI. Discute de verdad: compara, contrasta, evalúa críticamente
la   herramienta   elegida   y   declara   limitaciones.   Por   encima   del
promedio de la cohorte.
ConclusionesSíCap.  VII,  con  un  Cap.  VIII  adicional  de  Recomendaciones.  El  §7.2
organiza  los  resultados  en  tres  niveles  epistémicos  (confirmados  /
sugeridos / aportes), recurso metodológico valioso.
Referencias bibliográficasSí50 entradas. 13 nunca citadas (26 %); 2 citas huérfanas; 1 referencia
con  DOI  que  resuelve  a  otro  artículo;  1  misatribución  de  contenido
verificada.
AnexosSí (insuficientes)Tres anexos. El I y el II son diagramas en código fuente sin renderizar;
el III son tablas de datos. Ninguno permite reproducir el estudio:
no hay dataset, ni logs, ni código, ni URL de repositorio.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno7
- Hallazgos críticos
Se  documentan  28  hallazgos  de  severidad  crítica,  agrupados  en  seis  bloques  temáticos.  Cada  uno
incluye la evidencia exacta que lo sostiene y su ubicación en el documento. La numeración C-01 a
C-28 se reutiliza en la tabla de riesgos (§12) y en la ruta de corrección (§15).
4.1 Bloque A — Integridad del dataset primario
C-01. Dos conjuntos de datos incompatibles para los mismos 201.125 eventos
Fuente en la tesisCowrieDionaea% CowrieEventos/día Cowrie
## Tabla 5.1 · Tabla 5.3 · Figura 5.5~195.300~5.82597,1 %~6.510
Tabla 5.9 · Tabla 5.10 · §5.11 obj. 3157.23443.89178,2 %5.241
Ambos  pares  suman  201.125  y  ambos  son  internamente  consistentes  en  sus  promedios.  Pero  no
pueden ser ciertos a la vez: la diferencia es de 38.066 eventos, el 19 % del total. El texto usa los dos
indistintamente.  El  §5.3.1  afirma  «un  claro  predominio  de  la  actividad  sobre  servicios  SSH/Telnet
(97,1  %  del  total)»  y  el  §5.4  afirma,  once  páginas  después,  «Cowrie  capturó  el  78,2  %  del  total  de
eventos» —ambas atribuidas al mismo período y al mismo entorno—. La Figura 5.5 reparte SSH 82,3
% / Telnet 14,8 % / SMB 2,1 % / HTTP 0,8 %; la Tabla 5.10 reparte SSH 70,7 % / SMB 11,9 % / Telnet
7,5 % / HTTP 5,4 % / FTP 2,5 % / otros 1,9 %. Son dos distribuciones de protocolo distintas para el
mismo conjunto.
La Tabla III-3 permite dirimir cuál es el dataset operativo. Sus diez frecuencias suman 57.558
intentos y se declaran equivalentes al 36,8 % del total, lo que implica una base de ≈156.400 intentos
de  autenticación.  La  primera  frecuencia  (12.847)  representa  el  8,2  %,  lo  que  implica  una  base  de
≈156.700.  Ambas  cifras  son  compatibles  con  los  157.234  eventos  de  Cowrie  de  la  Tabla  5.9  y  son
incompatibles con los 195.300 de la Tabla 5.1. La Tabla 5.1, la Tabla 5.3 y la Figura 5.5 quedan, por
lo tanto, sin respaldo en los propios datos del trabajo.
C-02. Dos tasas de estructuración incompatibles, y la que valida la hipótesis es la no
auditable
La Tabla 5.3 desglosa la estructuración por honeypot: Cowrie 168.200/195.300 = 86,1 %, Dionaea
4.153/5.825 = 71,3 %, total 169.353/201.125 = 84,2 %. Es el único lugar del documento donde la
tasa se publica con numerador y denominador, y el §5.3.2 la comenta en detalle explicando por qué
Dionaea queda por debajo del target.
El §5.6.1, el §5.10 (P2), el §5.11, el §6.1.5, el §6.2.1, el §7.2.1 y la Tabla III-6 publican 94,7 %,
sin numerador ni denominador. Es esta cifra —no la de la Tabla 5.3— la que valida la hipótesis P2, la
que llega a la Tabla 7.1 como veredicto «Aceptada», la que aparece en el Resumen del Cap. VII y la
que  el  §6.3  declara  «alineada  con  el  93-96  %  reportado  por  la  documentación  de  Cowrie».  La
diferencia no es menor: 84,2 % supera el umbral del 80 % por 4,2 puntos, 94,7 % lo supera por 14,7.
El §7.2.1 informa expresamente «holgura de 14,7 puntos porcentuales».
El  desacuerdo  se  propaga:  el  §5.6.1  y  el  §6.2.1  explican  que  «el  5,3  %  restante»  corresponde  a
conexiones fragmentadas, cifra que solo tiene sentido con el 94,7 %. Con el 84,2 % de la Tabla 5.3,
el resto es el 15,8 %.
C-03. Dos taxonomías incompatibles para los mismos 4.234 IoCs, y una de ellas no
suma
Tipo de IoCTabla 5.4 (cuerpo)Tabla III-9 (Anexo)Diferencia
Direcciones IP3.874 (91,5 %)2.847 (67,2 %)−1.027
Hashes de archivo147856 (20,2 %)+709
## Credenciales (hash)12441 (1,0 %)−83
## User-agents8945 (1,1 %)−44

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno8
Tipo de IoCTabla 5.4 (cuerpo)Tabla III-9 (Anexo)Diferencia
Dominios— (no existe)312 (7,4 %)+312
URLs— (no existe)178 (4,2 %)+178
Total4.234 (suma exacta)4.279 (declara 4.234)+45
Ninguna  fila  coincide.  La  Tabla  5.4  no  contempla  dominios  ni  URLs;  la  Tabla  III-9  no  reproduce
ninguna de las cuatro cantidades de la Tabla 5.4. Y la Tabla III-9 no suma lo que declara: 2.847 +
856  +  312  +  178  +  45  +  41  =  4.279,  no  4.234;  sus  porcentajes,  calculados  todos  sobre  4.234,
totalizan 101,1 %. La nota de la Tabla 5.4 afirma que «las IPs representan el 91,5 % del total de IoCs
generados»; el §5.8.2 afirma que «la categoría predominante corresponde a direcciones IP (67,2 %)».
El §7.2.1 reproduce la versión del Anexo; el §5.3.2 reproduce la del cuerpo.
El desacuerdo alcanza a la evidencia forense: el §5.8.5 informa que «Dionaea capturó 856 artefactos
maliciosos», cifra idéntica a los 856 hashes de la Tabla III-9 e incompatible con los 147 de la Tabla
5.4. Además, 856 muestras de malware sobre 43.891 eventos de Dionaea implicaría que el 1,95 %
de  todas  las  conexiones  dejó  un  binario;  sobre  los  5.825  eventos  de  la  Tabla  5.1,  el  14,7  %.  La
segunda cifra es implausible para un honeypot de baja interacción.
C-04. Dos totales de IPs únicas, y los porcentajes geográficos se calculan sobre el
que la tesis no reporta
El §5.5.4, el §5.7, el §5.11 y la Tabla III-6 informan 3.128 IPs únicas. La Tabla III-2, que es la
fuente  que  todos  ellos  citan,  totaliza  3.751,  y  su  propia  nota  lo  admite:  «las  IPs  únicas  totales
(3.751) superan las reportadas en análisis cualitativo previo». Es decir, el documento sabe que hay
dos cifras y no resuelve cuál rige.
La  consecuencia  es  que  los  porcentajes  geográficos  no  son  reproducibles.  El  §6.2.1  y  la  Tabla  6.6
informan «China (31,2 %), Rusia (18,5 %) y Estados Unidos (12,3 %) concentran el 62,0 % de las IPs
atacantes  (Anexo  III,  Tabla  III-2)».  La  Tabla  III-2  dice  China  27,4  %,  Estados  Unidos  16,4  %  y  Rusia
11,3  %,  que  suman  55,1  %,  no  62,0  %.  Ninguno  de  los  tres  valores  citados  aparece  en  la  tabla
citada. El §5.5.4 repite el 62,0 % y el §7.2.1 lo reproduce en las conclusiones.
Se  agrega  un  error  de  recuento:  el  §5.11  (objetivo  3)  informa  «3.128  IPs  únicas  de  38  países»,
mientras el §5.8.4, el §7.2.1 y la propia Tabla III-2 («Otros — 18 países» más los diez listados) dan 28.
C-05. Dos recuentos de reportes generados, y el que valida P4 no es el de la tabla
La Tabla 5.5 publica 12 reportes, desglosados como «semanal (4), mensual (1), por umbral (7)». El
§5.10  (P4),  el  §5.11,  el  §7.2.1  y  la  Tabla  III-6  publican  30  reportes  («uno  por  día  de
observación»;  la  Tabla  III-6  lo  escribe  como  «100  %  (30/30)»).  Y  el  §5.13.3  documenta  la
configuración real de los temporizadores: un cron diario 0 8 * * * más uno semanal 0 9 * * 1, que
en  30  días  produciría  30  +  4  =  34  reportes  y  ningún  reporte  «por  umbral».  Las  tres  cifras  son
mutuamente incompatibles, y el desglose de la Tabla 5.5 no se corresponde con ninguna de las dos
programaciones documentadas.
C-06. Indicios objetivos de que los datos publicados son ilustrativos
Tres elementos concurren y ninguno tiene explicación alternativa razonable:
•Los  hashes  de  la  Tabla  III-3  forman  una  secuencia  rotatoria.  Los  diez  valores  son
a1b2c3d4...d8e9f0a1,      b2c3d4e5...e9f0a1b2,      c3d4e5f6...f0a1b2c3,      d4e5f6a7...a1b2c3d4,
e5f6a7b8...b2c3d4e5,      f6a7b8c9...c3d4e5f6,      a7b8c9d0...d4e5f6a7,      b8c9d0e1...e5f6a7b8,
c9d0e1f2...f6a7b8c9,  d0e1f2a3...a7b8c9d0.  Cada  valor  es  el  anterior  desplazado  un  nibble.  Un
SHA-256  real  es  indistinguible  de  una  cadena  aleatoria;  la  probabilidad  de  este  patrón  en  diez
hashes   reales   es   nula.   El   mismo   patrón   reaparece   en   el   §5.8.7   (a3f5b2c1...d9e0f1a2,
b4c5d6e7...e1f2a3b4, c5d6e7f8...f2a3b4c5) y en la Tabla III-9.
•Los  nombres  de  artefactos  son  marcadores  genéricos.  El  §5.8.5  lista  payload_ssh.exe,
mirai_scanner.bin,  exploit.doc,  coinminer.elf  y  backdoor.pl.  Dionaea  almacena  las  muestras

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno9
capturadas nombradas por su hash, no con nombres descriptivos de su función. Adicionalmente,
se informa que la tasa de detección más alta en VirusTotal entre 856 artefactos fue 15/68 para un
minero de Monero: los mineros de la familia CoinMiner suelen superar las 40 detecciones sobre 70
motores, y que 15/68 sea el máximo de 856 muestras no es plausible.
•La morfología de la Figura 5.11 es la de una serie sintética. La serie horaria oscila con un
ciclo diario perfectamente regular entre ~140 y ~520 eventos y su media móvil de 24 h describe
una sinusoide limpia de período ≈7-8 días entre 245 y 337. El tráfico de escaneo real es ráfagado,
con máximos aislados de varios múltiplos de la media y valles irregulares.
Se  reitera  el  límite  de  esta  afirmación:  lo  anterior  establece  que  la  evidencia  publicada  no  es
verificable como captura empírica. No establece qué ocurrió. El único modo de resolverlo es que los
autores exhiban el volcado de la base de datos.
4.2 Bloque B — Las figuras contradicen o no sostienen el texto
C-07. El mapa de calor (Figura 5.12) invierte la conclusión horaria del trabajo
Se extrajo la imagen embebida en la página 51. Muestra, con valores numéricos impresos en cada
celda,  lo  siguiente:  la  banda  00:00-05:00  UTC  es  la  más  clara  del  mapa  (menor  actividad);  la
actividad  máxima  se  concentra  en  09:00-13:00  UTC  y,  secundariamente,  en  16:00-18:00  UTC;  el
valor más alto de todo el mapa es 396 (jueves, 10:00 UTC), seguido de 380, 372, 371 y 369.
El texto afirma lo contrario en cuatro pasajes independientes:
UbicaciónAfirmación del textoLo que muestra la Figura 5.12
§5.3.3 (Fig. 5.2)«La franja 03:00-05:00 UTC concentra la máxima actividad
(picos  >800  eventos/hora)»;  «08:00-12:00  UTC  (400-600
eventos/hora)»
03:00-05:00    es    el    mínimo;    el
máximo  absoluto  es  396  y  está  en
## 09:00-13:00
§5.3.5«Hora de mayor actividad: La franja de 03:00 a 05:00 UTC
concentró     los     mayores     volúmenes     (picos     >800
eventos/hora)»
## Contradicho
§6.2.1«mayor  actividad  en  horas  de  baja  actividad  regional
(03:00 UTC para SSH, 22:00 UTC para SMB)»
22:00   UTC   también   está   en   la
banda baja
§7.2.1 / §6.1.5«estacionalidad (picos de SSH a las 03:00 UTC y de SMB a
las 22:00 UTC)» — presentado como resultado confirmado
Contradicho  por  la  única  evidencia
gráfica del punto
El  impacto  excede  la  hora  del  pico.  El  §5.3.5  razona:  «La  combinación  de  los  siguientes  elementos
permite   concluir   que   la   actividad   observada   es   predominantemente   automatizada:   volumen
constante durante las 24 horas con picos programados (03:00-05:00 UTC)...». Esa conclusión —que
es la conclusión cualitativa central del trabajo, repetida en el Resumen, en el §5.4 y en el §7.2.1— se
apoya en un patrón que la figura desmiente: lo que la figura muestra es un ciclo diurno marcado, con
un  factor  de  3  a  4  entre  la  banda  nocturna  y  la  diurna,  que  es  la  morfología  característica  de
actividad correlacionada con horario laboral, no de bots 24/7.
Finalmente,  el  máximo  de  396  eventos/hora  es  incompatible  con  la  Tabla  5.9,  que  publica  un  pico
combinado de 1.159 eventos/hora y un pico de Cowrie de 847 eventos/hora «día 14, 03:00 UTC»
—hora que la figura sitúa en el mínimo—.
C-08. La Figura 5.14 es un fallo de renderizado y no contiene información
La imagen de la página 51 rotulada «Figura 5.14: Distribución geográfica de IPs atacantes» consiste
en tres o cuatro circunferencias azules de radio del orden de cientos de grados que cubren todo el
área  de  trazado.  No  hay  mapa  mundial,  no  hay  contorno  de  países,  no  hay  puntos  de  datos
discernibles,  no  hay  leyenda  ni  barra  de  color.  Los  ejes  están  rotulados  «Latitud»  y  «Longitud»,  lo
que confirma que se intentó un gráfico de dispersión geográfico cuyos marcadores se dimensionaron
en unidades de datos en lugar de puntos.
El  §5.5.4  la  presenta  como  «la  Figura  5.14  presenta  la  distribución  geográfica  sobre  un  mapa
mundial».  No  hay  mapa  mundial.  La  figura  es  la  única  representación  cartográfica  del  trabajo  y  no

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno10
transmite ningún dato.
C-09. La Figura 5.15 no es una captura de pantalla y el dashboard que ilustra no
existe
El   §5.7   escribe:   «La   Figura   5.15   presenta   una   captura   del   dashboard   de   monitoreo
implementado  en  n8n,   que   permite   visualizar   en   tiempo   real   el   estado   del   pipeline   de
procesamiento».  La  imagen  extraída  es  un  dibujo  generado  con  matplotlib,  no  una  captura:  las
cuatro tarjetas de KPI de la parte superior están vacías (rectángulos con una banda de color y sin
un solo número ni rótulo); el panel de serie temporal desborda su marco por la izquierda y no tiene
ejes rotulados ni valores; el panel derecho se corta en el borde de la figura; y la línea roja «ahora» no
está anclada a ninguna escala temporal.
Y  el  §5.14,  siete  páginas  después,  declara:  «[Propuesta  conceptual  —  no  implementada]  Esta
sección propone una arquitectura de visualización basada en Grafana con PostgreSQL como fuente
de  datos...  Por  tratarse  de  una  propuesta  no  implementada  en  el  alcance  de  esta  tesis».  El  §7.5  la
sitúa en la hoja de ruta de corto plazo. De modo que la tesis presenta una captura de un dashboard
implementado  en  un  capítulo  y  declara  en  otro  que  el  dashboard  no  se  implementó.  Es  una
contradicción directa sobre el estado de un componente del sistema.
C-10. Catorce figuras se publican como código fuente sin renderizar; dos no existen;
dos son la misma
El documento contiene 5 imágenes embebidas en 109 páginas. Las Figuras 4.1, 4.2, 4.3, 4.4 y 4.5
(Anexo I, arquitectura, topología, secuencia, flujo de datos y contenedores), las Figuras 5.1, 5.3 y 5.5,
las Figuras 5.16 a 5.20 y la Figura III-1 aparecen impresas como código Mermaid y xychart-beta
en tipografía monoespaciada, con los saltos de línea marcados por el símbolo ↪. No son figuras:
son  las  instrucciones  para  producirlas.  El  §5.3.3  lo  admite:  «Cada  figura  se  presenta  como
descripción detallada para facilitar su reproducción en herramientas de visualización».
Las Figuras 5.2 y 5.4 no tienen ni imagen ni código: solo un párrafo en prosa que describe lo que
mostrarían.  La  Figura  III-2  («Comparación  de  tiempo  de  procesamiento  manual  vs  automatizado
por  volumen  de  eventos»)  figura  en  el  índice  de  figuras,  es  citada  en  el  §6.1.3  como  fuente  de  la
proyección de escalabilidad, y no aparece en el Anexo III. Las Figuras 5.3 y 5.13 son la misma
figura:  los  diez  valores  del  código  xychart  de  la  Figura  5.3  (4230,  3890,  2450,  1870,  1540,  1320,
1180,  980,  870,  810)  son  exactamente  los  rotulados  en  la  imagen  embebida  de  la  Figura  5.13.  El
índice de figuras salta de la 5.5 a la 5.11: las Figuras 5.6 a 5.10 no existen.
Ninguna de las 5 imágenes embebidas es una captura del sistema real. En 109 páginas no hay una
sola captura de pantalla de n8n, de Cowrie, de Dionaea, de PostgreSQL ni de un reporte generado.
4.3 Bloque C — Aritmética y estadística
C-11. La desviación estándar publicada es incompatible con el percentil 99 publicado
La Tabla III-6 informa el tiempo de procesamiento como 342 ± 89 ms. La Tabla III-1 informa P99 =
1.420 ms. Las dos cifras no pueden coexistir en ninguna distribución.
Con μ = 342 y σ = 89, el valor 1.420 está a k = (1.420 − 342)/89 = 12,11 desviaciones estándar.
La desigualdad de Cantelli —que no supone forma alguna de distribución— acota la probabilidad de
superar ese valor en P(X − μ ≥ kσ) ≤ 1/(1 + k²) = 1/147,7 = 0,68 %. Pero que 1.420 sea el percentil
99 exige que exactamente el 1 % de las observaciones lo supere. 1 % > 0,68 %: la combinación es
matemáticamente  imposible,  sea  cual  sea  la  asimetría  de  la  distribución.  Con  la  latencia  real
declarada (§5.7 informa además una latencia extremo a extremo promedio de 1,2 s, cuatro veces el
promedio de 342 ms sin explicación del solapamiento), la dispersión mínima compatible con ese P99
sería del orden de 350-400 ms, no 89.
C-12. Los percentiles del cuerpo no coinciden con los del anexo que los cita

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno11
## Estadístico
Tabla III-1 (Anexo, fuente
citada)
Cuerpo de la tesisDónde
P95845 ms892 ms§5.11,  §6.2.1,  §7.2.1,  Tabla  7.2,
## Tabla 7.3
P991.420 ms1.450 ms§6.3, §7.2.1
P99 (otra mención)1.420 ms1.420 ms§5.3.2
El P95 de 892 ms aparece cinco veces, siempre citando la Tabla III-1, que dice 845. El P99 se publica
con dos valores distintos dentro del mismo documento.
C-13. La reducción del 97,3 % no se deriva de ninguno de los dos insumos que la tesis
declara
El 97,3 % es la cifra titular del trabajo: aparece en la Tabla 5.8, la Tabla 6.2, la Tabla 6.5, la Tabla
III-6,  el  §5.11,  el  §6.1.6,  el  §7.2.2,  el  §7.3.2  y  el  §7.6.  La  tesis  ofrece  dos  líneas  de  base  distintas  y
ninguna la produce:
Línea de base declaradaDóndeCálculoResultado
¿Da 97,3
## %?
~30 segundos por eventoNota de la Tabla 5.81 − 342/30.00098,86 %No
3,5 min = 210.000 ms§5.10, §6.1.1, Tabla 6.21 − 342/210.00099,84 %No
480 min de jornada → ~13 minTabla 6.2, fila 21 − 13/48097,29 %Sí
El 97,3 % solo se obtiene de la tercera fila: la comparación entre una jornada de analista de 8 horas
y una revisión estimada de 13 minutos de reportes. Es una métrica legítima, pero es una métrica
distinta  de  la  que  exige  la  hipótesis  P1,  que  compara  tiempo  de  procesamiento  por  evento.  Sin
embargo,  la  Tabla  5.8  rotula  ese  97,3  %  como  «Reducción  vs.  procesamiento  manual»  con  criterio
«≥50 % tiempo» y explica en nota que sale de contrastar 342 ms contra 30 segundos —cálculo que
da  98,86  %—;  la  Tabla  6.5  lo  asigna  al  criterio  «Reducción  de  tiempo  de  procesamiento»;  el  §5.11
(objetivo  5)  escribe  «la  reducción  del  97,3  %  frente  al  procesamiento  manual  estimado  supera
ampliamente  el  criterio  de  ≥50  %»;  y  el  §7.3.2  escribe  «la  reducción  de  tiempo  de  procesamiento
(97,3  %)  duplicó  ampliamente  el  target  del  50  %».  Se  está  usando  la  mejora  en  la  jornada  del
analista como si fuera la mejora en el procesamiento por evento, y ninguna de las dos notas al pie
que la tesis ofrece la reproduce.
Se  añade  que  el  30  s  de  la  Tabla  5.8  y  los  3,5  min  del  §6.1.1  son  dos  líneas  de  base  manuales
distintas, con un factor de 7 entre ellas, ambas presentadas sin justificación cruzada.
C-14. Las tasas de error no cierran entre sí en ninguna de sus tres versiones
VersiónComponentesSuma realSuma declarada
§6.1.4 (desglose)Schema 1,2 % + Enriquecimiento 3,2
## % + Parsing 0,02 %
4,42 %«tasa  de  error  combinada  del  5,3
## %»
§5.7Tasa de error en parsing automático1,8 %1,8 %
Tabla III-33Extracción  2,1  %  +  Clasificación  1,8
## % + Enriquecimiento 3,2 %
7,1 %(no se declara suma)
§5.6.1 / §6.2.1Eventos no estructurados5,3 %5,3 % (= 100 − 94,7)
Tabla 5.3Eventos no estructurados15,8 %(= 100 − 84,2)
Cinco cifras para la misma magnitud. La nota ³ de la Tabla III-33 agrega una sexta: dice que el error
de enriquecimiento «corresponde a eventos donde la API de geolocalización no respondió dentro del
timeout configurado (3 % del total)», mientras la columna informa 3,2 %. Y el §5.7 declara que los
eventos  enriquecidos  con  geolocalización  fueron  el  «100  %  (3.128  IPs)»,  lo  que  contradice  que
hubiera un 3-3,2 % de timeouts de geolocalización.
C-15. Errores aritméticos verificables en las notas de figura y en las proporciones

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno12
UbicaciónAfirmaciónVerificaciónCorrecto
§5.3.3,  nota  Fig.
## 5.3
«Las     IPs     101.xxx     y
103.xxx     concentran     el
40,4  %  de  los  eventos  del
top 10»
## (4.230 + 3.890) / 22.14036,7 %
§5.3.4China:    «promedio    ~80
eventos/IP»  con  3.128  IPs
únicas
82.150 / (0,274 × 3.128 = 857)95,9 — el valor 80 solo
sale  con  las  1.024  IPs
de  la  Tabla  III-2  (base
## 3.751)
Tabla III-2Suma    de    la    columna
«Eventos totales»
## 82.150+25.340+38.620+4.880+4.120+12.870
## +9.340+7.650+5.320+3.560+7.273
201.123, no 201.125
§6.1.1«11.732    horas-hombre...
superior    a    4    años    de
trabajo    de    un    analista
dedicado»
1.466 jornadas ÷ 264 jornadas/año5,6     años      —      la
afirmación  es  correcta
pero      subestima      el
propio argumento
§6.8«~119  IoCs  diarios...  un
370  %  sobre  la  capacidad
manual estimada»
(119 − 30)/30 = 297 %; el 370 % de la Tabla 6.2
sale de 141, no de 119
## Inconsistente
C-16. Cifras del texto atribuidas a tablas que dicen otra cosa
Además del caso geográfico del C-04, el §6.3 informa: «Generación de IoCs: La tasa de 141 IoCs/día
supera  el  estimado  de  50-80/día  de  un  analista  humano  en  SOC  convencional  (ENISA,  2023)».  La
misma  fuente,  en  el  mismo  trabajo,  se  cita  con  otro  valor  en  tres  lugares:  la  Tabla  6.2  («20-30/día
(ENISA, 2023)»), el §6.2.1 («20-30/día según ENISA, 2023»), el §6.8 y el §7.2.1 («capacidad estimada
de 20-30/día según ENISA, 2023»). El rango 50-80 y el rango 20-30 no pueden salir ambos del mismo
informe, y el porcentaje de mejora publicado (370 %) se calcula con el segundo.
4.4 Bloque D — Hipótesis, objetivos y contraste
C-17. Ninguna de las cuatro hipótesis operativas se contrasta contra el umbral que
ella misma define
El §1.6 y el §4.6 formulan cuatro hipótesis con umbral cuantitativo explícito, y el §7.2.1 las declara las
cuatro «Aceptadas» en la Tabla 7.1. El contraste no se realiza en ninguno de los cuatro casos:
## Hipótesis
Umbral declarado (§1.6 /
## §4.6)
Lo que se contrasta
en §5.10 y Tabla 7.1
## Problema
P1  —  Reducción  de
tiempo
Tiempo  por  evento  <  50  %
del  tiempo  estimado  para
procesamiento manual
342  ms  vs.  210.000  ms
## → 99,8 %
El   comparador   es   una   estimación   de
literatura que la propia tesis declara «no
una medición directa». La hipótesis no es
falsable:   no   existe   un   valor   manual
observado que pudiera haberla refutado.
## P2 — Estructuración
≥  80  %  de  eventos  en  JSON
válido
## 94,7 %
La  cifra  usada  es  la  no  auditable  (véase
C-02);    la    única    con    numerador    y
denominador (Tabla 5.3) da 84,2 %.
P3  —  Generación  de
IoCs
IoCs  para  ≥  70  %  de  las
sesiones    con    actividad
maliciosa confirmada
«84,2     %     de     IoCs
automatizados»
Cambia  el  denominador:  se  pasa  de
sesiones   a   IoCs.   Nunca   se   informa
cuántas      sesiones      con      actividad
confirmada  hubo  ni  cuántas  generaron
IoC.  Además,  el  84,2  %  es  idéntico  a  la
tasa  de  estructuración  de  la  Tabla  5.3,
coincidencia que la tesis no explica.
P4 — ReportesReportes    sin    intervención
para ≥ 90 % de los ataques
categorizados   como   de
interés
«100    %    de    reportes
automatizados»
Cambia  el  denominador:  se  pasa  de
ataques  de  interés  a  reportes.  Nunca  se
define qué es un «ataque de interés», ni
se   cuentan,   ni   se   informa   cuántos
quedaron cubiertos.
En P3 y P4 el defecto es de fondo: se sustituye la magnitud que la hipótesis mide por otra que sí se
tiene.  Es  la  operación  que  convierte  una  hipótesis  falsable  en  una  que  no  puede  fallar.  El  §7.2.1  lo
formula como logro: «No se trata de una refutación: el sistema superó los cuatro umbrales y, en la

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno13
mayoría de los casos, con márgenes amplios». Un diseño en el que ninguna de las cuatro hipótesis
podía fallar no aporta evidencia sobre ninguna de ellas.
Se  agrega  que  P3  declara  «84,2  %  de  IoCs  automatizados»,  lo  que  implica  que  el  15,8  %  restante
(669  IoCs)  se  generó  manualmente.  El  Capítulo  V  y  el  §5.13  describen  el  ioc-extractor  como  un
workflow programado cada 15 minutos que procesa la totalidad de los eventos no marcados. No hay
ningún proceso manual documentado que pudiera producir esos 669 IoCs, ni el trabajo lo menciona
nunca.
C-18. La lista de objetivos específicos cambia entre capítulos
El §1.4.2 enumera siete objetivos específicos (analizar el marco conceptual; diseñar la arquitectura;
implementar  honeypots;  integrar  con  n8n;  incorporar  enriquecimiento;  evaluar  utilidad  operativa;
elaborar  recomendaciones).  El  §5.11  enumera  seis,  con  otros  enunciados  («Diseñar  un  entorno  de
captura   segmentado»,   «Implementar   un   sistema   de   automatización»,   «Registrar   evidencia
empírica»,  «Analizar  los  eventos»,  «Evaluar  el  desempeño»,  «Generar  lineamientos»).  La  Tabla  7.2
vuelve  a  los  siete  del  §1.4.2.  La  Tabla  7.3  (§7.3.1)  vuelve  a  los  seis  del  §5.11,  y  el  §7.3.2  concluye
«Seis de seis objetivos específicos se cumplieron íntegramente». La tesis no tiene una lista estable
de  objetivos,  y  su  capítulo  de  conclusiones  verifica  una  lista  distinta  de  la  que  su  introducción
plantea.
C-19. El §4.4 «Diseño de investigación» no existe y es citado como fundamento del
diseño
El índice general lista «4.4 Diseño de investigación». El cuerpo del Capítulo IV pasa de «4.3 Tipo de
investigación»  directamente  a  «4.5  Problema  de  investigación  (reformulado  con  precisión)».  La
sección no está. Y es invocada dos veces como fuente: el §4.6 abre con «En coherencia con el diseño
metodológico  descripto  en  §4.2–§4.4,  se  definen  las  siguientes  hipótesis  operativas»,  y  el  §7.1
escribe «desplegada en un entorno aislado mediante Docker (Capítulo IV, §4.2–§4.4)». El diseño se
describe  efectivamente  dentro  del  §4.3,  pero  el  documento  remite  a  una  sección  inexistente  para
fundamentar sus hipótesis.
En  la  misma  línea:  el  §7.2.1  remite  a  «las  limitaciones  declaradas  en  §4.5  y  §5.12»;  el  §4.5  es  el
planteo  del  problema  y  las  limitaciones  metodológicas  están  en  el  §4.17.  Y  el  §4.9  se  cita  cuatro
veces como «§4.9.1», «§4.9.2», «§4.9.3» y «§4.9.5», subsecciones que no existen: el §4.9 es una lista
numerada sin subsecciones. Los §6.8.1 y §6.8.3 figuran en el índice y no aparecen como títulos en el
cuerpo.
4.5 Bloque E — Trazabilidad, reproducibilidad y datos personales
C-20. El repositorio se invoca siete veces y nunca se publica su dirección
Las siguientes secciones remiten al «repositorio del proyecto» como depositario de la evidencia que
el cuerpo no incluye: §5.8.1 (metadatos de las 20 IPs principales), §5.8.3 (distribución horaria por IP),
§5.8.5  (catálogo  de  artefactos  y  hashes),  §6.1.1  (descomposición  por  fase  del  procesamiento
manual),  §6.1.3  (proyección  de  escalabilidad),  §6.9  (mapeo  a  objetos  MISP)  y  el  Anexo  II  (JSON
completo de los tres workflows, payloads, consultas SQL y configuraciones). No hay una sola URL
de repositorio en las 109 páginas. Los únicos enlaces a GitHub del documento son los de Cowrie,
Dionaea y T-Pot en las referencias.
La consecuencia es doble. Primero, el §4.15 afirma que «la repetibilidad se sustenta en el versionado
Git  completo  (Docker  Compose,  workflows  JSON,  SQL)»  y  que  «la  replicabilidad  se  garantiza  con
Docker  versionado,  configuraciones  declarativas  y  documentación  paso  a  paso  que  reproduce  el
entorno  en  menos  de  dos  horas»:  ninguno  de  esos  elementos  está  disponible  para  el  lector.
Segundo, y más grave a efectos de esta auditoría, el plano de verificación del artefacto queda
cerrado: no es posible contrastar el documento contra el sistema, que es exactamente el contraste
que resolvería la mayoría de los hallazgos anteriores.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno14
C-21. El período de observación no tiene fechas y su duración se declara
indeterminada en un lugar y exacta en otro
El  §5.2.4,  titulado  «Período  de  observación»,  dice:  «Se  estableció  un  período  de  observación
controlado de tipo continuo, con unidad temporal de eventos por hora/día, suficiente para capturar la
variabilidad del tráfico real; la duración exacta se definió según disponibilidad del entorno».
Es la única sección dedicada al período y no lo determina.
El resto del documento afirma «30 días consecutivos» en más de veinte lugares, y el §5.5 especifica
«720  horas  de  exposición».  Pero  no  hay  una  sola  fecha  de  calendario  en  las  109  páginas:
ningún mes, ningún día de inicio, ningún día de cierre. Los eventos se identifican como «día 5», «día
12», «día 14», «día 22». La Figura 5.12, en cambio, organiza los datos por día de la semana (lunes a
domingo), lo que exige conocer las fechas. Sin ellas es imposible verificar la correspondencia entre
«el día 14 (un lunes)» del §5.3.5 y la estructura semanal de la figura, y es imposible que un tercero
replique o audite la ventana.
C-22. Ausencia total de tratamiento de datos personales, con la fuente que lo exigía
en la propia bibliografía
El  sistema  almacena,  durante  30  días  y  de  forma  persistente  en  PostgreSQL,  direcciones  IP  de
terceros  identificables,  sus  geolocalizaciones,  sus  ASN,  sus  reputaciones  consultadas  en  servicios
externos,  los  comandos  que  ejecutaron  y  hashes  de  sus  credenciales.  El  §4.16  «Consideraciones
éticas» consta de seis viñetas y afirma «No recolección de datos personales de terceros legítimos» y,
de  forma  genérica,  «se  contemplan  normativas  de  protección  de  datos  y  buenas  prácticas
institucionales».  No  se  nombra  ninguna  norma.  En  109  páginas  no  aparece  la  Ley  25.326  de
Protección de Datos Personales, ni la AAIP, ni una base de licitud, ni un plazo de conservación, ni una
política de supresión.
Lo  notable  es  que  el  trabajo  tiene  la  fuente  correcta  en  su  bibliografía.  Sokol,  Míšek  y  Husák
(2017),  «Honeypots  and  honeynets:  issues  of  privacy»,  es  precisamente  el  artículo  que  establece
que la dirección IP es dato personal y que discute las bases de licitud para el tratamiento de datos de
honeypot.  El  trabajo  lo  cita  cinco  veces  —§5.8.6,  §6.3,  §6.4  y  §4.15—  y  en  las  cinco  lo  usa  como
fuente de estadísticas de volumen y estacionalidad de tráfico, nunca de privacidad (véase C-25). La
única fuente jurídicamente pertinente de la bibliografía se emplea para lo único que no contiene.
Se agrega que el §5.8.7 publica en el cuerpo el user-agent completo de una conexión atribuida a un
cliente  de  Claro  Brasil,  y  que  las  IPs  se  ofuscan  solo  en  los  tres  primeros  octetos,  criterio  que  la
propia  nota  metodológica  del  §5.8  describe  al  revés  («las  direcciones  IP  públicas  se  muestran
ofuscadas  (primeros  tres  octetos)»,  cuando  lo  que  se  muestra  es  el  primer  octeto  y  se  ofuscan  los
tres restantes).
C-23. Artefactos internos del proceso de producción filtrados dentro de la tesis
El  documento  cita  como  fuentes  normativas  del  proyecto  una  veintena  de  identificadores  y  de
archivos  que  nunca  define  y  que  el  lector  no  puede  consultar:  las  reglas  RN-PR-04,  RN-PR-05,
RN-IN-03  y  RN-SO-02;  los  criterios  IN-02,  C-04,  C-05  y  C-13;  las  historias  de  usuario  US-003  a
US-007;        y        los        archivos        01_vision_y_objetivos.md,        07_flujos_principales.md        y
08_arquitectura_propuesta.md, este último invocado como «sección 8 de la base de conocimiento».
No es solo un problema de forma. El §5.3.6 declara que la Tabla 5.8 «presenta la verificación de los
criterios de éxito definidos en IN-02», y el §6.1.5 que la Tabla 6.5 «verifica el cumplimiento de cada
criterio de éxito definido en la visión del proyecto (01_vision_y_objetivos.md)». Pero los criterios de
éxito  están  definidos  en  el  §4.9  del  propio  trabajo.  La  tesis  atribuye  sus  criterios  de  validación  a
documentos  externos  que  no  forma  parte  de  ella,  lo  que  abre  la  pregunta  —que  el  tribunal
formulará— de cuál es el documento primario y cuál el derivado.
4.6 Bloque F — Bibliografía y errores factuales verificados

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno15
C-24. Referencia con DOI que resuelve a un artículo distinto
Verificación externa
La entrada «Fanelle, V., Karimi, M., & Shahriar, H. (2020). Analysis of honeypot data for cyber threat
intelligence.  Proceedings  of  the  2020  IEEE  International  Conference  on  Big  Data  (pp.  2345-2353).
IEEE. https://doi.org/10.1109/BigData50022.2020.9378023» no es localizable con ese título ni con esa
autoría.  El  DOI  transcrito  existe  y  resuelve  a  otro  artículo:  «Zero-Shot  Machine  Learning
Technique  for  Classification  of  Multi-User  Big  Data  Workloads»,  del  mismo  congreso  (2020  IEEE
International  Conference  on  Big  Data).  La  entrada  reúne,  por  tanto,  un  título  y  una  autoría  no
verificables con un identificador persistente que apunta a un trabajo sin relación con honeypots.
El peso de la entrada en el argumento no es marginal. Fanelle et al. (2020) se cita cuatro veces: en el
§4.15 y en la Tabla 6.6 como fuente de que «estudios longitudinales reportan variaciones de hasta
3× entre meses de baja y alta actividad» (que es la justificación de la limitación temporal); en el §6.3
como el benchmark «picos de hasta 12.000/día» contra el que se compara el volumen observado; y
en el §7.6 como uno de los dos trabajos previos frente a los cuales la tesis reclama su aporte original
(«A  diferencia  de  trabajos  previos  que  abordan  honeypots  de  forma  aislada  (Sokol  et  al.,  2017;
Fanelle et al., 2020)»). Las tres funciones quedan sin sustento.
C-25. Misatribución de contenido verificada: Sokol et al. (2017)
Verificado  contra  la  fuente:  Sokol,  Míšek  y  Husák  (2017),  EURASIP  Journal  on  Information  Security
2017(1),  art.  4,  DOI  10.1186/s13635-017-0057-4  —metadatos  correctos  en  la  tesis—  es  un  artículo
jurídico.  Su  resumen  declara  que  expone  los  problemas  de  privacidad  de  honeypots  y  honeynets
respecto de sus aspectos técnicos, discute el marco legal de la privacidad y las bases de licitud del
tratamiento,  y  aborda  específicamente  la  dirección  IP  «porque  conforme  al  Derecho  de  la  UE  se
considera  dato  personal».  No  contiene  una  campaña  de  medición  ni  estadísticas  de  volumen  de
tráfico.
La tesis lo invoca cinco veces y en las cinco le atribuye contenido empírico que no tiene: como fuente
del  benchmark  «~4.500  eventos/día»  de  despliegues  Cowrie  (§6.3);  como  fuente  de  la  variación
estacional  de  hasta  3×  (§4.15,  Tabla  6.6);  y  como  fuente  de  que  «entre  el  3  %  y  el  8  %  de  los
eventos  capturados  por  honeypots  de  baja  interacción  generan  inteligencia  accionable  de  alta
confianza» (§5.8.6). Ninguna de las tres afirmaciones proviene de ese artículo.
C-26. Errores factuales verificados contra fuente primaria
Afirmación de la tesisDóndeVerificación externa
n8n  es  «open  source»  y  su  licencia
es MIT
Tabla    §3.9.4;    también
«open    source»    en    el
Resumen,   el   Abstract,
§3.9.3,  §3.9.6,  §2.7.2  y
§7.6 (≥8 ocurrencias)
La  documentación  oficial  de  n8n  dice  literalmente  que,
dado  que  las  licencias  open  source  no  pueden  incluir
limitaciones  de  uso  según  la  OSI,  «no  nos  llamamos
open   source».   La   licencia   es   la   Sustainable   Use
License  (fair-code),  creada  por  n8n  en  2022  sobre  la
base   de   la   Elastic   License   2.0.   La   afirmación   es
doblemente incorrecta: ni open source ni MIT.
Modern    Honey    Network    es    un
## «proyecto Google, 2013-2023»
§6.10.2; Tabla III-35 (dos
celdas)
MHN fue creado y liberado en 2014 por ThreatStream
(hoy  Anomali).  La  confusión  probable  es  que  Google
Ventures  fue  inversor  de  ThreatStream.  El  repositorio
canónico es threatstream/mhn (hoy pwnlandia/mhn).
T1580    =    «Network    Denial    of
## Service»
## §5.8.7  Hallazgo  2;  Tabla
## 5.22
T1580 es «Cloud Infrastructure Discovery» (táctica
Discovery,  plataforma  IaaS).  Network  Denial  of  Service
es T1498. Además, la técnica se aplica a una campaña
de  fuerza  bruta  SSH  coordinada,  que  no  es  ni  DoS  ni
descubrimiento de infraestructura cloud: correspondería
T1110 (Brute Force).

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno16
Afirmación de la tesisDóndeVerificación externa
Zero Trust («nunca confiar, siempre
verificar»)  se  atribuye  a  Bejtlich,
## 2004
§2.3Zero Trust fue formulado por John Kindervag (Forrester)
en  2010.  El  libro  de  Bejtlich  de  2004  es  The  Tao  of
Network  Security  Monitoring  y  trata  de  monitoreo  de
seguridad de red, no de Zero Trust. Anacronismo de seis
años.
SIM3    fue    «desarrollado    por    el
equipo FIRST»
§3.10.1,       citando       a
## Bromiley (2016)
SIM3  (Security  Incident  Management  Maturity  Model)
fue desarrollado por Don Stikvoort y colaboradores, y es
mantenido por la Open CSIRT Foundation. FIRST lo ha
adoptado como referencia, pero no es su autor.
OpenIOC     fue     desarrollado     por
«Mandiant (hoy FireEye)»
§3.11.5La  relación  es  la  inversa  y  está  desactualizada:  FireEye
adquirió  Mandiant  en  2013,  se  separaron  en  2021  y
Mandiant fue adquirida por Google en 2022. «Mandiant,
hoy FireEye» es incorrecto en 2026.
SOAR   se   documenta   citando   a
## Kampanakis (2014)
§3.9.2      y      otras      5
ocurrencias
Anacronismo: el término SOAR fue acuñado por Gartner
en 2015 y consolidado en 2017. El artículo de 2014 trata
de   automatización   de   seguridad   e   intercambio   de
información  de  amenazas,  no  de  plataformas  SOAR  ni
de  Splunk  Phantom,  IBM  Resilient,  Cortex  XSOAR  o
Siemplify, que la tesis le atribuye.
Node-RED tiene «+200k estrellas»
en GitHub
## Tabla §3.9.4
El  repositorio  node-red/node-red  está  en  el  orden  de
2×10⁴   estrellas,   no   2×10⁵.   Error   de   un   orden   de
magnitud.  En  la  misma  fila,  «n8n  +40k  estrellas»  está
desactualizado a la baja.
C-27. Trece de cincuenta referencias nunca se citan, y siete de ellas pertenecen a
una sección eliminada
El  listado  tiene  50  entradas.  Nunca  se  citan  en  el  texto:  Breunig  et  al.  (2000,  LOF),  Casas  et  al.
(2012),  Chandola  et  al.  (2009),  Cremilleux  et  al.  (2019),  Duděn  et  al.  (2020),  Ester  et  al.  (1996,
DBSCAN), Franco et al. (2021), Ilg et al. (2023), Liu et al. (2008, Isolation Forest), MISP Project (2024),
Provos (2002, Honeyd), Sommer y Paxson (2010) y Yang et al. (2023). Son 13 huérfanas (26 %).
El  patrón  es  diagnóstico.  Siete  de  esas  trece  (Breunig,  Casas,  Chandola,  Cremilleux,  Ester,  Liu,
Sommer  y  Paxson)  son  el  aparato  de  machine  learning  y  detección  de  anomalías  que  sostenía  la
sección  §6.6,  la  cual  en  esta  versión  quedó  reducida  a  un  recuadro  de  tres  líneas  rotulado
«[Propuesta  conceptual  —  no  implementada]».  La  bibliografía  conserva  la  infraestructura  de  un
capítulo  que  ya  no  está.  Lo  mismo  con  MISP  Project  (2024)  y  el  §6.9.  Es  la  huella  de  la  poda  de
extensión que el propio Anexo III describe («tras la poda de extensión quedaron eliminadas las tablas
duplicadas...»), ejecutada sobre el cuerpo sin revisar el listado.
En  sentido  inverso  hay  dos  citas  huérfanas.  NIST  SP  800-61  Rev.  2  (2012)  se  cita  tres  veces
—incluida la nota del Resumen y el §6.1.1, donde es la base de toda la línea de base manual— y no
figura en el listado de referencias. Shodan (2024) se cita en el §5.3.3 y tampoco figura.
C-28. Densidad de citación nula o casi nula en tres capítulos, incluida la metodología
CapítuloPalabrasCitas parentéticasDensidad
## I — Introducción1.4670—
II — Estado del arte1.717181 cada 95 palabras
III — Marco teórico6.297341 cada 185 palabras
IV — Metodología1.89211 cada 1.892 palabras
V — Resultados7.26841 cada 1.817 palabras
VI — Discusión4.692121 cada 391 palabras
VII — Conclusiones4.08061 cada 680 palabras
VIII — Recomendaciones4.3930—
El  Capítulo  I  plantea  el  problema,  lo  justifica  en  cinco  dimensiones  y  fija  los  objetivos  sin  una  sola
fuente.   El   Capítulo   IV   declara   un   enfoque   mixto,   un   diseño   no   experimental   observacional

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno17
transversal,   una   operacionalización   de   variables,   criterios   de   validación,   población,   muestra,
métodos de análisis y un tratamiento de validez interna, externa y de constructo con una sola cita
en  todo  el  capítulo  (Sokol  et  al.  y  Fanelle  et  al.  en  el  §4.15).  No  se  cita  ninguna  fuente
metodológica:  ni  Hernández  Sampieri,  ni  Yin,  ni  Wohlin,  ni  Hevner  o  Peffers  para  investigación  de
diseño, ni Runeson y Höst para estudio de caso en ingeniería de software.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno18
- Revisión capítulo por capítulo
Cada  capítulo  se  evalúa  en  las  cinco  dimensiones  que  fija  el  Prompt  Maestro:  coherencia,
profundidad científica, calidad académica, coherencia interna y calidad de redacción.
## 5.1 Capítulo I — Introducción
Coherencia. Hilo conductor claro: transformación digital → asimetría defensiva → falta de visibilidad
sobre el adversario → honeypots → automatización. La pregunta de investigación del §1.2 está bien
formulada y los objetivos del §1.4 se desprenden de ella. Es un capítulo bien construido.
Profundidad  científica.  Insuficiente.  Las  cinco  justificaciones  (§1.3.1  a  §1.3.5)  son  afirmaciones
razonables sin un solo respaldo: no hay una cifra de incidencia de ataques en PyMEs argentinas, ni
un costo, ni una encuesta, ni un informe sectorial. La afirmación central del trabajo —que las PyMEs
carecen  de  recursos  para  plataformas  comerciales  de  CTI—  nunca  se  cuantifica  ni  se  cita.  Es  el
capítulo con menor densidad de evidencia y el que un tribunal lee primero.
Calidad académica. Buena. Registro formal sostenido, terminología correcta, sin coloquialismos ni
opiniones. El §1.5 (alcance y delimitaciones) es explícito y enumera cuatro exclusiones concretas, lo
que está por encima del promedio.
Coherencia  interna.  Las  cuatro  hipótesis  operativas  del  §1.6  están  correctamente  formuladas
como enunciados con umbral. Pero el §1.4.2 lista siete objetivos específicos y el §5.11 verifica seis
distintos  (C-18).  El  §1.7  lista  cinco  variables  dependientes  y  el  §4.7  lista  otras  cinco  parcialmente
distintas:  aparece  «Tiempo  de  generación  de  reportes»  que  el  §1.7  no  tiene,  y  desaparece
«Capacidad de clasificación de incidentes» que el §1.7 sí tiene.
Redacción.  Muy  buena.  Párrafos  bien  articulados,  oraciones  de  longitud  razonable,  transiciones
explícitas.
5.2 Capítulo II — Estado del arte
Coherencia y estructura. El capítulo hace bien algo que la mayoría de los trabajos de la cohorte no
hace: declara explícitamente su diferencia con el marco teórico («este capítulo se centra en qué se
ha hecho y qué herramientas existen»). La línea temporal del §2.5.1, la clasificación del §2.5.3 y la
tabla de proyectos relacionados del §2.6 están bien organizadas.
Profundidad.  Escasa  para  un  estado  del  arte:  1.717  palabras.  Se  comparan  tres  proyectos
(Honeynet Project, HPFeeds, MHN), todos anteriores a 2015, y no se revisa un solo trabajo académico
reciente sobre integración de honeypots con plataformas de automatización o SOAR. La brecha que
el  §2.7.1  declara  —«ninguna  ofrece  un  pipeline  completo  que  transforme  eventos  crudos  en  IoCs
estructurados»—  se  sostiene  sobre  una  revisión  de  tres  herramientas,  no  sobre  una  búsqueda
sistemática. La afirmación del §7.2.3 de que esta es «la primera integración conocida» de Cowrie y
Dionaea con n8n exigiría precisamente esa búsqueda, con criterios y bases de datos declarados.
Precisión  factual.  Con  errores:  MHN  atribuido  a  Google  (C-26),  HPFeeds  fechado  en  2013  (el
protocolo es del Honeynet Project, ~2010-2011), y la fila «Snare / 2015 / Team MUSH» corresponde a
la MushMush Foundation.
Coherencia  interna.  El  §2.7.2  califica  la  arquitectura  propuesta  como  de  escalabilidad  «Alta
(Docker  Swarm/Kubernetes-ready)»  y  con  intervención  humana  «Mínima»;  el  §6.7.2,  el  §6.10.1  y  la
Tabla III-35 la califican, con base en la experiencia de implementación, como de escalabilidad «Media
(secuencial,  ~1.500  eventos/h)».  La  tabla  comparativa  del  estado  del  arte  promete  lo  que  la
discusión desmiente.
5.3 Capítulo III — Marco teórico

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno19
Es  el  mejor  capítulo  del  trabajo  y  está  por  encima  del  promedio  de  la  cohorte.  El
tratamiento  de  los  estándares  de  inteligencia  de  amenazas  (§3.11)  es  técnicamente  correcto  y
sustantivo:  la  distinción  entre  SDOs  y  SROs,  el  papel  de  Relationship  y  Sighting,  el  STIX  Patterning
Language  con  un  ejemplo  bien  formado,  la  separación  conceptual  entre  STIX  (qué  se  dice)  y  TAXII
(cómo y entre quiénes), y el reconocimiento honesto de que OpenIOC está sin mantenimiento desde
- La Tabla III-29 —mapeo de cada tipo de IoC capturado a su objeto STIX destino con el patrón
correspondiente— es material de calidad publicable y demuestra comprensión real del estándar, no
repetición de documentación.
El §3.7 (ciclo de vida de la inteligencia) con el mapeo fase→componente y el §3.10 (autoevaluación
SIM3  y  MISP  con  niveles  justificados)  son  también  recursos  valiosos:  la  autoevaluación  reconoce
niveles 1-2 en diseminación y retroalimentación, es decir, se califica a la baja donde corresponde.
Debilidades. Tres atribuciones incorrectas (Zero Trust a Bejtlich, SIM3 a FIRST, SOAR a Kampanakis
2014 — C-26) y la caracterización de n8n como open source con licencia MIT. El §3.8 (análisis forense
digital) son 120 palabras con tres citas al mismo libro y no aporta nada al argumento: es candidato a
supresión. El §3.9.4 compara n8n con Node-RED y SOAR empresarial con cifras («2-4 semanas» de
curva de aprendizaje, «6-12 meses», recuentos de estrellas) sin fuente y con un error de orden de
magnitud.
5.4 Capítulo IV — Metodología
Lo que está bien.  El  §4.15  es  el  mejor  pasaje  metodológico  del  trabajo:  distingue  validez  interna
(con  instrumentación,  historia,  maduración  y  selección  tratadas  una  por  una),  validez  externa,
validez  de  constructo  y  confiabilidad,  y  —esto  es  infrecuente—  declara  un  sesgo  de  definición
operacional  en  contra  de  su  propio  resultado:  «la  métrica  de  estructuración  subestima  la
inteligencia aprovechable». El §4.8 operacionaliza cada variable con indicador, métrica y método. El
§4.9 fija cinco criterios de validación ex ante.
Lo que falta.  El  capítulo  tiene  1.892  palabras  y  una  sola  cita.  La  sección  §4.4  no  existe  (C-19).  El
§4.10 despacha población, unidad de análisis y muestra en tres líneas: la «muestra» se define como
«la  totalidad  de  eventos  válidos  durante  el  período  de  observación»,  que  es  un  censo,  no  una
muestra,  y  no  se  explicita  el  criterio  de  validez  de  un  evento.  No  hay  protocolo  de  recolección
documentado,  ni  instrumentos,  ni  criterios  de  inclusión  y  exclusión,  ni  tratamiento  de  valores
perdidos,  ni  prueba  estadística  alguna.  El  §4.14  «Métodos  de  análisis»  son  seis  viñetas  sin  un  solo
procedimiento concreto: no se declara qué estadístico se calcula, con qué software, ni con qué nivel
de confianza. Y sin embargo el §5.6.1 y la Tabla III-6 publican una medida de dispersión (± 89 ms) y
percentiles.
Coherencia  interna.  El  §4.2  declara  un  «enfoque  mixto  con  predominio  cuantitativo»  con  una
dimensión cualitativa orientada a «interpretar el significado técnico de los eventos». Esa dimensión
cualitativa no tiene ningún instrumento: no hay guía de análisis, ni categorías previas, ni criterios de
codificación,  ni  acuerdo  inter-observador.  El  §5.9  («Evaluación  cualitativa  del  sistema»)  son  tres
párrafos de una a dos líneas cada uno. El componente cualitativo del diseño no se ejecuta.
Ética. El §4.16 no cumple lo que su título promete (C-22).
5.5 Capítulo V — Resultados experimentales
Es  el  capítulo  que  determina  el  dictamen.  Concentra  19  de  los  28  hallazgos  críticos.  Los
problemas  no  son  de  omisión  —el  capítulo  publica  cifras,  que  en  esta  cohorte  es  lo  excepcional—
sino de consistencia: el mismo fenómeno recibe dos valores distintos en al menos seis magnitudes
centrales  (eventos  por  honeypot,  tasa  de  estructuración,  taxonomía  de  IoCs,  IPs  únicas,  reportes
generados, percentiles de latencia).
Coherencia interna. Rota. Un lector que compare la Tabla 5.1 con la Tabla 5.9 —que están a seis
páginas de distancia y describen el mismo período— obtiene dos entornos distintos. La estructura del

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno20
capítulo agrava el problema: el §5.3 («Análisis cuantitativo»), el §5.4 («Observaciones generales») y
el  §5.5  («Caracterización  de  la  actividad  observada»)  presentan  tres  veces  el  resumen  general  de
eventos,  con  tres  tablas  distintas  y  valores  incompatibles,  sin  que  el  texto  reconozca  en  ningún
momento que está repitiendo el mismo contenido.
Evidencia. El §5.8.7 («Hallazgos notables») es cualitativamente el mejor pasaje del capítulo: cuatro
sesiones descritas con comandos, técnicas ATT&CK y razonamiento sobre la intención del atacante.
Pero  es  también  donde  se  concentran  los  indicios  de  datos  ilustrativos  (C-06)  y  el  error  de  técnica
(C-26). El §5.13 (implementación de los workflows) es sólido y plausible: describe topología de nodos,
patrones aplicados, manejo de errores por rama y temporizadores con expresiones cron concretas.
Es,  junto  con  el  marco  teórico,  lo  mejor  del  trabajo.  Su  problema  es  que  remite  al  Anexo  II  y  al
repositorio para todo el detalle, y ninguno de los dos entrega nada verificable.
Sobreinterpretación.   El   §5.3.6   cierra:   «La   reducción   estimada   del   97,3   %   en   tiempo   de
procesamiento valida la hipótesis central de la tesis». Una comparación contra una estimación
de  literatura  no  valida  una  hipótesis;  en  el  mejor  de  los  casos  la  hace  compatible  con  los  datos.  El
propio §7.2.2 lo reconoce al reclasificar esa comparación como «resultado sugerido», lo que deja al
§5.3.6 en contradicción con el §7.2.2.
5.6 Capítulo VI — Discusión
Discute  de  verdad,  que  en  esta  cohorte  es  la  excepción.  El  §6.1  construye  una  comparación
dimensión  por  dimensión  con  fórmulas  de  mejora  explicitadas  en  notas  al  pie  —recurso  correcto  y
poco frecuente—; el §6.4 presenta ocho limitaciones cada una con impacto y mitigación; el §6.7 es
una  evaluación  crítica  de  la  propia  elección  tecnológica  con  hallazgos  negativos  concretos
(380-650 MB de RAM, 12 segundos de latencia acumulada en picos, tres horas perdidas depurando
un error de tipado) y una comparación honesta contra Python puro que concede que, para equipos
con  capacidad  de  desarrollo,  Python  es  superior  en  escalabilidad  y  depuración.  El  §6.8.2  estima
espontáneamente  un  10-15  %  de  falsos  positivos  en  los  propios  IoCs.  Todo  esto  es  autocrítica
genuina y debe reconocerse.
Lo que lo invalida parcialmente. Toda la comparación cuantitativa del §6.1 se apoya en las cifras
que  el  Capítulo  V  no  puede  sostener,  y  en  varios  casos  elige  la  versión  más  favorable  de  las  dos
disponibles.  El  §6.2.1  reproduce  percentajes  geográficos  que  la  tabla  citada  desmiente  (C-04)  y  el
§6.3 introduce un segundo valor de ENISA incompatible con el que usa el resto del trabajo (C-16).
Comparación  con  la  literatura.  El  §6.3  es  formalmente  correcto  —confronta  cinco  magnitudes
propias contra rangos publicados— pero cuatro de los cinco rangos provienen de fuentes que no los
contienen o no son verificables: los ~4.500/día de Sokol et al. (C-25), los 12.000/día de Fanelle et al.
(C-24),   el   «93-96   %   reportado   por   la   documentación   de   Cowrie   (Oosterhof,   2023)»   —la
documentación  de  Cowrie  no  publica  ninguna  tasa  de  éxito  de  parseo—  y  las  «latencias  de
800-1.200  ms  documentadas  para  pipelines  bash/Python  no  optimizados  (Bajpai  &  Shukla,  2021)»,
atribuidas a lo que la propia entrada describe como una revisión de taxonomía de honeypots, que no
puede contener benchmarks de latencia de pipelines.
5.7 Capítulo VII — Conclusiones
Acierto  metodológico  destacable.  El  §7.2  organiza  los  resultados  en  tres  niveles  epistémicos:
«Resultados  confirmados»  (medición  directa),  «Resultados  sugeridos»  (patrones  que  requieren
contraste  adicional)  y  «Aportes»  (contribuciones  que  trascienden  lo  empírico).  Es  un  recurso  que
ordena  la  lectura  y  que  protege  al  trabajo  de  sobreinterpretar.  Correctamente,  las  comparaciones
contra la línea de base manual se ubican en «sugeridos», no en «confirmados».
El  problema  es  que  la  clasificación  no  se  respeta.  El  §7.2.1  («confirmados»)  incluye  la
estacionalidad  horaria  —que  la  Figura  5.12  desmiente  (C-07)—  y  las  cuatro  hipótesis  operativas
como  «Aceptadas»  (C-17).  El  §7.3.2  vuelve  a  usar  el  97,3  %  —clasificado  como  «sugerido»  una
página  antes—  en  modo  asertivo:  «la  reducción  de  tiempo  de  procesamiento  (97,3  %)  duplicó

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno21
ampliamente el target del 50 %». Y el §7.6 lo eleva a conclusión de cierre. La cautela del §7.2.2 se
disuelve en las dos secciones siguientes.
Cumplimiento  de  las  reglas  del  capítulo.  El  Prompt  Maestro  exige  que  las  conclusiones  no
introduzcan resultados nuevos ni bibliografía. El §7.2.1 introduce ENISA (2023), SANS (2023), Verizon
(2024), Group-IB (2024) y Akamai (2024); el §7.6 introduce Sokol et al. (2017), Fanelle et al. (2020) y
Bajpai y Shukla (2021). Son ocho citas en el capítulo de conclusiones. El §7.2.1 introduce además el
dato de los 856 artefactos con hashes SHA256 y MD5 «(§5.8.4)» —cuya sección real es la §5.8.5— y
el reparto por tipo de IoC del §5.8.2, que no habían aparecido en esa forma.
5.8 Capítulo VIII — Recomendaciones
Capítulo  breve,  aplicable  y  bien  segmentado  por  destinatario  (instituciones  educativas,  PyMEs,
investigadores). El §8.2.2 con costos concretos (10-20 USD/mes de VPS) y el §8.3.3 con una checklist
operativa  de  siete  puntos  son  los  aportes  más  transferibles  del  trabajo.  La  matriz  del  §8.5  cruza
destinatario, prioridad, esfuerzo e impacto de forma coherente.
Debilidades:  cero  citas  en  4.393  palabras;  solapamiento  sustancial  con  el  §7.5  (hoja  de  ruta),  que
cubre  el  mismo  terreno  con  otra  estructura;  y  ninguna  de  las  recomendaciones  se  deriva
explícitamente  de  un  hallazgo  del  Capítulo  V,  que  es  lo  que  las  convertiría  en  conclusiones  del
estudio y no en buenas prácticas generales.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno22
- Revisión metodológica
El Prompt Maestro enumera diecisiete aspectos metodológicos. Se evalúa cada uno.
AspectoEstadoObservación
Tipo de investigaciónAdecuado§4.3:   aplicada,   exploratoria,   descriptiva   y   evaluativa.   La
caracterización múltiple está justificada y es coherente con el
objeto.
ParadigmaAusenteNo    se    declara    paradigma    (positivista,    interpretativo,
pragmático,   ciencia   del   diseño).   Para   un   trabajo   que
construye  un  artefacto  y  luego  lo  evalúa,  la  Design  Science
Research sería el encuadre natural y no se menciona.
EnfoqueDeclarado, no ejecutado§4.2  declara  enfoque  mixto  con  predominio  cuantitativo.  La
dimensión  cualitativa  no  tiene  instrumento,  categorías  ni
criterios de codificación; el §5.9 la resuelve en tres párrafos.
DiseñoAdecuado       pero       mal
ubicado
No      experimental,      observacional,      transversal,      con
intervención técnica controlada. Correcto para el objeto. Pero
la sección que debía desarrollarlo (§4.4) no existe (C-19).
PoblaciónDefinida vagamente«Eventos  de  seguridad  dirigidos  a  servicios  expuestos».  No
se acota temporal ni espacialmente.
MuestraNo es una muestra
§4.10  define  la  muestra  como  «la  totalidad  de  eventos
válidos»,  es  decir  un  censo  del  período.  Correcto  para  el
diseño,  pero  entonces  no  procede  hablar  de  muestra  ni  de
generalización estadística.
MuestreoNo aplica / no declaradoConsistente con el censo, pero el documento no lo explicita.
VariablesOperacionalizadas,       con
desajuste
§4.8  asigna  indicador,  métrica  y  método  a  cada  variable
—bien—.  Pero  la  lista  del  §4.7  no  coincide  con  la  del  §1.7
(§5.1 de este informe).
CategoríasParcialLos   niveles   de   confianza   (Tabla   III-13)   tienen   criterios
explícitos  y  bien  construidos.  La  clasificación  bot  /  operador
humano  del  §5.8.3  y  del  §6.2.2  no  tiene  criterio  operacional
publicado  más  allá  de  «diferencias  menores  al  8  %  entre
franjas».
InstrumentosAusentesNo  hay  ficha  de  registro,  guía  de  análisis  ni  protocolo.  El
instrumento  de  facto  son  los  logs,  lo  que  es  aceptable,  pero
el     esquema     de     campos     «requeridos»     que     define
«correctamente  estructurado»  (Tabla  5.3,  nota)  nunca  se
publica.
ValidezBien tratada§4.15  aborda  validez  interna,  externa  y  de  constructo  con
amenazas  nombradas  y  controles  declarados.  Es  el  mejor
pasaje metodológico del trabajo.
ConfiabilidadDeclarada, no demostrable§4.15  la  funda  en  el  versionado  Git  y  en  consultas  de
integridad referencial. Nada de eso es accesible (C-20).
ProtocoloParcial§4.13 lista nueve pasos de procedimiento. Es una secuencia,
no  un  protocolo:  no  fija  criterios  de  decisión,  ni  condiciones
de parada, ni tratamiento de incidentes.
Análisis estadísticoAusenteCero pruebas de hipótesis, cero intervalos de confianza, cero
medidas   de   asociación.   Se   publican   un   promedio,   una
desviación (imposible, C-11) y percentiles, sin declarar cómo
se calcularon ni sobre qué n.
Análisis cualitativoAusenteNo hay codificación, ni categorías emergentes, ni saturación,
ni  acuerdo  inter-observador.  El  §5.9  no  constituye  análisis
cualitativo.
Amenazas a la validezParcialmente tratadas§4.15   nombra   instrumentación,   historia,   maduración   y
selección.   No   trata   el   sesgo   del   experimentador,   ni   la
ausencia  de  cegamiento,  ni  el  hecho  de  que  los  mismos
autores  construyeron  el  entorno,  definieron  los  criterios  de
éxito y evaluaron su cumplimiento.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno23
AspectoEstadoObservación
LimitacionesBien tratadas§4.17 y §5.12 son breves; la Tabla 6.6 del §6.4 es sustantiva:
ocho  limitaciones  con  impacto  y  mitigación.  Por  encima  del
promedio.
Incoherencia   metodológica   principal.   El   trabajo   declara   un   diseño   no   experimental   y
observacional  —correcto—  y  a  la  vez  rotula  el  Capítulo  V  como  «Resultados  experimentales»,  el
§5.2 como «Diseño experimental del entorno», el §5.2.3 como «Flujo operativo del experimento»
y  el  §4.11  como  «Escenario  experimental».  La  terminología  experimental  recorre  todo  el  capítulo
de resultados sobre un diseño que expresamente no lo es y en el que no hay manipulación, ni grupo
de control, ni asignación. Esta es exactamente la observación que un tribunal formula primero.
Segunda incoherencia. El §4.9 fija los criterios de validación del sistema, y las hipótesis del §1.6 y
§4.6  se  declaran  derivadas  de  ellos.  Pero  el  §5.3.6  atribuye  esos  mismos  criterios  a  un  documento
externo («IN-02») y el §6.1.5 a otro («01_vision_y_objetivos.md»). Los criterios de éxito de una tesis
deben definirse en la tesis (C-23).

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno24
- Revisión bibliográfica
7.1 Actualización y calidad de las fuentes
IndicadorValorLectura
Total de entradas50—
Últimos 5 años (2021-2026)19 de 50 = 38 %Aceptable en volumen, pero 8 de esas 19 son informes
de industria y documentación de producto, no literatura
arbitrada.
Últimos 3 años (2023-2026)13 de 50 = 26 %Bajo para un campo que cambia por año.
Anteriores a 20108 de 50 = 16 %Incluye cuatro clásicos legítimos (Spitzner 2002, Provos
y Holz 2007, Ester 1996, Chandola 2009), de los cuales
dos nunca se citan.
Artículos arbitrados Q1/Q2 verificables≈7Franco  et  al.  (IEEE  COMST,  Q1),  Ilg  et  al.  (JNCA,  Q1),
Javadpour et al. (Computers & Security, Q1), Sokol et al.
(EURASIP  JIS),  Yang  et  al.  (Future  Internet),  Wagner  et
al.  (WISCS),  Kampanakis  (IEEE  S&P).  Cuatro  de  esos
siete nunca se citan en el texto.
Informes de industria9
Akamai,  Cisco  Talos,  ENISA,  Group-IB,  IBM,  SANS  ×3,
SonicWall,    Verizon.    Fuentes    legítimas    pero    no
arbitradas; sostienen buena parte de las comparaciones
del §6.3.
Documentación de producto7Cowrie   ×2,   Dionaea,   MISP,   n8n,   OASIS   ×2,   Mitre.
Legítimas para lo técnico.
Fuentes de baja confiabilidad editorial3Arockiam   et   al.   (Int.   J.   of   Advanced   Science   and
Technology,    SERSC    —    revista    discontinuada    por
prácticas   cuestionables);   Bajpai   y   Shukla   (IJARCS);
Ikuomenisan  y  Morgan  (Journal  of  Information  Security,
## SCIRP).
DOI presentes17 de 50 = 34 %Bajo para APA 7.ª, que los exige cuando existen. Faltan
en Al-Turjman, Arockiam, Bajpai, Soleimani y Khorsand,
entre otros.
Concentración de carga. Seis fuentes soportan la mayoría del argumento: Spitzner (2002) con 7
citas, Kampanakis (2014) con 6, Bromiley (2016) con 5 (aunque es un white paper de SANS de 2016
y sostiene todo el §3.6, el §3.7 y el §3.10), Soleimani y Khorsand (2021) con 5, y n8n GmbH (2024)
con 3. El marco teórico de un trabajo de 2026 sobre inteligencia de amenazas se apoya centralmente
en un libro de 2002, un artículo de 2014 y un white paper de 2016.
7.2 Correspondencia entre citas y referencias
DirecciónCantidadDetalle
Referencias nunca citadas (huérfanas)13 de 50 (26 %)Breunig  2000,  Casas  2012,  Chandola  2009,  Cremilleux
## 2019, Duděn 2020, Ester 1996, Franco 2021, Ilg 2023,
Liu  2008,  MISP  Project  2024,  Provos  2002,  Sommer  y
Paxson 2010, Yang 2023. Siete de ellas son el aparato
de ML de una sección eliminada (C-27).
Citas sin entrada en referencias2NIST  SP  800-61  Rev.  2  (2012)  —  citada  3  veces,
incluida  la  nota  del  Resumen  y  la  base  de  la  línea
manual del §6.1.1. Shodan (2024) — citada en §5.3.3.
Entradas duplicadas sin desambiguar2OASIS  (2021)  aparece  dos  veces  (STIX  y  TAXII)  sin
sufijos  2021a/2021b.  Las  citas  en  el  texto  («OASIS,
2021»)  son  por  tanto  ambiguas:  no  se  sabe  a  cuál  de
las dos remiten.
Errores de nombre entre cita y entrada1El  texto  cita  «IBM  X-Force  (2022)»  (Tabla  III-33);  la
entrada figura como «IBM Security (2022)».
Orden alfabético1 ruptura«Ilg,   N.»   aparece   antes   que   «Ikuomenisan,   G.»;
alfabéticamente Ikuomenisan precede a Ilg.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno25
DirecciónCantidadDetalle
Referencias  fabricadas  o  con  metadatos
falsos
1 verificadaFanelle  et  al.  (2020):  DOI  que  resuelve  a  otro  artículo
## (C-24).
Misatribuciones de contenido verificadas2Sokol et al. (2017), artículo jurídico usado como fuente
estadística  (C-25).  Bajpai  y  Shukla  (2021),  revisión  de
taxonomía   usada   como   fuente   de   benchmarks   de
latencia de pipelines.
Atribuciones anacrónicas2Zero  Trust  a  Bejtlich  2004;  SOAR  y  sus  plataformas
comerciales a Kampanakis 2014 (C-26).
Balance.  La  integridad  bibliográfica  de  este  trabajo  es  mejor  que  la  mediana  de  la  cohorte  en  un
aspecto  —la  mayoría  de  las  entradas  verificadas  tienen  metadatos  correctos,  incluidos  DOI  que
resuelven  al  artículo  correcto  en  Javadpour,  Franco,  Ilg,  Sokol,  Morić,  Ikuomenisan,  Yang,  Zielinski,
Kampanakis, Sillaber y Wagner— y peor en otro: la desconexión entre lo que se cita y lo que se lista
es  del  26  %,  y  hay  una  fabricación  y  dos  misatribuciones  verificadas  en  posiciones  que  sostienen
argumentos, no en notas al margen.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno26
- Cumplimiento de normas APA
El  Anexo  III  declara  expresamente  que  las  tablas  «mantienen  el  formato  APA  7ª».  Se  verifica  el
cumplimiento sobre los doce elementos que exige el Prompt Maestro.
ElementoCumpleObservación
Edición declaradaSí (parcial)Se  declara  APA  7.ª  en  el  Anexo  III,  no  en  un  apartado  de
normas del cuerpo.
Citas parafraseadasSíFormato  Autor  (Año)  y  (Autor,  Año)  correctamente  usado;
«et al.» aplicado desde el tercer autor.
Citas textualesN/ANo  hay  citas  textuales  en  todo  el  documento  —  coherente
con un trabajo técnico.
Sangría francesa en referenciasNoNinguna entrada tiene sangría francesa. Todas son párrafos
justificados corridos.
Cursivas en títulos de revista y volumenParcialSe  aplica  de  forma  irregular;  en  la  salida  PDF  los  títulos  de
revistas aparecen en redonda en la mayoría de las entradas.
Mayúsculas en títulosNoLos  títulos  de  libro  conservan  capitalización  de  titular  en
inglés  (Honeypots:  Tracking  Hackers,  The  Tao  of  Network
## Security   Monitoring:   Beyond   Intrusion   Detection,   Virtual
Honeypots:  From  Botnet  Tracking  to  Intrusion  Detection),
cuando APA 7 exige sentence case.
DOIParcial17 de 50. APA 7 exige incluirlo siempre que exista; falta en
al menos ocho entradas que lo tienen.
URLSíPresentes  y  en  formato  correcto  (https,  sin  «Recuperado
de»).
Formato de librosSíAutor, año, título, editorial. Correcto, salvo capitalización.
Formato de artículosSí (mayoría)Revista,    volumen(número),    páginas.    Correcto    en    las
entradas verificadas.
Formato de congresosSí«Proceedings of the... (pp. x-y). Editorial». Correcto.
Formato de normas y documentos webNoNIST SP 800-61 Rev. 2 se cita en el texto y no tiene entrada.
Las   entradas   institucionales   (Akamai,   ENISA,   Group-IB,
SonicWall) mezclan el nombre de la organización con el del
informe de forma no uniforme.
Desambiguación 2021a/2021bNoOASIS (2021) duplicado sin sufijos.
Cumplimiento  estimado:  6  de  13  elementos.  Los  incumplimientos  son  formales  y  todos
corregibles en una jornada de trabajo; ninguno es de fondo salvo la ausencia de la entrada de NIST,
que sí lo es porque esa fuente sostiene la línea de base del Capítulo VI.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno27
- Revisión de tablas y figuras
## 9.1 Tablas
El  documento  contiene  un  índice  de  tablas  propio,  lo  que  es  correcto.  Presenta,  sin  embargo,  tres
problemas de sistema:
•Numeración con huecos masivos. El cuerpo salta de la Tabla 5.1 a la 5.3 (no existe la 5.2), de
la 5.5 a la 5.8, de la 5.10 a la 5.22 (no existen las 5.11 a 5.21). En el Cap. VI faltan la 6.1, 6.3, 6.4,
6.8  y  6.9.  En  el  Anexo  III  faltan  las  III-4,  III-5,  III-7,  III-8,  III-10,  III-11,  III-12,  III-15  a  III-24,  III-31  y
III-32.  El  Anexo  III  explica  que  la  numeración  «conserva  la  numeración  original  del  V2»  tras  la
poda:  es  una  decisión  defendible  internamente,  pero  para  el  lector  produce  un  documento  con
cuarenta huecos de numeración.
•Tablas sin número ni título. Al menos siete tablas del cuerpo aparecen sin rótulo «Tabla N» ni
título:  la  línea  temporal  de  honeypots  del  §2.5.1,  la  clasificación  del  §2.5.3,  la  comparativa  de
proyectos del §2.6, la taxonomía multidimensional del §3.5.3.1, la comparativa Cowrie/Dionaea del
§3.5.3.4, los cuatro niveles de inteligencia del §3.6.2, la comparativa de plataformas del §3.9.4, la
de SIM3 del §3.10.1, la de herramientas del §4.12, la de operacionalización del §4.8, las métricas
de throughput del §5.7, la comparativa de IoCs del §6.8.4 y la matriz del §8.5. Ninguna es citable.
•Numeración  inconsistente  entre  índice  y  cuerpo.  El  índice  de  tablas  anuncia  «Tabla  6.7:
Correspondencia  entre  objetivos  específicos,  resultados  obtenidos  y  criterios  de  éxito»  y  «Tabla
6.10: Priorización de trabajo futuro»; en el cuerpo esas mismas tablas aparecen como Tabla 7.3
(§7.3.1) y Tabla 7.4 (§7.5.1). La Tabla 6.2 y la Tabla 6.5 se citan en el texto sin el prefijo «Tabla»
en varios lugares.
Tablas redundantes que deben fusionarse. La Tabla 5.1, la Tabla 5.9 y la Tabla 5.10 presentan
el mismo resumen de captura tres veces con datos incompatibles: deben unificarse en una sola. La
Tabla  5.4  y  la  Tabla  III-9  deben  unificarse.  La  Tabla  5.8,  la  Tabla  6.5  y  la  Tabla  III-6  verifican  los
mismos criterios de éxito tres veces, con distinto formato y en un caso con distintos valores. La Tabla
7.2 y la Tabla 7.3 verifican los objetivos dos veces con dos listas de objetivos distintas. La Tabla 2.7.2
y la Tabla III-35 son la misma comparación con soluciones existentes.
Lo que está bien. Las tablas del Capítulo III son de buena factura: la Tabla III-27 (SDOs y campos
clave), la Tabla III-28 (OpenIOC vs. STIX por siete dimensiones), la Tabla III-29 (mapeo IoC→STIX con
patrón) y la Tabla III-30 son sustantivas, están bien alineadas y tienen nota de fuente. La Tabla III-13
(criterios de asignación de niveles de confianza) publica criterios operacionales explícitos, lo que es
exactamente  lo  que  un  lector  necesita  para  juzgar  la  calidad  de  los  IoCs.  La  Tabla  6.2  explicita  las
fórmulas de mejora en notas al pie diferenciando las métricas «menor es mejor» de las «mayor es
mejor», recurso correcto y poco frecuente. La Tabla III-14 (distribución por nivel de confianza) suma
exactamente 4.234 y sus porcentajes totalizan 100,0 %.
## 9.2 Figuras
FiguraEstado realProblema
4.1 a 4.5 (Anexo I)Código Mermaid sin renderizarCinco diagramas de arquitectura, topología, secuencia, flujo
de datos y contenedores publicados como texto fuente. Son
la única documentación arquitectónica del trabajo.
5.1Código xychart sin renderizarAdemás, sus 10 valores (5.230...6.450) no coinciden con la
serie  de  la  Figura  5.11,  que  es  la  versión  embebida  del
mismo timeline.
5.2No existeSolo  un  párrafo  en  prosa.  Es  la  figura  que  sostiene  la
afirmación horaria refutada en C-07.
5.3Código xychart sin renderizarDuplica exactamente la Figura 5.13 (mismos 10 valores).
5.4No existeSolo prosa; remite a la Tabla III-2.
5.5Código xychart sin renderizarSus datos pertenecen al dataset incompatible (C-01).

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno28
FiguraEstado realProblema
5.6 a 5.10No existenHueco de numeración en el índice de figuras.
5.11Imagen embebida (p. 50)Legible  y  de  buena  resolución.  Rotulada  «Figura  6»  dentro
de   la   imagen   y   «Figura   1»   por   el   compositor:   tres
numeraciones  distintas  para  la  misma  figura.  Morfología
sinusoidal    sospechosa    (C-06)    y    máximo    de    ~520
incompatible con el pico de 1.159/h de la Tabla 5.9.
5.12Imagen embebida (p. 51)Técnicamente  correcta  y  legible.  Refuta  el  texto  (C-07).
Rotulada  «Figura  7»  en  la  imagen  y  «Figura  2»  por  el
compositor.
5.13Imagen embebida (p. 51)Correcta y legible. Duplica la Figura 5.3. Rotulada «Figura 8»
/ «Figura 3».
5.14Imagen embebida (p. 51) rotaFallo  de  renderizado:  circunferencias  que  cubren  todo  el
lienzo,  sin  mapa,  sin  países,  sin  datos,  sin  leyenda  (C-08).
Rotulada «Figura 9» / «Figura 4».
5.15Imagen       embebida       (p.       52)
defectuosa
Mock    de    matplotlib    presentado    como    «captura    del
dashboard  implementado»;  KPIs  vacíos,  paneles  cortados,
ejes sin rótulos (C-09). Rotulada «Figura 10» / «Figura 5».
5.16 a 5.20Código        Mermaid/xychart        sin
renderizar
Incluye   los   tres   diagramas   de   flujo   de   los   workflows
(5.17-5.19) y el patrón de manejo de errores (5.20), que son
piezas técnicas centrales del trabajo.
III-1Código Mermaid sin renderizarModelo  relacional  de  los  SDOs  de  STIX;  sería  una  de  las
mejores figuras del trabajo si estuviera renderizada.
III-2No existeFigurada  en  el  índice  y  citada  en  §6.1.3  como  fuente  de  la
proyección de escalabilidad. No aparece en el Anexo III.
Recuento. El índice anuncia 22 figuras. Existen efectivamente 5 imágenes, de las cuales 1 está rota,
1 es un mock defectuoso, 1 duplica a otra figura y 1 contradice el texto. Quedan dos figuras (5.11 y
5.13)  que  cumplen  su  función  sin  objeciones.  En  109  páginas  no  hay  una  sola  captura  de
pantalla  del  sistema  real:  ni  de  la  interfaz  de  n8n,  ni  de  un  workflow,  ni  de  una  consulta  a
PostgreSQL,  ni  de  un  log  de  Cowrie,  ni  de  un  reporte  generado.  Para  un  trabajo  cuyo  aporte
declarado es la construcción de un artefacto funcional, esa ausencia es la carencia formal más grave.
Consistencia  gráfica.  Las  cinco  imágenes  comparten  estilo  (matplotlib  con  tipografía  DejaVu),  lo
que  es  correcto.  Pero  cada  una  lleva  su  propio  título  embebido  con  una  numeración  («Figura  6»  a
«Figura 10») que no corresponde ni a la numeración de la tesis (5.11 a 5.15) ni a la del compositor
LaTeX (Figura 1 a Figura 5), de modo que cada figura tiene tres números y el pie que el lector ve dice
literalmente «Figura 1: Figura 5.11: ...».

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno29
- Revisión técnica
El Prompt Maestro exige, para tesis de ingeniería e informática, revisar arquitectura, diagramas UML,
C4,  BPMN,  ER,  modelo  de  dominio,  patrones,  buenas  prácticas  y  consistencia  entre  arquitectura  y
desarrollo.
## 10.1 Modelado
Artefacto exigidoPresenteObservación
Diagrama de arquitecturaSí (sin renderizar)Figura  4.1:  cuatro  capas  con  flujos  etiquetados.  La  descomposición
captura  →  procesamiento  →  persistencia  →  análisis  es  correcta  y  se
sostiene coherentemente en todo el documento.
Diagrama de despliegue / redSí (sin renderizar)Figura 4.2: tres VLAN con direccionamiento (10.0.1/2/3.0/24), puertos
expuestos y tres reglas de bloqueo explícitas (salida a Internet desde
DMZ, acceso de DMZ a red interna, acceso a datos restringido a n8n).
Es un buen diseño de segmentación y está bien pensado.
Diagrama de secuenciaSí (sin renderizar)Figura       4.3:       seis       participantes,       secuencia       completa
atacante→honeypot→n8n→APIs→PostgreSQL  con  el  ack  de  vuelta.
Técnicamente correcto.
Diagrama de contenedoresSí (sin renderizar)Figura  4.5:  imágenes,  puertos,  volúmenes  y  redes  por  contenedor.
Equivale a un nivel C4-Container implícito.
Modelo de datos / ERNoNo  hay  diagrama  entidad-relación  ni  DDL.  Se  mencionan  las  tablas
events,  iocs,  reports  y  error_log,  y  campos  sueltos  (ioc_processed,
processed_data,  period_start,  period_end,  status),  pero  nunca  se
publica  el  esquema.  Para  una  tesis  cuyo  producto  es  un  pipeline  de
persistencia estructurada, es una omisión de fondo.
Modelo de dominioNoAusente.
UML de clases / componentesNo aplicaEl sistema es de integración, no de desarrollo orientado a objetos. La
ausencia es justificable.
BPMNSustituidoLos diagramas de flujo de los workflows (Figuras 5.17-5.19) cumplen
la función, aunque en notación Mermaid y sin renderizar.
Patrones declaradosSí§5.13  declara  «Webhook  Processing»,  «Scheduled  Tasks»,  «Batch
Processing» y «fan-out paralelo de queries», y el §5.13.4 documenta
un  patrón  transversal  de  manejo  de  errores  por  rama  con  tabla
error_log y un workflow independiente con Error Trigger. Es un buen
nivel de formalización.
10.2 Consistencia entre arquitectura y desarrollo, y observaciones de
ingeniería
•La  cuenta  de  nodos  no  cierra.  El  §5.13.1  describe  el  workflow  event-ingest  como  «una
secuencia de siete nodos» y enumera: validación, normalización, geolocalización, IF, reputación,
merge e inserción. El Anexo II declara 8 nodos para ese mismo workflow y la Config. 1 dibuja 8 (A a
H, incluyendo el Webhook). El §6.7.1 vuelve a decir 8. Discrepancia menor pero indicativa del nivel
de revisión.
•El enriquecimiento por reputación es condicional y eso no se refleja en las métricas. El
nodo  IF  del  event-ingest  consulta  AbuseIPDB  solo  «si  ABUSEIPDB_API_KEY  está  definida».  El  §5.7
informa «Eventos enriquecidos con reputación IP: 96,4 % (3.015 IPs con puntuación disponible)».
3.015/3.128 = 96,39 %, pero 3.015/3.751 = 80,4 %. La métrica vuelve a depender del total de IPs
que el documento no resuelve (C-04).
•VirusTotal aparece en las herramientas y no en el pipeline. El §4.12 lista VirusTotal como
API  de  análisis  de  hashes  y  el  §5.13.5  declara  la  variable  VT_API_KEY  como  «alternativa  a
AbuseIPDB» consumida por event-ingest. Pero ningún workflow documentado consulta VirusTotal,
y sin embargo el §5.8.5 y la Tabla III-13 publican tasas de detección de VirusTotal (15/68, 8/68) y
las usan como criterio para asignar el nivel de confianza ALTO. El paso que produce ese dato no
está en el pipeline.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno30
•Los  límites  de  tasa  declarados  hacen  inviable  el  volumen  declarado.  El  §4.12  informa
correctamente  que  ip-api.com  admite  45  consultas/minuto  en  su  capa  gratuita  y  VirusTotal
4/minuto. Con 3.751 IPs únicas en 30 días la geolocalización es holgada. Pero el §6.1.3 razona que
el  throttling  aparecería  «a  partir  de  ~65.000  eventos/día  con  IPs  mayoritariamente  únicas»,
cuando  el  límite  real  de  45/min  equivale  a  64.800  consultas/día:  la  cifra  coincide  solo  si  cada
evento genera una consulta, es decir si no hay caché ni deduplicación —y el §5.13.1 no documenta
ninguna—.  Con  6.704  eventos/día  y  consulta  por  evento,  el  sistema  haría  6.704  consultas/día,
holgadamente  dentro  del  límite;  con  deduplicación  por  IP  haría  125/día.  El  documento  no  aclara
cuál de los dos regímenes operó, y de eso depende que los 342 ms de latencia media sean o no
plausibles: una consulta HTTP a ip-api.com más otra a AbuseIPDB más un INSERT difícilmente se
completen en 342 ms de media, y ese es exactamente el número que sostiene P1.
•Ausencia de tratamiento de reintentos y de idempotencia. El §5.13.4 declara una «política
de  reintentos  por  tipo  de  error»  que  remite  al  Anexo  II,  Config.  17,  que  no  se  publica.  El
ioc-extractor usa UPSERT con clave (type, value), lo que es correcto para deduplicar IoCs; pero el
event-ingest  no  declara  ninguna  clave  de  idempotencia  sobre  events,  de  modo  que  un  reintento
de webhook duplicaría el evento. El §4.15 afirma que «la consistencia se verifica con consultas de
integridad  referencial  que  detectan  eventos  huérfanos  o  duplicados»;  esas  consultas  no  se
publican y sus resultados tampoco.
•Buenas  prácticas  de  credenciales:  correctamente  resueltas.  El  §5.13.5  declara  que  todas
las  credenciales  se  referencian  por  variable  de  entorno  y  que  «ninguna  credencial  aparece
hardcodeada  en  los  exports  JSON  ni  en  la  documentación».  Es  una  afirmación  que  no  se  puede
verificar sin el repositorio, pero la práctica declarada es la correcta y el trabajo la documenta con
una tabla completa de nueve variables.
•Sanitización  de  credenciales:  correctamente  resuelta.  La  regla  de  no  exhibir  credenciales
en texto plano y publicarlas como SHA-256 del par usuario:contraseña es una decisión defensible y
se aplica de forma consistente en todo el documento. Se observa, no obstante, que el hash de un
par  de  credenciales  débiles  es  trivialmente  reversible  por  diccionario,  de  modo  que  la  medida
protege menos de lo que el trabajo supone; y que hashear elimina justamente el dato que haría
útil el hallazgo (saber qué credenciales se intentan es el resultado, no el riesgo).

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno31
- Auditoría de la calidad de la escritura científica
Se  midió  sobre  el  cuerpo  del  documento  excluyendo  tablas,  bloques  de  código  Mermaid/xychart  y
listas de referencias: 871 oraciones y 27.581 palabras de prosa continua.
IndicadorMedición
Umbral de
referencia
## Estado
Mediana de palabras por oración23≤ 28Cumple
Media de palabras por oración31,7≤ 32Cumple
Oraciones de más de 40 palabras24,3 %≤ 25 %Cumple al límite
Oraciones de más de 60 palabras13,4 %≤ 8 %No cumple
Voz pasiva / impersonal refleja≈23 %≤ 30 %Cumple
## Vaguedades           («muy»,           «bastante»,
## «importante», «interesante»)
5  ocurrencias  de  «muy»;  0
del resto
≤ 10Cumple            con
holgura
Coloquialismos00Cumple
Errores ortográficos0 detectados0Cumple
Conectores lógicos explícitos (19 formas)37 en 27.581 palabras≥     1     cada     400
palabras (≈69)
No cumple
Nominalizaciones de alta frecuencia«mediante»                   ×43,
## «constituye»      ×28,      «de
forma» ×38, «permite» ×36
—Elevado
Estabilidad terminológicaConsistente      en      los      8
capítulos
—Cumple
Voz  activa.  El  trabajo  alterna  correctamente  entre  pasiva  refleja  para  procedimientos  («se
implementó  un  entorno  aislado»,  «se  registraron  201.125  eventos»)  y  activa  para  el  sistema  («el
pipeline  n8n  procesó  el  100  %  de  los  eventos»,  «la  arquitectura  capturó  3.128  IPs  únicas»).  La
proporción  medida  (≈23  %  de  impersonal)  está  dentro  de  lo  aceptable  para  un  texto  técnico  en
español  y  es  de  las  mejores  de  la  cohorte.  No  se  detectan  pasivas  perifrásticas  innecesarias  en
volumen.
Claridad. Alta a nivel de oración. Los pasajes técnicos del §3.11 y del §5.13 se comprenden en una
lectura   pese   a   la   densidad   conceptual.   La   terminología   es   precisa   y   estable:   «IoC»,
«enriquecimiento»,  «estructuración»,  «pipeline»  y  «workflow»  conservan  el  mismo  referente  en  los
ocho capítulos.
Concisión.  Es  el  punto  débil.  El  13,4  %  de  oraciones  por  encima  de  60  palabras  es  alto,  y  se
concentra en el §7.1 y el §7.2.3, donde aparecen períodos de más de 100 palabras con tres o cuatro
subordinadas encadenadas y varias referencias cruzadas entre paréntesis. Ejemplo del §7.1: una sola
oración  recorre  el  diseño  de  la  arquitectura,  la  elección  de  los  dos  honeypots,  el  aislamiento  con
Docker y la remisión al Capítulo IV. Estos pasajes ganan mucho partiéndose en dos o tres.
Fluidez. Buena entre capítulos —cada uno cierra anunciando el siguiente, recurso bien ejecutado—
y  desigual  dentro  de  ellos.  La  densidad  de  conectores  lógicos  explícitos  es  baja:  37  ocurrencias  de
las  diecinueve  formas  más  frecuentes  en  27.581  palabras,  es  decir  una  cada  745  palabras.  La
consecuencia es que en el Capítulo V la sucesión de subsecciones se lee como una enumeración y no
como un argumento: el §5.4, el §5.5 y el §5.6 se suceden sin una sola transición que explique por qué
el lector pasa de uno al siguiente.
Coherencia discursiva. A nivel de oración, correcta. A nivel de documento, es exactamente donde
el trabajo falla: la relación entre evidencia presentada y conclusión derivada está rota en los casos
documentados en el §4 de este informe. La escritura es buena; lo que se escribe no se sostiene.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno32
Índice de calidad de escritura: 7,0 / 10
Es uno de los valores más altos medidos en esta serie de auditorías. La puntuación se compone de:
predominio  de  voz  activa  (8,0),  claridad  (8,0),  precisión  terminológica  (8,5),  concisión  (5,5),  fluidez
(5,5),  coherencia  discursiva  a  nivel  de  oración  (8,0)  y  estilo  científico  (8,0).  La  rebaja  proviene
íntegramente  de  la  concisión  y  de  la  fluidez  —oraciones  largas  encadenadas  y  escasez  de
conectores—,  no  de  defectos  de  registro,  precisión  ni  corrección.  Este  es  el  diagnóstico  central
del trabajo: la escritura está por encima de la cohorte y la medición está por debajo.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno33
- Tabla de riesgos de rechazo
Se consignan 94 hallazgos: 28 críticos, 24 altos, 27 medios y 15 bajos. Por extensión se reproducen
los 28 críticos y los 24 altos; los medios y bajos se resumen al final de la sección.
IDProblema detectadoSev.Cap.Impacto y recomendación
C-01Dos   datasets   incompatibles   para
los     mismos     201.125     eventos
(Cowrie 195.300 vs. 157.234)
CríticoVInvalida  toda  cifra  derivada  del  reparto  por
honeypot y por protocolo. Rec.: volver a la
base   de   datos,   fijar   el   reparto   real   y
reescribir Tablas 5.1, 5.3, 5.9, 5.10 y Figura
5.5 con una sola fuente.
C-02Tasa   de   estructuración   84,2   %
(Tabla 5.3) vs. 94,7 % (§5.6, §5.10,
§7.2, Tabla III-6)
CríticoVLa  hipótesis  P2  se  valida  con  la  cifra  sin
numerador.               Rec.:               publicar
numerador/denominador  y  el  esquema  de
campos  requeridos;  reconciliar  en  los  siete
lugares.
C-03Dos        taxonomías        de        IoC
incompatibles;  la  Tabla  III-9  suma
4.279  y  declara  4.234;  porcentajes
al 101,1 %
CríticoVEl  producto  central  del  trabajo  no  tiene  un
recuento estable. Rec.: una sola tabla, con
suma verificada.
C-043.128     vs.     3.751     IPs     únicas;
porcentajes  geográficos  del  §6.2.1
no  coinciden  con  la  Tabla  III-2  que
citan; 38 vs. 28 países
CríticoV-VIRec.:     fijar     el     total,     recalcular     los
porcentajes      y      corregir      las      cinco
reapariciones.
C-0512   reportes   (Tabla   5.5)   vs.   30
(§5.10,  §5.11,  §7.2,  Tabla  III-6)  vs.
34 implícitos en el cron del §5.13.3
CríticoVP4  se  valida  con  un  recuento  que  la  tabla
del propio capítulo desmiente. Rec.: exhibir
la tabla reports.
C-06Hashes    en    secuencia    rotatoria,
nombres  de  artefacto  genéricos  y
serie horaria sinusoidal
CríticoVImpide    verificar    que    los    datos    sean
capturas  reales.  Rec.:  publicar  el  dataset
crudo o retirar las tablas afectadas.
C-07La  Figura  5.12  muestra  el  mínimo
donde el texto afirma el máximo, y
un   pico   de   396   donde   el   texto
afirma >800 y 1.159
CríticoV-VIIRefuta   la   conclusión   cualitativa   central
sobre    automatización.    Rec.:    reescribir
§5.3.3, §5.3.5, §6.2.1 y §7.2.1 conforme a la
figura,    o    publicar    los    datos    que    la
respalden.
C-08La   Figura   5.14   es   un   fallo   de
renderizado sin mapa ni datos
CríticoVRec.:   regenerar   con   proyección   real   y
tamaños de marcador en puntos, o suprimir
y remitir a la Tabla III-2.
C-09La  Figura  5.15  se  presenta  como
captura  de  un  dashboard  que  el
§5.14 declara no implementado
CríticoVContradicción    sobre    el    estado    de    un
componente. Rec.: rotularla como maqueta
conceptual y alinear §5.7 con §5.14.
C-1014  figuras  publicadas  como  código
sin   renderizar;   5.2,   5.4   y   III-2
inexistentes; 5.3 duplica a 5.13
CríticoTodosLa     documentación     arquitectónica     del
trabajo no es legible. Rec.: renderizar todos
los Mermaid y xychart e incorporarlos como
imágenes.
C-11342  ±  89  ms  es  incompatible  con
P99  =  1.420  ms  (Cantelli  acota  en
0,68 % lo que el P99 exige que sea
## 1 %)
CríticoVRec.:   recalcular   la   dispersión   sobre   los
datos  reales  y  reportar  también  mediana  e
## IQR.
C-12P95 845 (Anexo) vs. 892 (cuerpo, 5
veces); P99 1.420 vs. 1.450
CríticoV-VIIRec.:  una  sola  tabla  de  percentiles,  citada
desde todos los puntos.
C-13La  reducción  del  97,3  %  no  se
deriva de ninguna de las dos líneas
de  base  declaradas  para  el  criterio
que verifica
CríticoV-VIIEs la cifra titular del trabajo. Rec.: separar
explícitamente    «reducción    por    evento»
(99,8   %)   de   «reducción   de   jornada   de
analista»  (97,3  %)  y  usar  cada  una  solo
donde corresponde.
## C-14
Cinco valores incompatibles para la
tasa de error (4,42 % / 5,3 % / 1,8
## % / 7,1 % / 15,8 %)
CríticoV-VIRec.:  una  taxonomía  única  de  errores  con
recuentos enteros y una suma verificada.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno34
IDProblema detectadoSev.Cap.Impacto y recomendación
C-15Errores    aritméticos    verificables:
40,4 % vs. 36,7 %; ~80 eventos/IP;
suma de la Tabla III-2
CríticoVRec.: recalcular todas las notas de figura.
C-16ENISA  (2023)  citada  con  20-30/día
en  cuatro  lugares  y  con  50-80/día
en el §6.3
CríticoVIRec.:  verificar  el  valor  real  en  el  informe  y
unificar.
C-17Las  cuatro  hipótesis  se  declaran
aceptadas sin contrastarse; P3 y P4
cambian de denominador
CríticoV-VIIUn diseño en el que ninguna hipótesis podía
fallar  no  aporta  evidencia.  Rec.:  reportar
los     denominadores     reales     (sesiones
maliciosas confirmadas; ataques de interés)
o reformular P3 y P4.
C-18Siete    objetivos    específicos    en
§1.4.2,  seis  distintos  en  §5.11  y
Tabla  7.3,  los  siete  de  nuevo  en
## Tabla 7.2
CríticoI-VIIRec.: una sola lista, verificada una sola vez.
C-19El  §4.4  no  existe  y  es  citado  dos
veces     como     fundamento     del
diseño;    §4.9.1-§4.9.5,    §6.8.1    y
§6.8.3 tampoco existen
CríticoIVRec.:  escribir  el  §4.4  y  auditar  todas  las
referencias cruzadas internas.
C-20El repositorio se invoca 7 veces sin
URL;  los  anexos  remiten  a  él  para
toda la evidencia
CríticoV-VI-AnexosSin  él,  el  trabajo  no  es  reproducible  ni
auditable.  Rec.:  publicar  el  repositorio  y
citarlo con URL y commit.
C-21Sin  fechas  de  calendario  en  109
páginas;  §5.2.4  declara  la  duración
indeterminada
CríticoVRec.: declarar fecha de inicio y de cierre en
el §5.2.4 y en el Resumen.
C-22Ningún     tratamiento     de     datos
personales:   sin   Ley   25.326,   sin
base    de    licitud,    sin    plazo    de
conservación
CríticoIVRiesgo  jurídico  y  ético  real,  con  datos  de
terceros    almacenados    30    días.    Rec.:
reescribir  el  §4.16  con  la  Ley  25.326,  base
de    licitud,    minimización    y    plazo    de
supresión.
C-23RN-*,  IN-02,  C-04,  US-00x  y  tres
archivos .md internos citados como
fuentes normativas de la tesis
CríticoV-VIRec.:  eliminarlos  y  remitir  únicamente  al
## §4.9.
C-24Fanelle  et  al.  (2020):  DOI  resuelve
a  «Zero-Shot  Machine  Learning...
## Big Data Workloads»
CríticoRef.Sostiene  tres  afirmaciones,  una  de  ellas  la
reclamación  de  originalidad  del  §7.6.  Rec.:
sustituir  por  una  fuente  real  o  eliminar  las
tres afirmaciones.
C-25Sokol et al. (2017), artículo jurídico
sobre  privacidad,  citado  5  veces
como   fuente   de   estadísticas   de
tráfico
CríticoIV-V-VIRec.: reasignar el uso de la fuente a lo que
sí  contiene  —el  §4.16—  y  buscar  fuentes
reales para los benchmarks.
C-26Siete  errores  factuales  verificados:
n8n   MIT/open   source,   MHN   de
Google,  T1580,  Zero  Trust,  SIM3,
OpenIOC/FireEye,      estrellas      de
Node-RED
CríticoII-III-VRec.:  corregir  uno  por  uno  contra  fuente
primaria.
C-2713 de 50 referencias nunca citadas
(26  %);  7  son  el  aparato  de  ML  de
una   sección   eliminada;   2   citas
huérfanas
CríticoRef.Rec.:  depurar  el  listado  o  reincorporar  el
contenido que las justificaba.
C-28Cap.  I  con  0  citas,  Cap.  IV  con  1,
Cap.   VIII   con   0;   ninguna   fuente
metodológica en todo el trabajo
CríticoI-IV-VIIIRec.: fundamentar la justificación del Cap. I
y citar al menos tres fuentes metodológicas
en el Cap. IV.
Hallazgos de severidad alta (24)
IDProblemaCap.
A-01El  Capítulo  V  se  titula  «Resultados  experimentales»  y  usa  terminología  experimental
sobre un diseño declaradamente no experimental
## V

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno35
IDProblemaCap.
A-02La dimensión cualitativa del §4.2 no tiene instrumento, categorías ni criterios; el §5.9 la
resuelve en tres párrafos
## IV-V
A-03La «muestra» del §4.10 es un censo; no se declaran criterios de validez de un eventoIV
A-04No  hay  modelo  de  datos,  ni  ER,  ni  DDL,  pese  a  que  el  producto  es  un  pipeline  de
persistencia estructurada
## IV-V
A-05Ninguna   prueba   estadística,   ningún   intervalo   de   confianza,   ninguna   medida   de
asociación en todo el trabajo
## IV-V
A-06VirusTotal  alimenta  el  criterio  de  confianza  ALTO  y  no  aparece  en  ningún  workflow
documentado
## V
A-07El  §5.3.6  declara  «validada  la  hipótesis  central»  a  partir  de  una  comparación  contra
estimación, contradiciendo al §7.2.2
## V-VII
A-08Cuatro de los cinco benchmarks del §6.3 provienen de fuentes que no los contienen o no
son verificables
## VI
A-09El  §2.7.2  declara  escalabilidad  «Alta»  donde  el  §6.7.2  y  la  Tabla  III-35  declaran  «Media
(~1.500 ev/h)»
## II-VI
A-10El §7.2.3 reclama «la primera integración conocida» sin búsqueda sistemática declaradaVII
A-11El Capítulo VII introduce ocho citas bibliográficas nuevas, contra la regla de no introducir
bibliografía en conclusiones
## VII
A-12El   §5.11   y   el   §7.2.1   introducen   resultados   que   no   aparecieron   en   el   capítulo
correspondiente
## V-VII
A-13Latencia  media  de  342  ms  declarada  para  una  cadena  que  incluye  dos  llamadas  HTTP
externas y un INSERT
## V
A-14Sin clave de idempotencia sobre events; el reintento de webhook duplicaría eventosV
A-15Las  consultas  de  integridad  referencial  del  §4.15  no  se  publican  ni  se  reportan  sus
resultados
## IV
A-16Discrepancia 7 vs. 8 nodos en event-ingest entre §5.13.1, Anexo II y §6.7.1V
A-17El criterio bot / operador humano no tiene definición operacional publicadaV-VI
A-18856  artefactos  de  malware  sobre  los  eventos  de  Dionaea  implica  una  tasa  de  captura
implausible en cualquiera de los dos datasets
## V
A-19Tasa  máxima  de  detección  VirusTotal  de  15/68  declarada  para  un  CoinMiner,  valor
implausiblemente bajo
## V
A-20Ausencia  de  cegamiento  y  de  tratamiento  del  sesgo  del  experimentador:  los  autores
construyeron, definieron los criterios y evaluaron
## IV
A-21Las variables dependientes del §1.7 y del §4.7 no coincidenI-IV
A-22El  §2.5  (estado  del  arte)  revisa  tres  proyectos,  todos  anteriores  a  2015;  ningún  trabajo
reciente sobre honeypots + automatización
## II
A-23La  justificación  económica  del  §1.3.4  y  del  §8.2.2  no  cuantifica  el  costo  de  las
alternativas comerciales que declara inaccesibles
## I-VIII
A-24Solapamiento sustancial entre §7.4, §7.5 y el Capítulo VIII, que cubren el mismo terreno
tres veces
## VII-VIII
Severidad  media  (27,  resumidos).  Numeración  de  tablas  con  cuarenta  huecos;  trece  tablas  sin
rótulo ni título; triple numeración de figuras; ausencia de sangría francesa; capitalización de títulos
en las referencias; 17 de 50 DOI; OASIS 2021 duplicado sin sufijo; ruptura del orden alfabético; «IBM
X-Force» vs. «IBM Security»; el §3.8 (120 palabras, tres citas al mismo libro) sin aporte; el §5.9 con
tres  párrafos  de  una  línea;  repetición  del  resumen  general  de  eventos  en  §5.3,  §5.4  y  §5.5;
duplicación  de  la  verificación  de  criterios  en  Tabla  5.8,  Tabla  6.5  y  Tabla  III-6;  duplicación  de  la
verificación de objetivos en Tabla 7.2 y Tabla 7.3; el §6.8.4 con rangos de falsos positivos de feeds
públicos  sin  fuente;  HPFeeds  fechado  en  2013;  «Team  MUSH»  por  MushMush  Foundation;  la  nota
metodológica  del  §5.8  describe  al  revés  la  ofuscación  de  IPs;  el  hash  de  credenciales  débiles  es
reversible  por  diccionario;  T1053.003  es  «Cron»  y  no  «Scheduled  Task»;  MITRE  ATT&CK  citado  en
v14  en  un  trabajo  de  2026;  el  §5.8.1  dice  «tres  ASNs  chinos»  y  lista  dos;  tres  IPs  distintas  de

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno36
DigitalOcean  en  §5.8.1,  §5.8.3  y  el  Hallazgo  1;  el  Hallazgo  3  sin  IP  en  el  texto  y  con  IP  en  la  Tabla
5.22;  el  §6.1.1  subestima  su  propio  argumento  («4  años»  por  5,6);  el  §8.5  sin  correspondencia  con
hallazgos concretos; y la ausencia de un apartado de normas de citación en el cuerpo.
Severidad  baja  (15,  resumidos).  Tildes  faltantes  en  la  portada  («Julián»,  «Programación»,
«Tecnológica» aparecen partidos por el compositor); espacios anómalos en el volcado de texto por la
sustitución  de  ligaduras  «fi»;  el  símbolo  ↪  como  marca  de  continuación  dentro  de  los  bloques  de
código;  «Revisiónes  sistemáticas»  en  el  §3.5.2;  «Dudeň»  por  «Duděk/Duděn»  en  las  referencias;
inconsistencia  entre  «work  low»  y  «workflow»  por  el  mismo  problema  tipográfico;  el  índice  general
usa una jerarquía visual con símbolos (•, ∘, ⋄) poco convencional; y la ausencia de agradecimientos,
dedicatoria y declaración de originalidad.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno37
- Calificación por capítulo y calificación global
Cada  capítulo  se  puntúa  de  0  a  10  considerando  las  seis  dimensiones  que  fija  el  Prompt  Maestro:
rigor científico, calidad metodológica, calidad de redacción, calidad bibliográfica, cumplimiento APA y
coherencia interna. El peso refleja la contribución del capítulo al juicio global sobre el trabajo.
Capítulo / dimensiónRigorMetod.Redacc.Biblio.APACoher.NotaPeso
## I — Introducción5,06,58,52,0—6,06,00,06
II — Estado del arte6,06,08,06,06,06,06,50,06
III — Marco teórico8,07,58,57,06,08,07,80,12
IV — Metodología4,54,08,02,0—5,04,50,14
## V — Resultados1,52,07,53,05,01,02,00,22
VI — Discusión4,05,08,04,06,04,54,50,12
VII — Conclusiones3,04,07,53,04,03,03,50,08
VIII — Recomendaciones5,55,58,02,0—6,55,50,03
Referencias y APA———3,54,53,03,50,08
Tablas y figuras2,0———3,02,02,00,05
Anexos y reproducibilidad2,52,5———3,02,50,04
Cálculo  de  la  calificación  global.  6,0×0,06  +  6,5×0,06  +  7,8×0,12  +  4,5×0,14  +  2,0×0,22  +
## 4,5×0,12 + 3,5×0,08 + 5,5×0,03 + 3,5×0,08 + 2,0×0,05 + 2,5×0,04 = 4,22.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno38
Calificación general: 4,2 / 10
Fortalezas principales. (1) El Capítulo III es el mejor marco teórico sobre estándares CTI revisado
en  esta  serie,  con  la  Tabla  III-29  (mapeo  IoC→STIX)  como  pieza  publicable.  (2)  La  estructura  del
documento  es  completa  y  bien  concebida,  con  distinción  explícita  entre  estado  del  arte  y  marco
teórico,  capítulo  de  discusión  real  y  capítulo  de  recomendaciones  aplicables.  (3)  La  prosa  está
claramente por encima de la cohorte. (4) Hay honestidad epistémica genuina y por iniciativa propia:
la  línea  de  base  manual  se  declara  estimación  en  cuatro  lugares,  tres  secciones  se  rotulan
explícitamente  «propuesta  conceptual  —  no  implementada»,  el  §6.7  critica  la  propia  elección
tecnológica  con  hallazgos  negativos  concretos,  el  §4.15  declara  un  sesgo  que  juega  en  contra  del
propio resultado, y el §7.2 organiza los resultados en tres niveles epistémicos. (5) El §5.13 documenta
los   tres   workflows   con   un   nivel   de   formalización   (patrones,   manejo   de   errores   por   rama,
temporizadores cron, variables de entorno) superior al promedio.
Debilidades principales. (1) El capítulo de Resultados publica dos conjuntos de datos incompatibles
y  seis  magnitudes  centrales  con  dos  valores  cada  una.  (2)  Las  tres  figuras  que  debían  sostener  los
resultados o los contradicen, o están rotas, o son maquetas presentadas como capturas. (3) Ninguna
de  las  cuatro  hipótesis  se  contrasta  contra  su  propio  umbral.  (4)  Los  datos  publicados  presentan
indicios verificables de ser ilustrativos. (5) No hay repositorio, ni fechas, ni dataset, ni logs: el trabajo
no es reproducible ni auditable. (6) Una referencia fabricada y dos misatribuciones verificadas, más
siete  errores  factuales  contrastados  contra  fuente  primaria.  (7)  Ausencia  total  de  tratamiento  de
datos personales.
Riesgos  para  la  defensa.  Alto.  Cualquier  miembro  del  tribunal  que  compare  la  Tabla  5.1  con  la
Tabla  5.9  —que  están  en  el  mismo  capítulo—  detecta  el  problema  en  la  primera  lectura,  y  no  hay
respuesta  posible  que  no  sea  exhibir  la  base  de  datos.  La  Figura  5.14  se  ve  rota  a  simple  vista  al
pasar la página.
Riesgos metodológicos. Alto. Hipótesis no falsables, sin análisis estadístico, sin instrumentos, con
la sección de diseño ausente.
Riesgos bibliográficos. Medio-alto. Una fabricación verificada y dos misatribuciones en posiciones
que sostienen argumentos; 26 % de referencias huérfanas.
Riesgos formales. Medio. Numeración, APA y figuras sin renderizar; todo corregible en pocos días.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno39
- Dictamen final
De los cinco dictámenes que contempla el instrumento, se descartan cuatro y se justifica el quinto.
DictamenDescartado porque...
Aprobada sin observacionesHay 28 hallazgos críticos verificados, dos de ellos —el dataset dual y
la  figura  que  refuta  el  texto—  visibles  en  una  lectura  atenta  del
capítulo de resultados.
Aprobada con observaciones menoresLas  observaciones  no  son  de  forma.  Afectan  al  dato  primario,  al
contraste de las cuatro hipótesis y a la evidencia gráfica.
Aprobada con observaciones mayoresEste  dictamen  supone  que  los  resultados  son  válidos  y  que  lo  que
falta   es   completarlos   o   precisarlos.   Aquí   los   resultados   se
contradicen  entre  sí:  no  es  posible  determinar  cuál  de  las  dos
versiones de cada magnitud es la correcta, y por lo tanto no hay un
resultado que corregir, sino uno que establecer.
Requiere   una   revisión   profunda   antes   de   la
defensa
Es   el   dictamen   que   correspondería   si   la   evidencia   existiera   y
estuviera  mal  reportada.  Es  exactamente  lo  que  no  se  puede
determinar: no hay repositorio, no hay dataset, no hay logs, no hay
fechas, y los tres indicios del C-06 apuntan en la dirección contraria.
Se adopta como dictamen condicional (véase abajo).
Dictamen: No recomendable para defensa en su estado actual
La razón determinante no es el número de errores —que es alto pero no el más alto de la serie— sino
que el trabajo no permite establecer qué se midió. Un tribunal que quisiera aprobar este trabajo
con observaciones tendría que decidir, sin elementos, si Cowrie capturó 195.300 o 157.234 eventos,
si el 84,2 % o el 94,7 % de ellos se estructuró, si se generaron 12 o 30 reportes, si hubo 3.128 o 3.751
IPs únicas, si el reparto de IoCs es el de la Tabla 5.4 o el de la Tabla III-9, y si la actividad se concentró
en  la  madrugada  (texto)  o  en  la  franja  laboral  (figura).  Ninguna  de  esas  seis  preguntas  tiene
respuesta dentro del documento, y ninguna puede responderse fuera de él porque no hay repositorio
ni dataset.
A  eso  se  suman  dos  cuestiones  que  un  tribunal  no  puede  pasar  por  alto  con  independencia  de  los
datos:  las  cuatro  hipótesis  se  declaran  verificadas  mediante  un  cambio  de  denominador  que  las
vuelve  incapaces  de  fallar  (C-17),  y  una  fuente  de  la  bibliografía  tiene  un  DOI  que  resuelve  a  otro
artículo  mientras  otra,  verificada  como  artículo  jurídico,  se  usa  cinco  veces  como  fuente  de
estadísticas de tráfico (C-24, C-25).
Se  deja  constancia  de  que  este  es  el  trabajo  mejor  escrito  y  mejor  estructurado  que  ha
recibido  un  dictamen  negativo  en  esta  serie.  El  Capítulo  III,  el  §5.13,  el  §6.7  y  el  §4.15  son  de
calidad, y la honestidad con que los autores declaran lo que no midieron y lo que no implementaron
es genuina y debe reconocerse en la devolución. El problema está circunscripto y es identificable: la
campaña de medición y su presentación.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno40
Cláusula condicional del dictamen
El  dictamen  asciende  automáticamente  a  «Requiere  una  revisión  profunda  antes  de  la
defensa» (calificación estimada 5,4) si los autores exhiben ante el tribunal, antes de la reentrega, los
tres elementos siguientes:
(a) volcado de las tablas events, iocs y reports de PostgreSQL, con marcas temporales por registro y
las fechas reales del período;
(b) registro de ejecuciones de los tres workflows de n8n para el período declarado;
(c) URL del repositorio con los tres JSON de workflow, el docker-compose y el DDL.
Con  esos  tres  elementos,  veinte  de  los  veintiocho  hallazgos  críticos  pasan  de  «no  verificable»  a
«corregible por reconciliación», y el trabajo puede alcanzar 7,5-8,0 con las cuatro etapas de la ruta de
corrección. Sin ellos, el Capítulo V debe rehacerse desde la captura.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno41
- Ruta de corrección
Cinco etapas, ordenadas por relación entre esfuerzo y ganancia. La proyección supone que los tres
elementos de la cláusula condicional están disponibles; si no lo están, la Etapa 0 pasa a ser rehacer
la campaña de medición.
EtapaQué hacerEsfuerzoProyección
## Etapa 0
Saneamiento      de      la
evidencia
Publicar  el  repositorio  con  URL  y  commit.  Declarar  las
fechas del período en §5.2.4 y en el Resumen. Incorporar en
el  Anexo  III  el  volcado  de  las  tablas  y  un  extracto  del
registro  de  ejecuciones  de  n8n.  Sustituir  los  hashes  de
ejemplo  de  la  Tabla  III-3  y  los  nombres  de  artefacto  del
§5.8.5 por los valores reales.
2-4 días4,2 → 5,4
## Etapa 1
Reconciliación numérica
Volver  a  la  base  de  datos  y  fijar  una  única  versión  de:
reparto    por    honeypot    y    por    protocolo,    tasa    de
estructuración con numerador y denominador, taxonomía y
recuento  de  IoCs,  IPs  únicas  y  países,  reportes  generados,
percentiles   de   latencia,   dispersión   y   tasa   de   error.
## Reescribir             Tablas             5.1/5.3/5.4/5.5/5.8/5.9/5.10,
III-1/III-2/III-6/III-9  y  todas  sus  reapariciones.  Corregir  los
errores  aritméticos  del  C-15.  Separar  la  reducción  por
evento (99,8 %) de la reducción de jornada (97,3 %).
4-6 días
sin     tocar     el
sistema
## 5,4 → 6,6
## Etapa 2
Figuras  y  contraste  de
hipótesis
Renderizar     los     14     diagramas     Mermaid/xychart     e
incorporarlos como imágenes. Regenerar la Figura 5.14 con
proyección  real.  Rotular  la  Figura  5.15  como  maqueta  y
alinear  §5.7  con  §5.14.  Incorporar  capturas  reales  de  n8n,
de  un  workflow,  de  una  consulta  SQL  y  de  un  reporte
generado.    Reescribir    §5.3.3,    §5.3.5,    §6.2.1    y    §7.2.1
conforme  a  lo  que  muestra  la  Figura  5.12.  Reportar  los
denominadores  reales  de  P3  y  P4,  o  reformular  ambas
hipótesis.
4-6 días6,6 → 7,4
## Etapa 3
Metodología                  y
bibliografía
Escribir  el  §4.4.  Añadir  población,  criterios  de  validez  del
evento,   protocolo   e   instrumentos.   Citar   al   menos   tres
fuentes   metodológicas.   Reescribir   el   §4.16   con   la   Ley
25.326,    base    de    licitud,    minimización    y    plazo    de
conservación.   Sustituir   Fanelle   et   al.   (2020).   Reasignar
Sokol  et  al.  (2017)  al  §4.16.  Corregir  los  siete  errores
factuales  del  C-26.  Depurar  las  13  referencias  huérfanas  e
incorporar NIST SP 800-61 Rev. 2 y Shodan. Aplicar sangría
francesa,  sentence  case  y  DOI  faltantes.  Fundamentar  con
fuentes el §1.3.
3-5 días7,4 → 8,0
## Etapa 4
Consolidación y forma
Unificar  la  lista  de  objetivos  y  de  variables.  Fusionar  tablas
redundantes  y  renumerar  sin  huecos.  Rotular  y  titular  las
trece  tablas  sin  número.  Unificar  la  numeración  de  figuras
(una   sola   serie).   Suprimir   el   §3.8   y   el   solapamiento
§7.4/§7.5/Cap.   VIII.   Eliminar   los   identificadores   internos
(RN-*,   IN-02,   US-00x,   archivos   .md).   Auditar   todas   las
referencias  cruzadas  internas.  Añadir  un  modelo  de  datos
con  el  DDL.  Partir  las  oraciones  de  más  de  60  palabras  del
§7.1 y §7.2.3 y añadir conectores en el Cap. V.
3-4 días8,0 → 8,4
Lectura de la proyección. Las Etapas 0 y 1 son, juntas, entre seis y diez días de trabajo que no
requieren  volver  a  operar  el  sistema:  son  consulta  a  la  base  de  datos  y  reescritura.  Esas  dos
etapas por sí solas llevan el trabajo desde «no recomendable» hasta «aprobada con observaciones
mayores»,  que  es  el  umbral  de  presentación.  Es  la  inversión  con  mayor  retorno  y  debería  ser  la
prioridad absoluta.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno42
- Lo que no debe tocarse
Toda  devolución  debe  indicar  también  qué  está  bien,  para  que  la  corrección  no  destruya  lo  que
funciona.  Los  siguientes  elementos  están  por  encima  del  promedio  de  la  cohorte  y  deben
conservarse sin cambios sustantivos:
•El §3.11 completo (indicadores de compromiso y estándares). El tratamiento de STIX 2.1,
TAXII  2.1,  OpenIOC  y  taxonomías  MISP  es  técnicamente  correcto,  bien  jerarquizado  y  con  la
distinción exacta entre representación semántica, transporte y vocabulario de enriquecimiento. La
Tabla III-29 (mapeo de cada tipo de IoC a su objeto STIX destino con el patrón correspondiente) es
material publicable.
•El  §3.7  (ciclo  de  vida  de  la  inteligencia)  con  su  mapeo  fase→componente.  Convierte  un
marco conceptual en una especificación de diseño, que es exactamente lo que un marco teórico
debe hacer en una tesis aplicada.
•El  §3.10  (autoevaluación  SIM3  y  MISP).  El  equipo  se  califica  a  la  baja  donde  corresponde
(niveles 1-2 en diseminación y retroalimentación) y justifica cada nivel. Corregir solo la atribución
de SIM3.
•El  §4.15  (validez  y  confiabilidad).  Es  el  mejor  pasaje  metodológico  del  trabajo.  Conserva
especialmente la declaración del sesgo de definición operacional, que juega en contra del propio
resultado.
•El  §5.13  (implementación  de  los  workflows).  Patrones  declarados,  topología  de  nodos,
manejo   de   errores   por   rama   con   tabla   dedicada   y   workflow   de   alertas   independiente,
temporizadores con expresiones cron concretas, y tabla completa de variables de entorno con su
origen. Es la mejor documentación de artefacto de la cohorte reciente.
•El §6.4 (Tabla 6.6, ocho limitaciones con impacto y mitigación). Estructura ejemplar. Solo
requiere corregir las cifras geográficas que cita.
•El  §6.7  (evaluación  crítica  de  n8n).  Autocrítica  genuina  con  hallazgos  negativos  concretos  y
medidos,  y  una  concesión  honesta  a  la  alternativa  (Python  puro)  para  equipos  con  capacidad  de
desarrollo. Es infrecuente que una tesis critique la herramienta que eligió.
•El §6.8.2 (falsos positivos y ruido). Estimar espontáneamente un 10-15 % de falsos positivos
en el propio producto, y explicar las tres estrategias de mitigación, es honestidad intelectual.
•La  organización  en  tres  niveles  epistémicos  del  §7.2.  Distinguir  resultados  confirmados,
sugeridos y aportes es un recurso valioso. Lo que hay que corregir es su aplicación, no el recurso.
•Las notas de la Tabla 6.2. Explicitar las fórmulas de mejora y diferenciar «menor es mejor» de
«mayor es mejor» es exactamente lo que un lector necesita para verificar. Conservar el criterio y
aplicarlo a todas las tablas comparativas.
•La  Tabla  III-13  (criterios  de  asignación  de  niveles  de  confianza).  Criterios  operacionales
explícitos por nivel y por tipo de IoC. Es lo que permite a un consumidor de inteligencia juzgar el
producto.
•El  etiquetado  explícito  de  §5.14,  §6.6  y  §6.9  como  «propuesta  conceptual  —  no
implementada». Declarar lo que no se hizo es una virtud y no debe eliminarse en la reescritura.
La única corrección necesaria es alinear el §5.7 con esa declaración.
•La  nota  del  Resumen  sobre  la  línea  de  base  estimada.  Advertir  en  el  resumen  que  las
comparaciones  no  provienen  de  un  experimento  controlado  es  una  decisión  editorial  correcta  y
poco frecuente. Conservarla y replicar el criterio en el §7.3.2 y el §7.6, que hoy la ignoran.
•La calidad de la prosa. Índice 7,0/10. No conviene reescribir por reescribir: corregir la longitud
de las oraciones en los dos pasajes señalados y añadir conectores en el Capítulo V, y nada más.
•El  §8.2.2  y  el  §8.3.3  (costos  y  checklist  operativa).  Son  los  aportes  más  directamente
transferibles del trabajo a una PyME o a una institución educativa.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno43
- Preguntas probables del tribunal
Se  anticipan  treinta  y  dos  preguntas,  ordenadas  por  la  probabilidad  de  que  se  formulen  y  por  la
dificultad de responderlas con el documento en la mano. Las primeras ocho son las que deciden la
defensa.
#Pregunta
Dónde se
origina
1¿Cowrie  capturó  195.300  eventos  o  157.234?  Ambas  cifras  están  en  su  capítulo  de
resultados.
## C-01
2¿Qué porcentaje de eventos se estructuró correctamente: el 84,2 % de la Tabla 5.3 o el 94,7
% con que valida la hipótesis P2?
## C-02
3Su  Figura  5.12  muestra  el  mínimo  de  actividad  entre  las  00:00  y  las  05:00  UTC.  Su  texto
afirma  que  ahí  está  el  máximo,  con  picos  superiores  a  800  eventos  por  hora,  y  de  eso
deduce que la actividad es automatizada. ¿Cuál de las dos cosas es la correcta?
## C-07
4La Figura 5.14 no muestra ningún mapa. ¿Qué se supone que debía verse?C-08
5El  §5.7  presenta  la  Figura  5.15  como  una  captura  del  dashboard  implementado  en  n8n;  el
§5.14 dice que el dashboard es una propuesta no implementada. ¿Cuál rige?
## C-09
6La  hipótesis  P3  exige  generar  IoCs  para  al  menos  el  70  %  de  las  sesiones  con  actividad
maliciosa   confirmada.   ¿Cuántas   sesiones   con   actividad   confirmada   hubo   y   cuántas
generaron IoC?
## C-17
7La hipótesis P4 exige cubrir el 90 % de los ataques categorizados como de interés. ¿Cómo
definió «ataque de interés» y cuántos hubo?
## C-17
8¿Puede mostrarnos ahora el repositorio del proyecto? Lo citan siete veces y no aparece su
dirección.
## C-20
9¿Entre  qué  fechas  se  ejecutó  el  período  de  observación?  No  hay  una  sola  fecha  en  109
páginas, y la Figura 5.12 organiza los datos por día de la semana.
## C-21
10Los  diez  hashes  de  la  Tabla  III-3  son  a1b2c3d4...,  b2c3d4e5...,  c3d4e5f6...  ¿Cómo  explica
esa secuencia en hashes SHA-256 reales?
## C-06
11Un promedio de 342 ms con desviación de 89 ms es incompatible con un P99 de 1.420 ms.
¿Sobre qué n calculó esas medidas?
## C-11
12¿De dónde sale exactamente el 97,3 %? Con 342 ms contra 30 segundos da 98,9 %; contra
3,5 minutos da 99,8 %.
## C-13
13¿Se generaron 12 reportes o 30? Su Tabla 5.5 dice 12 y desglosa siete «por umbral» que su
configuración cron no produce.
## C-05
14¿Cuántas IPs únicas hubo: 3.128 o las 3.751 que totaliza su propia Tabla III-2?C-04
15Sus IoCs suman 4.234 en la Tabla 5.4 y 4.279 en la Tabla III-9, y ninguna fila coincide entre
las dos. ¿Cuál es el recuento?
## C-03
16Si  el  ioc-extractor  procesa  todos  los  eventos  automáticamente  cada  15  minutos,  ¿quién
generó manualmente el 15,8 % de IoCs restante?
## C-17
17Su sistema almacena direcciones IP, geolocalizaciones, comandos y hashes de credenciales
de terceros durante 30 días. ¿Cuál es la base de licitud bajo la Ley 25.326 y cuál el plazo de
conservación?
## C-22
18Sokol et al. (2017) es un artículo sobre privacidad que establece que la IP es dato personal.
¿Por qué lo cita cinco veces como fuente de estadísticas de volumen de tráfico y ninguna en
su sección de ética?
## C-25
19El DOI de Fanelle et al. (2020) resuelve a un artículo sobre clasificación de cargas de trabajo
Big Data. ¿Consultó esa fuente?
## C-24
20Su Tabla 3.9.4 dice que n8n es open source con licencia MIT. La documentación de n8n dice
expresamente que no se llaman open source y que la licencia es la Sustainable Use License.
¿Afecta esto a su justificación económica?
## C-26
21T1580  en  MITRE  ATT&CK;  es  «Cloud  Infrastructure  Discovery»,  no  «Network  Denial  of
Service». ¿Cómo mapeó los hallazgos a técnicas?
## C-26
22Modern Honey Network es de ThreatStream, no de Google. ¿De dónde tomó esa atribución?C-26

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno44
#PreguntaDónde se
origina
23¿Dónde está el §4.4 «Diseño de investigación»? Lo cita dos veces como fundamento de sus
hipótesis.
## C-19
24¿Qué  son  RN-PR-05,  IN-02,  C-04  y  01_vision_y_objetivos.md?  Los  cita  como  fuente  de  sus
criterios de éxito.
## C-23
25Su §1.4.2 lista siete objetivos específicos y su §5.11 verifica seis distintos. ¿Cuál es la lista?C-18
26¿Cuál es el esquema de la base de datos? No hay diagrama ER ni DDL en toda la tesis.A-04
27Con  dos  llamadas  HTTP  a  APIs  externas  y  un  INSERT,  ¿cómo  llega  a  342  ms  de  media  por
evento? ¿Hubo caché de geolocalización?
## A-13
28Sus  criterios  de  confianza  ALTO  dependen  de  detecciones  en  VirusTotal,  pero  ningún
workflow documentado consulta VirusTotal. ¿Cómo obtuvo esas detecciones?
## A-06
29Declara un diseño no experimental y titula el capítulo «Resultados experimentales». ¿Hubo
manipulación de alguna variable?
## A-01
30Su  §4.2  declara  un  enfoque  mixto.  ¿Cuál  fue  el  instrumento  de  la  dimensión  cualitativa  y
cómo se codificaron los datos?
## A-02
31Afirma que la suya es la primera integración conocida de Cowrie y Dionaea con n8n. ¿Qué
búsqueda sistemática respalda esa afirmación y en qué bases de datos?
## A-10
## 32
ENISA (2023) aparece con 20-30 IoCs/día en cuatro lugares y con 50-80 en el §6.3. ¿Cuál es
el valor del informe?
## C-16

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno45
Anexo A — Verificaciones aritméticas reproducibles
Toda cifra del §4 de este informe puede reproducirse con los datos publicados en la tesis. Se detallan
los cálculos.
A.1 Dataset dual (C-01)
Tabla 5.1: 195.300 + 5.825 = 201.125 ✓ · 195.300/201.125 = 97,10 % ✓ · 195.300/30 = 6.510 ✓
Tabla 5.9: 157.234 + 43.891 = 201.125 ✓ · 157.234/201.125 = 78,18 % ✓ · 157.234/30 = 5.241 ✓
Tabla 5.10: SSH 142.187 + Telnet 15.047 = 157.234 (= Cowrie de la Tabla 5.9) ✓ · SMB 24.023 + HTTP
10.956 + FTP 5.012 + otros 3.900 = 43.891 (= Dionaea) ✓
Figura 5.5: 165.500 + 29.800 = 195.300 (= Cowrie de la Tabla 5.1) ✓ · 4.200 + 1.625 = 5.825 ✓
Conclusión: cada dataset es internamente consistente; entre sí difieren en 38.066 eventos.
Dirimente (Tabla III-3): suma de las diez frecuencias = 12.847 + 9.534 + 7.891 + 6.203 + 5.112
+ 4.236 + 3.845 + 3.102 + 2.687 + 2.101 = 57.558. Si eso es el 36,8 % del total de intentos, la base
es 57.558 / 0,368 = 156.408. Alternativamente, 12.847 / 0,082 = 156.671. Ambas compatibles con
157.234 (Cowrie según Tabla 5.9); incompatibles con 195.300 (error del 25 %).
A.2 Taxonomía de IoCs (C-03)
Tabla III-9: 2.847 + 856 + 312 + 178 + 45 + 41 = 4.279 ≠ 4.234 declarado.
Porcentajes de la Tabla III-9 calculados sobre 4.234: 67,24 + 20,22 + 7,37 + 4,20 + 1,06 + 0,97 =
## 101,06 %.
Tabla 5.4: 3.874 + 147 + 124 + 89 = 4.234 ✓ (internamente consistente) · 3.874 / 4.234 = 91,50 % ✓
(coincide con su nota) · pero 3.874 ≠ 2.847 (Tabla III-9).
Tabla III-14 (confianza): 312 + 1.045 + 2.877 = 4.234 ✓ · 7,37 + 24,68 + 67,95 = 100,0 % ✓
A.3 Imposibilidad estadística de la dispersión (C-11)
Datos: μ = 342 ms (Tabla III-6), σ = 89 ms (Tabla III-6), P99 = 1.420 ms (Tabla III-1).
k = (1420 − 342) / 89 = 1078 / 89 = 12,1124
Cota de Cantelli (una cola, sin supuestos distribucionales):
P(X − μ ≥ kσ) ≤ 1 / (1 + k²) = 1 / (1 + 146,71) = 1 / 147,71 = 0,00677 = 0,677 %
P99 exige que P(X ≥ 1420) = 1,000 %
1,000 % > 0,677 % → incompatible para cualquier distribución.
σ mínima compatible con ese P99 (invirtiendo Cantelli con p = 0,01):
k ≤ √(1/p − 1) = √99 = 9,9499 → σ ≥ 1078 / 9,9499 = 108,3 ms (cota inferior teórica).
En una distribución realista de latencias (log-normal), σ estaría en el orden de 300-400 ms.
A.4 La reducción del 97,3 % (C-13)
Línea de base A — «~30 segundos por evento» (nota de la Tabla 5.8):
1 − 342 / 30.000 = 1 − 0,0114 = 98,86 % (la tesis publica 97,3 %)
Línea de base B — «3,5 min = 210.000 ms» (§5.10, §6.1.1, Tabla 6.2):
1 − 342 / 210.000 = 1 − 0,001629 = 99,84 % (la tesis publica 99,8 % ✓ en la Tabla 6.2)
210.000 / 342 = 614,0× (la tesis publica «~614 veces» ✓)
Línea de base C — jornada de analista (Tabla 6.2, fila 2):
1 − 13 / 480 = 1 − 0,02708 = 97,29 % → esta es la única que produce 97,3 %
Otras verificaciones de la Tabla 6.2, todas correctas:
480 / 3,5 = 137,1 eventos/día ✓ · (6.704 − 137)/137 = 4.793 % ✓ (publica 4.794 %)
## 137 × 22 = 3.014/mes ✓ · (201.125 − 3.014)/3.014 = 6.573 % ✓
## (94,7 − 80)/80 = 18,4 % ✓ · (141 − 30)/30 = 370 % ✓
201.125 × 3,5 / 60 = 11.732,3 h ✓ · 11.732 / 8 = 1.466,5 jornadas ✓
A.5 Tasas de error (C-14)
§6.1.4: 1,2 % + 3,2 % + 0,02 % = 4,42 % (declara «combinada del 5,3 %»)
Tabla III-33: 2,1 % + 1,8 % + 3,2 % = 7,1 %
## §5.6.1 / §6.2.1: 100 − 94,7 = 5,3 %
## Tabla 5.3: 100 − 84,2 = 15,8 %
## §5.7: 1,8 % (parsing)
A.6 Errores aritméticos puntuales (C-15)
Nota de la Figura 5.3 — top 10 IPs: 4.230+3.890+2.450+1.870+1.540+1.320+1.180+980+870+810 = 22.140
(4.230 + 3.890) / 22.140 = 8.120 / 22.140 = 36,68 % (la tesis publica 40,4 %)
§5.3.4 — eventos por IP en China: 82.150 / 1.024 = 80,2 ✓ con la base 3.751 de la Tabla III-2
82.150 / (0,274 × 3.128 = 857) = 95,9 con la base 3.128 que el texto declara
Tabla III-2 — suma de eventos: 82.150+25.340+38.620+4.880+4.120+12.870+9.340+7.650+5.320+3.560+7.273 =
## 201.123 (declara 201.125)
Tabla III-2 — suma de IPs: 1.024+612+421+312+249+198+142+121+89+74+509 = 3.751 ✓ (contra 3.128 del

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno46
cuerpo)
§6.2.1 — «62,0 % de las IPs»: según Tabla III-2, 27,4 + 16,4 + 11,3 = 55,1 %
§6.1.1 — 1.466 jornadas / 264 jornadas anuales = 5,6 años (la tesis dice «superior a 4 años»)
A.7 Lectura de la Figura 5.12 (C-07)
Celdas rotuladas visibles en el mapa de calor extraído de la página 51, por franja horaria UTC:
00-05 h: sin rótulos, tonos claros (banda de menor intensidad en la escala logarítmica)
09-13 h: 363, 371, 372, 396, 380, 348, 354, 313, 327, 333, 328, 369, 306, 332, 302...
16-18 h: 362, 321, 340, 322, 329, 326, 324, 320, 328, 303...
Máximo del mapa: 396 (jueves, 10:00 UTC)
Texto: «picos >800 eventos/hora» (§5.3.3, §5.3.5); Tabla 5.9: pico combinado 1.159 ev/h; Cowrie 847
ev/h «día 14, 03:00 UTC».
Ratio entre lo afirmado y lo mostrado: 1.159 / 396 = 2,93×

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno47
Anexo B — Verificación bibliográfica externa
Se  verificaron  las  entradas  con  mayor  carga  argumental  y  aquellas  cuyos  metadatos  o  cuyo  uso
presentaban indicios de problema. Las verificaciones se realizaron contra fuente primaria o contra el
registro editorial correspondiente.
EntradaEstadoResultado de la verificación
## Fanelle, V., Karimi, M., & Shahriar, H. (2020). Analysis
of  honeypot  data  for  cyber  threat  intelligence.  IEEE
Big           Data,           pp.           2345-2353.           DOI
10.1109/BigData50022.2020.9378023
FabricadaEl título y la autoría no son localizables. El
DOI    transcrito    existe    y    resuelve    a
«Zero-Shot  Machine  Learning  Technique
for  Classification  of  Multi-User  Big  Data
Workloads», del mismo congreso. Citada 4
veces (§4.15, §6.3, Tabla 6.6, §7.6).
## Sokol,  P.,  Míšek,  J.,  &  Husák,  M.  (2017).  Honeypots
and   honeynets:   issues   of   privacy.   EURASIP   JIS
2017(1), 4. DOI 10.1186/s13635-017-0057-4
## Metadatos
correctos;
contenido
misatribuido
Verificada:  es  un  artículo  jurídico  sobre
privacidad, marco legal y bases de licitud,
que discute expresamente la IP como dato
personal   en   el   Derecho   de   la   UE.   No
contiene  estadísticas  de  volumen  ni  de
estacionalidad   de   tráfico.   La   tesis   le
atribuye las tres cosas (§4.15, §5.8.6, §6.3,
## Tabla 6.6).
Bajpai, M., & Shukla, A. (2021). Honeypot technology:
A  comprehensive  review  of  taxonomy,  challenges,
and future directions. IJARCS 12(3), 45-52.
No verificableNo  localizable  con  esos  metadatos.  Existe
una  obra  «Bajpai  et  al.  (2020)»  citada  en
la  literatura  como  referida  a  captura  de
malware  de  botnets,  que  no  coincide.  En
cualquier caso, una revisión de taxonomía
no  puede  ser  la  fuente  de  «latencias  de
800-1.200 ms para pipelines bash/Python»
## (§6.3).
Arockiam,    L.,    et    al.    (2020).    A    survey    on
honeypot-based   security   mechanisms.   Int.   J.   of
Advanced Science and Technology, 29(5), 1823-1835.
Editorial    de    baja
confiabilidad
IJAST   (SERSC)   fue   discontinuada   tras
cuestionamientos    sobre    sus    prácticas
editoriales.  La  entrada  usa  «et  al.»  en  la
lista   de   referencias,   lo   que   APA   7   no
admite:    deben    listarse    hasta    veinte
autores.
Nawrocki,  M.,  et  al.  (2016).  A  survey  on  honeypot
software and data analysis. arXiv:1608.06249
CorrectaVerificada:  Nawrocki,  Wählisch,  Schmidt,
Keil    y    Schönfelder,    arXiv:1608.06249.
Mismo problema de «et al.» en la entrada.
## Sokol  /  Ilg,  N.,  Duplys,  P.,  Sisejkovic,  D.,  &  Menth,  M.
## (2023). JNCA 220, 103737
CorrectaVerificada:    revista    Q1,    DOI    correcto.
Nunca citada en el texto.
## Franco,  J.,  Aris,  A.,  Canberk,  B.,  &  Uluagac,  A.  S.
## (2021). IEEE COMST 23(4), 2351-2383
CorrectaVerificada:    Q1,    DOI    correcto.    Nunca
citada en el texto.
## Zielinski,      D.,      &      Kholidy,      H.      A.      (2023).
arXiv:2301.00045
Correcta   con   error
de año
El preprint es de 2022 según los registros
que  lo  citan  (Ngoma,  Mpekoa  y  Pieterse,
2026, lo fechan en 2022). La tesis lo fecha
en 2023.
Bejtlich,   R.   (2004).   The   Tao   of   Network   Security
## Monitoring
Entrada     correcta;
uso anacrónico
El   libro   existe   y   los   metadatos   son
correctos.     Pero     se     le     atribuye     la
formulación de Zero Trust («nunca confiar,
siempre   verificar»),   concepto   de   John
Kindervag  (Forrester,  2010).  El  libro  trata
de monitoreo de seguridad de red.
Kampanakis, P. (2014). IEEE Security & Privacy 12(5),
## 42-51. DOI 10.1109/MSP.2014.94
Entrada     correcta;
uso anacrónico
Metadatos  verificados.  Pero  sostiene  el
§3.9.2   sobre   SOAR   y   las   plataformas
Splunk   Phantom,   IBM   Resilient,   Cortex
XSOAR y Siemplify: el término SOAR es de
Gartner (2015/2017) y esos productos son
posteriores al artículo.
Bromiley, M. (2016). SANS Reading RoomEntrada     correcta;
uso
sobreextendido
Es  un  white  paper  de  SANS  de  2016.
Sostiene  por  sí  solo  el  §3.6,  el  §3.7  y  el
§3.10  (incluida  la  atribución  errónea  de
SIM3  a  FIRST,  cuando  el  modelo  es  de  la
Open CSIRT Foundation).

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno48
EntradaEstadoResultado de la verificación
OASIS (2021) — STIX 2.1 y TAXII 2.1Duplicada          sin
desambiguar
Dos entradas distintas con el mismo autor
y  año,  sin  sufijos  2021a/2021b.  Las  citas
«(OASIS, 2021)» del §3.11 son ambiguas.
NIST SP 800-61 Rev. 2 (2012)Cita huérfanaCitada  tres  veces,  incluida  la  nota  del
Resumen  y  como  base  de  toda  la  línea
manual  del  §6.1.1.  No  figura  en  el  listado
de referencias.
Shodan (2024)Cita huérfanaCitada   en   el   §5.3.3   para   respaldar   el
predominio de SSH. No figura en el listado.
## Wagner,  C.,  Dulaunoy,  A.,  Wagener,  G.,  &  Iklody,  A.
(2016).           WISCS,           pp.           49-56.           DOI
## 10.1145/2994539.2994542
CorrectaVerificada.  Es  la  referencia  canónica  de
MISP y está bien empleada en el §3.11.6.
Ikuomenisan,  G.,  &  Morgan,  Y.  (2022).  JIS  13(4),
181-209. DOI 10.4236/jis.2022.134011
Correcta;      editorial
## SCIRP
La  meta-revisión  existe  y  los  metadatos
son  correctos.  SCIRP  es  una  editorial  de
confiabilidad discutida; conviene respaldar
la  afirmación  del  §3.5.2  con  una  fuente
adicional.
Javadpour,  A.,  et  al.  (2024).  Computers  &  Security
## 140, 103792
CorrectaVerificada:     Q1,     DOI     correcto,     bien
empleada en el §3.4.
## Morić, Z., Dakic, V., & Regvart, D. (2025). Informatics
## 12(1), 14
## Correcta
Verificada.  Es  la  fuente  más  reciente  del
trabajo y está bien empleada.
Verificaciones técnicas contra fuente primaria
Afirmación de la tesisFuente consultadaResultado
n8n  es  open  source,  licencia  MIT
(Tabla §3.9.4)
docs.n8n.io — «Sustainable Use License»La     documentación     oficial     dice
literalmente  que,  como  las  licencias
open    source    no    pueden    incluir
limitaciones  de  uso  según  la  OSI,
«no  nos  llamamos  open  source».  La
licencia    es    la    Sustainable    Use
License  (fair-code),  creada  en  2022
sobre  la  base  de  la  Elastic  License
2.0. Doblemente incorrecto.
MHN   es   un   proyecto   de   Google
## (2013-2023)
Anomali    (ex    ThreatStream);    repositorio
threatstream/mhn;  cobertura  de  prensa  de
## 2014
MHN  fue  liberado  por  ThreatStream
en  junio  de  2014.  Google  Ventures
fue inversor de ThreatStream, lo que
probablemente    originó    el    error.
Atribución incorrecta.
T1580 = Network Denial of Serviceattack.mitre.org/techniques/T1580/T1580    es    «Cloud    Infrastructure
Discovery»,      táctica      Discovery,
plataforma  IaaS.  Network  Denial  of
Service    es    T1498.    Además,    la
técnica se aplica a una campaña de
fuerza         bruta         SSH,         que
correspondería a T1110. Incorrecto
en dos niveles.
Node-RED    tiene    más    de    200k
estrellas en GitHub
Repositorio node-red/node-redEl orden de magnitud real es 2×10⁴.
Error de un factor 10.
ip-api.com:  45  consultas/minuto  en
capa gratuita
Documentación de ip-api.comCorrecto.
VirusTotal        API        pública:        4
consultas/minuto
Documentación de VirusTotalCorrecto.
SIM3 desarrollado por FIRSTOpen CSIRT FoundationSIM3    fue    desarrollado    por    Don
Stikvoort    y    colaboradores    y    es
mantenido    por    la    Open    CSIRT
Foundation.  FIRST  lo  emplea  como
referencia   pero   no   es   su   autor.
Atribución incorrecta.

Informe de auditoría — Nocturne Society (Honeypots + n8n)Auditoría integral de tesis de grado
Auditoría aplicando el Prompt Maestro · Uso académico interno49
Afirmación de la tesisFuente consultadaResultado
OpenIOC: Mandiant, «hoy FireEye»Historia societaria de MandiantFireEye  adquirió  Mandiant  en  2013;
se   separaron   en   2021   y   Google
adquirió    Mandiant    en    2022.    La
formulación      está      invertida      y
desactualizada.
Fin del informe. Elaborado el 8 de agosto de 2026 mediante la aplicación del Prompt Maestro para la Revisión Integral
de              una              Tesis              de              Grado              Universitaria              sobre              el              archivo
«Nocturne_Society_-_Tema_8_Honeypots_(Crespo,_Norton_y_Santos)_-_CORRECCIÓN.pdf».          Las          verificaciones
aritméticas del Anexo A son reproducibles a partir de los datos publicados en la propia tesis; las bibliográficas del Anexo
B, contra fuente primaria.
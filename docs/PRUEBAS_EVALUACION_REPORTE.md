# Plan de evaluación: comprensión y utilidad del reporte de inteligencia

Este plan se escribió el 06/10/2026, **antes** de construir las páginas y de aplicar la evaluación. Lo que efectivamente ocurra se registra en `docs/evidencia/evaluacion/`. Si un resultado no coincide con lo esperado, se informa así.

## 1. Objetivo y alcance

El objetivo específico 6 de la tesis («evaluar la utilidad operativa mediante métricas») figura como parcialmente cumplido, porque la utilidad del reporte no se evaluó con personas. Esta evaluación mide si una persona que **no desarrolló** el sistema puede leer el reporte diario real y sacar de él la información que necesitaría un analista, y si reconoce lo que el reporte no dice.

**Qué no es.** No es una evaluación con analistas de seguridad ni compara el reporte con una herramienta comercial. Es una prueba de comprensión con cinco participantes ajenos al equipo autor, los mismos que participaron en la línea de base B1 (P3 a P7: tres estudiantes de informática o sistemas, uno con cursos de seguridad y uno con otra formación). Ya conocen el tipo de eventos de Cowrie, lo que favorece la lectura del log y del reporte.

## 2. Material

- **Reporte:** el reporte real generado por el disparo de producción de `report-generator` a las 08:00 ART del 06/10/2026 (id 1, validación B3), tal como lo guarda el sistema: un JSON con 3.218 eventos y 66 sesiones autenticadas. No se modifica ni se resume.
- **Fragmento de log:** los 57 eventos de Cowrie de una corrida del simulador de esa misma ventana (de las 10:30 a las 10:45 UTC): 10 sesiones, una con login exitoso y comandos. Se muestra tal como lo escribe Cowrie, una línea JSON por evento.
- **Instrumento:** una página HTML por participante (`docs/evidencia/evaluacion/paginas/`), que muestra una pregunta por vez junto con el material, mide el tiempo de cada una y guarda las respuestas.

## 3. Procedimiento

- Cada participante lo hace **solo**, en el mismo equipo y de forma consecutiva, sin ver la pantalla de otro y sin comentar nada hasta que todos terminen.
- **Lo único que se le dice** es lo que figura en la portada de la página. No se explica el funcionamiento del sistema ni se responde sobre el contenido de las preguntas.
- **Orden de los bloques** (contrabalanceado): P3, P5 y P7 hacen primero el bloque del reporte y después el del log; P4 y P6, al revés.
- Si no saben una respuesta, escriben «no sé». No se consultan fuentes externas.

## 4. Preguntas

**Bloque del reporte (material: el reporte).** Respuestas con una única respuesta correcta, que se toma del propio reporte.

| ID | Pregunta | Respuesta correcta |
|---|---|---|
| R1 | ¿Cuántos eventos registró el sistema en el período del reporte? | 3218 |
| R2 | ¿Desde cuántas direcciones IP distintas llegó la actividad y cuál es la más activa? | 1; 10.0.1.3 |
| R3 | ¿Cuál es la combinación usuario/contraseña intentada más veces y cuántos intentos tuvo? | oracle / oracle; 38 |
| R4 | ¿Cuántos eventos fueron intentos de login fallido? | 472 |
| R5 | ¿Cuántos indicadores de compromiso (IoC) de tipo «command» se detectaron? | 5 |
| R6 | ¿Qué tipo de IoC es el más frecuente y cuántos hay de ese tipo? | credential; 26 |
| U1 | ¿Cuál fue el comando que más veces ejecutaron los atacantes? | **El reporte no lo dice** |
| U2 | ¿En qué hora del día hubo más actividad? | **El reporte no lo dice** |

En U1 y U2 la página ofrece dos opciones: «Está en el reporte» (con un campo para escribirlo) o «El reporte no lo dice».

**Bloque del log (material: el fragmento).**

| ID | Pregunta | Respuesta correcta |
|---|---|---|
| L1 | ¿Con qué usuario y contraseña se logró entrar en una sesión? | webadmin / Web2026! |
| L2 | ¿Qué comandos ejecutó el atacante después de entrar? (uno por línea) | cat /etc/passwd; date; df -h; bash --version |

Antes de usar las respuestas, el script de construcción verifica que cada una coincida con los datos de la evidencia publicada (`docs/evidencia/b3/`).

**Cuestionario** (escala de 1, «muy en desacuerdo», a 5, «muy de acuerdo»):
- S1. El reporte me resultó claro.
- S2. Pude encontrar rápido en el reporte lo que me pedían.
- S3. Con este reporte tendría información suficiente para decidir si vale la pena mirar el log en detalle.
- S4. Confiaría en los números del reporte.
- S5. Para entender qué hizo un atacante en una sesión, el log me resultó más útil que el reporte.

Y tres preguntas abiertas: qué agregaría al reporte, qué le sobró o lo confundió, y qué fue lo más difícil del log.

## 5. Métricas y umbrales (fijos)

Una respuesta es correcta si todos sus campos coinciden con la respuesta esperada, sin distinguir mayúsculas ni espacios al principio o al final, y quitando separadores de miles en los números. En L2, el conjunto de comandos debe ser idéntico, sin importar el orden.

| ID | Métrica | Umbral |
|---|---|---|
| E1 | Proporción de respuestas correctas en R1 a R6 (30 respuestas), con intervalo de Wilson al 95 % | ≥ 80 % |
| E2 | Mediana del tiempo por pregunta en R1 a R6 | ≤ 60 s |
| E3 | Proporción de participantes que reconocen que U1 y U2 no están en el reporte (10 respuestas) | ≥ 80 % |
| E4 | Utilidad percibida: promedio de S1 a S4 de cada participante, y media de esos promedios | ≥ 4,0 |

**Se informan sin umbral:**
- exactitud y tiempo de L1 y L2;
- por participante, el tiempo de R3 frente al de L1 (ambas preguntas piden una credencial);
- S5 y las respuestas abiertas;
- las preguntas con más errores.

## 6. Limitaciones declaradas de antemano

1. **N = 5**, sin inferencia; los intervalos son amplios.
2. **No son analistas** y ya conocen el sistema por B1.
3. **No hay línea de comparación equivalente.** El log y el reporte se miden sobre datos distintos (una corrida y 24 horas), por lo que L1 y R3 no son comparables como pares estrictos; son una referencia.
4. **La respuesta correcta del bloque del reporte se toma del propio reporte**, así que E1 mide comprensión, no exactitud del reporte; el script de construcción comprueba esos números contra la evidencia de B3, y un desacuerdo se informa.
5. **Mismo equipo, misma cuenta y aplicación consecutiva**, como en B1; no se puede descartar que un participante vea la pantalla anterior o escuche a otro.
6. **El reporte es un JSON sin interfaz.** El resultado habla de este formato y no de un reporte presentado con tablas o gráficos.
7. **Los umbrales se fijaron sin ver datos de esta evaluación.**

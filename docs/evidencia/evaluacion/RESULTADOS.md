# Resultados: evaluación del reporte con participantes externos (06/10/2026)

Plan fijado antes de aplicar: `docs/PRUEBAS_EVALUACION_REPORTE.md` (registrado en BITACORA.md). Respuestas en `resultados/`, métricas en `resultados_evaluacion.json` (calculadas con `experimentos/evaluacion_reporte/analisis.js`, tal como se registró) y observaciones post hoc en `posthoc.json` (`experimentos/evaluacion_reporte/posthoc.js`). Todas las horas son UTC.

## Aplicación

Cinco participantes ajenos al equipo (P3 a P7, los mismos de B1), en el mismo equipo y la misma cuenta, uno atrás del otro, de las 13:30 a las 14:08 UTC. La duración fue de 5,2, 3,5, 16,0, 2,6 y 8,4 minutos. El orden de los bloques fue el previsto: primero el reporte para P3, P5 y P7, y primero el log para P4 y P6.

**Desvíos.**
1. **P3 empezó a las 13:30, antes de que el plan y el instrumento se publicaran** (13:37:20). Su registro local es anterior (commits de las 13:21 y las 13:24) y consta en BITACORA.md, pero no era comprobable desde afuera. P4 a P7 empezaron después de la publicación.
2. Quien aplicó la evaluación no informó interrupciones, recargas de página ni ayuda a los participantes. No se registraron más datos sobre la aplicación.
3. Las tres preguntas abiertas quedaron **sin responder** en los cinco casos.

## Resultados frente a los umbrales fijados

| ID | Métrica | Resultado | Umbral | ¿Se cumple? |
|---|---|---|---|---|
| E1 | Respuestas correctas, R1 a R6 | **25/30 = 83,3 %** (IC 95 % [66,4; 92,7]) | ≥ 80 % | Sí, pero el límite inferior del intervalo queda por debajo |
| E2 | Mediana del tiempo por pregunta, R1 a R6 | **11,8 s** (media 54,5 s) | ≤ 60 s | Sí |
| E3 | Reconocen que U1 y U2 no están en el reporte | **10/10 = 100 %** (IC 95 % [72,2; 100]) | ≥ 80 % | Sí |
| E4 | Utilidad percibida, promedio de S1 a S4 | **3,0** (por participante: 3,5; 3,0; 3,0; 2,75; 2,75) | ≥ 4,0 | **No** |

**Por pregunta** (correctas, mediana en segundos):

| R1 | R2 | R3 | R4 | R5 | R6 | U1 | U2 | L1 | L2 |
|---|---|---|---|---|---|---|---|---|---|
| 5/5, 9,2 | 5/5, 18,4 | 4/5, 15,8 | 4/5, 8,4 | **3/5**, 9,9 | 4/5, 13,9 | 5/5, 11,9 | 5/5, 1,2 | **0/5**, 19,2 | **0/5**, 20,0 |

**Cuestionario.** Promedio por ítem: S1 (claridad) 2,8; S2 (encontrar rápido lo pedido) 2,8; S3 (alcanza para decidir si mirar el log) 3,6; S4 (confianza en los números) 2,8. S5 («el log me resultó más útil que el reporte») dio 3, 3, 2, 2 y 3.

## Qué se encontró

- **Los participantes pudieron sacar datos del reporte** (E1 y E2), y **reconocieron lo que el reporte no dice** (E3).
- **La utilidad percibida quedó por debajo del umbral** (E4). Fueron bajas la claridad (S1), la rapidez para encontrar lo pedido (S2) y la confianza en los números (S4), las tres con 2,8; el ítem mejor valorado fue S3: el reporte les parece suficiente para decidir si vale la pena mirar el log. Como las respuestas abiertas quedaron vacías, no hay explicación de los participantes. Es coherente con la limitación 6 del plan (el reporte es un JSON sin interfaz), pero eso no se probó.
- **Los errores del bloque del reporte se concentran.** P3 acertó 2 de 6 (se equivocó en R3, R4, R5 y R6). P4 se equivocó en R5: contestó 330, que es la cantidad de eventos `cowrie.command.input` de la distribución de eventos, en lugar de los 5 indicadores de tipo `command`; es una confusión entre dos «command» que aparecen en el reporte. P5, P6 y P7 acertaron las seis. Sin P3, la exactitud habría sido 23/24; esa cifra es **post hoc** y no reemplaza a E1.
- **El log fue más difícil que el reporte.** Con el criterio registrado (todos los campos exactos), L1 y L2 dieron **0/10**. P3 contestó que no hubo ningún login exitoso en el fragmento. Los otros cuatro encontraron el usuario correcto, pero escribieron la contraseña como `Web2026`, sin el «!» final; y tres de ellos omitieron el último comando (`bash --version`) y uno entregó solo dos.
- **Tiempos de R3 y L1** (ambas piden una credencial), por participante: P3 29,2 y 77,4 s; P4 22,0 y 19,2 s; P5 13,0 y 9,2 s; P6 15,8 y 55,5 s; P7 12,9 y 10,7 s. No hay una diferencia consistente, y los datos son distintos (24 horas y una corrida), por lo que no permiten decir que el reporte sea más rápido que el log.

## Observaciones post hoc

Definidas después de ver los resultados, sin umbral, y sin modificar los resultados anteriores (`posthoc.json`):
- **L1:** usuario correcto en 4 de 5; contraseña correcta, ignorando signos finales, en 4 de 5. **Una hipótesis**, no probada, es que al copiar la contraseña con doble clic del navegador se selecciona la palabra y no el signo «!». La coincidencia exacta de los cuatro es también compatible con que algún participante haya visto o escuchado a otro (limitación 5 del plan), que no se puede descartar.
- **L2:** comandos esperados encontrados: 0/4 (P3), 3/4 (P4), 3/4 (P5), 2/4 (P6) y 3/4 (P7). Las tres respuestas de 3/4 son idénticas. Los cuatro comandos están en líneas consecutivas del fragmento (43 a 46).
- **Tiempos:** 3 de las 30 respuestas de R1 a R6 superan los 200 s (P5 en R1 y R2, 223 y 659 s; P7 en R1, 310 s), todas del bloque que empezó por el reporte; sin ellas, la media es de 16,4 s. No se registró la causa. Por eso se fijó la mediana como métrica.

## Limitaciones de la lectura

Valen las del plan: N = 5 sin inferencia, no son analistas y conocen el sistema por B1, el log y el reporte se miden sobre datos distintos, la respuesta correcta del reporte se toma del propio reporte (E1 mide comprensión) y la aplicación fue consecutiva en un mismo equipo. Además, el reporte se presentó como el JSON que guarda el sistema, no como un reporte con interfaz.

## Datos personales

Los archivos contienen solo el código del participante, sus respuestas, los tiempos y el navegador. No hay nombres ni respuestas abiertas.

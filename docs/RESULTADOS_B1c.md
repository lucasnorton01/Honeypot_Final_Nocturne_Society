# Resultados B1c — línea de base manual ampliada (P1)

Medición hecha el 2026-10-08, con el registro previo `docs/PREREGISTRO_B1c.md` ya publicado (tag `Honeypot_Final_2026-10-08b`, 09:28 ART). Archivos: `docs/evidencia/b1c/resultados/` (con `SHA256SUMS.txt`). Análisis: `scripts/b1_analisis.js` (el de B1) y `scripts/b1c_validar.js` (control de la sección 4 del registro).

## 1. Participantes y validez
Diez personas (P18 a P27) con archivo válido según la sección 4 del registro: versión `b1-v3`, código asignado, 22 respuestas en el orden de la muestra, tiempos consistentes. N = 10, por encima del mínimo de 8 fijado: **cuenta como línea de base ampliada**. No se excluyó ningún archivo. Se analizaron los archivos tal como los generó la página.

Perfil de formación: siete se declararon estudiantes y tres, estudiantes con formación en seguridad (`estudiante-seg`). Para P18, P19 y P22 el archivo no trae el perfil (ver 4.1); los autores informan que son estudiantes de informática o sistemas y se cuentan como «estudiante».

## 2. Resultado principal (criterio fijado antes)
Mediana por evento del paso 1 entre los 10 participantes y, luego, mediana de los 20 eventos.

| | B1c (10 nuevos) | B1 externos (5) | B1 todos (7) | B1 equipo (2) | B1c + B1 externos (15) |
|---|---|---|---|---|---|
| Mediana del paso 1 | **11,01 s** | 10,36 s | 11,50 s | 18,44 s | 10,92 s |
| Media del paso 1 | 11,32 s | 10,69 s | 12,02 s | 29,94 s | 11,07 s |
| Mediana total (pasos 1 y 2) | 17,83 s | 16,80 s | 19,28 s | 34,46 s | 17,37 s |

Por participante, la mediana del paso 1 va de 9,92 s (P24) a 12,91 s (P19); por perfil: «estudiante» (7 con P18, P19 y P22) entre 9,92 y 12,91 s y «estudiante-seg» (3) entre 10,17 y 11,79 s.

**P1.** Frente a la mediana principal (11,01 s), la latencia media de ingesta de W2 (1,6 s) y la de C2 (1,37 s) equivalen a una reducción de 85,5 % y de 87,6 %. Con las 15 personas externas (10,92 s), 85,3 % para W2. El umbral de P1 (50 %) se supera con las tres líneas de base; B1c no cambia el veredicto, lo confirma con una muestra mayor.

## 3. Calidad de las respuestas (secundario)
Sobre 10 × 20 = 200 eventos medidos:

| Medida | Valor |
|---|---|
| Paso 1 correcto (campos, tipo y relevancia) | 196 de 200 (98,0 %) |
| Paso 2 correcto (severidad, tipo y valor del IoC) | 113 de 200 (56,5 %) |
| Errores de campos | 2 de 1.000 |
| Errores de tipo de evento | 0 |
| Errores de relevancia | 2 |
| Errores de severidad | 3 |
| Errores de tipo de IoC | 6 |
| Errores de valor del IoC | 79 |

Los 79 errores de valor del IoC son sistemáticos: todos los participantes escribieron la credencial como `usuario /contraseña` (por ejemplo, `admin /test123`) y el criterio de `scripts/b1_analisis.js` espera `usuario:contraseña`. Es el mismo defecto de formato que ya tuvo B1, y explica casi todo el 43,5 % de eventos del paso 2 marcados incorrectos. Las cifras de error de este registro **no** se interpretan como falta de competencia de los participantes; los tiempos no dependen de ese formato.

## 4. Hechos que se declaran
1. **Defecto del botón «Reiniciar mi medición».** P18, P19 y P22 reiniciaron una vez (`reinicios = 1`). Al reiniciar, la página dejó vacíos `inicio` y `perfil` en el archivo (el código del reinicio no los vuelve a fijar). Los tiempos y las respuestas no se afectan; el perfil se completó con lo informado por los autores (sección 1). Es un error del instrumento y no se corrigió el archivo.
2. **Pausa larga de P27.** Un evento tiene 850,2 s en el paso 1 (unos 14 min), que se interpreta como una interrupción. Por el registro previo no se descarta ningún dato por lento; la mediana de los 20 eventos casi no cambia.
3. **Una sola computadora.** Las diez personas lo hicieron en el mismo equipo, por turnos y sin ver la pantalla de las demás. El equipo, el navegador y el monitor son los mismos para todos; los autores informan que P26 y P27 lo hicieron por separado (los archivos tienen una diferencia de 2 s entre las horas de inicio, y no hay otra evidencia de simultaneidad).
4. **Tanda descartada antes de la publicación.** Una tanda de P18, hecha de 09:00 a 09:16 (ART) antes de publicar el registro y con problemas de avance de pantalla, se descartó entera (sección 7 del registro). Los resultados de P18 son los de la tanda posterior a la publicación.
5. **Efecto de aprendizaje y de repetición.** Si alguien había hecho B1b, no se registró; no se puede distinguir.
6. **Sesgos de B1:** participantes reclutados por los autores; muestra de 20 eventos de un ataque simulado de una sola IP; eventos de la ventana W2.

## 5. Qué se concluye
La línea de base manual del paso 1 pasa de N = 2 (equipo) y N = 5 (externos) a N = 15 externos, con una mediana estable de 10,9 a 11,0 s por evento. P1 se sostiene con holgura (85 a 88 % de reducción frente al umbral de 50 %). No se agregan hipótesis ni umbrales, y no se modifica ningún veredicto de P1 a P4.

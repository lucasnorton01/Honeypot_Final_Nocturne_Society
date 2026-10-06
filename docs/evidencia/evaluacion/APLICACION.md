# Cómo aplicar la evaluación del reporte

Plan: `docs/PRUEBAS_EVALUACION_REPORTE.md`. Duración: unos 20 minutos por participante.

## Antes de empezar
1. Un solo equipo y una sola cuenta, como en B1. Cerrar el resto de las ventanas del navegador.
2. Cada participante usa **la página con su código**, el mismo que tuvo en B1: `paginas/evaluacion-P3.html` a `paginas/evaluacion-P7.html`. El código ya viene fijo en la página.
3. Las páginas funcionan sin Internet: se abren con doble clic.

## Con cada participante
1. Abrirle **solo su página** y dejarlo solo, sin que vea la pantalla de otro participante.
2. **No explicar nada** del sistema, del reporte ni de las preguntas. Lo único que se le dice es que lea la portada y siga las instrucciones. Si pregunta qué significa algo, se le responde: «lo que entiendas de lo que muestra la página».
3. Los participantes que esperan no comentan nada con quien está haciendo la actividad.
4. Al final, la página **descarga sola** un archivo `evaluacion-Pn.json` (carpeta Descargas). Verificar que esté antes de cerrar la pestaña.
5. Cerrar la pestaña antes de que pase el siguiente.

## Después
Copiar los cinco archivos `evaluacion-P3.json` a `evaluacion-P7.json` a `resultados/` y correr, desde la raíz del repo:

    node experimentos/evaluacion_reporte/analisis.js

## Si algo sale mal
- Si un participante recarga la página en el medio, retoma en la pregunta en que estaba, y el tiempo de esa pregunta vuelve a empezar. Anotarlo.
- Si la descarga falla, la página muestra el contenido del archivo al final: se puede copiar a mano.
- Cualquier interrupción, ayuda recibida o cambio respecto de este procedimiento se informa en los resultados.

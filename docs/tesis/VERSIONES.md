# Versiones de la tesis

| Versión | Estado | Archivos | SHA-256 |
|---|---|---|---|
| v77 | Versión anterior, entregada y congelada el 09/10/2026 (tag `Honeypot_Final_entrega`; ver `VERSION_CONGELADA.txt`, que no se modifica) | `Tesis_Nocturne_Society_v77_entrega.pdf` / `.docx` | PDF `49a5e3d695fcb8350e31f38687f4f868de974408e5cca4cc56a161d65582f3b0`; DOCX `a146e3d0d7570e90daaeeecd57c821f459215d9e9cc7188b1506272b47f47d20` |
| v79 | **Versión final, congelada** el 11/10/2026 (tag `Honeypot_Final_v79_entrega`; ver `VERSION_CONGELADA_v79.txt`). Incluye los cambios de la v78 y v79, la validación R1 y la réplica independiente C. 125 páginas | `Tesis_Nocturne_Society_v79.pdf` / `.docx` | PDF `d8841f14872b0b0894515f3bd34619b8b6500e0d2c1f0ae98dc3246b9b7f7bd0`; DOCX `0c336143cc5da239e0e25126c4e1bed833d2d3cec011577cf601705cb125da4e` |

## Qué agrega la v79 sobre la v77
- Correcciones de forma y de redacción de las versiones v78 y v79 (glosario, Tabla 8.1 con la columna «Fijado», estados de los objetivos 2 y 5, marco teórico, consolidación del Capítulo IX).
- **R1** (§6.13): 200 sesiones reales de un dataset público (Wang et al., 2025) reproducidas por los autores contra el prototipo, sin exposición a Internet. Registro previo: tags `Honeypot_R1_prereg` y `Honeypot_R1_prereg2`; evidencia: tag `Honeypot_R1_evidencia`, carpeta `docs/evidencia/r1/`.
- **Réplica independiente C** (§6.13.4): una persona ajena al equipo levantó el sistema siguiendo solo el README del tag `Honeypot_Final_2026-10-08g` y obtuvo 102 eventos de Cowrie y 102 filas en `events` (exitosa), con asistencia de IA para ejecutar los comandos y sin intervenciones del equipo. Evidencia: tag `Honeypot_Rep_evidencia`, carpeta `docs/evidencia/rep/`.
- R1 y la réplica C no cambian los veredictos de P1 a P4 ni la hipótesis general, que siguen siendo los de L0 y W2.

## Aclaraciones
- El código y los workflows son los del tag `Honeypot_Final_2026-10-08g`. R1 agrega solo el reproductor `attack-runner/replay_dataset.py`, los scripts `scripts/r1_*` y las cuentas de la muestra en `cowrie/userdb.txt` (detalle en la sección 7 de `docs/PREREGISTRO_R1.md`).
- La v79 se congeló con su propio `VERSION_CONGELADA_v79.txt` y un tag nuevo; el congelado y el tag de la v77 no se tocaron. Desde esa fecha, cualquier cambio en la tesis requiere una versión nueva y un tag nuevo.

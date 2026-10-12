# v84 (borrador): tag de la portada

Base: la v83. Se cierra el pendiente `[[CONFIRMAR: tag]]` de la portada (opción A).

| Control | Resultado |
|---|---|
| Tag nuevo | `Honeypot_Final_2026-10-12` (anotado), publicado en origin |
| Commit del tag | `8fc2463bd65330fcf316702e78e10ff983f45cd8` (`git rev-parse Honeypot_Final_2026-10-12^{commit}`) |
| docs/DETALLES_CUERPO.md en el tag | Sí (`git show Honeypot_Final_2026-10-12:docs/DETALLES_CUERPO.md`); en el tag 08g, no |
| Cambios de código entre 08g y el tag | Ninguno en workflows, docker-compose.yml, forwarder, db ni n8n. Solo se agregan los archivos de R1 y de la réplica C ya declarados en el Anexo X (attack-runner/replay_dataset.py, scripts/r1_*, cuentas de R1 en cowrie/userdb.txt, docs/evidencia/r1/, docs/evidencia/rep/) y dos líneas de .gitattributes (docs/evidencia/r1/** y rep/** como -text) |
| Páginas / errores de referencia | 125 / 0 |
| `[[` en el PDF | 0 |

SHA-256 del PDF: `d076bd7a3d558235e53157a0d87709d1169bdd631262507a17c7c8ebb0534cfd`
SHA-256 del DOCX: `b2afde2b52f48b8baa0701c86cdd036b99dd3e2c0a112274b076b55a464075c6`

| Dónde | Qué se cambió |
|---|---|
| Portada | «Tag: Honeypot_Final_2026-10-12 (commit 8fc2463bd65330fcf316702e78e10ff983f45cd8)»; sin marca `[[CONFIRMAR: tag]]` |
| Anexo II (nota de alcance) | Tag y commit nuevos |
| Anexo X, «Versión de la portada» | Tag y commit nuevos; código, workflows y evidencia idénticos a los del 06e; el tag nuevo solo agrega documentación (DETALLES_CUERPO.md y la tesis hasta la v83) y los archivos de R1 y de la réplica C |
| Anexo X, párrafo de R1 | R1 se agrega al código del tag 08g (ya no «de la portada»); tags citados en forma abreviada |
| Tabla X-1 | Fila nueva «Honeypot_Final_2026-10-12»; en la fila de 08f y 08g se quitó «tag de la portada» |
| Sin cambios | Las menciones del 08g como tag de C3 (Tabla VI-2) y de la réplica C (§6.13.4) |

Salvedades:
- El tag no puede contener la tesis v84, porque la v84 cita el hash del tag. Contiene la tesis hasta la v83; por eso la fila de la Tabla X-1 dice «tesis hasta la v83».
- Para que el Anexo X cupiera en 125 páginas se acortaron unas frases de ese anexo (se quitó la ruta API/public/index.html de la descripción de la portada y el «Registro previo/evidencia» se abrevió).
- La rama `main` local contiene ahora los borradores v82 y v83 (avance rápido desde `v83-dictamen`). No se hizo push de `main`: solo del tag.

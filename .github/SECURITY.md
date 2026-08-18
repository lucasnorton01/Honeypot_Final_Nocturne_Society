# Política de seguridad

## Propósito del laboratorio

Este repositorio documenta un **laboratorio aislado de honeypots** (Cowrie + n8n +
PostgreSQL) construido con fines académicos por Nocturne Society (Crespo, Norton,
Santos), UTN FRM, 2026 (tesis de grado). El stack se ejecuta **únicamente en
localhost**: no está expuesto a Internet y los ataques procesados son generados
localmente por el simulador incluido (`scripts/attack_simulator.py`).

## Postura de protección de datos

- El laboratorio captura direcciones IP, geolocalizaciones, ASN, reputaciones y
  comandos de conexiones hostiles simuladas y reales contra el entorno local.
  Estos datos son tratados de forma **agregada y con fines académicos**, sin
  recolección de datos personales de terceros legítimos.
- **Secretos**: los valores reales de tokens e IDs de chat **nunca** se publican.
  `.env` y los archivos con forma de secreto están gitignoreados y un escáner
  pre-commit (`scripts/scan_secrets.ps1`) bloquea cualquier push que los
  contenga. Use `.env.example` como plantilla segura.
- Las evidencias de ejecución de n8n se exportan como copias íntegras (verbatim)
  de la base interna del contenedor, con manifest de integridad (SHA-256).

## Ventana de validación declarada

La evidencia del pipeline corresponde a la ventana de validación
**2026-08-11T13:58Z → 2026-08-12T20:00:00.143Z** (instantes UTC; equivalente
local −03:00: 10:58 → 17:00), documentada en
`evidencia/n8n-executions-20260818.json` y en `README.md`. No existen registros
anteriores a la ventana y **ningún registro fue fabricado ni rellenado**. El cron
de `report-generator` (`0 8 * * *`) nunca se disparó; sus únicas ejecuciones
fueron corridas manuales por CLI (ids 32, 66, 119 del 2026-08-11).

## Editor de n8n sin autenticación (estado documentado)

El editor de n8n (`http://localhost:5678`) opera actualmente **sin
autenticación**, aceptable solo por tratarse de un laboratorio local aislado,
nunca expuesto. La habilitación de credenciales básicas vía
`N8N_BASIC_AUTH_*` está documentada como trabajo de seguimiento (D4; ver
`.env.example` para el bloque comentado de variables). No exponga el puerto 5678
hasta completar ese seguimiento.

## Reporte de vulnerabilidades

Este es un proyecto académico sin superficie expuesta. Problemas de seguridad
del stack (no del contenido académico) pueden reportarse por el canal del
equipo; los fixes se coordinan sin dejar de preservar la integridad de la
evidencia.
# Datasets Sintéticos

Datos sintéticos generados por `generar_dataset.js`. No son capturas de sensores ni salidas del pipeline.

## Qué son

- **Totales fijados de antemano**: el script define cantidades exactas (201.125 eventos, 6.730 sesiones, 4.234 IoCs) y genera eventos que las cumplen.
- **Distribuciones hardcodeadas**: proporciones por protocolo, país, tipo de IoC y confianza están definidas en arrays estáticos.
- **No procesados por n8n**: el script escribe directamente archivos JSON y SQL; los datos nunca pasan por event-ingest, ioc-extractor ni report-generator.
- **Mapeo IP→país asignado por el script**: no es geolocalización real; es una tabla fija de octetos por país.
- **Eventos Dionaea sintéticos**: el generador produce eventos SMB y HTTP que imitan Dionaea, pero son ficticios.
- **13 eventos reales verbatim**: la sesión `d7525579e2e2` (líneas 478-507 del script) contiene 13 eventos copiados textualmente de un volcado real de PostgreSQL del 2026-08-11. Son la única porción no sintética del dataset.

## Archivos generados

| Archivo | Contenido |
|---------|-----------|
| `postgres-dump-20260811.sql` | Volcado SQL con INSERTs de events, iocs, reports y error_log |
| `cowrie-events.json` | 157.234 eventos Cowrie (SSH + Telnet) |
| `dionaea-events.json` | 43.891 eventos Dionaea (SMB + HTTP) |
| `report-YYYYMMDD.json` | 30 reportes diarios (uno por día de la ventana) |
| `geoip-mapping.json` | 3.128 IPs públicas → país (asignación fija) |
| `resumen-dataset.json` | Agregados estadísticos del dataset |
| `dataset_m5.json` | 16 eventos de ejemplo (IPs RFC 5737) |

## Uso permitido

- Proyecciones de costo y volumen.
- Pruebas de rendimiento del esquema PostgreSQL.
- Validación de que el parser de JSON/SQL funciona correctamente.

## Uso NO permitido

- Presentar estos datos como evidencia de tráfico real.
- Inferir resultados de hipótesis (P1-P4) a partir de estos archivos.
- Confundirlos con capturas de sensores o salidas del pipeline n8n.

## Regenerar

```bash
node datasets-sinteticos/generar_dataset.js
```

El script es determinista (semilla fija `0x20260811`): la misma versión siempre produce los mismos archivos.

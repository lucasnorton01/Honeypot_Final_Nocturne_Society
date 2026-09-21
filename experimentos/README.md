# Experimentos

Variantes locales de workflows y archivos de prueba. **NO son evidencia** del pipeline canónico.

## Archivos

| Archivo | Propósito | Disparadores | Nota |
|---------|-----------|--------------|------|
| `report-generator-fixed.json` | Variante con Manual Trigger agregado; queries sin filtro temporal | Manual Trigger + Schedule (`0 8 * * *`) | NO es evidencia |
| `report-generator-manual.json` | Variante disparada por HTTP webhook en vez de cron | Webhook POST `/report-generate` | NO es evidencia |
| `test-geo-enrichment.json` | Prueba aislada del servicio de geolocalización (ip-api.com) | Webhook POST `/test-geo` | NO es evidencia |
| `report-generator-verif-cron.json` | Verificación temporal del disparador programado (cron cada 3 min) | Schedule (`*/3 * * * *`) | Temporal; NO reemplaza la configuración canónica (`0 8 * * *`) |

## report-generator-verif-cron.json

Workflow temporal para verificar que el disparador programado funciona.

**Cambios respecto al canónico (`report-generator.json`):**
- `id`: `wf-report-generator-verif-0004`
- `name`: `report-generator-verif-cron`
- Expresión cron: `*/3 * * * *` (cada 3 minutos en vez de `0 8 * * *`)

**Cómo importarlo:**
1. En n8n: **Workflows → Import from File** → seleccionar `experimentos/report-generator-verif-cron.json`.
2. Activar el workflow (toggle **Active**).
3. Observar que se ejecuta cada ~3 minutos en **Executions**.

**Cómo desactivarlo:**
1. En n8n: abrir el workflow → toggle **Active** (off).
2. Eliminar el workflow si ya no se necesita.

**Importante:** este workflow es solo para verificación. La configuración canónica sigue siendo `0 8 * * *` en `n8n/workflows/report-generator.json`.

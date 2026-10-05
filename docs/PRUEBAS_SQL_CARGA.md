# Plan de pruebas: consultas parametrizadas y prueba de carga

Este plan se escribió el 05/10/2026, **antes** de modificar los workflows y de ejecutar las pruebas. Lo que efectivamente ocurra se registra en `docs/evidencia/sql_carga/`. Si un resultado no coincide con lo esperado, se informa así.

## 1. Consultas parametrizadas (inyección SQL)

**Problema declarado en el §5.13.6.** Los workflows arman el SQL concatenando valores que controla el atacante:
- `event-ingest` duplica las comillas simples en el nodo Code.
- `ioc-extractor` interpola los indicadores y el mensaje de error.
- `report-generator` inserta sin escape un reporte que incluye las credenciales capturadas, así que una contraseña con apóstrofo haría fallar el reporte diario.

**Cambio.** Todas las consultas que reciben datos pasan a usar parámetros (`$1`, `$2`, …) del nodo Postgres de n8n, en lugar de texto concatenado:
- En `ioc-extractor`, los indicadores se pasan como un único parámetro JSON (`json_to_recordset`).
- En `report-generator`, el reporte se pasa como parámetro `jsonb`.
- Los `INSERT` en `error_log` también usan parámetros.

### Pruebas

| ID | Prueba | Esperado |
|---|---|---|
| Q0 | **Antes del cambio:** sesiones con credenciales que contienen `'`, y una ejecución de `report-generator` | El reporte **falla** (se reproduce el defecto declarado) |
| Q1 | **Después del cambio:** sesiones contra Cowrie con usuario, contraseña y comando que contienen `'`, `\` y `'; DROP TABLE events; --` | Los eventos se guardan **idénticos** al log de Cowrie, campo por campo; la tabla `events` sigue existiendo |
| Q2 | `ioc-extractor` sobre esos eventos | Genera los indicadores de credencial y de comando con esos caracteres, sin filas nuevas en `error_log` |
| Q3 | `report-generator` con esas credenciales en las últimas 24 h | El reporte se genera; el `jsonb` contiene las credenciales con sus caracteres |
| Q4 | Regresión: una corrida normal del simulador | 100 % de los eventos persistidos e idénticos al log de Cowrie, y procesados por el extractor |

## 2. Prueba de carga local

**Problema declarado en el §6.1.3.** La capacidad bajo carga no se midió; los valores de 0,6 a 2,9 eventos por segundo son una estimación a partir de la latencia media.

**Procedimiento.** Desde el anfitrión se envían eventos sintéticos al webhook de `event-ingest` (`127.0.0.1:5678`), con el mismo formato JSON que el forwarder. Las sesiones llevan el prefijo `carga-` para distinguirlas, y las IP de origen son privadas (10.99.x.x). Se usan escalones de 1, 2, 5, 10, 20 y 50 eventos por segundo, con 120 eventos por escalón.

Durante la prueba, `ip-api.com` se resuelve a una dirección local inexistente (archivo `docker-compose.carga.yml`), para no enviar cientos de consultas a un servicio externo gratuito. La consulta de país falla enseguida y queda «Desconocido», el mismo camino que ya siguen hoy las IP privadas. Por eso la prueba mide el pipeline **sin** la demora de esa consulta externa, y se declara así.

### Métricas por escalón

- Eventos aceptados por el webhook (HTTP 200) y eventos persistidos en `events`.
- Latencia `created_at − timestamp`: mediana, p95 y máximo.
- Ejecuciones de `event-ingest` en error.

**Criterio, fijado de antemano.** La capacidad sostenida es el escalón más alto en el que se persiste el 100 % de los eventos y la latencia p95 no supera los 5 s. No hay un umbral de aprobación: el resultado reemplaza la estimación del §6.1.3.

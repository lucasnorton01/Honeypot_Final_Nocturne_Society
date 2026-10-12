# Detalles que la tesis (v82) no reproduce en el cuerpo

Fechas, rutas de evidencia, tags y expresiones que en la v81 figuraban en la Tabla VI-3 del Anexo VI (§VI.5). Se conservan aquí, sin cambios, para que la tesis se lea sin ellos. No se modifica ninguna cifra ni afirmación del cuerpo.

| Apartado | Detalle |
|---|---|
| §5.6.4, manejo de errores | El workflow health-monitor se incorporó el 05/10/2026. Sus pruebas fijadas de antemano están en docs/evidencia/segmentacion/. Los tres hallazgos se corrigieron el 06/10/2026 (docs/evidencia/correcciones/). |
| §5.6.5, alertas por Telegram | La alerta de cada ataque está en forwarder/forwarder.py. La prueba con plan fijado de antemano es del 06/10/2026 (docs/evidencia/telegram/) y los tres defectos se corrigieron el 06/10/2026. |
| §5.6.6, credenciales | Archivo de ejemplo: n8n/workflows/postgres-credential.example.json. El historial público conserva, en commits y tags anteriores al 27/09/2026 (Anexo X), la contraseña de PostgreSQL de laboratorio (valor por defecto del compose) y, en el segundo, la de login de n8n (script_entorno/import-n8n.js). Ambas se rotaron (27/09 y 05/10/2026, BITACORA.md). Desde el 05/10/2026, PostgreSQL solo es alcanzable desde n8n. |
| §5.6.6, seguridad del pipeline | Las consultas SQL pasaron a parámetros del nodo Postgres el 05/10/2026 (pruebas en docs/evidencia/sql_carga/). El endurecimiento de docker-compose.yml rige desde el 06/10/2026. El código cambió por última vez el 06/10/2026. La plantilla de credencial de C1 se corrigió el 05/10/2026. |
| §5.4, Tabla 5.2 (nota) | Desde el 05/10/2026 los servicios se reparten en redes separadas; desde el 06/10/2026 los puertos de Cowrie los publica cowrie-proxy. Referencias: §5.5, §6.2.4 y §6.2.5. |
| §5.5, redes | Las tres capas se implementaron con redes Docker el 05/10/2026 (pruebas en docs/evidencia/segmentacion/). Las tres redes pasaron a internal: true el 06/10/2026 y Cowrie publica sus puertos mediante cowrie-proxy (docs/evidencia/correcciones/). |
| §5.5, Tabla 5.3 (nota) | La configuración final se probó el 06/10 con las pruebas de docs/evidencia/correcciones/ y se observó después en una ventana propia, C3 (08–09/10; §6.2.7). |
| §6.2.1, simulador de L0 | El script de simulación es scripts/attack_simulator.py. |
| §6.2.5, C1 | Registro previo: docs/PREREGISTRO_B2.md. Ventana: de las 13:47:30 a las 14:55:10 UTC. Expresión del disparo diario adelantado de report-generator: 50 11 * * *. |
| §6.2.6, C2 | Registro previo: docs/PREREGISTRO_B3.md. Evidencia: docs/evidencia/b3/. Cron de producción: 0 8 * * *. |
| §6.2.7, C3 | Registro previo: docs/PREREGISTRO_B4.md (SHA-256 9b6ec1c5…1c6d; tag Honeypot_Final_2026-10-08f). Pruebas de la configuración final: docs/evidencia/correcciones/. Evidencia: docs/evidencia/b4/. Cron de producción: 0 8 * * *. |
| §6.12.1, línea de base | La ampliación con registro previo (B1c) es del 08/10/2026. Datos de la medición con externos: docs/evidencia/b1/. |
| §6.12.3, escalabilidad | La prueba de carga local es del 05/10/2026 (docs/PRUEBAS_SQL_CARGA.md). |
| §7.6.2, robustez de la ingesta | El workflow health-monitor rige desde el 05/10/2026. Las correcciones del forwarder (posición del log y reintentos) rigen desde el 06/10/2026 (BITACORA.md). Resumen de entregas de C3: docs/evidencia/b4/forwarder_resumen.json. |
| §7.6.2, defecto de agregación | La consulta versionada que agrupa por src_ip está en n8n/workflows/report-generator.json. |

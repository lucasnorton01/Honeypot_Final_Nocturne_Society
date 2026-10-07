# Anexos extendidos de la tesis

Material que el trabajo final cita y que se trasladó aquí para acortar el documento; el texto es el de la versión v57 de la tesis, sin cambios. Las cifras se calculan con las consultas de la sección 1 y se pueden contrastar con `docs/evidencia/`.

## 1. Consultas SQL de las cifras del Capítulo V (Anexo VII.5)

Las cifras de este capítulo se obtuvieron con las siguientes consultas, ejecutadas sobre la base del laboratorio tras la validación del 25/09/2026:

```sql
-- Conteos antes y después de cada lote
SELECT count(*) FROM events;
SELECT count(*) FROM iocs;
-- Identificación de la columna de sesión
SELECT column_name FROM information_schema.columns WHERE table_name = 'events';

-- Sesiones persistidas (Tabla 5.5) SELECT session, count(*), min(timestamp), max(timestamp)
FROM events GROUP BY session ORDER BY max(timestamp) DESC LIMIT 6;
-- Evento y sesión a los que apunta cada IoC (Tabla VII-1)

SELECT i.id, i.type, i.value, i.event_id, e.session, e.eventid FROM iocs i LEFT JOIN events e ON e.id = i.event_id
ORDER BY i.id;
-- IoCs atribuidos por sesión mediante event_id (P3, Tabla VII-1)

SELECT e.session, count(i.id) AS iocs_atribuidos FROM events e LEFT JOIN iocs i ON i.event_id = e.id WHERE e.session IN ('a3f0aaaa0cca','d1e20e2ea9b9','5e6fe1c13050', '54cf066a37cd','e355bc9ba0d1')
GROUP BY e.session ORDER BY e.session;
-- Sesiones con al menos un IoC atribuido (k de 5)

SELECT count(*) FILTER (WHERE n > 0) AS sesiones_atribuidas, count(*) AS total FROM (SELECT e.session, count(i.id) AS n FROM events e LEFT JOIN iocs i ON i.event_id = e.id WHERE e.session IN ('a3f0aaaa0cca','d1e20e2ea9b9','5e6fe1c13050', '54cf066a37cd','e355bc9ba0d1') GROUP BY e.session) s;

Para la verificación independiente y para la ampliación del estudio se publican, además, las siguientes consultas: V1 es la base de la medición principal de P1 (§5.3.2), V2 cruza los reportes con las autenticaciones exitosas (P4) y V3 cuenta los eventos pendientes (S designa la lista de las cinco sesiones de la Tabla 5.5):
-- V1. Latencia de inserción por evento
SELECT count(*), min(ms), avg(ms), max(ms), stddev(ms), percentile_cont(0.5) WITHIN
GROUP (ORDER BY ms)
FROM (SELECT EXTRACT(EPOCH FROM (created_at - timestamp)) * 1000 AS ms FROM events WHERE
session IN S) t;
-- V2. Reportes que contienen cada autenticación exitosa (P4),
-- a cruzar con el modo de ejecución del historial de n8n
SELECT e.session, r.id AS report_id, r.created_at
FROM events e JOIN reports r ON e.timestamp BETWEEN r.period_start AND r.period_end
WHERE e.eventid = 'cowrie.login.success' AND e.session IN S;
-- V3. Eventos pendientes de procesar por el extractor
SELECT count(*), min(id) FROM events WHERE processed = false;

Para la validación del 30/09/2026 se usaron, además, las siguientes consultas, cuyas salidas completas se publican en docs/VERIFICACION_2026-09-30.md:

-- P3, operacionalización del §4.9.3 (event_id contra iocs)
SELECT e.session, count(i.id) AS iocs
FROM events e LEFT JOIN iocs i ON i.event_id = e.id
WHERE e.session IN (SELECT session FROM events WHERE eventid = 'cowrie.login.success')
GROUP BY e.session ORDER BY e.session;
-- P3, medición exploratoria sobre ioc_sessions
SELECT e.session, (SELECT count(*) FROM ioc_sessions s WHERE s.session = e.session) AS
apariciones
FROM (SELECT DISTINCT session FROM events WHERE eventid = 'cowrie.login.success') e
ORDER BY e.session;
-- P4, reportes que cubren cada sesión con autenticación exitosa
SELECT e.session, min(e.timestamp) AS login, count(DISTINCT r.id) AS reportes
FROM events e LEFT JOIN reports r ON e.timestamp BETWEEN r.period_start AND r.period_end
WHERE e.eventid = 'cowrie.login.success'
GROUP BY e.session ORDER BY login;
```

## 2. Cronología del lote del 25/09/2026 (Anexo VI.3)

### Tabla VI-1: Cronología de la validación del 25/09/2026.

| Hora ART (UTC−3) | Hora UTC | Hito |
|---|---|---|
| 01:21:39 | 04:21:39 | Línea de base 1: events = 0; iocs = 0 |
| 01:28:50 – 01:46:48 | 04:28:50 – 04:46:48 | Lote 1: 5 corridas del simulador, todas completadas del lado del cliente |
| Tras el lote 1 | Tras el lote 1 | Verificación: events = 0. Causa: event-ingest inactivo; el webhook devolvió HTTP 404 a las 65 entregas |
| Antes de 01:58 | Antes de 04:58 | Corrección: activación de event-ingest por CLI y reinicio de n8n |
| 01:58:31 | 04:58:31 | Ping sintético de prueba al webhook (HTTP 200; 1 fila, sin sesión) |
| 01:59:42 | 04:59:42 | Línea de base 2: events = 1; iocs = 0 |
| 01:59:57 – 02:14:30 | 04:59:57 – 05:14:30 | Lote 2: 5 corridas del simulador |
| Tras el lote 2 | Tras el lote 2 | Verificación: events = 66 (Δ = +65); iocs = 0 |
| ≈02:16:53 | ≈05:16:53 | Ejecución manual (CLI) de ioc-extractor y report-generator |
| Posterior | Posterior | Activación por CLI de ioc-extractor y report-generator; reinicio de n8n; los tres workflows figuran activos |

Nota. Horas registradas con date -u y convertidas a ART (la zona America/Argentina/Mendoza no aplica horario de verano). La hora de la ejecución manual se infiere del period_end del reporte generado (05:16:53 UTC). Elaboración propia.

## 3. Tablas del Anexo III trasladadas

### Tabla III-2: Distribución de IPs atacantes (sesión de referencia del 11/08/2026).

| IP | Origen | Eventos asociados | Enriquecimiento aplicado |
|---|---|---|---|
| 172.18.0.1 | Gateway de la red Docker (laboratorio) | 13 | No aplica (IP privada) |
| Total | 1 IP privada | 13 |  |

### Tabla III-3: Credenciales observadas (ejemplo de presentación con hash SHA-256).

| Hash SHA-256 (usuario:contraseña) | Resultado del intento |
|---|---|
| 2bbbe3f67242a7ac6ad6a3e207dc34b10d250ce40b8958ffed6a68085f2d8e7f | Fallido (admin/123456) |
| 8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334 | Fallido (admin/admin) |
| fb10082074498909efff4e69ee395ce8db1df44d601977c5235980882e1338b8 | Exitoso (admin/test123) |

### Tabla III-5: Análisis comparativo de los estándares de representación y transporte de IoCs.

| Criterio | STIX 2.1 | TAXII 2.1 | OpenIOC 1.1 |
|---|---|---|---|
| Alcance semántico | Indicadores, TTPs, actores, campañas, observables y cursos de acción | N/A (transporte) | Solo indicadores (IoC) |
| Modelo de datos | Grafo: objetos interconectados mediante relaciones tipadas | N/A (transporte) | Plano: condiciones booleanas anidadas |
| Transporte | TAXII 2.1 | API REST sobre HTTPS: descubrimiento, API Root, estado, colecciones, manifiesto, objetos y versiones | No define protocolo (archivo XML únicamente) |
| Expresividad | STIX Patterning Language: comparaciones, regex, pertenencia a conjuntos, AND/OR | N/A | Operadores lógicos (AND, OR, NOT) sobre condiciones de igualdad |
| Extensibilidad | Abierta: custom objects, extensiones y marking definitions | N/A | Limitada a los contextos predefinidos (Network, Registry, FileSystem, etc.) |
| Interoperabilidad y ecosistema | Alta (MISP, SIEM, TIP, firewalls, MITRE ATT&CK); ecosistema amplio (OASIS CTI TC, numerosas implementaciones) | Alta (API REST); integrado con STIX | Media: alta en herramientas forenses (EnCase, FTK), baja en SIEM/ TIP modernos; ecosistema limitado |
| Complejidad | Alta (modelo de grafo, patterning language) | Media (API REST) | Baja (XML plano) |
| Madurez y mantenimiento | OASIS (2015-presente); mantenimiento activo por OASIS CTI TC | OASIS (2015-presente) | Publicado por Mandiant en 2011; sin mantenimiento activo conocido |
| Aplicabilidad a la arquitectura | Alta (formato de representación de IoCs) | Media (trabajo futuro para diseminación) | Baja (solo interoperabilidad forense) |

Nota. Elaboración propia basada en Kampanakis (2014) y OASIS (2021a, 2021b). Los estándares operan en niveles distintos del ecosistema de inteligencia de amenazas: STIX define la representación semántica, TAXII el transporte y OpenIOC es un formato heredado para indicadores simples; las taxonomías MISP aportan el vocabulario de enriquecimiento (Tabla IX-3). Todos los tipos de IoC generados por Cowrie y por Dionaea (esta última prevista y no desplegada en el prototipo) pueden expresarse en STIX 2.1 sin pérdida semántica; un evento complejo puede requerir múltiples objetos STIX interconectados mediante relaciones.

## 4. Modelo de madurez SIM3 (Anexo IX.1)

### Tabla IX-1: Modelo de madurez SIM3.

| Cuadrante (Open CSIRT Foundation) | Descripción del cuadrante | Nivel 0 | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 |
|---|---|---|---|---|---|---|
| Organisation (O) | Mandato, circunscripción, autoridad, responsabilidades, servicios, clasificación de incidentes, marco organizacional y política de seguridad (O-1 a O-11; el O-6 está vacío en la v1) | No disponible / inexistente | Implícito (conocido, no documentado) | Explícito, interno (documentado, no formalizado) | Explícito, formalizado por el CSIRT (publicado) | Explícito, auditado por una gobernanza superior al CSIRT |
| Human (H) | Código de conducta, resiliencia y habilidades del personal, capacitación interna y externa, y contactos externos (H-1 a H-7) | No disponible / inexistente | Implícito (conocido, no documentado) | Explícito, interno (documentado, no formalizado) | Explícito, formalizado por el CSIRT (publicado) | Explícito, auditado por una gobernanza superior al CSIRT |
| Tools (T) | Listas de recursos y de fuentes de información, correo y seguimiento de incidentes, comunicaciones resilientes y herramientas de prevención, detección y resolución (T-1 a T-10) | No disponible / inexistente | Implícito (conocido, no documentado) | Explícito, interno (documentado, no formalizado) | Explícito, formalizado por el CSIRT (publicado) | Explícito, auditado por una gobernanza superior al CSIRT |
| Processes (P) | Escalamiento (gobernanza, prensa, legal), procesos de prevención, detección y resolución, auditoría, manejo seguro de la información, reportes, estadísticas y trabajo entre pares (P-1 a P-17) | No disponible / inexistente | Implícito (conocido, no documentado) | Explícito, interno (documentado, no formalizado) | Explícito, formalizado por el CSIRT (publicado) | Explícito, auditado por una gobernanza superior al CSIRT |

Nota. Elaboración propia a partir de Stikvoort (2019); los parámetros O, H, T y P son los de SIM3 v1.

## 5. Detalle por sesión de los contrastes de P3 y P4 (Anexo VII.3 y VII.4)

### Tabla VII-2: IoCs atribuidos por sesión mediante event_id (validación del 28/09/2026).

| Sesión | IoCs atribuidos |
|---|---|
| 288c84e44ce4 | 0 |
| eeac3a0a6920 | 1 |
| 106fccee7392 | 0 |
| 91e5b5a84891 | 0 |
| ccd16ec6808b | 1 |
| b823986a217b | 1 |
| 95e63fb49317 | 1 |
| d29deee8497d | 0 |
| 4d51d10d620a | 1 |
| 25b267072c6e | 1 |
| Sesiones con ≥ 1 IoC atribuido | 6 de 10 (60 %) |

Nota. Elaboración propia a partir de la consulta de atribución del §5.3.5 sobre las 10 sesiones con autenticación exitosa; reconstruible con docs/evidencia/sesiones_2026-09-28.csv (las 10 sesiones, extraídas del log JSON de Cowrie de la ventana, publicado en docs/evidencia/cowrie_ventana_2026-09-28.json) y docs/evidencia/ iocs_events_2026-09-28.csv (atribución por event_id); procedimiento en docs/VERIFICACION_2026-09-28.md, §9.

### Tabla VII-3: P3 en la validación del 30/09/2026 (N = 41 sesiones con autenticación exitosa).

| Medición | Sesiones con indicador (IC 95 %) | Uso |
|---|---|---|
| Fila en iocs atribuida por event_id (§4.9.3) | 6/41 = 14,6 % [6,9 %; 28,4 %] | Veredicto: no confirmada |
| Fila en ioc_sessions (definida a posteriori) | 39/41 = 95,1 % [83,9 %; 98,7 %] | Exploratoria |

Nota. Elaboración propia a partir de docs/VERIFICACION_2026-09-30.md, §4a y §4b, (41 filas por sesión de ambas consultas) y de docs/evidencia/ioc_sessions_2026-09-30.csv (654 filas: cada aparición de un indicador en una sesión, de 327 sesiones).

### Tabla VII-4: Cobertura por reportes en modo trigger de las sesiones con autenticación exitosa (validación del 28/09/2026).

| Sesión | Autenticación exitosa (UTC) | Reportes en modo trigger que la cubren (id) |
|---|---|---|
| 4d51d10d620a | 01:45:24 | 2, 3, 4 |
| eeac3a0a6920 | 02:45:12 | 2, 3, 4 |
| 25b267072c6e | 03:45:11 | 3, 4 |
| 288c84e44ce4 | 03:45:24 | 3, 4 |
| b823986a217b | 04:45:05 | 3, 4 |
| 95e63fb49317 | 05:45:06 | 4 |
| d29deee8497d | 05:45:11 | 4 |
| 91e5b5a84891 | 06:45:14 | 4 |
| ccd16ec6808b | 06:45:33 | 4 |
| 106fccee7392 | 07:45:04 | ninguno (posterior al último reporte de la ventana) |
| Sesiones cubiertas | 9 de 10 (90 %) |  |

Nota. Elaboración propia a partir de la consulta V2 del §5.3.5 cruzada con el historial de ejecuciones de n8n (docs/ evidencia/ejecuciones_2026-09-28.csv); la hora de autenticación y los reportes que cubren cada sesión se publican en docs/evidencia/sesiones_2026-09-28.csv (docs/VERIFICACION_2026-09-28.md, §9); todos los reportes que cubren cada sesión se generaron en modo trigger.

### Tabla VII-5: Cobertura por reportes en modo trigger de las sesiones con autenticación exitosa (validación del 30/09/2026).

| Autenticación exitosa (UTC) | Sesiones | Reportes en modo trigger que las cubren (id) |
|---|---|---|
| 00:00 – 00:45 | 4 | 1, 2, 3, 4 |
| 01:00 – 02:45 | 12 | 2, 3, 4 |
| 03:00 – 04:45 | 11 | 3, 4 |
| 05:00 – 06:45 | 8 | 4 |
| 07:00 – 08:00 | 6 | ninguno (posteriores al último reporte de la ventana) |
| Sesiones cubiertas | 35 de 41 (85,4 %) |  |

Nota. Elaboración propia a partir de docs/VERIFICACION_2026-09-30.md, §5, cruzado con docs/evidencia/ ejecuciones_2026-09-30.csv; todos los reportes que cubren cada sesión se generaron en modo trigger.

## 6. Otras tablas del Anexo III

### Tabla III-1a: Marcas temporales de los 13 eventos de la sesión (2026-08-11, UTC-3).

| # | Timestamp (UTC-3) | Evento | Detalle |
|---|---|---|---|
| 1 | 12:45:36 | cowrie.session.connect | Conexión Telnet establecida |
| 2 | 12:45:37 | cowrie.session.params | Parámetros de sesión (terminal) |
| 3 | 12:45:58 | cowrie.login.failed | admin/123456 (fallido) |
| 4 | 12:46:20 | cowrie.login.failed | admin/admin (fallido) |
| 5 | 12:46:42 | cowrie.login.success | admin/test123 (exitoso) |
| 6 | 12:46:52 | cowrie.command.input | whoami |
| 7 | 12:47:03 | cowrie.command.input | uname -a |
| 8 | 12:47:14 | cowrie.command.input | cat /etc/passwd |
| 9 | 12:47:25 | cowrie.command.input | ls -la /home |
| 10 | 12:47:36 | cowrie.command.input | w |
| 11 | 12:47:46 | cowrie.command.input | exit |
| 12 | 12:47:47 | cowrie.log.closed | Cierre de registro |
| 13 | 12:47:47 | cowrie.session.closed | Cierre de sesión |

Nota. Elaboración propia a partir del volcado de la tabla events. La sesión duró 131 s entre la primera y la última marca (12:45:36–12:47:47); la tesis reporta ≈130 s por redondeo del registro. Esta lista es la fuente única de verdad para el timeline de esta sesión (§6.2.2).

### Tabla III-4: Criterios de asignación de niveles de confianza.

| Nivel | Criterio | Tipos de IoC que aplican |
|---|---|---|
| ALTO | Hash con ≥3 detecciones en VirusTotal; sesión con comandos post-explotación verificados; IP con actividad sostenida >7 días y patrones de ataque confirmados; URL con dominio activo y contenido malicioso verificado; credencial correlacionada con sesión interactiva | Hashes, IPs, URLs, Credenciales |
| MEDIO | IP con actividad recurrente (≥5 eventos en distintos días) pero sin evidencia adicional de malignidad; credencial repetida en ≥3 sesiones diferentes; URL que redirige a dominio conocido pero no verificado; hash capturado por Dionaea (prevista; no desplegada en el prototipo) sin consulta VT; dominio sin resolución activa pero con referencias en OSINT | IPs, Credenciales, URLs, Hashes, Dominios |
| BAJO | Evento aislado (1-2 conexiones); IP sin recurrencia ni enriquecimiento adicional; user-agent genérico (navegador estándar); hash sin detección en VT o no consultado; dominio sin referencias externas | IPs, User-Agents, Hashes, Dominios |

Nota. Elaboración propia, adaptada al alcance del proyecto. Los tres niveles pueden mapearse a la taxonomía MISP estimative-language:confidence-in-analytic-judgment (high, moderate, low).

## 7. Síntesis de las ventanas anteriores al 25/09/2026 (Anexo II)

### Tabla II-1: Síntesis agregada de las ventanas de validación del 10/09/2026 (antecedente sin valor de veredicto, §5.2.5).

| Ventana (10/09/2026, localhost aislado, §4.11) | Qué se ejecutó | Resultado observado | Estado |
|---|---|---|---|
| Verificación multi-origen | 13 eventos inyectados manualmente contra el | Los 13 eventos se procesaron; el reporte de report-generator | Amplió la cobertura de prueba a múltiples |
|  | webhook de event-ingest: 6 sesiones desde 6 IPs de rangos reservados para documentación (RFC 5737; Arkko et al., 2010) y privados (RFC 1918; Rekhter et al., 1996); 5 cowrie.login.success, 4 cowrie.command.input y 4 cowrie.login.failed. | (ejecución manual, Figura II-1) registró 6 IoCs de tipo ip, 9 de tipo credential y 2 de tipo command. | orígenes, credenciales y tipos de IoC. Los timestamp son valores de prueba del payload (anteceden a su created_at): no se calcula latencia. |
| Ampliación de la muestra para P3 | Ocho sesiones Telnet adicionales con credenciales y comandos deliberadamente variados (para evitar la deduplicación por UNIQUE (type, value)), más la sesión original d7525579e2e2: en total 9 sesiones (ventana retirada), ocho autenticadas y una fallida (192606). | Según la lógica del extractor, 9/9 sesiones persistidas (incluida la fallida; criterio distinto del de P3, que cuenta solo las autenticadas) con IoC de tipo ip y credential (100 %, IC 95 % Wilson [70,1 %, 100 %]); IoC de tipo command en 1/9 (la sesión que ejecutó wget, curl y chmod contra dominios reservados por RFC 2606 (Eastlake 3rd y Panitz, 1999)). P4: 0 de 8 ataques de interés cubiertos por un reporte en ejecución trigger verificada (el de la sesión original fue manual; el reporte 4 se creó antes de las sesiones 124849–125928; 192349 es posterior y sin reporte confirmado). | Retirada: las cifras se derivaron de la lógica del extractor, sin volcado independiente de la base para todas las sesiones, y no son reconstruibles con las consultas publicadas (§5.2.5). La versión del extractor de esa fecha tomaba la IP de cualquier tipo de evento (defecto corregido, §V.5), lo que inflaba la cobertura. / Ningún veredicto depende de esta ventana. |
| 18 repeticiones idénticas del script base | El mismo guion de ataque ejecutado 18 veces (fuera de la ampliación de la muestra del 10/09/2026, retirada). | 234 eventos nuevos y solo 2 IoCs nuevos, por ON CONFLICT (type, value) DO NOTHING; cero errores en las 234 inserciones y ninguna caída de n8n. En otro momento de la jornada, el log de n8n (no publicado) registró dos excepciones ResponseError: Failed to parse request body ante payloads malformados, sin caída ni pérdida de eventos posteriores. | Documenta la deduplicación esperada y la estabilidad bajo carga repetida; no integra ninguna muestra. |
| Ocho ejecuciones interrumpidas | Ejecuciones del script de ataque interrumpidas antes de la Fase 2 de captura de logs. | Sin confirmación de persistencia en la base de datos. | Excluidas: no se cuentan como éxito ni como fracaso. |

Nota. Elaboración propia a partir de los volcados de las tablas events y reports (no publicados) y de los logs de attack_simulator.py. Las ocho sesiones agregadas en la ampliación se rotulan con la marca temporal (HHMMSS) de su reporte; seis se cotejaron contra los logs de ejecución del 10/09/2026, sin volcado independiente de PostgreSQL, y las dos restantes se reprodujeron el 11/09/2026, lo que prueba que el patrón es reproducible, no que se haya recuperado la captura original.

## 8. Tablas del Capítulo VI (Anexo III.B)

### Tabla III-6: Comparación de precisión de parseo manual vs automatizado.

| Tipo de error | Tasa manual estimada¹ | Tasa automática real² | Mejora | Fuente de la estimación |
|---|---|---|---|---|
| Error de extracción de campos | 12–18 % (estimación propia; en B1 se midió 0 % en 20 eventos, §5.13.1) | 0 % | n/a | Estim. propia: analyst fatigue en tareas de triage prolongado; no corroborada |
| Error de clasificación | 8–15 % (estimación propia); en B1, el equipo tuvo error en 8 de 20 eventos (40 %) con el criterio literal, sobre todo por el formato del valor del indicador | No aplica: el prototipo no clasifica (la confianza de todos los IoCs queda en BAJO, §5.8.4) | n/a | Estim. propia del equipo: precisión en clasificación manual de incidentes |
| Error de enriquecimiento (omisión) | 5–10 % | No evaluable³ | n/a | Estim. propia del equipo: omisión de consultas de contexto en análisis manual |

Notas. ¹ Rangos estimados por el equipo para analistas SOC nivel 1-2 en jornadas de 6+ horas continuas; estimación propia del equipo, no atribuida a una fuente externa verificable. ² Medido como porcentaje de eventos con errores sobre el total procesado (§5.13.4). ³ La tasa de errores de enriquecimiento no es evaluable: hasta el 29/09/2026 la consulta de país fallaba en todos los eventos (§5.8.3), y en la validación del 30/09/2026 todo el tráfico provino de una dirección interna, por lo que el país quedó en «Desconocido» en todos los eventos. La columna «Mejora» compara la tasa manual estimada con la tasa automática observada y hereda la incertidumbre de la estimación manual; no es una medición independiente.

### Tabla III-7: Comparación de plataformas de automatización para CTI.

| Dimensión | n8n | Python puro | Node-RED | StackStorm |
|---|---|---|---|---|
| Curva de aprendizaje | Baja | Media-alta | Baja | Alta |
| Integraciones CTI nativas | Webhook, REST, PostgreSQL, cron | Cualquier librería Python | HTTP, MQTT, PostgreSQL | Sensors, rules, acciones |
| Escalabilidad | Media (secuencial por defecto) | Alta (asincrónico, workers) | Media | Alta (distribuido) |
| Debugging | Limitado (errores genéricos) | Completo (logging, breakpoints) | Limitado | Bueno (trazas de acción) |
| Comunidad | Grande (>400 nodos) | Masiva (PyPI) | Grande (cientos de nodos, según la documentación del proyecto) | Mediana (enfocada enterprise) |
| Madurez CTI | Emergente (pocos casos documentados) | Alta (MISP-STIX, Cuckoo) | Baja | Media (Slack, Jira, PagerDuty) |
| Huella de recursos | ≈ 420 MiB en reposo | 80-120 MB RAM | 100-200 MB RAM | >1 GB RAM (multi-servicio) |
| Costo operativo | Gratuito (self-hosted) | Gratuito | Gratuito | Gratuito (open source) |

Nota. Elaboración propia. La cifra de n8n se midió con docker stats en reposo, sin tráfico, el 07/10/2026, con las imágenes del tag Honeypot_Final_2026-10-06e; las demás columnas de la fila «Huella de recursos» son estimaciones del equipo. Las apreciaciones de comunidad y madurez no fueron medidas en este trabajo ni se atribuyen a una fuente externa verificable; se presentan como orden de magnitud orientativo, no como resultado de la validación.



-- ============================================================
-- Consultas de analisis - Campana 30 dias (13/07/2026 - 11/08/2026)
-- Ejecutadas sobre analitica/honeypot.db (SQLite)
-- Nocturne Society - Honeypots + n8n - Tesis de grado - 2026
-- Nota: el protocolo se deriva de los JSON laterales (proto_session),
-- porque el esquema de events no expone el puerto destino.
-- ============================================================

-- 1. Eventos por protocolo y honeypot
SELECT p.protocolo,
       CASE WHEN p.protocolo IN ('ssh','telnet') THEN 'cowrie' ELSE 'dionaea' END honeypot,
       COUNT(*) eventos
FROM events e JOIN proto_session p ON p.session = e.session
GROUP BY 1, 2 ORDER BY eventos DESC;

-- 2. Serie temporal diaria
SELECT dia, COUNT(*) eventos, COUNT(DISTINCT src_ip) ips_unicas, COUNT(DISTINCT session) sesiones
FROM events GROUP BY dia ORDER BY dia;

-- 3. Top 15 IPs por volumen
SELECT src_ip, COUNT(*) eventos, COUNT(DISTINCT session) sesiones
FROM events GROUP BY src_ip ORDER BY eventos DESC LIMIT 15;

-- 4. Credenciales mas utilizadas
SELECT username, password, COUNT(*) intentos
FROM events WHERE username IS NOT NULL AND password IS NOT NULL
GROUP BY username, password ORDER BY intentos DESC LIMIT 10;

-- 5. Comandos mas ejecutados (cowrie)
SELECT input comando, COUNT(*) ejecuciones
FROM events WHERE eventid = 'cowrie.command.input' AND input IS NOT NULL
GROUP BY input ORDER BY ejecuciones DESC LIMIT 10;

-- 6. IoCs por tipo y confianza
SELECT type, confidence, COUNT(*) cantidad FROM iocs GROUP BY type, confidence ORDER BY type, confidence;

-- 7. Errores del pipeline por nodo
SELECT workflow, node, COUNT(*) errores FROM error_log GROUP BY workflow, node ORDER BY errores DESC;

-- 8. Sesiones por protocolo
SELECT p.protocolo, COUNT(DISTINCT e.session) sesiones
FROM events e JOIN proto_session p ON p.session = e.session
GROUP BY 1 ORDER BY sesiones DESC;

-- 9. Eventos por hora local (UTC-3)
SELECT hora, COUNT(*) eventos FROM events GROUP BY hora ORDER BY hora;

-- 10. IPs por pais (join con geoip-mapping.json como pais_temp)
SELECT p.pais, COUNT(DISTINCT e.src_ip) ips, COUNT(*) eventos
FROM events e JOIN pais_temp p ON p.ip = e.src_ip
GROUP BY p.pais ORDER BY eventos DESC;

-- 11. Sesiones confirmadas (login exitoso o captura de archivo)
SELECT COUNT(DISTINCT session) sesiones_confirmadas FROM events
WHERE eventid IN ('cowrie.login.success','dionaea.smb.login_success','dionaea.http.login_success','dionaea.capture.file_upload');

-- 12. Sesiones con al menos un IoC asociado
SELECT COUNT(DISTINCT e.session) sesiones_con_ioc
FROM iocs i JOIN events e ON e.id = i.event_id;

-- 13. Errores del pipeline - KPI tasa de estructuración
SELECT COUNT(*) total,
       SUM(processed) estructurados,
       ROUND(100.0 * SUM(processed) / COUNT(*), 1) tasa_pct
FROM events;

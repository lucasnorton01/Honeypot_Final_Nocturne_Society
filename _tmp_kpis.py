import sqlite3, json

con = sqlite3.connect(r'analitica\honeypot.db')
con.row_factory = sqlite3.Row

out = {}

out['por_protocolo'] = [dict(r) for r in con.execute(
    "SELECT p.protocolo, COUNT(*) total, SUM(e.processed) estructurados, "
    "COUNT(DISTINCT e.src_ip) ips, COUNT(DISTINCT e.session) sesiones "
    "FROM events e JOIN proto_session p ON p.session = e.session GROUP BY 1 ORDER BY 2 DESC")]

out['por_honeypot'] = [dict(r) for r in con.execute(
    "SELECT CASE WHEN p.protocolo IN ('ssh','telnet') THEN 'cowrie' ELSE 'dionaea' END hp, "
    "COUNT(*) total, SUM(e.processed) estructurados FROM events e "
    "JOIN proto_session p ON p.session = e.session GROUP BY 1 ORDER BY 2 DESC")]

out['eventid'] = [dict(r) for r in con.execute(
    "SELECT eventid, COUNT(*) n FROM events GROUP BY 1 ORDER BY 2 DESC")]

out['credenciales'] = [dict(r) for r in con.execute(
    "SELECT username, password, COUNT(*) n FROM events "
    "WHERE username IS NOT NULL GROUP BY username, password ORDER BY 3 DESC LIMIT 12")]

out['errores'] = [dict(r) for r in con.execute(
    "SELECT error, COUNT(*) n FROM error_log GROUP BY 1 ORDER BY 2 DESC")]

out['top_ips'] = [dict(r) for r in con.execute(
    "SELECT src_ip, COUNT(*) n FROM events GROUP BY 1 ORDER BY 2 DESC LIMIT 8")]

out['por_hora'] = [dict(r) for r in con.execute(
    "SELECT hora, COUNT(*) n FROM events GROUP BY 1 ORDER BY 1")]

out['por_dia'] = [dict(r) for r in con.execute(
    "SELECT dia, COUNT(*) n FROM events GROUP BY 1 ORDER BY 1")]

out['iocs_tipo'] = [dict(r) for r in con.execute(
    "SELECT type, COUNT(*) n FROM iocs GROUP BY 1 ORDER BY 2 DESC")]

out['iocs_conf'] = [dict(r) for r in con.execute(
    "SELECT confidence, COUNT(*) n FROM iocs GROUP BY 1 ORDER BY 2 DESC")]

out['iocs_source'] = [dict(r) for r in con.execute(
    "SELECT source, COUNT(*) n FROM iocs GROUP BY 1 ORDER BY 2 DESC")]

out['sesiones_proto'] = [dict(r) for r in con.execute(
    "SELECT p.protocolo, COUNT(*) sesiones FROM proto_session p GROUP BY 1 ORDER BY 2 DESC")]

out['reportes'] = con.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
out['error_log_n'] = con.execute("SELECT COUNT(*) FROM error_log").fetchone()[0]

print(json.dumps(out, indent=1, ensure_ascii=False, default=str))

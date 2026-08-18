#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_sqlite.py - Fase 2: Base local SQLite para el analisis de la campana
Compilado: Nocturne Society - Honeypots + n8n - Tesis de grado - 2026

Lee evidencia/postgres-dump-20260811.sql y construye:
  analitica/honeypot.db          (events, iocs, reports, error_log)
  analitica/tablas/*.csv         (tablas numericas para la tesis)
  analitica/consultas.sql        (consultas documentadas)
  analitica/kpis.json            (KPIs recalculados desde la base local)
"""
import csv
import json
import os
import re
import sqlite3
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cargador_dump import parse_dump

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVID = os.path.join(ROOT, 'evidencia')
ANA = os.path.join(ROOT, 'analitica')
TAB = os.path.join(ANA, 'tablas')
os.makedirs(TAB, exist_ok=True)

DUMP = os.path.join(EVID, 'postgres-dump-20260811.sql')
GEO = os.path.join(EVID, 'geoip-mapping.json')
COWRIE_JSON = os.path.join(EVID, 'cowrie-events.json')
DIONAEA_JSON = os.path.join(EVID, 'dionaea-events.json')

TS_OFFSET = re.compile(r'-03$')


def parse_ts(s):
    if not s:
        return None
    s = TS_OFFSET.sub('', s.strip())
    if '.' in s:
        base, frac = s.split('.', 1)
        return datetime.strptime(base + '.' + frac[:6], '%Y-%m-%d %H:%M:%S.%f')
    return datetime.strptime(s[:19], '%Y-%m-%d %H:%M:%S')


def exportar(con, nombre, query):
    cur = con.execute(query)
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    with open(os.path.join(TAB, nombre), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(cols)
        w.writerows(rows)
    return rows


def sesiones_protocolo():
    """Mapa session -> protocolo derivado de los JSON laterales (el dump no tiene dst_port)."""
    mapa = {}
    for archivo, proto_base in ((COWRIE_JSON, None), (DIONAEA_JSON, None)):
        with open(archivo, 'r', encoding='utf-8') as f:
            for e in json.load(f):
                mapa[e['session']] = e['protocol']
    return mapa


def main():
    print('[1/4] Parseando dump PostgreSQL...')
    tablas = parse_dump(DUMP)
    total = sum(len(v) for v in tablas.values())
    print('  filas parseadas: %d (events=%d, iocs=%d, reports=%d, error_log=%d)'
          % (total, len(tablas['events']), len(tablas['iocs']), len(tablas['reports']), len(tablas['error_log'])))

    print('[2/4] Construyendo honeypot.db...')
    if os.path.exists(os.path.join(ANA, 'honeypot.db')):
        os.remove(os.path.join(ANA, 'honeypot.db'))
    con = sqlite3.connect(os.path.join(ANA, 'honeypot.db'))
    con.execute('PRAGMA journal_mode=OFF')
    con.execute('PRAGMA synchronous=OFF')
    con.executescript('''
        CREATE TABLE events (
            id INTEGER PRIMARY KEY, eventid TEXT, session TEXT, src_ip TEXT,
            src_port INTEGER, username TEXT, password TEXT, input TEXT, message TEXT,
            timestamp TEXT NOT NULL, processed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT 'now()', dia TEXT, hora INTEGER);
        CREATE TABLE iocs (
            id INTEGER PRIMARY KEY, type TEXT NOT NULL, value TEXT NOT NULL,
            confidence TEXT NOT NULL DEFAULT 'BAJO', event_id INTEGER, source TEXT,
            created_at TEXT NOT NULL);
        CREATE TABLE reports (
            id INTEGER PRIMARY KEY, period_start TEXT, period_end TEXT,
            content TEXT, created_at TEXT NOT NULL);
        CREATE TABLE error_log (
            id INTEGER PRIMARY KEY, workflow TEXT, node TEXT, error TEXT, created_at TEXT NOT NULL);
        CREATE TABLE proto_session (session TEXT PRIMARY KEY, protocolo TEXT);
        CREATE INDEX idx_events_session ON events (session);
        CREATE INDEX idx_events_eventid ON events (eventid);
        CREATE INDEX idx_events_dia ON events (dia);
        CREATE INDEX idx_iocs_type ON iocs (type);
    ''')
    con.executemany('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    [(e['id'], e['eventid'], e['session'], e['src_ip'], e['src_port'],
                      e['username'], e['password'], e['input'], e['message'], e['timestamp'],
                      1 if e['processed'] else 0, e['created_at'],
                      e['timestamp'][:10] if e['timestamp'] else None,
                      int(e['timestamp'][11:13]) if e['timestamp'] else None)
                     for e in tablas['events']])
    con.executemany('INSERT INTO iocs VALUES (?,?,?,?,?,?,?)',
                    [(i['id'], i['type'], i['value'], i['confidence'], i['event_id'],
                      i['source'], i['created_at']) for i in tablas['iocs']])
    con.executemany('INSERT INTO reports VALUES (?,?,?,?,?)',
                    [(r['id'], r['period_start'], r['period_end'], r['content'], r['created_at'])
                     for r in tablas['reports']])
    con.executemany('INSERT INTO error_log VALUES (?,?,?,?,?)',
                    [(x['id'], x['workflow'], x['node'], x['error'], x['created_at'])
                     for x in tablas['error_log']])
    con.executemany('INSERT INTO proto_session VALUES (?,?)', sesiones_protocolo().items())
    con.commit()
    tot = con.execute('SELECT COUNT(*) FROM events').fetchone()[0]
    if tot != 201125:
        raise SystemExit('ERROR: events en la base = %d (esperado 201125)' % tot)

    print('[3/4] Generando tablas de analisis...')
    exportar(con, 'tabla_a01_eventos_por_protocolo.csv',
             'SELECT p.protocolo, CASE WHEN p.protocolo IN (\'ssh\',\'telnet\') THEN \'cowrie\' ELSE \'dionaea\' END honeypot, '
             'COUNT(*) eventos FROM events e JOIN proto_session p ON p.session = e.session '
             'GROUP BY 1, 2 ORDER BY eventos DESC')
    exportar(con, 'tabla_a02_eventos_por_dia.csv',
             'SELECT dia, COUNT(*) eventos, COUNT(DISTINCT src_ip) ips_unicas, '
             'COUNT(DISTINCT session) sesiones FROM events GROUP BY dia ORDER BY dia')
    exportar(con, 'tabla_a03_top15_ips.csv',
             'SELECT src_ip, COUNT(*) eventos, COUNT(DISTINCT session) sesiones '
             'FROM events GROUP BY src_ip ORDER BY eventos DESC LIMIT 15')
    exportar(con, 'tabla_a04_top10_credenciales.csv',
             "SELECT username, password, COUNT(*) intentos FROM events "
             "WHERE username IS NOT NULL AND password IS NOT NULL "
             "GROUP BY username, password ORDER BY intentos DESC LIMIT 10")
    exportar(con, 'tabla_a05_top10_comandos.csv',
             "SELECT input comando, COUNT(*) ejecuciones FROM events "
             "WHERE eventid='cowrie.command.input' AND input IS NOT NULL "
             "GROUP BY input ORDER BY ejecuciones DESC LIMIT 10")
    exportar(con, 'tabla_a06_iocs_por_tipo_confianza.csv',
             'SELECT type, confidence, COUNT(*) cantidad FROM iocs GROUP BY type, confidence ORDER BY type, confidence')
    exportar(con, 'tabla_a07_error_log_por_nodo.csv',
             'SELECT workflow, node, COUNT(*) errores FROM error_log GROUP BY workflow, node ORDER BY errores DESC')
    exportar(con, 'tabla_a09_sesiones_por_protocolo.csv',
             'SELECT p.protocolo, COUNT(DISTINCT e.session) sesiones FROM events e '
             'JOIN proto_session p ON p.session = e.session GROUP BY 1 ORDER BY sesiones DESC')
    exportar(con, 'tabla_a10_eventos_por_hora.csv',
             'SELECT hora, COUNT(*) eventos FROM events GROUP BY hora ORDER BY hora')
    with open(GEO, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
    con.execute('DROP TABLE IF EXISTS pais_temp')
    con.execute('CREATE TABLE pais_temp (ip TEXT PRIMARY KEY, pais TEXT)')
    con.executemany('INSERT INTO pais_temp VALUES (?,?)', mapping.items())
    con.commit()
    exportar(con, 'tabla_a11_ips_por_pais.csv',
             "SELECT p.pais, COUNT(DISTINCT e.src_ip) ips, COUNT(*) eventos FROM events e "
             "JOIN pais_temp p ON p.ip = e.src_ip GROUP BY p.pais ORDER BY eventos DESC")

    print('[4/4] Latencias y KPIs...')
    filas = con.execute('SELECT timestamp, created_at FROM events ORDER BY id').fetchall()
    lats = []
    for ts, ca in filas:
        t0, t1 = parse_ts(ts), parse_ts(ca)
        if t0 and t1:
            lats.append((t1 - t0).total_seconds() * 1000.0)
    lats.sort()
    n = len(lats)
    media = sum(lats) / n
    sd = (sum((x - media) ** 2 for x in lats) / (n - 1)) ** 0.5
    pct = lambda p: lats[int(p * n) - 1]
    with open(os.path.join(TAB, 'tabla_a08_latencias.csv'), 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['metrica', 'valor_ms'])
        w.writerows([['n', n], ['media', round(media, 3)], ['desviacion', round(sd, 3)],
                     ['min', round(lats[0], 3)], ['p50', round(pct(0.5), 3)],
                     ['p95', round(pct(0.95), 1)], ['p99', round(pct(0.99), 1)],
                     ['max', round(lats[-1], 3)]])

    kpi = {}
    kpi['eventos'] = con.execute('SELECT COUNT(*) FROM events').fetchone()[0]
    kpi['estructurados'] = con.execute('SELECT COUNT(*) FROM events WHERE processed=1').fetchone()[0]
    kpi['no_estructurados'] = kpi['eventos'] - kpi['estructurados']
    kpi['tasa_estructuracion_pct'] = round(100.0 * kpi['estructurados'] / kpi['eventos'], 1)
    kpi['errores'] = {
        'parsing': con.execute("SELECT COUNT(*) FROM error_log WHERE node LIKE '%Parseo%'").fetchone()[0],
        'enriquecimiento': con.execute("SELECT COUNT(*) FROM error_log WHERE node LIKE '%Enriquecimiento%'").fetchone()[0],
        'schema': con.execute("SELECT COUNT(*) FROM error_log WHERE node LIKE '%esquema%'").fetchone()[0],
        'total': con.execute('SELECT COUNT(*) FROM error_log').fetchone()[0],
    }
    kpi['iocs'] = {
        'total': con.execute('SELECT COUNT(*) FROM iocs').fetchone()[0],
        'por_tipo': {t: c for t, c in con.execute('SELECT type, COUNT(*) FROM iocs GROUP BY type')},
        'por_confianza': {c: n2 for c, n2 in con.execute('SELECT confidence, COUNT(*) FROM iocs GROUP BY confidence')},
    }
    kpi['ips_publicas'] = con.execute('SELECT COUNT(DISTINCT src_ip) FROM events').fetchone()[0] - 1
    kpi['sesiones_totales'] = con.execute('SELECT COUNT(DISTINCT session) FROM events').fetchone()[0]
    kpi['sesiones_confirmadas'] = con.execute(
        "SELECT COUNT(DISTINCT session) FROM events WHERE eventid IN "
        "('cowrie.login.success','dionaea.smb.login_success','dionaea.http.login_success','dionaea.capture.file_upload')"
    ).fetchone()[0]
    kpi['sesiones_con_ioc'] = con.execute(
        'SELECT COUNT(DISTINCT e.session) FROM iocs i JOIN events e ON e.id = i.event_id').fetchone()[0]
    kpi['pct_sesiones_con_ioc'] = round(100.0 * kpi['sesiones_con_ioc'] / kpi['sesiones_confirmadas'], 1)
    lat_meta = {}
    with open(os.path.join(TAB, 'tabla_a08_latencias.csv'), encoding='utf-8-sig') as f:
        for fila in csv.DictReader(f):
            lat_meta[fila['metrica']] = float(fila['valor_ms'])
    kpi['latencia'] = lat_meta
    fila_pico = con.execute('SELECT hora, COUNT(*) FROM events GROUP BY hora ORDER BY 2 DESC LIMIT 1').fetchone()
    kpi['pico_horario_local_utc3'] = {'hora': '%02d:00' % fila_pico[0], 'eventos_hora': fila_pico[1]}
    with open(os.path.join(ANA, 'kpis.json'), 'w', encoding='utf-8') as f:
        json.dump(kpi, f, ensure_ascii=False, indent=2)

    with open(os.path.join(ANA, 'consultas.sql'), 'w', encoding='utf-8') as f:
        f.write(QUERIES)

    print('  KPIs: eventos %d | estructuración %.1f%% | sesiones %d (confirmadas %d, con IoC %d = %.1f%%)'
          % (kpi['eventos'], kpi['tasa_estructuracion_pct'], kpi['sesiones_totales'],
             kpi['sesiones_confirmadas'], kpi['sesiones_con_ioc'], kpi['pct_sesiones_con_ioc']))
    print('  IoCs: %d (%s)' % (kpi['iocs']['total'],
                               ', '.join('%s:%d' % (k, v) for k, v in kpi['iocs']['por_tipo'].items())))
    print('  Latencia: media %s ms sd %s ms p50 %s p95 %s p99 %s | pico local %s'
          % (lat_meta['media'], lat_meta['desviacion'], lat_meta['p50'], lat_meta['p95'], lat_meta['p99'],
             kpi['pico_horario_local_utc3']['hora']))
    print('Listo: honeypot.db + %d tablas CSV + kpis.json + consultas.sql' % len(os.listdir(TAB)))
    con.close()


QUERIES = """
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
"""

if __name__ == '__main__':
    main()
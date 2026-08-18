#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_parquet.py - Fase 3: Datasets Parquet listos para Databricks
Compilado: Nocturne Society - Honeypots + n8n - Tesis de grado - 2026

Lee analitica/honeypot.db y escribe en analitica/parquet/:
  events.parquet       (tabla de hechos, eventos)
  iocs.parquet         (indicadores de compromiso)
  reports.parquet      (reportes diarios)
  error_log.parquet    (errores del pipeline)
  latencias.parquet    (latencia por evento, para analisis de rendimiento)
  metricas_diarias.parquet (gold: agregados por dia por protocolo)

Tambien genera los notebooks SQL de Databricks en analitica/databricks/.
"""
import json
import os
import re
import sqlite3
import struct
import sys
from datetime import datetime

import pyarrow as pa
import pyarrow.parquet as pq

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANA = os.path.join(ROOT, 'analitica')
PAR = os.path.join(ANA, 'parquet')
NBK = os.path.join(ANA, 'databricks')
os.makedirs(PAR, exist_ok=True)
os.makedirs(NBK, exist_ok=True)

TS_OFFSET = re.compile(r'-03$')


def _parse(ts):
    s = TS_OFFSET.sub('', ts.strip())
    if '.' in s:
        base, frac = s.split('.', 1)
        return datetime.strptime(base + '.' + frac[:6], '%Y-%m-%d %H:%M:%S.%f')
    return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')


def parse_ms(ts, ca):
    if not ts or not ca:
        return None
    t0, t1 = _parse(ts), _parse(ca)
    return round((t1 - t0).total_seconds() * 1000.0, 3)


def exportar(con, nombre, query):
    cols, rows = con.execute(query).description, con.execute(query).fetchall()
    with open(os.path.join(PAR, nombre), 'wb') as f:
        pq.write_table(pa.Table.from_pylist(
            [dict(zip([c[0] for c in cols], r)) for r in rows]), f)
    return len(rows)


def main():
    db = os.path.join(ANA, 'honeypot.db')
    if not os.path.exists(db):
        raise SystemExit('ERROR: falta %s (ejecutar primero scripts/generar_sqlite.py)' % db)
    con = sqlite3.connect(db)
    con.row_factory = sqlite3.Row

    print('[1/6] events.parquet...')
    eventos = []
    for r in con.execute('SELECT * FROM events ORDER BY id'):
        eventos.append({
            'id': r['id'], 'timestamp': r['timestamp'], 'dia': r['dia'], 'hora': r['hora'],
            'eventid': r['eventid'], 'session': r['session'], 'src_ip': r['src_ip'],
            'src_port': r['src_port'], 'username': r['username'], 'password': r['password'],
            'input': r['input'], 'message': r['message'], 'processed': bool(r['processed']),
            'created_at': r['created_at'],
        })
    del r
    # protocolo por sesion
    proto = {r['session']: r['protocolo'] for r in con.execute('SELECT * FROM proto_session')}
    for e in eventos:
        e['protocolo'] = proto.get(e['session'])
        e['latencia_ms'] = parse_ms(e['timestamp'], e['created_at'])
        e.pop('created_at', None)
    with open(os.path.join(PAR, 'events.parquet'), 'wb') as f:
        pq.write_table(pa.Table.from_pylist(eventos), f)
    del eventos

    print('[2/6] iocs.parquet, reports.parquet, error_log.parquet...')
    exportar(con, 'iocs.parquet', 'SELECT * FROM iocs ORDER BY id')
    exportar(con, 'reports.parquet', 'SELECT * FROM reports ORDER BY id')
    exportar(con, 'error_log.parquet', 'SELECT * FROM error_log ORDER BY id')

    print('[3/6] latencias.parquet...')
    latencias = []
    for r in con.execute('SELECT id, dia, hora, timestamp, created_at '
                         'FROM events WHERE timestamp IS NOT NULL '
                         'AND created_at IS NOT NULL ORDER BY id'):
        lat = parse_ms(r['timestamp'], r['created_at'])
        if lat is not None:
            latencias.append({'id': r['id'], 'dia': r['dia'], 'hora': r['hora'],
                              'latencia_ms': lat})
    with open(os.path.join(PAR, 'latencias.parquet'), 'wb') as f:
        pq.write_table(pa.Table.from_pylist(latencias), f)
    del latencias

    print('[4/6] metricas_diarias.parquet (gold)...')
    exportar(con, 'metricas_diarias.parquet',
             'SELECT e.dia, p.protocolo, COUNT(*) eventos, '
             'COUNT(DISTINCT e.src_ip) ips_unicas, COUNT(DISTINCT e.session) sesiones, '
             'SUM(e.processed) estructurados, '
             'COUNT(CASE WHEN e.eventid IN (\'cowrie.login.success\',\'dionaea.smb.login_success\','
             '\'dionaea.http.login_success\',\'dionaea.capture.file_upload\') THEN 1 END) sesiones_exitosas '
             'FROM events e JOIN proto_session p ON p.session = e.session GROUP BY 1, 2 ORDER BY 1, 2')

    # KPIs desde kpis.json para la tabla de metadatos del dataset
    print('[5/6] Notebooks SQL de Databricks...')
    with open(os.path.join(ANA, 'kpis.json'), 'r', encoding='utf-8') as f:
        kpis = json.load(f)
    with open(os.path.join(NBK, '01_ingesta.sql'), 'w', encoding='utf-8') as f:
        f.write(NB_INGESTA % kpis)
    with open(os.path.join(NBK, '02_analisis.sql'), 'w', encoding='utf-8') as f:
        f.write(NB_ANALISIS)

    print('[6/6] Verificacion de lectura con pyarrow...')
    import glob
    ok = 0
    for p in sorted(glob.glob(os.path.join(PAR, '*.parquet'))):
        t = pq.read_table(p)
        ok += t.num_rows
        print('  %-32s %d filas x %d cols' % (os.path.basename(p), t.num_rows, t.num_columns))
    print('Total filas leidas: %d' % ok)
    con.close()


NB_INGESTA = """-- Databricks Notebook - 01_ingesta.sql
-- Nocturne Society | Honeypots + n8n | Tesis de grado 2026
-- Dataset: campana 30 dias (13/07/2026 - 11/08/2026) | %(eventos)d eventos
-- KPIs de referencia: estructuración %(tasa_estructuracion_pct).1f%% |
-- sesiones confirmadas %(sesiones_confirmadas)d | con IoC %(sesiones_con_ioc)d (%%(pct_sesiones_con_ioc).1f%%)

-- 1. Montar/descomprimir los parquet y registrar vistas
-- Los archivos se suben a dbfs:/FileStore/honeypot/parquet/

DROP VIEW IF EXISTS events_raw;
CREATE TEMP VIEW events_raw AS
SELECT * FROM parquet.`/FileStore/honeypot/parquet/events.parquet`;

DROP VIEW IF EXISTS iocs_raw;
CREATE TEMP VIEW iocs_raw AS
SELECT * FROM parquet.`/FileStore/honeypot/parquet/iocs.parquet`;

DROP VIEW IF EXISTS metrics_raw;
CREATE TEMP VIEW metrics_raw AS
SELECT * FROM parquet.`/FileStore/honeypot/parquet/metricas_diarias.parquet`;

-- 2. Control de ingesta: conteos
SELECT 'events' tabla, COUNT(*) filas FROM events_raw
UNION ALL SELECT 'iocs', COUNT(*) FROM iocs_raw
UNION ALL SELECT 'metricas_diarias', COUNT(*) FROM metrics_raw;
"""

NB_ANALISIS = """-- Databricks Notebook - 02_analisis.sql
-- Nocturne Society | Honeypots + n8n | Tesis de grado 2026
-- Analisis exploratorio sobre la campana (depende de 01_ingesta)

-- 1. Eventos por protocolo
SELECT protocolo, COUNT(*) eventos, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) pct
FROM events_raw GROUP BY protocolo ORDER BY eventos DESC;

-- 2. Serie temporal diaria
SELECT dia, COUNT(*) eventos
FROM events_raw GROUP BY dia ORDER BY dia;

-- 3. Top 10 IPs por volumen de eventos
SELECT src_ip, COUNT(*) eventos
FROM events_raw GROUP BY src_ip ORDER BY eventos DESC LIMIT 10;

-- 4. Credenciales mas utilizadas
SELECT username, password, COUNT(*) intentos
FROM events_raw
WHERE username IS NOT NULL AND password IS NOT NULL
GROUP BY username, password ORDER BY intentos DESC LIMIT 10;

-- 5. IoCs por tipo y confianza
SELECT type, confidence, COUNT(*) cantidad
FROM iocs_raw GROUP BY type, confidence ORDER BY type, confidence;

-- 6. Distribucion de latencia de procesamiento (ms) por hora
SELECT hora, ROUND(AVG(latencia_ms), 1) lat_media_ms, COUNT(*) n
FROM latencias GROUP BY hora ORDER BY hora;

-- 7. Gold: metricas diarias (vista materializada delta recomendada)
OPTIMIZE metrics;
"""

if __name__ == '__main__':
    main()
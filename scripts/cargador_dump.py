#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cargador_dump.py - Parser del dump PostgreSQL generado por generar_dataset.js
Compilado: Nocturne Society - Honeypots + n8n - Tesis de grado - 2026

Convierte el archivo postgres-dump-20260811.sql en filas de diccionarios
listas para construir honeypot.db (Fase 2) y los parquet (Fase 3).
Uso como modulo: from cargador_dump import parse_dump
"""
import re

TABLE_COLS = {
    'events': ['id', 'eventid', 'session', 'src_ip', 'src_port', 'username',
               'password', 'input', 'message', 'timestamp', 'processed', 'created_at'],
    'iocs': ['id', 'type', 'value', 'confidence', 'event_id', 'source', 'created_at'],
    'reports': ['id', 'period_start', 'period_end', 'content', 'created_at'],
    'error_log': ['id', 'workflow', 'node', 'error', 'created_at'],
}

LINE_RE = re.compile(r"INSERT INTO public\.(\w+) \((.*?)\) VALUES (.*)$")


def _split_valores(s):
    """Divide la tupla SQL en literales respetando strings con '' escapado."""
    out = []
    i, n = 0, len(s)
    while i < n:
        c = s[i]
        if c == "'":
            j = i + 1
            while j < n:
                if s[j] == "'":
                    if j + 1 < n and s[j + 1] == "'":
                        j += 2
                        continue
                    break
                j += 1
            out.append(s[i + 1:j].replace("''", "'"))
            i = j + 1
        elif c in ' \t,':
            i += 1
        else:
            j = i
            while j < n and s[j] not in ',)':
                j += 1
            tok = s[i:j]
            if tok == 'NULL':
                out.append(None)
            elif tok in ('true', 'false'):
                out.append(tok == 'true')
            elif tok.isdigit():
                out.append(int(tok))
            else:
                out.append(tok)
            i = j
        if i < n and s[i] == ',':
            i += 1
    return out


def parse_dump(path):
    """Devuelve {'events': [dict, ...], 'iocs': [...], 'reports': [...], 'error_log': [...]}."""
    tablas = {k: [] for k in TABLE_COLS}
    with open(path, 'r', encoding='utf-8') as f:
        for linea in f:
            m = LINE_RE.match(linea.rstrip('\n'))
            if not m:
                continue
            table, hdr, vals_str = m.group(1), m.group(2), m.group(3).rstrip(';').strip()
            if table not in tablas:
                continue
            colnames = [c.strip().strip('"') for c in hdr.split(',')]
            inner = vals_str[1:-1] if vals_str.startswith('(') else vals_str
            fila_indexada = {}
            for c, v in zip(colnames, _split_valores(inner)):
                fila_indexada[c] = v
            tablas[table].append(fila_indexada)
    return tablas


def fila_sql(fila, cols):
    return ' | '.join(str(fila.get(c)) for c in cols)
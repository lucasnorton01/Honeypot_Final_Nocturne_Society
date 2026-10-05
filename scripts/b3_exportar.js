#!/usr/bin/env node
// Exportación de la evidencia de la validación B3 (registro previo: docs/PREREGISTRO_B3.md).
// La llama scripts/b3_cerrar.ps1. El cierre es fijo (11:15:00 UTC del 06/10/2026, 08:15 ART):
// ningún dato posterior a esa hora entra en la evidencia, aunque el script se ejecute más tarde.
// Uso, desde la raíz del repo:  node scripts/b3_exportar.js docs/evidencia/b3
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.resolve(process.argv[2] || 'docs/evidencia/b3');
const CIERRE = '2026-10-06 11:15:00';
const ini = JSON.parse(fs.readFileSync(path.join(dir, 'inicio.json'), 'utf8').replace(/^\uFEFF/, ''));
const docker = args => execFileSync('docker', args, { maxBuffer: 1 << 30 });
const escribir = (f, datos) => fs.writeFileSync(path.join(dir, f), datos); // UTF-8 sin BOM

// [1] Tablas de PostgreSQL (CSV con encabezado), hasta el cierre
const copia = (sql, f) => escribir(f, docker(['exec', 'postgres', 'psql', '-U', 'honeypot', '-d', 'honeypot', '-c', `\\copy (${sql}) TO STDOUT WITH CSV HEADER`]));
const hasta = `created_at < TIMESTAMPTZ '${CIERRE}+00'`;
copia(`SELECT id,eventid,session,src_ip,src_port,username,password,input,timestamp,processed,created_at,country FROM events WHERE ${hasta} ORDER BY id`, 'events.csv');
copia(`SELECT id,type,value,confidence,event_id,source,created_at FROM iocs WHERE ${hasta} ORDER BY id`, 'iocs.csv');
copia(`SELECT id,ioc_id,event_id,session,created_at FROM ioc_sessions WHERE ${hasta} ORDER BY id`, 'ioc_sessions.csv');
copia(`SELECT id,period_start,period_end,created_at FROM reports WHERE ${hasta} ORDER BY id`, 'reports.csv');
copia(`SELECT id,workflow,node,error,created_at FROM error_log WHERE ${hasta} ORDER BY id`, 'error_log.csv');
console.log('[1] Tablas exportadas');

// [2] Log de Cowrie de la ventana (todos los archivos rotados), entre el inicio y el cierre
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b3-'));
docker(['cp', 'cowrie:/cowrie/cowrie-git/var/log/cowrie', path.join(tmp, 'cowrie')]);
const t0 = Date.parse(ini.inicio.replace(' ', 'T') + 'Z'), t1 = Date.parse(CIERRE.replace(' ', 'T') + 'Z');
const lineas = [];
for (const f of fs.readdirSync(path.join(tmp, 'cowrie')).filter(f => f.startsWith('cowrie.json')))
  for (const l of fs.readFileSync(path.join(tmp, 'cowrie', f), 'utf8').split('\n')) {
    if (!l.trim()) continue;
    const t = Date.parse(JSON.parse(l).timestamp);
    if (t >= t0 && t < t1) lineas.push([t, l]);
  }
lineas.sort((a, b) => a[0] - b[0]);
escribir('cowrie_ventana.json', lineas.map(x => x[1]).join('\n') + '\n');
console.log(`[2] Log de Cowrie: ${lineas.length} eventos`);

// [3] Historial de ejecuciones de n8n (base SQLite con su WAL)
for (const f of ['database.sqlite', 'database.sqlite-wal', 'database.sqlite-shm'])
  try { docker(['cp', `n8n:/home/node/.n8n/${f}`, path.join(tmp, f)]); } catch { if (f === 'database.sqlite') throw new Error('No se pudo copiar database.sqlite'); }
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(tmp, 'database.sqlite'));
const q = v => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
const filas = db.prepare(`SELECT e.id, w.name AS workflow, e.mode AS modo, e.status AS estado, e.startedAt AS inicio, e.stoppedAt AS fin,
  (julianday(e.stoppedAt) - julianday(e.startedAt)) * 86400000 AS dur FROM execution_entity e JOIN workflow_entity w ON w.id = e.workflowId ORDER BY e.id`).all();
db.close();
escribir('ejecuciones.csv', 'id,workflow,modo,estado,inicio,fin,duracion_ms\n' +
  filas.map(r => [r.id, r.workflow, r.modo, r.estado, r.inicio, r.fin, r.dur === null ? '' : Math.round(r.dur * 10) / 10].map(q).join(',')).join('\n') + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`[3] Ejecuciones de n8n: ${filas.length}`);

escribir('ventana.json', JSON.stringify({ inicio: ini.inicio, cierre: CIERRE }, null, 2) + '\n');

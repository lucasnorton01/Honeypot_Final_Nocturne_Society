#!/usr/bin/env node
// Exportación de la evidencia de la validación R1 (registro previo: docs/PREREGISTRO_R1.md).
// La llama scripts/r1_cerrar.ps1. El cierre es fijo (11:15:00 UTC del 11/10/2026, 08:15 ART):
// ningún dato posterior a esa hora entra en la evidencia, aunque el script se ejecute más tarde.
// Parte de scripts/b4_exportar.js; agrega el resumen del forwarder (entregas y alertas de Telegram,
// solo conteos y tiempos, sin ningún valor secreto) y el estado de puertos y redes al cierre.
// Uso, desde la raíz del repo:  node scripts/r1_exportar.js docs/evidencia/r1
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const dir = path.resolve(process.argv[2] || 'docs/evidencia/r1');
const CIERRE = '2026-10-11 11:15:00';
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-'));
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

// [4] Forwarder: entregas a n8n y alertas de Telegram de la ventana (solo conteos y tiempos)
const isoZ = ms => new Date(ms).toISOString();
const flog = docker(['logs', '--since', isoZ(t0), '--until', isoZ(t1), 'forwarder']).toString('utf8').split('\n');
const tg = {}; let ok = 0, err = 0;
for (const l of flog) {
  if (/\[OK\] /.test(l)) ok++;
  if (/\[ERR\] /.test(l)) err++;
  const m = l.match(/\[TG\] (\w+) (enviado|rechazado|sin env\S+|descartado)(?: \(?(\d+) ?ms)?/);
  if (!m) continue;
  const tipo = m[1], est = m[2].startsWith('sin env') ? 'sin_envio' : m[2];
  (tg[tipo] ??= { enviado: 0, rechazado: 0, sin_envio: 0, descartado: 0, ms: [] })[est]++;
  if (est === 'enviado' && m[3]) tg[tipo].ms.push(+m[3]);
}
const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
for (const t of Object.values(tg)) { t.mediana_ms = mediana(t.ms); t.max_ms = t.ms.length ? Math.max(...t.ms) : null; delete t.ms; }
escribir('forwarder_resumen.json', JSON.stringify({ entregas_ok: ok, entregas_err: err, telegram: tg }, null, 2) + '\n');
console.log(`[4] Forwarder: ${ok} entregas, ${err} errores, alertas: ${JSON.stringify(Object.fromEntries(Object.entries(tg).map(([k, v]) => [k, v.enviado])))}`);

// [5] Estado de puertos publicados y redes Docker al cierre
const ps = docker(['compose', 'ps', '--all', '--format', 'json']).toString('utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
  .map(s => ({ servicio: s.Service, estado: s.State, salud: s.Health || '', publicados: (s.Publishers || []).filter(p => p.PublishedPort).map(p => `${p.URL}:${p.PublishedPort}->${p.TargetPort}`) }));
const redes = ['captura', 'proceso', 'datos', 'entrada', 'salida'].map(r => ({ red: r, internal: docker(['network', 'inspect', `honeypot-b2_${r}`, '--format', '{{.Internal}}']).toString().trim() === 'true' }));
escribir('configuracion_cierre.json', JSON.stringify({ servicios: ps, redes }, null, 2) + '\n');
console.log(`[5] Configuración al cierre: ${ps.length} servicios, ${redes.length} redes`);

// [6] Verdad de referencia: las líneas «REPLAY» del registro de la tarea programada (lo que el reproductor envió)
const cron = fs.readFileSync(path.join(dir, 'attack-runner-cron_r1.log'), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.startsWith('REPLAY '));
escribir('replay_enviado.jsonl', cron.map(l => l.slice(7)).join('\n') + '\n');
console.log('[6] Registro del reproductor: ' + cron.length + ' líneas');

escribir('ventana.json', JSON.stringify({ inicio: ini.inicio, cierre: CIERRE }, null, 2) + '\n');

// Recalcula desde docs/evidencia/ las cifras principales de la tesis y las compara con las publicadas.
// Uso (desde la raíz del repo): node scripts/verificar_cifras.js
// Sale con código 1 si alguna cifra no coincide.
const fs = require('fs'), path = require('path');
const E = path.join(__dirname, '..', 'docs', 'evidencia');

function csv(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; } else cur += c; }
  if (cur || row.length) { row.push(cur.replace(/\r$/, '')); rows.push(row); }
  const h = rows.shift(); return rows.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}
const ms = s => Date.parse(s.replace(' ', 'T').replace(/\+00$/, 'Z'));
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const res = []; let fallas = 0;
const chk = (nombre, obtenido, esperado, tol = 0) => { const ok = Math.abs(obtenido - esperado) <= tol; if (!ok) fallas++; res.push([ok ? 'OK ' : 'NO ', nombre, obtenido, esperado]); };

// ---- ventana con carpeta propia (C1: b2, C2: b3) ----
function ventana(nombre, dir, esp) {
  const ev = csv(path.join(E, dir, 'events.csv')), is = csv(path.join(E, dir, 'ioc_sessions.csv')), io = csv(path.join(E, dir, 'iocs.csv'));
  const ok = new Set(ev.filter(e => e.eventid === 'cowrie.login.success').map(e => e.session));
  chk(nombre + ': eventos persistidos', ev.length, esp.eventos);
  chk(nombre + ': sesiones con autenticación exitosa', ok.size, esp.sesiones);
  chk(nombre + ': sesiones con fila en ioc_sessions', [...ok].filter(s => is.some(r => r.session === s)).length, esp.completitud);
  const evSes = new Map(ev.map(e => [e.id, e.session]));
  chk(nombre + ': sesiones atribuidas por event_id', [...ok].filter(s => io.some(r => evSes.get(r.event_id) === s)).length, esp.porEventId);
  chk(nombre + ': latencia media (ms)', mean(ev.map(e => ms(e.created_at) - ms(e.timestamp))), esp.latencia, 0.5);
}
ventana('C1 (02/10)', 'b2', { eventos: 629, sesiones: 15, completitud: 15, porEventId: 9, latencia: 1453.16 });
ventana('C2 (05-06/10)', 'b3', { eventos: 3218, sesiones: 66, completitud: 66, porEventId: 14, latencia: 1370.85 });

// ---- W2 (30/09) ----
{
  const ev = csv(path.join(E, 'events_2026-09-30.csv')), is = csv(path.join(E, 'ioc_sessions_2026-09-30.csv')), ie = csv(path.join(E, 'iocs_events_2026-09-30.csv')), la = csv(path.join(E, 'latencia_2026-09-30.csv'));
  const ok = new Set(ev.filter(e => e.eventid === 'cowrie.login.success').map(e => e.session));
  chk('W2 (30/09): eventos persistidos', ev.length, 1998);
  chk('W2: sesiones con autenticación exitosa', ok.size, 41);
  chk('W2: P3 por event_id (6 de 41)', [...ok].filter(s => ie.some(r => r.session === s)).length, 6);
  chk('W2: sesiones con fila en ioc_sessions (39 de 41)', [...ok].filter(s => is.some(r => r.session === s)).length, 39);
  chk('W2: latencia media (ms), 1,6 s', mean(la.map(r => +r.latencia_ms)), 1600, 100);
}
// ---- B1c ----
{
  const dir = path.join(E, 'b1c', 'resultados'); const P = fs.readdirSync(dir).filter(f => /^linea-base-P\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).respuestas.filter(r => !r.practica).map(r => r.ms_paso1 / 1000));
  chk('B1c: participantes válidos', P.length, 10);
  chk('B1c: mediana del paso 1 (s)', med(Array.from({ length: 20 }, (_, e) => med(P.map(p => p[e])))), 11.01, 0.01);
}
const w = Math.max(...res.map(r => r[1].length));
for (const [s, n, o, e] of res) console.log(s + n.padEnd(w + 2) + String(typeof o === 'number' && !Number.isInteger(o) ? o.toFixed(2) : o).padStart(10) + '  (tesis: ' + e + ')');
console.log(fallas ? `\n${fallas} cifra(s) no coinciden` : '\nTodas las cifras coinciden');
process.exit(fallas ? 1 : 0);

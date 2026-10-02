#!/usr/bin/env node
// Control de robustez de P2 (definido después de observar los datos; no cambia el veredicto).
// Para cada evento persistido en `events` comprueba:
//   (1) criterio estricto: eventid, session y timestamp no nulos y, según el tipo de evento,
//       username y password (cowrie.login.*), input (cowrie.command.input) y src_ip/src_port
//       (cowrie.session.connect);
//   (2) fidelidad: que eventid, session, src_ip, src_port, username, password e input sean
//       idénticos a los del evento correspondiente del log JSON de Cowrie (misma sesión, tipo y
//       marca temporal al milisegundo).
// Uso, desde la raíz del repositorio:  node scripts/verificar_p2_estricto.js
const fs = require('fs');

const csv = f => {
  const L = fs.readFileSync(f, 'utf8').trim().split(/\r?\n/);
  const h = L[0].split(',');
  return L.slice(1).map(l => {
    const v = []; let c = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i + 1] === '"') { c += '"'; i++; continue; } q = !q; continue; }
      if (ch === ',' && !q) { v.push(c); c = ''; continue; }
      c += ch;
    }
    v.push(c);
    return Object.fromEntries(h.map((k, i) => [k, v[i]]));
  });
};
const iso = t => new Date(t.replace(' ', 'T').replace(/\+00$/, 'Z')).toISOString().slice(0, 23);
const REQ = {
  'cowrie.login.success': ['username', 'password'],
  'cowrie.login.failed': ['username', 'password'],
  'cowrie.command.input': ['input'],
  'cowrie.session.connect': ['src_ip', 'src_port'],
};
const FIELDS = ['eventid', 'session', 'src_ip', 'src_port', 'username', 'password', 'input'];
const filled = v => v !== undefined && v !== null && String(v).trim() !== '';

function check(name, eventsFile, logFile) {
  const rows = csv(eventsFile);
  const log = fs.readFileSync(logFile, 'utf8').trim().split('\n').map(JSON.parse);
  const idx = {};
  for (const e of log) (idx[`${e.session}|${e.eventid}|${e.timestamp.slice(0, 23)}`] ??= []).push(e);
  let strict = 0, conCampos = 0, conCamposOk = 0, fiel = 0, sinLog = 0;
  for (const r of rows) {
    const req = REQ[r.eventid] || [];
    const ok = filled(r.eventid) && filled(r.session) && filled(r.timestamp) && req.every(k => filled(r[k]));
    if (ok) strict++;
    if (req.length) { conCampos++; if (req.every(k => filled(r[k]))) conCamposOk++; }
    const e = (idx[`${r.session}|${r.eventid}|${iso(r.timestamp)}`] || [])[0];
    if (!e) { sinLog++; continue; }
    if (FIELDS.every(f => (r[f] ?? '').trim() === (e[f] === undefined || e[f] === null ? '' : String(e[f])))) fiel++;
  }
  console.log(`${name}: ${rows.length} eventos | criterio estricto ${strict}/${rows.length} ` +
    `| con campos obligatorios por tipo ${conCamposOk}/${conCampos} | idénticos al log de Cowrie ${fiel}/${rows.length} ` +
    `| sin evento en el log ${sinLog}`);
}

check('Lote 2 del 25/09/2026', 'docs/evidencia/events_lote2_2026-09-25.csv', 'docs/evidencia/cowrie_lote_2026-09-25.json');
check('Validación del 30/09/2026', 'docs/evidencia/events_2026-09-30.csv', 'docs/evidencia/cowrie_ventana_2026-09-30.json');

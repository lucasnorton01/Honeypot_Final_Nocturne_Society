#!/usr/bin/env node
// Construye las páginas de la evaluación del reporte (plan: docs/PRUEBAS_EVALUACION_REPORTE.md).
// Antes de generar nada, comprueba que cada número del reporte coincida con la evidencia publicada de B3
// y que las respuestas esperadas del fragmento de log coincidan con el log. Uso, desde la raíz del repo:
//   node experimentos/evaluacion_reporte/build.js
const fs = require('fs'), path = require('path');
const raiz = path.resolve(__dirname, '..', '..');
const ev = path.join(raiz, 'docs', 'evidencia', 'evaluacion');
const b3 = path.join(raiz, 'docs', 'evidencia', 'b3');
const leer = f => fs.readFileSync(f, 'utf8').replace(/^﻿/, '').replace(/\r/g, '');
const csv = f => { const L = leer(f).trim().split('\n'), h = L[0].split(','); return L.slice(1).filter(Boolean).map(l => { const v = []; let c = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { c += '"'; i++; continue; } q = !q; continue; } if (ch === ',' && !q) { v.push(c); c = ''; continue; } c += ch; } v.push(c); return Object.fromEntries(h.map((k, i) => [k, v[i]])); }); };

const reporteTxt = leer(path.join(ev, 'reporte_b3.json')).trim();
const R = JSON.parse(reporteTxt);
const eventos = csv(path.join(b3, 'events.csv')), iocs = csv(path.join(b3, 'iocs.csv'));
const fragTxt = leer(path.join(ev, 'fragmento_log.jsonl')).trim();
const frag = fragTxt.split('\n').map(JSON.parse);

// ---- Respuestas esperadas: se toman del reporte ----
const ipTop = R.top_ips[0];
const credTop = R.credenciales[0];
const iocTop = [...R.iocs_24h].sort((a, b) => b.cantidad - a.cantidad)[0];
const esperadas = {
  R1: { cantidad: Number(R.total_eventos) },
  R2: { cantidad: R.top_ips.length, ip: ipTop.src_ip },
  R3: { usuario: credTop.username, password: credTop.password, intentos: credTop.intentos },
  R4: { cantidad: R.distribucion_eventid.find(x => x.eventid === 'cowrie.login.failed').cantidad },
  R5: { cantidad: R.iocs_24h.find(x => x.type === 'command').cantidad },
  R6: { tipo: iocTop.type, cantidad: iocTop.cantidad },
  U1: { esta_en_reporte: false },
  U2: { esta_en_reporte: false },
};
const exito = frag.find(e => e.eventid === 'cowrie.login.success');
const cmds = frag.filter(e => e.session === exito.session && e.eventid === 'cowrie.command.input').map(e => e.input);
esperadas.L1 = { usuario: exito.username, password: exito.password };
esperadas.L2 = { comandos: cmds };

// ---- Comprobación contra la evidencia de B3 ----
const fallas = [];
const chk = (desc, a, b) => { if (String(a) !== String(b)) fallas.push(`${desc}: reporte ${a} ≠ evidencia ${b}`); };
chk('R1 total de eventos', R.total_eventos, eventos.length);
chk('R2 IP distintas', R.top_ips.length, new Set(eventos.map(e => e.src_ip)).size);
chk('R2 eventos de la IP más activa', ipTop.eventos, eventos.filter(e => e.src_ip === ipTop.src_ip).length);
chk('R3 intentos de la combinación más usada', credTop.intentos, eventos.filter(e => e.username === credTop.username && e.password === credTop.password).length);
const cuentas = {}; for (const e of eventos) if (e.username) { const k = e.username + '\u0000' + e.password; cuentas[k] = (cuentas[k] || 0) + 1; }
chk('R3 máximo de intentos', credTop.intentos, Math.max(...Object.values(cuentas)));
chk('R4 login fallido', esperadas.R4.cantidad, eventos.filter(e => e.eventid === 'cowrie.login.failed').length);
for (const t of ['credential', 'command', 'ip']) chk(`R5/R6 IoC ${t}`, R.iocs_24h.find(x => x.type === t).cantidad, iocs.filter(i => i.type === t).length);
chk('sesiones autenticadas', R.sesiones_cubiertas.length, new Set(eventos.filter(e => e.eventid === 'cowrie.login.success').map(e => e.session)).size);
chk('L1 una sola sesión exitosa en el fragmento', frag.filter(e => e.eventid === 'cowrie.login.success').length, 1);
chk('L2 comandos del fragmento', cmds.length, 4);
if (fallas.length) { console.error('El reporte NO coincide con la evidencia:\n' + fallas.join('\n')); process.exit(1); }
console.log('Verificación contra docs/evidencia/b3: todos los números del reporte coinciden.');

// ---- Páginas ----
let plantilla = leer(path.join(__dirname, 'plantilla.html'));
const orden = { P3: 'RL', P4: 'LR', P5: 'RL', P6: 'LR', P7: 'RL' };
fs.mkdirSync(path.join(ev, 'paginas'), { recursive: true });
for (const [codigo, o] of Object.entries(orden)) {
  const html = plantilla.split('__CODIGO__').join(codigo).split('__ORDEN__').join(o)
    .replace('__REPORTE__', () => JSON.stringify(reporteTxt)).replace('__LOG__', () => JSON.stringify(fragTxt));
  fs.writeFileSync(path.join(ev, 'paginas', `evaluacion-${codigo}.html`), html);
}
fs.writeFileSync(path.join(ev, 'respuestas_esperadas.json'), JSON.stringify({ orden, esperadas }, null, 2) + '\n');
console.log('Páginas generadas:', Object.keys(orden).map(c => `evaluacion-${c}.html (${orden[c]})`).join(', '));
console.log('Esperadas:', JSON.stringify(esperadas));

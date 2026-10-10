#!/usr/bin/env node
// Análisis de la validación R1 (registro previo: docs/PREREGISTRO_R1.md).
// Las definiciones de este archivo se fijaron ANTES de iniciar la ventana; su SHA-256 figura en el registro previo.
// No modificar después del inicio: todo análisis adicional se declara «posterior» y va en otro archivo.
// Parte de scripts/b4_analisis.js (integridad, P2, P3′, P4, ejecuciones, configuración final, forwarder) y agrega
// la comparación con la verdad de referencia del registro de reproducción y las métricas propias de R1.
// Uso, desde la raíz del repo:  node scripts/r1_analisis.js docs/evidencia/r1
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'docs/evidencia/r1';
const csv = f => {
  const L = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, '').replace(/\r/g, '').trim().split('\n');
  if (L.length < 1 || !L[0]) return [];
  const h = L[0].split(',');
  return L.slice(1).filter(Boolean).map(l => {
    const v = []; let c = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i + 1] === '"') { c += '"'; i++; continue; } q = !q; continue; }
      if (ch === ',' && !q) { v.push(c); c = ''; continue; }
      c += ch;
    }
    v.push(c); return Object.fromEntries(h.map((k, i) => [k, v[i]]));
  });
};
// Un CSV con campos entre comillas que contienen saltos de línea no se parte por líneas: se usa un lector por caracteres
const csvFull = f => {
  const t = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, '').replace(/\r/g, '');
  const rows = []; let row = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; continue; }
    if (ch === '"') { q = true; continue; }
    if (ch === ',') { row.push(c); c = ''; continue; }
    if (ch === '\n') { row.push(c); rows.push(row); row = []; c = ''; continue; }
    c += ch;
  }
  if (c !== '' || row.length) { row.push(c); rows.push(row); }
  const h = rows[0] || [];
  return rows.slice(1).filter(r => r.length > 1 || r[0] !== '').map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
};
const us = t => { const m = t.match(/^(\d{4}-\d\d-\d\d)[ T](\d\d:\d\d:\d\d)(?:\.(\d+))?(?:Z|\+00(?::00)?)?$/); if (!m) throw new Error('fecha ' + t);
  return BigInt(Date.parse(m[1] + 'T' + m[2] + 'Z')) * 1000n + BigInt(((m[3] || '') + '000000').slice(0, 6)); };
const iso = t => new Date(Number(us(t) / 1000n)).toISOString().slice(0, 23);
const wilson = (k, n, z = 1.96) => { if (!n) return [0, 0]; const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [100 * Math.max(0, c - h), 100 * Math.min(1, c + h)]; };
const pct = (k, n) => `${k}/${n} = ${(100 * k / (n || 1)).toFixed(1)} % (IC 95 % [${wilson(k, n).map(x => x.toFixed(1)).join('; ')}])`;
const stats = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), n = s.length, m = s.reduce((x, y) => x + y, 0) / n;
  return { n, media: +m.toFixed(2), mediana: +(n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2).toFixed(2), min: +s[0].toFixed(2), max: +s[n - 1].toFixed(2) }; };

const ventana = JSON.parse(fs.readFileSync(path.join(dir, 'ventana.json'), 'utf8'));
const events = csvFull('events.csv'), iocs = csvFull('iocs.csv'), ios = csv('ioc_sessions.csv'), reports = csv('reports.csv'), errs = csv('error_log.csv'), ejec = csv('ejecuciones.csv');
const log = fs.readFileSync(path.join(dir, 'cowrie_ventana.json'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const rep = fs.readFileSync(path.join(dir, 'replay_enviado.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const muestra = fs.readFileSync(path.join(dir, 'muestra_r1.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const enVentana = t => us(t) >= us(ventana.inicio) && us(t) <= us(ventana.cierre);
const out = { ventana, conteos: {} };
const norm = x => String(x ?? '').trim();

// ---------- Verdad de referencia: lo que el reproductor envió, y su correspondencia con las sesiones de Cowrie ----------
// Cada sesión reproducida se asocia con la única sesión de Cowrie con login exitoso cuyo cowrie.session.connect cae entre
// 0,5 s antes del inicio de la reproducción y 0,5 s después de su login (el reproductor es secuencial y espera 1 s entre sesiones: no hay solapamientos).
const enviadas = {}, ini = {}, fin = {}, lg = {};
for (const r of rep) {
  if (r.ev === 'sesion_inicio') ini[r.idx] = r.t;
  if (r.ev === 'sesion_fin') fin[r.idx] = r;
  if (r.ev === 'login_ok') lg[r.idx] = r.t;
  if (r.ev === 'comando_enviado') (enviadas[r.idx] ??= []).push(r.comando);
}
const sesLog = {}; for (const e of log) (sesLog[e.session] ??= []).push(e);
const conecta = s => (sesLog[s].find(e => e.eventid === 'cowrie.session.connect') || sesLog[s][0]).timestamp;
const exitosas = Object.keys(sesLog).filter(s => sesLog[s].some(e => e.eventid === 'cowrie.login.success'));
const par = {}; let sinPar = [];
for (const idx of Object.keys(ini)) {
  const a = us(ini[idx]) - 500000n, b = us(lg[idx] || (fin[idx] ? fin[idx].t : ini[idx])) + 500000n;
  const cand = exitosas.filter(s => us(conecta(s)) >= a && us(conecta(s)) <= b);
  if (cand.length === 1) par[idx] = cand[0]; else sinPar.push({ idx: +idx, candidatas: cand.length });
}
const sesDeIdx = Object.fromEntries(Object.entries(par).map(([i, s]) => [s, +i]));
const totalEnviados = Object.values(enviadas).reduce((a, x) => a + x.length, 0);
out.reproduccion = { sesiones_reproducidas: Object.keys(ini).length, sesiones_con_login_exitoso_en_cowrie: exitosas.length, sesiones_emparejadas: Object.keys(par).length,
  sin_pareja: sinPar, estados: Object.entries(Object.values(fin).reduce((a, r) => (a[r.estado.split(':')[0]] = (a[r.estado.split(':')[0]] || 0) + 1, a), {})),
  comandos_enviados: totalEnviados, credenciales_coinciden: Object.entries(par).filter(([i, s]) => { const m = muestra.find(x => x.idx === +i); const e = sesLog[s].find(x => x.eventid === 'cowrie.login.success'); return m && e && e.username === m.user && e.password === m.pass; }).length };

// ---------- Integridad: captura = persistencia ----------
const k = (s, e, t) => `${s}|${e}|${t}`;
const A = {}, B = {};
for (const e of log) A[k(e.session, e.eventid, e.timestamp.slice(0, 23))] = (A[k(e.session, e.eventid, e.timestamp.slice(0, 23))] || 0) + 1;
for (const r of events) B[k(r.session, r.eventid, iso(r.timestamp))] = (B[k(r.session, r.eventid, iso(r.timestamp))] || 0) + 1;
let dif = 0; for (const x of new Set([...Object.keys(A), ...Object.keys(B)])) if (A[x] !== B[x]) dif++;
out.conteos = { eventos_cowrie: log.length, eventos_events: events.length, claves_distintas: dif, iocs: iocs.length, ioc_sessions: ios.length, reportes: reports.length, error_log: errs.length };
out.ingesta = { eventos_persistidos: pct(events.length, log.length), claves_sin_par: dif, umbral: '100 % de los eventos de Cowrie persistidos en events, sin claves sin par',
  cumple: log.length > 0 && events.length === log.length && dif === 0 };

// ---------- Criterio 1, captura: comandos enviados que aparecen como cowrie.command.input ----------
// Exhaustividad = comandos enviados con un cowrie.command.input de la misma sesión de Cowrie, con el mismo texto (sin espacios en los
// extremos), cada evento contado una sola vez. Se informa contra la tabla events (criterio) y contra el log de Cowrie (diagnóstico).
const inpEvents = {}; for (const r of events) if (r.eventid === 'cowrie.command.input') (inpEvents[r.session] ??= []).push(norm(r.input));
const inpLog = {}; for (const e of log) if (e.eventid === 'cowrie.command.input') (inpLog[e.session] ??= []).push(norm(e.input));
const cubre = (disp, enviados) => { const rem = [...(disp || [])]; let ok = 0; const faltan = [];
  for (const c of enviados) { const i = rem.indexOf(norm(c)); if (i >= 0) { rem.splice(i, 1); ok++; } else faltan.push(c.slice(0, 120)); } return { ok, faltan, sobran: rem.length }; };
let capEv = 0, capLog = 0; const faltanEv = [];
for (const [idx, s] of Object.entries(par)) {
  const env = enviadas[idx] || [];
  const a = cubre(inpEvents[s], env), b = cubre(inpLog[s], env);
  capEv += a.ok; capLog += b.ok; for (const f of a.faltan) if (faltanEv.length < 25) faltanEv.push({ idx: +idx, comando: f });
}
// Los comandos de sesiones sin pareja cuentan como no capturados
out.captura = { exhaustividad_events: pct(capEv, totalEnviados), exhaustividad_log_cowrie: pct(capLog, totalEnviados), no_capturados_muestra: faltanEv,
  umbral: '≥ 95 % de los comandos enviados aparecen como cowrie.command.input en events', cumple: totalEnviados > 0 && capEv / totalEnviados >= 0.95 };

// ---------- P1 (descriptivo en R1): latencia de persistencia ----------
const lat = events.map(r => Number(us(r.created_at) - us(r.timestamp)) / 1000);
out.P1_descriptivo = { latencia_ms: stats(lat), nota: 'Sin umbral en R1: P1 ya tiene veredicto (lote L0).' };

// ---------- P2 estricto: criterio por tipo + fidelidad con el log de Cowrie ----------
const REQ = { 'cowrie.login.success': ['username', 'password'], 'cowrie.login.failed': ['username', 'password'], 'cowrie.command.input': ['input'], 'cowrie.session.connect': ['src_ip', 'src_port'] };
const FIELDS = ['eventid', 'session', 'src_ip', 'src_port', 'username', 'password', 'input'];
const filled = v => v !== undefined && v !== null && String(v).trim() !== '';
const idx = {}; for (const e of log) (idx[k(e.session, e.eventid, e.timestamp.slice(0, 23))] ??= []).push(e);
let estricto = 0, fiel = 0;
for (const r of events) {
  if (filled(r.eventid) && filled(r.session) && filled(r.timestamp) && (REQ[r.eventid] || []).every(f => filled(r[f]))) estricto++;
  const e = (idx[k(r.session, r.eventid, iso(r.timestamp))] || [])[0];
  if (e && FIELDS.every(f => (r[f] ?? '').trim() === (e[f] === undefined || e[f] === null ? '' : String(e[f])).trim())) fiel++;
}
out.P2 = { criterio_estricto: pct(estricto, events.length), fidelidad_con_cowrie: pct(fiel, events.length), umbral: 'ambas ≥ 80 %', cumple: events.length > 0 && estricto / events.length >= 0.8 && fiel / events.length >= 0.8 };

// ---------- P3′: completitud por sesión (las reglas del extractor, n8n/workflows/ioc-extractor.json) ----------
const PAT = /wget|curl|nc |python|\/bin|sh |bash|chmod|tftp/i;
const esperados = s => { const set = new Set();
  for (const e of log.filter(x => x.session === s)) {
    if (e.src_ip && e.eventid === 'cowrie.session.connect') set.add('ip|' + e.src_ip);
    if (e.username && e.password) set.add('credential|' + e.username + ':' + e.password);
    if (e.input && PAT.test(e.input)) set.add('command|' + String(e.input).slice(0, 500));
    if (e.message && e.message.includes('sha256')) { const m = e.message.match(/[a-f0-9]{64}/); if (m) set.add('hash|' + m[0]); }
  } return set; };
const iocById = Object.fromEntries(iocs.map(r => [r.id, r]));
const obs = {}; for (const r of ios) { const i = iocById[r.ioc_id]; if (i) (obs[r.session] ??= new Set()).add(i.type + '|' + i.value); }
let completas = 0; const incompletas = [];
for (const s of exitosas) { const esp = esperados(s), o = obs[s] || new Set(); if ([...esp].every(x => o.has(x))) completas++; else incompletas.push({ session: s, idx: sesDeIdx[s], faltan: [...esp].filter(x => !o.has(x)).map(x => x.slice(0, 120)) }); }
const evIdPorSesion = {}; for (const r of events) (evIdPorSesion[r.session] ??= new Set()).add(r.id);
const atribuidas = exitosas.filter(s => iocs.some(i => evIdPorSesion[s] && evIdPorSesion[s].has(i.event_id))).length;
out.P3_prima = { sesiones_exitosas: exitosas.length, completitud: pct(completas, exitosas.length), umbral: '≥ 70 % de las sesiones con login exitoso', cumple: exitosas.length > 0 && completas / exitosas.length >= 0.7,
  incompletas: incompletas.slice(0, 25), continuidad_event_id: pct(atribuidas, exitosas.length) };

// ---------- Indicadores de tipo comando: precisión y exhaustividad del extractor contra la verdad de referencia ----------
// Verdad de referencia = comandos enviados (sesiones emparejadas) que cumplen el patrón del extractor. Se compara el valor del indicador
// con el comando (sin espacios en los extremos, primeros 500 caracteres), en el catálogo (iocs) y por sesión (ioc_sessions).
const verdadSesion = {}, verdadGlobal = new Set();
for (const [i, s] of Object.entries(par)) { const t = new Set((enviadas[i] || []).filter(c => PAT.test(c)).map(c => norm(c).slice(0, 500))); verdadSesion[s] = t; t.forEach(x => verdadGlobal.add(x)); }
const cmdIocs = iocs.filter(i => i.type === 'command'), cmdVal = new Set(cmdIocs.map(i => norm(i.value)));
const precCat = cmdIocs.filter(i => verdadGlobal.has(norm(i.value))).length, recCat = [...verdadGlobal].filter(x => cmdVal.has(x)).length;
const filasCmd = ios.filter(r => iocById[r.ioc_id] && iocById[r.ioc_id].type === 'command' && verdadSesion[r.session]);
const precSes = filasCmd.filter(r => verdadSesion[r.session].has(norm(iocById[r.ioc_id].value))).length;
let verdadFilas = 0, recSes = 0;
for (const s of Object.keys(verdadSesion)) { const o = new Set([...(obs[s] || [])].filter(x => x.startsWith('command|')).map(x => norm(x.slice(8)))); for (const c of verdadSesion[s]) { verdadFilas++; if (o.has(c)) recSes++; } }
const noCumplen = {}; for (const i of Object.keys(par)) for (const c of enviadas[i] || []) if (!PAT.test(c)) { const v = norm(c).split(/\s+/)[0].slice(0, 30); noCumplen[v] = (noCumplen[v] || 0) + 1; }
out.indicadores_comando = { comandos_distintos_en_verdad: verdadGlobal.size, iocs_tipo_comando: cmdIocs.length,
  catalogo: { precision: pct(precCat, cmdIocs.length), exhaustividad: pct(recCat, verdadGlobal.size) },
  por_sesion: { precision: pct(precSes, filasCmd.length), exhaustividad: pct(recSes, verdadFilas) },
  comandos_enviados_que_no_cumplen_el_patron: Object.values(noCumplen).reduce((a, b) => a + b, 0), primeras_palabras_mas_frecuentes: Object.entries(noCumplen).sort((a, b) => b[1] - a[1]).slice(0, 15),
  nota: 'Sin umbral: se informan los valores. La verdad de referencia usa el patrón del propio extractor, por lo que mide su fidelidad a sus reglas, no si un comando es malicioso.' };

// ---------- Descriptivo: técnicas ATT&CK de la muestra (según el dataset) frente a los tipos de IoC del pipeline ----------
const tecn = {};
for (const m of muestra) { const s = par[m.idx]; if (!s) continue; const tieneCmd = [...(obs[s] || [])].some(x => x.startsWith('command|'));
  for (const t of new Set(m.tecnicas)) { const r = (tecn[t] ??= { sesiones: 0, con_indicador_de_comando: 0 }); r.sesiones++; if (tieneCmd) r.con_indicador_de_comando++; } }
const tipos = {}; for (const i of iocs) tipos[i.type] = (tipos[i.type] || 0) + 1;
const sesSinTec = muestra.filter(m => par[m.idx] && !m.tecnicas.length).length;
out.descriptivo_attack = { sesiones_de_la_muestra_emparejadas: Object.keys(par).length, sesiones_sin_tecnica_en_el_dataset: sesSinTec,
  tecnicas: Object.entries(tecn).sort((a, b) => b[1].sesiones - a[1].sesiones).map(([t, r]) => ({ tecnica: t, ...r })), iocs_por_tipo: tipos,
  nota: 'El pipeline no etiqueta con técnicas ATT&CK: las técnicas son las que el dataset asigna a cada sesión. Se informan sin umbral.' };

// ---------- P3, calidad (como en B4): exactitud del catálogo y precisión de atribución ----------
const sesionesLog = Object.keys(sesLog);
const esperadosPor = Object.fromEntries(sesionesLog.map(s => [s, esperados(s)]));
const universo = new Set(sesionesLog.flatMap(s => [...esperadosPor[s]]));
const iocExactos = iocs.filter(i => universo.has(i.type + '|' + i.value));
let atribOk = 0; for (const r of ios) { const i = iocById[r.ioc_id], key = i ? i.type + '|' + i.value : null; if (key && esperadosPor[r.session] && esperadosPor[r.session].has(key)) atribOk++; }
out.P3_calidad = { exactitud_catalogo: pct(iocExactos.length, iocs.length), precision_atribucion: pct(atribOk, ios.length), nota: 'Informativo en R1 (sin umbral propio).' };

// ---------- P4: cobertura por reportes del cron diario de producción en modo trigger ----------
const rg = ejec.filter(r => r.workflow === 'report-generator' && enVentana(r.inicio));
const rgTrigger = rg.filter(r => r.modo === 'trigger' && r.estado === 'success');
const repTrigger = reports.filter(r => rgTrigger.some(x => Math.abs(Number(us(r.created_at) - us(x.inicio))) < 120e6));
const loginTs = s => log.filter(e => e.session === s && e.eventid === 'cowrie.login.success').map(e => e.timestamp)[0];
const cubiertas = exitosas.filter(s => repTrigger.some(r => us(loginTs(s)) >= us(r.period_start) && us(loginTs(s)) <= us(r.period_end))).length;
const t08 = us(ventana.cierre) - 900000000n, disparo08 = rgTrigger.filter(r => us(r.inicio) >= t08 && us(r.inicio) <= t08 + 60000000n);
const rep08 = reports.filter(r => disparo08.some(x => Math.abs(Number(us(r.created_at) - us(x.inicio))) < 120e6));
out.P4 = { ejecuciones_report_generator: rg.map(r => `${r.inicio} ${r.modo} ${r.estado}`), reportes_trigger: repTrigger.length,
  disparo_produccion_0800_en_la_ventana: disparo08.length === 1 && rg.length === 1, reporte_0800_guardado: rep08.length === 1,
  cobertura: pct(cubiertas, exitosas.length),
  nota: 'Se evalúa solo si el disparo de producción de las 08:00 ART cae dentro de la ventana; la cobertura queda garantizada por construcción (cada reporte abarca las 24 horas previas).',
  evaluable: disparo08.length === 1, cumple: disparo08.length === 1 && rg.length === 1 && rep08.length === 1 && cubiertas / (exitosas.length || 1) >= 0.9 };

// ---------- Ejecuciones manuales (deben ser cero) y health-monitor ----------
out.ejecuciones = { total: ejec.filter(r => enVentana(r.inicio)).length,
  manuales_extractor_o_reportes: ejec.filter(r => enVentana(r.inicio) && ['ioc-extractor', 'report-generator'].includes(r.workflow) && r.modo !== 'trigger').length,
  extractor: (() => { const x = ejec.filter(r => r.workflow === 'ioc-extractor' && enVentana(r.inicio)); return { n: x.length, error: x.filter(r => r.estado !== 'success').length, duracion_ms: x.length ? stats(x.map(r => +r.duracion_ms)) : null }; })() };
const hm = ejec.filter(r => r.workflow === 'health-monitor' && enVentana(r.inicio));
out.health_monitor = { ejecuciones: hm.length, en_error: hm.filter(r => r.estado !== 'success').length, alertas: errs.filter(r => r.workflow === 'health-monitor').map(r => `${r.created_at} ${r.error}`) };

// ---------- Configuración al cierre: la configuración final de red no cambia ----------
const cfgF = path.join(dir, 'configuracion_cierre.json');
if (fs.existsSync(cfgF)) {
  const c = JSON.parse(fs.readFileSync(cfgF, 'utf8').replace(/^﻿/, ''));
  const esp = { 'cowrie-proxy': ['127.0.0.1:2222->2222', '127.0.0.1:2323->2223'], n8n: ['127.0.0.1:5678->5678'] };
  const fallas = [];
  for (const sv of ['cowrie', 'cowrie-proxy', 'forwarder', 'log-reader', 'postgres', 'n8n']) {
    const x = c.servicios.find(y => y.servicio === sv);
    if (!x || x.estado !== 'running') { fallas.push(sv + ': no está corriendo'); continue; }
    const pub = [...x.publicados].sort().join(','), e = [...(esp[sv] || [])].sort().join(',');
    if (pub !== e) fallas.push(sv + ': puertos publicados ' + (pub || 'ninguno') + ' (esperado ' + (e || 'ninguno') + ')');
  }
  for (const r of ['captura', 'proceso', 'datos']) if (!(c.redes.find(y => y.red === r) || {}).internal) fallas.push('red ' + r + ': no es internal');
  out.configuracion_final = { fallas, cumple: fallas.length === 0 };
} else out.configuracion_final = { cumple: false, fallas: ['falta configuracion_cierre.json'] };

// ---------- Forwarder y Telegram (descriptivo) ----------
const fwF = path.join(dir, 'forwarder_resumen.json');
if (fs.existsSync(fwF)) {
  const f = JSON.parse(fs.readFileSync(fwF, 'utf8').replace(/^﻿/, ''));
  out.forwarder = { entregas_ok: f.entregas_ok, entregas_err: f.entregas_err, eventos_cowrie: log.length, telegram: f.telegram, nota: 'Sin umbral: se informa lo observado.' };
} else out.forwarder = { nota: 'falta forwarder_resumen.json' };

fs.writeFileSync(path.join(dir, 'resultados_r1.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

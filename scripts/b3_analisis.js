#!/usr/bin/env node
// Análisis de la validación B3 (registro previo: docs/PREREGISTRO_B3.md).
// Parte de scripts/b2_analisis.js; los cambios son los que enumera el registro previo (§4).
// Las definiciones de este archivo se fijaron ANTES de iniciar la ventana; su SHA-256
// figura en el registro previo. No modificar después del inicio.
// Uso, desde la raíz del repo:  node scripts/b3_analisis.js docs/evidencia/b3
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'docs/evidencia/b3';
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
const us = t => { const m = t.match(/^(\d{4}-\d\d-\d\d)[ T](\d\d:\d\d:\d\d)(?:\.(\d+))?(?:Z|\+00(?::00)?)?$/); if (!m) throw new Error('fecha ' + t);
  return BigInt(Date.parse(m[1] + 'T' + m[2] + 'Z')) * 1000n + BigInt(((m[3] || '') + '000000').slice(0, 6)); };
const iso = t => new Date(Number(us(t) / 1000n)).toISOString().slice(0, 23);
const wilson = (k, n, z = 1.96) => { if (!n) return [0, 0]; const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [100 * Math.max(0, c - h), 100 * Math.min(1, c + h)]; };
const pct = (k, n) => `${k}/${n} = ${(100 * k / (n || 1)).toFixed(1)} % (IC 95 % [${wilson(k, n).map(x => x.toFixed(1)).join('; ')}])`;
const stats = a => { const s = [...a].sort((x, y) => x - y), n = s.length, m = s.reduce((x, y) => x + y, 0) / n;
  return { n, media: +m.toFixed(2), mediana: +(n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2).toFixed(2), min: +s[0].toFixed(2), max: +s[n - 1].toFixed(2), de: +Math.sqrt(s.reduce((x, y) => x + (y - m) ** 2, 0) / (n - 1)).toFixed(2) }; };

const ventana = JSON.parse(fs.readFileSync(path.join(dir, 'ventana.json'), 'utf8'));
const events = csv('events.csv'), iocs = csv('iocs.csv'), ios = csv('ioc_sessions.csv'), reports = csv('reports.csv'), errs = csv('error_log.csv'), ejec = csv('ejecuciones.csv');
const log = fs.readFileSync(path.join(dir, 'cowrie_ventana.json'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const enVentana = t => us(t) >= us(ventana.inicio) && us(t) <= us(ventana.cierre);
const out = { ventana, conteos: {} };

// ---------- Integridad: captura = persistencia ----------
const k = (s, e, t) => `${s}|${e}|${t}`;
const A = {}, B = {};
for (const e of log) A[k(e.session, e.eventid, e.timestamp.slice(0, 23))] = (A[k(e.session, e.eventid, e.timestamp.slice(0, 23))] || 0) + 1;
for (const r of events) B[k(r.session, r.eventid, iso(r.timestamp))] = (B[k(r.session, r.eventid, iso(r.timestamp))] || 0) + 1;
let dif = 0; for (const x of new Set([...Object.keys(A), ...Object.keys(B)])) if (A[x] !== B[x]) dif++;
out.conteos = { eventos_cowrie: log.length, eventos_events: events.length, claves_distintas: dif, iocs: iocs.length, ioc_sessions: ios.length, reportes: reports.length, error_log: errs.length };

// ---------- P1: latencia de persistencia (created_at - timestamp) ----------
const lat = events.map(r => Number(us(r.created_at) - us(r.timestamp)) / 1000);
// Línea de base: B1 con los cinco participantes externos (mediana por evento del paso 1 = 10,36 s,
// docs/evidencia/b1/resultados_b1_externos.json). Se informa también la de los siete participantes (11,50 s).
const B1_EXT_MS = 10360, B1_TODOS_MS = 11500, media = lat.reduce((x, y) => x + y, 0) / (lat.length || 1);
out.P1 = { latencia_ms: stats(lat), eventos_sobre_15s: lat.filter(x => x > 15000).length,
  proporcion_de_b1_externos: (100 * media / B1_EXT_MS).toFixed(1) + ' %', proporcion_de_b1_todos: (100 * media / B1_TODOS_MS).toFixed(1) + ' %',
  umbral: 'media < 50 % de 10,36 s', cumple: lat.length > 0 && media < 0.5 * B1_EXT_MS };

// ---------- P2: criterio estricto por tipo + fidelidad con el log de Cowrie ----------
const REQ = { 'cowrie.login.success': ['username', 'password'], 'cowrie.login.failed': ['username', 'password'], 'cowrie.command.input': ['input'], 'cowrie.session.connect': ['src_ip', 'src_port'] };
const FIELDS = ['eventid', 'session', 'src_ip', 'src_port', 'username', 'password', 'input'];
const filled = v => v !== undefined && v !== null && String(v).trim() !== '';
const idx = {}; for (const e of log) (idx[k(e.session, e.eventid, e.timestamp.slice(0, 23))] ??= []).push(e);
let estricto = 0, fiel = 0;
for (const r of events) {
  if (filled(r.eventid) && filled(r.session) && filled(r.timestamp) && (REQ[r.eventid] || []).every(f => filled(r[f]))) estricto++;
  const e = (idx[k(r.session, r.eventid, iso(r.timestamp))] || [])[0];
  if (e && FIELDS.every(f => (r[f] ?? '').trim() === (e[f] === undefined || e[f] === null ? '' : String(e[f])))) fiel++;
}
out.P2 = { criterio_estricto: pct(estricto, events.length), fidelidad_con_cowrie: pct(fiel, events.length), umbral: '80 %', cumple: estricto / events.length >= 0.8 && fiel / events.length >= 0.8 };

// ---------- P3 (misma operacionalización que B2): completitud de extracción por sesión ----------
// Indicadores esperados de una sesión = los que las reglas del extractor (n8n/workflows/ioc-extractor.json)
// derivan del log de Cowrie de esa sesión: IP de cowrie.session.connect; usuario:contraseña de todo evento
// que la tenga; comandos que coinciden con el patrón; hashes SHA-256 del mensaje.
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
const exitosas = [...new Set(log.filter(e => e.eventid === 'cowrie.login.success').map(e => e.session))];
let completas = 0; const incompletas = [];
for (const s of exitosas) { const esp = esperados(s), o = obs[s] || new Set(); if ([...esp].every(x => o.has(x))) completas++; else incompletas.push({ session: s, faltan: [...esp].filter(x => !o.has(x)) }); }
// Continuidad con la operacionalización original (§4.9.3): fila en iocs atribuida por event_id
const evIdPorSesion = {}; for (const r of events) (evIdPorSesion[r.session] ??= new Set()).add(r.id);
const atribuidas = exitosas.filter(s => iocs.some(i => evIdPorSesion[s] && evIdPorSesion[s].has(i.event_id))).length;
const conComando = exitosas.filter(s => [...esperados(s)].some(x => x.startsWith('command|')));
out.P3 = { sesiones_exitosas: exitosas.length, completitud: pct(completas, exitosas.length), umbral: '70 %', cumple: completas / (exitosas.length || 1) >= 0.7,
  sesiones_con_comando_ioc: conComando.length, incompletas: incompletas.slice(0, 20),
  continuidad_event_id: pct(atribuidas, exitosas.length) };

// ---------- P3, calidad (secundaria, umbrales del registro previo §4) ----------
// a) Exactitud del catálogo: filas de iocs cuyo tipo|valor está entre los indicadores que las reglas
//    derivan del log de Cowrie de la ventana. b) Precisión de atribución: filas de ioc_sessions cuya
//    sesión está en el log y cuyo indicador está entre los esperados de ESA sesión.
const sesionesLog = [...new Set(log.map(e => e.session))];
const esperadosPor = Object.fromEntries(sesionesLog.map(s => [s, esperados(s)]));
const universo = new Set(sesionesLog.flatMap(s => [...esperadosPor[s]]));
const iocExactos = iocs.filter(i => universo.has(i.type + '|' + i.value));
let atribOk = 0; const atribMal = [];
for (const r of ios) { const i = iocById[r.ioc_id], key = i ? i.type + '|' + i.value : null;
  if (key && esperadosPor[r.session] && esperadosPor[r.session].has(key)) atribOk++; else if (atribMal.length < 20) atribMal.push({ session: r.session, ioc: key }); }
// c) Descriptivo: sesiones exitosas con al menos un indicador que aparece por primera vez en la ventana
//    (la novedad la determina sobre todo la rotación del simulador; sin veredicto).
const primeraVez = {}; for (const e of [...log].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))) for (const x of esperadosPor[e.session]) if (!(x in primeraVez)) primeraVez[x] = e.session;
const conNuevo = exitosas.filter(s => [...(esperadosPor[s] || [])].some(x => primeraVez[x] === s)).length;
const porHora = {}; for (const i of iocs) { const h = iso(i.created_at).slice(0, 13); porHora[h] = (porHora[h] || 0) + 1; }
out.P3_calidad = { exactitud_catalogo: pct(iocExactos.length, iocs.length), precision_atribucion: pct(atribOk, ios.length),
  umbral: 'ambas ≥ 95 %', cumple: iocs.length > 0 && ios.length > 0 && iocExactos.length / iocs.length >= 0.95 && atribOk / ios.length >= 0.95,
  no_exactos: iocs.filter(i => !universo.has(i.type + '|' + i.value)).slice(0, 20).map(i => i.type + '|' + i.value), atribuciones_no_esperadas: atribMal,
  descriptivo: { sesiones_exitosas_con_indicador_nuevo: pct(conNuevo, exitosas.length), iocs_nuevos_por_hora_utc: porHora } };

// ---------- P4: cobertura por reportes del cron diario de producción en modo trigger ----------
const rg = ejec.filter(r => r.workflow === 'report-generator' && enVentana(r.inicio));
const rgTrigger = rg.filter(r => r.modo === 'trigger' && r.estado === 'success');
const repTrigger = reports.filter(r => rgTrigger.some(x => Math.abs(Number(us(r.created_at) - us(x.inicio))) < 120e6));
const loginTs = s => log.filter(e => e.session === s && e.eventid === 'cowrie.login.success').map(e => e.timestamp)[0];
const cubiertas = exitosas.filter(s => repTrigger.some(r => us(loginTs(s)) >= us(r.period_start) && us(loginTs(s)) <= us(r.period_end))).length;
// Disparo de producción (0 8 * * *, America/Argentina/Mendoza): 11:00 UTC del 06/10/2026, con hasta 60 s de tolerancia.
const t08 = us('2026-10-06 11:00:00'), disparo08 = rgTrigger.filter(r => us(r.inicio) >= t08 && us(r.inicio) <= t08 + 60000000n);
const rep08 = reports.filter(r => disparo08.some(x => Math.abs(Number(us(r.created_at) - us(x.inicio))) < 120e6));
out.P4 = { ejecuciones_report_generator: rg.map(r => `${r.inicio} ${r.modo} ${r.estado}`), reportes_trigger: repTrigger.length,
  disparo_produccion_0800: disparo08.length === 1 && rg.length === 1, reporte_0800_guardado: rep08.length === 1,
  cobertura: pct(cubiertas, exitosas.length), umbral: 'un único disparo de report-generator, a las 08:00 ART en modo trigger y con reporte guardado; cobertura ≥ 90 %',
  cumple: disparo08.length === 1 && rg.length === 1 && rep08.length === 1 && cubiertas / (exitosas.length || 1) >= 0.9 };

// ---------- Ejecuciones manuales (deben ser cero) ----------
out.ejecuciones = { total: ejec.filter(r => enVentana(r.inicio)).length,
  manuales_extractor_o_reportes: ejec.filter(r => enVentana(r.inicio) && ['ioc-extractor', 'report-generator'].includes(r.workflow) && r.modo !== 'trigger').length,
  extractor: (() => { const x = ejec.filter(r => r.workflow === 'ioc-extractor' && enVentana(r.inicio)); return { n: x.length, error: x.filter(r => r.estado !== 'success').length, duracion_ms: x.length ? stats(x.map(r => +r.duracion_ms)) : null }; })() };

// ---------- health-monitor (secundario): alertas esperadas = 0 ----------
const hm = ejec.filter(r => r.workflow === 'health-monitor' && enVentana(r.inicio));
out.health_monitor = { ejecuciones: hm.length, en_error: hm.filter(r => r.estado !== 'success').length,
  alertas: errs.filter(r => r.workflow === 'health-monitor').map(r => `${r.created_at} ${r.error}`) };

fs.writeFileSync(path.join(dir, 'resultados_b3.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

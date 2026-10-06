#!/usr/bin/env node
// Análisis de la evaluación del reporte (plan: docs/PRUEBAS_EVALUACION_REPORTE.md, §5).
// Corrige las respuestas con docs/evidencia/evaluacion/respuestas_esperadas.json y calcula E1 a E4.
// Uso, desde la raíz del repo:  node experimentos/evaluacion_reporte/analisis.js [carpeta de resultados]
const fs = require('fs'), path = require('path');
const raiz = path.resolve(__dirname, '..', '..');
const ev = path.join(raiz, 'docs', 'evidencia', 'evaluacion');
const dir = process.argv[2] || path.join(ev, 'resultados');
const { esperadas } = JSON.parse(fs.readFileSync(path.join(ev, 'respuestas_esperadas.json'), 'utf8'));

const norm = s => String(s ?? '').trim().toLowerCase();
const numero = s => { const t = String(s ?? '').replace(/[.,\s]/g, ''); return /^\d+$/.test(t) ? Number(t) : NaN; };
const mediana = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const wilson = (k, n, z = 1.96) => { if (!n) return [0, 0]; const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [100 * Math.max(0, c - h), 100 * Math.min(1, c + h)]; };
const pct = (k, n) => `${k}/${n} = ${(100 * k / (n || 1)).toFixed(1)} % (IC 95 % [${wilson(k, n).map(x => x.toFixed(1)).join('; ')}])`;

function corregir(id, r) {
  const e = esperadas[id];
  if (id === 'U1' || id === 'U2') return r.esta_en_reporte === e.esta_en_reporte;
  if (id === 'L2') {
    const dado = new Set(String(r.comandos ?? '').split('\n').map(norm).filter(Boolean));
    const esp = new Set(e.comandos.map(norm));
    return dado.size === esp.size && [...esp].every(c => dado.has(c));
  }
  return Object.entries(e).every(([campo, v]) => typeof v === 'number' ? numero(r[campo]) === v : norm(r[campo]) === norm(v));
}

const archivos = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^evaluacion-P\d+\.json$/.test(f)).sort() : [];
if (!archivos.length) { console.error('No hay resultados en ' + dir); process.exit(1); }
const part = archivos.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const filas = [];
for (const p of part) for (const r of p.respuestas) filas.push({ codigo: p.codigo, orden: p.orden, id: r.id, ms: r.ms, ok: corregir(r.id, r.respuesta), respuesta: r.respuesta });

const R = filas.filter(f => /^R\d$/.test(f.id)), U = filas.filter(f => /^U\d$/.test(f.id)), L = filas.filter(f => /^L\d$/.test(f.id));
const porPregunta = {}; for (const f of filas) { const q = (porPregunta[f.id] ??= { correctas: 0, n: 0, ms: [] }); q.n++; if (f.ok) q.correctas++; q.ms.push(f.ms); }
const prom = p => { const c = p.cuestionario; return c ? media(['S1', 'S2', 'S3', 'S4'].map(k => c[k])) : null; };
const proms = part.map(prom).filter(x => x !== null);

const out = {
  participantes: part.map(p => ({ codigo: p.codigo, orden: p.orden, duracion_min: p.inicio && p.fin ? +((Date.parse(p.fin) - Date.parse(p.inicio)) / 60000).toFixed(1) : null })),
  E1_exactitud_R1_R6: { resultado: pct(R.filter(f => f.ok).length, R.length), umbral: '≥ 80 %', cumple: R.length > 0 && R.filter(f => f.ok).length / R.length >= 0.8 },
  E2_tiempo_R1_R6_s: { mediana: R.length ? +(mediana(R.map(f => f.ms)) / 1000).toFixed(1) : null, media: R.length ? +(media(R.map(f => f.ms)) / 1000).toFixed(1) : null, umbral: '≤ 60 s', cumple: R.length > 0 && mediana(R.map(f => f.ms)) / 1000 <= 60 },
  E3_reconocen_limites_U1_U2: { resultado: pct(U.filter(f => f.ok).length, U.length), umbral: '≥ 80 %', cumple: U.length > 0 && U.filter(f => f.ok).length / U.length >= 0.8 },
  E4_utilidad_percibida_S1_S4: { media_de_promedios: proms.length ? +media(proms).toFixed(2) : null, promedios: part.map(p => ({ codigo: p.codigo, promedio: prom(p) })), umbral: '≥ 4,0', cumple: proms.length > 0 && media(proms) >= 4 },
  descriptivo: {
    log_L1_L2: { resultado: pct(L.filter(f => f.ok).length, L.length), mediana_s: L.length ? +(mediana(L.map(f => f.ms)) / 1000).toFixed(1) : null },
    por_pregunta: Object.fromEntries(Object.entries(porPregunta).map(([k, q]) => [k, { correctas: `${q.correctas}/${q.n}`, mediana_s: +(mediana(q.ms) / 1000).toFixed(1) }])),
    R3_vs_L1_s: part.map(p => { const a = filas.find(f => f.codigo === p.codigo && f.id === 'R3'), b = filas.find(f => f.codigo === p.codigo && f.id === 'L1'); return { codigo: p.codigo, orden: p.orden, R3: a ? +(a.ms / 1000).toFixed(1) : null, L1: b ? +(b.ms / 1000).toFixed(1) : null }; }),
    S5_log_mas_util_que_reporte: part.map(p => p.cuestionario ? p.cuestionario.S5 : null),
    S1_a_S4_por_item: Object.fromEntries(['S1', 'S2', 'S3', 'S4'].map(k => [k, part.map(p => p.cuestionario ? p.cuestionario[k] : null)])),
    respuestas_incorrectas: filas.filter(f => !f.ok).map(f => `${f.codigo} ${f.id}: ${JSON.stringify(f.respuesta)}`),
    abiertas: part.map(p => ({ codigo: p.codigo, agregaria: p.cuestionario?.O1, sobra_o_confunde: p.cuestionario?.O2, dificil_del_log: p.cuestionario?.O3 })),
  },
};
fs.writeFileSync(path.join(ev, 'resultados_evaluacion.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));

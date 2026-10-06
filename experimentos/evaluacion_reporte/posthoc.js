#!/usr/bin/env node
// Observaciones POST HOC de la evaluación del reporte: se definieron DESPUÉS de ver los resultados y no tienen umbral
// ni modifican ningún veredicto de analisis.js (plan: docs/PRUEBAS_EVALUACION_REPORTE.md). Uso, desde la raíz del repo:
//   node experimentos/evaluacion_reporte/posthoc.js
const fs = require('fs'), path = require('path');
const ev = path.join(__dirname, '..', '..', 'docs', 'evidencia', 'evaluacion');
const { esperadas } = JSON.parse(fs.readFileSync(path.join(ev, 'respuestas_esperadas.json'), 'utf8'));
const dir = path.join(ev, 'resultados');
const part = fs.readdirSync(dir).filter(f => /^evaluacion-P\d+\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const norm = s => String(s ?? '').trim().toLowerCase();
const mediana = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const out = { L1: [], L2: [], tiempos_R1_R6_s: [] };
for (const p of part) {
  const l1 = p.respuestas.find(r => r.id === 'L1').respuesta, l2 = p.respuestas.find(r => r.id === 'L2').respuesta;
  out.L1.push({ codigo: p.codigo, usuario_correcto: norm(l1.usuario) === norm(esperadas.L1.usuario), password_correcta: norm(l1.password) === norm(esperadas.L1.password),
    password_sin_signos_finales_correcta: norm(l1.password).replace(/[^\p{L}\p{N}]+$/u, '') === norm(esperadas.L1.password).replace(/[^\p{L}\p{N}]+$/u, ''), password_dada: l1.password });
  const dados = new Set(String(l2.comandos ?? '').split('\n').map(norm).filter(Boolean));
  out.L2.push({ codigo: p.codigo, comandos_esperados_encontrados: esperadas.L2.comandos.filter(c => dados.has(norm(c))).length + '/' + esperadas.L2.comandos.length, comandos_de_mas: [...dados].filter(c => !esperadas.L2.comandos.map(norm).includes(c)).length });
  for (const r of p.respuestas) if (/^R\d$/.test(r.id)) out.tiempos_R1_R6_s.push(r.ms / 1000);
}
const t = out.tiempos_R1_R6_s;
out.resumen = {
  L1_usuario_correcto: out.L1.filter(x => x.usuario_correcto).length + '/' + out.L1.length,
  L1_password_correcta_estricta: out.L1.filter(x => x.password_correcta).length + '/' + out.L1.length,
  L1_password_correcta_ignorando_signos_finales: out.L1.filter(x => x.password_sin_signos_finales_correcta).length + '/' + out.L1.length,
  R1_R6_respuestas_con_mas_de_200_s: t.filter(x => x > 200).length + '/' + t.length,
  R1_R6_media_sin_esas_respuestas_s: +(t.filter(x => x <= 200).reduce((a, b) => a + b, 0) / t.filter(x => x <= 200).length).toFixed(1),
  R1_R6_mediana_s: +mediana(t).toFixed(1),
};
delete out.tiempos_R1_R6_s;
fs.writeFileSync(path.join(ev, 'posthoc.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));

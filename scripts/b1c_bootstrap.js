// Intervalo de confianza (bootstrap percentil, 10.000 remuestreos con semilla fija) de la mediana del paso 1 de B1c.
// Se remuestrean PARTICIPANTES con reemplazo; el estadístico es el de B1: mediana por evento entre participantes y luego mediana de los 20 eventos.
// Uso: node scripts/b1c_bootstrap.js docs/evidencia/b1c/resultados [latencia_media_s ...]
const fs = require('fs'), path = require('path');
const dir = process.argv[2], lat = process.argv.slice(3).map(Number);
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const P = fs.readdirSync(dir).filter(f => /^linea-base-P\d+\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).respuestas.filter(r => !r.practica).map(r => r.ms_paso1 / 1000));
const stat = idx => med(Array.from({ length: 20 }, (_, e) => med(idx.map(i => P[i][e]))));
let s = 20260930; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const B = Array.from({ length: 10000 }, () => stat(Array.from({ length: P.length }, () => Math.floor(rnd() * P.length)))).sort((a, b) => a - b);
const q = p => B[Math.floor(p * (B.length - 1))];
const pt = stat(P.map((_, i) => i));
console.log(JSON.stringify({ participantes: P.length, mediana_paso1_s: +pt.toFixed(2), ic95_s: [+q(0.025).toFixed(2), +q(0.975).toFixed(2)], reduccion_P1: lat.map(l => ({ latencia_s: l, punto: +(100 * (1 - l / pt)).toFixed(1), ic95: [+(100 * (1 - l / q(0.025))).toFixed(1), +(100 * (1 - l / q(0.975))).toFixed(1)] })) }, null, 1));

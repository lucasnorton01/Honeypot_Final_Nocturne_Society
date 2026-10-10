#!/usr/bin/env node
// Muestra de la validación R1 (registro previo: docs/PREREGISTRO_R1.md).
// Elige N sesiones del período 2024 del dataset de Wang et al. (2025), con una semilla fija, y para cada una
// obtiene, de los registros crudos de Cowrie del propio dataset, las credenciales del primer login exitoso de su
// dirección de origen y la demora original entre comandos. No usa la red.
// Uso:  node scripts/r1_muestra.js <carpeta del dataset> <N> <semilla> <carpeta de salida>
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const [DS, NS, SEM, OUT] = [process.argv[2], process.argv[3], process.argv[4], process.argv[5]];
if (!DS || !NS || !SEM || !OUT) { console.error('uso: node r1_muestra.js <dataset> <N> <semilla> <salida>'); process.exit(1); }
const N = +NS, SEED = +SEM, PILOTO = 5;
const MAX_CMDS = 30, MAX_LEN = 500, DEMORA_MIN = 0.3, DEMORA_MAX = 5.0, DEMORA_INICIAL = 1.0;
const SIMPLE = /^[A-Za-z0-9._@%+=,-]{1,32}$/;   // credenciales que userdb.txt de Cowrie interpreta sin ambigüedad

const sesFile = path.join(DS, 'dataset', 'sessions', '2024.jsonl');
const S = fs.readFileSync(sesFile, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const porIp = new Map(S.map(s => [s.src_ip, s]));

// 1) Registros crudos de 2024: primer login exitoso y comandos con su marca de tiempo, por dirección de origen
const info = new Map();
const dir = path.join(DS, '2024', 'cowrie');
for (const f of fs.readdirSync(dir).filter(x => /^(ssh|telnet)_\d\d_\d\d\.json$/.test(x)).sort()) {
  for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    if (!l) continue;
    let tipo = null;
    if (l.includes('"info": "userlogin"') && l.includes(' succeeded')) tipo = 'login';
    else if (l.includes('"info": "command.input"')) tipo = 'cmd';
    else continue;
    let o; try { o = JSON.parse(l); } catch { continue; }
    if (!porIp.has(o.src_host)) continue;
    let r = info.get(o.src_host); if (!r) { r = { login: null, cmds: [], protos: new Set() }; info.set(o.src_host, r); }
    r.protos.add(String(o.protocol));
    if (tipo === 'login') { if (!r.login) { const m = String(o.tshark).match(/\[b'(.*)'\/b'(.*)'\] succeeded/); if (m) r.login = { user: m[1], pass: m[2] }; } }
    else r.cmds.push([Date.parse(o.timestamp.replace(' ', 'T') + 'Z'), String(o.tshark)]);
  }
}
// Texto de un comando a partir de la representación de bytes de Python que usa el log crudo
const desescapar = t => { const m = t.match(/command  found \[ b(['"])([^]*)\1\s*\]$/); if (!m) return t;   // en los registros de Telnet el comando viene como texto plano
  return m[2].replace(/\\x([0-9a-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\'/g, "'").replace(/\\\\/g, '\\'); };

// 2) Criterios de elegibilidad
const desc = { total_2024: S.length, sin_registro_crudo: 0, comandos_fuera_de_rango: 0, caracteres_de_control_o_no_ascii: 0, comando_largo: 0, sin_credencial_simple: 0 };
const elegibles = [];
for (const s of S) {
  const r = info.get(s.src_ip);
  if (!r) { desc.sin_registro_crudo++; continue; }
  if (s.command_count < 1 || s.command_count > MAX_CMDS || s.commands.length !== s.command_count) { desc.comandos_fuera_de_rango++; continue; }
  if (s.commands.some(c => /[\x00-\x1f\x7f]/.test(c) || /[^\x00-\x7f]/.test(c))) { desc.caracteres_de_control_o_no_ascii++; continue; }
  if (s.commands.some(c => c.length > MAX_LEN || c.trim() === '')) { desc.comando_largo++; continue; }
  if (!r.login || !SIMPLE.test(r.login.user) || !SIMPLE.test(r.login.pass)) { desc.sin_credencial_simple++; continue; }
  elegibles.push(s);
}
desc.elegibles = elegibles.length;

// 3) Orden aleatorio con semilla fija (mulberry32 + Fisher-Yates) sobre las elegibles ordenadas por session_id
const mulberry32 = a => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rnd = mulberry32(SEED);
const orden = [...elegibles].sort((a, b) => (a.session_id < b.session_id ? -1 : 1));
for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
const muestra = orden.slice(0, N), piloto = orden.slice(N, N + PILOTO);

// 4) Registro de cada sesión: credenciales, comandos y demoras
let conTiempo = 0, totalCmds = 0;
const reg = (s, i) => {
  const r = info.get(s.src_ip);
  const primero = new Map();
  for (const [t, x] of r.cmds) { const c = desescapar(x); if (c !== null && !primero.has(c.trim())) primero.set(c.trim(), t); }
  const demoras = s.commands.map((c, k) => {
    totalCmds++;
    if (k === 0) return DEMORA_INICIAL;
    const a = primero.get(s.commands[k - 1].trim()), b = primero.get(c.trim());
    if (a === undefined || b === undefined) return DEMORA_INICIAL;
    conTiempo++;
    return Math.round(Math.min(Math.max((b - a) / 1000, DEMORA_MIN), DEMORA_MAX) * 1000) / 1000;
  });
  return { idx: i + 1, session_id: s.session_id, user: r.login.user, pass: r.login.pass, protocolo_original: [...r.protos].sort().join('+'), comandos: s.commands, demoras_s: demoras, tecnicas: s.attack_techniques };
};
const wr = (f, a) => fs.writeFileSync(path.join(OUT, f), a.map(x => JSON.stringify(x)).join('\n') + '\n');
fs.mkdirSync(OUT, { recursive: true });
const M = muestra.map(reg), P = piloto.map((s, i) => reg(s, i));
wr('muestra_r1.jsonl', M); wr('piloto_r1.jsonl', P);

// 5) Cuentas que Cowrie debe aceptar (formato de userdb.txt) y metadatos
const cuentas = [...new Set([...M, ...P].map(x => `${x.user}:x:${x.pass}`))].sort();
fs.writeFileSync(path.join(OUT, 'userdb_r1_agregado.txt'), cuentas.join('\n') + '\n');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let commit = ''; try { commit = execFileSync('git', ['-C', DS, 'rev-parse', 'HEAD']).toString().trim(); } catch {}
const meta = { dataset: 'Wang et al. (2025), shell-attack-evolution-dataset (CC BY 4.0)', commit_dataset: commit, archivo_sesiones: 'dataset/sessions/2024.jsonl', sha256_sesiones: sha(sesFile),
  semilla: SEED, N: M.length, piloto: P.length, criterios: { max_comandos: MAX_CMDS, max_longitud: MAX_LEN, credencial: String(SIMPLE), demora_min_s: DEMORA_MIN, demora_max_s: DEMORA_MAX, demora_inicial_s: DEMORA_INICIAL },
  descartes: desc, comandos_muestra: M.reduce((a, x) => a + x.comandos.length, 0), comandos_con_demora_original: conTiempo, comandos_total_reg: totalCmds,
  protocolo_original: M.reduce((a, x) => (a[x.protocolo_original] = (a[x.protocolo_original] || 0) + 1, a), {}),
  suma_demoras_s: Math.round(M.reduce((a, x) => a + x.demoras_s.reduce((p, q) => p + q, 0), 0)), comandos_max_por_sesion: Math.max(...M.map(x => x.comandos.length)),
  cuentas_distintas: cuentas.length, sha256_muestra: sha(path.join(OUT, 'muestra_r1.jsonl')), sha256_piloto: sha(path.join(OUT, 'piloto_r1.jsonl')) };
fs.writeFileSync(path.join(OUT, 'muestra_r1_meta.json'), JSON.stringify(meta, null, 2) + '\n');
console.log(JSON.stringify(meta, null, 2));

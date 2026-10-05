// Prueba de carga del webhook de event-ingest (docs/PRUEBAS_SQL_CARGA.md).
// Envía eventos sintéticos con el formato del forwarder, por escalones de eventos por segundo.
// Uso, desde el anfitrión con el stack levantado:  node experimentos/prueba_carga.js > resultado.json
const URL = 'http://127.0.0.1:5678/webhook/cowrie';
const ESCALONES = [1, 2, 5, 10, 20, 50], POR_ESCALON = 120;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const iso = d => d.toISOString().replace('Z', '000Z'); // microsegundos, como Cowrie

async function escalon(tasa) {
  const res = { tasa, enviados: 0, aceptados: 0, rechazados: 0, inicio: new Date().toISOString() };
  const pendientes = [];
  const t0 = Date.now();
  for (let i = 0; i < POR_ESCALON; i++) {
    const objetivo = t0 + (i * 1000) / tasa; const espera = objetivo - Date.now(); if (espera > 0) await dormir(espera);
    const login = i % 2 === 1;
    const ev = { eventid: login ? 'cowrie.login.failed' : 'cowrie.session.connect', session: `carga-${tasa}-${String(i).padStart(3, '0')}`,
      src_ip: `10.99.${tasa}.${(i % 250) + 1}`, src_port: 40000 + i, timestamp: iso(new Date()), sensor: 'prueba-carga',
      ...(login ? { username: 'carga', password: 'carga' } : {}) };
    res.enviados++;
    pendientes.push(fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev) })
      .then(r => { if (r.ok) res.aceptados++; else res.rechazados++; }).catch(() => res.rechazados++));
  }
  await Promise.all(pendientes);
  res.fin = new Date().toISOString(); res.duracion_s = (Date.now() - t0) / 1000;
  return res;
}

(async () => {
  const out = [];
  for (const t of ESCALONES) { out.push(await escalon(t)); console.error(JSON.stringify(out[out.length - 1])); await dormir(30000); }
  console.log(JSON.stringify(out, null, 2));
})();

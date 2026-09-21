const { DatabaseSync } = require('node:sqlite');
const dbPath = process.argv[2] || '/home/node/.n8n/database.sqlite';
console.log('## Base:', dbPath);
const db = new DatabaseSync(dbPath);

const resumen = db.prepare(`
  SELECT w.name AS workflow, e.mode AS modo, count(*) AS cantidad,
         min(e.startedAt) AS primera, max(e.startedAt) AS ultima
  FROM execution_entity e
  LEFT JOIN workflow_entity w ON w.id = e.workflowId
  GROUP BY w.name, e.mode
  ORDER BY w.name, e.mode
`).all();
console.log('\n## RESUMEN (workflow / modo / cantidad / primera / ultima)');
for (const r of resumen) console.log([r.workflow, r.modo, r.cantidad, r.primera, r.ultima].join('\t'));

const detalle = db.prepare(`
  SELECT e.id, w.name AS workflow, e.mode AS modo, e.status, e.finished,
         e.startedAt, e.stoppedAt
  FROM execution_entity e
  LEFT JOIN workflow_entity w ON w.id = e.workflowId
  ORDER BY e.startedAt ASC
`).all();
console.log('\n## DETALLE (id / workflow / modo / status / finished / startedAt / stoppedAt)');
for (const r of detalle) console.log([r.id, r.workflow, r.modo, r.status, r.finished, r.startedAt, r.stoppedAt].join('\t'));

const tot = db.prepare('SELECT count(*) AS n, min(startedAt) AS desde, max(startedAt) AS hasta FROM execution_entity').get();
console.log('\n## TOTAL', tot.n, 'ejecuciones, desde', tot.desde, 'hasta', tot.hasta);
db.close();

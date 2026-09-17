const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

// Read the fixed workflow JSON
const fixedWf = JSON.parse(fs.readFileSync('C:\\Users\\lnorton\\Desktop\\Tesis 15 Septiembre\\Honeypot_Final_Nocturne_Society-main\\n8n\\workflows\\report-generator-fixed.json', 'utf8'));

// Open in READ-WRITE mode (default, no readOnly flag)
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db_fix.sqlite', { open: true });

// Check current state
const current = db.prepare("SELECT id, name, active, nodes FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
console.log('BEFORE:');
console.log('  active:', current.active);
const oldNodes = JSON.parse(current.nodes);
console.log('  nodes:', oldNodes.map(function(n) { return n.name; }).join(', '));

// Update the workflow nodes and connections
const newNodes = JSON.stringify(fixedWf.nodes);
const newConnections = JSON.stringify(fixedWf.connections);

const update = db.prepare(
  "UPDATE workflow_entity SET nodes = ?, connections = ? WHERE id = 'wf-report-generator-0003'"
);
const result = update.run(newNodes, newConnections);
console.log('\nUPDATE result:', result.changes, 'rows changed');

// Verify
const updated = db.prepare("SELECT nodes, connections FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
const verifyNodes = JSON.parse(updated.nodes);
console.log('\nAFTER:');
console.log('  nodes:', verifyNodes.map(function(n) { return n.name; }).join(', '));

// Check if country/ips_por_pais references are gone
const queryNode = verifyNodes.find(function(n) { return n.name === 'Postgres: Datos del reporte'; });
if (queryNode && queryNode.parameters.query.indexOf('country') >= 0) {
  console.log('  WARNING: country reference still present in query!');
} else {
  console.log('  country reference removed from query.');
}

// Check the Code node
const codeNode = verifyNodes.find(function(n) { return n.name === 'Ensamblar Reporte'; });
if (codeNode && codeNode.parameters.jsCode.indexOf('ips_por_pais') >= 0) {
  console.log('  WARNING: ips_por_pais reference still present in Code node!');
} else {
  console.log('  ips_por_pais reference removed from Code node.');
}

db.close();
console.log('\nDone. Database updated successfully.');

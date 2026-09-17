const { DatabaseSync } = require('node:sqlite');

// Read the fixed workflow JSON
const fs = require('fs');
const fixedWf = JSON.parse(fs.readFileSync('C:\\Users\\lnorton\\Desktop\\Tesis 15 Septiembre\\Honeypot_Final_Nocturne_Society-main\\n8n\\workflows\\report-generator-fixed.json', 'utf8'));

// Open the n8n database (the one inside the container volume)
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db2.sqlite', { open: true });

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

const manual = verifyNodes.find(function(n) { return n.type === 'n8n-nodes-base.executeWorkflowTrigger'; });
if (manual) {
  console.log('  WARNING: Manual trigger still present!');
} else {
  console.log('  Manual trigger removed successfully.');
}

db.close();
console.log('\nDone. Restart n8n to apply changes.');

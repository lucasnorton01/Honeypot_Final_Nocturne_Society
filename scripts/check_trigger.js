const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Check ioc-extractor Manual trigger
const wf1 = db.prepare("SELECT nodes FROM workflow_entity WHERE id = 'wf-ioc-extractor-0002'").get();
const nodes1 = JSON.parse(wf1.nodes);
const manual1 = nodes1.find(function(n) { return n.type === 'n8n-nodes-base.executeWorkflowTrigger'; });
if (manual1) {
  console.log('ioc-extractor Manual trigger:');
  console.log(JSON.stringify(manual1, null, 2));
} else {
  console.log('No executeWorkflowTrigger in ioc-extractor');
  nodes1.forEach(function(n) { console.log('  ' + n.name + ' -> ' + n.type); });
}

// Check report-generator Manual trigger
console.log('\n---');
const wf2 = db.prepare("SELECT nodes FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
const nodes2 = JSON.parse(wf2.nodes);
const manual2 = nodes2.find(function(n) { return n.type === 'n8n-nodes-base.executeWorkflowTrigger'; });
if (manual2) {
  console.log('report-generator Manual trigger:');
  console.log(JSON.stringify(manual2, null, 2));
}

db.close();

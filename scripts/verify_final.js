const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db3.sqlite', { open: true, readOnly: true });

// Check workflow status
try {
  const wf = db.prepare("SELECT id, name, active, nodes FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
  console.log('report-generator: active=' + wf.active);
  const nodes = JSON.parse(wf.nodes);
  console.log('nodes:', nodes.map(function(n) { return n.name; }).join(', '));
} catch(e) {
  console.log('Error:', e.message);
}

// Check for API keys
try {
  const keys = db.prepare('SELECT * FROM user_api_keys').all();
  console.log('\nAPI KEYS:', keys.length);
  keys.forEach(function(k) {
    console.log('  ID=' + k.id + ' | label=' + k.label + ' | prefix=' + (k.apiKey ? k.apiKey.substring(0, 10) : 'N/A'));
  });
} catch(e) {
  console.log('API keys error:', e.message);
}

// Check all workflows
try {
  const wfs = db.prepare('SELECT id, name, active FROM workflow_entity').all();
  console.log('\nALL WORKFLOWS:');
  wfs.forEach(function(w) {
    console.log('  ' + w.id + ' | ' + w.name + ' | active=' + w.active);
  });
} catch(e) {
  console.log('Error:', e.message);
}

// Check latest executions (last 5 across all workflows)
try {
  const execs = db.prepare(
    "SELECT e.id, e.workflowId, e.mode, e.status, e.startedAt " +
    "FROM execution_entity e ORDER BY e.startedAt DESC LIMIT 5"
  ).all();
  console.log('\nLATEST 5 EXECUTIONS:');
  execs.forEach(function(e) {
    console.log('  ID=' + e.id + ' | wf=' + e.workflowId + ' | mode=' + e.mode + ' | status=' + e.status + ' | started=' + e.startedAt);
  });
} catch(e) {
  console.log('Error:', e.message);
}

db.close();

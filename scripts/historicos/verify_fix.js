const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db2.sqlite', { open: true, readOnly: true });

// Check workflow status
try {
  const wf = db.prepare("SELECT id, name, active FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
  console.log('report-generator: active=' + wf.active);
} catch(e) {
  console.log('Error:', e.message);
}

// Check latest executions for report-generator
try {
  const execs = db.prepare(
    "SELECT e.id, e.workflowId, e.mode, e.status, e.startedAt " +
    "FROM execution_entity e WHERE e.workflowId = 'wf-report-generator-0003' " +
    "ORDER BY e.startedAt DESC LIMIT 5"
  ).all();
  console.log('\nreport-generator executions (last 5):');
  execs.forEach(function(e) {
    console.log('  ID=' + e.id + ' | mode=' + e.mode + ' | status=' + e.status + ' | started=' + e.startedAt);
  });
} catch(e) {
  console.log('Error:', e.message);
}

// Check if the fixed workflow has the correct nodes
try {
  const wf = db.prepare("SELECT nodes FROM workflow_entity WHERE id = 'wf-report-generator-0003'").get();
  const nodes = JSON.parse(wf.nodes);
  console.log('\nWorkflow nodes:');
  nodes.forEach(function(n) {
    console.log('  ' + n.name + ' (' + n.type + ')');
  });
  
  // Check if Manual trigger is gone
  const manual = nodes.find(function(n) { return n.type === 'n8n-nodes-base.executeWorkflowTrigger'; });
  if (manual) {
    console.log('\nWARNING: Manual trigger still present!');
  } else {
    console.log('\nManual trigger removed successfully.');
  }
} catch(e) {
  console.log('Error:', e.message);
}

db.close();

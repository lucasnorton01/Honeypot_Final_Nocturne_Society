const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Check if the error is in the workflowPublishedVersion table too
try {
  const pubs = db.prepare(
    "SELECT id, workflowId, versionId FROM workflow_published_version WHERE workflowId = 'wf-report-generator-0003'"
  ).all();
  console.log('Published versions of report-generator:', pubs.length);
  pubs.forEach(function(p) {
    console.log('  versionId=' + p.versionId);
  });
} catch(e) {
  console.log('Error:', e.message);
}

// Check the full workflow_entity record for report-generator
try {
  const wf = db.prepare(
    "SELECT id, name, active, versionId FROM workflow_entity WHERE id = 'wf-report-generator-0003'"
  ).get();
  console.log('Workflow record:', JSON.stringify(wf));
} catch(e) {
  console.log('Error:', e.message);
}

// Check ioc-extractor's published version too
try {
  const pubs = db.prepare(
    "SELECT id, workflowId, versionId FROM workflow_published_version WHERE workflowId = 'wf-ioc-extractor-0002'"
  ).all();
  console.log('\nioc-extractor published versions:', pubs.length);
} catch(e) {
  console.log('Error:', e.message);
}

db.close();

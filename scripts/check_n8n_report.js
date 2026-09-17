const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Check ALL executions for report-generator
try {
  const execs = db.prepare(
    "SELECT e.id, e.workflowId, e.mode, e.status, e.startedAt, e.stoppedAt " +
    "FROM execution_entity e WHERE e.workflowId = 'wf-report-generator-0003' " +
    "ORDER BY e.startedAt DESC"
  ).all();
  console.log('EJECUCIONES de report-generator: ' + execs.length);
  execs.forEach(function(e) {
    console.log('  ID=' + e.id + ' | mode=' + e.mode + ' | status=' + e.status + ' | started=' + e.startedAt);
  });
} catch(e) {
  console.log('Error:', e.message);
}

// Check ioc-extractor executions
try {
  const execs = db.prepare(
    "SELECT e.id, e.workflowId, e.mode, e.status, e.startedAt " +
    "FROM execution_entity e WHERE e.workflowId = 'wf-ioc-extractor-0002' " +
    "ORDER BY e.startedAt DESC LIMIT 10"
  ).all();
  console.log('\nEJECUCIONES de ioc-extractor (ultimas 10): ' + execs.length);
  execs.forEach(function(e) {
    console.log('  ID=' + e.id + ' | mode=' + e.mode + ' | status=' + e.status + ' | started=' + e.startedAt);
  });
} catch(e) {
  console.log('Error:', e.message);
}

// Check users table structure
try {
  const cols = db.prepare("PRAGMA table_info(user)").all();
  console.log('\nUSER TABLE COLUMNS:');
  cols.forEach(function(c) { console.log('  ' + c.name + ' (' + c.type + ')'); });
  const users = db.prepare('SELECT * FROM user').all();
  console.log('\nUSERS:');
  users.forEach(function(u) { console.log('  ' + JSON.stringify(u)); });
} catch(e) {
  console.log('Error:', e.message);
}

// Check if owner user exists for API key
try {
  const settings = db.prepare("SELECT key, value FROM settings WHERE key LIKE '%api%' OR key LIKE '%owner%' OR key LIKE '%user%'").all();
  console.log('\nSETTINGS (api/owner/user):');
  settings.forEach(function(s) { console.log('  ' + s.key + ' = ' + (s.value ? s.value.substring(0, 100) : 'NULL')); });
} catch(e) {
  console.log('Error:', e.message);
}

db.close();

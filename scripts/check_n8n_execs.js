const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Executions
try {
  const execs = db.prepare(
    "SELECT e.id, e.workflowId, e.mode, e.status, e.startedAt, e.stoppedAt " +
    "FROM execution_entity e ORDER BY e.startedAt DESC LIMIT 20"
  ).all();
  console.log('ULTIMAS 20 EJECUCIONES:');
  execs.forEach(function(e) {
    console.log('  ID=' + e.id + ' | wf=' + e.workflowId + ' | mode=' + e.mode + ' | status=' + e.status + ' | started=' + e.startedAt);
  });
} catch(e) {
  console.log('Error execution_entity:', e.message);
}

// Users
try {
  const users = db.prepare('SELECT id, email, role FROM user').all();
  console.log('\nUSERS:');
  users.forEach(function(u) {
    console.log('  ID=' + u.id + ' | email=' + u.email + ' | role=' + u.role);
  });
} catch(e) {
  console.log('Error user:', e.message);
}

db.close();

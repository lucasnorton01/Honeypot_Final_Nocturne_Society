const { DatabaseSync } = require('node:sqlite');
const path = 'C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite';

try {
  const db = new DatabaseSync(path, { open: true, readOnly: true });
  
  // List tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('TABLAS:', tables.map(t => t.name).join(', '));
  console.log();
  
  // List workflows
  try {
    const workflows = db.prepare('SELECT id, name, active FROM workflow_entity').all();
    console.log('WORKFLOWS:');
    workflows.forEach(w => console.log('  ID=' + w.id + ' | name=' + w.name + ' | active=' + w.active));
  } catch(e) {
    console.log('workflow_entity error:', e.message);
  }
  
  // List credentials
  try {
    const creds = db.prepare('SELECT id, name, type FROM credentials_entity').all();
    console.log('\nCREDENTIALS:');
    creds.forEach(c => console.log('  ID=' + c.id + ' | name=' + c.name + ' | type=' + c.type));
  } catch(e) {
    console.log('credentials_entity error:', e.message);
  }
  
  db.close();
} catch(e) {
  console.log('Error:', e.message);
}

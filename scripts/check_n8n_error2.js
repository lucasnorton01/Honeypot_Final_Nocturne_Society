const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Get raw execution data
try {
  const rows = db.prepare(
    "SELECT executionId, length(data) as dataLen, substr(data, 1, 2000) as dataPreview FROM execution_data WHERE executionId = 19"
  ).all();
  console.log('EXECUTION_DATA rows for ID=19:', rows.length);
  rows.forEach(function(r) {
    console.log('  executionId:', r.executionId);
    console.log('  data length:', r.dataLen);
    console.log('  data preview:', r.dataPreview);
  });
} catch(e) {
  console.log('Error execution_data:', e.message);
}

// Check all execution_data table structure
try {
  const cols = db.prepare("PRAGMA table_info(execution_data)").all();
  console.log('\nEXECUTION_DATA COLUMNS:');
  cols.forEach(function(c) { console.log('  ' + c.name + ' (' + c.type + ')'); });
} catch(e) {
  console.log('Error PRAGMA:', e.message);
}

// Check execution_entity for the full record
try {
  const exec = db.prepare(
    "SELECT * FROM execution_entity WHERE id = 19"
  ).get();
  console.log('\nEXECUTION_ENTITY ID=19:');
  if (exec) {
    Object.keys(exec).forEach(function(k) {
      const v = exec[k];
      const preview = typeof v === 'string' ? v.substring(0, 200) : v;
      console.log('  ' + k + ':', preview);
    });
  }
} catch(e) {
  console.log('Error execution_entity:', e.message);
}

db.close();

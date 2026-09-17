const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\lnorton\\AppData\\Local\\Temp\\n8n_db.sqlite', { open: true, readOnly: true });

// Get execution data for the failed report-generator execution
try {
  const execData = db.prepare(
    "SELECT executionId, data FROM execution_data WHERE executionId = 19"
  ).get();
  if (execData) {
    console.log('EXECUTION DATA (ID=19):');
    const data = JSON.parse(execData.data);
    // Look for error information
    if (data && data.resultData) {
      console.log('  lastNodeExecuted:', data.resultData.lastNodeExecuted);
      if (data.resultData.error) {
        console.log('  ERROR:', JSON.stringify(data.resultData.error).substring(0, 500));
      }
      if (data.resultData.runData) {
        const nodes = Object.keys(data.resultData.runData);
        console.log('  Nodes executed:', nodes.join(', '));
        nodes.forEach(function(nodeName) {
          const runs = data.resultData.runData[nodeName];
          if (runs && runs.length > 0) {
            runs.forEach(function(run, idx) {
              if (run.error) {
                console.log('  [' + nodeName + '] ERROR:', JSON.stringify(run.error).substring(0, 300));
              }
              if (run.data && run.data.main) {
                console.log('  [' + nodeName + '] data: (present, ' + JSON.stringify(run.data.main).length + ' chars)');
              }
            });
          }
        });
      }
    }
  } else {
    console.log('No execution_data found for ID=19');
  }
} catch(e) {
  console.log('Error:', e.message);
}

// Also check if there are any errors in the event log
try {
  const logs = db.prepare(
    "SELECT * FROM execution_metadata WHERE executionId = 19"
  ).all();
  console.log('\nEXECUTION METADATA:');
  logs.forEach(function(l) { console.log('  ' + JSON.stringify(l).substring(0, 200)); });
} catch(e) {
  // metadata table might not exist
}

db.close();

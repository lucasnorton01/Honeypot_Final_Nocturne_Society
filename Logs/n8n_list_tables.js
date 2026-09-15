// List tables in n8n database
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/home/node/.n8n/database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
});

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Tables in database:');
  tables.forEach((table, i) => {
    console.log(` ${i + 1}. ${table.name}`);
  });
  
  db.close();
});
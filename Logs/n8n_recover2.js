// n8n_recover2.js - Read n8n users from SQLite
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/home/node/.n8n/database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  
  db.all('SELECT id, email, password FROM users', (err, rows) => {
    if (err) {
      console.error('Query error:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('\\n--- Users ---');
    rows.forEach((row, i) => {
      console.log(`User ${i + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Password hash: ${row.password}`);
    });
    
    db.close();
    console.log('\\nDatabase closed');
  });
});
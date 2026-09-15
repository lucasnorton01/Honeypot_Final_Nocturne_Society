// n8n_recover3.js - List all tables and find user data
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/home/node/.n8n/database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error listing tables:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('\\n--- Tables ---');
    tables.forEach((table, i) => {
      console.log(` ${i + 1}. ${table.name}`);
    });
    
    // Try to find any table with user-related data
    const userTable = tables.find(t => /user/i.test(t.name));
    if (userTable) {
      console.log(`\\nFound potential user table: ${userTable.name}`);
      db.all(`SELECT * FROM ${userTable.name}`, (err2, rows) => {
        console.log('\\n--- Data ---');
        console.log(JSON.stringify(rows, null, 2));
        db.close();
      });
    } else {
      console.log('\\nNo user table found. Checking all tables for content...');
      // Try each table
      tables.slice(0, 5).forEach((table, i) => {
        console.log(`\\n--- Table ${table.name} ---`);
        db.all(`SELECT * FROM ${table.name} LIMIT 3`, (err3, rows3) => {
          if (err3) console.log('Error:', err3);
          else console.log(JSON.stringify(rows3, null, 2));
          if (i >= tables.length - 1) db.close();
        });
      });
    }
  });
});
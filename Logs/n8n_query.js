const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.serialize(() => {
  db.each((err, row) => {
    console.log(row);
  }, 'SELECT * FROM users');
  
  // List tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    console.log('Tables:', tables);
    db.close();
  });
});
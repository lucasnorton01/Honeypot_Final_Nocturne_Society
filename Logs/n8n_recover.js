const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');

db.serialize(() => {
  // List tables first
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    console.log('Tables:', tables);
    
    // Then query users
    db.all("SELECT id, email, password FROM users", (err, rows) => {
      console.log('Users:', rows);
      db.close();
    });
  });
});
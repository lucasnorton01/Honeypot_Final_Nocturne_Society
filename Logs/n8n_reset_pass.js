// n8n_password_reset.js - Reset n8n user password
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

async function resetPassword() {
  const password = 'Norton01';
  const saltRounds = 10; // Same as original $2a$10 format
  
  console.log('Generating bcrypt hash for password:', password);
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash:', hash);
  
  const db = new sqlite3.Database('/home/node/.n8n/database.sqlite', (err) => {
    if (err) {
      console.error('Database connection error:', err);
      process.exit(1);
    }
  });
  
  // The table is called "user" (singular), not "users" (plural)
  // Update the password in the user table
  const sql = 'UPDATE user SET password = ? WHERE email = ?';
  
  db.run(sql, [hash, 'athicus81@gmail.com'], function(err) {
    if (err) {
      console.error('Error updating password:', err);
      db.close();
      process.exit(1);
    }
    
    console.log(`Rows updated: ${this.changes}`);
    console.log('Password successfully reset for: athicus81@gmail.com');
    
    db.close();
    console.log('Database connection closed.');
    
    // Verify the update
    console.log('\n--- Verification ---');
    db.get('SELECT id, email, password FROM user WHERE email = ?', ['athicus81@gmail.com'], function(err, row) {
      if (err) {
        console.error('Error reading user:', err);
      } else {
        console.log('User found:');
        console.log('  ID:', row.id);
        console.log('  Email:', row.email);
        console.log('  Password hash:', row.password);
        
        // Verify the password matches
        bcrypt.compare(password, row.password, function(err, result) {
          if (err) {
            console.error('Error comparing passwords:', err);
          } else {
            console.log('Password verification:', result ? 'SUCCESS ✓' : 'FAIL ✗');
            if (result) {
              console.log('\\n✅ Password successfully reset! You can now login with:');
              console.log('   Email: athicus81@gmail.com');
              console.log('   Password: Norton01');
            }
          }
          process.exit(0);
        });
      }
    });
  });
}

resetPassword().catch(err => {
  console.error('Failed to reset password:', err);
  process.exit(1);
});
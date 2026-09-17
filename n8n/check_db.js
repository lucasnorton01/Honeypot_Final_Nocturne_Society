const path = require('path');
const fs = require('fs');

// Find better-sqlite3 in n8n's node_modules
const n8nModules = '/usr/local/lib/node_modules/n8n/node_modules';
const pnpmDir = path.join(n8nModules, '.pnpm');

// Try to find better-sqlite3
let sqlite3Path;
const possiblePaths = fs.readdirSync(pnpmDir).filter(d => d.startsWith('better-sqlite3'));
if (possiblePaths.length > 0) {
    sqlite3Path = path.join(pnpmDir, possiblePaths[0], 'node_modules', 'better-sqlite3');
} else {
    // Try direct node_modules
    sqlite3Path = path.join(n8nModules, 'better-sqlite3');
}

console.log('Using sqlite3 from:', sqlite3Path);
const Database = require(sqlite3Path);
const db = new Database('/home/node/.n8n/database.sqlite');

// List tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables.map(t => t.name)));

// List users
try {
    const users = db.prepare('SELECT id, email, firstName, lastName FROM user_entity').all();
    console.log('Users:', JSON.stringify(users, null, 2));
} catch(e) {
    console.log('user_entity error:', e.message);
    // Try alternative table names
    try {
        const users = db.prepare('SELECT * FROM user LIMIT 5').all();
        console.log('Users (user table):', JSON.stringify(users, null, 2));
    } catch(e2) {
        console.log('user table error:', e2.message);
    }
}

// List workflows
try {
    const workflows = db.prepare('SELECT id, name, active FROM workflow_entity').all();
    console.log('Workflows:', JSON.stringify(workflows, null, 2));
} catch(e) {
    console.log('workflow_entity error:', e.message);
}

db.close();

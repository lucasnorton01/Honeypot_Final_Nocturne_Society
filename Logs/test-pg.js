const { Client } = require('/usr/local/lib/node_modules/n8n/node_modules/pg');
const c = new Client({ host: 'postgres', port: 5432, database: 'honeypot', user: 'honeypot', password: 'honeypot_pass' });
c.connect()
  .then(() => { console.log('CONNECT OK'); return c.end(); })
  .catch((e) => { console.error('CONNECT FAIL', e.message); process.exit(1); });
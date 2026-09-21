// ============================================================
// import-n8n.js — Setup automático de n8n
// Crea owner, credential de Postgres, importa y activa workflows
// Uso: node script_entorno/import-n8n.js
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const N8N_HOST = 'localhost';
const N8N_PORT = 5678;
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASS = process.env.N8N_PASS;

if (!N8N_EMAIL || !N8N_PASS) {
  console.error('ERROR: Faltan variables de entorno N8N_EMAIL y N8N_PASS. Definirlas antes de ejecutar.');
  process.exit(1);
}

// Ruta a los workflows exportados
const WORKFLOWS_DIR = path.join(__dirname, '..', 'n8n', 'workflows');

// ─── HTTP helper ────────────────────────────────────────────
function req(method, urlPath, body, cookies) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookies) headers['Cookie'] = cookies;
    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request({ hostname: N8N_HOST, port: N8N_PORT, path: urlPath, method, headers }, (res) => {
      let sc = '';
      if (res.headers['set-cookie']) sc = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      let b = '';
      res.on('data', chunk => b += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: b, cookies: sc || cookies }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log('=== n8n Setup Automático ===\n');

  // 1. Setup owner
  console.log('1. Creando owner account...');
  let r = await req('POST', '/rest/owner/setup', {
    email: N8N_EMAIL, password: N8N_PASS,
    firstName: 'Lucas', lastName: 'Norton'
  });
  let ck = r.cookies;
  
  if (r.status === 200) {
    console.log('   Owner creado OK');
  } else {
    // Owner ya existe, hacer login
    console.log('   Owner ya existe, haciendo login...');
    r = await req('POST', '/rest/login', { emailOrLdapLoginId: N8N_EMAIL, password: N8N_PASS });
    ck = r.cookies;
    if (r.status !== 200) {
      console.error('   ERROR: Login falló:', r.body.substring(0, 200));
      process.exit(1);
    }
    console.log('   Login OK');
  }

  // 2. Verificar/crear credential de Postgres
  console.log('\n2. Configurando credential de PostgreSQL...');
  const creds = await req('GET', '/rest/credentials', null, ck);
  const existingPg = (JSON.parse(creds.body).data || []).find(c => c.type === 'postgres');
  
  let credId;
  if (existingPg) {
    credId = existingPg.id;
    console.log(`   Credential ya existe: ${credId}`);
  } else {
    // CRITICAL: ssl must be the STRING 'disable', not boolean false!
    // n8n's pg transport: dbConfig.ssl = !['disable', undefined].includes(credentials.ssl)
    const credResp = await req('POST', '/rest/credentials', {
      name: 'Postgres',
      type: 'postgres',
      data: {
        host: 'postgres',
        port: 5432,
        database: 'honeypot',
        user: 'honeypot',
        password: process.env.POSTGRES_PASSWORD,
        ssl: 'disable',
        allowUnauthorizedCertificates: false
      }
    }, ck);
    
    credId = JSON.parse(credResp.body).data?.id;
    if (!credId) {
      console.error('   ERROR: No se pudo crear credential:', credResp.body.substring(0, 300));
      process.exit(1);
    }
    console.log(`   Credential creada: ${credId}`);
  }

  // 3. Importar workflows
  console.log('\n3. Importando workflows...');
  
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error(`   ERROR: Directorio de workflows no encontrado: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  const workflowFiles = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  
  if (workflowFiles.length === 0) {
    console.error('   ERROR: No se encontraron archivos .json en', WORKFLOWS_DIR);
    process.exit(1);
  }

  // Mapeo de workflows: archivo -> { activate: bool }
  // Solo archivos que SON workflows (tienen "nodes")
  const workflowConfig = {
    'event-ingest.json': { activate: true },
    'ioc-extractor.json': { activate: true },
    'report-generator-fixed.json': { activate: false },
    // Backwards compatibility
    'report-generator.json': { activate: false },
    'report-generator-manual.json': { activate: false },
    'test-geo-enrichment.json': { activate: false }
  };

  // Archivos que NO son workflows (credentials, configs, etc.)
  const skipFiles = ['postgres-credential.json'];

  // Limpiar workflows viejos duplicados
  const existingWfs = await req('GET', '/rest/workflows', null, ck);
  const existingList = JSON.parse(existingWfs.body).data || [];
  
  for (const wf of existingList) {
    // Solo borrar si tiene el mismo nombre que uno que vamos a importar
    const baseName = wf.name;
    const matchingFile = Object.keys(workflowConfig).find(f => f.replace('.json', '') === baseName);
    if (matchingFile) {
      if (wf.active) {
        const full = await req('GET', `/rest/workflows/${wf.id}`, null, ck);
        await req('POST', `/rest/workflows/${wf.id}/deactivate`, { versionId: JSON.parse(full.body).data.versionId }, ck);
      }
      await req('DELETE', `/rest/workflows/${wf.id}`, null, ck);
      console.log(`   Eliminado workflow viejo: ${wf.name}`);
    }
  }

  const imported = [];
  
  for (const file of workflowFiles) {
    // Saltar archivos que no son workflows
    if (skipFiles.includes(file)) {
      console.log(`\n   Saltando ${file} (no es workflow)`);
      continue;
    }

    const config = workflowConfig[file] || { activate: false };
    console.log(`\n   Importando ${file}...`);
    
    const filePath = path.join(WORKFLOWS_DIR, file);
    let wfData;
    try {
      wfData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`   ERROR leyendo ${file}:`, e.message);
      continue;
    }
    
    // Verificar que es un workflow (tiene nodes)
    if (!wfData.nodes || !Array.isArray(wfData.nodes)) {
      console.log(`   Saltando ${file} (no tiene estructura de workflow)`);
      continue;
    }
    
    // Limpiar para import fresh
    delete wfData.id;
    wfData.meta = { templateCredsSetupCompleted: true };
    
    // Remover nodo Manual (Execute Workflow) problemático del ioc-extractor
    wfData.nodes = wfData.nodes.filter(n => n.id !== 'wf-ioc-exec-trigger');
    if (wfData.connections) {
      delete wfData.connections['Manual (Execute Workflow)'];
    }
    
    // Actualizar referencias de credential
    for (const node of wfData.nodes) {
      if (node.credentials?.postgres) {
        node.credentials.postgres.id = credId;
        node.credentials.postgres.name = 'Postgres';
      }
    }
    
    const imp = await req('POST', '/rest/workflows', wfData, ck);
    
    if (imp.status === 200 || imp.status === 201) {
      const created = JSON.parse(imp.body).data;
      console.log(`   Creado: ${created.name} (${created.id})`);
      
      if (config.activate) {
        // Obtener versionId para activar
        const full = await req('GET', `/rest/workflows/${created.id}`, null, ck);
        const fullWf = JSON.parse(full.body).data;
        const act = await req('POST', `/rest/workflows/${created.id}/activate`, { versionId: fullWf.versionId }, ck);
        
        if (act.status === 200) {
          console.log(`   Activado: ${created.name}`);
          imported.push({ name: created.name, id: created.id, active: true });
        } else {
          console.error(`   ERROR activando ${created.name}:`, act.body.substring(0, 200));
          imported.push({ name: created.name, id: created.id, active: false });
        }
      } else {
        imported.push({ name: created.name, id: created.id, active: false });
      }
    } else {
      console.error(`   ERROR importando ${file}:`, imp.body.substring(0, 300));
    }
  }

  // 4. Resumen
  console.log('\n=== Resumen ===');
  console.log(`Workflows importados: ${imported.length}`);
  for (const wf of imported) {
    const icon = wf.active ? '🟢' : '⚪';
    console.log(`  ${icon} ${wf.name}`);
  }

  console.log('\nWebhook URL (desde Docker): http://n8n:5678/webhook/cowrie');
  console.log('Webhook URL (desde host):   http://localhost:5678/webhook/cowrie');

  // 5. Test rápido
  console.log('\n=== Test de webhook ===');
  const test = await req('POST', '/webhook/cowrie', {
    eventid: 'cowrie.session.connect',
    session: 'test-setup-' + Date.now(),
    src_ip: '127.0.0.1',
    message: 'Setup test',
    timestamp: new Date().toISOString()
  });
  console.log(`Webhook response: ${test.status} ${test.body}`);

  if (test.status === 200) {
    console.log('\n✅ n8n configurado correctamente!');
  } else {
    console.log('\n⚠️  n8n configurado pero el webhook no respondió OK');
    console.log('   Verificar: http://localhost:5678 → workflows → activar manualmente');
  }
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});

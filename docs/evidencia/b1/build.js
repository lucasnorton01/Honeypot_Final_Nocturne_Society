const fs=require('fs');
let t=fs.readFileSync('plantilla.html','utf8');
const muestra=fs.readFileSync('muestra_b1.json','utf8').trim();
const R=(a,b)=>{ if(!t.includes(a)) throw new Error('no encontrado: '+a.slice(0,60)); t=t.split(a).join(b); };
R("const VERSION = 'b1-v1';","const VERSION = 'b1-v2';");
R("const LS = 'b1-progreso';","const LS = 'b1v2-progreso-__CODIGO__';");
R('<span class="eyebrow">Tesis Nocturne Society · nivel B1</span>','<span class="eyebrow">Tesis Nocturne Society · nivel B1 · participante __CODIGO__</span>');
R('<input id="codigo" placeholder="por ejemplo, P1" maxlength="12" autocomplete="off">','<input id="codigo" value="__CODIGO__" readonly>');
R('<p class="muted">No consultes servicios externos','<p><b>Hacelo solo/a</b>, sin mirar la pantalla de otro participante y sin comentar los eventos hasta que todos terminen. Esta página es solo para <b>__CODIGO__</b>.</p>\n    <p class="muted">No consultes servicios externos');
R('    <div class="grid">\n      <label for="codigo">',`    <h2>Qué poner en cada campo</h2>
    <div class="tablewrap"><table>
      <thead><tr><th>Campo</th><th>Qué va</th><th>Ejemplo</th></tr></thead>
      <tbody>
        <tr><td>Sesión</td><td>el valor de <code>session</code></td><td><code>89d78abf875c</code></td></tr>
        <tr><td>IP de origen</td><td>el valor de <code>src_ip</code></td><td><code>172.19.0.7</code></td></tr>
        <tr><td>Usuario / Contraseña</td><td>los valores de <code>username</code> y <code>password</code></td><td><code>admin</code> / <code>test123</code></td></tr>
        <tr><td>Comando</td><td>el <b>texto</b> que trae <code>input</code> (no la palabra «input»)</td><td><code>uname -a</code></td></tr>
        <tr><td>Valor del IoC</td><td>el <b>dato</b> del indicador, no la severidad</td><td><code>172.19.0.7</code> · <code>admin:test123</code> · <code>wget http://…</code></td></tr>
      </tbody></table></div>
    <p class="muted">Si el evento no trae un campo, dejalo vacío. Podés copiar y pegar del JSON.</p>
    <h2>Criterio común para el paso 2</h2>
    <div class="tablewrap"><table>
      <thead><tr><th>Tipo de evento</th><th>¿Relevante?</th><th>Severidad</th><th>IoC</th></tr></thead>
      <tbody>
        <tr><td><code>session.connect</code></td><td>Sí</td><td>Baja</td><td>IP → valor de <code>src_ip</code></td></tr>
        <tr><td><code>login.failed</code></td><td>Sí</td><td>Baja</td><td>Credencial → <code>usuario:contraseña</code></td></tr>
        <tr><td><code>login.success</code></td><td>Sí</td><td>Alta</td><td>Credencial → <code>usuario:contraseña</code></td></tr>
        <tr><td><code>command.input</code></td><td>Sí</td><td>Alta si el comando contiene wget, curl, bash, sh, python, chmod, nc, tftp o /bin; si no, Media</td><td>Comando sospechoso → el comando, si contiene alguna de esas palabras; si no, Ninguno</td></tr>
        <tr><td>el resto (<code>client.version</code>, <code>client.kex</code>, <code>session.params</code>, <code>log.closed</code>, <code>session.closed</code>)</td><td>No</td><td>Baja</td><td>Ninguno</td></tr>
      </tbody></table></div>
    <p class="muted">Si el mensaje trae un hash SHA-256, el IoC es Hash. Si en algún caso no estás de acuerdo con el criterio, seguí tu juicio y explicalo en la nota.</p>
    <div class="grid">
      <label for="codigo">`);
R('<label for="f-comando">Comando<input id="f-comando" autocomplete="off" spellcheck="false"></label>','<label for="f-comando">Comando (texto de <code>input</code>)<input id="f-comando" autocomplete="off" spellcheck="false" placeholder="ej.: uname -a"></label>');
R('placeholder="vacío si es «ninguno»"','placeholder="ej.: 172.19.0.7 o admin:test123 (vacío si es «ninguno»)"');
R(`    if (tipo !== 'ninguno' && !valor) { $('err-2').textContent = 'Escribí el valor del indicador, o elegí «Ninguno».'; return; }`,
`    if (tipo !== 'ninguno' && !valor) { $('err-2').textContent = 'Escribí el valor del indicador, o elegí «Ninguno».'; return; }
    if (/^(alt[ao]|medi[ao]|baj[ao]|credencial|ip|comando|hash|ninguno)$/i.test(valor) && tipo !== 'ninguno') { $('err-2').textContent = 'En «Valor del IoC» va el dato (por ejemplo, la IP o usuario:contraseña), no la severidad ni el tipo.'; return; }`);
R(`    if (!$('f-tipo').value || !$('f-relevante').value) { $('err-1').textContent = 'Elegí el tipo de evento y si es relevante.'; return; }`,
`    if (!$('f-tipo').value || !$('f-relevante').value) { $('err-1').textContent = 'Elegí el tipo de evento y si es relevante.'; return; }
    if (/^input$/i.test($('f-comando').value.trim())) { $('err-1').textContent = 'En «Comando» va el texto que trae input (por ejemplo, uname -a), no la palabra «input».'; return; }`);
R('<title>Línea de base manual</title>','<title>Línea de base __CODIGO__</title>');
R('    t1 = performance.now();',"    t1 = performance.now(); $('err-1').textContent = '';");
R('__MUESTRA__', muestra);
for (const c of ['P1','P2']) fs.writeFileSync((process.argv[2]||'.')+`/linea-base-${c}.html`, t.split('__CODIGO__').join(c));
console.log('ok');

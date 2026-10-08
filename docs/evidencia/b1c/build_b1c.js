// Parchea las páginas generadas por ../b1/build.js (versión b1-v2) para la ampliación B1c:
// versión b1-v3, botón «Descargar JSON» que funciona sin conexión (Blob), avance sin recargar
// (no se espera el guardado para pasar al evento siguiente, la pantalla vuelve arriba y se limpia el evento anterior)
// y botón «Reiniciar mi medición» (el archivo deja constancia en `reinicios`).
// Uso (desde docs/evidencia/b1): node build.js ../b1c P18,...,P27 && cd ../b1c && node build_b1c.js P18,...,P27
const fs = require('fs');
const R = (t, a, b) => { if (!t.includes(a)) throw new Error('no encontrado: ' + a.slice(0, 60)); return t.split(a).join(b); };
for (const c of (process.argv[2] || '').split(',')) {
  const f = `linea-base-${c}.html`; let t = fs.readFileSync(f, 'utf8');
  t = R(t, "const VERSION = 'b1-v2';", "const VERSION = 'b1-v3';");
  t = R(t, '<button class="ghost" id="btn-descargar" hidden>Descargar CSV</button>', '<button class="ghost" id="btn-json">Descargar JSON</button><button class="ghost" id="btn-descargar" hidden>Descargar CSV</button>');
  t = R(t, "'. Copiá las respuestas de abajo y enviáselas al equipo.'", "'. Tocá «Descargar JSON» y enviá al equipo, sin abrirlo ni modificarlo, el archivo que se descarga.'");
  t = R(t, "'Copiá este texto completo y enviáselo al equipo: es la única copia de tus respuestas.'", "'Enviá el archivo .json descargado tal como se generó: es la única copia de tus respuestas. No lo conviertas ni lo copies a otro formato.'");
  t = R(t, "  $('btn-descargar').addEventListener('click', async () => {", `  $('btn-json').addEventListener('click', () => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([$('respaldo-json').value], { type: 'application/json' }));
      a.download = 'linea-base-' + (estado.codigo || 'participante') + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      $('copiado').textContent = 'Archivo descargado.';
    } catch (e) { $('copiado').textContent = 'No se pudo descargar: usá «Copiar respuestas» y pegá el texto en un archivo .json sin cambiarlo.'; }
  });

  $('btn-descargar').addEventListener('click', async () => {`);
  // avance sin recargar
  t = R(t, "const show = id => ['s-inicio','s-trabajo','s-pausa','s-fin'].forEach(s => $(s).hidden = (s !== id));",
    "const show = id => { ['s-inicio','s-trabajo','s-pausa','s-fin'].forEach(s => $(s).hidden = (s !== id)); try { window.scrollTo(0, 0); } catch(_) {} };");
  t = R(t, "    $('btn-guardar').disabled = true;\n    await persistir();\n    idx++;", "    $('btn-guardar').disabled = true;\n    persistir().catch(() => {});\n    idx++;");
  t = R(t, "    $('err-1').textContent = ''; $('err-2').textContent = '';\n    $('paso1')", "    $('err-1').textContent = ''; $('err-2').textContent = ''; $('log').textContent = '';\n    $('paso1')");
  // reinicio
  t = R(t, "respuestas:estado.respuestas });\n    $('btn-descargar').hidden", "reinicios:reinicios, respuestas:estado.respuestas });\n    $('btn-descargar').hidden");
  t = R(t, "  let idx = 0, t0 = 0, t1 = 0,", "  let reinicios = 0; try { reinicios = Number(localStorage.getItem(LS + '-reinicios') || 0); } catch(_) {}\n  let idx = 0, t0 = 0, t1 = 0,");
  t = R(t, '\n<script id="muestra"', '\n<div style="text-align:center;margin:24px 0"><button class="ghost" id="btn-reiniciar">Reiniciar mi medición</button></div>\n\n<script id="muestra"');
  t = R(t, "  iniciarCapacidades();\n})();", `  $('btn-reiniciar').addEventListener('click', async () => {
    if (!confirm('¿Reiniciar tu medición? Se borran las respuestas guardadas en este navegador y empezás de nuevo desde la práctica. Se deja constancia del reinicio en el archivo.')) return;
    reinicios++;
    try { localStorage.setItem(LS + '-reinicios', String(reinicios)); localStorage.removeItem(LS); } catch(_) {}
    estado = { codigo: $('codigo').value.trim(), perfil: '', inicio: null, respuestas: [] }; idx = 0;
    if (guardaRemoto) { try { await docRef.set({ version:VERSION, codigo:'', perfil:'', inicio:null, actualizado:new Date().toISOString(), respuestas:[] }); } catch(_) {} }
    $('perfil').value = ''; $('err-inicio').textContent = ''; $('log').textContent = ''; $('progreso').style.width = '0%';
    $('btn-empezar').textContent = 'Empezar con la práctica';
    show('s-inicio');
  });

  iniciarCapacidades();
})();`);
  fs.writeFileSync(f, t);
}
console.log('ok');

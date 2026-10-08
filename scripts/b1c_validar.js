// Control de validez del preregistro B1c (sección 4). Uso: node scripts/b1c_validar.js docs/evidencia/b1c/resultados
const fs=require('fs'),path=require('path');
const M=JSON.parse(fs.readFileSync('docs/evidencia/b1/muestra_b1.json','utf8'));
const items=[...M.practica.map((e,i)=>({e,p:true,n:i+1})),...M.eventos.map((e,i)=>({e,p:false,n:i+1}))];
for(const f of fs.readdirSync(process.argv[2]).sort()){
 const j=JSON.parse(fs.readFileSync(process.argv[2]+'/'+f,'utf8')); const exp=f.match(/P\d+/)[0]; const pr=[]; const r=j.respuestas||[];
 if(j.version!=='b1-v3')pr.push('version '+j.version); if(j.codigo!==exp)pr.push('codigo '+j.codigo); if(r.length!==22)pr.push('n='+r.length); if(typeof j.reinicios!=='number')pr.push('sin reinicios');
 let prevFin=0;
 r.forEach((x,i)=>{const it=items[i]; if(x.orden!==i+1)pr.push('orden '+i); if(it&&(x.evento.session!==it.e.session||x.evento.timestamp!==it.e.timestamp))pr.push('evento desalineado '+(i+1));
  if(x.ms_total!==x.ms_paso1+x.ms_paso2&&Math.abs(x.ms_total-x.ms_paso1-x.ms_paso2)>2)pr.push('suma '+(i+1)); if(!(x.ms_paso1>0&&x.ms_paso2>0))pr.push('tiempo<=0 '+(i+1));
  const t=Date.parse(x.fin); if(t<prevFin)pr.push('fin no crece '+(i+1)); prevFin=t;});
 // datos del evento anterior en el actual (sesion distinta pero respuesta igual a la sesion previa)
 let stale=0; r.forEach((x,i)=>{ if(i>0&&x.respuesta.sesion&&x.respuesta.sesion===r[i-1].evento.session&&x.evento.session!==r[i-1].evento.session)stale++;});
 const q=r.filter(x=>!x.practica).map(x=>x.ms_paso1).sort((a,b)=>a-b);
 console.log(f.padEnd(24),String(j.perfil).padEnd(11),String(j.inicio).slice(11,19),'reinicios',j.reinicios,'stale',stale,'med1',(q[9]+q[10])/2000,'min',q[0]/1000,'max',q[19]/1000,pr.length?'PROBLEMAS: '+pr.join('; '):'ok');
}

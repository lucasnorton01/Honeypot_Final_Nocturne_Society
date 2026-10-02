const fs=require('fs');
const M=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const files=process.argv.slice(3);
const P=files.map(f=>{const d=JSON.parse(fs.readFileSync(f,'utf8'));return d.data||d;});
const med=a=>{a=[...a].sort((p,q)=>p-q);const n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2};
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const PAT=/wget|curl|nc |python|\/bin|sh |bash|chmod|tftp/i;
const esperado=e=>{const t=e.eventid;
  const f={tipo:t,sesion:e.session||'',ip:e.src_ip||'',usuario:e.username||'',password:e.password||'',comando:e.input||''};
  let rel='no',sev='baja',ioc='ninguno',val='';
  if(t==='cowrie.session.connect'){rel='si';ioc='ip';val=e.src_ip;}
  else if(t==='cowrie.login.failed'){rel='si';ioc='credential';val=e.username+':'+e.password;}
  else if(t==='cowrie.login.success'){rel='si';sev='alta';ioc='credential';val=e.username+':'+e.password;}
  else if(t==='cowrie.command.input'){rel='si';sev=PAT.test(e.input)?'alta':'media';if(PAT.test(e.input)){ioc='command';val=e.input;}}
  return {...f,relevante:rel,severidad:sev,ioc_tipo:ioc,ioc_valor:val};};
const ev=M.eventos;
const out={};
for(const p of P){const r=p.respuestas.filter(x=>!x.practica);
  const err={campos:0,campos_tot:0,eventid:0,relevante:0,severidad:0,ioc_tipo:0,ioc_valor:0,ev_paso1_ok:0,ev_paso2_ok:0};
  const det=[];
  for(const x of r){const e=ev[x.n-1];
    if(e.session!==x.evento.session||e.timestamp!==x.evento.timestamp) throw 'desalineado';
    const E=esperado(e),R=x.respuesta;let ok1=true,ok2=true;
    for(const k of ['sesion','ip','usuario','password','comando']){err.campos_tot++;if((R[k]||'').trim()!==String(E[k]).trim()){err.campos++;ok1=false;det.push(x.n+' '+k+': «'+R[k]+'» vs «'+E[k]+'»');}}
    if(R.tipo!==E.tipo){err.eventid++;ok1=false;det.push(x.n+' tipo '+R.tipo+' vs '+E.tipo);}
    if(R.relevante!==E.relevante){err.relevante++;ok1=false;det.push(x.n+' relevante '+R.relevante+' vs '+E.relevante);}
    if(R.severidad!==E.severidad){err.severidad++;ok2=false;det.push(x.n+' sev '+R.severidad+' vs '+E.severidad+' ('+E.tipo+')');}
    if(R.ioc_tipo!==E.ioc_tipo){err.ioc_tipo++;ok2=false;det.push(x.n+' ioc '+R.ioc_tipo+' vs '+E.ioc_tipo);}
    else if(E.ioc_tipo!=='ninguno'&&R.ioc_valor.trim()!==E.ioc_valor.trim()){err.ioc_valor++;ok2=false;det.push(x.n+' iocval «'+R.ioc_valor+'» vs «'+E.ioc_valor+'»');}
    if(ok1)err.ev_paso1_ok++; if(ok2)err.ev_paso2_ok++;}
  const s=k=>r.map(x=>x[k]/1000);
  out[p.codigo]={version:p.version,perfil:p.perfil,inicio:p.inicio,n:r.length,
   paso1:{mediana:+med(s('ms_paso1')).toFixed(2),media:+mean(s('ms_paso1')).toFixed(2),min:Math.min(...s('ms_paso1')),max:Math.max(...s('ms_paso1'))},
   paso2:{mediana:+med(s('ms_paso2')).toFixed(2),media:+mean(s('ms_paso2')).toFixed(2)},
   total:{mediana:+med(s('ms_total')).toFixed(2),suma_min:+(s('ms_total').reduce((a,b)=>a+b,0)/60).toFixed(1)},
   errores:err,detalle:det,fines:r.map(x=>x.fin)};}
const cods=Object.keys(out);
const porEvento=ev.map((_,i)=>med(P.map(p=>p.respuestas.find(x=>!x.practica&&x.n===i+1).ms_paso1/1000)));
out.linea_base={criterio:'mediana por evento del paso 1 (entre participantes), luego mediana de los 20 eventos',paso1_mediana_s:+med(porEvento).toFixed(2),paso1_media_s:+mean(porEvento).toFixed(2),
 total_mediana_s:+med(ev.map((_,i)=>med(P.map(p=>p.respuestas.find(x=>!x.practica&&x.n===i+1).ms_total/1000)))).toFixed(2)};
if(cods.length===2){const a=out[cods[0]].fines.map(Date.parse),b=out[cods[1]].fines.map(Date.parse);out.independencia={dif_fin_s:a.map((x,i)=>Math.round((x-b[i])/1000)),mediana_abs_s:med(a.map((x,i)=>Math.abs(x-b[i])/1000))};}
for(const c of cods) delete out[c].fines;
console.log(JSON.stringify(out,null,1));

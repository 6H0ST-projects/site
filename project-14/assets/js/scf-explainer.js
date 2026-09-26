(function() {
  'use strict';
  const root=document.querySelector('.scfx'); if(!root)return;
  const M=window.SCFExplainerModel;
  let alpha=.5,frames=M.trajectory(alpha),iteration=0,stage=0,timer=null;
  const $=id=>document.getElementById('scfx-'+id);
  const stages=[...root.querySelectorAll('[data-scfx-stage]')];
  const panels=[...root.querySelectorAll('[data-scfx-panel]')];
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fmt=n=>n.toExponential(2);
  function stop(){if(timer!==null)clearInterval(timer);timer=null;$('play').textContent='Play trajectory';$('play').setAttribute('aria-pressed','false');}
  function field(canvas,state,component){
    const ctx=canvas.getContext('2d');const size=canvas.width;const pixels=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const v=M.fields(state,(x+.5)/size,(y+.5)/size)[component];
      let color;
      if(component==='n'){
        const t=Math.max(0,Math.min(1,(v-.4)/1.2));color=[248-210*t,249-209*t,251-203*t];
      } else {
        const t=Math.min(1,Math.abs(v)/.4),end=v<0?[75,81,91]:[255,8,96];
        color=end.map(c=>248+(c-248)*t);
      }
      const offset=(y*size+x)*4;for(let c=0;c<3;c++)pixels.data[offset+c]=Math.round(color[c]);pixels.data[offset+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  }
  function graph(){
    const svg=$('history'),X=k=>62+k/60*510,Y=v=>30+(0-Math.max(-8,Math.min(0,Math.log10(Math.max(v,1e-12)))))/8*160;
    let markup='<title id="scfx-chart-title">Illustrative input-output residual by numerical iteration</title><desc id="scfx-chart-desc">Charge in grey and spin in pink. Field RMS on a fixed log scale; not measured DFT.</desc>';
    for(const e of [0,-2,-4,-6,-8])markup+=`<line x1="62" x2="572" y1="${Y(10**e)}" y2="${Y(10**e)}" stroke="#e2e5ea"/><text x="50" y="${Y(10**e)+4}" text-anchor="end">1e${e}</text>`;
    for(const k of [0,15,30,45,60])markup+=`<text x="${X(k)}" y="211" text-anchor="middle">${k}</text>`;
    markup+='<text x="62" y="16">Field RMS · arbitrary units</text><line x1="395" x2="411" y1="12" y2="12" stroke="#4b515b" stroke-width="2"/><text x="417" y="16" fill="#252830">charge</text><line x1="493" x2="509" y1="12" y2="12" stroke="#ff0860" stroke-width="2"/><text x="515" y="16" fill="#252830">spin</text><text x="315" y="234" text-anchor="middle">Numerical iteration (not time)</text>';
    for(const [name,color] of [['charge','#4b515b'],['spin','#ff0860']]){
      const points=frames.slice(0,iteration+1).map(f=>`${X(f.iteration)},${Y(f[name])}`).join(' ');
      markup+=`<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/><circle cx="${X(iteration)}" cy="${Y(frames[iteration][name])}" r="3.5" fill="${color}"/>`;
    }
    svg.innerHTML=markup;
  }
  function render(){
    const f=frames[iteration];
    stages.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===stage));});
    panels.forEach((p,i)=>{p.hidden=i!==stage;});
    $('iteration').value=iteration;$('iteration-value').textContent=`${iteration} / ${M.maxIterations}`;
    root.querySelectorAll('canvas').forEach(c=>{const [which,component]=c.dataset.scfxField.split('-');field(c,f[which],component);});
    $('charge').textContent=fmt(f.charge);$('spin').textContent=fmt(f.spin);$('norm').textContent=fmt(f.norm);
    const chargeFactor=1-2.4*alpha,spinFactor=1-.35*alpha;
    $('explanation').textContent=`Illustrative model. Charge-error multiplier: ${chargeFactor.toFixed(2)}; spin-error multiplier: ${spinFactor.toFixed(3)}. ${alpha===.8?'The stronger step makes charge alternate around its target and decay slowly.':'The spin component takes longer to settle at this mixing strength.'} Each frame shows the selected iteration’s input and output. Chart floor: 1e−8; numeric values continue below it.`;
    graph();
  }
  function advance(){if(iteration<M.maxIterations)iteration++;render();if(iteration===M.maxIterations)stop();}
  $('play').addEventListener('click',()=>{
    if(timer!==null){stop();return;}
    if(iteration===M.maxIterations){iteration=0;render();}
    $('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');timer=setInterval(advance,reduced.matches?1600:900);
  });
  $('step').addEventListener('click',()=>{stop();advance();});
  $('reset').addEventListener('click',()=>{stop();iteration=0;render();});
  $('mixing').addEventListener('change',e=>{stop();alpha=Number(e.target.value);frames=M.trajectory(alpha);iteration=0;render();});
  $('iteration').addEventListener('input',e=>{stop();iteration=Number(e.target.value);render();});
  stages.forEach((b,i)=>b.addEventListener('click',()=>{stage=i;render();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  reduced.addEventListener('change',stop);
  render();
})();

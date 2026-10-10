/* Short explanatory sequences, never benchmark-time animations.
 * SVGs are complete without JS. Text remains visible throughout playback.
 * Reduced motion uses instant steps; auto-play runs once, on wide screens only.
 */
(() => {
  'use strict';
  const many = (prefix, n) => Array.from({length:n}, (_,i) => `${prefix}-${i}`);
  const jobs=many('job',4), images=many('image',3), sums=many('sum',3);
  const phases=many('phase',3), points=many('point',8), reads=many('read',8);
  const side = (active=[], done=[], flows=[]) => ({active,done,flows});
  const frame = (label,before,after) => ({label,before,after});
  const scenes = {
    'resident-state': {
      intro:'Upstream offloads the solver; REMAG keeps the supported electronic loop on the GPU.',
      frames:[
        frame('Both use the GPU: upstream calls ELPA; REMAG solves from its resident electronic state.',side(['solve'],['mix'],['upload']),side(['solve'])),
        frame('The solved state feeds grid-density work on the CPU upstream and on the GPU in REMAG.',side(['density'],['solve'],['download']),side(['density'],['solve'],['density'])),
        frame('Construct the next potential: host arrays upstream; resident GPU arrays in REMAG.',side(['potential'],['solve','density'],['potential']),side(['potential'],['solve','density'],['potential'])),
        frame('Convergence and mixing stay on the CPU upstream and execute on the GPU in REMAG.',side(['mix'],['solve','density','potential'],['mix']),side(['mix'],['solve','density','potential'],['mix'])),
        frame('Repeat: upstream calls the GPU solver again; REMAG advances its device-controlled loop.',side(['solve'],['density','potential','mix'],['upload']),side(['solve'],['density','potential','mix'],['repeat']))
      ]
    },
    'solver-pool': {
      intro:'Follow four independent jobs through one GPU, then their common join.',
      frames:[
        frame('One workspace starts A. Separate workspaces can start A–D together.',side(['job-0']),side(jobs)),
        frame('The serial path starts B. The overlapping jobs join before occupations.',side(['job-1'],['job-0'],['job-0']),side(['occupations'],jobs,[...jobs,'join'])),
        frame('The serial path still has C to solve; the pooled jobs have reached occupations.',side(['job-2'],['job-0','job-1'],['job-1']),side([], [...jobs,'occupations'])),
        frame('The serial path solves D, its last independent problem.',side(['job-3'],jobs.slice(0,3),['job-2']),side([], [...jobs,'occupations'])),
        frame('Both routes join before occupations. Density accumulation stays ordered.',side(['occupations'],jobs,['job-3','join']),side([], [...jobs,'occupations']))
      ]
    },
    'unique-pairs': {
      intro:'Follow three periodic images that refer to one unit-cell orbital pair.',
      frames:[
        frame('Three different image entries refer to the same orbital pair.',side(images),side(['pair'])),
        frame('Before: three state sums. After: compute the shared state sum once.',side(sums,images,sums),side(['sum'],['pair'])),
        frame('Apply each image’s own phase. These three operations are still required.',side(phases,[...images,...sums],phases),side(phases,['sum','pair'],phases)),
        frame('Write the same sparse output, preserving the periodic and spin layout.',side([], [...images,...sums,...phases]),side(['scatter'],['sum','pair',...phases],many('scatter',3)))
      ]
    },
    'grid-cluster': {
      intro:'Follow one orbital-pair coefficient to eight neighboring grid points.',
      frames:[
        frame('Before: repeat the lookup and read. After: load the shared coefficient once.',side(reads),side(['read'])),
        frame('Feed eight separate accumulators with that shared coefficient.',side(points,reads,points),side(points,['read'],points)),
        frame('Each point keeps its own orbital values and density result.',side([], [...reads,...points]),side([], ['read',...points]))
      ]
    }
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 561px)');
  const controllers=[];
  const svgNS='http://www.w3.org/2000/svg';
  const duration=1800;

  document.querySelectorAll('[data-remag-motion]').forEach(figure => {
    const scene=scenes[figure.dataset.remagMotion];
    if (!scene) return;
    const controls=figure.querySelector('.remag-motion-controls');
    const play=controls.querySelector('[data-motion-play]');
    const step=controls.querySelector('[data-motion-step]');
    const reset=controls.querySelector('[data-motion-reset]');
    const label=controls.querySelector('[data-motion-label]');
    const count=controls.querySelector('[data-motion-count]');
    const preference=controls.querySelector('[data-motion-preference]');
    const panels={};
    for (const name of ['before','after']) {
      const svg=figure.querySelector(`.remag-${name} svg`);
      const nodes=new Map([...svg.querySelectorAll('[data-motion-node]')].map(el=>[el.dataset.motionNode,el]));
      const edges=new Map();
      svg.querySelectorAll('[data-motion-edge]').forEach(path => {
        edges.set(path.dataset.motionEdge,{path});
      });
      const meters=new Map();
      svg.querySelectorAll('[data-motion-meter]').forEach(node=>{
        const meter=document.createElementNS(svgNS,'rect');
        meter.classList.add('remag-motion-meter');
        meter.setAttribute('x',Number(node.getAttribute('x'))+4);
        meter.setAttribute('y',Number(node.getAttribute('y'))+Number(node.getAttribute('height'))-5);
        meter.setAttribute('width',Number(node.getAttribute('width'))-8);
        meter.setAttribute('height','2'); meter.setAttribute('aria-hidden','true');
        node.after(meter); meters.set(node.dataset.motionNode,meter);
      });
      panels[name]={nodes,edges,meters};
    }
    let index=-1, fraction=0, playing=false, raf=0, previousTime=0, seen=false;

    function progress(value) {
      for (const name of ['before','after']) {
        const panel=panels[name], state=index<0 ? side() : scene.frames[index][name];
        panel.meters.forEach((meter,key)=>{
          const active=state.active.includes(key), done=state.done.includes(key);
          meter.style.opacity=active||done ? '1' : '0';
          meter.style.transform=`scaleX(${done ? 1 : active ? Math.min(1,value*1.6) : 0})`;
        });
      }
    }
    function buttons() {
      play.hidden=reduce.matches;
      preference.hidden=!reduce.matches;
      play.textContent=playing ? 'Pause' : index===scene.frames.length-1&&fraction>=1 ? 'Replay' : index>=0 ? 'Resume' : 'Play';
      play.setAttribute('aria-label',`${play.textContent} ${figure.querySelector('.remag-figure-title').textContent}`);
      figure.dataset.motionPlaying=String(playing);
    }
    function render() {
      const current=scene.frames[index];
      label.textContent=current ? current.label : scene.intro;
      count.textContent=current ? `${index+1} / ${scene.frames.length}` : 'Overview';
      figure.dataset.motionStep=String(index+1);
      for (const name of ['before','after']) {
        const panel=panels[name], state=current ? current[name] : side();
        panel.nodes.forEach((node,key)=>{
          if (!current) delete node.dataset.motionState;
          else node.dataset.motionState=state.active.includes(key) ? 'active' : state.done.includes(key) ? 'done' : 'waiting';
        });
        panel.edges.forEach(({path},key)=>path.classList.toggle('remag-motion-flow',state.flows.includes(key)));
      }
      progress(fraction); buttons();
    }
    function pause() {
      playing=false; cancelAnimationFrame(raf); previousTime=0; buttons();
    }
    function tick(time) {
      if (!playing) return;
      if (previousTime) fraction+=Math.min(time-previousTime,100)/duration;
      previousTime=time;
      if (fraction>=1) {
        if (index===scene.frames.length-1) { fraction=1; progress(1); pause(); return; }
        index++; fraction=0; render();
      } else progress(fraction);
      raf=requestAnimationFrame(tick);
    }
    function start() {
      if (reduce.matches || document.hidden) return;
      label.setAttribute('aria-live','off');
      seen=true;
      if (index<0 || (index===scene.frames.length-1&&fraction>=1)) {index=0;fraction=0;}
      playing=true; previousTime=0; render(); raf=requestAnimationFrame(tick);
    }
    play.addEventListener('click',()=>{seen=true;playing ? pause() : start();});
    step.addEventListener('click',()=>{
      seen=true; pause(); label.setAttribute('aria-live','polite');
      index=(index+1)%scene.frames.length; fraction=1; render();
    });
    reset.addEventListener('click',()=>{seen=true;pause();index=-1;fraction=0;render();});
    controls.hidden=false; render();
    if ('IntersectionObserver' in window) {
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if (!entry.isIntersecting && playing) pause();
        else if (entry.intersectionRatio>=.65 && !seen && wide.matches && !reduce.matches && !document.hidden) start();
      }),{threshold:[0,.65]});
      observer.observe(figure.querySelector('.remag-panels'));
    }
    controllers.push({pause,refresh:()=>{pause();fraction=index<0?0:1;render();}});
  });
  reduce.addEventListener('change',()=>controllers.forEach(c=>c.refresh()));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(c=>c.pause());});
  window.addEventListener('pagehide',()=>controllers.forEach(c=>c.pause()));
  window.addEventListener('beforeprint',()=>controllers.forEach(c=>c.pause()));
})();

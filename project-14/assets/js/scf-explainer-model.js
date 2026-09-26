/* A dimensionless two-mode fixed-point model for teaching SCF iteration.
   No orbitals, pseudopotentials or SOC Hamiltonian are solved here. */
(function(root) {
  'use strict';
  const target = [.25, .60];
  const initial = [.75, -.80];
  const eigenvalues = [-1.4, .65];
  const maxIterations = 60;
  const response = x => x.map((v,i) => target[i] + eigenvalues[i]*(v-target[i]));
  function frame(input, alpha, iteration) {
    const output=response(input);
    const residual=output.map((v,i)=>v-input[i]);
    const next=input.map((v,i)=>v+alpha*residual[i]);
    // Both spatial modes have unit RMS on a periodic cell. These are
    // density-field RMS residuals, not QE's estimated SCF energy error.
    const charge=Math.abs(.20*residual[0]);
    const spin=Math.abs(.12*residual[1]);
    return {iteration,input:[...input],output,residual,next,charge,spin,
      norm:Math.hypot(charge,spin)};
  }
  function trajectory(alpha=.5) {
    if(!Number.isFinite(alpha)||alpha<.2||alpha>.8) throw new RangeError('Mixing must be in [0.2,0.8]');
    let input=[...initial]; const frames=[];
    for(let k=0;k<=maxIterations;k++) {const f=frame(input,alpha,k);frames.push(f);input=f.next;}
    return frames;
  }
  function fields(state,x,y) {
    const chargeMode=Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y);
    const spinMode=2*Math.cos(2*Math.PI*x)*Math.sin(2*Math.PI*y);
    return {n:1+.20*state[0]*chargeMode,mz:.15+.12*state[1]*spinMode};
  }
  const api={target,initial,eigenvalues,maxIterations,response,trajectory,fields};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.SCFExplainerModel=api;
})(typeof window==='undefined'?globalThis:window);

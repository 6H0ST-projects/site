const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../assets/js/scf-explainer-model.js');
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('fixed point, independently derived error decay and mixing stability',()=>{
  M.response(M.target).forEach((v,i)=>close(v,M.target[i]));
  for(const alpha of [.2,.5,.8]){
    const run=M.trajectory(alpha);
    for(const f of run){
      f.input.forEach((v,i)=>close(v,M.target[i]+(M.initial[i]-M.target[i])*(1-alpha+alpha*M.eigenvalues[i])**f.iteration));
      for(let i=0;i<2;i++)close(f.next[i],(1-alpha)*f.input[i]+alpha*f.output[i]);
    }
    assert.ok(run.at(-1).norm<run[0].norm);
  }
  assert.throws(()=>M.trajectory(1));
});
test('continuous field bounds preserve density positivity and spin admissibility',()=>{
  for(const alpha of [.2,.5,.8])for(const f of M.trajectory(alpha))for(const kind of ['input','output','next']){
    const [c,s]=f[kind];
    const nMin=1-.4*Math.abs(c),mMax=.15+.24*Math.abs(s);
    assert.ok(nMin>0);assert.ok(mMax<=nMin);
  }
});
test('sampled periodic fields conserve mean charge and agree with analytic RMS residuals',()=>{
  for(const alpha of [.2,.5,.8])for(const f of M.trajectory(alpha).filter((_,i)=>i%10===0)){
    let charge=0,rn=0,rm=0;const size=32;
    for(let i=0;i<size;i++)for(let j=0;j<size;j++){
      const x=(i+.5)/size,y=(j+.5)/size;
      const a=M.fields(f.input,x,y),b=M.fields(f.output,x,y);
      charge+=a.n;rn+=(b.n-a.n)**2;rm+=(b.mz-a.mz)**2;
      close(a.n,M.fields(f.input,x+1,y-1).n);
    }
    close(charge/size**2,1);close(Math.sqrt(rn/size**2),f.charge);close(Math.sqrt(rm/size**2),f.spin);
  }
});

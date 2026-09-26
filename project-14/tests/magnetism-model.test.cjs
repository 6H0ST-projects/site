const test=require('node:test');
const assert=require('node:assert/strict');
const m=require('../assets/js/magnetism-model.js');
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);

test('turning off SOC removes crystalline anisotropy, not magnetization',()=>{
  const a=m.anisotropy({soc:false,kind:'axis',strength:1.5});
  for(let angle=0;angle<=180;angle+=5){
    close(m.energy(angle,a),0);
    close(Math.hypot(...m.direction(angle)),1);
  }
  assert.equal(m.barrier(a,0).height,0);
});

test('MAE sign selects easy axis or easy plane, with degenerate opposite directions',()=>{
  for(const kind of ['axis','plane'])for(const strength of [.25,1,1.5]){
    const a=m.anisotropy({soc:true,kind,strength});
    close(m.energy(90,a)-m.energy(0,a),a);
    close(m.energy(0,a),m.energy(180,a));
    assert.equal(m.energy(90,a)>m.energy(0,a),kind==='axis');
    for(let angle=0;angle<180;angle+=7)close(m.energy(angle,a),m.energy(180-angle,a));
  }
});

test('axial barrier matches the maximum along the energy path and vanishes at the instability',()=>{
  for(const a of [.35,1,1.25,1.5]){
    let previous=Infinity;
    for(const fraction of [0,.2,.5,.9,1,1.2]){
      const b=2*a*fraction,result=m.barrier(a,b);
      let maximum=-Infinity;
      for(let angle=0;angle<=180;angle+=.02)maximum=Math.max(maximum,m.reversalEnergy(angle,a,b));
      close(Math.max(0,maximum-m.reversalEnergy(0,a,b)),result.height,1e-7);
      assert.ok(result.height<=previous);previous=result.height;
      assert.equal(result.stable,fraction<1);
      if(result.saddle!==null)close(m.reversalEnergy(result.saddle,a,b)-m.reversalEnergy(0,a,b),result.height);
    }
    assert.ok(m.reversalEnergy(180,a,1)<m.reversalEnergy(0,a,1));
  }
  assert.equal(m.barrier(.35,1).height,0);
  close(m.barrier(1.25,1).height,.45);
  assert.equal(m.barrier(-1,0).stable,false);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../static/img/soc-scf/feal2');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const figureData=JSON.parse(fs.readFileSync(path.join(__dirname,'../static/img/soc-scf/figure-data.json'),'utf8'));

test('every explorer tile named by the manifest exists',()=>{
  const channels=['input-mz','input-n','residual-m','residual-n','v0','bz'];
  assert.deepEqual(Object.keys(manifest.channels).sort(),[...channels].sort());
  assert.deepEqual(manifest.iterations,[1,2,3,4,5,6,7,8,9,96]);
  for(const c of channels)for(const layer of ['fe','al'])for(const s of manifest.iterations)
    assert.ok(fs.existsSync(path.join(dir,`${c}-${layer}-${String(s).padStart(2,'0')}.webp`)),`${c} ${layer} ${s}`);
});

test('history is complete, ordered and matches the quoted endpoint',()=>{
  assert.equal(manifest.history.length,96);
  manifest.history.forEach((row,i)=>{assert.equal(row[0],i+1);assert.ok(row[1]>0&&row[2]>0);});
  const last=manifest.history.at(-1);
  assert.ok(Math.abs(last[1]-3.6909171285e-7)/3.69e-7<1e-3);
  assert.ok(Math.abs(last[2]-2.6690981464e-6)/2.67e-6<1e-3);
  assert.ok(Math.abs(last[3]-4.042)<1e-3);
});

test('colour-scale ticks sit inside the bar, and atoms inside the slice',()=>{
  for(const ch of Object.values(manifest.channels)){
    ch.ticks.forEach(t=>assert.ok(t.at>=0&&t.at<=1,t.value));
    for(let i=1;i<ch.ticks.length;i++)assert.ok(ch.ticks[i].at>ch.ticks[i-1].at);
  }
  for(const layer of ['fe','al'])for(const [,x,y] of manifest.atoms[layer])assert.ok(x>=0&&x<=1&&y>=0&&y<=1);
});

test('article counts agree with the release summary',()=>{
  const f=figureData.facts,s=figureData.release_summary;
  assert.equal(s.trajectories,310);assert.equal(s.source_occurrences,49007);assert.equal(s.canonical_maps,47198);
  assert.deepEqual([s.families,s.roots,s.geometries],[22,53,163]);
  assert.equal(s.outcomes.qualified_endpoint,32);
  assert.equal(f.final_spin_gt_charge,308);assert.equal(f.histories_with_rebound,282);
  assert.equal(f.robust_moment_histories,204);assert.equal(f.robust_moment_final_within_2deg,197);
  assert.equal(f.families_without_endpoint,14);assert.equal(f.kpoints['8'],306);
  assert.deepEqual([f.late_turning.histories,f.late_turning.turning_in_second_half,f.late_turning.turning_and_qualified],[145,14,0]);
  assert.equal(Math.round(f.late_turning.median_final_spin_residual_turning/f.late_turning.median_final_spin_residual_still),9);
  assert.equal(Math.round(f.feb2_stall.turn_at_720),29);assert.equal(Math.round(f.feb2_stall.spin_over_charge_median_after_240),28);
});

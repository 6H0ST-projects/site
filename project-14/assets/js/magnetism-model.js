/* Phenomenological uniaxial magnetism, in an arbitrary energy unit E*.
   a = K1 V / E*, b = mu0 Ms V |H| / E*. The field points along -z.
   Used by the SOC article's rotate widget; not an electronic-structure calculation. */
(function(root) {
  'use strict';
  const radians=degrees=>degrees*Math.PI/180;
  function anisotropy({soc=true,kind='axis',strength=1}={}) {
    return soc?(kind==='plane'?-1:1)*strength:0;
  }
  function energy(angle,a) {return a*Math.sin(radians(angle))**2;}
  function reversalEnergy(angle,a,b) {return energy(angle,a)+b*Math.cos(radians(angle));}
  function barrier(a,b) {
    if(a<=0||b>=2*a)return {height:0,saddle:null,stable:false};
    return {height:a*(1-b/(2*a))**2,saddle:Math.acos(b/(2*a))*180/Math.PI,stable:true};
  }
  function direction(angle) {return [Math.sin(radians(angle)),Math.cos(radians(angle)),0];}
  const api={anisotropy,energy,reversalEnergy,barrier,direction};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.MagnetSketch=api;
})(typeof window!=='undefined'?window:globalThis);

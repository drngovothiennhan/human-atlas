import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const spatial=JSON.parse(await readFile(new URL('../public/data/schematic-spatial.json',import.meta.url),'utf8'));
const anchor=(code,side)=>spatial.anchors.find(a=>a.pointCode===code&&a.side===side);

test('kidney medial calf points KI-7..KI-9 sit on the medial side of the lower leg',()=>{
  for(const side of ['RIGHT','LEFT']){
    for(const code of ['KI-7','KI-8','KI-9']){
      const a=anchor(code,side);
      assert.ok(a,`${code} ${side} anchor missing`);
      const x=Math.abs(a.x);
      // Medial malleolus (KI-3) is at |x|≈0.041; the lower-leg centre is near 0.072.
      assert.ok(x>=0.02&&x<=0.055,`${code} ${side} |x|=${x} not medial`);
    }
  }
});

test('kidney calf points KI-7..KI-9 stay on the tibial level above KI-3',()=>{
  const ki3=anchor('KI-3','RIGHT').y;
  for(const code of ['KI-7','KI-8','KI-9']){
    assert.ok(anchor(code,'RIGHT').y>ki3,`${code} should be above KI-3`);
  }
  assert.ok(anchor('KI-9','RIGHT').y>anchor('KI-7','RIGHT').y,'KI-9 (5 cun) should be higher than KI-7 (2 cun)');
});

test('bladder calf route stays lateral to the kidney calf route',()=>{
  for(const code of ['BL-55','BL-56','BL-57']){
    assert.ok(Math.abs(anchor(code,'RIGHT').x)>=0.07,`${code} should remain on the posterior-lateral calf`);
  }
});

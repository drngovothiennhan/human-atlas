import test from 'node:test';
import assert from 'node:assert/strict';
import {PROBE_DIRECTIONS,fallbackInward,needleBasis,normalize,pickSkinNormal} from '../app/needle-geometry.ts';

const len=v=>Math.hypot(...v);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`${a} ≈ ${b}`);

test('probe directions: 26 unit vectors, all distinct',()=>{
  assert.equal(PROBE_DIRECTIONS.length,26);
  PROBE_DIRECTIONS.forEach(d=>close(len(d),1));
  assert.equal(new Set(PROBE_DIRECTIONS.map(d=>d.map(x=>x.toFixed(6)).join())).size,26);
});

test('pickSkinNormal takes the nearest valid hit and normalises it',()=>{
  const n=pickSkinNormal([{distance:.09,normal:[1,0,0]},{distance:.04,normal:[0,3,0]},{distance:.06,normal:[0,0,1]}],.12);
  assert.deepEqual(n,[0,1,0]);
});
test('pickSkinNormal ignores far, negative, NaN and zero-length hits',()=>{
  assert.equal(pickSkinNormal([{distance:.5,normal:[0,1,0]},{distance:-1,normal:[0,1,0]},{distance:NaN,normal:[0,1,0]},{distance:.02,normal:[0,0,0]},{distance:.02,normal:[NaN,0,1]}],.12),null);
  assert.equal(pickSkinNormal([],.12),null);
});

test('fallbackInward points horizontally to the body axis, never NaN on the axis',()=>{
  const a=fallbackInward(0.1,0),b=fallbackInward(0,0);
  close(a[0],-1);close(a[1],0);close(a[2],0);
  close(b[0],0);close(b[1],0);close(b[2],1);
});

test('perpendicular needle goes straight along the inward normal',()=>{
  const b=needleBasis([0,0,-1],90);
  close(b.entry[2],-1);close(dot(b.entry,b.grip),0,1e-9);
});
test('oblique 45° needle makes 45° with the skin plane',()=>{
  const b=needleBasis([0,0,-1],45);
  close(dot(b.entry,b.inward),Math.sin(Math.PI/4),1e-9);
  close(len(b.entry),1);
});
test('transverse needle is clamped to at least 5° and stays unit length',()=>{
  const b=needleBasis([0,0,-1],0);
  close(dot(b.entry,b.inward),Math.sin(5*Math.PI/180),1e-9);
});
test('vertex (inward = down) and sole (inward = up) do not degenerate',()=>{
  for(const inward of [[0,-1,0],[0,1,0]]){
    const b=needleBasis(inward,45);
    assert.ok(b.entry.every(Number.isFinite));
    close(len(b.entry),1);close(len(b.grip),1);
    close(dot(b.entry,b.inward),Math.sin(Math.PI/4),1e-9);
    assert.ok(Math.abs(b.tangent[2])>0.99,'leans toward the front instead of the (parallel) up axis');
  }
});
test('non-finite input falls back to a safe basis',()=>{
  const b=needleBasis([NaN,0,0],NaN);
  assert.ok([...b.entry,...b.grip].every(Number.isFinite));
  assert.deepEqual(normalize([0,0,0]),[0,0,1]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {HEAD_MUSCLE_SOURCE_NODES} from '../app/head-muscles.ts';

const read=name=>JSON.parse(fs.readFileSync(new URL('../public/models/'+name,import.meta.url),'utf8'));

test('pinned detailed anatomy manifests keep complete source coverage',()=>{
  const muscles=read('z-muscles-manifest.json'),joints=read('z-articular-manifest.json'),skeleton=read('z-skeletal-manifest.json');
  assert.equal(muscles.meshCount,484);assert.equal(new Set(muscles.nodes).size,484);
  assert.equal(joints.meshCount,413);assert.equal(new Set(joints.nodes).size,413);
  assert.equal(skeleton.meshCount,335);assert.equal(new Set(skeleton.nodes).size,335);
  for(const name of HEAD_MUSCLE_SOURCE_NODES)assert.ok(muscles.nodes.includes(name),'missing head muscle '+name);
});

test('muscle layer excludes attachment and support structures',()=>{
  const muscles=read('z-muscles-manifest.json');
  const prohibited=/(\.e\d*[lr]$|\.o[lr]$|bursa|aponeuros|retinaculum|tarsus|trochlea|tendon|tendinous|ligament|tract|linea alba|sheath|septum)/i;
  assert.deepEqual(muscles.nodes.filter(name=>prohibited.test(name)),[]);
  assert.equal(muscles.excludedMuscularInsertions,705);
});

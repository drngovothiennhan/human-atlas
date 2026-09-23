import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DETAILED_MUSCLE_SOURCE} from '../app/head-muscles.ts';
import {isMeridianLandmarkMuscle,normalizeAtlasSystems} from '../app/anatomy.ts';

const read=name=>JSON.parse(fs.readFileSync(new URL('../public/models/'+name,import.meta.url),'utf8'));

test('meridian-first runtime keeps full detailed muscle source disabled',()=>{
  assert.equal(DETAILED_MUSCLE_SOURCE.runtimeEnabled,false);
  assert.equal(DETAILED_MUSCLE_SOURCE.expectedMeshCount,484);
});

test('meridian landmark muscle profile is a bounded subset of BodyParts3D',()=>{
  const atlas=normalizeAtlasSystems(read('atlas.json'));
  const muscles=atlas.parts.filter(part=>part.system==='muscular');
  const landmarks=muscles.filter(part=>isMeridianLandmarkMuscle(part.name));
  assert.equal(muscles.length,412);
  assert.ok(landmarks.length>=20,'too few landmark muscles: '+landmarks.length);
  assert.ok(landmarks.length<muscles.length/2,'landmark profile is still too broad: '+landmarks.length+'/'+muscles.length);
  const prohibited=/(tendon|ligament|aponeuros|retinaculum|bursa|sheath|septum)/i;
  assert.deepEqual(landmarks.filter(part=>prohibited.test(part.name)),[]);
  assert.deepEqual(landmarks.filter(part=>/fascia/i.test(part.name)&&!/tensor fasciae latae/i.test(part.name)),[]);
});

test('optional skeletal and articular reference manifests remain pinned',()=>{
  const joints=read('z-articular-manifest.json'),skeleton=read('z-skeletal-manifest.json');
  assert.equal(joints.meshCount,413);assert.equal(new Set(joints.nodes).size,413);
  assert.equal(skeleton.meshCount,335);assert.equal(new Set(skeleton.nodes).size,335);
});

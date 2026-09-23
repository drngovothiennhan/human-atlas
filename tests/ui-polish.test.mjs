import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {anatomyName} from '../app/anatomy.ts';

test('common anatomy labels are Vietnamese-first',()=>{
  assert.equal(anatomyName('Femoral artery'),'Động mạch đùi');
  assert.equal(anatomyName('Left sciatic nerve'),'Thần kinh tọa trái');
  assert.equal(anatomyName('Right tibial nerve'),'Thần kinh chày phải');
  assert.equal(anatomyName('Deltoid muscle'),'Cơ delta');
  assert.equal(anatomyName('Femur'),'Xương đùi');
});

test('YHCT dashboard keeps Google search links out of the learning UI',async()=>{
  const source=await readFile(new URL('../app/yhct-study-panel.tsx',import.meta.url),'utf8');
  assert.ok(!source.includes('googleReference('));
  assert.ok(!source.includes('Tham khảo Google'));
  assert.ok(!source.includes('www.google.com/search'));
  assert.ok(source.includes('Mô phỏng 3D'));
  assert.ok(source.includes('Tra cứu nội bộ'));
});

test('meridian scene uses slower flow, smooth camera motion and no model base',async()=>{
  const source=await readFile(new URL('../app/scene.tsx',import.meta.url),'utf8');
  assert.match(source,/MERIDIAN_LINE_EDGE_RADIUS=\.00185/);
  assert.match(source,/MERIDIAN_LINE_CORE_RADIUS=\.00115/);
  assert.match(source,/clock\.elapsedTime\*\.105/);
  assert.match(source,/duration=\.92/);
  assert.match(source,/startCameraMotion\(point,destination,1\.08\)/);
  assert.match(source,/t\*t\*t\*\(t\*\(t\*6-15\)\+10\)/);
  assert.match(source,/ground\.visible=platform\.visible=ring\.visible=innerRing\.visible=false/);
});


test('meridian overlay uses anatomy depth occlusion and separated controls',async()=>{
  const [scene,panel,css]=await Promise.all([
    readFile(new URL('../app/scene.tsx',import.meta.url),'utf8'),
    readFile(new URL('../app/meridian-3d-panel.tsx',import.meta.url),'utf8'),
    readFile(new URL('../app/globals.css',import.meta.url),'utf8')
  ]);
  assert.ok(scene.includes("meridianDepthOcclusion='anatomy-surface'"));
  assert.match(scene,/depthTest:true,depthWrite:false/);
  assert.match(scene,/opacity:system==='integumentary'\?\.12:1,depthWrite:true/);
  assert.ok(panel.includes('meridian3d-exit-row'));
  assert.ok(panel.includes('meridian3d-section-label'));
  assert.ok(panel.includes('data-anatomical-location="true"'));
  assert.ok(panel.includes('data-anatomical-landmarks="true"'));
  assert.ok(css.includes('P0 display hotfix: separate exit/effect rows'));
});

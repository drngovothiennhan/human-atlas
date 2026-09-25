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
  assert.match(source,/MERIDIAN_FLOW_WORLD_SPEED=\.075/);
  assert.match(source,/clock\.elapsedTime\*entry\.speed/);
  assert.match(source,/meridianFlowDirection='source-order'/);
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
  assert.ok(scene.includes("side:surface?T.FrontSide:T.DoubleSide"));
  assert.match(scene,/side:surface\?T\.FrontSide:T\.DoubleSide,transparent:false,opacity:1,depthWrite:true/);
  assert.ok(scene.includes("surfaceFacePolicy='front-side-only'"));
  assert.ok(scene.includes("anatomyLoadPolicy='visible-chunks-on-demand'"));
  assert.ok(panel.includes('meridian3d-exit-row'));
  assert.ok(panel.includes('meridian3d-section-label'));
  assert.ok(panel.includes('data-anatomical-location="true"'));
  assert.ok(panel.includes('data-anatomical-landmarks="true"'));
  assert.ok(css.includes('P0 display hotfix: separate exit/effect rows'));
});


test('auto-rotate remains available while the meridian overlay is enabled',async()=>{
  const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
  const meridianGuard=page.slice(page.indexOf("if(!meridianOverlay.enabled)return;"),page.indexOf("const parts=useMemo",page.indexOf("if(!meridianOverlay.enabled)return;")));
  assert.ok(meridianGuard.length>0,'meridian overlay guard missing');
  assert.ok(!meridianGuard.includes('rotate:false'),'meridian overlay must not continuously force auto-rotate off');
  assert.ok(page.includes("aria-label={state.rotate?'Dừng xoay':'Xoay mô hình'}"));
});

test('anatomical layers expose independent opacity controls wired to Three.js materials',async()=>{
  const [page,scene,anatomy,css]=await Promise.all([
    readFile(new URL('../app/page.tsx',import.meta.url),'utf8'),
    readFile(new URL('../app/scene.tsx',import.meta.url),'utf8'),
    readFile(new URL('../app/anatomy.ts',import.meta.url),'utf8'),
    readFile(new URL('../app/globals.css',import.meta.url),'utf8')
  ]);
  assert.ok(anatomy.includes('DEFAULT_LAYER_OPACITY'));
  assert.ok(anatomy.includes('Object.fromEntries(SYSTEMS.map(system=>[system.id,100]))'));
  assert.ok(page.includes('aria-label={`Độ mờ lớp ${s.name.toLowerCase()}`}'));
  assert.ok(page.includes('opacity:{...v.opacity,[s.id]:value}'));
  assert.ok(scene.includes('lastState?.opacity!==s.opacity'));
  assert.ok(scene.includes('material.transparent=alpha<1'));
  assert.ok(scene.includes('material.depthWrite=alpha>=1'));
  assert.match(scene,/side:surface\?T\.FrontSide:T\.DoubleSide,transparent:false,opacity:1,depthWrite:true/);
  assert.ok(scene.includes("material.side=system.id==='integumentary'?T.FrontSide:T.DoubleSide"));
  assert.ok(scene.includes('const loadedChunks=new Set<number>()'));
  assert.ok(scene.includes('initialAnatomyChunkCount'));
  assert.ok(css.includes('.layer-opacity input'));
});

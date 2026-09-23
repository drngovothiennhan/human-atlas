import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const load=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const canonical=v=>String(v||'').trim().toUpperCase().replace(/[\s_-]+/g,'').replace(/^([A-Z]+)(\d+)$/,(_,a,n)=>a+'-'+Number(n));
const aliases=code=>code.replace(/^SJ-/,'TE-').replace(/^REN-/,'CV-').replace(/^DU-/,'GV-');

test('official release keeps the complete 361-point / 14-meridian catalogue clean',async()=>{
  const [points,meridians]=await Promise.all([
    load('../content/acupoints/acupoints.json'),
    load('../content/meridians/meridians.json')
  ]);
  assert.equal(points.length,361);
  assert.equal(meridians.length,14);
  assert.equal(new Set(points.map(p=>p.code)).size,361,'duplicate acupoint code');
  assert.ok(points.every(p=>p.code===canonical(p.code)),'non-canonical point code');
  assert.ok(points.every(p=>Array.isArray(p.sources)&&p.sources.length>0),'point missing source');
  assert.ok(points.every(p=>Number.isInteger(p.sequence)&&p.sequence>0),'invalid point sequence');
  const ids=new Set(meridians.map(m=>m.id));
  assert.ok(points.every(p=>ids.has(p.meridianId)),'point references unknown meridian');
  for(const m of meridians){
    const owned=points.filter(p=>p.meridianId===m.id).sort((a,b)=>a.sequence-b.sequence);
    assert.deepEqual(owned.map(p=>p.sequence),Array.from({length:owned.length},(_,i)=>i+1),m.id+' sequence gap');
    assert.deepEqual(owned.map(p=>p.code),m.pointIds,m.id+' pointIds drift');
  }
});

test('nomenclature and pinned spatial source cover the same canonical catalogue',async()=>{
  const [points,nomenclature,vendor]=await Promise.all([
    load('../content/acupoints/acupoints.json'),
    load('../content/acupoints/nomenclature.json'),
    load('../vendor/furia-acupuncture-3d/points.anchors.json')
  ]);
  const catalogue=points.map(p=>p.code).sort();
  const names=nomenclature.points.map(p=>p.code).sort();
  const spatial=vendor.points.map(p=>aliases(p.code)).sort();
  assert.equal(nomenclature.count,361);
  assert.equal(new Set(names).size,361,'duplicate nomenclature code');
  assert.equal(new Set(spatial).size,361,'duplicate spatial source code');
  assert.deepEqual(names,catalogue,'nomenclature catalogue drift');
  assert.deepEqual(spatial,catalogue,'spatial source catalogue drift');
});

test('topology omissions remain explicit instead of invented',async()=>{
  const [points,topology]=await Promise.all([
    load('../content/acupoints/acupoints.json'),
    load('../vendor/furia-acupuncture-3d/meridians.json')
  ]);
  const catalogue=new Set(points.map(p=>p.code));
  const topologyCodes=new Set(Object.values(topology.paths).flat(2).map(aliases));
  const missing=[...catalogue].filter(code=>!topologyCodes.has(code)).sort();
  assert.deepEqual(missing,['BL-39']);
});

test('catalogue does not publish unreviewed finite xyz as authoritative positions',async()=>{
  const points=await load('../content/acupoints/acupoints.json');
  for(const p of points){
    if(p.position3d==null)continue;
    assert.ok(['FACULTY_REVIEWED','PUBLISHED'].includes(p.reviewStatus??p.verificationStatus??''),p.code+' has unpublished position');
    assert.ok([p.position3d.x,p.position3d.y,p.position3d.z].every(Number.isFinite),p.code+' has invalid xyz');
  }
});

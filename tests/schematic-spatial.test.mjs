import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('licensed schematic spatial dataset stays unverified and complete',async()=>{
  const data=JSON.parse(await readFile(new URL('../public/data/schematic-spatial.json',import.meta.url),'utf8'));
  assert.equal(data.verificationStatus,'UNVERIFIED');
  assert.equal(data.source.repository,'FuriaRozkwit/acupuncture-3d');
  assert.equal(data.source.commit,'1fc9ec98d365c9fb035844e2775c1be05a0a05fc');
  assert.equal(data.coordinateSystem,'BodyParts3D-4.0-browser-meters-Y-up');
  assert.equal(data.anchors.length,675);
  assert.deepEqual(data.omittedTopology,['BL-39']);
  const codes=new Set(data.anchors.map(x=>x.pointCode));
  assert.equal(codes.size,361);
  for(const a of data.anchors){
    assert.equal(a.verificationStatus,'UNVERIFIED');
    assert.equal(a.sourceKind,'LICENSED_SCHEMATIC');
    assert.ok([a.x,a.y,a.z].every(Number.isFinite));
    assert.ok(a.y>=-0.02&&a.y<=1.75,'height outside BodyParts3D: '+a.pointCode);
  }
  assert.ok(data.paths.length>=28);
  assert.ok(data.paths.every(p=>p.verificationStatus==='UNVERIFIED'&&p.sourceKind==='LICENSED_SCHEMATIC'&&p.points.length>=2));
  assert.ok(!data.paths.some(p=>p.pointCodes.includes('BL-38')&&p.pointCodes.includes('BL-40')),'BL-39 omission must split topology');
});

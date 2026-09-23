import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('licensed schematic spatial dataset stays unverified and complete',async()=>{
  const data=JSON.parse(await readFile(new URL('../public/data/schematic-spatial.json',import.meta.url),'utf8'));
  assert.equal(data.verificationStatus,'UNVERIFIED');
  assert.equal(data.source.repository,'FuriaRozkwit/acupuncture-3d');
  assert.equal(data.source.commit,'1fc9ec98d365c9fb035844e2775c1be05a0a05fc');
  assert.match(data.source.license,/MIT/);
  assert.match(data.source.license,/CC BY-SA/);
  assert.equal(data.coordinateSystem,'BodyParts3D-4.0-browser-meters-Y-up');
  assert.equal(data.calibrationStatus,'DOCUMENT_CORROBORATED_3D');
  assert.equal(data.calibration.status,'DOCUMENT_CORROBORATED_3D');
  assert.match(data.calibration.documentTitle,/Ngô Trung Triều/);
  assert.match(data.calibration.method,/BodyParts3D FMA7163/);
  assert.deepEqual(data.omittedTopology,['BL-39']);
  const codes=new Set(data.anchors.map(x=>x.pointCode));
  assert.equal(codes.size,361);
  const catalogue=JSON.parse(await readFile(new URL('../content/acupoints/acupoints.json',import.meta.url),'utf8'));
  const meridians=JSON.parse(await readFile(new URL('../content/meridians/meridians.json',import.meta.url),'utf8'));
  const midlineCodes=new Set(meridians.filter(m=>['CV','GV'].includes(m.id)).flatMap(m=>m.pointIds));
  const expectedAnchorCount=catalogue.reduce((count,p)=>count+(midlineCodes.has(p.code)?1:2),0);
  assert.equal(expectedAnchorCount,670,'361-point catalogue must resolve to bilateral non-midline anchors plus one anchor for each CV/GV point');
  assert.equal(data.anchors.length,expectedAnchorCount);
  assert.deepEqual([...codes].sort(),catalogue.map(p=>p.code).sort(),'schematic point codes must join the actual UI catalogue');
  for(const meridian of meridians){
    assert.ok(data.anchors.some(a=>a.meridianId===meridian.id),'missing markers: '+meridian.id);
    assert.ok(data.paths.some(p=>p.meridianId===meridian.id),'missing paths: '+meridian.id);
  }
  assert.equal(data.anchors.filter(a=>a.meridianId==='TE').length,46);
  assert.ok(data.anchors.filter(a=>a.meridianId==='TE').every(a=>a.sourceMeridianId==='SJ'));
  assert.ok(data.paths.filter(p=>['CV','GV'].includes(p.meridianId)).every(p=>p.side==='MIDLINE'));
  assert.deepEqual(data.sourceSideWarnings.map(p=>p.pointCode).sort(),['CV-24','GV-25','GV-26','GV-27','GV-28']);
  for(const a of data.anchors){
    assert.equal(a.verificationStatus,'UNVERIFIED');
    assert.equal(a.sourceKind,'LICENSED_SCHEMATIC');
    assert.ok([a.x,a.y,a.z].every(Number.isFinite));
    assert.ok(a.y>=-0.02&&a.y<=1.75,'height outside BodyParts3D: '+a.pointCode);
  }
  assert.ok(data.paths.length>=28);
  assert.ok(data.paths.every(p=>p.verificationStatus==='UNVERIFIED'&&p.sourceKind==='LICENSED_SCHEMATIC'&&p.points.length>=2));
  assert.ok(!data.paths.some(p=>p.pointCodes.includes('BL-39')),'omitted BL-39 must not be invented into topology');
  assert.equal(data.routeOrigins?.ST?.notAnAcupoint,true,'ST route origin must remain a non-acupoint meridian landmark');
  const stPath=data.paths.find(p=>p.meridianId==='ST'&&p.pointCodes?.includes('ST-1'));
  assert.ok(stPath,'ST path containing ST-1 must exist');
  assert.deepEqual(stPath.pointCodes.slice(0,2),['ST-ROUTE-ORIGIN','ST-1'],'ST route must begin at lateral-nose origin before ST-1');
  assert.equal(stPath.points.length,stPath.pointCodes.length,'ST route origin must have a matching 3D point');
  const calibratedCodes=['LI-20','ST-1','BL-1','TE-23','GB-1','CV-24','GV-28','ST-45'];
  assert.deepEqual(data.spatialOverrides?.slice().sort(),calibratedCodes.slice().sort(),'HIU facial/endpoint calibration set must stay explicit');
  for(const code of calibratedCodes){
    const anchors=data.anchors.filter(a=>a.pointCode===code);
    assert.ok(anchors.length>=1,'missing calibrated anchor: '+code);
    assert.ok(anchors.every(a=>a.calibrationOverride==='HIU_DOCUMENT_ANATOMY_QC'),'calibration marker missing: '+code);
    assert.ok(anchors.every(a=>a.documentEvidence?.sourceId==='USER-NGO-TRUNG-TRIEU-HUYET-VI-KINH-LAC'),'document source gate missing: '+code);
    assert.ok(anchors.every(a=>Array.isArray(a.documentEvidence?.pdfPageRange)&&a.documentEvidence.pdfPageRange.length===2),'document page range missing: '+code);
    assert.ok(anchors.every(a=>a.documentEvidence?.spatialStatus==='DOCUMENT_REFERENCED_2D'),'document spatial status missing: '+code);
  }
  const spPaths=data.paths.filter(p=>p.meridianId==='SP');
  assert.ok(spPaths.length>=2,'SP bilateral paths must exist');
  for(const p of spPaths){
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 surface-following densification','SP path must be surface-projected');
    assert.ok(p.points.length>p.pointCodes.length,'SP render path must be denser than catalogue anchors');
    assert.ok(p.points.every(v=>v.length===3&&v.every(Number.isFinite)),'SP surface-projected render points must be finite xyz');
  }
  const blLowerBranch=data.paths.find(p=>p.meridianId==='BL'&&p.pointCodes.includes('BL-38')&&p.pointCodes.includes('BL-40'));
  assert.ok(blLowerBranch,'vendor-defined BL lower branch must preserve the explicit BL-38 → BL-40 adjacency');
  const bl38Index=blLowerBranch.pointCodes.indexOf('BL-38');
  assert.deepEqual(blLowerBranch.pointCodes.slice(bl38Index,bl38Index+3),['BL-38','BL-40','BL-55'],'vendor-defined BL-38 → BL-40 → BL-55 sequence must be preserved without inventing BL-39');
});

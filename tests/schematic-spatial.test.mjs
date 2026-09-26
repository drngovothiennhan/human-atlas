import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Box3,CatmullRomCurve3,Vector3} from 'three';

test('licensed schematic spatial dataset stays unverified and complete',async()=>{
  const data=JSON.parse(await readFile(new URL('../public/data/schematic-spatial.json',import.meta.url),'utf8'));
  assert.equal(data.schemaVersion,'1.3.0');
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
    assert.equal(a.anatomicalEvidence?.sourceId,'TARA-ACUPOINT-ANATOMY-2026-09-08','TARA anatomy evidence missing: '+a.pointCode);
    assert.ok(a.anatomicalEvidence?.surfaceRegionVi||a.anatomicalEvidence?.surfaceRegionEn,'surface anatomy region missing: '+a.pointCode);
  }
  assert.ok(data.paths.length>=28);
  assert.ok(data.paths.every(p=>p.verificationStatus==='UNVERIFIED'&&p.sourceKind==='LICENSED_SCHEMATIC'&&p.points.length>=2));
  assert.ok(data.paths.every(p=>p.surfaceProjection&&p.points.length>p.pointCodes.length),'every rendered route must add surface-projected controls to prevent depth-occluded straight chords');
  assert.deepEqual(data.methodology?.priority,['WHO_STANDARD_LOCATION_METHOD','TARA_ANATOMICAL_LANDMARKS','HIU_DOCUMENT_CORROBORATION','BODYPARTS3D_SKIN_PROJECTION']);
  assert.deepEqual(data.methodology?.research,['PMID:24761187','PMID:26101534']);
  for(const p of data.paths){
    assert.equal(p.flowDirection,'SOURCE_ORDER','meridian flow must follow source topology order');
    assert.equal(p.directionStart,p.pointCodes[0],'path direction start drift');
    assert.equal(p.directionEnd,p.pointCodes.at(-1),'path direction end drift');
  }
  assert.ok(!data.paths.some(p=>p.pointCodes.includes('BL-39')),'omitted BL-39 must not be invented into topology');
  assert.equal(data.routeOrigins?.ST?.notAnAcupoint,true,'ST route origin must remain a non-acupoint meridian landmark');
  assert.ok(data.spatialOverrides?.includes('ST-45'),'ST-45 lateral nail-corner override must remain enabled');
  const stPath=data.paths.find(p=>p.meridianId==='ST'&&p.pointCodes?.includes('ST-1'));
  assert.ok(stPath,'ST path containing ST-1 must exist');
  assert.deepEqual(stPath.pointCodes.slice(0,2),['ST-ROUTE-ORIGIN','ST-1'],'ST route must begin at lateral-nose origin before ST-1');
  assert.equal(stPath.points.length,stPath.pointCodes.length+(stPath.pointCodes.length-1)*4,'ST route origin and each source point must retain matching five-point render groups');
  const calibratedCodes=['LU-10','LU-11','LI-20','ST-1','BL-1','TE-23','GB-1','CV-24','GV-28','ST-45','SI-9','SI-11','SI-12','SI-13'];
  assert.deepEqual(data.spatialOverrides?.slice().sort(),calibratedCodes.slice().sort(),'HIU facial/endpoint calibration set must stay explicit');
  for(const code of calibratedCodes){
    const anchors=data.anchors.filter(a=>a.pointCode===code);
    assert.ok(anchors.length>=1,'missing calibrated anchor: '+code);
    assert.ok(anchors.every(a=>a.calibrationOverride==='HIU_DOCUMENT_ANATOMY_QC'),'calibration marker missing: '+code);
    assert.ok(anchors.every(a=>a.documentEvidence?.sourceId==='USER-NGO-TRUNG-TRIEU-HUYET-VI-KINH-LAC'),'document source gate missing: '+code);
    assert.ok(anchors.every(a=>Array.isArray(a.documentEvidence?.pdfPageRange)&&a.documentEvidence.pdfPageRange.length===2),'document page range missing: '+code);
    assert.ok(anchors.every(a=>a.documentEvidence?.spatialStatus==='DOCUMENT_REFERENCED_2D'),'document spatial status missing: '+code);
    if(code==='ST-45'){
      assert.ok(anchors.every(a=>a.projection==='BodyParts3D FMA7163 surface raycast'),'ST-45 must stay surface-projected');
    }
  }
  const luPaths=data.paths.filter(p=>p.meridianId==='LU');
  assert.ok(luPaths.length>=2,'LU bilateral paths must exist');
  for(const p of luPaths){
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 lung-channel surface-following','LU path must stay surface-projected on the anterior/radial course');
    assert.equal(p.surfaceProjectionStep,'fifth-segment','LU surface-following density must stay explicit');
    assert.equal(p.handProjection,'anchor-preserving LU-9 -> LU-10 -> LU-11 thumb course','LU hand route must not be reprojected onto the generic hand axis');
    assert.ok(p.points.length>p.pointCodes.length,'LU render path must include surface-following control points');
    assert.equal(p.pointCodes[0],'LU-1','LU route must begin at Trung phủ');
    assert.equal(p.pointCodes.at(-1),'LU-11','LU route must terminate at Thiếu thương');
  }
  const lu10=data.anchors.filter(a=>a.pointCode==='LU-10');
  assert.equal(lu10.length,2,'LU-10 must remain bilateral');
  assert.ok(lu10.every(a=>a.calibrationOverride==='HIU_DOCUMENT_ANATOMY_QC'),'LU-10 must use the HIU thenar calibration');
  assert.ok(lu10.every(a=>a.anatomicalEvidence?.surfaceRegionEn==='Palm'||a.anatomicalEvidence?.surfaceRegionVi==='Lòng bàn tay'),'LU-10 must remain on the palm/thenar region');
  const lu11=data.anchors.filter(a=>a.pointCode==='LU-11');
  assert.equal(lu11.length,2,'LU-11 must remain bilateral');
  assert.ok(lu11.every(a=>a.calibrationOverride==='HIU_DOCUMENT_ANATOMY_QC'),'LU-11 must use the HIU radial nail-edge calibration');
  assert.ok(lu11.every(a=>a.anatomicalEvidence?.surfaceRegionEn==='Thumb'||a.anatomicalEvidence?.surfaceRegionVi==='Ngón cái'),'LU-11 must remain anchored to the thumb');
  for(const a of lu11){
    const li1=data.anchors.find(point=>point.pointCode==='LI-1'&&point.side===a.side);
    assert.ok(li1,'LI-1 comparison anchor must exist for '+a.side);
    const radialSign=a.side==='RIGHT'?1:-1;
    assert.ok(a.x*radialSign>li1.x*radialSign,'LU-11 must remain radially outside LI-1 at the outer edge of the thumb nail');
    assert.ok(a.anatomicalEvidence?.landmarks?.some(item=>/thumb nail/i.test(item.label)),'LU-11 must retain the thumbnail landmark');
  }

  for(const code of ['SI-2','SI-3','SI-4']){
    const canonical=data.anchors.filter(a=>a.pointCode===code);
    assert.equal(canonical.length,2,code+' canonical anchors must remain bilateral');
    assert.ok(canonical.every(a=>!a.calibrationOverride),code+' canonical source coordinates must not be overwritten by the visual corridor fix');
  }

  const liPaths=data.paths.filter(p=>p.meridianId==='LI');
  assert.ok(liPaths.length>=2,'LI bilateral paths must exist');
  for(const p of liPaths){
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 full-route surface-following','LI full route must be surface-projected');
    assert.equal(p.points.length,p.pointCodes.length+(p.pointCodes.length-1)*4,'LI route must add four surface controls between consecutive anchors');
  }
  const siPaths=data.paths.filter(p=>p.meridianId==='SI');
  assert.equal(siPaths.length,2,'SI external course must remain bilateral');
  const fittedRig=JSON.parse(await readFile(new URL('../vendor/furia-acupuncture-3d/rig_fitted.json',import.meta.url),'utf8'));
  const atlas=JSON.parse(await readFile(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
  const kidneys=atlas.parts.filter(p=>p.system==='urinary'&&/kidney/i.test(p.name));
  assert.equal(kidneys.length,2,'kidney anatomy bounds must be available for the SI route exclusion check');
  for(const p of siPaths){
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 small-intestine channel surface-following','SI external course must follow the body surface');
    assert.equal(p.surfaceProjectionStep,'fifth-segment','SI densification interval must remain explicit');
    assert.equal(p.courseRule,'little finger → ulnar hand and forearm → posterior upper arm → shoulder and scapula → neck → cheek → anterior ear');
    assert.equal(p.internalOrganBranch,'not rendered on the body surface','internal organ course must not be drawn as a skin path');
    assert.deepEqual(p.pointCodes,meridians.find(m=>m.id==='SI').pointIds,'SI source order must remain SI-1 through SI-19');
    assert.equal(p.points.length,p.pointCodes.length+(p.pointCodes.length-1)*4,'SI path must add four surface controls between each pair of authored anchors');
    assert.ok(p.points.every(v=>v.length===3&&v.every(Number.isFinite)),'SI surface controls must have finite xyz');
    assert.equal(p.displayAnchorStride,5,'SI render anchors must remain addressable at every fifth path point');
    assert.deepEqual(p.visualAnchorCodes,['SI-2','SI-3','SI-4'],'only the three intermediate hand markers may use render-only corridor positions');
    assert.equal(p.handProjection,'reference-guided ulnar corridor SI-1 -> SI-5','SI hand path must use the supplied ulnar reference corridor');
    assert.equal(p.anchorCoordinatePolicy,'canonical schematic anchors unchanged; SI-2..SI-4 use render-only surface corridor','SI canonical anchor coordinates must remain untouched');
    const si1=data.anchors.find(a=>a.pointCode==='SI-1'&&a.side===p.side),si5=data.anchors.find(a=>a.pointCode==='SI-5'&&a.side===p.side);
    assert.deepEqual(p.points[0],[si1.x,si1.y,si1.z],'SI-1 render endpoint must remain on its canonical anchor');
    assert.deepEqual(p.points[4*5],[si5.x,si5.y,si5.z],'SI-5 render endpoint must remain on its canonical wrist anchor');
    const handStart=new Vector3(...p.points[0]),handEnd=new Vector3(...p.points[4*5]),handAxis=handEnd.clone().sub(handStart),handAxisLengthSq=handAxis.lengthSq();
    for(const routeIndex of [5,10,15]){
      const point=new Vector3(...p.points[routeIndex]),t=Math.max(0,Math.min(1,point.clone().sub(handStart).dot(handAxis)/handAxisLengthSq));
      const nearest=handStart.clone().addScaledVector(handAxis,t);
      assert.ok(point.distanceTo(nearest)<.055,'SI-1 through SI-5 render corridor must not detour away from the ulnar hand edge');
    }
    for(let segment=0;segment<4;segment++){
      const start=p.points[segment*5],end=p.points[(segment+1)*5];
      for(let sample=1;sample<5;sample++){
        const t=sample/5,actual=p.points[segment*5+sample];
        const expected=start.map((value,axis)=>Math.round((value+(end[axis]-value)*t)*1e6)/1e6);
        assert.deepEqual(actual,expected,`SI-1 through SI-5 sample ${segment+1}.${sample} must stay inside the corrected ulnar corridor`);
      }
    }
    for(const anchorIndex of [4,5,6]){
      const start=p.points[anchorIndex*5],end=p.points[(anchorIndex+1)*5];
      for(let sample=1;sample<5;sample++){
        const t=sample/5,actual=p.points[anchorIndex*5+sample];
        const expected=start.map((value,axis)=>Math.round((value+(end[axis]-value)*t)*1e6)/1e6);
        assert.deepEqual(actual,expected,`SI-${anchorIndex+1} to SI-${anchorIndex+2} sample ${sample} must stay on the authored ulnar wrist/forearm course`);
      }
    }
    const sideSign=p.side==='RIGHT'?1:-1;
    const anchor=code=>data.anchors.find(a=>a.pointCode===code&&a.side===p.side);
    const si9=anchor('SI-9'),si10=anchor('SI-10'),si11=anchor('SI-11'),si12=anchor('SI-12'),si13=anchor('SI-13');
    assert.ok(si9.x*sideSign>si10.x*sideSign,'SI-9 must sit laterally at the posterior axillary fold before the course curves onto the scapula');
    assert.ok(Math.abs(si11.y-fittedRig.vertebra.T4.z)<.01,'SI-11 must stay at T4 in the infraspinous fossa');
    assert.ok(Math.abs(si12.y-fittedRig.vertebra.T2.z)<.01,'SI-12 must sit above SI-11 in the supraspinous fossa');
    assert.ok(Math.abs(si13.y-fittedRig.vertebra.T2.z)<.01,'SI-13 must stay at the medial supraspinous fossa near T2');
    assert.ok(si13.x*sideSign<si12.x*sideSign,'SI-13 must be medial to SI-12 at the scapular spine');
    const scapularCourse=p.points.slice(8*5,14*5+1);
    assert.ok(scapularCourse.every(([,y,z])=>y>=fittedRig.vertebra.T4.z-.02&&z<-.09),'SI-9 through SI-15 must remain on the posterior upper scapular region without dropping into the lower trunk');
    const curve=new CatmullRomCurve3(p.points.map(v=>new Vector3(...v)),false,'centripetal');
    let nearestKidneyDistance=Infinity;
    for(const kidney of kidneys){
      const bounds=new Box3(new Vector3(...kidney.bounds[0]),new Vector3(...kidney.bounds[1]));
      for(let i=0;i<=4000;i++){
        const point=curve.getPointAt(i/4000),closest=point.clone().clamp(bounds.min,bounds.max);
        nearestKidneyDistance=Math.min(nearestKidneyDistance,point.distanceTo(closest));
      }
    }
    assert.ok(nearestKidneyDistance>.05,`SI ${p.side} external course must stay at least 5 cm from either kidney; found ${nearestKidneyDistance.toFixed(4)} m`);
    const first=data.anchors.find(a=>a.pointCode==='SI-1'&&a.side===p.side),last=data.anchors.find(a=>a.pointCode==='SI-19'&&a.side===p.side);
    assert.deepEqual(p.points[0],[first.x,first.y,first.z],'SI-1 anchor must remain fixed');
    assert.deepEqual(p.points.at(-1),[last.x,last.y,last.z],'SI-19 anchor must remain fixed');
  }
  const gbPaths=data.paths.filter(p=>p.meridianId==='GB');
  assert.equal(gbPaths.length,2,'GB external course must remain bilateral');
  for(const p of gbPaths){
    assert.equal(p.directionStart,'GB-1','GB course must start at GB-1');
    assert.equal(p.directionEnd,'GB-44','GB course must end at GB-44');
    assert.equal(p.pointCodes.length,44,'GB source topology must retain all 44 acupoints');
    assert.deepEqual(p.pointCodes,Array.from({length:44},(_,i)=>'GB-'+(i+1)),'GB path must preserve canonical acupoint order');
    assert.equal(p.points.length,216,'GB route must add four surface controls between consecutive anchors');
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 fitted-segment surface-following');
    assert.equal(p.anchorCoordinatePolicy,'source acupoint anchors and topology unchanged; interpolated render points surface-projected');
  }
  for(const p of data.paths.filter(p=>['LEFT','RIGHT'].includes(p.side))){
    const sideSign=p.side==='LEFT'?-1:1;
    assert.ok(p.points.every(([x])=>x*sideSign>0),`${p.meridianId} ${p.side} route must stay on its own side of the body midline`);
  }
  const li20=data.anchors.filter(a=>a.pointCode==='LI-20');
  assert.equal(li20.length,2,'LI-20 must remain bilateral');
  assert.ok(li20.every(a=>a.calibrationOverride==='HIU_DOCUMENT_ANATOMY_QC'),'LI-20 must keep HIU document calibration');
  const spPaths=data.paths.filter(p=>p.meridianId==='SP');
  assert.ok(spPaths.length>=2,'SP bilateral paths must exist');
  for(const p of spPaths){
    assert.equal(p.surfaceProjection,'BodyParts3D FMA7163 surface-following densification','SP path must be surface-projected');
    assert.ok(p.points.length>p.pointCodes.length,'SP render path must be denser than catalogue anchors');
    assert.ok(p.points.every(v=>v.length===3&&v.every(Number.isFinite)),'SP surface-projected render points must be finite xyz');
  }
  for(const p of spPaths){
    assert.equal(p.pointCodes[0],'SP-1','SP route must begin at the medial great toe');
    assert.equal(p.pointCodes.at(-1),'SP-21','SP route must terminate at Dabao on the lateral thorax');
    const sideAnchors=data.anchors.filter(a=>a.meridianId==='SP'&&a.side===p.side);
    const sp20=sideAnchors.find(a=>a.pointCode==='SP-20');
    const sp21=sideAnchors.find(a=>a.pointCode==='SP-21');
    assert.ok(sp20&&sp21,'SP upper thorax endpoint anchors must exist on '+p.side);
    assert.ok(sp21.y<sp20.y,'SP-21 must lie below SP-20 at the lateral chest, not rise onto the shoulder');
    const sideSign=p.side==='RIGHT'?1:-1;
    assert.ok(p.points.every(([x])=>x*sideSign>0),`SP ${p.side} render path must stay on its own side of the body midline`);
  }
  const blLowerBranch=data.paths.find(p=>p.meridianId==='BL'&&p.pointCodes.includes('BL-38')&&p.pointCodes.includes('BL-40'));
  assert.ok(blLowerBranch,'vendor-defined BL lower branch must preserve the explicit BL-38 → BL-40 adjacency');
  const bl38Index=blLowerBranch.pointCodes.indexOf('BL-38');
  assert.deepEqual(blLowerBranch.pointCodes.slice(bl38Index,bl38Index+3),['BL-38','BL-40','BL-55'],'vendor-defined BL-38 → BL-40 → BL-55 sequence must be preserved without inventing BL-39');
});

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const REVIEW_STATUSES=new Set(['UNVERIFIED','SOURCE_VERIFIED','FACULTY_REVIEWED','PUBLISHED']);
export const SOURCE_USE=new Set(['DIRECT_USE','REFERENCE_ONLY','QUARANTINE']);
export const SPATIAL_REGISTRATION_STATUSES=new Set(['NOT_APPLICABLE','BLOCKED','REGISTERED']);
export const LICENSE_GATE_STATUSES=new Set(['PASS','FAIL','PENDING']);
export const REGISTRATION_GATE_STATUSES=new Set(['PASS','BLOCKED','PENDING']);
export const BODY_CANONICAL_COORDINATE_SYSTEM='BodyParts3D-4.0-browser-meters-Y-up';
export const STANDARD_POINT_COUNTS=Object.freeze({LU:11,LI:20,ST:45,SP:21,HT:9,SI:19,BL:67,KI:27,PC:9,TE:23,GB:44,LR:14,GV:28,CV:24});

export function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
export function sha256Text(text){return crypto.createHash('sha256').update(text).digest('hex')}
export function isFinite3(v){return Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)}
export function canonicalAcupointCode(value){
  const compact=String(value||'').trim().toUpperCase().replace(/[\s_-]+/g,'');
  const match=compact.match(/^([A-Z]+)(\d+)$/);
  return match?`${match[1]}-${Number(match[2])}`:compact;
}

export function validateContent({root=process.cwd()}={}){
  const errors=[],warnings=[];
  const sf=path.join(root,'content/sources/sources.json');
  const mf=path.join(root,'content/meridians/meridians.json');
  const pf=path.join(root,'content/acupoints/acupoints.json');
  const cf=path.join(root,'content/spatial-candidates/candidates.json');
  const sources=readJson(sf),meridians=readJson(mf),points=readJson(pf);
  const candidates=fs.existsSync(cf)?readJson(cf):[];
  const sm=new Map(),mm=new Map(),cm=new Map();

  for(const s of sources){
    if(!s.id||sm.has(s.id))errors.push('Duplicate/missing source id: '+String(s.id));
    if(!SOURCE_USE.has(s.status))errors.push('Invalid source status: '+s.id);
    if(s.status==='DIRECT_USE'&&(!s.assetDataLicense||/UNKNOWN|UNVERIFIED|NEEDS/i.test(s.assetDataLicense)))errors.push('DIRECT_USE source has unresolved license: '+s.id);
    if(s.spatialRegistrationStatus!=null&&!SPATIAL_REGISTRATION_STATUSES.has(s.spatialRegistrationStatus))errors.push('Invalid spatialRegistrationStatus: '+s.id);
    sm.set(s.id,s);
  }

  for(const c of candidates){
    if(!c.candidateId||cm.has(c.candidateId))errors.push('Duplicate/missing spatial candidate id: '+String(c.candidateId));
    if(!sm.has(c.sourceId))errors.push('Spatial candidate '+c.candidateId+' references unknown source '+c.sourceId);
    if(!LICENSE_GATE_STATUSES.has(c.licenseGate))errors.push('Invalid licenseGate: '+c.candidateId);
    if(!REGISTRATION_GATE_STATUSES.has(c.registrationGate))errors.push('Invalid registrationGate: '+c.candidateId);
    if(typeof c.runtimeEligible!=='boolean')errors.push('runtimeEligible must be boolean: '+c.candidateId);
    const source=sm.get(c.sourceId);
    if(c.runtimeEligible){
      if(c.licenseGate!=='PASS'||source?.status!=='DIRECT_USE')errors.push('Runtime spatial candidate must pass license gate: '+c.candidateId);
      if(c.registrationGate!=='PASS'||source?.spatialRegistrationStatus!=='REGISTERED')errors.push('Runtime spatial candidate must pass registration gate: '+c.candidateId);
      if(c.canonicalCoordinateSystem!==BODY_CANONICAL_COORDINATE_SYSTEM)errors.push('Runtime spatial candidate must use BodyParts3D canonical coordinates: '+c.candidateId);
      if(!Array.isArray(c.bodypartsTransform)||c.bodypartsTransform.length!==16||!c.bodypartsTransform.every(Number.isFinite))errors.push('Runtime spatial candidate requires a finite 4x4 BodyParts3D transform: '+c.candidateId);
      if(!c.surfaceAnchorMapping)errors.push('Runtime spatial candidate requires surfaceAnchorMapping: '+c.candidateId);
    }else if(c.registrationGate==='PASS'){
      warnings.push('Spatial candidate passed registration but remains runtime-ineligible: '+c.candidateId);
    }
    cm.set(c.candidateId,c);
  }

  for(const m of meridians){
    if(!m.id||!m.code||mm.has(m.id))errors.push('Duplicate/missing meridian: '+String(m.id));
    if(!REVIEW_STATUSES.has(m.reviewStatus))errors.push('Invalid meridian reviewStatus: '+m.id);
    if(!Array.isArray(m.sources)||!m.sources.length)errors.push('Meridian missing source: '+m.id);
    for(const sid of m.sources||[])if(!sm.has(sid))errors.push('Meridian '+m.id+' references unknown source '+sid);
    if(!Array.isArray(m.pointIds))errors.push('Meridian pointIds must be array: '+m.id);
    if(!Array.isArray(m.path3d))errors.push('Meridian path3d must be array: '+m.id);
    for(const p of m.path3d||[])if(!isFinite3(p))errors.push('Invalid 3D path coordinate: '+m.id);
    mm.set(m.id,m);
  }

  const codes=new Set(),pointsByMeridian=new Map();
  for(const p of points){
    if(!p.id||!p.code)errors.push('Point missing id/code');
    const canonical=canonicalAcupointCode(p.code);
    if(canonical!==p.code)errors.push('Point code must be canonical CODE-N format: '+p.code);
    if(codes.has(p.code))errors.push('Duplicate acupoint code: '+p.code);
    codes.add(p.code);
    if(!mm.has(p.meridianId))errors.push('Point '+p.code+' references unknown meridian '+p.meridianId);
    if(!Number.isInteger(p.sequence)||p.sequence<1)errors.push('Point '+p.code+' has invalid sequence');
    const status=p.reviewStatus||p.verificationStatus;
    if(!REVIEW_STATUSES.has(status))errors.push('Invalid point review status: '+p.code);
    if(!Array.isArray(p.sources)||!p.sources.length)errors.push('Point '+p.code+' missing source');
    for(const sid of p.sources||[])if(!sm.has(sid))errors.push('Point '+p.code+' references unknown source '+sid);
    const bucket=pointsByMeridian.get(p.meridianId)||[];bucket.push(p);pointsByMeridian.set(p.meridianId,bucket);
    if(p.position3d!=null){
      if(!isFinite3([p.position3d.x,p.position3d.y,p.position3d.z]))errors.push('Invalid point xyz: '+p.code);
      for(const k of ['coordinateSystem','surfaceStructureId','source'])if(!p.position3d[k])errors.push('Point '+p.code+' position missing '+k);
      if(status==='UNVERIFIED')errors.push('Unverified point may not publish a 3D position: '+p.code);
      const spatialSource=sm.get(p.position3d.source);
      if(!spatialSource)errors.push('Point '+p.code+' position references unknown source '+p.position3d.source);
      else {
        if(spatialSource.status!=='DIRECT_USE')errors.push('Point '+p.code+' position source is not DIRECT_USE: '+p.position3d.source);
        if(spatialSource.spatialRegistrationStatus!=='REGISTERED')errors.push('Point '+p.code+' position source is not spatially REGISTERED: '+p.position3d.source);
      }
      if(p.position3d.coordinateSystem!==BODY_CANONICAL_COORDINATE_SYSTEM)errors.push('Point '+p.code+' position is not in the BodyParts3D canonical coordinate system');
    }
    const clinical=['functions','traditionalIndications','caution','needleAngle','needleDepth','method'].some(k=>p[k]!=null&&(Array.isArray(p[k])?p[k].length>0:true));
    if(clinical&&p.reviewStatus!=='PUBLISHED')errors.push('Clinical/simulation claim requires PUBLISHED: '+p.code);
  }

  const expectedTotal=Object.values(STANDARD_POINT_COUNTS).reduce((a,b)=>a+b,0);
  if(points.length!==expectedTotal)errors.push('Standard acupoint catalogue must contain '+expectedTotal+' records; found '+points.length);
  for(const [meridianId,count] of Object.entries(STANDARD_POINT_COUNTS)){
    const meridian=mm.get(meridianId);
    if(!meridian){errors.push('Missing standard meridian '+meridianId);continue}
    const expected=Array.from({length:count},(_,i)=>`${meridianId}-${i+1}`);
    const actual=(pointsByMeridian.get(meridianId)||[]).sort((a,b)=>a.sequence-b.sequence).map(p=>p.code);
    if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push('Point sequence mismatch for '+meridianId);
    if(JSON.stringify(meridian.pointIds)!==JSON.stringify(expected))errors.push('Meridian pointIds mismatch for '+meridianId);
  }

  return {
    errors,warnings,
    counts:{sources:sources.length,spatialCandidates:candidates.length,meridians:meridians.length,acupoints:points.length},
    files:{sourceFile:sf,candidateFile:cf,meridianFile:mf,pointFile:pf}
  };
}
export function lookupByCode(records,code){
  const raw=String(code||'').trim().toUpperCase(),canonical=canonicalAcupointCode(code);
  return records.find(x=>String(x.code||'').toUpperCase()===raw||canonicalAcupointCode(x.code)===canonical)||null;
}
export function normalizeVi(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim()}
export function searchRecords(records,q){
  const normalized=normalizeVi(q),canonical=canonicalAcupointCode(q);
  if(!normalized)return[];
  return records.filter(r=>canonicalAcupointCode(r.code)===canonical||[r.code,r.vietnameseName,r.englishName,r.pinyin,r.chineseName,r.meridianId].filter(Boolean).some(v=>normalizeVi(v).includes(normalized)));
}

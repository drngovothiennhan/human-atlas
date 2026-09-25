import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const VENDOR=path.join(ROOT,'vendor','furia-acupuncture-3d');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
// Preserve vendor identifiers in provenance, but join with the HIU catalogue's codes.
const channelAliases={SJ:'TE',REN:'CV',DU:'GV'};
const canonicalChannel=id=>channelAliases[id]??id;
const canonicalCode=code=>code.replace(/^[A-Z]+/,canonicalChannel);
const [pointDoc,fit,structuresDoc,topology,atlas,documentReference,anatomyLocationDoc]=await Promise.all([
  readJson(path.join(VENDOR,'points.anchors.json')),
  readJson(path.join(VENDOR,'rig_fitted.json')),
  readJson(path.join(VENDOR,'structures.json')),
  readJson(path.join(VENDOR,'meridians.json')),
  readJson(path.join(ROOT,'public','models','atlas.json')),
  readJson(path.join(ROOT,'content','references','ngo-trung-trieu-huyet-vi-kinh-lac.json')),
  readJson(path.join(ROOT,'content','acupoints','anatomical-locations.json'))
]);

const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(a[0],a[1],a[2]),unit=a=>{const n=norm(a);return n>1e-12?mul(a,1/n):[0,0,1]};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const interp=(x,xs,ys)=>{if(x<=xs[0])return ys[0];if(x>=xs[xs.length-1])return ys[ys.length-1];let i=1;while(xs[i]<x)i++;const t=(x-xs[i-1])/(xs[i]-xs[i-1]);return ys[i-1]+(ys[i]-ys[i-1])*t};
const toBrowser=p=>[p[0],p[2],p[1]],fromBrowser=p=>[p[0],p[2],p[1]];

const skin=atlas.parts.find(p=>p.system==='integumentary'&&p.name==='Skin');
if(!skin)throw new Error('BodyParts3D Skin FMA7163 not found');
const body=await readFile(path.join(ROOT,'public','models','body-'+skin.chunk+'.bin'));
const positions=new Float32Array(body.buffer,body.byteOffset+skin.positions,skin.vertexCount*3);
const indices=new Uint32Array(body.buffer,body.byteOffset+skin.indices,skin.indexCount);
const vertex=i=>[positions[i*3],positions[i*3+1],positions[i*3+2]];
function rayTriangle(o,d,a,b,c){
  const e1=sub(b,a),e2=sub(c,a),h=cross(d,e2),det=dot(e1,h);
  if(Math.abs(det)<1e-10)return Infinity;
  const inv=1/det,s=sub(o,a),u=inv*dot(s,h);if(u<0||u>1)return Infinity;
  const q=cross(s,e1),v=inv*dot(d,q);if(v<0||u+v>1)return Infinity;
  const t=inv*dot(e2,q);return t>1e-6?t:Infinity;
}
function castBrowser(o,d,limit=.65){
  const dir=unit(d);let best=Infinity;
  for(let k=0;k<indices.length;k+=3){const t=rayTriangle(o,dir,vertex(indices[k]),vertex(indices[k+1]),vertex(indices[k+2]));if(t<best&&t<=limit)best=t}
  if(Number.isFinite(best))return add(o,mul(dir,best));
  const probe=add(o,mul(dir,0.04));let bestD=Infinity,bestP=null;
  for(let i=0;i<skin.vertexCount;i++){const p=vertex(i),dd=dot(sub(p,probe),sub(p,probe));if(dd<bestD){bestD=dd;bestP=p}}
  if(!bestP)throw new Error('Skin projection failed');
  return bestP;
}
const castSource=(origin,direction,limit=.65)=>fromBrowser(castBrowser(toBrowser(origin),toBrowser(direction),limit));

const spineZ=fit.spine_curve.map(x=>x[0]),spineY=fit.spine_curve.map(x=>x[1]);
const coreY=z=>interp(z,spineZ,spineY);
const rulerZ=fit.trunk_ruler.knots.map(x=>x[0]),rulerC=fit.trunk_ruler.knots.map(x=>x[1]);
const zOfCun=c=>interp(c,rulerC,rulerZ),cunOfZ=z=>interp(z,rulerZ,rulerC);
const levels={
  pubis:fit.landmarks.pubis[2],umbilicus:fit.landmarks.umbilicus[2],xiphoid:fit.landmarks.xiphoid[2],
  sternal_notch:fit.landmarks.sternal_notch[2],chin:fit.landmarks.chin[2],vertex:fit.landmarks.vertex[2]
};
levels.nipple=levels.xiphoid+(levels.sternal_notch-levels.xiphoid)*.42;
levels.iliac_crest=fit.vertebra.L4.z;
levels.hairline_ant=levels.chin+.66*(levels.vertex-levels.chin);
const landmarkCun={pubis:0,umbilicus:5,xiphoid:13,sternal_notch:22,nipple:cunOfZ(levels.nipple),iliac_crest:cunOfZ(levels.iliac_crest)};
const vertebraZ=Object.fromEntries(Object.entries(fit.vertebra).map(([k,v])=>[k,v.z]));
const trunkLat=fit.cun.trunk_lateral_m;

function makeSegment(name,p0,p1,cunLength,{cunT0=0,cunT1=1,core=false,cunLat=null}={}){
  const eAx=unit(sub(p1,p0));let ant=sub([0,1,0],mul(eAx,dot([0,1,0],eAx)));
  if(norm(ant)<1e-6)ant=sub([0,0,1],mul(eAx,dot([0,0,1],eAx)));const eAnt=unit(ant);let eLat=unit(cross(eAnt,eAx));if(eLat[0]<0)eLat=mul(eLat,-1);
  const length=norm(sub(p1,p0)),cunM=length*(cunT1-cunT0)/cunLength;
  return {name,p0,p1,cunLength,cunT0,cunT1,core,eAx,eAnt,eLat,cunM,cunLat:cunLat??cunM};
}
const segments={};
for(const name of ['upper_arm','forearm','hand','thigh','shank','foot']){const s=fit.segments[name];segments[name]=makeSegment(name,s.p0,s.p1,s.cun_length,{cunT0:s.cun_t0??0})}
segments.trunk=makeSegment('trunk',[0,0,levels.pubis-.05],[0,0,levels.sternal_notch+.03],22,{core:true,cunLat:trunkLat});
segments.neck=makeSegment('neck',[0,0,levels.sternal_notch],[0,0,levels.chin+.004],4,{core:true,cunLat:trunkLat});
segments.head=makeSegment('head',[0,0,levels.chin],[0,0,levels.vertex],10,{core:true,cunLat:.0125*fit.height});
const axisPoint=(s,t)=>add(s.p0,mul(sub(s.p1,s.p0),clamp(t,0,1)));
const interior=(s,t)=>{const p=axisPoint(s,t);if(s.core)p[1]=coreY(p[2]);return p};
const tFromCun=(s,c,from='p0')=>from==='p1'?s.cunT1-(s.cunT1-s.cunT0)*(c/s.cunLength):s.cunT0+(s.cunT1-s.cunT0)*(c/s.cunLength);
const tForZ=(s,z)=>Math.abs(s.p1[2]-s.p0[2])<1e-9?.5:clamp((z-s.p0[2])/(s.p1[2]-s.p0[2]),0,1);
function axialT(a){
  const s=segments[a.seg];
  if('t'in a)return a.t;if('cun'in a)return tFromCun(s,a.cun,a.from??'p0');if('z_frac'in a)return tForZ(s,a.z_frac*fit.height);
  if('z_from'in a)return tForZ(s,zOfCun(landmarkCun[a.z_from]+(a.z_cun??0)));
  if('vertebra'in a)return tForZ(s,vertebraZ[a.vertebra]+(a.dz_cun??0)*trunkLat);
  throw new Error('Unsupported axial anchor '+JSON.stringify(a));
}
function limitFor(s,base,d){if(Math.abs(s.p0[0])<.02||Math.abs(d[0])<1e-6||d[0]*base[0]>=0)return .45;return clamp(-base[0]/d[0],.01,.45)}
function segmentCast(a){
  const s=segments[a.seg],t=axialT(a),out=a.out??0;let base,d;
  if('az'in a){const rad=a.az*Math.PI/180;base=interior(s,t);d=unit(add(mul(s.eAnt,Math.cos(rad)),mul(s.eLat,Math.sin(rad))))}
  else if('lat'in a){base=interior(s,t);if(a.face==='lateral'){d=(a.lat??0)>=0?s.eLat:mul(s.eLat,-1)}else{base=add(base,mul(s.eLat,a.lat*s.cunLat));d=a.face==='posterior'?mul(s.eAnt,-1):s.eAnt}}
  else throw new Error('Unsupported surface anchor '+JSON.stringify(a));
  let hit=castSource(base,d,limitFor(s,base,d));if(out)hit=add(hit,mul(unit(d),out*s.cunLat));return hit;
}
const structs=structuresDoc.structures;
const slug=s=>s.trim().toLowerCase().replace(/[()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function structRef(name){let key=slug(name);if(!structs[key]&&structs[slug(name+'.r')])key=slug(name+'.r');const m=structs[key];if(!m)throw new Error('Unknown structure '+name);return m}
function structAt(ref,along,refDir=null){let axis=ref.axis.slice(),lo=ref.extent[0],hi=ref.extent[1];if(refDir&&dot(axis,refDir)<0){axis=mul(axis,-1);[lo,hi]=[-hi,-lo]}return add(ref.centroid,mul(axis,lo+(hi-lo)*clamp(along,0,1)))}
const frameCache={};
function regionFrame(region){
  if(frameCache[region])return frameCache[region];
  const ord=['First','Second','Third','Fourth','Fifth'],bone=region==='hand'?'metacarpal':'metatarsal',refs=ord.map(o=>structRef(o+' '+bone+' bone'));
  const avg=arr=>arr.reduce((a,b)=>add(a,b),[0,0,0]).map(x=>x/arr.length);
  const base=avg(refs.map(r=>structAt(r,0))),tip=avg(refs.map(r=>structAt(r,1))),long=unit(sub(tip,base));
  const f2f=sub(refs[0].centroid,refs[4].centroid),side=unit(sub(f2f,mul(long,dot(f2f,long))));let normal=unit(cross(side,long));const f={long};
  if(region==='hand'){const pis=structRef('Pisiform bone').centroid;if(dot(sub(pis,base),normal)>0)normal=mul(normal,-1);Object.assign(f,{radial:side,ulnar:mul(side,-1),dorsal:normal,palmar:mul(normal,-1)})}
  else {if(normal[2]<0)normal=mul(normal,-1);Object.assign(f,{medial:side,lateral:mul(side,-1),dorsal:normal,plantar:mul(normal,-1)})}
  f.proximal=mul(long,-1);f.distal=long;return frameCache[region]=f;
}
function direction(name,region){
  if(region&&regionFrame(region)[name])return regionFrame(region)[name];
  const base={up:[0,0,1],down:[0,0,-1],anterior:[0,1,0],posterior:[0,-1,0],lateral:[1,0,0],medial:[-1,0,0],dorsal:[0,-1,0],palmar:[0,1,0],distal:[0,0,-1],proximal:[0,0,1]};
  if(!base[name])throw new Error('Unknown direction '+name);return base[name];
}
function structuralCast(a){
  const ref=structRef(a.struct),longDir=a.region?regionFrame(a.region).long:null;let base=structAt(ref,a.along??.5,longDir);
  if(a.toward){const other=structRef(a.toward);base=add(base,mul(sub(structAt(other,a.along??.5,longDir),base),a.frac??.4))}
  for(const [name,mm] of Object.entries(a.shift??{}))base=add(base,mul(direction(name,a.region),mm/1000));
  const d=direction(a.dir??'dorsal',a.region);return castSource(base,d,.45);
}
let scalpArcCache=null;
function scalpArc(){
  if(scalpArcCache)return scalpArcCache;const h=segments.head,tFront=tForZ(h,levels.hairline_ant),pts=[];
  for(let i=0;i<40;i++){const t=tFront+(1-tFront)*i/39;pts.push(segmentCast({seg:'head',t,az:0}))}
  for(let i=1;i<40;i++){const t=1+(tFront-.10-1)*i/39;pts.push(segmentCast({seg:'head',t,az:180}))}
  const dist=[0];for(let i=1;i<pts.length;i++)dist.push(dist[i-1]+norm(sub(pts[i],pts[i-1])));scalpArcCache={pts,dist};return scalpArcCache;
}
function scalpCast(a){
  const {pts,dist}=scalpArc(),target=clamp(a.arc_cun/12,0,1)*dist[dist.length-1];let i=1;while(i<dist.length&&dist[i]<target)i++;const t=(target-dist[i-1])/(dist[i]-dist[i-1]||1);let p=add(pts[i-1],mul(sub(pts[i],pts[i-1]),t));
  if(a.lat){const h=segments.head,tt=tForZ(h,p[2]),face=p[1]>=axisPoint(h,tt)[1]?'anterior':'posterior';p=segmentCast({seg:'head',t:tt,lat:a.lat,face})}
  return p;
}
const spatialOverrides={
  // HIU document/anatomy QC overrides. These refine only the derived runtime anchors;
  // pinned vendor source files remain immutable and provenance is preserved.
  // LU-10/LU-11 must stay on the thenar/thumb course. Use the first metacarpal
  // and distal first digit as anatomical anchors, then cast to the palmar surface
  // with a small radial offset so the route cannot drift onto the index finger.
  'LU-10':{struct:'First metacarpal bone',along:.62,dir:'palmar',shift:{radial:6},region:'hand'},
  'LU-11':{struct:'Distal phalanx of first finger of hand',along:.85,dir:'radial',region:'hand'},
  'LI-20':{struct:'Nasal bone',along:1,dir:'anterior',shift:{down:10,lateral:9}},
  'ST-1':{struct:'Anterior segment of eyeball',along:.5,dir:'anterior',shift:{down:11}},
  'BL-1':{struct:'Anterior segment of eyeball',along:.5,dir:'anterior',shift:{medial:10}},
  'TE-23':{struct:'Anterior segment of eyeball',along:.5,dir:'anterior',shift:{lateral:14,up:14}},
  'GB-1':{struct:'Anterior segment of eyeball',along:.5,dir:'anterior',shift:{lateral:13}},
  'CV-24':{struct:'Mandible',along:.5,dir:'anterior',shift:{up:19}},
  'GV-28':{struct:'Maxilla',along:.35,dir:'anterior',shift:{down:7}},
  'ST-45':{struct:'Distal phalanx of second finger of foot',along:.93,dir:'lateral',shift:{dorsal:2,distal:1},region:'foot'},
  // Re-anchor the SI shoulder/scapular arc to the anatomical regions named by
  // the point locations: SI-9 at the posterior axillary fold; SI-11 at T4 in
  // the infraspinous fossa; SI-12/13 above it in the supraspinous fossa. The
  // former proportional trunk-height guesses placed SI-11 near T6 and made
  // the continuous route dip sharply below the scapula.
  'SI-9':{seg:'upper_arm',t:.12,lat:.4,face:'posterior'},
  'SI-11':{seg:'trunk',vertebra:'T4',lat:4,face:'posterior'},
  'SI-12':{seg:'trunk',vertebra:'T2',lat:4,face:'posterior'},
  'SI-13':{seg:'trunk',vertebra:'T2',lat:2.5,face:'posterior'}
};
const documentEvidenceByMeridian=new Map(documentReference.meridians.map(item=>[item.meridianId,item]));
const anatomyEvidenceByCode=new Map(anatomyLocationDoc.points.map(item=>[item.code,item]));
if(anatomyEvidenceByCode.size!==361)throw new Error('Expected 361 TARA anatomical-location records');
for(const pointCode of Object.keys(spatialOverrides)){
  const meridianId=pointCode.match(/^([A-Z]+)-/)?.[1];
  if(!meridianId||!documentEvidenceByMeridian.has(meridianId))throw new Error('Spatial override missing document evidence: '+pointCode);
}
const resolveRight=(a,pointCode)=>{const anchor=spatialOverrides[pointCode]??a;return 'struct'in anchor?structuralCast(anchor):'arc_cun'in anchor?scalpCast(anchor):segmentCast(anchor)};
const round=x=>Math.round(x*1e6)/1e6;
const sourceSideWarnings=pointDoc.points
  .filter(point=>['CV','GV'].includes(canonicalChannel(point.channel))&&point.side!=='midline')
  .map(point=>({
    pointCode:canonicalCode(point.code),
    sourcePointCode:point.code,
    sourceSide:point.side,
    normalizedSide:'MIDLINE',
    reason:'Upstream side metadata is bilateral, but CV/GV are canonical midline channels; one midline anchor is emitted while the original side is retained here for provenance.'
  }));
const anchorOut=[];
for(const point of pointDoc.points){
  const canonicalPointCode=canonicalCode(point.code),right=resolveRight(point.anchor,canonicalPointCode),meridianId=canonicalChannel(point.channel),canonicalMidline=meridianId==='CV'||meridianId==='GV';
  const records=canonicalMidline||point.side==='midline'
    ?[['MIDLINE',[0,right[1],right[2]]]]
    :[['RIGHT',right],['LEFT',[-right[0],right[1],right[2]]]];
  for(const [side,src] of records){const p=toBrowser(src),doc=documentEvidenceByMeridian.get(meridianId),anatomy=anatomyEvidenceByCode.get(canonicalPointCode);if(!anatomy)throw new Error('Missing TARA anatomy evidence: '+canonicalPointCode);anchorOut.push({pointCode:canonicalPointCode,meridianId,sourcePointCode:point.code,sourceMeridianId:point.channel,sequence:point.index,side,x:round(p[0]),y:round(p[1]),z:round(p[2]),verificationStatus:'UNVERIFIED',sourceKind:'LICENSED_SCHEMATIC',accuracy:point.accuracy,projection:'BodyParts3D FMA7163 surface raycast',calibrationOverride:spatialOverrides[canonicalPointCode]?'HIU_DOCUMENT_ANATOMY_QC':undefined,anatomicalEvidence:{sourceId:anatomyLocationDoc.source.id,surfaceRegionVi:anatomy.surfaceRegionVi??null,surfaceRegionEn:anatomy.surfaceRegionEn??null,landmarks:(anatomy.landmarks??[]).map(item=>({label:item.label,uri:item.uri??null}))},documentEvidence:spatialOverrides[canonicalPointCode]?{sourceId:documentReference.sourceId,pdfPageRange:doc?.pdfPageRange??null,label:doc?.label??null,evidenceType:doc?.evidenceType??null,spatialStatus:doc?.spatialStatus??null}:undefined})}
}
const byKey=new Map(anchorOut.map(a=>[a.pointCode+':'+a.side,a]));
if(byKey.size!==anchorOut.length)throw new Error('Duplicate generated acupoint anchor key');
const anchorPointCodes=new Set(anchorOut.map(anchor=>anchor.pointCode));
const catalogCodes=new Set(pointDoc.points.map(point=>canonicalCode(point.code)));
const missingAnchorCodes=[...catalogCodes].filter(code=>!anchorPointCodes.has(code)).sort();
if(missingAnchorCodes.length)throw new Error('Generated acupoint anchor coverage drift: '+JSON.stringify(missingAnchorCodes));
const paths=[];
for(const [sourceMeridianId,groups] of Object.entries(topology.paths)){
  const meridianId=canonicalChannel(sourceMeridianId);
  const mid=meridianId==='CV'||meridianId==='GV',sides=mid?['MIDLINE']:['RIGHT','LEFT'];
  for(const side of sides)for(let gi=0;gi<groups.length;gi++){
    let chunk=[];const flush=()=>{if(chunk.length>=2){const pointCodes=chunk.map(x=>x.pointCode);paths.push({meridianId,side,groupIndex:gi,pointCodes,points:chunk.map(x=>[x.x,x.y,x.z]),verificationStatus:'UNVERIFIED',sourceKind:'LICENSED_SCHEMATIC',flowDirection:'SOURCE_ORDER',directionStart:pointCodes[0],directionEnd:pointCodes.at(-1)})}chunk=[]};
    // The vendor topology explicitly defines adjacency. Do not infer continuity from
    // numeric point codes: BL intentionally jumps 38→40→55 in one source branch.
    for(const sourceCode of groups[gi]){const code=canonicalCode(sourceCode),a=byKey.get(code+':'+side);if(!a){flush();continue}chunk.push(a)}
    if(meridianId==='ST'&&gi===0&&chunk.length){
      const sign=side==='LEFT'?-1:1;
      const originSource=structuralCast({struct:'Nasal bone',along:1,dir:'anterior',shift:{down:10,lateral:13}});
      const originBrowser=toBrowser([Math.abs(originSource[0])*sign,originSource[1],originSource[2]]);
      chunk.unshift({pointCode:'ST-ROUTE-ORIGIN',x:round(originBrowser[0]),y:round(originBrowser[1]),z:round(originBrowser[2])});
    }
    flush();
  }
}

// Keep the Spleen channel visually on the body surface. The catalogue anchors stay
// untouched; only render-path interpolation is densified and re-projected to the
// canonical BodyParts3D skin so layer visibility (surface vs skeleton) cannot make
// the channel appear to cut through the limb/trunk.
function projectBrowserToSegmentSurface(pointBrowser,segmentName,side='RIGHT'){
  // Segment templates are fitted on the body's +X (right) side. Mirror the
  // left route into that half before surface projection, then mirror it back;
  // otherwise left-side interpolation can raycast across the body midline.
  const mirror=side==='LEFT';
  const projectionPoint=mirror?[-pointBrowser[0],pointBrowser[1],pointBrowser[2]]:pointBrowser;
  const p=fromBrowser(projectionPoint),seg=segments[segmentName],axis=sub(seg.p1,seg.p0),den=dot(axis,axis)||1;
  const t=clamp(dot(sub(p,seg.p0),axis)/den,0,1),base=interior(seg,t),ray=sub(p,base);
  if(norm(ray)<1e-7)return pointBrowser;
  const projected=toBrowser(castSource(base,ray,.65));
  return mirror?[-projected[0],projected[1],projected[2]]:projected;
}
const spSegmentForPair=(a,b)=>{
  const seq=Math.max(numericPointSequenceForBuild(a),numericPointSequenceForBuild(b));
  if(seq<=5)return 'foot';
  if(seq<=9)return 'shank';
  if(seq<=11)return 'thigh';
  return 'trunk';
};
function numericPointSequenceForBuild(code){
  const m=String(code||'').match(/-(\d+)$/);return m?Number(m[1]):Number.MAX_SAFE_INTEGER;
}
const luSegmentForPair=(a,b,fraction)=>{
  const seqA=numericPointSequenceForBuild(a),seqB=numericPointSequenceForBuild(b);
  if(seqB<=2)return 'trunk';
  // LU-2 -> LU-3 crosses from upper chest to the anterior-lateral arm.
  // Keep the first control point on thoracic skin, then transition onto the arm.
  if(seqA===2&&seqB===3)return fraction<=.25?'trunk':'upper_arm';
  if(seqB<=4)return 'upper_arm';
  if(seqB<=9)return 'forearm';
  return 'hand';
};

// Keep the Lung channel on the visible anterior/radial surface shown in the HIU
// teaching reference: upper chest -> anterior-lateral arm -> radial forearm ->
// thenar/thumb -> radial nail edge. Catalogue topology remains LU-1 ... LU-11.
for(const pathItem of paths.filter(item=>item.meridianId==='LU')){
  const dense=[];
  for(let i=0;i<pathItem.pointCodes.length-1;i++){
    const codeA=pathItem.pointCodes[i],codeB=pathItem.pointCodes[i+1],a=pathItem.points[i],b=pathItem.points[i+1];
    if(i===0)dense.push(a);
    for(const fraction of [.2,.4,.6,.8]){
      const p=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction,a[2]+(b[2]-a[2])*fraction];
      const seqB=numericPointSequenceForBuild(codeB);
      // LU-9 -> LU-10 -> LU-11 is a thumb-specific route. The generic hand
      // segment axis runs through the metacarpal centre and can snap these
      // interpolation points toward the index finger, which is anatomically wrong.
      // Preserve interpolation between the already skin-projected thumb anchors.
      dense.push((seqB>=10?p:projectBrowserToSegmentSurface(p,luSegmentForPair(codeA,codeB,fraction),pathItem.side)).map(round));
    }
    dense.push(b);
  }
  if(pathItem.pointCodes.length===1)dense.push(pathItem.points[0]);
  pathItem.points=dense;
  pathItem.surfaceProjection='BodyParts3D FMA7163 lung-channel surface-following';
  pathItem.surfaceProjectionStep='fifth-segment';
  pathItem.handProjection='anchor-preserving LU-9 -> LU-10 -> LU-11 thumb course';
  pathItem.courseRule='upper chest -> anterior-lateral upper arm -> radial forearm -> thenar/thumb -> radial nail edge of thumb';
}

// Keep the facial end of the Large Intestine channel on the visible body surface.
// LI-18→LI-20 is densified only for rendering; catalogue adjacency stays unchanged.
for(const pathItem of paths.filter(item=>item.meridianId==='LI')){
  const dense=[];
  for(let i=0;i<pathItem.pointCodes.length-1;i++){
    const codeA=pathItem.pointCodes[i],codeB=pathItem.pointCodes[i+1],a=pathItem.points[i],b=pathItem.points[i+1];
    if(i===0)dense.push(a);
    const seqA=numericPointSequenceForBuild(codeA),seqB=numericPointSequenceForBuild(codeB),facial=seqA>=18&&seqB>=19;
    if(facial){
      for(const fraction of [.25,.5,.75]){
        const p=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction,a[2]+(b[2]-a[2])*fraction];
        const segName=codeA==='LI-18'&&fraction<.5?'neck':'head';
        dense.push(projectBrowserToSegmentSurface(p,segName,pathItem.side).map(round));
      }
    }
    dense.push(b);
  }
  if(pathItem.pointCodes.length===1)dense.push(pathItem.points[0]);
  pathItem.points=dense;
  pathItem.surfaceProjection='BodyParts3D FMA7163 facial surface-following';
}
const siSegmentForPair=(a,b,fraction)=>{
  const seqA=numericPointSequenceForBuild(a),seqB=numericPointSequenceForBuild(b);
  if(seqB<=5)return 'hand';
  // SI-5 through SI-8 are authored on the ulnar wrist/forearm surface. The
  // generic forearm-axis projection can snap these controls across the limb.
  // Preserve the authored corridor and keep its acupoint anchors fixed.
  if(seqA>=5&&seqB<=8)return null;
  if(seqB<=8)return 'forearm';
  if(seqA===8&&seqB===9)return 'upper_arm';
  if(seqB<=15)return 'trunk';
  if(seqA===15&&seqB===16)return fraction<=.5?'trunk':'neck';
  if(seqB<=17)return 'neck';
  if(seqA===17&&seqB===18)return fraction<=.4?'neck':'head';
  return 'head';
};
// The SI channel is one continuous external course: little finger and ulnar
// hand/forearm, posterior upper arm and shoulder/scapula, neck, cheek, ear.
// Its sparse licensed anchors must not be joined by straight chords through
// the torso, so densify between each authored point and raycast each sample
// back to the corresponding BodyParts3D surface segment. Keep authored
// endpoint anchors and source topology untouched; all remain UNVERIFIED.
for(const pathItem of paths.filter(item=>item.meridianId==='SI')){
  // The supplied visual reference replaces the erroneous SI-1 -> SI-5 hand
  // detour with one continuous ulnar-edge corridor. Preserve every canonical
  // acupoint anchor in anchorOut; only the render path and render-only positions
  // for SI-2/SI-3/SI-4 are corrected here.
  const routeAnchors=pathItem.points.map(point=>point.slice());
  if(pathItem.pointCodes.slice(0,5).join('|')==='SI-1|SI-2|SI-3|SI-4|SI-5'){
    const start=routeAnchors[0],end=routeAnchors[4];
    for(let i=1;i<4;i++){
      const t=i/4;
      const raw=[start[0]+(end[0]-start[0])*t,start[1]+(end[1]-start[1])*t,start[2]+(end[2]-start[2])*t];
      routeAnchors[i]=projectBrowserToSegmentSurface(raw,'hand',pathItem.side).map(round);
    }
    pathItem.displayAnchorStride=5;
    pathItem.visualAnchorCodes=['SI-2','SI-3','SI-4'];
    pathItem.handProjection='reference-guided ulnar corridor SI-1 -> SI-5';
    pathItem.anchorCoordinatePolicy='canonical schematic anchors unchanged; SI-2..SI-4 use render-only surface corridor';
  }
  const dense=[];
  for(let i=0;i<pathItem.pointCodes.length-1;i++){
    const codeA=pathItem.pointCodes[i],codeB=pathItem.pointCodes[i+1],a=routeAnchors[i],b=routeAnchors[i+1];
    if(i===0)dense.push(a);
    const preserveUlnarHandEdge=numericPointSequenceForBuild(codeB)<=5;
    for(const fraction of [.2,.4,.6,.8]){
      const p=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction,a[2]+(b[2]-a[2])*fraction];
      // The hand corridor is already constrained to the corrected ulnar route.
      // Do not feed it back through the generic segment projection because that
      // was the source of the large visual detour shown in the reference image.
      const segment=siSegmentForPair(codeA,codeB,fraction);
      dense.push((preserveUlnarHandEdge||!segment?p:projectBrowserToSegmentSurface(p,segment,pathItem.side)).map(round));
    }
    dense.push(b);
  }
  if(pathItem.pointCodes.length===1)dense.push(routeAnchors[0]);
  pathItem.points=dense;
  pathItem.surfaceProjection='BodyParts3D FMA7163 small-intestine channel surface-following';
  pathItem.surfaceProjectionStep='fifth-segment';
  pathItem.courseRule='little finger → ulnar hand and forearm → posterior upper arm → shoulder and scapula → neck → cheek → anterior ear';
  pathItem.internalOrganBranch='not rendered on the body surface';
}
for(const pathItem of paths.filter(item=>item.meridianId==='SP')){
  const dense=[];
  for(let i=0;i<pathItem.pointCodes.length-1;i++){
    const a=pathItem.points[i],b=pathItem.points[i+1],segName=spSegmentForPair(pathItem.pointCodes[i],pathItem.pointCodes[i+1]);
    if(i===0)dense.push(a);
    for(const fraction of [.25,.5,.75]){
      const p=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction,a[2]+(b[2]-a[2])*fraction];
      dense.push(projectBrowserToSegmentSurface(p,segName,pathItem.side).map(round));
    }
    dense.push(b);
  }
  if(pathItem.pointCodes.length===1)dense.push(pathItem.points[0]);
  pathItem.points=dense;
  pathItem.surfaceProjection='BodyParts3D FMA7163 surface-following densification';
  pathItem.surfaceProjectionStep='quarter-segment';
}
const codes=new Set(pointDoc.points.map(p=>canonicalCode(p.code))),topologyCodes=new Set(Object.values(topology.paths).flat(2).map(canonicalCode));
const omitted=[...codes].filter(c=>!topologyCodes.has(c)).sort();
const generatedPathCodes=new Set(paths.flatMap(path=>path.pointCodes).filter(code=>code!=='ST-ROUTE-ORIGIN'));
const missingGenerated=[...topologyCodes].filter(code=>!generatedPathCodes.has(code)).sort();
const extraGenerated=[...generatedPathCodes].filter(code=>!topologyCodes.has(code)).sort();
if(missingGenerated.length||extraGenerated.length)throw new Error('Generated meridian topology drift: '+JSON.stringify({missingGenerated,extraGenerated}));
const endpointAudit={};
for(const sourceMeridianId of Object.keys(topology.paths)){
  const meridianId=canonicalChannel(sourceMeridianId),records=pointDoc.points.filter(point=>point.channel===sourceMeridianId).sort((a,b)=>a.index-b.index);
  if(!records.length)throw new Error('No point records for '+sourceMeridianId);
  const start=canonicalCode(records[0].code),end=canonicalCode(records.at(-1).code),sides=meridianId==='CV'||meridianId==='GV'?['MIDLINE']:['RIGHT','LEFT'];
  endpointAudit[meridianId]={start,end,count:records.length,sides:{}};
  for(const side of sides){
    const sideCodes=new Set(paths.filter(path=>path.meridianId===meridianId&&path.side===side).flatMap(path=>path.pointCodes));
    const startPresent=sideCodes.has(start),endPresent=sideCodes.has(end);
    endpointAudit[meridianId].sides[side]={startPresent,endPresent};
    if(!startPresent||!endPresent)throw new Error('Generated meridian endpoint drift: '+JSON.stringify({meridianId,side,start,end,startPresent,endPresent}));
  }
}

const routeOrigins={ST:{label:'Điểm khởi đường Kinh Vị',description:'Khởi từ vùng ngoài cánh mũi trước khi đi tới huyệt ST-1 Thừa khấp; đây là mốc đường kinh, không phải huyệt.',notAnAcupoint:true}};
const out={schemaVersion:'1.3.0',coordinateSystem:'BodyParts3D-4.0-browser-meters-Y-up',verificationStatus:'UNVERIFIED',calibrationStatus:'DOCUMENT_CORROBORATED_3D',calibration:{status:'DOCUMENT_CORROBORATED_3D',method:'Anatomical landmarks first; proportional cun/region rules second; final positions are raycast to the BodyParts3D FMA7163 skin. Two-dimensional references corroborate region/course but never promote a point to verified 3D.',documentSourceId:documentReference.sourceId,documentTitle:documentReference.document.title+' — '+documentReference.document.author,documentPages:documentReference.document.pdfPages},methodology:{priority:['WHO_STANDARD_LOCATION_METHOD','TARA_ANATOMICAL_LANDMARKS','HIU_DOCUMENT_CORROBORATION','BODYPARTS3D_SKIN_PROJECTION'],whoStandard:'WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008)',taraSource:anatomyLocationDoc.source.id,research:['PMID:24761187','PMID:26101534'],flowDirection:'canonical/source topology order'},source:{repository:'FuriaRozkwit/acupuncture-3d',commit:'1fc9ec98d365c9fb035844e2775c1be05a0a05fc',license:'MIT anchors/code; CC BY-SA calibrated anatomy metadata',skin:'BodyParts3D FMA7163'},anchors:anchorOut,paths,omittedTopology:omitted,generatedBy:'scripts/build-furia-schematic.mjs'};
out.channelAliases=channelAliases;out.sourceSideWarnings=sourceSideWarnings;out.routeOrigins=routeOrigins;out.spatialOverrides=Object.keys(spatialOverrides);
out.anchorCoverage={catalogPoints:catalogCodes.size,generatedPointCodes:anchorPointCodes.size,generatedAnchors:anchorOut.length,missingAnchorCodes};
out.pathCoverage={catalogPoints:codes.size,sourceTopologyPoints:topologyCodes.size,generatedTopologyPoints:generatedPathCodes.size,missingGenerated,extraGenerated};
out.endpointAudit=endpointAudit;
await mkdir(path.join(ROOT,'public','data'),{recursive:true});
await writeFile(path.join(ROOT,'public','data','schematic-spatial.json'),JSON.stringify(out,null,2)+'\n');
console.log('FURIA_SCHEMATIC_BUILD '+JSON.stringify({anchors:anchorOut.length,paths:paths.length,omitted,anchorCoverage:out.anchorCoverage,pathCoverage:out.pathCoverage,endpoints:endpointAudit,normalizedMidlineSides:sourceSideWarnings.length}));

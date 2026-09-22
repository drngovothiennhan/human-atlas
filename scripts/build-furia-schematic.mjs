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
const [pointDoc,fit,structuresDoc,topology,atlas]=await Promise.all([
  readJson(path.join(VENDOR,'points.anchors.json')),
  readJson(path.join(VENDOR,'rig_fitted.json')),
  readJson(path.join(VENDOR,'structures.json')),
  readJson(path.join(VENDOR,'meridians.json')),
  readJson(path.join(ROOT,'public','models','atlas.json'))
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
const resolveRight=a=>'struct'in a?structuralCast(a):'arc_cun'in a?scalpCast(a):segmentCast(a);
const round=x=>Math.round(x*1e6)/1e6;
const anchorOut=[];
for(const point of pointDoc.points){
  const right=resolveRight(point.anchor),records=point.side==='midline'?[['MIDLINE',[0,right[1],right[2]]]]:[['RIGHT',right],['LEFT',[-right[0],right[1],right[2]]]];
  for(const [side,src] of records){const p=toBrowser(src);anchorOut.push({pointCode:canonicalCode(point.code),meridianId:canonicalChannel(point.channel),sourcePointCode:point.code,sourceMeridianId:point.channel,sequence:point.index,side,x:round(p[0]),y:round(p[1]),z:round(p[2]),verificationStatus:'UNVERIFIED',sourceKind:'LICENSED_SCHEMATIC',accuracy:point.accuracy,projection:'BodyParts3D FMA7163 surface raycast'})}
}
const byKey=new Map(anchorOut.map(a=>[a.pointCode+':'+a.side,a]));
const paths=[];
const seq=n=>Number((n.match(/-(\d+)$/)||[])[1]||0);
for(const [sourceMeridianId,groups] of Object.entries(topology.paths)){
  const meridianId=canonicalChannel(sourceMeridianId);
  const mid=meridianId==='CV'||meridianId==='GV',sides=mid?['MIDLINE']:['RIGHT','LEFT'];
  for(const side of sides)for(let gi=0;gi<groups.length;gi++){
    let chunk=[];const flush=()=>{if(chunk.length>=2){paths.push({meridianId,side,groupIndex:gi,pointCodes:chunk.map(x=>x.pointCode),points:chunk.map(x=>[x.x,x.y,x.z]),verificationStatus:'UNVERIFIED',sourceKind:'LICENSED_SCHEMATIC'})}chunk=[]};
    let prev=null;
    for(const sourceCode of groups[gi]){const code=canonicalCode(sourceCode),a=byKey.get(code+':'+side);if(!a){flush();prev=null;continue}if(prev&&seq(code)-seq(prev)>1)flush();chunk.push(a);prev=code}
    flush();
  }
}
const codes=new Set(pointDoc.points.map(p=>canonicalCode(p.code))),topologyCodes=new Set(Object.values(topology.paths).flat(2).map(canonicalCode));
const omitted=[...codes].filter(c=>!topologyCodes.has(c)).sort();
// Do not silently alter the five upstream bilateral records in midline channels.
const sourceSideWarnings=pointDoc.points.filter(p=>['CV','GV'].includes(canonicalChannel(p.channel))&&p.side!=='midline').map(p=>({pointCode:canonicalCode(p.code),sourcePointCode:p.code,sourceSide:p.side,reason:'Upstream bilateral record excluded from midline path pending review'}));
const out={schemaVersion:'1.0.0',coordinateSystem:'BodyParts3D-4.0-browser-meters-Y-up',verificationStatus:'UNVERIFIED',source:{repository:'FuriaRozkwit/acupuncture-3d',commit:'1fc9ec98d365c9fb035844e2775c1be05a0a05fc',license:'MIT anchors/code; CC BY-SA calibrated anatomy metadata',skin:'BodyParts3D FMA7163'},anchors:anchorOut,paths,omittedTopology:omitted,generatedBy:'scripts/build-furia-schematic.mjs'};
out.channelAliases=channelAliases;out.sourceSideWarnings=sourceSideWarnings;
await mkdir(path.join(ROOT,'public','data'),{recursive:true});
await writeFile(path.join(ROOT,'public','data','schematic-spatial.json'),JSON.stringify(out,null,2)+'\n');
console.log('FURIA_SCHEMATIC_BUILD '+JSON.stringify({anchors:anchorOut.length,paths:paths.length,omitted}));

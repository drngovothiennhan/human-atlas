import fs from 'node:fs';
import assert from 'node:assert/strict';

const root=new URL('../vendor/furia-acupuncture-3d/',import.meta.url);
const points=JSON.parse(fs.readFileSync(new URL('points.anchors.json',root),'utf8'));
const meridians=JSON.parse(fs.readFileSync(new URL('meridians.json',root),'utf8'));
const rig=JSON.parse(fs.readFileSync(new URL('rig.json',root),'utf8'));
const structures=JSON.parse(fs.readFileSync(new URL('structures.json',root),'utf8'));
const source=JSON.parse(fs.readFileSync(new URL('SOURCE.json',root),'utf8'));

assert.equal(points.schemaVersion,'1.0.0');
assert.equal(points.source.repository,'FuriaRozkwit/acupuncture-3d');
assert.equal(points.source.commit,source.commit);
assert.equal(points.points.length,361);
assert.equal(new Set(points.points.map(point=>point.code)).size,361);
const channels=new Set(points.points.map(point=>point.channel));
assert.equal(channels.size,14);

for(const point of points.points){
  assert.ok(/^([A-Z]{2,3})-\d+$/.test(point.code),point.code);
  assert.ok(Number.isInteger(point.index)&&point.index>0,point.code);
  assert.ok(point.anchor&&typeof point.anchor==='object',point.code);
  for(const banned of ['categories','english','pinyin','note','note_pl','indications','needling','location','actions']){
    assert.ok(!(banned in point),`${point.code}: prohibited prose field ${banned}`);
  }
}

const sourcePointCounts={LU:11,LI:20,ST:45,SP:21,HT:9,SI:19,BL:67,KI:27,PC:9,SJ:23,GB:44,LR:14,REN:24,DU:28};
const endpointAudit={};
for(const [channel,count] of Object.entries(sourcePointCounts)){
  const records=points.points.filter(point=>point.channel===channel).sort((a,b)=>a.index-b.index);
  assert.equal(records.length,count,channel+' point count');
  assert.deepEqual(records.map(point=>point.index),Array.from({length:count},(_,i)=>i+1),channel+' index sequence');
  assert.equal(records[0].code,channel+'-1',channel+' start point');
  assert.equal(records.at(-1).code,channel+'-'+count,channel+' end point');
  const sourcePaths=meridians.paths[channel]||[],codes=new Set(sourcePaths.flat());
  assert.ok(codes.has(channel+'-1'),channel+' topology missing start');
  assert.ok(codes.has(channel+'-'+count),channel+' topology missing end');
  endpointAudit[channel]={start:channel+'-1',end:channel+'-'+count,count};
}

const pathCodes=[];
for(const paths of Object.values(meridians.paths)){
  for(const path of paths)for(const code of path)pathCodes.push(code);
}
const topologyCodes=new Set(pathCodes);
assert.equal(topologyCodes.size,360);
const omitted=points.points.map(point=>point.code).filter(code=>!topologyCodes.has(code));
assert.deepEqual(omitted,['BL-39']);
assert.ok(rig.default_height_m>1&&rig.default_height_m<2.5);
assert.ok(Object.keys(rig.cun_lengths).length>=9);
assert.ok(Object.keys(structures.structures||{}).length>=44);
assert.equal(source.files['data/structures.json'].license,'CC BY-SA 4.0');

console.log(JSON.stringify({
  sourceCommit:source.commit,
  points:points.points.length,
  channels:channels.size,
  topologyPoints:topologyCodes.size,
  topologyOmitted:omitted,
  endpoints:endpointAudit,
  structuralPoints:points.points.filter(point=>Boolean(point.anchor.struct)).length,
  scalpPoints:points.points.filter(point=>Number.isFinite(point.anchor.arc_cun)).length,
  status:'PASS'
}));

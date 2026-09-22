import {mkdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_REPO='Nurkan1/Anatria-3D';
const SOURCE_COMMIT='949ac80cc9763539afc48e60b5246132f00468db';
const RAW='https://raw.githubusercontent.com/'+SOURCE_REPO+'/'+SOURCE_COMMIT+'/';
const files=[
  ['public/anatomy/muscular_male.glb','public/models/z-muscular-male.glb'],
  ['public/anatomy/articular_male.glb','public/models/z-articular-male.glb'],
  ['public/draco/draco_decoder.js','public/draco/draco_decoder.js'],
  ['public/draco/draco_wasm_wrapper.js','public/draco/draco_wasm_wrapper.js'],
  ['public/draco/draco_decoder.wasm','public/draco/draco_decoder.wasm']
];

async function usable(path){
  try{return (await stat(path)).size>1024}catch{return false}
}
async function fetchPinned(source,dest){
  const target=join(ROOT,dest);
  if(await usable(target))return {dest,bytes:(await stat(target)).size,cached:true};
  await mkdir(dirname(target),{recursive:true});
  const response=await fetch(RAW+source,{headers:{'user-agent':'HIU-YHCT-3D-Atlas-build'}});
  if(!response.ok)throw new Error('Failed to fetch '+source+': HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<1024)throw new Error('Refusing suspiciously small asset '+source+' ('+bytes.length+' bytes)');
  await writeFile(target,bytes);
  return {dest,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),cached:false};
}
async function fetchJsonPinned(source){
  const response=await fetch(RAW+source,{headers:{'user-agent':'HIU-YHCT-3D-Atlas-build'}});
  if(!response.ok)throw new Error('Failed to fetch '+source+': HTTP '+response.status);
  const value=await response.json();
  if(!value||!Array.isArray(value.objects))throw new Error('Invalid source report '+source);
  return value;
}

const fetched=[];
for(const pair of files)fetched.push(await fetchPinned(...pair));

const [muscularReport,articularReport]=await Promise.all([
  fetchJsonPinned('tools/asset-pipeline/vendor/reports/muscular.json'),
  fetchJsonPinned('tools/asset-pipeline/vendor/reports/articular.json')
]);
if(muscularReport.object_count!==1388||muscularReport.objects.length!==1388)throw new Error('Muscular source object count drift');
if(articularReport.object_count!==413||articularReport.objects.length!==413)throw new Error('Articular source object count drift');

// Keep actual muscle meshes only. Z-Anatomy deliberately stores attachment markings,
// bursae, fascia and tendon/support structures in the same source collection; those
// are not muscle bellies and must not be rendered as if they were muscles.
const supportName=/(bursa|aponeuros|retinaculum|tarsus|trochlea|tendon|tendinous|ligament|tract|linea alba|sheath|septum)/i;
const muscleObjects=muscularReport.objects.filter(object=>
  !object.path.some(part=>/muscular insertions/i.test(part))&&
  object.path.some(part=>/\bmuscles?\b/i.test(part))&&
  !supportName.test(object.name)
);
if(muscleObjects.length!==484)throw new Error('Muscle-belly manifest drift: '+muscleObjects.length+'/484');

const writeManifest=async(name,payload)=>writeFile(join(ROOT,'public/models',name),JSON.stringify(payload,null,2)+'\n');
await writeManifest('z-muscles-manifest.json',{
  schemaVersion:'1.0.0',
  sourceRepository:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourceReport:'tools/asset-pipeline/vendor/reports/muscular.json',
  sourceObjectCount:muscularReport.object_count,
  excludedMuscularInsertions:muscularReport.objects.filter(object=>object.path.some(part=>/muscular insertions/i.test(part))).length,
  meshCount:muscleObjects.length,
  nodes:muscleObjects.map(object=>object.name)
});
await writeManifest('z-articular-manifest.json',{
  schemaVersion:'1.0.0',
  sourceRepository:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourceReport:'tools/asset-pipeline/vendor/reports/articular.json',
  meshCount:articularReport.object_count,
  nodes:articularReport.objects.map(object=>object.name)
});

const provenance={
  sourceRepository:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourceAssets:['public/anatomy/muscular_male.glb','public/anatomy/articular_male.glb'],
  derivedFrom:['Z-Anatomy','BodyParts3D'],
  license:'CC BY-SA 4.0',
  upstreamMuscularObjectCount:1388,
  renderedMuscleMeshCount:muscleObjects.length,
  articularMeshCount:articularReport.object_count,
  use:'High-detail male muscle-belly and articular teaching layers. Muscle insertion markings and non-muscle support sheets are excluded from the muscle-belly layer.',
  attribution:'Anatria3D adaptation of Z-Anatomy / BodyParts3D. Preserve CC BY-SA 4.0 attribution when redistributing the derived mesh assets.'
};
await writeFile(join(ROOT,'public/models/z-muscles-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log('Z_ANATOMY_SOURCE_READY '+JSON.stringify({
  sourceCommit:SOURCE_COMMIT,
  files:fetched.map(({dest,bytes,cached})=>({dest,bytes,cached})),
  muscleMeshes:muscleObjects.length,
  excludedMuscularInsertions:provenance.upstreamMuscularObjectCount-muscularReport.objects.filter(object=>!object.path.some(part=>/muscular insertions/i.test(part))).length,
  articularMeshes:articularReport.object_count
}));

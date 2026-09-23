import {mkdir,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_REPO='Nurkan1/Anatria-3D';
const SOURCE_COMMIT='949ac80cc9763539afc48e60b5246132f00468db';
const RAW='https://raw.githubusercontent.com/'+SOURCE_REPO+'/'+SOURCE_COMMIT+'/';
const files=[
  ['public/anatomy/articular_male.glb','public/models/z-articular-male.glb'],
  ['public/anatomy/skeletal_male.glb','public/models/z-skeletal-male.glb'],
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

const [articularReport,skeletalReport]=await Promise.all([
  fetchJsonPinned('tools/asset-pipeline/vendor/reports/articular.json'),
  fetchJsonPinned('tools/asset-pipeline/vendor/reports/skeletal.json')
]);
if(articularReport.object_count!==413||articularReport.objects.length!==413)throw new Error('Articular source object count drift');
if(skeletalReport.object_count!==335||skeletalReport.objects.length!==335)throw new Error('Skeletal source object count drift');

const writeManifest=async(name,payload)=>writeFile(join(ROOT,'public/models',name),JSON.stringify(payload,null,2)+'\n');
await writeManifest('z-skeletal-manifest.json',{
  schemaVersion:'1.0.0',sourceRepository:SOURCE_REPO,sourceCommit:SOURCE_COMMIT,sourceReport:'tools/asset-pipeline/vendor/reports/skeletal.json',meshCount:skeletalReport.object_count,nodes:skeletalReport.objects.map(object=>object.name)
});
await writeManifest('z-articular-manifest.json',{
  schemaVersion:'1.0.0',
  sourceRepository:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourceReport:'tools/asset-pipeline/vendor/reports/articular.json',
  meshCount:articularReport.object_count,
  nodes:articularReport.objects.map(object=>object.name)
});

console.log('REFERENCE_ANATOMY_SOURCE_READY '+JSON.stringify({
  sourceCommit:SOURCE_COMMIT,
  files:fetched.map(({dest,bytes,cached})=>({dest,bytes,cached})),
  articularMeshes:articularReport.object_count,
  skeletalMeshes:skeletalReport.object_count
}));

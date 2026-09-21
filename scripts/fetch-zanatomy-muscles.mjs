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

const fetched=[];
for(const pair of files)fetched.push(await fetchPinned(...pair));

const provenance={
  sourceRepository:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourcePath:'public/anatomy/muscular_male.glb',
  derivedFrom:['Z-Anatomy','BodyParts3D'],
  license:'CC BY-SA 4.0',
  upstreamObjectCount:1388,
  use:'Optional high-detail male muscular-system teaching layer. This asset is kept separate from the MIT application code and from the CC BY 4.0 BodyParts3D package already in this repository.',
  attribution:'Anatria3D adaptation of Z-Anatomy / BodyParts3D. Preserve CC BY-SA 4.0 attribution when redistributing the derived mesh asset.'
};
await writeFile(join(ROOT,'public/models/z-muscles-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log('Z_MUSCLES_SOURCE_READY '+JSON.stringify({sourceCommit:SOURCE_COMMIT,files:fetched.map(({dest,bytes,cached})=>({dest,bytes,cached}))}));

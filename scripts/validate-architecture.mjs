import {access,readFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const exists=async path=>{try{await access(join(ROOT,path),constants.F_OK);return true}catch{return false}};
const fail=message=>{throw new Error('ARCHITECTURE_GUARD: '+message)};
const read=path=>readFile(join(ROOT,path),'utf8');

const required=[
  'app/reference-anatomy.ts',
  'scripts/fetch-reference-anatomy.mjs'
];
for(const path of required)if(!await exists(path))fail('missing required meridian-first file '+path);

const forbiddenPaths=[
  'app/head-muscles.ts',
  'scripts/fetch-zanatomy-muscles.mjs',
  'tests/detailed-anatomy.test.mjs',
  'public/models/z-muscular-male.glb',
  'public/models/z-muscles-manifest.json'
];
for(const path of forbiddenPaths)if(await exists(path))fail('retired architecture file returned: '+path);

const scene=await read('app/scene.tsx');
for(const token of [
  'DETAILED_MUSCLE_SOURCE',
  'HEAD_MUSCLE_SOURCE',
  'HEAD_MUSCLE_SOURCE_NODES',
  'ensureDetailedMuscles',
  'fullDetailedMusclesRuntime',
  'detailedMusclesStatus',
  'z-muscular-male'
])if(scene.includes(token))fail('retired runtime token in app/scene.tsx: '+token);
if(!scene.includes("dataset.anatomyProfile='meridian-first'"))fail('scene is not explicitly meridian-first');
if(!scene.includes("dataset.musclePolicy='meridian-landmarks'"))fail('scene muscle policy is not meridian-landmarks');

const reference=await read('app/reference-anatomy.ts');
if(!reference.includes('SKELETAL_SOURCE')||!reference.includes('ARTICULAR_SOURCE'))fail('reference anatomy must keep skeletal and articular sources');
if(/MUSCLE|muscular|z-muscular/i.test(reference))fail('reference anatomy must not contain retired muscle runtime sources');

const pkg=JSON.parse(await read('package.json'));
const contentBuild=String(pkg.scripts?.['content:build']??'');
if(!contentBuild.includes('fetch-reference-anatomy.mjs'))fail('content build must use fetch-reference-anatomy.mjs');
if(contentBuild.includes('fetch-zanatomy-muscles.mjs'))fail('content build references retired muscle fetcher');
if(pkg.scripts?.['source:muscles:fetch'])fail('retired source:muscles:fetch script returned');
if(pkg.scripts?.['source:anatomy:fetch']!=='node scripts/fetch-reference-anatomy.mjs')fail('source:anatomy:fetch is not canonical');

console.log('ARCHITECTURE_GUARD_PASS '+JSON.stringify({
  profile:'meridian-first',
  muscles:'BodyParts3D-landmarks-only',
  referenceLayers:['skeletal','articular'],
  retiredDetailedMuscleRuntime:false
}));

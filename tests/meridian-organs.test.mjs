import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MERIDIAN_ORGANS,VISCERAL_NODES} from '../app/meridian-organs.ts';
import {normalizeAtlasSystems,ORGAN_SYSTEMS} from '../app/anatomy.ts';
import {VISCERAL_SOURCE} from '../app/reference-anatomy.ts';

const atlas=normalizeAtlasSystems(JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8')));
const MAIN=['LU','LI','ST','SP','HT','SI','BL','KI','PC','TE','GB','LR'];

test('every chính kinh has a thuộc and a lạc tạng phủ, paired biểu–lý',()=>{
  assert.deepEqual(Object.keys(MERIDIAN_ORGANS).sort(),[...MAIN].sort());
  const expected={LU:['Phế','Đại trường'],LI:['Đại trường','Phế'],ST:['Vị','Tỳ'],SP:['Tỳ','Vị'],HT:['Tâm','Tiểu trường'],SI:['Tiểu trường','Tâm'],BL:['Bàng quang','Thận'],KI:['Thận','Bàng quang'],PC:['Tâm bào','Tam tiêu'],TE:['Tam tiêu','Tâm bào'],GB:['Đởm','Can'],LR:['Can','Đởm']};
  for(const id of MAIN)assert.deepEqual([MERIDIAN_ORGANS[id].thuoc.label,MERIDIAN_ORGANS[id].lac.label],expected[id],id);
});

test('organ highlight names exist in the atlas and are organs, not skin',()=>{
  const byName=new Map(atlas.parts.map(part=>[part.name,part.system]));
  for(const link of Object.values(MERIDIAN_ORGANS))for(const organ of [link.thuoc,link.lac]){
    for(const name of organ.parts){assert.ok(byName.has(name),organ.label+': '+name);assert.ok(ORGAN_SYSTEMS.includes(byName.get(name)),name+' is in '+byName.get(name));}
    for(const name of organ.visceral)assert.ok(VISCERAL_NODES.includes(name),organ.label+': '+name);
    if(!organ.parts.length&&!organ.visceral.length)assert.ok(organ.note,organ.label+' needs a note when nothing is highlighted');
  }
});

test('visceral layer renders only lungs and liver, matching the fetch manifest',()=>{
  assert.equal(VISCERAL_NODES.length,VISCERAL_SOURCE.expectedMeshCount);
  const fetcher=fs.readFileSync(new URL('../scripts/fetch-reference-anatomy.mjs',import.meta.url),'utf8');
  for(const name of VISCERAL_NODES)assert.ok(fetcher.includes(`'${name}'`),name);
  assert.equal(VISCERAL_SOURCE.commit,'949ac80cc9763539afc48e60b5246132f00468db');
});

test('brain ventricles leave the heart layer; organ preset includes brain and spleen',()=>{
  const cardiac=atlas.parts.filter(part=>part.system==='cardiac').map(part=>part.name);
  for(const name of ['Fourth ventricle','Third ventricle','Left lateral ventricle','Right lateral ventricle','Interventricular foramen']){
    assert.ok(!cardiac.includes(name),name);assert.equal(atlas.parts.find(part=>part.name===name)?.system,'nervous',name);
  }
  assert.ok(cardiac.includes('Wall of ventricle'));
  assert.ok(ORGAN_SYSTEMS.includes('nervous')&&ORGAN_SYSTEMS.includes('lymphatic'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseDeepLink,normalizePointCode,MERIDIAN_POINT_COUNT,DEEP_LINK_MERIDIANS} from '../app/deep-link.ts';

test('point codes normalise to the catalog form',()=>{
  assert.equal(normalizePointCode('st36'),'ST-36');
  assert.equal(normalizePointCode('ST-36'),'ST-36');
  assert.equal(normalizePointCode(' li_4 '),'LI-4');
  assert.equal(normalizePointCode('ST-046'),null);
  assert.equal(normalizePointCode('ST46'),null);
  assert.equal(normalizePointCode('XX1'),null);
  assert.equal(normalizePointCode('<script>'),null);
  assert.equal(normalizePointCode(null),null);
});

test('deep links become study commands',()=>{
  assert.deepEqual(parseDeepLink('?huyet=ST36'),{pointCode:'ST-36',meridianId:'ST',openPanel:true});
  assert.deepEqual(parseDeepLink('?point=LI-4&lab=1'),{pointCode:'LI-4',meridianId:'LI',openLab:true});
  assert.deepEqual(parseDeepLink('?huyet=PC6&cham=1'),{pointCode:'PC-6',meridianId:'PC',openLab:true});
  assert.deepEqual(parseDeepLink('?kinh=sp'),{meridianId:'SP'});
  assert.deepEqual(parseDeepLink('?kinh=all'),{meridianId:'ALL'});
  assert.equal(parseDeepLink(''),null);
  assert.equal(parseDeepLink('?kinh=zz'),null);
  assert.equal(parseDeepLink('?huyet=ST36&register=1'),null,'registration mode keeps its own state');
});

test('point counts match the published catalog',()=>{
  const points=JSON.parse(readFileSync(new URL('../content/acupoints/acupoints.json',import.meta.url),'utf8'));
  const counts={};
  for(const p of points)counts[p.meridianId]=Math.max(counts[p.meridianId]||0,p.sequence);
  assert.deepEqual(Object.keys(counts).sort(),[...DEEP_LINK_MERIDIANS].sort());
  for(const id of DEEP_LINK_MERIDIANS)assert.equal(MERIDIAN_POINT_COUNT[id],counts[id],id);
  assert.equal(Object.values(MERIDIAN_POINT_COUNT).reduce((a,b)=>a+b,0),361);
});

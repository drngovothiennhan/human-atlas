import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateContent,lookupByCode,searchRecords,isFinite3,canonicalAcupointCode,STANDARD_POINT_COUNTS} from '../scripts/content-lib.mjs';

test('licensed content validates with complete 361-point standard catalogue',()=>{
  const r=validateContent();
  assert.deepEqual(r.errors,[]);
  assert.equal(r.counts.meridians,14);
  assert.equal(r.counts.acupoints,361);
});

test('all 14 meridians contain their verified ordered point codes',async()=>{
  const meridians=JSON.parse(await readFile(new URL('../content/meridians/meridians.json',import.meta.url)));
  assert.equal(meridians.length,14);
  for(const meridian of meridians){
    assert.equal(meridian.pointIds.length,STANDARD_POINT_COUNTS[meridian.id]);
    assert.equal(meridian.pointIds[0],`${meridian.id}-1`);
    assert.equal(meridian.pointIds.at(-1),`${meridian.id}-${STANDARD_POINT_COUNTS[meridian.id]}`);
    assert.deepEqual(meridian.path3d,[]);
    assert.equal(meridian.spatialStatus,'UNREGISTERED');
  }
});

test('lookup accepts compact and hyphenated acupoint codes',async()=>{
  const points=JSON.parse(await readFile(new URL('../content/acupoints/acupoints.json',import.meta.url)));
  assert.equal(lookupByCode(points,'st36')?.code,'ST-36');
  assert.equal(lookupByCode(points,'ST-36')?.code,'ST-36');
  assert.equal(canonicalAcupointCode(' lu 9 '),'LU-9');
});

test('search finds point code and meridian id without inventing names',async()=>{
  const points=JSON.parse(await readFile(new URL('../content/acupoints/acupoints.json',import.meta.url)));
  assert.equal(searchRecords(points,'GB44').at(0)?.code,'GB-44');
  assert.equal(searchRecords(points,'LU').length,11);
});

test('Vietnamese search is accent insensitive',()=>assert.equal(searchRecords([{code:'SP',vietnameseName:'Kinh Tỳ'}],'ty').length,1));
test('coordinates reject non-finite values',()=>{assert.equal(isFinite3([1,2,3]),true);assert.equal(isFinite3([1,Infinity,3]),false)});


test('user-provided medical PDFs stay reference-only and pilot evidence is bibliographic only',async()=>{
  const sources=JSON.parse(await readFile(new URL('../content/sources/sources.json',import.meta.url)));
  const refs=JSON.parse(await readFile(new URL('../content/registration/reference-evidence.json',import.meta.url)));
  const userSources=sources.filter(source=>source.origin==='USER_PROVIDED_ATTACHMENT');
  assert.equal(userSources.length,4);
  assert.ok(userSources.every(source=>source.status==='REFERENCE_ONLY'&&source.runtimeBundled===false));
  assert.deepEqual(refs.pilot.map(row=>row.pointCode),['ST-36','LI-4','LU-5','LU-9','ST-41']);
  assert.ok(refs.pilot.every(row=>row.references.length>=3));
  assert.ok(refs.pilot.flatMap(row=>row.references).every(reference=>!/[\n\r]/.test(reference.locator)));
});

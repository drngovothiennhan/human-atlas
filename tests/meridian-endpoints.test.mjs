import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const expected={
  LU:['LU-1','LU-11'],
  LI:['LI-1','LI-20'],
  ST:['ST-1','ST-45'],
  SP:['SP-1','SP-21'],
  HT:['HT-1','HT-9'],
  SI:['SI-1','SI-19'],
  BL:['BL-1','BL-67'],
  KI:['KI-1','KI-27'],
  PC:['PC-1','PC-9'],
  TE:['TE-1','TE-23'],
  GB:['GB-1','GB-44'],
  LR:['LR-1','LR-14'],
  CV:['CV-1','CV-24'],
  GV:['GV-1','GV-28'],
};

const sourceId=id=>id==='TE'?'SJ':id==='CV'?'REN':id==='GV'?'DU':id;
const appCode=code=>code.replace(/^SJ-/,'TE-').replace(/^REN-/,'CV-').replace(/^DU-/,'GV-');

test('14 meridians preserve audited first and last acupoints',async()=>{
  const catalogue=JSON.parse(await readFile(new URL('../content/meridians/meridians.json',import.meta.url),'utf8'));
  const topology=JSON.parse(await readFile(new URL('../vendor/furia-acupuncture-3d/meridians.json',import.meta.url),'utf8')).paths;

  assert.equal(catalogue.length,14);
  for(const meridian of catalogue){
    const [first,last]=expected[meridian.id] ?? [];
    assert.ok(first&&last,'missing endpoint audit for '+meridian.id);
    assert.equal(meridian.pointIds[0],first,meridian.id+' catalogue start changed');
    assert.equal(meridian.pointIds.at(-1),last,meridian.id+' catalogue end changed');

    const paths=topology[sourceId(meridian.id)];
    assert.ok(paths?.length,meridian.id+' source topology missing');
    assert.equal(appCode(paths[0][0]),first,meridian.id+' topology start changed');
    assert.equal(appCode(paths.at(-1).at(-1)),last,meridian.id+' topology end changed');
  }
});

test('bladder topology omission remains explicit and is never invented',async()=>{
  const topology=JSON.parse(await readFile(new URL('../vendor/furia-acupuncture-3d/meridians.json',import.meta.url),'utf8')).paths.BL;
  const codes=topology.flat();
  assert.equal(codes.includes('BL-39'),false,'BL-39 must not be silently invented into vendor topology');
  const lower=topology.find(path=>path.includes('BL-38')&&path.includes('BL-40'));
  assert.ok(lower,'BL lower branch missing');
  const i=lower.indexOf('BL-38');
  assert.deepEqual(lower.slice(i,i+3),['BL-38','BL-40','BL-55']);
});

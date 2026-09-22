import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('runtime provenance records are explicit and licensed', async()=>{
  const data=JSON.parse(await readFile(new URL('../public/data/provenance.json',import.meta.url)));
  assert.ok(Array.isArray(data.assets)&&data.assets.length>0);
  for(const asset of data.assets){
    assert.ok(asset.id);
    assert.ok(asset.source);
    assert.ok(asset.version);
    assert.ok(asset.license);
    assert.ok(Array.isArray(asset.processing));
  }
  const bp=data.assets.find(x=>x.id==='bodyparts3d-4.0-browser-adaptation');
  assert.equal(bp?.license,'CC-BY-4.0');
  assert.match(bp?.originalUrl||'',/^https:\/\//);
});

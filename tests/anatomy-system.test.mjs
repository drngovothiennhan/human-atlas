import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeAtlasSystems} from '../app/anatomy.ts';

const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const muscleName=/\b(muscle|musculus|flexor|extensor|adductor|abductor|gastrocnemius|soleus|tibialis|fibularis|peroneus)\b/i;
const expectedMisclassified=['FJ1409','FJ1409M','FJ1410','FJ1410M','FJ1411','FJ1411M','FJ1439','FJ1439M','FJ1440','FJ1440M'];

test('source skeletal layer contains only the ten known lower-leg muscle misclassifications',()=>{
  const suspicious=atlas.parts.filter(part=>part.system==='skeletal'&&muscleName.test(part.name)).map(part=>part.id).sort();
  assert.deepEqual(suspicious,[...expectedMisclassified].sort());
});

test('runtime system normalization removes muscle meshes from the skeletal layer without changing geometry',()=>{
  const before=new Map(atlas.parts.filter(part=>expectedMisclassified.includes(part.id)).map(part=>[part.id,JSON.stringify(part.bounds)]));
  const normalized=normalizeAtlasSystems(structuredClone(atlas));
  for(const id of expectedMisclassified){
    const part=normalized.parts.find(part=>part.id===id);assert.ok(part,id);assert.equal(part.system,'muscular',id);assert.equal(JSON.stringify(part.bounds),before.get(id),id+' bounds changed');
  }
  assert.equal(normalized.parts.filter(part=>part.system==='skeletal'&&muscleName.test(part.name)).length,0);
});

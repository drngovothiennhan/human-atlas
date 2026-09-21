import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BODY_CANONICAL_COORDINATE_SYSTEM,validateContent} from '../scripts/content-lib.mjs';

test('spatial candidates stay outside runtime until registration passes',async()=>{
  const candidates=JSON.parse(await readFile(new URL('../content/spatial-candidates/candidates.json',import.meta.url)));
  assert.equal(candidates.length,2);
  for(const candidate of candidates){
    assert.equal(candidate.licenseGate,'PASS');
    assert.equal(candidate.registrationGate,'BLOCKED');
    assert.equal(candidate.runtimeEligible,false);
    assert.equal(candidate.canonicalCoordinateSystem,null);
    assert.equal(candidate.bodypartsTransform,null);
    assert.equal(candidate.surfaceAnchorMapping,null);
  }
  const points=JSON.parse(await readFile(new URL('../content/acupoints/acupoints.json',import.meta.url)));
  assert.equal(points.length,361);
  assert.ok(points.every(point=>point.position3d==null));
});

test('validator keeps blocked spatial candidates out of published 3D positions',()=>{
  const result=validateContent();
  assert.deepEqual(result.errors,[]);
  assert.equal(result.counts.spatialCandidates,2);
  assert.equal(result.counts.acupoints,361);
  assert.equal(BODY_CANONICAL_COORDINATE_SYSTEM,'BodyParts3D-4.0-browser-meters-Y-up');
});

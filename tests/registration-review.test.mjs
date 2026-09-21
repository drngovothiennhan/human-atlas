import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  BODY_CANONICAL_COORDINATE_SYSTEM,
  anchorEligibleForPublication,
  validateReviewArtifact
} from '../scripts/registration-lib.mjs';

const pilot=JSON.parse(await readFile(new URL('../content/registration/pilot.json',import.meta.url)));

function fixture(overrides={}){
  return {
    pointCode:'ST-36',
    side:'LEFT',
    x:0,
    y:0,
    z:0,
    coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,
    surfaceStructureId:'TEST_ONLY_STRUCTURE',
    surfaceStructureName:'TEST ONLY',
    triangleIndex:0,
    barycentric:[1,0,0],
    nearestSurfaceDistance:0,
    geometrySource:'BODYPARTS3D-4.0',
    locationReferenceSources:['WHO-2008-ACUPOINT'],
    verificationStatus:'FACULTY_REVIEWED',
    reviewer:'TEST REVIEWER',
    reviewedAt:'2026-09-21T00:00:00.000Z',
    ...overrides
  };
}

test('review gate rejects UNVERIFIED capture even when surface evidence is complete',()=>{
  const anchor=fixture({verificationStatus:'UNVERIFIED',reviewer:null,reviewedAt:null});
  assert.equal(anchorEligibleForPublication(anchor),false);
  const result=validateReviewArtifact(
    {coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,anchors:[anchor]},
    pilot
  );
  assert.ok(result.errors.some(error=>error.includes('FACULTY_REVIEWED or PUBLISHED')));
  assert.equal(result.completePilot,false);
});

test('review gate accepts a reviewed pilot anchor but does not claim the pilot is complete',()=>{
  const anchor=fixture();
  assert.equal(anchorEligibleForPublication(anchor),true);
  const result=validateReviewArtifact(
    {coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,anchors:[anchor]},
    pilot
  );
  assert.deepEqual(result.errors,[]);
  assert.equal(result.counts.reviewedAnchors,1);
  assert.equal(result.counts.requiredPilotAnchors,10);
  assert.equal(result.counts.remainingPilotAnchors,9);
  assert.equal(result.completePilot,false);
});

test('review gate rejects points outside the approved pilot',()=>{
  const anchor=fixture({pointCode:'ST-35'});
  const result=validateReviewArtifact(
    {coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,anchors:[anchor]},
    pilot
  );
  assert.ok(result.errors.some(error=>error.includes('outside the approved pilot')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateContent} from '../scripts/content-lib.mjs';
import {anchorEligibleForPath,barycentricValid,buildReviewedPolyline} from '../scripts/registration-lib.mjs';

test('five pilot points are staged without invented coordinates',async()=>{
  const result=validateContent();
  assert.deepEqual(result.errors,[]);
  assert.equal(result.counts.registrationPilotPoints,5);
  assert.equal(result.counts.registrationDraftAnchors,0);
  const pilot=JSON.parse(await readFile(new URL('../content/registration/pilot.json',import.meta.url)));
  assert.deepEqual(pilot.pilot.map(point=>point.pointCode),['ST-36','LI-4','LU-5','LU-9','ST-41']);
  assert.ok(pilot.pilot.every(point=>point.anchors.length===0&&point.status==='PENDING_CAPTURE'));
});

test('surface evidence barycentric gate is strict',()=>{
  assert.equal(barycentricValid([.2,.3,.5]),true);
  assert.equal(barycentricValid([.2,.3,.6]),false);
});

test('meridian polyline refuses unreviewed anchors and accepts reviewed anchors only',()=>{
  const base={side:'LEFT',triangleIndex:7,barycentric:[.2,.3,.5]};
  const unverified=[
    {...base,pointCode:'ST-1',x:1,y:2,z:3,verificationStatus:'UNVERIFIED'},
    {...base,pointCode:'ST-2',x:2,y:3,z:4,verificationStatus:'UNVERIFIED'}
  ];
  assert.equal(anchorEligibleForPath(unverified[0]),false);
  assert.deepEqual(buildReviewedPolyline(unverified,['ST-1','ST-2'],'LEFT').path,[]);
  const reviewed=unverified.map(anchor=>({...anchor,verificationStatus:'FACULTY_REVIEWED'}));
  const built=buildReviewedPolyline(reviewed,['ST-1','ST-2'],'LEFT');
  assert.equal(built.ok,true);
  assert.deepEqual(built.path,[[1,2,3],[2,3,4]]);
});

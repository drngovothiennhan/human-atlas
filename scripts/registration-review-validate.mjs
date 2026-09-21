import fs from 'node:fs';
import path from 'node:path';
import {validateReviewArtifact} from './registration-lib.mjs';

const input=process.argv[2];
if(!input){
  console.error('Usage: npm run registration:validate-review -- <review-artifact.json>');
  process.exit(2);
}

let artifact;
try{
  artifact=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
}catch(error){
  console.error('Unable to read review artifact:',error instanceof Error?error.message:String(error));
  process.exit(2);
}

const pilot=JSON.parse(fs.readFileSync(path.resolve('content/registration/pilot.json'),'utf8'));
const result=validateReviewArtifact(artifact,pilot);
console.log(JSON.stringify(result.counts));
console.log('completePilot='+result.completePilot);
if(result.missing.length)console.log('missing='+result.missing.join(','));
if(result.errors.length){
  for(const error of result.errors)console.error('ERROR',error);
  process.exit(1);
}
console.log('REGISTRATION_REVIEW_VALIDATION_PASS');

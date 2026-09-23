import fs from 'node:fs';
import path from 'node:path';
import {validateContent,sha256Text} from './content-lib.mjs';

const root=process.cwd(),out=path.join(root,'public/data'),r=validateContent({root});
const documentReferenceFile=path.join(root,'content/references/ngo-trung-trieu-huyet-vi-kinh-lac.json');
const nomenclatureFile=path.join(root,'content/acupoints/nomenclature.json');
if(r.errors.length){for(const e of r.errors)console.error(e);process.exit(1)}
if(!fs.existsSync(documentReferenceFile)){console.error('Missing Ngô Trung Triều document reference map');process.exit(1)}
if(!fs.existsSync(nomenclatureFile)){console.error('Missing acupoint nomenclature metadata');process.exit(1)}
fs.mkdirSync(out,{recursive:true});
for(const [src,name] of [[r.files.meridianFile,'meridians.json'],[r.files.registrationFile,'registration-pilot.json'],[r.files.referenceEvidenceFile,'registration-reference-evidence.json'],[documentReferenceFile,'document-reference-map.json']]){
  const t=fs.readFileSync(src,'utf8');
  fs.writeFileSync(path.join(out,name),t.endsWith('\n')?t:t+'\n');
}
const documentReference=JSON.parse(fs.readFileSync(documentReferenceFile,'utf8'));
const points=JSON.parse(fs.readFileSync(r.files.pointFile,'utf8'));
const nomenclature=JSON.parse(fs.readFileSync(nomenclatureFile,'utf8'));
const nomenclatureByCode=new Map(nomenclature.points.map(item=>[item.code,item]));
const enrichedPoints=points.map(point=>{const name=nomenclatureByCode.get(point.code);return name?{...point,pinyin:name.pinyin??point.pinyin??null,chineseName:name.chineseName??point.chineseName??null,nomenclatureSource:nomenclature.source.id}:point});
fs.writeFileSync(path.join(out,'acupoints.json'),JSON.stringify(enrichedPoints,null,2)+'\n');
const referenceByMeridian=new Map(documentReference.meridians.map(item=>[item.meridianId,item]));
const pointDocumentReferences=points.map(point=>{
  const ref=referenceByMeridian.get(point.meridianId);
  if(!ref)throw new Error('Missing document reference section for '+point.meridianId);
  return {
    pointCode:point.code,
    meridianId:point.meridianId,
    sourceId:documentReference.sourceId,
    label:ref.label,
    heading:ref.heading,
    pdfPageRange:ref.pdfPageRange,
    evidenceType:ref.evidenceType,
    spatialStatus:ref.spatialStatus
  };
});
fs.writeFileSync(path.join(out,'point-document-references.json'),JSON.stringify({
  schemaVersion:'0.1.0',
  sourceId:documentReference.sourceId,
  policy:documentReference.policy,
  points:pointDocumentReferences
},null,2)+'\n');
const manifest={
  contentVersion:'0.3.3',
  builtAt:new Date().toISOString(),
  counts:{...r.counts,documentReferenceMeridians:documentReference.meridians.length,documentReferencePoints:pointDocumentReferences.length},
  sourceHashes:{
    sources:sha256Text(fs.readFileSync(r.files.sourceFile,'utf8')),
    meridians:sha256Text(fs.readFileSync(r.files.meridianFile,'utf8')),
    acupoints:sha256Text(fs.readFileSync(r.files.pointFile,'utf8')),
    registration:sha256Text(fs.readFileSync(r.files.registrationFile,'utf8')),
    registrationReferences:sha256Text(fs.readFileSync(r.files.referenceEvidenceFile,'utf8')),
    ngoTrungTrieuDocumentReference:sha256Text(fs.readFileSync(documentReferenceFile,'utf8')),
    acupointNomenclature:sha256Text(fs.readFileSync(nomenclatureFile,'utf8'))
  }
};
fs.writeFileSync(path.join(out,'content-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest));

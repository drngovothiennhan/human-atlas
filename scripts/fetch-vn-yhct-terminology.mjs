import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'public/data/vn-acupoint-terminology.json');
const fallbackFile=path.join(root,'content/acupoints/nomenclature.json');
const url=process.env.VN_YHCT_ACUPOINT_FHIR_URL||'https://fhir.hl7.org.vn/core/CodeSystem-vn-yhct-acupoint-cs.json';
const counts={LU:11,LI:20,ST:45,SP:21,HT:9,SI:19,BL:67,KI:27,PC:9,TE:23,GB:44,LR:14,GV:28,CV:24};
const expected=Object.entries(counts).flatMap(([m,n])=>Array.from({length:n},(_,i)=>m+'-'+(i+1)));
const expectedSet=new Set(expected);
const prop=(concept,code)=>concept.property?.find(item=>item.code===code)?.valueString??null;
const canonical=(raw)=>{const m=String(raw||'').trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);return m?m[1]+'-'+Number(m[2]):null};
const fallback=JSON.parse(fs.readFileSync(fallbackFile,'utf8'));
const fallbackByCode=new Map(fallback.points.map(item=>[item.code,item]));
const write=payload=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(payload,null,2)+'\n')};

let remote=null,lastError='';
for(let attempt=0;attempt<3&&!remote;attempt++){
  try{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    const response=await fetch(url,{signal:controller.signal,headers:{accept:'application/fhir+json, application/json'}});
    clearTimeout(timer);
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json(),map=new Map();
    for(const concept of data.concept||[]){
      const code=canonical(prop(concept,'ma-quoc-te'));
      if(!code||!expectedSet.has(code))continue;
      map.set(code,{
        code,
        vietnameseName:concept.display||null,
        internationalName:prop(concept,'ten-quoc-te'),
        snomedCtRef:prop(concept,'snomed-ct-ref'),
        vietnameseMeridianName:prop(concept,'kinh-vn'),
        englishMeridianName:prop(concept,'kinh-en')
      });
    }
    if(map.size!==361)throw new Error('Expected 361 standard points; found '+map.size);
    remote={
      schemaVersion:'0.1.0',
      source:{id:'VN-MOH-QD2552-FHIR',url,version:data.version||null,status:data.status||null,authority:'Cục Quản lý Y Dược Cổ Truyền — Bộ Y tế Việt Nam',legalBasis:'QĐ 2552/QĐ-BYT (12/8/2025) · Phụ lục III'},
      count:map.size,
      points:expected.map(code=>map.get(code))
    };
  }catch(error){
    lastError=error instanceof Error?error.message:String(error);
    await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
  }
}
if(remote){
  write(remote);
  console.log('VN_YHCT_TERMINOLOGY_REMOTE '+remote.count);
}else{
  const points=expected.map(code=>{const item=fallbackByCode.get(code)||{};return{code,vietnameseName:null,internationalName:item.pinyin??null,snomedCtRef:null,vietnameseMeridianName:null,englishMeridianName:null}});
  write({schemaVersion:'0.1.0',source:{id:'LOCAL-NOMENCLATURE-FALLBACK',failedRemote:url,error:lastError},count:points.length,points});
  console.warn('VN_YHCT_TERMINOLOGY_FALLBACK '+lastError);
}

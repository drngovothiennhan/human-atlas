import type {NeedleAction,NeedleIntensity} from './meridian-overlay';

/** Data for the Phòng châm. Everything here is read from content/needling and content/formulas (see sourceId). */
export type TechniqueAngle={id:'perpendicular'|'oblique'|'transverse';name:string;degrees:number;range:[number,number];use:string;page:number;examplePoints?:string[]};
export type RegionRule={id:string;name:string;summary:string;recommendedAngles:TechniqueAngle['id'][];depthTac?:[number,number];spineDepthTac?:[number,number];examples?:{code:string;depthTac:[number,number]}[];cautionPoints?:string[];insertion?:string;page:number};
export type Technique={id:string;name:string;summary:string;use?:string;caution?:string;page:number;motion?:NeedleAction;maxNeedleTac?:number;minNeedleTac?:number;examplePoints?:string[]};
export type Stimulation={id:NeedleIntensity;name:string;equivalent:'bo'|'binh'|'ta';summary:string;indication:string;page:number};
export type TonReduce={id:string;name:string;bo?:string;ta?:string;binh?:string;page:number};
export type NeedlingData={
  sourceId:string;
  source:{title:string;author:string;translator?:string;publisher:string;chapter:string;pageRange:[number,number];pageNote:string};
  reviewStatus:string;policy:string;
  insertion:Technique[];manipulations:Technique[];tonificationReduction:TonReduce[];stimulation:Stimulation[];
  deqi:{summary:string;page:number};angles:TechniqueAngle[];depthByRegion:RegionRule[];
  depthGeneral:{summary:string;page:number};retention:{summary:string;page:number};
  accidents:{id:string;name:string;summary:string;page:number}[];
};
export type FormulaMethod='ta'|'bo'|'ta-cuu'|'bo-cuu';
export type FormulaPoint={name:string;code:string|null;printedCode?:string;side?:'OPPOSITE'|'BOTH';note?:string};
export type FormulaGroup={role:string;method:FormulaMethod;points:FormulaPoint[]};
export type Formula={id:string;disease:string;pattern:string;principle:string;pages:number[];retention?:string;technique?:string;baseFormula?:string;baseGroups?:string[];baseMethod?:FormulaMethod;groups:FormulaGroup[]};
export type FormulaData={sourceId:string;source:{title:string;issuer:string;pageNote:string};reviewStatus:string;policy:string;methods:Record<FormulaMethod,string>;formulas:Formula[]};

export type ResolvedFormulaPoint=FormulaPoint&{method:'bo'|'ta';methodLabel:string;role:string;order:number;inherited:boolean};

const LIMB_REGIONS=new Set(['Leg','Forearm','Foot','Thigh','Arm','Elbow','Wrist','Knee','Ankle','Dorsum Of The Hand','Little Finger','Palm','Great Toe','Index Finger','Little Toe','Thumb','Second Toe','Sole Of The Foot','Middle Finger','Ring Finger','Fourth Toe']);
const TRUNK_LOWER=new Set(['Upper Abdomen','Lower Abdomen','Abdomen','Lumbar Region','Sacral Region']);
const CHEST_BACK=new Set(['Upper Back','Anterior Thoracic Region','Lateral Thoracic Region','Scapular Region']);
const HEAD_FACE=new Set(['Head','Face']);

/** Maps a point's surface region to the book's four depth groups (tr. 18). Unknown regions return null: the book gives no rule. */
export function regionRuleFor(data:NeedlingData|null,surfaceRegionEn:string|null|undefined,meridianId:string):{rule:RegionRule;spine:boolean;upperAbdomen:boolean}|null{
  if(!data||!surfaceRegionEn)return null;
  const id=LIMB_REGIONS.has(surfaceRegionEn)?'limbs':TRUNK_LOWER.has(surfaceRegionEn)?'abdomen-lumbosacral':CHEST_BACK.has(surfaceRegionEn)?'chest-back':HEAD_FACE.has(surfaceRegionEn)?'head-face':null;
  const rule=id?data.depthByRegion.find(r=>r.id===id):undefined;
  if(!rule)return null;
  const spine=meridianId==='GV'&&(surfaceRegionEn==='Upper Back'||surfaceRegionEn==='Lumbar Region'||surfaceRegionEn==='Sacral Region');
  return {rule,spine,upperAbdomen:surfaceRegionEn==='Upper Abdomen'};
}

export const toMethod=(m:FormulaMethod):'bo'|'ta'=>m==='bo'||m==='bo-cuu'?'bo':'ta';
export const methodIntensity=(m:'bo'|'ta'|'binh'):NeedleIntensity=>m==='bo'?'weak':m==='ta'?'strong':'moderate';

/** Expands a formula with the groups it inherits ("châm tả các huyệt giống thể …"), numbering points in reading order. */
export function resolveFormula(data:FormulaData,formula:Formula):ResolvedFormulaPoint[]{
  const out:ResolvedFormulaPoint[]=[];
  const push=(group:FormulaGroup,method:FormulaMethod,inherited:boolean)=>group.points.forEach(p=>out.push({...p,method:toMethod(method),methodLabel:data.methods[method]??method,role:group.role,order:out.length+1,inherited}));
  if(formula.baseFormula){
    const base=data.formulas.find(f=>f.id===formula.baseFormula);
    base?.groups.filter(g=>!formula.baseGroups||formula.baseGroups.includes(g.role)).forEach(g=>push(g,formula.baseMethod??g.method,true));
  }
  formula.groups.forEach(g=>push(g,g.method,false));
  return out;
}

export const TAC_TO_MODEL_MM=22;

let needlingPromise:Promise<NeedlingData>|null=null,formulaPromise:Promise<FormulaData>|null=null;
export const loadNeedlingData=()=>needlingPromise??=fetch(import.meta.env.BASE_URL+'data/needling-techniques.json').then(r=>{if(!r.ok)throw new Error('needling data unavailable');return r.json() as Promise<NeedlingData>}).catch(error=>{needlingPromise=null;throw error});
export const loadFormulaData=()=>formulaPromise??=fetch(import.meta.env.BASE_URL+'data/acupoint-formulas.json').then(r=>{if(!r.ok)throw new Error('formula data unavailable');return r.json() as Promise<FormulaData>}).catch(error=>{formulaPromise=null;throw error});

/**
 * Pure vector math for the illustrative needle (no three.js, so it can be unit-tested in Node).
 * The scene finds the outward skin normal at an acupoint, then this module derives the entry direction
 * and the handle direction from it. Châm cứu học Trung Quốc tr. 17: the needle makes an angle with the skin.
 */
export type Vec3=[number,number,number];

const len=(v:Vec3)=>Math.hypot(v[0],v[1],v[2]);
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const scale=(v:Vec3,s:number):Vec3=>[v[0]*s,v[1]*s,v[2]*s];
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const isFinite3=(v:Vec3)=>v.every(Number.isFinite);

export function normalize(v:Vec3,fallback:Vec3=[0,0,1]):Vec3{
  const l=len(v);
  return isFinite3(v)&&l>1e-9?scale(v,1/l):[...fallback];
}

/** 26 unit directions (6 faces, 12 edges, 8 corners) used to probe the skin around a point. */
export const PROBE_DIRECTIONS:Vec3[]=(()=>{
  const out:Vec3[]=[];
  for(const x of [-1,0,1])for(const y of [-1,0,1])for(const z of [-1,0,1]){
    if(x===0&&y===0&&z===0)continue;
    out.push(normalize([x,y,z]));
  }
  return out;
})();

export type SkinHit={distance:number;/** Outward-facing skin normal at the hit. */normal:Vec3};

/** Nearest valid hit within maxDistance, or null. Ignores non-finite or degenerate hits. */
export function pickSkinNormal(hits:SkinHit[],maxDistance:number):Vec3|null{
  let best:SkinHit|null=null;
  for(const hit of hits){
    if(!Number.isFinite(hit.distance)||hit.distance<0||hit.distance>maxDistance)continue;
    if(!isFinite3(hit.normal)||len(hit.normal)<1e-9)continue;
    if(!best||hit.distance<best.distance)best=hit;
  }
  return best?normalize(best.normal):null;
}

/** Previous behaviour, kept as fallback: horizontal direction from the point toward the body axis. */
export function fallbackInward(x:number,z:number):Vec3{
  return normalize([-x,0,-z],[0,0,1]);
}

export type NeedleBasis={inward:Vec3;tangent:Vec3;entry:Vec3;grip:Vec3};

/**
 * inward: unit vector from the skin into the body. angleDegrees: angle between needle and skin (90 = perpendicular).
 * The needle leans toward the in-plane "up" direction; on the vertex and soles (where up is parallel to the
 * normal) it leans toward the front instead, so the needle never degenerates.
 */
export function needleBasis(inwardInput:Vec3,angleDegrees:number,up:Vec3=[0,1,0],forward:Vec3=[0,0,1]):NeedleBasis{
  const inward=normalize(inwardInput);
  const lean=(hint:Vec3)=>sub(hint,scale(inward,dot(hint,inward)));
  let tangent=lean(up);
  if(len(tangent)<0.2)tangent=lean(forward);
  tangent=normalize(tangent,[1,0,0]);
  const angle=Math.min(90,Math.max(5,Number.isFinite(angleDegrees)?angleDegrees:90))*Math.PI/180;
  const entry=normalize(add(scale(inward,Math.sin(angle)),scale(tangent,Math.cos(angle))),inward);
  const grip=normalize(sub(tangent,scale(entry,dot(tangent,entry))),tangent);
  return {inward,tangent,entry,grip};
}

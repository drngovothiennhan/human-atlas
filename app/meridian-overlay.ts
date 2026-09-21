import type {AcupointAnchorDraft,ReviewStatus} from '../src/acupoints/registration/coordinate-system';

export type MeridianOverlaySide='BOTH'|'LEFT'|'RIGHT';

export type MeridianSceneAnchor={
  pointCode:string;
  meridianId:string;
  sequence:number;
  side:'LEFT'|'RIGHT'|'MIDLINE'|'UNKNOWN';
  x:number;
  y:number;
  z:number;
  verificationStatus:ReviewStatus;
  sourceKind:'LOCAL_DRAFT'|'PUBLISHED';
};

export type MeridianScenePath={
  meridianId:string;
  points:[number,number,number][];
  verificationStatus:'FACULTY_REVIEWED'|'PUBLISHED';
};

export type MeridianOverlayState={
  enabled:boolean;
  meridianId:string|null;
  side:MeridianOverlaySide;
  anchors:MeridianSceneAnchor[];
  paths:MeridianScenePath[];
};

export type MeridianFocusTarget={
  key:string;
  pointCode:string;
  x:number;
  y:number;
  z:number;
};

export const meridianIdFromPointCode=(pointCode:string)=>{
  const match=String(pointCode||'').trim().toUpperCase().match(/^([A-Z]+)-?\d+$/);
  return match?.[1]??'';
};

export const numericPointSequence=(pointCode:string)=>{
  const match=String(pointCode||'').trim().toUpperCase().match(/^(?:[A-Z]+)-?(\d+)$/);
  return match?Number(match[1]):Number.MAX_SAFE_INTEGER;
};

export const draftToSceneAnchor=(draft:AcupointAnchorDraft):MeridianSceneAnchor=>({
  pointCode:draft.pointCode,
  meridianId:meridianIdFromPointCode(draft.pointCode),
  sequence:numericPointSequence(draft.pointCode),
  side:draft.side,
  x:draft.x,
  y:draft.y,
  z:draft.z,
  verificationStatus:'UNVERIFIED',
  sourceKind:'LOCAL_DRAFT'
});

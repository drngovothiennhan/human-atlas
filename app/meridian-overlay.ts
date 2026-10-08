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
  sourceKind:'LOCAL_DRAFT'|'LICENSED_SCHEMATIC'|'PUBLISHED';
};

export type MeridianScenePath={
  meridianId:string;
  side?:'LEFT'|'RIGHT'|'MIDLINE'|'UNKNOWN';
  points:[number,number,number][];
  pointCodes?:string[];
  displayAnchorStride?:number;
  visualAnchorCodes?:string[];
  handProjection?:string;
  anchorCoordinatePolicy?:string;
  verificationStatus:'UNVERIFIED'|'FACULTY_REVIEWED'|'PUBLISHED';
  sourceKind?:'LICENSED_SCHEMATIC'|'PUBLISHED';
};

export type MeridianOverlayState={
  enabled:boolean;
  meridianId:string|null;
  selectedPointCode?:string|null;
  side:MeridianOverlaySide;
  anchors:MeridianSceneAnchor[];
  paths:MeridianScenePath[];
  effects?:{
    motion:boolean;
    meridians:boolean;
    acupoints:boolean;
    collaterals:boolean;
  };
  needleSimulation?:NeedleSimulationState|null;
  formula?:FormulaOverlay|null;
};

/** Illustrative needle motions (Châm cứu học Trung Quốc, tr. 13–14) plus the legacy 'insert' cycle. */
export type NeedleAction='insert'|'twist'|'lift-thrust'|'twist-lift'|'scrape'|'shake';
/** Stimulation strength (tr. 16): weak ≈ bổ, moderate ≈ bình, strong ≈ tả. */
export type NeedleIntensity='weak'|'moderate'|'strong';
/** Step of the needling sequence; the scene eases the needle toward each step. */
export type NeedlePhase='approach'|'pierce'|'manipulate'|'retain'|'withdraw';

export type NeedleSimulationState={
  pointCode:string;
  x:number;y:number;z:number;
  angleDegrees:number;
  /** Length of shaft left above the skin, illustrative millimetres. */
  visualLengthMm:number;
  /** Illustrative inserted depth in millimetres (drawn faintly under the skin). */
  depthMm?:number;
  animated:boolean;
  action:NeedleAction;
  intensity?:NeedleIntensity;
  phase?:NeedlePhase;
  deqi?:boolean;
};

export type FormulaOverlayPoint={code:string;x:number;y:number;z:number;method:'bo'|'ta'|'binh';order:number;active?:boolean};
export type FormulaOverlay={id:string;points:FormulaOverlayPoint[]};

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

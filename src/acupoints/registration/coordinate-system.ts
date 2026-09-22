export const BODY_CANONICAL_COORDINATE_SYSTEM='BodyParts3D-4.0-browser-meters-Y-up' as const;

export type RegistrationSide='LEFT'|'RIGHT';
export type ReviewStatus='UNVERIFIED'|'SOURCE_VERIFIED'|'FACULTY_REVIEWED'|'PUBLISHED';

export type SurfaceCapture={
  x:number;
  y:number;
  z:number;
  coordinateSystem:typeof BODY_CANONICAL_COORDINATE_SYSTEM;
  surfaceStructureId:string;
  surfaceStructureName:string;
  triangleIndex:number;
  barycentric:[number,number,number];
  nearestSurfaceDistance:number;
};

export type AcupointAnchor=SurfaceCapture&{
  side:RegistrationSide|'MIDLINE'|'BILATERAL'|'UNKNOWN';
  source:string;
  verificationStatus:ReviewStatus;
};

export type AcupointAnchorDraft=SurfaceCapture&{
  pointCode:string;
  side:RegistrationSide;
  geometrySource:string;
  locationReferenceSources:string[];
  verificationStatus:'UNVERIFIED';
  capturedAt:string;
  reviewer:null;
  reviewedAt:null;
};

export function barycentricValid(value:[number,number,number]|number[]|null|undefined){
  return Array.isArray(value)
    && value.length===3
    && value.every(Number.isFinite)
    && Math.abs(value[0]+value[1]+value[2]-1)<1e-4
    && value.every(number=>number>=-1e-5&&number<=1.00001);
}

export function isPublishableAnchor(anchor:AcupointAnchor){
  return [anchor.x,anchor.y,anchor.z].every(Number.isFinite)
    && Boolean(anchor.surfaceStructureId)
    && Number.isInteger(anchor.triangleIndex)
    && anchor.triangleIndex>=0
    && barycentricValid(anchor.barycentric)
    && Boolean(anchor.source)
    && ['FACULTY_REVIEWED','PUBLISHED'].includes(anchor.verificationStatus);
}

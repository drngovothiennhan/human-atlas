export const PATH_REVIEW_STATUSES = new Set(['FACULTY_REVIEWED', 'PUBLISHED']);
export const BODY_CANONICAL_COORDINATE_SYSTEM = 'BodyParts3D-4.0-browser-meters-Y-up';

export function barycentricValid(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every(Number.isFinite)
    && Math.abs(value[0] + value[1] + value[2] - 1) < 1e-4
    && value.every(n => n >= -1e-5 && n <= 1.00001);
}

export function anchorEligibleForPath(anchor) {
  return Boolean(anchor)
    && PATH_REVIEW_STATUSES.has(anchor.verificationStatus)
    && ['LEFT', 'RIGHT'].includes(anchor.side)
    && [anchor.x, anchor.y, anchor.z].every(Number.isFinite)
    && Number.isInteger(anchor.triangleIndex)
    && anchor.triangleIndex >= 0
    && barycentricValid(anchor.barycentric);
}

export function anchorEligibleForPublication(anchor) {
  return anchorEligibleForPath(anchor)
    && anchor.coordinateSystem === BODY_CANONICAL_COORDINATE_SYSTEM
    && typeof anchor.surfaceStructureId === 'string'
    && anchor.surfaceStructureId.trim().length > 0
    && typeof anchor.surfaceStructureName === 'string'
    && anchor.surfaceStructureName.trim().length > 0
    && Number.isFinite(anchor.nearestSurfaceDistance)
    && anchor.nearestSurfaceDistance >= 0
    && typeof anchor.geometrySource === 'string'
    && anchor.geometrySource.trim().length > 0
    && Array.isArray(anchor.locationReferenceSources)
    && anchor.locationReferenceSources.length > 0
    && anchor.locationReferenceSources.every(source => typeof source === 'string' && source.trim().length > 0)
    && typeof anchor.reviewer === 'string'
    && anchor.reviewer.trim().length > 0
    && typeof anchor.reviewedAt === 'string'
    && Number.isFinite(Date.parse(anchor.reviewedAt));
}

export function buildReviewedPolyline(anchors, orderedPointCodes, side) {
  if (!['LEFT', 'RIGHT'].includes(side)) {
    return {ok: false, reason: 'INVALID_SIDE', path: []};
  }
  const byCode = new Map((anchors || []).filter(anchor => anchor.side === side).map(anchor => [anchor.pointCode, anchor]));
  const path = [];
  for (const code of orderedPointCodes || []) {
    const anchor = byCode.get(code);
    if (!anchorEligibleForPath(anchor)) {
      return {ok: false, reason: 'MISSING_REVIEWED_ANCHOR:' + code, path: []};
    }
    path.push([anchor.x, anchor.y, anchor.z]);
  }
  return {ok: path.length > 1, reason: path.length > 1 ? null : 'INSUFFICIENT_POINTS', path};
}

export function validateReviewArtifact(artifact, pilotFile) {
  const errors = [];
  const targets = new Map((pilotFile?.pilot || []).map(target => [target.pointCode, target]));
  const anchors = Array.isArray(artifact?.anchors)
    ? artifact.anchors
    : Array.isArray(artifact?.drafts)
      ? artifact.drafts
      : [];

  if (artifact?.coordinateSystem !== BODY_CANONICAL_COORDINATE_SYSTEM) {
    errors.push('Review artifact coordinateSystem must match BodyParts3D canonical coordinates.');
  }
  if (!anchors.length) {
    errors.push('Review artifact contains no anchors.');
  }

  const seen = new Set();
  for (const anchor of anchors) {
    const key = String(anchor?.pointCode || '') + ':' + String(anchor?.side || '');
    if (seen.has(key)) errors.push('Duplicate reviewed anchor: ' + key);
    seen.add(key);

    const target = targets.get(anchor?.pointCode);
    if (!target) {
      errors.push('Anchor is outside the approved pilot: ' + String(anchor?.pointCode));
      continue;
    }
    if (!(target.requiredSides || []).includes(anchor.side)) {
      errors.push('Anchor side is not required for pilot target: ' + key);
    }
    if (!PATH_REVIEW_STATUSES.has(anchor.verificationStatus)) {
      errors.push('Anchor must be FACULTY_REVIEWED or PUBLISHED before review acceptance: ' + key);
    }
    if (!anchorEligibleForPublication(anchor)) {
      errors.push('Anchor is missing publishable surface/reviewer evidence: ' + key);
    }
    if (anchor.geometrySource !== target.geometrySource) {
      errors.push('Anchor geometrySource does not match pilot target: ' + key);
    }
    const allowedReferences = new Set(target.locationReferenceSources || []);
    for (const source of anchor.locationReferenceSources || []) {
      if (!allowedReferences.has(source)) {
        errors.push('Anchor uses a location reference outside the approved pilot source set: ' + key + ' -> ' + source);
      }
    }
  }

  const requiredKeys = [];
  for (const target of pilotFile?.pilot || []) {
    for (const side of target.requiredSides || []) requiredKeys.push(target.pointCode + ':' + side);
  }
  const reviewedKeys = new Set(
    anchors
      .filter(anchor => anchorEligibleForPublication(anchor))
      .map(anchor => anchor.pointCode + ':' + anchor.side)
  );
  const missing = requiredKeys.filter(key => !reviewedKeys.has(key));

  return {
    errors,
    counts: {
      reviewedAnchors: reviewedKeys.size,
      requiredPilotAnchors: requiredKeys.length,
      remainingPilotAnchors: missing.length
    },
    completePilot: requiredKeys.length > 0 && missing.length === 0,
    missing
  };
}

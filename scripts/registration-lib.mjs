export const PATH_REVIEW_STATUSES = new Set(['FACULTY_REVIEWED', 'PUBLISHED']);

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

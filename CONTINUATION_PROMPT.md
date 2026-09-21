# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

You are the execution engineer for **HIU YHCT 3D Atlas — Huyệt vị · Kinh lạc · Giải phẫu 3D — HIU CLB YHCT**.

## Non-negotiable operating rules
- Continue from the exact repository/branch/checkpoint; never rebuild from scratch.
- Repository: `drngovothiennhan/human-atlas`.
- Working branch: `feature-hiu-yhct-3d-atlas`.
- PR #1 is draft/open. Do not merge `main` unless the user explicitly orders it.
- Before editing, read `PROJECT_STATE.md`, `docs/CHECKBOARD.md`, `docs/SOURCE_AUDIT.md`, `docs/LICENSE_MATRIX.md`, `docs/ACUPOINT_SPATIAL_AUDIT.md`, and this file.
- Fetch the live branch HEAD and latest GitHub Actions runs first. Do not trust conversational memory or repeat completed work.
- Never fabricate coordinates, anatomical/clinical facts, tests, deployments, licenses, citations, reviewer identity/status, or completion percentages.
- Never infer a 3D z coordinate from a 2D map.
- A reusable license is necessary but not sufficient for 3D publication; BodyParts3D registration/review is a separate gate.
- Google/kinhlac.online/WHO and other non-redistributable sources are human reference/navigation only. Do not copy protected prose/assets/data.
- New third-party sources require exact artifact + exact license + attribution + coordinate-frame + provenance audit before import.
- Do not add unrelated features or code merely to increase activity.
- Keep the stable anatomy viewer, study panel and PWA intact.

## Last verified code checkpoint
- Code commit: `5046b736efc98ddce81347718edcdf5e8920a4a5`.
- Push CI: `35572643746` (#66) — SUCCESS.
- PR CI: `35572647309` (#67) — SUCCESS.
- Unit tests: 19/19 PASS.
- Content: 15 sources, 2 spatial candidates, 14 meridians, 361 acupoints, 5 pilot points, 0 committed pilot anchors.
- Anatomy validation: 2,234 meshes, 3,432 concept mappings, 2,288,268 triangles.
- Browser smoke: PASS on desktop 1440x900 and tablet emulation 1024x768; rotate/zoom/camera presets/reset/layer presets/touch orbit/catalogue/local assistant/registration draft capture/offline reload all passed; console errors = [].
- Registration review validator is implemented.
- Registration capture is locked to assembled geometry with the integumentary surface kept visible.

## Current blockers
- Runtime spatial acupoints = 0.
- Published 3D meridian paths = 0.
- The approved pilot needs 10 bilateral reviewed anchors; none may be synthesized.
- GitHub Pages deploy code builds successfully, but repository Pages is not enabled/configured. Auto push deployment is parked; workflow is manual-only until enablement.
- Render preview `https://hiu-yhct-3d-atlas-preview.onrender.com` is live but its latest listed deploy is commit `3ea0b3da…`, so it is not evidence for commit 5046.
- Physical tablet/laptop QA and fresh kinhlac.online side-by-side parity are not done.
- Do not claim >=95% acceptance/stability until a defined acceptance set is measured at that level.

## Exact continuation workflow
1. Fetch branch HEAD and Actions status. If HEAD contains only a later checkpoint/documentation commit, keep `5046b736…` as the last verified runtime code baseline unless newer runtime code has green CI.
2. Do not retry the old Pages failure as an app-code bug. Pages must first be enabled in repository Settings -> Pages -> Source: GitHub Actions; then manually dispatch the Pages workflow.
3. Continue the approved registration pilot only: ST-36, LI-4, LU-5, LU-9, ST-41.
4. Capture LEFT and RIGHT directly on the BodyParts3D surface through the registration workspace. Preserve pointCode, side, surface structure, triangle, barycentric coordinates, canonical XYZ, geometry source, location-reference sources and capture timestamp.
5. All new captures remain UNVERIFIED.
6. When genuine faculty review evidence exists, add reviewer + reviewedAt + FACULTY_REVIEWED/PUBLISHED and run:
   `npm run registration:validate-review -- <review-artifact.json>`
7. If validation fails, correct only the evidenced issue. Never alter coordinates to make validation pass.
8. Only after review validation passes, implement/promote reviewed anchors into runtime spatial records. Unreviewed anchors stay excluded.
9. Generate surface-following meridian paths only from reviewed anchors.
10. For every runtime/content change run: content validation -> content build -> TypeScript -> anatomy validator -> interaction validator -> unit tests -> production build -> static asset verification -> browser smoke -> Pages static build verification.
11. Record exact commit/run/deploy provenance at every checkpoint.
12. Update a live preview only from a verified commit. Do not label the stale Render deploy as current.
13. Physical-device QA and fresh reference parity remain required before handoff.

## Checkpoint output format
Record:
- current branch HEAD and last verified runtime code SHA;
- exact changes;
- push/PR CI run IDs and outcomes;
- content counts;
- runtime spatial point/path counts;
- deployment URL + source commit/deploy ID;
- source/license changes;
- exact failures/blockers;
- next exact action.

If interrupted, a new ChatGPT session must start from these repository files and live GitHub/hosting state, not from memory.

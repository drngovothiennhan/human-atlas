# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

You are the execution engineer for **HIU YHCT 3D Atlas — Huyệt vị · Kinh lạc · Giải phẫu 3D — HIU CLB YHCT**.

## Non-negotiable rules
- Continue from the exact repository/branch/checkpoint; do not rebuild from scratch.
- Repository: `drngovothiennhan/human-atlas`.
- Branch: `feature-hiu-yhct-3d-atlas`.
- PR #1 is draft/open. Do not merge main unless the user explicitly orders it.
- Before editing, read `PROJECT_STATE.md`, `docs/CHECKBOARD.md`, `docs/SOURCE_AUDIT.md`, `docs/LICENSE_MATRIX.md`, `docs/USER_PROVIDED_SOURCE_AUDIT.md`, `docs/ACUPOINT_SPATIAL_AUDIT.md` and this file.
- Fetch live branch HEAD and latest Actions runs first. Do not repeat completed work.
- Never fabricate coordinates, anatomy/clinical facts, test/deploy status, licenses, citations, reviewer identity/status, or completion percentages.
- Never infer a z coordinate from a 2D diagram.
- User upload/possession is not a redistribution license.
- User-provided PDFs remain REFERENCE_ONLY until exact reuse rights are established; do not commit their PDFs, pages, diagrams, long prose or coordinate tables.
- A reusable license is not enough for 3D publication; BodyParts3D registration plus review is a separate gate.
- Do not add unrelated features merely to increase code/activity.

## Last verified code checkpoint
- Code commit: `4e7e5edb6da4c82a0e92d81894720e3d30166579`.
- Push CI #68: `35576327240` — SUCCESS.
- PR CI #69: `35576331914` — SUCCESS.
- 20/20 unit tests PASS.
- Content: 19 sources, of which 4 user-provided REFERENCE_ONLY sources; 2 spatial candidates; 14 meridians; 361 points; 5 pilot points; 0 committed pilot anchors; 15 registration-reference evidence entries.
- Anatomy: 2,234 meshes; 3,432 mappings; 2,288,268 triangles.
- Browser smoke PASS: desktop rotate/zoom/camera presets/reset/layers; tablet touch emulation; local search/assistant; registration references; ST-36 LEFT UNVERIFIED surface capture; PWA offline reload; zero console errors.
- Push browser artifact ID: `10628377175`.
- PR browser artifact ID: `10627653035`.

## Newly integrated source workflow
The four user-provided PDFs are metadata/reference sources only:
- `USER-BYT-2020-YHCT-GUIDELINE`
- `USER-HANOI-YHCT-LECTURE-T1-2005`
- `USER-CONGSI-KINH-LAC-HOC`
- `USER-NGO-TRUNG-TRIEU-HUYET-VI-KINH-LAC`

`content/registration/reference-evidence.json` contains short bibliographic locators for ST-36, LI-4, LU-5, LU-9 and ST-41. The registration UI displays them to a human reviewer. These locators are not spatial coordinates.

## Current blockers
- Runtime published 3D acupoints = 0.
- Published 3D meridian paths = 0.
- Pilot requires 10 bilateral reviewed anchors; do not synthesize them.
- GitHub Pages repo-level enablement is still missing; old run `35571169188` failed only at Configure Pages.
- Render preview `https://hiu-yhct-3d-atlas-preview.onrender.com` remains stale; latest listed live deploy `dep-daobqpmgekts73blir4g` is from commit `3ea0b3da…`.
- Physical-device QA and fresh kinhlac.online parity are pending.
- Do not claim >=95% acceptance/stability until a defined acceptance set is measured at that level.

## Exact continuation workflow
1. Fetch branch HEAD and Actions status.
2. Preserve `4e7e5edb…` as the last verified runtime code baseline unless newer runtime code has green CI.
3. Do not redo PDF/source integration.
4. Continue only the approved registration pilot: ST-36, LI-4, LU-5, LU-9, ST-41.
5. For each point, capture LEFT and RIGHT by clicking directly on the BodyParts3D surface while consulting the UI reference locators.
6. Preserve pointCode, side, BodyParts3D structure, triangle, barycentric, canonical XYZ, geometry source, reference sources and timestamp.
7. Every new capture remains UNVERIFIED.
8. When genuine faculty review exists, attach reviewer + reviewedAt + FACULTY_REVIEWED/PUBLISHED and run `npm run registration:validate-review -- <review-artifact.json>`.
9. Correct only evidenced review errors; never move coordinates merely to make validation pass.
10. Only after review validation passes, promote reviewed anchors into runtime spatial records.
11. Generate meridian paths only from reviewed anchors.
12. After every runtime/content change run: content validate -> content build -> TypeScript -> anatomy validator -> interaction validator -> unit tests -> production build -> static verification -> browser smoke -> Pages static build verification.
13. Record exact commit/run/deploy provenance at every checkpoint.
14. Update a live preview only from a verified code commit.
15. Complete physical tablet/laptop QA and fresh side-by-side reference parity before handoff.

## Checkpoint format
Record branch HEAD, verified runtime SHA, changes, CI run IDs, test counts, content counts, spatial point/path counts, deploy provenance, source/license changes, exact blockers and next action.

If interrupted, a new session must start by reading these repository files and live GitHub/hosting state rather than trusting conversational memory.

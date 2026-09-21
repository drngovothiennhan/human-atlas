# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

You are the execution engineer for **HIU YHCT 3D Atlas — Huyệt vị · Kinh lạc · Giải phẫu 3D — HIU CLB YHCT**.

## Absolute rules
- Continue from the exact repository/branch/checkpoint. Never rebuild from scratch.
- Repository: `drngovothiennhan/human-atlas`.
- Branch: `feature-hiu-yhct-3d-atlas`.
- PR #1 stays draft/open. Do not merge `main` unless the user explicitly orders it.
- Before any edit, fetch live branch HEAD + GitHub Actions + hosting state, then read `PROJECT_STATE.md`, `docs/CHECKBOARD.md`, `docs/SOURCE_AUDIT.md`, `docs/LICENSE_MATRIX.md`, `docs/USER_PROVIDED_SOURCE_AUDIT.md`, `docs/ACUPOINT_SPATIAL_AUDIT.md` and this file.
- Never repeat work already evidenced as complete.
- Never fabricate coordinates, clinical/anatomy facts, licenses, citations, test/deploy status, reviewer identity/status or completion percentages.
- Never infer z from a 2D image/diagram.
- User possession/upload of a file is not a redistribution license.
- User PDFs stay REFERENCE_ONLY unless exact reuse rights are established.
- Do not add unrelated code just to increase activity.
- Do not claim >=95% stability/completion until the defined acceptance set is actually measured at >=95%.

## Current live checkpoint
- Runtime feature commit: `02863ede405605948bf6da4f9b24a02376ede296` — guides the operator to the next missing bilateral pilot anchor.
- Runtime feature CI: push #72 `35578285028` SUCCESS; PR #73 `35578290694` SUCCESS.
- Smoke-test commit: `9a7c3478ced292c85c35950498417b3c64958c22` — verifies 0/10 -> 1/10 pilot progress and next target ST-36 RIGHT.
- Smoke-test CI: push #74 `35578328980` SUCCESS; PR #75 `35578333263` SUCCESS.
- Interaction-test commit: `9e96413f310d17545c080ab6975b786cf82e7679` — dedicated desktop pan and tablet pinch assertions; its CI was still running when this checkpoint was written.
- CI-control commit: `e6eaa61b8cb804ac21f98e9b4e27e773cb8580de` — future superseded CI runs are cancelled by concurrency.
- Live Render deploy: `dep-daoeqlek1f9s73bpv640` from `e6eaa61b…`.
- Live preview: https://hiu-yhct-3d-atlas-preview.onrender.com
- GitHub Pages remains repository-config blocked; do not waste code cycles retrying Pages until repo-level Pages is enabled.

## Verified product state
- BodyParts3D 4.0 viewer.
- 15 anatomy display systems.
- 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles.
- 361 standard acupoint identifiers across 14 meridians.
- Ordered point sequences for all 14 meridians.
- ST36/ST-36 search and local study assistant.
- Registration pilot: ST-36, LI-4, LU-5, LU-9, ST-41; LEFT + RIGHT = 10 required anchors.
- Registration captures canonical BodyParts3D surface structure + triangle + barycentric + XYZ and forces UNVERIFIED.
- Progress UI shows all 10 targets and current count.
- Next-missing control moves the operator to the first uncaptured point/side so no side is accidentally skipped.
- Draft JSON export remains review-only.
- Review validator rejects unreviewed/out-of-pilot/malformed anchors.
- Meridian paths accept only FACULTY_REVIEWED/PUBLISHED anchors.
- Four user-supplied PDFs remain metadata/reference-only and are not bundled.
- Google links remain outbound reference-only.
- Runtime published anchors = 0; published 3D meridian paths = 0. Do not invent them.

## Current blockers / unfinished acceptance
- Ten bilateral pilot anchors still require human capture directly on BodyParts3D.
- Genuine faculty review is required before promotion.
- Full Vietnamese/English name/localization coverage is incomplete where provenance is not yet reusable/reviewed.
- Physical Android/tablet + Windows/laptop QA is still pending.
- Fresh side-by-side kinhlac.online parity measurement is still pending.
- GitHub Pages repository setting is not enabled.

## Continuous execution algorithm
1. Fetch live HEAD, Actions status, PR #1 and Render deploy state.
2. If the newest code CI is failing, inspect the exact failed job/step/log and fix only that evidenced failure.
3. If a newer runtime commit has green CI, record it as the new verified runtime SHA.
4. Do not redo source/license/PDF integration already marked complete.
5. Continue only approved work in this order:
   a. finish automated interaction assertions;
   b. continue the 10-anchor bilateral registration workflow;
   c. validate genuine faculty-review artifacts;
   d. promote only reviewed anchors;
   e. generate paths only from reviewed anchors;
   f. rerun full CI;
   g. refresh preview from a verified runtime commit;
   h. perform physical-device QA and fresh reference parity.
6. For each pilot anchor, capture by clicking the BodyParts3D surface while consulting approved human-reference locators; store pointCode, side, surfaceStructureId/name, triangleIndex, barycentric, canonical XYZ, geometrySource, reference sources and capturedAt.
7. Keep every newly captured anchor UNVERIFIED.
8. Never alter coordinates just to make validation pass.
9. After any runtime/content change run the complete gate: content validate -> content build -> TypeScript -> anatomy validator -> interaction validator -> unit tests -> production build -> static verification -> browser smoke -> Pages static build verification.
10. At each stable checkpoint update `docs/CHECKBOARD.md`, `PROJECT_STATE.md` and this file with exact SHAs/run IDs/deploy IDs/blockers/next action.
11. If interrupted or another chat is opened, start from these repository files and live GitHub/Render state rather than conversational memory.
12. Stop only at a real checkpoint: code committed, relevant CI state known, deployment provenance known, and remaining blockers explicitly recorded.

## Handoff rule
A handoff may say "live preview available" when the exact deploy is live. It must not say ">=95% complete/stable" until physical-device QA, fresh parity measurement and all defined acceptance gates support that claim.

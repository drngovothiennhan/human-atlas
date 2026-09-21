# PROJECT_STATE

CURRENT PHASE: Phase 17 continuation checkpoint — bilateral pilot capture workflow improved and live; spatial publication remains faculty-review gated.
BRANCH: `feature-hiu-yhct-3d-atlas`
PR: #1 draft/open; `main` untouched.

## LIVE / VERIFIED RUNTIME FUNCTIONALITY
- BodyParts3D 4.0 anatomy viewer with rotate, zoom, select/search, isolate/explode and 15 display systems.
- 361-point standard catalogue across 14 meridians with ordered point sequences.
- ST36/ST-36 search and local study assistant.
- Five-point registration pilot: ST-36, LI-4, LU-5, LU-9, ST-41.
- Surface capture records BodyParts3D structure, triangle index, barycentric coordinates and canonical XYZ.
- New captures are forced to UNVERIFIED.
- Pilot progress UI tracks all 10 LEFT/RIGHT targets.
- Next-missing anchor control advances the operator to the first uncaptured pilot point/side.
- Draft JSON export remains review-only.
- Faculty review validator rejects malformed/unreviewed/out-of-pilot evidence.
- Meridian path builder accepts only FACULTY_REVIEWED/PUBLISHED anchors.
- Four user-provided PDFs remain REFERENCE_ONLY; binaries/scans/diagrams/long prose/coordinate tables are not bundled.

## CURRENT PROVENANCE
- Runtime feature commit: `02863ede405605948bf6da4f9b24a02376ede296`.
- Runtime feature CI: push #72 `35578285028` SUCCESS; PR #73 `35578290694` SUCCESS.
- Smoke verification commit: `9a7c3478ced292c85c35950498417b3c64958c22`.
- Smoke CI: push #74 `35578328980` SUCCESS; PR #75 `35578333263` SUCCESS.
- Interaction assertion commit: `9e96413f310d17545c080ab6975b786cf82e7679`; adds desktop pan and tablet pinch smoke assertions. CI #76/#77 was still running at checkpoint time.
- CI concurrency commit: `e6eaa61b8cb804ac21f98e9b4e27e773cb8580de`.
- Live Render deploy: `dep-daoeqlek1f9s73bpv640` from `e6eaa61b…`, status LIVE.
- Preview URL: https://hiu-yhct-3d-atlas-preview.onrender.com

## KNOWN BLOCKERS / NOT COMPLETE
- Committed pilot anchors = 0.
- Runtime published 3D acupoints = 0.
- Published 3D meridian paths = 0.
- Human operator still must capture 10 bilateral pilot anchors directly on BodyParts3D.
- Genuine faculty review evidence is required before runtime promotion.
- Physical tablet/laptop QA has not yet been completed.
- Fresh side-by-side kinhlac.online parity remains unmeasured.
- GitHub Pages is still disabled at repository level; previous failure was at Configure Pages.
- Do not claim >=95% completion/stability yet.

## SOURCE / LICENSE RULES
- License permission and BodyParts3D spatial registration remain separate gates.
- Never synthesize z or infer canonical 3D coordinates from 2D diagrams.
- AcuAtlas/AcuSim data may be studied according to audited terms but are not runtime-coordinate sources until a validated BodyParts3D transform/registration exists.
- User PDFs are human references only unless exact reuse rights are established.
- Google is outbound reference-only; do not copy search-result content into runtime data.

## NEXT EXACT ACTION
1. Read live Actions state for CI #76/#77 and #78/#79; fix only evidenced failures.
2. Do not repeat completed source/license/PDF integration.
3. Continue the 10-anchor bilateral pilot through the live registration workspace.
4. Keep all captures UNVERIFIED.
5. Obtain genuine faculty review and validate the review artifact.
6. Promote only reviewed anchors.
7. Generate meridian paths only from reviewed anchors.
8. Re-run the full automated gate after any runtime/content promotion.
9. Complete physical Android/tablet + Windows/laptop QA and fresh kinhlac.online parity before >=95% handoff.

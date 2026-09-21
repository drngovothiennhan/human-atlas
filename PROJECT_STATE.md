# PROJECT_STATE

CURRENT PHASE: Phase 17 continuation checkpoint — user-provided kinh/huyệt references integrated safely into the faculty registration workflow; runtime spatial publication remains faculty-review gated.
CHECKPOINT BASE CODE COMMIT: 4e7e5edb6da4c82a0e92d81894720e3d30166579
BRANCH: feature-hiu-yhct-3d-atlas
PR: #1 draft/open; main not merged.

## WHAT WORKS
- BodyParts3D 4.0 web anatomy viewer with orbit/rotate, zoom, select/search, isolate/explode and 15 anatomy display systems.
- Complete 361-point standard catalogue across 14 meridians with ordered point sequences.
- Point-code search supports compact/hyphenated forms such as ST36/ST-36.
- Local study assistant answers catalogue/meridian questions from bundled local data.
- PWA manifest/service worker and offline app-shell reload.
- Five-point BodyParts3D registration pilot: ST-36, LI-4, LU-5, LU-9, ST-41.
- Registration workspace captures BodyParts3D surface structure, triangle index, barycentric coordinates and canonical XYZ as UNVERIFIED local drafts.
- Registration mode forces assembled geometry and keeps integumentary surface visible.
- Faculty-review artifact validator rejects unreviewed/out-of-pilot/malformed evidence.
- Meridian path builder accepts only FACULTY_REVIEWED/PUBLISHED anchors.
- Four user-provided medical/course PDFs are now represented as REFERENCE_ONLY source metadata; the PDF binaries, scan pages, diagrams, long prose and copied coordinate tables are not bundled.
- Registration workspace loads bibliographic/reference evidence for each pilot point from `public/data/registration-reference-evidence.json`.
- The Bộ Y tế PDF is used for nomenclature/clinical cross-check only; the illustrated Ngô Trung Triều atlas is a human visual reference only. Neither is accepted as a transferable BodyParts3D coordinate source.
- CI verifies the reference-only gate and registration-reference UI.

## VERIFIED TEST EVIDENCE
Verified runtime/code commit: `4e7e5edb6da4c82a0e92d81894720e3d30166579`.

- Push CI run `35576327240` / run #68 — SUCCESS.
- PR CI run `35576331914` / run #69 — SUCCESS.
- Content validation: PASS.
- Content counts: 19 sources; 4 user-provided REFERENCE_ONLY sources; 2 spatial candidates; 14 meridians; 361 acupoints; 5 pilot points; 0 committed pilot anchors; 15 pilot reference-evidence entries.
- Unit tests: 20/20 PASS.
- Anatomy integrity: 2,234 indexed meshes; 3,432 complete concept mappings; 2,288,268 triangles; binary buffers verified.
- Static build check: 45 files; largest asset `models/body-1.bin` = 4,526,484 bytes; per-asset gate = 26,214,400 bytes.
- Browser smoke: PASS.
- Browser evidence: desktop rotate/zoom/front/back/side/reset/layer presets PASS; tablet 1024x768 touch orbit PASS; 48 model responses; local meridian search PASS; local study assistant PASS; registration reference-evidence panel PASS; ST-36 LEFT surface draft capture remains UNVERIFIED with valid barycentric evidence; PWA offline reload PASS; console errors = [].
- Push-run browser artifact: `browser-smoke-evidence`, artifact ID `10628377175`.
- PR-run browser artifact: `browser-smoke-evidence`, artifact ID `10627653035`.

## USER-PROVIDED SOURCE STATE
- `USER-BYT-2020-YHCT-GUIDELINE`: REFERENCE_ONLY, runtimeBundled=false.
- `USER-HANOI-YHCT-LECTURE-T1-2005`: REFERENCE_ONLY, runtimeBundled=false.
- `USER-CONGSI-KINH-LAC-HOC`: REFERENCE_ONLY, runtimeBundled=false.
- `USER-NGO-TRUNG-TRIEU-HUYET-VI-KINH-LAC`: REFERENCE_ONLY, runtimeBundled=false.
- Reuse/redistribution rights for the scans are not established; user upload is not treated as a redistribution license.
- Detailed audit: `docs/USER_PROVIDED_SOURCE_AUDIT.md`.

## FAILED / BLOCKED / NOT YET COMPLETE
- Runtime published spatial acupoints remain 0.
- Published 3D meridian paths remain 0.
- The five pilot points require 10 bilateral reviewed anchors (LEFT + RIGHT for each point); none may be synthesized or inferred from 2D diagrams.
- Full point-name/localization prose remains incomplete where exact reusable provenance/review is absent.
- Physical tablet/laptop QA has not been executed; CI tablet evidence is emulation only.
- Fresh side-by-side kinhlac.online parity remains NOT MEASURED.
- GitHub Pages deploy run `35571169188` remains the known repository-configuration failure at `actions/configure-pages@v5`; build/tests before it passed. Pages auto-push deployment remains parked/manual-only.
- Render preview remains LIVE but stale relative to current code: service `srv-daob9fp42hec7395v8ug`, URL https://hiu-yhct-3d-atlas-preview.onrender.com, latest listed live deploy `dep-daobqpmgekts73blir4g` from commit `3ea0b3da8c656dd344a52680318f4b86d8035472`. Do not cite it as proof of commit 4e7e.

## NEXT EXACT ACTION
1. Preserve code baseline `4e7e5edb…`; do not repeat completed source integration.
2. Use the registration workspace and its WHO/Bộ Y tế/user-atlas locators to capture LEFT + RIGHT for ST-36, LI-4, LU-5, LU-9 and ST-41 directly on BodyParts3D.
3. Keep every new capture UNVERIFIED.
4. Obtain genuine faculty review evidence and validate it with `npm run registration:validate-review -- <review-artifact.json>`.
5. Only after review validation passes, promote reviewed anchors into runtime spatial records; never infer z or auto-transform the PDF diagrams.
6. Generate meridian paths only from reviewed anchors.
7. Re-run the complete automated gate after any spatial/content promotion.
8. Refresh a live deployment from a verified commit, then perform physical tablet/laptop QA and a fresh side-by-side reference-parity run before any >=95% handoff claim.

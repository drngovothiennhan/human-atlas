# PROJECT_STATE

CURRENT PHASE: Phase 17 continuation checkpoint — registration review gate and canonical surface-capture hardening complete; runtime spatial publication remains review-gated.
CHECKPOINT BASE CODE COMMIT: 5046b736efc98ddce81347718edcdf5e8920a4a5
BRANCH: feature-hiu-yhct-3d-atlas
PR: #1 draft/open; main not merged.

## WHAT WORKS
- BodyParts3D 4.0 web anatomy viewer with orbit/rotate, zoom, select/search, isolate/explode and 15 anatomy display systems.
- Isolated feature branch and draft PR; production/main remains untouched.
- License-gated content pipeline with 15 audited source records.
- Complete 361-point standard catalogue across 14 meridians with ordered point sequences.
- Point-code search supports compact/hyphenated forms such as ST36/ST-36.
- Local study assistant answers catalogue/meridian questions from bundled local data.
- PWA manifest/service worker and offline app-shell reload.
- Five-point BodyParts3D registration pilot is staged: ST-36, LI-4, LU-5, LU-9, ST-41.
- Faculty registration workspace captures BodyParts3D surface structure, triangle index, barycentric coordinates and canonical XYZ as UNVERIFIED local drafts.
- Registration workspace now forces assembled geometry and keeps integumentary surface visible while registration is enabled, preventing capture against an exploded/hidden visual state.
- Faculty-review artifact validator exists: `npm run registration:validate-review -- <file.json>`.
- Review validator rejects UNVERIFIED anchors, duplicate/out-of-pilot anchors, missing reviewer evidence, wrong coordinate system, invalid barycentric evidence and unapproved pilot references.
- Meridian path builder accepts only FACULTY_REVIEWED/PUBLISHED anchors.
- CI exercises desktop 1440x900, tablet emulation 1024x768, model load, rotate, wheel zoom, front/back/side camera presets, reset, layer presets, 361-point catalogue, ST36 search, local assistant, registration surface capture and offline reload.

## VERIFIED TEST EVIDENCE
Verified code commit: `5046b736efc98ddce81347718edcdf5e8920a4a5`.

- Push CI run: `35572643746` / run #66 — SUCCESS.
- PR CI run: `35572647309` / run #67 — SUCCESS.
- Content validation: PASS.
- Content counts: 15 sources; 2 spatial candidates; 14 meridians; 361 acupoints; 5 pilot points; 0 committed pilot anchors.
- Unit tests: 19/19 PASS.
- Anatomy integrity: 2,234 indexed meshes; 3,432 complete concept mappings; 2,288,268 triangles; binary buffers verified.
- Static build check: 44 files; largest asset `models/body-1.bin` = 4,526,484 bytes; per-asset gate = 26,214,400 bytes.
- Browser smoke: PASS.
- Browser smoke evidence: desktop rotate/zoom/camera presets/reset/layer presets PASS; tablet touch orbit PASS; 48 successful model responses; local meridian search PASS; local assistant PASS; registration ST-36 LEFT draft capture UNVERIFIED with valid barycentric evidence; PWA offline reload PASS; console errors = [].
- Push run artifact: `browser-smoke-evidence`, artifact ID `10627161150`.

## FAILED / BLOCKED / NOT YET COMPLETE
- GitHub Pages deploy run `35571169188` failed at `actions/configure-pages@v5` because the repository Pages site is not enabled/configured to build with GitHub Actions. Build/tests/static verification before that step passed.
- Automatic Pages deploy-on-push has been parked; the Pages workflow is manual-only until repository-level Pages is enabled. This prevents known environment configuration from producing repeated false-red deploy runs.
- Runtime spatially published acupoints remain 0.
- Published 3D meridian paths remain 0.
- The five pilot points require 10 bilateral reviewed anchors (LEFT + RIGHT for each point); none may be synthesized.
- Full point-name/localization prose remains intentionally incomplete where exact reusable provenance/review is missing.
- Physical tablet/laptop QA has not been executed; CI tablet evidence is emulation only.
- Side-by-side kinhlac.online parity remains NOT MEASURED.
- Latest Render preview is LIVE but stale relative to the registration code: service `srv-daob9fp42hec7395v8ug`, URL https://hiu-yhct-3d-atlas-preview.onrender.com, latest listed live deploy `dep-daobqpmgekts73blir4g` from commit `3ea0b3da8c656dd344a52680318f4b86d8035472`. Do not cite it as proof of commit 5046.

## SOURCE / LICENSE STATE
- BodyParts3D 4.0: DIRECT_USE / CC-BY-4.0.
- HIU standard nomenclature compilation: DIRECT_USE / CC0-1.0.
- AcuAtlas 361 reference dataset: DIRECT_USE data / CC-BY-4.0; mapped coordinates remain BodyParts3D registration BLOCKED.
- AcuSim Dryad 2025: DIRECT_USE data / CC0-1.0; synthetic-model coordinate frame remains BodyParts3D registration BLOCKED.
- WHO 2008 acupuncture publication: REFERENCE_ONLY; copyrighted prose is not redistributed.
- kinhlac.online: REFERENCE_ONLY clean-room UX reference.
- Google Search: REFERENCE_ONLY / LINK_ONLY; no result data bundled.
- Z-Anatomy: REFERENCE_ONLY pending exact-asset/share-alike compatibility handling.
- TARA/FMA exact artifacts: QUARANTINE until exact license evidence is verified.

## NEXT EXACT ACTION
1. Use the built-in registration workspace to capture the approved bilateral pilot only: ST-36, LI-4, LU-5, LU-9 and ST-41.
2. Do not programmatically invent coordinates or infer z from 2D maps. Each capture must come from the BodyParts3D surface and preserve triangle/barycentric/structure evidence.
3. Obtain faculty review evidence for each captured anchor and validate the reviewed file with `registration:validate-review`.
4. Only after review validation passes, add the promotion adapter that writes reviewed anchors into runtime spatial records; keep unreviewed anchors excluded.
5. Generate meridian paths only from reviewed anchors.
6. Re-run content validation -> build -> TypeScript -> anatomy/interactions validators -> unit tests -> static build checks -> browser smoke.
7. Update the live preview only from a verified commit and record deploy provenance.
8. Perform physical tablet/laptop QA and a fresh side-by-side reference-parity run before any >=95% acceptance claim.

# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Verified runtime code: `b06b4acacf3f02037ffbdea5da75ab957a79db15`
Rule: evidence first. Do not mark DONE/PASS without commit, CI, deploy, test, source/license or review evidence.

## Status legend
- [x] PASS/DONE
- [ ] PENDING
- [!] BLOCKED / external evidence required
- [~] PARTIAL / implemented but acceptance incomplete

## Repository / delivery
- [x] Feature branch isolated; `main` untouched; PR #1 remains draft/open.
- [x] Runtime code `b06b4acacf3f02037ffbdea5da75ab957a79db15` passed push CI #98 `35580796392` and PR CI #99 `35580801767`.
- [x] Content validate/build, TypeScript, anatomy/interactions validators, unit tests, production/static builds and browser smoke all PASS.
- [x] Browser smoke artifact `10630243332`.
- [x] Render deploy `dep-daof99oae00c73c9sv10` from `b06b4aca…` is LIVE.
- [x] Preview URL: https://hiu-yhct-3d-atlas-preview.onrender.com
- [x] CI concurrency cancels superseded runs; cancelled intermediate runs are expected and are not application failures.
- [!] GitHub Pages remains disabled at repository level; prior Configure Pages failure is configuration-only.

## 3D anatomy / interaction
- [x] BodyParts3D 4.0 viewer retained.
- [x] 15 anatomy display systems.
- [x] 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles validated.
- [x] Desktop rotate, wheel zoom, pan, camera presets/reset and layer presets smoke-tested.
- [x] Tablet 1024x768 touch orbit + pinch emulation smoke-tested.
- [x] Browser console errors = 0 in latest smoke.
- [ ] Physical tablet/laptop QA remains required.

## Clean-room Kinh lạc 3D feature
- [x] New `Kinh lạc 3D` panel integrated into the BodyParts3D application.
- [x] 14-meridian selector and LEFT/RIGHT/BOTH filters.
- [x] Point-code search and point detail.
- [x] Anchored point can drive camera focus.
- [x] Local BodyParts3D registration drafts can render as 3D markers and remain visibly UNVERIFIED.
- [x] Marker renderer and reviewed-path renderer are integrated into the same Three.js anatomy scene.
- [x] Anatomy is forced assembled while the meridian overlay is visible so anchors do not drift from canonical BodyParts3D geometry.
- [x] Browser smoke verifies the Kinh lạc 3D panel, local draft overlay, and zero fabricated paths.
- [x] Clean-room behavior reference only: kinhlac.online public journeys; no source/model/database copied.
- [x] SMPLify-M researched as a technical reference only; restrictive SMPL-X license and model-specific vertex indices block reuse.
- [!] Published runtime spatial acupoints: 0.
- [!] Published 3D meridian paths: 0.
- [!] The app intentionally does not connect UNVERIFIED draft anchors into a fake meridian path.

## Acupoint / meridian catalogue
- [x] 361 standard point identifiers across 14 meridians.
- [x] Ordered sequence for all 14 meridians.
- [x] ST36/ST-36 code search.
- [x] Local study assistant.
- [~] Full Vietnamese/English naming/localization remains incomplete where reusable/reviewed provenance is missing.

## Source / license governance
- [x] BodyParts3D used under audited direct-use terms.
- [x] AcuAtlas and AcuSim/Dryad remain license-usable references but BodyParts3D spatial registration is still required.
- [x] Antonio-Abrao/acu-master, spacejohnlf/tcm-acupoints, SMPLify-M and kinhlac.online are reference-only under their audited constraints.
- [x] Four user PDFs remain REFERENCE_ONLY and runtimeBundled=false.
- [x] Google is outbound reference-only; search-result content is not imported.
- [x] No missing z coordinate is synthesized from 2D material.

## Spatial registration pilot
- [x] Pilot: ST-36, LI-4, LU-5, LU-9, ST-41; LEFT + RIGHT = 10 anchors.
- [x] Capture stores BodyParts3D structure, triangle, barycentric and canonical XYZ.
- [x] Every fresh capture is forced to UNVERIFIED.
- [x] Progress 0/10 -> 1/10 and next-missing ST-36 RIGHT verified in browser smoke.
- [x] Faculty-review validator and reviewed-path gate remain active.
- [!] Committed pilot anchors: 0.
- [ ] Human capture all 10 bilateral anchors directly on BodyParts3D.
- [ ] Genuine faculty review.
- [ ] Validate complete review artifact.
- [ ] Promote only reviewed anchors.
- [ ] Generate meridian paths only from reviewed anchors.

## Acceptance / handoff
- [x] New clean-room Kinh lạc 3D shell/interaction layer is live on the verified preview.
- [ ] Published spatial acupoint/meridian dataset is not complete.
- [ ] Physical Android/tablet and Windows/laptop acceptance.
- [ ] Fresh side-by-side kinhlac.online parity measurement.
- [ ] Do not claim >=95% complete/stable until the defined acceptance set is actually measured at >=95%.

## Exact next execution order
1. Do not redo verified source/license/3D-shell work.
2. Continue the 10-anchor bilateral BodyParts3D pilot.
3. Keep every capture UNVERIFIED until genuine faculty review exists.
4. Validate review artifacts; never move coordinates merely to pass validation.
5. Promote only reviewed anchors, then generate reviewed paths.
6. Re-run the full CI gate after spatial promotion.
7. Perform physical-device QA and fresh side-by-side reference parity before >=95% handoff.

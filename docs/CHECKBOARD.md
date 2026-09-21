# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Rule: evidence first. Do not mark DONE/PASS without commit, CI, deploy, test, source/license or review evidence.

## Status legend
- [x] PASS/DONE
- [ ] PENDING
- [!] BLOCKED / external evidence required
- [~] PARTIAL / implemented but acceptance incomplete

## Repository / delivery
- [x] Isolated feature branch retained; `main` untouched.
- [x] PR #1 remains draft/open.
- [x] Runtime feature commit `02863ede405605948bf6da4f9b24a02376ede296`: next-missing pilot anchor guidance.
- [x] Runtime feature CI: push #72 `35578285028` SUCCESS; PR #73 `35578290694` SUCCESS.
- [x] Follow-up smoke-test commit `9a7c3478ced292c85c35950498417b3c64958c22`: push #74 `35578328980` SUCCESS; PR #75 `35578333263` SUCCESS.
- [~] Interaction-only test commit `9e96413f310d17545c080ab6975b786cf82e7679` adds dedicated desktop pan + tablet pinch assertions; CI #76/#77 still running at this checkpoint.
- [x] CI concurrency guard commit `e6eaa61b8cb804ac21f98e9b4e27e773cb8580de` added to cancel superseded future runs.
- [x] Render preview deploy `dep-daoeqlek1f9s73bpv640` from `e6eaa61b…` is LIVE.
- [x] Preview URL: https://hiu-yhct-3d-atlas-preview.onrender.com
- [!] GitHub Pages remains disabled at repository level; previous Configure Pages failure is configuration-only, not an application build failure.

## 3D anatomy / interaction
- [x] BodyParts3D 4.0 viewer retained.
- [x] 15 anatomy display systems.
- [x] 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles validated.
- [x] Desktop rotate, wheel zoom, camera presets/reset and layer presets smoke-tested.
- [x] Tablet 1024x768 touch orbit smoke-tested.
- [~] Dedicated desktop pan + tablet pinch assertions are implemented; awaiting their current CI completion before marking PASS.
- [ ] Physical tablet/laptop QA remains required.
- [x] Browser console errors were zero at the last verified smoke checkpoint.

## Acupoint / meridian catalogue
- [x] 361 standard point identifiers across 14 meridians.
- [x] Ordered sequence for all 14 meridians.
- [x] ST36/ST-36 code search.
- [x] Local study assistant.
- [~] Full Vietnamese/English naming/localization remains incomplete where reusable/reviewed provenance is missing.

## Source / license governance
- [x] BodyParts3D used under audited direct-use terms.
- [x] AcuAtlas and AcuSim/Dryad audited as reusable references but blocked from direct BodyParts3D runtime coordinates without a validated transform/registration.
- [x] WHO/Bộ Y tế/user-supplied references kept within their allowed roles.
- [x] Four user PDFs remain REFERENCE_ONLY and runtimeBundled=false.
- [x] No PDF scans, diagrams, long copied prose or unverified coordinate tables are bundled.
- [x] Google links are outbound reference-only; search-result content is not copied into runtime data.
- [x] No missing z coordinate is synthesized from 2D material.

## Spatial registration pilot
- [x] Pilot points: ST-36, LI-4, LU-5, LU-9, ST-41.
- [x] Required bilateral target count: 10 anchors.
- [x] Capture stores BodyParts3D surface structure, triangle, barycentric and canonical XYZ.
- [x] Every fresh capture is forced to UNVERIFIED.
- [x] Progress UI shows captured/required count and LEFT/RIGHT status for each pilot point.
- [x] New control navigates directly to the next missing pilot anchor to reduce skipped sides/points.
- [x] Browser smoke verifies progress changes 0/10 -> 1/10 and next-missing target ST-36 RIGHT.
- [x] Draft export remains UNVERIFIED review JSON.
- [x] Faculty-review validator and reviewed-path gate remain active.
- [!] Committed pilot anchors: 0.
- [!] Runtime published spatial acupoints: 0.
- [!] Published 3D meridian paths: 0.
- [ ] Human capture of all 10 bilateral anchors directly on BodyParts3D.
- [ ] Genuine faculty review evidence.
- [ ] Review-artifact validation.
- [ ] Promote only reviewed anchors.
- [ ] Generate meridian paths only from reviewed anchors.

## Acceptance / handoff
- [x] Current new runtime feature is live on Render preview.
- [ ] Complete CI for the newly added pan/pinch assertions.
- [ ] Physical Android/tablet and Windows/laptop acceptance.
- [ ] Fresh side-by-side kinhlac.online parity measurement.
- [ ] Do not claim >=95% complete/stable until the defined acceptance set is actually measured at >=95%.

## Exact next execution order
1. Do not redo completed source/PDF/license work.
2. Let CI #76/#77 and #78/#79 finish; inspect and fix only evidenced failures.
3. Continue the 10-anchor bilateral pilot using direct BodyParts3D surface capture plus human reference locators.
4. Never invent/infer coordinates or reviewer evidence.
5. Keep anchors UNVERIFIED until genuine faculty review.
6. Validate the complete review artifact before any runtime promotion.
7. Build 3D meridian paths only after reviewed anchors exist.
8. Re-run the complete gate after any runtime/content promotion.
9. Complete physical-device and reference-parity QA before >=95% handoff.

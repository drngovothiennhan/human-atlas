# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Verified code commit: `4e7e5edb6da4c82a0e92d81894720e3d30166579`
Rule: evidence first. Do not mark DONE/PASS without a commit, CI run, test result, deploy record, or source/license evidence.

## Status legend
- [x] PASS/DONE — implemented and verified.
- [ ] PENDING — approved work not yet complete.
- [!] BLOCKED — cannot be promoted without external evidence/review/configuration.
- [~] PARTIAL — implemented but acceptance evidence remains incomplete.

## Repository / CI
- [x] Feature branch isolated; main untouched; PR #1 draft/open.
- [x] Push CI #68 `35576327240` SUCCESS.
- [x] PR CI #69 `35576331914` SUCCESS.
- [x] Content validation, build, TypeScript, anatomy/interactions validators, 20 unit tests, production/static builds and browser smoke are green.
- [x] 45 static files verified; largest asset 4,526,484 bytes under 26,214,400-byte gate.
- [!] GitHub Pages repository setting remains unconfigured; old Pages run `35571169188` failed only at Configure Pages.
- [x] Pages auto-push deploy remains parked; manual workflow retained after repository enablement.
- [~] Render preview is live but stale; latest listed live source is commit `3ea0b3da…`, not current code.

## 3D anatomy / QA
- [x] BodyParts3D 4.0 viewer retained.
- [x] 15 display systems.
- [x] 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles validated.
- [x] Desktop rotate, wheel zoom, front/back/side, reset and layer presets smoke-tested.
- [x] Tablet 1024x768 touch emulation smoke-tested.
- [x] Browser console errors = 0.
- [ ] Dedicated pan assertion.
- [ ] Dedicated pinch assertion and physical tablet/laptop QA.

## Acupoint / meridian catalogue
- [x] 361 standard point identifiers across 14 meridians.
- [x] Ordered point sequence for all 14 meridians.
- [x] ST36/ST-36 search.
- [x] Local study assistant.
- [~] Full Vietnamese/English naming/localization remains incomplete where reusable/reviewed provenance is missing.

## User-provided reference integration
- [x] Four supplied PDFs audited and registered as REFERENCE_ONLY.
- [x] Runtime bundling explicitly disabled for all four.
- [x] No PDF binary, page scan, diagram, long prose, or copied coordinate table committed.
- [x] Bộ Y tế document used only for nomenclature/clinical corroboration.
- [x] Ngô Trung Triều illustrated atlas used only as human visual location reference.
- [x] Công Sĩ Kinh Lạc Học retained as reference-only, especially for kỳ huyệt; not used as automatic standard-meridian coordinate source.
- [x] Hanoi YHCT lecture retained as theory/reference-only.
- [x] Five pilot points have 15 short bibliographic/reference evidence locators.
- [x] Registration UI exposes these locators to the reviewer.
- [x] Content validator enforces user-provided attachment status/reference-only/non-bundled rules.
- [x] Browser smoke verifies reference evidence appears in the registration workspace.

## Spatial registration
- [x] License/reuse gate and BodyParts3D spatial-registration gate remain separate.
- [x] Pilot: ST-36, LI-4, LU-5, LU-9, ST-41.
- [x] Surface capture records BodyParts3D structure, triangle, barycentric and XYZ.
- [x] New captures forced to UNVERIFIED.
- [x] Review artifact validator present.
- [x] Meridian path builder rejects unreviewed anchors.
- [!] Committed pilot anchors: 0.
- [!] Runtime published spatial points: 0.
- [!] Published 3D meridian paths: 0.
- [ ] Capture 10 bilateral pilot anchors on BodyParts3D.
- [ ] Faculty review all pilot anchors.
- [ ] Validate review artifact.
- [ ] Promote only reviewed anchors.
- [ ] Scale meridian-by-meridian after pilot acceptance.

## Acceptance / handoff
- [x] Automated CI for current code is green.
- [ ] Current-code live preview/deploy provenance.
- [ ] Physical tablet/laptop acceptance.
- [ ] Fresh kinhlac.online side-by-side parity measurement.
- [ ] Do not state >=95% complete/stable until the defined acceptance set is actually measured at >=95%.

## Immediate execution order
1. Do not repeat source/PDF integration already verified at `4e7e5edb…`.
2. Continue the 10-anchor bilateral pilot using human reference locators plus direct BodyParts3D surface capture.
3. Never infer z or convert 2D diagrams into runtime 3D coordinates.
4. Keep anchors UNVERIFIED until genuine faculty review exists.
5. Validate review artifact before runtime promotion.
6. Generate paths only after reviewed anchors exist.
7. Re-run complete CI after every spatial/content promotion.
8. Refresh verified deployment provenance and complete physical-device/reference-parity QA before handoff.

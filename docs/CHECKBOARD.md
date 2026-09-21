# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Verified code commit: `5046b736efc98ddce81347718edcdf5e8920a4a5`
Rule: evidence first. Do not mark DONE/PASS without a commit, CI run, test result, deploy record, or source/license evidence.

## Status legend
- [x] PASS/DONE — implemented and verified.
- [ ] PENDING — approved work not yet complete.
- [!] BLOCKED — cannot be promoted without external evidence/review/configuration.
- [~] PARTIAL — implemented but acceptance evidence remains incomplete.

## Repository / delivery
- [x] Isolated feature branch exists; main remains untouched.
- [x] PR #1 exists and remains draft/open.
- [x] Latest code verified by push CI `35572643746` (#66) and PR CI `35572647309` (#67), both SUCCESS.
- [x] Content validation, TypeScript, anatomy/interactions validators, 19 unit tests, production build, static-host build and browser smoke are green at the verified code commit.
- [!] GitHub Pages site itself is not enabled/configured at repository level. Failure `35571169188` is isolated to `Configure GitHub Pages`; preceding build/tests passed.
- [x] Pages deploy-on-push parked; workflow remains manually dispatchable after repository Pages is enabled.
- [~] Render preview remains LIVE but is behind the latest registration code; do not use the current Render deploy as proof of commit 5046.
- [ ] Update a live preview from a verified post-registration commit and record exact deployment provenance.

## 3D anatomy / QA
- [x] BodyParts3D 4.0 viewer retained.
- [x] 15 anatomy display systems.
- [x] 2,234 indexed meshes / 3,432 complete concept mappings / 2,288,268 triangles validated.
- [x] Desktop smoke: rotate, wheel zoom, front/back/side presets, reset and layer presets.
- [x] Tablet 1024x768 emulation: touch orbit.
- [x] Browser smoke console errors: none.
- [ ] Dedicated browser pan assertion remains pending.
- [ ] Dedicated pinch-zoom assertion and physical-device tablet/laptop QA remain pending.

## Acupoint / meridian catalogue
- [x] 361 standard acupoint identifiers across 14 meridians.
- [x] Ordered point sequence present for all 14 meridians.
- [x] ST36/ST-36 code search.
- [x] Local point-to-meridian study assistant.
- [x] Google links are outbound reference-only; no Google result data bundled.
- [~] Full Vietnamese/English names and localization prose remain incomplete where reusable/reviewed provenance is missing.

## Spatial registration / 3D acupoints
- [x] License gate and BodyParts3D spatial-registration gate are separate.
- [x] Pilot staged: ST-36, LI-4, LU-5, LU-9, ST-41.
- [x] Registration workspace captures canonical BodyParts3D surface evidence.
- [x] New captures are forced to UNVERIFIED.
- [x] Registration mode now locks assembled geometry and ensures the integumentary surface stays visible.
- [x] Review artifact validator added; CLI rejects unreviewed/out-of-pilot/malformed reviewer evidence.
- [x] Review gate unit tests added; total unit suite 19/19 PASS.
- [x] Meridian path builder rejects unreviewed anchors.
- [!] Committed pilot anchors: 0.
- [!] Runtime published spatial points: 0.
- [!] Published 3D meridian paths: 0.
- [ ] Capture 10 bilateral pilot anchors directly on BodyParts3D.
- [ ] Obtain and record faculty review evidence.
- [ ] Validate reviewed artifact.
- [ ] Promote only reviewed anchors to runtime.
- [ ] Scale registration meridian-by-meridian only after pilot acceptance.

## Data/source/license
- [x] BodyParts3D 4.0 audited for direct use.
- [x] AcuAtlas data license audited; 2D mapped coordinates remain spatially blocked.
- [x] AcuSim/Dryad audited; synthetic coordinate frame remains spatially blocked.
- [x] WHO 2008 kept reference-only.
- [x] kinhlac.online kept clean-room reference-only.
- [x] Z-Anatomy recorded reference-only pending exact-asset/share-alike review.
- [x] TARA/FMA remain quarantined until exact artifact license is known.
- [x] No unlicensed 3D acupoint coordinate set has been promoted.

## PWA / hosting / acceptance
- [x] PWA manifest/service worker.
- [x] Offline app-shell reload verified.
- [x] Static asset size gate verified.
- [!] GitHub Pages repository configuration still requires enablement outside application code.
- [~] Current Render preview is not the latest code checkpoint.
- [ ] Physical tablet/laptop acceptance.
- [ ] Fresh side-by-side kinhlac.online parity measurement.
- [ ] Do not state >=95% complete/stable until the defined acceptance set is actually measured at >=95%.

## Immediate execution order
1. Preserve verified code baseline `5046b736…`; do not repeat completed work.
2. Capture the 5-point bilateral pilot only through the BodyParts3D registration workspace.
3. Keep all captures UNVERIFIED until actual faculty review exists.
4. Validate reviewed artifacts with `npm run registration:validate-review -- <file.json>`.
5. Add runtime promotion only after reviewed evidence passes validation; never infer coordinates.
6. Generate 3D paths only from reviewed anchors.
7. Re-run the complete automated gate after every runtime/content change.
8. Refresh deployment provenance and perform physical-device/reference-parity QA before handoff.

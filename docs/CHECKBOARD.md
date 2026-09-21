# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Rule: evidence first. Do not mark DONE/PASS without a commit, CI run, test result, deploy record, or source/license evidence.

## Status legend
- [x] PASS/DONE — implemented and verified.
- [ ] PENDING — approved work not yet complete.
- [!] BLOCKED — cannot be promoted without external evidence/review/configuration.
- [~] PARTIAL — implemented but acceptance evidence remains incomplete.

## Repository / delivery
- [x] Isolated feature branch exists; main remains untouched.
- [x] PR #1 exists and is draft.
- [x] CI workflow validates content, TypeScript, atlas integrity, interactions, unit tests, build, static assets and browser smoke.
- [x] TypeScript `import.meta.env.BASE_URL` regression fixed at commit `b9f1bd89276584a0cb15ddfea6647d95849ca9c0`.
- [~] GitHub Pages build code passes, but Pages site deployment is BLOCKED because Pages is not enabled/configured at repository level.
- [x] Render feature preview exists as the currently documented live preview.
- [ ] Update the live preview to a post-registration verified commit only after CI is green and deployment provenance is confirmed.

## 3D anatomy
- [x] BodyParts3D 4.0 anatomy viewer retained.
- [x] Orbit/rotate, zoom, select/search, isolate/explode implemented.
- [x] 15 anatomy display systems.
- [x] Anatomy integrity validation covers 2,234 indexed meshes and model assets.
- [x] Desktop browser smoke covers model load, rotate and wheel zoom.
- [x] Tablet emulation browser smoke covers touch orbit at 1024×768.
- [ ] Physical tablet/laptop acceptance remains required before claiming physical-device QA.

## Acupoint / meridian catalogue
- [x] 361 standard acupoint identifiers published across 14 meridians.
- [x] Ordered sequences present for all 14 meridians.
- [x] Search supports compact/hyphenated codes such as ST36/ST-36.
- [x] Local study assistant answers point-to-meridian queries from local catalogue.
- [x] Google outbound reference links are link-only; no Google result data is bundled.
- [~] Full Vietnamese/English point-name and localization text is not yet complete because unverified prose is intentionally excluded.

## Spatial registration / 3D acupoints
- [x] License gate and spatial-registration gate are separated.
- [x] Five-point pilot staged: ST-36, LI-4, LU-5, LU-9, ST-41.
- [x] Faculty registration workspace implemented.
- [x] Surface capture records BodyParts3D structure, triangle index, barycentric coordinates and XYZ.
- [x] New captures are forced to UNVERIFIED.
- [x] Browser smoke exercises a real BodyParts3D surface-anchor draft capture.
- [x] Meridian path builder rejects unreviewed anchors.
- [!] Runtime published spatial anchors remain 0 until faculty review.
- [!] 3D meridian paths remain 0 until reviewed anchors exist.
- [!] Point-click → 3D focus/highlight, 3D quiz and simulation remain gated until spatial data is reviewed.
- [ ] Capture both sides for pilot bilateral points using licensed/reference location evidence.
- [ ] Faculty review pilot anchors and record reviewer evidence.
- [ ] Promote only reviewed anchors to runtime.
- [ ] Scale registration meridian-by-meridian only after pilot acceptance.

## Data/source/license
- [x] BodyParts3D 4.0: direct-use anatomy source under audited license.
- [x] AcuAtlas: 361-point dataset licensed for direct data use; its mapped coordinates remain registration-blocked.
- [x] AcuSim/Dryad: open dataset with 2D/3D annotations; its synthetic coordinate frame remains registration-blocked.
- [x] WHO 2008: reference-only; copyrighted location prose is not redistributed.
- [x] kinhlac.online: UX/reference-only; no private API/model/database/source copied.
- [x] TARA/FMA exact artifacts remain quarantined until exact license evidence is verified.
- [x] Z-Anatomy audited as an open 3D anatomy reference (CC BY-SA 4.0); no asset will be bundled until share-alike/asset-level compatibility is explicitly handled.
- [ ] Audit any newly proposed repository/dataset before import: exact artifact, exact license, attribution, coordinate system, provenance, and compatibility.

## PWA / hosting / reliability
- [x] PWA manifest/service worker exists.
- [x] Offline shell reload is covered by browser smoke.
- [x] Static asset gate exists.
- [~] GitHub Pages static build passes but repository Pages configuration is not enabled.
- [ ] Re-run push + PR CI after every code/content change.
- [ ] Do not claim >95% application acceptance until required journeys have measured evidence; current reference parity remains NOT MEASURED.

## Immediate execution order
1. Finish CI for commit `b9f1bd8…`; if browser smoke fails, fix only the failing regression.
2. Treat GitHub Pages repository enablement as environment configuration, not an application-code defect.
3. Refresh `PROJECT_STATE.md` with the newest verified CI commit/run IDs and exact blockers.
4. Preserve 0 runtime spatial anchors until pilot anchors receive faculty review.
5. Continue registration pilot; do not infer missing coordinates or z values from 2D maps.
6. After pilot review, promote only reviewed anchors and generate paths from reviewed anchors.
7. Expand search/names/localization only from licensed or independently reviewed content.
8. Re-run browser/tablet smoke and deployment checks; create a new checkpoint before any handoff.

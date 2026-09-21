# PROJECT_STATE

CURRENT PHASE: Phase 17 checkpoint — browser smoke recovered; P0 NOT COMPLETE
LAST VERIFIED COMMIT: 302352db8cdd1c32e4617971aa10ee2bf98330d8
BRANCH: feature-hiu-yhct-3d-atlas

WHAT WORKS:
- Existing BodyParts3D 4.0 anatomy viewer with orbit/zoom/select/search/isolate/explode.
- 15 anatomy display systems.
- Dedicated isolated feature branch and open PR #1; main is not merged.
- License-gated content pipeline and schema validation.
- 14 meridian nomenclature shells: 12 main meridians + Ren/CV + Du/GV.
- PWA manifest/service worker and offline shell.
- Local meridian search and Local Study Assistant without cloud AI dependency.
- CI production build and static-host asset checks.
- Browser smoke on Chrome headless validates desktop rotate/wheel zoom, tablet 1024x768 touch orbit, model loading, local meridian search, Local Study Assistant, and offline shell reload.

WHAT FAILED:
- No current CI failure at the verified commit.
- P0 acupuncture functionality remains incomplete because no acupoint spatial dataset has passed both license and registration gates.
- No licensed/validated 3D meridian paths are imported.
- No feature deployment URL has been verified for this branch.
- Physical tablet/laptop testing and side-by-side kinhlac.online reference parity measurement have not been executed.

TESTS RUN:
- Push CI run 35558940665 on commit 302352db8cdd1c32e4617971aa10ee2bf98330d8.
- PR CI run 35558943361 on the same commit.
- npm run content:validate
- npm run content:build
- npm run check
- node scripts/validate-atlas.mjs
- node --experimental-strip-types scripts/validate-interactions.mjs
- npm test
- npm run build
- npm run verify:pages
- node scripts/browser-smoke.mjs

TEST RESULTS:
- Push CI: PASS.
- PR CI: PASS.
- Content validation: PASS.
- Unit tests: 9/9 PASS.
- Anatomy validation: 2,234 indexed meshes; 3,432 complete concept mappings; 2,288,268 triangles; binary buffers verified.
- Production build: PASS.
- Static artifact check: 43 files; largest asset models/body-1.bin = 4,526,484 bytes; configured per-asset gate 26,214,400 bytes.
- Browser smoke: PASS; Chrome /usr/bin/google-chrome.
- Browser desktop: 1440x900; rotate screenshot changed=true; zoom screenshot changed=true.
- Browser tablet emulation: 1024x768; touch enabled=true; touch screenshot changed=true.
- Model responses observed: 27 successful model responses.
- Local meridian search: PASS.
- Local Study Assistant: PASS.
- PWA offline shell reload: PASS.
- Browser smoke console errors: none recorded.

DEPLOYMENT URL:
- Existing main demo only: https://human-atlas-seven.vercel.app
- Feature branch preview: NOT VERIFIED / NOT DEPLOYED in this checkpoint. Do not treat the main demo as this branch preview.

DATASETS IMPORTED:
- BodyParts3D 4.0 existing repository anatomy assets.
- HIU meridian nomenclature: 14 records, 0 point IDs, 0 3D paths.
- Verified runtime acupoints: 0.

LICENSE STATUS:
- BodyParts3D 4.0: DIRECT_USE / CC-BY-4.0 per audited repository documentation.
- HIU standard nomenclature compilation: DIRECT_USE / CC0-1.0.
- WHO 2008 acupuncture point publication: REFERENCE_ONLY.
- TARA 1.7.0 exact reusable artifact: QUARANTINE pending exact-artifact license.
- FMA exact artifact/version: QUARANTINE pending audit.
- kinhlac.online: REFERENCE_ONLY.
- Runtime gate: only DIRECT_USE sources may enter bundles.

KNOWN RISKS:
- P0 acupoint markers, point search/focus, meridian paths and Simulation Lab cannot be completed truthfully without legally reusable, spatially registered data.
- Physical tablet/laptop testing is still required; CI tablet testing is emulation, not a physical-device claim.
- Reference parity weighted score remains NOT MEASURED until a fresh side-by-side run against the public reference is performed.
- Existing anatomy educational descriptions predate this branch and are not faculty-reviewed under the new governance.
- Browser smoke screenshot capture is slow under GitHub-hosted SwiftShader; bounded per-command timeouts and screenshot retry are now used to avoid both false 10-second failures and unbounded hangs.

NEXT EXACT ACTION:
Acquire and audit a legally reusable acupoint spatial dataset; only if its exact artifact license is DIRECT_USE, register its coordinates/anchors to the BodyParts3D canonical surface, validate provenance and faculty review status, then implement point markers, point search -> camera focus and surface-following meridian paths. Keep main unmerged and do not publish unverified coordinates.

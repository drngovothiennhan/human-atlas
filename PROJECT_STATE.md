# PROJECT_STATE

CURRENT PHASE: Phase 17 checkpoint — P0 NOT COMPLETE
LAST VERIFIED COMMIT: 7a383d3ee2759e3ddf157c704fb8814fd0c50bcb (base before this checkpoint)
BRANCH: feature-hiu-yhct-3d-atlas

WHAT WORKS:
- Existing BodyParts3D 4.0 anatomy viewer: orbit/zoom/select/search/isolate/explode.
- 15 anatomy display systems.
- Dedicated isolated branch.
- License-gated content pipeline, 14 meridian nomenclature shells, PWA shell and CI added in this checkpoint.

WHAT FAILED:
- Local container cannot resolve github.com, so local clone/build could not run.
- No acupoint spatial dataset passed both license and registration gates.
- No licensed/validated 3D meridian path imported.

TESTS RUN:
- Fresh branch CI: PENDING after checkpoint push.
TEST RESULTS:
- PENDING.
DEPLOYMENT URL:
- Existing main demo only: https://human-atlas-seven.vercel.app
- Feature preview: PENDING. Do not treat main demo as this branch preview.

DATASETS IMPORTED:
- BodyParts3D 4.0 (existing repository assets; CC BY 4.0).
- HIU meridian nomenclature: 14 records, 0 point IDs, 0 3D paths.
- Verified runtime acupoints: 0.

LICENSE STATUS:
- BodyParts3D: DIRECT_USE / CC BY 4.0.
- WHO: REFERENCE_ONLY.
- TARA curated data: QUARANTINE pending exact-artifact license.
- kinhlac.online: REFERENCE_ONLY.

KNOWN RISKS:
- P0 acupuncture features remain blocked by licensed validated coordinates/paths.
- Fresh browser E2E, real tablet multitouch, offline reload and parity side-by-side are not yet executed.
- Existing anatomy educational descriptions predate this branch and are not faculty-reviewed under the new governance.

NEXT EXACT ACTION:
Observe branch CI, fix any failing validation/build, then register a legally reusable and faculty-validated acupoint spatial dataset against BodyParts3D surface anchors before implementing markers/paths/search-focus.

# PROJECT_STATE

CURRENT PHASE: Phase 17 checkpoint — spatial source license gates audited; BodyParts3D registration gate BLOCKED; P0 NOT COMPLETE
LAST VERIFIED COMMIT: 1e6872d0fe1ab4f928301b8e9b8e574beaf5b490
BRANCH: feature-hiu-yhct-3d-atlas

WHAT WORKS:
- Existing BodyParts3D 4.0 anatomy viewer with orbit/zoom/select/search/isolate/explode.
- 15 anatomy display systems.
- Dedicated isolated feature branch and open PR #1; main is not merged.
- License-gated content pipeline and schema validation.
- Spatial publishing gate now separates source-license permission from BodyParts3D registration eligibility.
- Runtime point validation rejects unknown/non-DIRECT_USE spatial sources, non-REGISTERED spatial sources, and non-canonical coordinates.
- Two audited spatial candidates are tracked outside runtime:
  - AcuAtlas 361-point reference dataset: license PASS / registration BLOCKED.
  - AcuSim Dryad 174-point cervicocranial dataset: license PASS / registration BLOCKED.
- 14 meridian nomenclature shells: 12 main meridians + Ren/CV + Du/GV.
- PWA manifest/service worker and offline shell.
- Local meridian search and Local Study Assistant without cloud AI dependency.
- CI production build and static-host asset checks.
- Browser smoke validates desktop rotate/wheel zoom, tablet 1024x768 touch orbit, model loading, local meridian search, Local Study Assistant, and offline shell reload.

WHAT FAILED:
- No CI failure at the verified audit commit.
- AcuAtlas cannot yet supply runtime 3D positions: the audited reusable JSON exposes normalized body-plate view/x/y, not verified BodyParts3D xyz/surface anchors.
- AcuSim cannot yet supply runtime positions: Dryad documents 2D/3D keypoints in its synthetic-model/rendering context, but no transform/surface-anchor mapping to BodyParts3D has been validated.
- P0 acupuncture functionality remains incomplete because no acupoint spatial source has passed both license and BodyParts3D registration gates.
- No licensed/validated 3D meridian paths are imported.
- No feature deployment URL has been verified for this branch.
- Physical tablet/laptop testing and side-by-side kinhlac.online reference parity measurement have not been executed.

TESTS RUN:
- Audit push CI run 35560734425 on commit 1e6872d0fe1ab4f928301b8e9b8e574beaf5b490.
- Audit PR CI run 35560737149 on the same commit.
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
- Content counts: 11 sources; 2 spatial candidates; 14 meridians; 0 runtime acupoints.
- Unit tests: 11/11 PASS; 0 failed.
- Spatial candidate guard: PASS; blocked candidates remain runtime-ineligible and runtime acupoints remain 0.
- Anatomy validation: 2,234 indexed meshes; 3,432 complete concept mappings; 2,288,268 triangles; binary buffers verified.
- Production build: PASS.
- Static artifact check: 43 files; largest asset models/body-1.bin = 4,526,484 bytes; configured per-asset gate 26,214,400 bytes.
- Browser smoke: PASS.
- Browser desktop: 1440x900; rotate screenshot changed=true; zoom screenshot changed=true.
- Browser tablet emulation: 1024x768; touch enabled=true; touch screenshot changed=true.
- Model responses observed: 28 successful model responses.
- Local meridian search: PASS.
- Local Study Assistant: PASS.
- PWA offline shell reload: PASS.
- Browser smoke console errors: none recorded.

DEPLOYMENT URL:
- Existing main demo only: https://human-atlas-seven.vercel.app
- Feature branch preview: NOT VERIFIED / NOT DEPLOYED in this checkpoint. Do not treat the main demo as this branch preview.

DATASETS IMPORTED:
- Runtime anatomy: BodyParts3D 4.0 existing repository assets.
- Runtime meridian nomenclature: 14 records, 0 point IDs, 0 3D paths.
- Runtime verified acupoints: 0.
- Spatial candidates audited but NOT imported to runtime:
  - AcuAtlas reference dataset: 361 records.
  - AcuSim Dryad: 174 cervicocranial acupoints.

LICENSE STATUS:
- BodyParts3D 4.0: DIRECT_USE / CC-BY-4.0.
- HIU standard nomenclature compilation: DIRECT_USE / CC0-1.0.
- AcuAtlas 361 reference dataset: DIRECT_USE data / CC-BY-4.0; spatial registration BLOCKED.
- AcuSim Dryad 2025 dataset: DIRECT_USE data / CC0-1.0; spatial registration BLOCKED.
- WHO 2008 acupuncture point publication: REFERENCE_ONLY.
- TARA 1.7.0 exact reusable artifact: QUARANTINE pending exact-artifact license.
- FMA exact artifact/version: QUARANTINE pending audit.
- kinhlac.online: REFERENCE_ONLY.
- Runtime spatial rule: DIRECT_USE license is necessary but insufficient; source must also be REGISTERED to BodyParts3D canonical coordinates/surface anchors.

KNOWN RISKS:
- P0 acupoint markers, point search/focus, meridian paths and Simulation Lab cannot be completed truthfully until a spatial source or registration workflow produces validated BodyParts3D anchors.
- AcuAtlas includes clinical/depth/indication fields; this checkpoint deliberately does not import those fields.
- AcuSim is cervicocranial rather than full-body and uses synthetic anatomical models.
- Physical tablet/laptop testing is still required; CI tablet testing is emulation, not a physical-device claim.
- Reference parity weighted score remains NOT MEASURED until a fresh side-by-side run against the public reference is performed.
- Existing anatomy educational descriptions predate this branch and are not faculty-reviewed under the new governance.

NEXT EXACT ACTION:
Audit whether AcuSim's exact Dryad 3D annotation/model frame can be deterministically transformed into BodyParts3D using only reusable assets and documented geometry. In parallel search for an exact-artifact full-body open 3D acupoint dataset. Promote no positions unless the transform and BodyParts3D surface anchors validate. If no transferable open 3D frame exists, implement a faculty-reviewed landmark registration workflow that authors anchors directly on BodyParts3D from validated point-location references; do not convert AcuAtlas 2D map coordinates into invented z values.

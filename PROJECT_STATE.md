# PROJECT_STATE

CURRENT PHASE: Phase 17 checkpoint — 361-point licensed catalogue + ordered meridian sequences published; 3D registration still gated; P0 NOT COMPLETE
LAST VERIFIED CODE COMMIT: f54aab5cd0759b97ef5fff844bcbede3fa5fc4d2
BRANCH: feature-hiu-yhct-3d-atlas

WHAT WORKS:
- Existing BodyParts3D 4.0 anatomy viewer with orbit/zoom/select/search/isolate/explode.
- 15 anatomy display systems.
- Dedicated isolated feature branch and open PR #1; main is not merged.
- License-gated content pipeline and schema validation.
- Complete standard catalogue of 361 acupoint identifiers distributed across 14 meridians.
- All 14 meridians now contain verified ordered pointIds sequences:
  - LU 11, LI 20, ST 45, SP 21, HT 9, SI 19, BL 67, KI 27, PC 9, TE 23, GB 44, LR 14, GV 28, CV 24.
- Runtime search accepts compact/hyphenated codes such as ST36 and ST-36.
- Local Study Assistant can answer point-to-meridian and meridian-to-point-list queries from the local catalogue.
- Meridian UI shows point sequence as a clearly labelled study sequence, not as a fake 3D path.
- Every catalogue point remains spatially UNREGISTERED unless it passes the BodyParts3D registration gate.
- Outbound “Tham khảo Google” links are available for reference-only lookup; Google result data is not copied or bundled.
- AcuAtlas source links/attribution are visible for the catalogue.
- PWA manifest/service worker and offline shell; cache version bumped for catalogue 0.3.0.
- CI production build and static-host asset checks.
- Browser smoke validates desktop rotate/wheel zoom, tablet 1024x768 touch orbit, model loading, 361-point catalogue count, ST36 search, Local Study Assistant, and offline shell reload.

WHAT FAILED / NOT YET COMPLETE:
- No current CI failure at the verified code commit.
- Runtime spatially registered acupoints remain 0.
- No licensed/validated BodyParts3D 3D meridian paths are published.
- AcuAtlas mapped coordinates remain excluded from 3D because its reusable mapping is not registered to the BodyParts3D canonical surface.
- AcuSim synthetic-model coordinates remain excluded pending a validated transform to BodyParts3D.
- Search by full point name is incomplete because this checkpoint intentionally imports point identifiers/order only, not unverified name/location prose.
- Point click -> 3D marker/focus cannot be enabled until anchor registration passes.
- Quiz 3D and Simulation Lab remain disabled while spatialPointCount = 0.
- Physical tablet/laptop testing and side-by-side kinhlac.online reference parity measurement have not been executed.

TESTS RUN:
- Push CI run 35563018730 on commit f54aab5cd0759b97ef5fff844bcbede3fa5fc4d2.
- PR CI run 35563113375 on the same commit.
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
- Content counts: 12 sources; 2 spatial candidates; 14 meridians; 361 catalogue acupoints.
- Unit tests: 13/13 PASS; 0 failed.
- Standard sequence gate: PASS for all 14 meridians and exactly 361 codes.
- Spatial guard: PASS; all 361 catalogue records have no published position3d.
- Anatomy validation: 2,234 indexed meshes; 3,432 complete concept mappings; 2,288,268 triangles; binary buffers verified.
- Production build: PASS.
- Static artifact check: 43 files; largest asset models/body-1.bin = 4,526,484 bytes; configured per-asset gate 26,214,400 bytes.
- Browser smoke: PASS.
- Browser desktop: 1440x900; rotate screenshot changed=true; zoom screenshot changed=true.
- Browser tablet emulation: 1024x768; touch enabled=true; touch screenshot changed=true.
- Model responses observed: 32 successful model responses.
- 361-point catalogue count visible: PASS.
- ST36 catalogue search: PASS.
- Local Study Assistant ST36 -> Kinh Vị: PASS.
- PWA offline shell reload: PASS.
- Browser smoke console errors: none recorded.

DEPLOYMENT URL:
- Feature preview: https://hiu-yhct-3d-atlas-preview.onrender.com
- Render service: srv-daob9fp42hec7395v8ug
- Verified catalogue deploy: dep-daobnfugekts73bl77eg
- Verified catalogue deploy source commit: f54aab5cd0759b97ef5fff844bcbede3fa5fc4d2
- Verified catalogue deploy status: LIVE
- Existing main demo: https://human-atlas-seven.vercel.app (not used as branch-preview evidence).

DATASETS IMPORTED:
- Runtime anatomy: BodyParts3D 4.0 existing repository assets.
- Runtime acupoint catalogue: 361 standard identifiers with meridian membership and sequence only.
- Runtime meridian catalogue: 14 records with complete ordered pointIds, 0 published 3D paths.
- Runtime spatially registered acupoints: 0.
- AcuAtlas CC BY 4.0: used for catalogue cross-check/source attribution; mapped coordinates and clinical prose excluded.
- AcuSim Dryad: audited spatial candidate only; no coordinates/assets imported.
- Google Search: link-only reference; no search result data imported.

LICENSE STATUS:
- BodyParts3D 4.0: DIRECT_USE / CC-BY-4.0.
- HIU standard nomenclature compilation: DIRECT_USE / CC0-1.0.
- AcuAtlas 361 reference dataset: DIRECT_USE data / CC-BY-4.0; catalogue identifiers/order now used; spatial registration BLOCKED.
- AcuSim Dryad 2025 dataset: DIRECT_USE data / CC0-1.0; spatial registration BLOCKED.
- Google Search external reference: REFERENCE_ONLY / LINK_ONLY.
- WHO 2008 acupuncture publication: REFERENCE_ONLY.
- TARA 1.7.0 exact reusable artifact: QUARANTINE pending exact-artifact license.
- FMA exact artifact/version: QUARANTINE pending audit.
- kinhlac.online: REFERENCE_ONLY.
- Runtime spatial rule: DIRECT_USE license is necessary but insufficient; source must also be REGISTERED to BodyParts3D canonical coordinates/surface anchors.

KNOWN RISKS:
- 361 catalogue entries are identifiers/order records, not 361 verified BodyParts3D marker positions.
- Meridian point sequence is not equivalent to a surface-following 3D meridian curve.
- Full point-name/localization fields still require licensed exact-artifact import or independent reviewed compilation.
- Physical tablet/laptop testing is still required; CI tablet testing is emulation, not a physical-device claim.
- Reference parity weighted score remains NOT MEASURED until a fresh side-by-side run against the public reference is performed.

NEXT EXACT ACTION:
Implement the BodyParts3D landmark-registration workflow and validate a small faculty-reviewable pilot set before publishing any marker coordinates. Priority pilot for workflow validation: ST-36, LI-4, LU-5, LU-9 and ST-41, using licensed/reference location sources only; author anchors directly on the BodyParts3D surface, record structure/triangle/side/source/reviewer evidence, and keep them UNVERIFIED until faculty review. After the pilot passes, scale registration by meridian and generate surface-following paths only from registered anchors. Do not infer z from AcuAtlas 2D coordinates.

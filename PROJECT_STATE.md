# PROJECT_STATE

CURRENT PHASE: Clean-room 3D meridian/acupoint explorer shell is implemented, CI-verified and live; published spatial data remains faculty-review gated.
BRANCH: `feature-hiu-yhct-3d-atlas`
PR: #1 draft/open; `main` untouched.
VERIFIED RUNTIME CODE: `b06b4acacf3f02037ffbdea5da75ab957a79db15`

## VERIFIED LIVE FUNCTIONALITY
- BodyParts3D 4.0 viewer with 15 anatomy display systems.
- 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles.
- 361-point catalogue across 14 meridians with ordered point sequences.
- New Kinh lạc 3D panel: meridian selection, LEFT/RIGHT/BOTH filter, point search/detail, overlay show/hide.
- Local UNVERIFIED registration drafts can render as 3D markers on the canonical BodyParts3D surface.
- Anchored point can request camera focus.
- Reviewed/published path renderer exists but refuses to render unreviewed/generated paths.
- Anatomy remains assembled while meridian overlay is visible.
- Registration pilot remains ST-36, LI-4, LU-5, LU-9, ST-41 bilaterally.
- User-provided PDFs remain REFERENCE_ONLY; no scan/diagram/long prose/coordinate table is bundled.

## VERIFIED TEST / DEPLOY EVIDENCE
- Push CI #98 `35580796392`: SUCCESS.
- PR CI #99 `35580801767`: SUCCESS.
- Browser smoke artifact: `10630243332`.
- Browser smoke PASS: desktop rotate/zoom/pan; camera presets/reset; layers; tablet touch orbit/pinch; local catalogue/assistant; Kinh lạc 3D explorer; UNVERIFIED local draft 3D overlay; explicit zero fabricated path; registration progress/next missing; PWA offline reload; consoleErrors=[].
- Static verification: 45 files; largest asset `models/body-1.bin` = 4,526,484 bytes under 26,214,400-byte gate.
- Render deploy `dep-daof99oae00c73c9sv10`: LIVE from `b06b4acacf3f02037ffbdea5da75ab957a79db15`.
- Preview: https://hiu-yhct-3d-atlas-preview.onrender.com

## SOURCE / LICENSE DECISIONS
- kinhlac.online: clean-room public UX reference only.
- SMPLify-M (`wwwwwangg/smplify-m-new`): REFERENCE_ONLY. Its repository follows the restrictive SMPL-X/SMPLify-X non-commercial research/education license with no redistribution; acupoint indices are specific to a SMPL-X vertex ordering.
- AcuAtlas / AcuSim: license gate may pass for their exact datasets, but BodyParts3D registration/transform gate is still not satisfied for direct runtime coordinates.
- No Google result content is imported; outbound links only.
- Never infer z from a 2D diagram.

## KNOWN BLOCKERS / NOT COMPLETE
- Committed pilot anchors = 0.
- Published runtime 3D acupoints = 0.
- Published 3D meridian paths = 0.
- 10 pilot anchors still require human surface capture and genuine faculty review.
- Physical Android/tablet + Windows/laptop QA is pending.
- Fresh side-by-side kinhlac.online parity is not measured.
- GitHub Pages repository setting remains disabled.
- Do not claim >=95% completion/stability yet.

## NEXT EXACT ACTION
1. Preserve runtime baseline `b06b4acacf3f02037ffbdea5da75ab957a79db15`; do not repeat completed clean-room viewer work.
2. Capture LEFT + RIGHT for ST-36, LI-4, LU-5, LU-9, ST-41 directly on BodyParts3D.
3. Keep captures UNVERIFIED.
4. Obtain genuine faculty review and validate review artifact.
5. Promote only reviewed anchors; generate paths only from reviewed anchors.
6. Run complete CI after promotion.
7. Complete physical-device and fresh reference-parity QA before >=95% handoff.

## STAGE 1 LICENSED SOURCE IMPORT — VERIFIED
- Source: `FuriaRozkwit/acupuncture-3d@1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.
- Checkpoint SHA: `30c178303d0f58f6766ea626db16b3465e89d9dc`.
- CI: push #109 `35583964566` SUCCESS; PR #110 `35583969307` SUCCESS.
- Imported: reduced 361 authored anchors, 14-channel topology, MIT proportional rig, CC BY-SA structural metadata + notices.
- Excluded: clinical prose/categories, needling/OCR/protected `point_meta.json` material.
- Source topology fact: 360 unique path codes; BL-39 omitted upstream. Do not auto-invent a BL-39 route.
- Current live Render preview remains the earlier verified runtime `b06b4ac…`; Stage 1 did not trigger another Render deploy because it is source/validation work only.
- Next: Stage 2 licensed schematic resolver + BodyParts3D surface projection, explicitly UNVERIFIED/SCHEMATIC until review.

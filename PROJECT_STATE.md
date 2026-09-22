# CURRENT CHECKPOINT — browser smoke repaired + CI verified (2026-09-22)

- Branch: `feature-hiu-yhct-3d-atlas`; PR #1 remains draft/open; `main` is untouched.
- CI-verified code candidate: `714f36f01c99152d8aad3644a801abfbe1ccb462` (`test: align local draft smoke assertion with Vietnamese UI`).
- The prior browser-smoke failure was an outdated UI assertion: the product now says `nháp trên máy`, while the smoke test still expected `nháp local`. Only that assertion was aligned; no spatial data, clinical content, or runtime coordinate gate was weakened.
- Push CI #167, run `35669458877`: attempt 1 passed content validation/build, TypeScript, anatomy/interactions validators, 21 unit tests, production/static builds and full browser smoke; only GitHub artifact finalization returned transient HTTP 403. Failed job was retried without code changes; attempt 2 completed SUCCESS.
- PR CI #168, run `35669462184`: SUCCESS.
- Browser evidence: load-failure recovery PASS; moving meridian flow PASS; effect controls PASS; all 14 schematic meridians PASS; local ST-36 capture remains UNVERIFIED; no fabricated reviewed path; desktop/tablet interactions and offline reload PASS; consoleErrors=[].
- Browser artifacts: push `10671101163` (sha256 `646e6cdfa234012a5f6dc7188f5858728bef2eb4c564a3851c3c0d1abc560b6c`); PR `10670990113` (sha256 `318c707ee3785c0206f5da1ff0907712450be11996238163805579347d5434ac`).
- The motion/readability/Vietnamese-primary patch is therefore CI verified. It is not yet claimed live on Render until the existing preview service is observed serving this commit/assets.
- Next approved action: inspect automatic deployment of the existing `hiu-yhct-3d-atlas-preview` service; do not create another service or merge main. After live provenance is confirmed, run direct Preview checks for visible motion, thinner points/clearer paths, Vietnamese-primary labels, point focus, and load retry.
- Faculty-reviewed BodyParts3D coordinates, published clinical spatial paths, physical-device QA, and fresh reference parity remain separate gates; do not fabricate or claim them complete.

---

# CURRENT CHECKPOINT — motion, readability and Vietnamese UI (2026-09-21)

This section supersedes the historical UI checkpoint below.

- Base: `32f89be68817bad9e64ade04a6ad3505e2804af6`, branch `feature-hiu-yhct-3d-atlas`; retain existing Preview, do not create services or merge main.
- Proven bug: scene renderer ignored `effects.motion`, `effects.meridians`, and `effects.acupoints`. Renderer now handles these controls; selecting a meridian enables its line and motion.
- Paths now have an opaque color core with a contrasting edge and five moving lights per path. Markers reduced from 0.0105 to 0.0048 schematic radius and pulse scale from up to 1.50 to 1.14.
- Vietnamese primary interface and anatomy system summaries; English/Chinese are supplemental in the meridian panel. Missing translated source names remain source identifiers, never invented.
- About explicitly describes educational simulated coordinates and illustrative flow, not verified clinical locations. Existing schematic source topology and UNVERIFIED gates preserved.
- Catalogue/model downloads have finite timeout and Vietnamese error feedback. Service worker v0.3.4 refreshes navigation/data online and retains cached offline fallback, never HTML fallback for failed model requests.
- Local validation: TypeScript, 21 unit tests, content/anatomy/interaction checks, production build and static asset limit PASS. Browser regression in progress at commit preparation; inspect current run before claiming browser PASS.
- Browser regression includes motion pause, hide path/points, and re-enable on channel choice, plus existing 14-channel, focus, desktop/tablet and offline checks.
- Existing Render Preview responded with HTTP HTML, but still serves old JS `index-BsVdg5hn.js` before this patch. Do not call this patch live until its assets are observed.
- Render connector currently says `no workspace selected` and explicitly requires the user to confirm a workspace. Listed workspace: `ngô's workspace` (`tea-dah44dh42hec73en41jg`). No Render mutation performed. Check automatic deploy after branch update first.

---

# CURRENT CHECKPOINT — 2026-09-21 P0 recovery

This section supersedes the historical checkpoints below.

- Branch: `feature-hiu-yhct-3d-atlas`; PR #1 stays draft; main unchanged.
- Stage 2 code `ab505d27fb88025a344b2dc3daaa8e6f76316152` passed push CI `35593310089` and PR CI `35593315147`, including 21 tests, both static builds and desktop/tablet browser smoke.
- Stage 2 implements the licensed schematic projection and path renderer. It is not faculty-reviewed spatial data. Preserve UNVERIFIED labels and upstream BL-39 topology omission.
- Live preview inspected on 2026-09-21 still shows the older `0 duyệt · 0 nháp local` launcher. Do not report Stage 2 live until redeployed and checked.
- P0 fix in this commit: bounded 20-second meridian-data loading with visible error/retry; compact cross-meridian code search; repeated camera focus; browser regression covers injected data failure/recovery, all 14 schematic overlays and left/both filtering.
- Local syntax validation passed. Full CI for this P0 commit is pending; do not mark it verified until the run completes.
- Render MCP returned `no workspace selected`. Available workspace: `ngô's workspace` (`tea-dah44dh42hec73en41jg`). Connector explicitly requires user confirmation before using that workspace. No Render mutation performed.
- Next: inspect this commit's CI, repair only evidenced failures, then checkpoint evidence. Request workspace confirmation only after code verification. Update the existing `hiu-yhct-3d-atlas-preview` service only; create no service, paid plan or production.
- Physical-device QA and faculty-reviewed coordinates remain unverified; do not claim 95% or full clinical completion.

---

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

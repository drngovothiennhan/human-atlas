# CURRENT CHECKPOINT — main synchronized, Pages blocker isolated (2026-09-22)

This section supersedes every historical checkpoint below.

- Repository: `drngovothiennhan/human-atlas`.
- Canonical source branch is now `main`; PR #1 is MERGED/CLOSED. The feature branch `feature-hiu-yhct-3d-atlas` remains only as historical/source lineage at `5526e0388cc014ff2cf83f361a46155931dbd38a`.
- Current main before this docs-only checkpoint: `3a7e5bf713670c8806434cc6e899940a6647cb8d` (`ci: enable GitHub Pages from deploy workflow`).
- Runtime application code is already validated: feature push CI #185 and PR CI #186 passed at `bde8cbefac200dd2ce5617d68da1aa1fde9b1781`; later feature CI #187/#188 passed at `5526e0388cc014ff2cf83f361a46155931dbd38a`. The latter changes the Pages workflow, not the 3D runtime behavior.
- GitHub Pages run #18 `35691718235` passed checkout, install, content/source validation, TypeScript, anatomy/interactions validation, all 21 unit tests, `build:pages`, and static asset verification. It failed only at `actions/configure-pages@v5`.
- Exact blocker after testing `enablement: true`: GitHub returned `Resource not accessible by integration` while attempting to create the Pages site. This is a repository-administration permission/configuration blocker, not an application/build failure. Do not keep retrying or change runtime code for this error.
- Required external action: repository owner/admin must enable GitHub Pages with **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, rerun the Pages workflow and verify the returned `page_url` before declaring a canonical Pages URL live.
- Existing Render service `hiu-yhct-3d-atlas-preview` is legacy/transitional only. Its last verified LIVE deploy is `dep-dap0jsegekts73fbljn0` from runtime SHA `bde8cbefac200dd2ce5617d68da1aa1fde9b1781`. Do not create/reintroduce hosting services while the GitHub-only decision remains active.
- Medical/spatial safety gates are unchanged: schematic coordinates remain educational/UNVERIFIED unless genuinely reviewed; published faculty-reviewed BodyParts3D anchors/paths, physical-device QA, and fresh reference parity remain incomplete. Do not claim >=95%/98% overall completion.
- Protected checkpoint branch to use for this synchronized state: `checkpoint/main-pages-blocker-20260922`.
- Next execution after Pages is enabled: rerun Pages → verify deployment URL and assets → direct browser check → then continue approved atlas work without rebuilding completed UI/3D shell work.

---

# CURRENT CHECKPOINT — GitHub-only main synchronized (2026-09-22)

- Repository: `drngovothiennhan/human-atlas`.
- Current production source branch: `main`.
- Verified synchronized main after legacy-host cleanup: `9c1646cff6c113f1ef1949676d92f046e256d1b4`.
- Protected checkpoint: `checkpoint/github-only-clean-20260922` at the same SHA.
- PR #1 (HIU YHCT 3D Atlas foundation) is merged. PR #2 removed only legacy Vercel deployment configuration and is merged.
- GitHub Pages is the only approved deployment path. `.github/workflows/hiu-atlas-pages.yml` builds on every push to `main`; `vercel.json` and `build:vercel` have been removed.
- GitHub Pages run #15 (`35690359721`) checked out the exact `main` SHA, passed content/source validation, TypeScript, anatomy/interaction validation, all 21 unit tests, `build:pages`, and Pages asset verification. Deployment then stopped only at `actions/configure-pages` because Pages is not yet enabled/configured at repository level.
- Do not reintroduce Render, Vercel, Cloudflare deployment, or another hosting service unless the user explicitly changes the GitHub-only decision.
- Do not claim a GitHub Pages live URL until repository Settings → Pages → Source is set to GitHub Actions and the deploy workflow succeeds.
- Existing medical/spatial safety gates remain unchanged: schematic coordinates are educational/unverified unless explicitly reviewed; do not fabricate faculty review or clinical coordinates.
- After Pages is enabled and a deploy succeeds, continue the already-approved project sequence from this main/checkpoint; do not rebuild completed 3D shell work.

---

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

# HIU YHCT 3D ATLAS — EXECUTION CHECKBOARD

Last refreshed: 2026-09-21
Branch: `feature-hiu-yhct-3d-atlas`
Verified runtime code: `b06b4acacf3f02037ffbdea5da75ab957a79db15`
Rule: evidence first. Do not mark DONE/PASS without commit, CI, deploy, test, source/license or review evidence.

## Status legend
- [x] PASS/DONE
- [ ] PENDING
- [!] BLOCKED / external evidence required
- [~] PARTIAL / implemented but acceptance incomplete

## Repository / delivery
- [x] Feature branch isolated; `main` untouched; PR #1 remains draft/open.
- [x] Runtime code `b06b4acacf3f02037ffbdea5da75ab957a79db15` passed push CI #98 `35580796392` and PR CI #99 `35580801767`.
- [x] Content validate/build, TypeScript, anatomy/interactions validators, unit tests, production/static builds and browser smoke all PASS.
- [x] Browser smoke artifact `10630243332`.
- [x] Render deploy `dep-daof99oae00c73c9sv10` from `b06b4aca…` is LIVE.
- [x] Preview URL: https://hiu-yhct-3d-atlas-preview.onrender.com
- [x] CI concurrency cancels superseded runs; cancelled intermediate runs are expected and are not application failures.
- [!] GitHub Pages remains disabled at repository level; prior Configure Pages failure is configuration-only.

## 3D anatomy / interaction
- [x] BodyParts3D 4.0 viewer retained.
- [x] 15 anatomy display systems.
- [x] 2,234 indexed meshes / 3,432 mappings / 2,288,268 triangles validated.
- [x] Desktop rotate, wheel zoom, pan, camera presets/reset and layer presets smoke-tested.
- [x] Tablet 1024x768 touch orbit + pinch emulation smoke-tested.
- [x] Browser console errors = 0 in latest smoke.
- [ ] Physical tablet/laptop QA remains required.

## Clean-room Kinh lạc 3D feature
- [x] New `Kinh lạc 3D` panel integrated into the BodyParts3D application.
- [x] 14-meridian selector and LEFT/RIGHT/BOTH filters.
- [x] Point-code search and point detail.
- [x] Anchored point can drive camera focus.
- [x] Local BodyParts3D registration drafts can render as 3D markers and remain visibly UNVERIFIED.
- [x] Marker renderer and reviewed-path renderer are integrated into the same Three.js anatomy scene.
- [x] Anatomy is forced assembled while the meridian overlay is visible so anchors do not drift from canonical BodyParts3D geometry.
- [x] Browser smoke verifies the Kinh lạc 3D panel, local draft overlay, and zero fabricated paths.
- [x] Clean-room behavior reference only: kinhlac.online public journeys; no source/model/database copied.
- [x] SMPLify-M researched as a technical reference only; restrictive SMPL-X license and model-specific vertex indices block reuse.
- [!] Published runtime spatial acupoints: 0.
- [!] Published 3D meridian paths: 0.
- [!] The app intentionally does not connect UNVERIFIED draft anchors into a fake meridian path.

## Acupoint / meridian catalogue
- [x] 361 standard point identifiers across 14 meridians.
- [x] Ordered sequence for all 14 meridians.
- [x] ST36/ST-36 code search.
- [x] Local study assistant.
- [~] Full Vietnamese/English naming/localization remains incomplete where reusable/reviewed provenance is missing.

## Source / license governance
- [x] BodyParts3D used under audited direct-use terms.
- [x] AcuAtlas and AcuSim/Dryad remain license-usable references but BodyParts3D spatial registration is still required.
- [x] Antonio-Abrao/acu-master, spacejohnlf/tcm-acupoints, SMPLify-M and kinhlac.online are reference-only under their audited constraints.
- [x] Four user PDFs remain REFERENCE_ONLY and runtimeBundled=false.
- [x] Google is outbound reference-only; search-result content is not imported.
- [x] No missing z coordinate is synthesized from 2D material.

## Spatial registration pilot
- [x] Pilot: ST-36, LI-4, LU-5, LU-9, ST-41; LEFT + RIGHT = 10 anchors.
- [x] Capture stores BodyParts3D structure, triangle, barycentric and canonical XYZ.
- [x] Every fresh capture is forced to UNVERIFIED.
- [x] Progress 0/10 -> 1/10 and next-missing ST-36 RIGHT verified in browser smoke.
- [x] Faculty-review validator and reviewed-path gate remain active.
- [!] Committed pilot anchors: 0.
- [ ] Human capture all 10 bilateral anchors directly on BodyParts3D.
- [ ] Genuine faculty review.
- [ ] Validate complete review artifact.
- [ ] Promote only reviewed anchors.
- [ ] Generate meridian paths only from reviewed anchors.

## Acceptance / handoff
- [x] New clean-room Kinh lạc 3D shell/interaction layer is live on the verified preview.
- [ ] Published spatial acupoint/meridian dataset is not complete.
- [ ] Physical Android/tablet and Windows/laptop acceptance.
- [ ] Fresh side-by-side kinhlac.online parity measurement.
- [ ] Do not claim >=95% complete/stable until the defined acceptance set is actually measured at >=95%.

## Exact next execution order
1. Do not redo verified source/license/3D-shell work.
2. Continue the 10-anchor bilateral BodyParts3D pilot.
3. Keep every capture UNVERIFIED until genuine faculty review exists.
4. Validate review artifacts; never move coordinates merely to pass validation.
5. Promote only reviewed anchors, then generate reviewed paths.
6. Re-run the full CI gate after spatial promotion.
7. Perform physical-device QA and fresh side-by-side reference parity before >=95% handoff.

## Checkpoint — Stage 1 licensed source import (2026-09-21)
- [x] Pinned `FuriaRozkwit/acupuncture-3d@1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.
- [x] Vendored reduced 361-point anchor dataset with clinical prose/categories excluded.
- [x] Vendored 14-channel topology + MIT proportional rig.
- [x] Vendored `structures.json` under its upstream CC BY-SA 4.0 attribution boundary.
- [x] Added `npm run source:furia:validate` to CI.
- [x] Validator confirms 361 unique point records, 14 channels, 89 structural anchors and 21 scalp anchors.
- [x] Upstream topology has 360 unique point codes; BL-39 is the single omitted path code and is recorded rather than invented.
- [x] Inherited CI failure #102/#103 was an outdated smoke assertion after the meridian status UI changed; fixed by checking the panel summary.
- [x] Initial source validator failure #105/#106 was the incorrect assumption that upstream topology contained all 361 points; corrected to the evidenced 360 + BL-39 omission.
- [x] Stage 1 verified: push CI #109 `35583964566` SUCCESS; PR CI #110 `35583969307` SUCCESS.
- [x] Stage 1 code checkpoint: `30c178303d0f58f6766ea626db16b3465e89d9dc`.
- [ ] Stage 2: build the licensed schematic resolver/BodyParts3D surface projection from these pinned sources. No PUBLISHED/faculty status may be inferred from this source layer.

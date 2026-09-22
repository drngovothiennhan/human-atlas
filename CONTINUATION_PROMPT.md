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

# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

You are the execution engineer for **HIU YHCT 3D Atlas — Huyệt vị · Kinh lạc · Giải phẫu 3D — HIU CLB YHCT**.

## Absolute rules
- Continue from the exact repository/branch/checkpoint; never rebuild from scratch.
- Repository: `drngovothiennhan/human-atlas`.
- Branch: `feature-hiu-yhct-3d-atlas`.
- PR #1 remains draft/open. Do not merge `main` unless the user explicitly orders it.
- Before editing, fetch live branch HEAD + GitHub Actions + Render state and read `PROJECT_STATE.md`, `docs/CHECKBOARD.md`, `docs/SOURCE_AUDIT.md`, `docs/LICENSE_MATRIX.md`, `docs/USER_PROVIDED_SOURCE_AUDIT.md`, `docs/ACUPOINT_SPATIAL_AUDIT.md`, `docs/reference-parity-matrix.md`, and this file.
- Never repeat completed work.
- Never fabricate coordinates, path geometry, clinical/anatomy facts, licenses, citations, reviewer evidence, test/deploy status, or completion percentages.
- Never infer z from a 2D image/diagram and never connect unreviewed anchors merely to make a visible meridian.
- User possession/upload is not redistribution permission.
- Do not add unrelated code just to increase activity.
- Do not claim >=95% completion/stability until physical-device QA, fresh reference parity and defined acceptance gates support it.

## Last verified runtime checkpoint
- Runtime SHA: `b06b4acacf3f02037ffbdea5da75ab957a79db15`.
- Push CI #98: `35580796392` — SUCCESS.
- PR CI #99: `35580801767` — SUCCESS.
- Browser smoke artifact: `10630243332`.
- Render deploy: `dep-daof99oae00c73c9sv10` — LIVE.
- Preview: https://hiu-yhct-3d-atlas-preview.onrender.com

## What now works
- BodyParts3D 4.0 anatomy viewer; 15 systems; 2,234 meshes.
- 361 standard point identifiers across 14 meridians.
- Clean-room `Kinh lạc 3D` panel integrated into the same Three.js scene:
  - select meridian;
  - LEFT/RIGHT/BOTH filter;
  - point-code search + detail;
  - show/hide overlay;
  - local UNVERIFIED BodyParts3D drafts render as 3D markers;
  - anchored point can request camera focus;
  - path renderer accepts only FACULTY_REVIEWED/PUBLISHED path data.
- Anatomy is forced assembled while overlay is visible.
- Browser smoke verifies a local ST-36 draft marker is rendered and `meridianPaths=0`, proving no fake path is synthesized.
- Desktop rotate/zoom/pan and tablet touch/pinch automated smoke all pass.
- Registration pilot progress and next-missing control pass.
- PWA offline reload passes; console errors are empty.

## Source/reference state
- kinhlac.online is clean-room UX reference only; do not copy its source/model/database.
- `wwwwwangg/smplify-m-new` / SMPLify-M is REFERENCE_ONLY because its repository follows SMPL-X/SMPLify-X non-commercial research/education, non-transferable/no-distribution terms and its acupoint indices are model-specific.
- AcuAtlas/AcuSim coordinates are not transferable to BodyParts3D without a validated transform/registration.
- User PDFs remain REFERENCE_ONLY.
- Google remains outbound reference-only.

## Hard blockers
- Published runtime anchors = 0.
- Published meridian paths = 0.
- Ten bilateral pilot anchors require human capture directly on BodyParts3D.
- Genuine faculty review is required before promotion.
- Physical tablet/laptop QA and fresh kinhlac.online side-by-side parity remain pending.
- GitHub Pages repo-level enablement remains missing.

## Continuous execution algorithm
1. Fetch live HEAD, latest CI and Render deploy state.
2. Treat docs-only checkpoint commits separately from the verified runtime SHA.
3. If newest runtime CI fails, inspect the exact failed step/log and fix only the evidenced failure.
4. Do not redo the Kinh lạc 3D shell, source audits, PDFs, pan/pinch or next-missing workflow.
5. Continue the 10-anchor pilot: ST-36, LI-4, LU-5, LU-9, ST-41; LEFT + RIGHT.
6. Capture only by direct BodyParts3D surface interaction while consulting approved references; preserve structure, triangle, barycentric, canonical XYZ, side, source and timestamp.
7. Keep new captures UNVERIFIED.
8. When genuine faculty review exists, validate it with `npm run registration:validate-review -- <review-artifact.json>`.
9. Promote only validated reviewed anchors.
10. Generate paths only from reviewed/published anchors; never synthesize missing path geometry.
11. After runtime/content change run the full gate: content validate -> content build -> TypeScript -> anatomy validator -> interaction validator -> unit tests -> production build -> static verification -> browser smoke -> Pages static build verification.
12. Refresh preview only from a verified runtime commit and record exact deploy provenance.
13. Complete physical Android/tablet + Windows/laptop QA and fresh side-by-side reference parity before >=95% handoff.
14. At each checkpoint atomically update `docs/CHECKBOARD.md`, `PROJECT_STATE.md` and this file.
15. If interrupted/new chat: start from these files and live GitHub/Render state, not conversational memory.

## Handoff rule
It is valid to say the clean-room Kinh lạc 3D interaction layer is live when the verified deploy is live. It is **not** valid to say the full spatial atlas is complete or >=95% stable while published BodyParts3D acupoints/paths, physical-device QA and fresh parity remain incomplete.

## Stage 1 licensed-source checkpoint
- Do not repeat the Furia source search/import.
- Pinned source: `FuriaRozkwit/acupuncture-3d@1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.
- Verified checkpoint: `30c178303d0f58f6766ea626db16b3465e89d9dc`; push CI #109 and PR CI #110 SUCCESS.
- Vendor directory: `vendor/furia-acupuncture-3d/`.
- Use only the imported geometry/topology boundary. Clinical prose/categories/needling/OCR remain excluded.
- Upstream topology intentionally/evidentially covers 360 unique point codes and omits BL-39; never fabricate the missing path segment.
- Next approved scope only: implement Stage 2 schematic resolver/projection onto BodyParts3D and mark it LICENSED_SCHEMATIC/UNVERIFIED. Do not broaden scope.

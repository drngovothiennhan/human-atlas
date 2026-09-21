# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

You are the execution engineer for **HIU YHCT 3D Atlas — Huyệt vị · Kinh lạc · Giải phẫu 3D — HIU CLB YHCT**.

## Non-negotiable operating rules
- Continue from the exact repository/branch/checkpoint; do not rebuild from scratch.
- Repository: `drngovothiennhan/human-atlas`.
- Working branch: `feature-hiu-yhct-3d-atlas`.
- Do not merge `main` unless the user explicitly orders it.
- Read `PROJECT_STATE.md`, `docs/CHECKBOARD.md`, `docs/SOURCE_AUDIT.md`, `docs/LICENSE_MATRIX.md`, and `docs/ACUPOINT_SPATIAL_AUDIT.md` before editing.
- First inspect the current branch head and latest GitHub Actions runs. Do not repeat already completed work.
- Never fabricate coordinates, anatomy facts, test results, deployments, licenses, citations, review status, or completion percentages.
- Never promote a 2D coordinate to 3D by inventing z.
- Direct-use license and BodyParts3D registration are separate gates.
- Runtime 3D acupoint markers and meridian paths may use only BodyParts3D-registered anchors that have the required review status.
- Google/kinhlac.online/WHO or other non-redistributable material may be linked or used as human reference only; do not copy protected prose/assets/data.
- When a new open-source dataset/repository is proposed, audit exact artifact license, attribution, share-alike/NC restrictions, coordinate frame and provenance before importing.
- Do not add unrelated features or code merely to increase activity.
- Keep UI stable on tablet/laptop; do not break the existing anatomy viewer, search, PWA, or study panel.

## Current verified functional scope
- BodyParts3D 4.0 anatomy viewer.
- 15 anatomy systems; rotate/zoom/select/search/isolate/explode.
- 361-point catalogue across 14 meridians with ordered point sequences.
- ST36/ST-36 search and local study assistant.
- PWA/offline shell.
- Five-point faculty registration pilot: ST-36, LI-4, LU-5, LU-9, ST-41.
- Registration workspace captures BodyParts3D surface structure, triangle, barycentric evidence and XYZ as UNVERIFIED draft.
- Reviewed-anchor path gate prevents unreviewed data from becoming a meridian path.

## Current critical state
- Commit `b9f1bd89276584a0cb15ddfea6647d95849ca9c0` fixes Vite `ImportMeta.env` typing.
- On the GitHub Pages workflow for that commit: content validation, TypeScript check, 16/16 unit tests, Pages build and static asset verification passed; deployment then failed at `actions/configure-pages` because GitHub Pages is not enabled/configured for the repository.
- Core CI browser-smoke must be checked to terminal status before declaring this commit verified.
- Runtime spatially published acupoints remain 0 unless a later checkpoint explicitly documents faculty-reviewed anchors.

## Exact continuation workflow
1. Fetch latest branch HEAD and latest push/PR CI runs.
2. If CI is running, inspect completed steps and continue only after terminal evidence is available.
3. If CI fails, read the failing job logs and make the smallest targeted fix; re-run through a new commit.
4. If CI passes, update `PROJECT_STATE.md` and `docs/CHECKBOARD.md` with exact commit/run IDs and results.
5. Do not treat GitHub Pages configuration failure as a code failure when build/tests pass. Use the verified Render preview unless/until Pages is explicitly enabled.
6. Continue the approved BodyParts3D landmark-registration pilot:
   - ST-36, LI-4, LU-5, LU-9, ST-41;
   - capture directly on the BodyParts3D surface;
   - preserve side, surface structure ID/name, triangle index, barycentric coordinates, canonical XYZ, geometry source, location-reference source, timestamp and review state;
   - initial state must be UNVERIFIED;
   - do not promote without faculty review.
7. After pilot acceptance, scale meridian-by-meridian and generate surface-following paths only from reviewed anchors.
8. Maintain source/license audit for every imported or reference-only source.
9. Run: content validation → content build → TypeScript check → anatomy/interactions validators → unit tests → production build → static asset verification → browser smoke.
10. Keep desktop 1440×900 and tablet 1024×768 browser evidence. Do not claim physical-device testing from emulation.
11. Only create a handoff checkpoint when all reachable automated gates are green and all remaining blockers are stated explicitly.
12. Never state “>95% complete/stable” unless a defined acceptance set has actually been measured at ≥95%. The kinhlac.online reference parity score remains NOT MEASURED until a fresh side-by-side run exists.

## Checkpoint output format
At each safe checkpoint record:
- branch + exact HEAD SHA;
- what changed;
- successful tests with run IDs;
- failures/blockers with exact log reason;
- content counts;
- runtime spatial point/path counts;
- deployment URL + deployment provenance;
- source/license changes;
- next exact action.

If interrupted, a new ChatGPT session must start by reading the repository state files and GitHub Actions rather than trusting conversational memory.

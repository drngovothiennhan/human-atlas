# HIU YHCT 3D ATLAS — CURRENT PROJECT STATE

## Canonical source

- Repository: `drngovothiennhan/human-atlas`
- Canonical branch: `main`
- Production hosting: GitHub Pages only.
- Live URL: https://drngovothiennhan.github.io/human-atlas/
- All new work must branch from the current `main` and return through a tested PR.

## Architecture invariant

The application is **meridian-first** for Traditional Medicine study.

- Primary learning layers: acupoints and meridians.
- Default anatomy: body surface.
- Muscle layer: compact BodyParts3D landmark subset only.
- Skeletal and articular layers: optional reference layers loaded on demand.
- The retired 484-mesh detailed Z-Anatomy muscle runtime must not return.
- Do not reintroduce `app/head-muscles.ts`, `z-muscular-male.glb`, `z-muscles-manifest.json`, `fetch-zanatomy-muscles.mjs`, or detailed-muscle runtime state.

## Source of truth

- `app/scene.tsx`: active WebGL scene and meridian-first rendering.
- `app/reference-anatomy.ts`: active skeletal/articular reference sources only.
- `app/anatomy.ts`: BodyParts3D systems and landmark muscle policy.
- `content/acupoints/acupoints.json`: acupoint content source.
- `content/meridians/meridians.json`: meridian content source.
- `scripts/validate-architecture.mjs`: architecture regression guard.
- `.github/workflows/hiu-atlas-ci.yml`: CI gate.
- `.github/workflows/hiu-atlas-pages.yml`: production deploy gate.

## Release rule

A change is not production-ready until content validation, architecture guard, TypeScript check, atlas validation, interaction validation, unit tests, build, Pages verification, and browser smoke all pass.

Do not develop from historical feature/checkpoint branches. Do not restore old deployment platforms or parallel anatomy runtimes.

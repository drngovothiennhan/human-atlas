# HIU YHCT 3D ATLAS — CHECKBOARD

## Architecture

- [x] Canonical branch is `main`.
- [x] Meridian/acupoint-first profile is active.
- [x] Default view uses body surface.
- [x] Muscle runtime uses BodyParts3D landmark subset.
- [x] 484-mesh detailed muscle runtime removed.
- [x] Skeletal/articular reference layers retained on demand.
- [x] Legacy muscle loader/assets/state removed.
- [x] GitHub Pages is the production path.
- [x] Historical feature branch is not a CI push target.
- [x] One workflow owns verify + Pages deploy; no duplicate smoke pipeline.
- [x] Architecture guard is enforced before deployment.

## Mandatory release gates

- [ ] Content validation passes.
- [ ] Furia/source validation passes.
- [ ] Architecture guard passes.
- [ ] TypeScript check passes.
- [ ] Atlas validation passes.
- [ ] Interaction validation passes.
- [ ] Unit tests pass.
- [ ] Production build passes.
- [ ] Pages asset verification passes.
- [ ] Browser smoke passes.
- [ ] Main CI passes after merge.
- [ ] GitHub Pages deployment passes.
- [ ] Live page verified after deployment.

## Scope discipline

Keep only code, assets, tests, docs, and dependencies used by the meridian-first architecture. Do not restore retired detailed-muscle architecture or add a competing anatomy runtime.

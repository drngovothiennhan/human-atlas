# CONTINUATION PROMPT — HIU YHCT 3D ATLAS

Continue only from the current `main` of `drngovothiennhan/human-atlas`.

## Non-negotiable architecture

1. Keep the product **meridian/acupoint first**.
2. Use body surface plus a compact BodyParts3D landmark-muscle subset.
3. Keep skeletal and articular anatomy as optional reference layers only.
4. Never restore the retired 484-mesh detailed muscle runtime or its loader/assets/state.
5. Do not create a second anatomy runtime in parallel.
6. Do not work from historical feature or checkpoint branches.
7. Production path is GitHub Pages only unless the user explicitly changes that decision.

## Required workflow

For every change:

`current main -> focused branch -> validation -> build -> browser smoke -> PR -> merge -> single main verify job -> deploy verified Pages artifact -> live verification`

Do not skip gates and do not report success without evidence.

## Architecture guard

Run:

```sh
npm run architecture:validate
```

The guard must remain green and must fail if retired detailed-muscle architecture returns.

## Current product priority

Focus effort on:
- correctness and clarity of meridian paths;
- acupoint visibility and study interaction;
- lightweight anatomical landmarks that support Traditional Medicine learning;
- stable mobile/desktop interaction;
- removal of unused legacy code that does not support the current architecture.

Avoid expanding general anatomy for its own sake.

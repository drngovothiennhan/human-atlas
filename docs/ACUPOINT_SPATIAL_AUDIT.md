# ACUPOINT_SPATIAL_AUDIT

Audit checkpoint: 2026-09-21  
Runtime rule: **license permission and spatial registration are separate gates**. Passing the license gate does not authorize publication of coordinates that have not been registered to the BodyParts3D canonical surface.

## Candidate A — AcuAtlas reference dataset

- Exact artifact: https://acupointatlas.com/data/acupoints.json
- Scope: 361 point records across 14 meridians.
- Dataset license: CC BY 4.0, as stated by the AcuAtlas dataset publication.
- Audited coordinate schema: `view`, normalized `x`, normalized `y`.
- Methodology states that mapped plate coordinates are projected onto the AcuAtlas 3D body.
- The exact reusable JSON inspected in this checkpoint does **not** expose a verified `z`/canonical 3D coordinate, BodyParts3D structure ID, triangle index, barycentric anchor, or a transform to `BodyParts3D-4.0-browser-meters-Y-up`.
- Decision: **LICENSE PASS / REGISTRATION BLOCKED / RUNTIME INELIGIBLE**.
- Clinical/depth/indication fields are not imported by this checkpoint.

## Candidate B — AcuSim Dryad dataset

- DOI: https://doi.org/10.5061/dryad.zs7h44jkz
- Published version audited: 2025-03-28.
- Scope documented by Dryad: 63,936 RGB-D images, 504 synthetic anatomical models, 174 cervicocranial acupoints.
- Dryad dataset terms: CC0.
- README documents corresponding JSON annotations containing 2D/3D keypoint coordinates.
- Those spatial annotations belong to the AcuSim synthetic-model/rendering coordinate context. This checkpoint has not verified a transform from those models into the BodyParts3D canonical frame or a mapping to BodyParts3D surface structures/triangles.
- Decision: **LICENSE PASS / REGISTRATION BLOCKED / RUNTIME INELIGIBLE**.

## Registration gate required for runtime

A spatial candidate may become `runtimeEligible: true` only after all of the following are evidenced:

1. exact artifact license = DIRECT_USE;
2. coordinate frame is documented;
3. deterministic transform to `BodyParts3D-4.0-browser-meters-Y-up` is validated;
4. each published point has a BodyParts3D surface structure/anchor rather than a visual offset;
5. side/midline semantics are preserved;
6. landmark/sample QA is reviewed before promoting point positions;
7. content validation and automated tests pass.

Until then, `content/acupoints/acupoints.json` remains empty. No 2D coordinate is promoted to 3D and no missing z/anchor is synthesized.

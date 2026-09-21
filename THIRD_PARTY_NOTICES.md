# THIRD_PARTY_NOTICES

## BodyParts3D 4.0
BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

Source: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html  
License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html

WHO acupuncture text, TARA curated rows, kinhlac.online assets/data, acu-master code, AAIDA medical content and FMA content are not redistributed by this checkpoint.\n\n## Spatial candidates audited but not bundled\n- AcuAtlas 361-point reference dataset: dataset license audited as CC BY 4.0; registration to BodyParts3D is blocked, so no AcuAtlas coordinate/content rows are bundled.\n- AcuSim Dryad dataset (doi:10.5061/dryad.zs7h44jkz): Dryad dataset audited as CC0; registration to BodyParts3D is blocked, so no AcuSim coordinate rows or synthetic model assets are bundled.

## AcuAtlas catalogue
AcuAtlas 361-point reference dataset is audited as CC BY 4.0. HIU Atlas 0.3.0 uses only the standard point identifiers, meridian membership and numeric ordering for the runtime catalogue. AcuAtlas mapped x/y coordinates, clinical prose and 3D projection are not imported into BodyParts3D.

Source index: https://acupointatlas.com/acupuncture-points/


## Furia calibrated rig — Stage 2 schematic projection

- File: `vendor/furia-acupuncture-3d/rig_fitted.json`
- Upstream: `FuriaRozkwit/acupuncture-3d@1fc9ec98d365c9fb035844e2775c1be05a0a05fc`, `data/rig_fitted.json`.
- License boundary: CC BY-SA 4.0 for calibrated anatomical metadata derived from Z-Anatomy/BodyParts3D, as declared by upstream ATTRIBUTION.md.
- Use here: source-frame ray origins/directions are projected onto the already licensed BodyParts3D FMA7163 skin. Generated coordinates and topology are labelled `LICENSED_SCHEMATIC / UNVERIFIED`; they are never promoted to faculty-reviewed/published data automatically.
- BL-39 is absent from the pinned upstream path topology; the build deliberately splits that path rather than inventing a connection.

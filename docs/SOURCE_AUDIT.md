# SOURCE_AUDIT

Audit date: 2026-09-21. Public availability is **not** treated as permission to redistribute.

| Source | Owner | Data | License evidence | Decision |
|---|---|---|---|---|
| BodyParts3D 4.0 | DBCLS | 3D anatomy meshes/tables | Official archive: CC BY 4.0; license updated 2025-02-27 | DIRECT_USE |
| WHO Standard Acupuncture Point Locations (2008) | WHO | Standard point publication | WHO copyright notice; reproduction/translation requires permission | REFERENCE_ONLY |
| TARA Acupoints Ontology 1.7.0 | SciCrunch/TARA | Ontology + curated acupoint CSV | Exact artifact redistribution license not verified | QUARANTINE |\n| AcuAtlas reference dataset | AcuAtlas | 361 point records + mapped body-plate x/y | Dataset publication states CC BY 4.0 | DIRECT_USE / REGISTRATION_BLOCKED |\n| AcuSim Dryad 2025 | Sun et al. | 174 cervicocranial points; RGB-D + 2D/3D keypoint annotations | Dryad CC0 dataset | DIRECT_USE / REGISTRATION_BLOCKED |
| Antonio-Abrao/acu-master | Antonio Abrao | 3D acupuncture app | GPL-3.0 | REFERENCE_ONLY |
| AAIDA | vtrantranzen | Local TCM app | MIT code; medical content provenance not yet audited | REFERENCE_ONLY |
| UBERON | OBO/UBERON | Anatomy ontology | CC BY 3.0 public record | REFERENCE_ONLY |
| FMA | FMA maintainers | Anatomy ontology | Exact artifact/version license unresolved | QUARANTINE |
| kinhlac.online/xem-3d | kinhlac.online | UX reference | No reusable source/model/database license verified | REFERENCE_ONLY |

## Directly bundled third-party data

BodyParts3D 4.0 only. Official license: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html  
Official download: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html

## Acupuncture data gate

Two spatial candidates now pass the **license** gate: AcuAtlas (361 records, CC BY 4.0) and AcuSim/Dryad (174 cervicocranial points, CC0). Neither passes the **BodyParts3D registration** gate. AcuAtlas's exact public JSON exposes mapped 2D plate coordinates (`view/x/y`) rather than transferable BodyParts3D anchors; AcuSim documents 2D/3D keypoints in its synthetic-model coordinate context without a validated transform to BodyParts3D. Runtime verified acupoints therefore remain **0**. No insertion angle/depth, indication, warning or therapeutic claim is synthesized. See `docs/ACUPOINT_SPATIAL_AUDIT.md`.

## Clean-room rule

kinhlac.online is used only to enumerate public viewer journeys. No private API, source, model, database or copied prose is used.

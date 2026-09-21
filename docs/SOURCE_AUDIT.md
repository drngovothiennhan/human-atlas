# SOURCE_AUDIT

Audit date: 2026-09-21. Public availability is **not** treated as permission to redistribute.

| Source | Owner | Data | License evidence | Decision |
|---|---|---|---|---|
| BodyParts3D 4.0 | DBCLS | 3D anatomy meshes/tables | Official archive: CC BY 4.0; license updated 2025-02-27 | DIRECT_USE |
| WHO Standard Acupuncture Point Locations (2008) | WHO | Standard point publication | WHO copyright notice; reproduction/translation requires permission | REFERENCE_ONLY |
| TARA Acupoints Ontology 1.7.0 | SciCrunch/TARA | Ontology + curated acupoint CSV | Exact artifact redistribution license not verified | QUARANTINE |
| AcuAtlas reference dataset | AcuAtlas | 361 point records + mapped body-plate x/y | Dataset publication states CC BY 4.0 | DIRECT_USE / REGISTRATION_BLOCKED |
| AcuSim Dryad 2025 | Sun et al. | 174 cervicocranial points; RGB-D + 2D/3D keypoint annotations | Dryad CC0 dataset | DIRECT_USE / REGISTRATION_BLOCKED |
| Antonio-Abrao/acu-master | Antonio Abrao | 3D acupuncture app | GPL-3.0 | REFERENCE_ONLY |
| FuriaRozkwit/acupuncture-3d | Pawel Turzynski | 361 authored proportional anchors, 14-channel topology, procedural rig; structural metadata derived from anatomy assets | Code + authored anchor/topology/rig data MIT; `structures.json` CC BY-SA 4.0 per upstream attribution | DIRECT_USE_SCHEMATIC / REVIEW_REQUIRED |
| wwwwangg/smplify-m-new (SMPLify-M) | SMPLify-M authors / SMPL-X licensors | Dynamic 3D acupoint mapping, 14-meridian visualization, SMPL-X vertex-index/geodesic-path approach | Repository follows SMPL-X/SMPLify-X non-commercial research/education license; non-transferable and no distribution; indices are tied to a specific SMPL-X vertex ordering | REFERENCE_ONLY |
| spacejohnlf/tcm-acupoints | spacejohnlf | Three.js meridian/acupoint viewer + surface snapping | MIT code; model CC BY-SA 4.0; medical prose/data reuse provenance unresolved; coordinates explicitly illustrative | REFERENCE_ONLY |
| AcuGuide | kany-e | iOS 3D/acupressure atlas | Proprietary all-rights-reserved source; public for reading/evaluation only | REFERENCE_ONLY |
| AAIDA | vtrantranzen | Local TCM app | MIT code; medical content provenance not yet audited | REFERENCE_ONLY |
| UBERON | OBO/UBERON | Anatomy ontology | CC BY 3.0 public record | REFERENCE_ONLY |
| FMA | FMA maintainers | Anatomy ontology | Exact artifact/version license unresolved | QUARANTINE |
| kinhlac.online/xem-3d | kinhlac.online | UX reference | No reusable source/model/database license verified | REFERENCE_ONLY |
| Z-Anatomy | Z-Anatomy | 3D anatomy models/project content | Repository states CC BY-SA 4.0; upstream included assets still require exact-file audit | REFERENCE_ONLY |
| Google Search external reference | Google | Outbound navigation only | No result content is imported | REFERENCE_ONLY / LINK_ONLY |
| Bộ Y tế — Hướng dẫn chẩn đoán và điều trị bệnh theo YHCT/YHHĐ, Tập I | Bộ Y tế Việt Nam | Clinical/nomenclature cross-check | User-provided PDF; redistribution license not established | REFERENCE_ONLY |
| Bài giảng Y học cổ truyền — Tập I (2005) | Trường Đại học Y Hà Nội / NXB Y học | Foundational YHCT, tạng phủ, kinh lạc | User-provided scan; redistribution license not established | REFERENCE_ONLY |
| Kinh Lạc Học (Kỳ Huyệt) | Công Sĩ / NXB Phương Đông | Kỳ huyệt and diagrams | User-provided scan; redistribution license not established | REFERENCE_ONLY |
| Huyệt Vị Kinh Lạc Cơ Thể Người | Ngô Trung Triều / NXB Hồng Đức | Illustrated meridian/acupoint reference | User-provided scan; redistribution license not established | REFERENCE_ONLY |

## Directly bundled third-party data

- BodyParts3D 4.0 anatomy assets. Official license: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- AcuAtlas 361-point index (CC BY 4.0): only point codes, 14-meridian membership, and standard numeric ordering are bundled in catalogue 0.3.0. Clinical prose and mapped coordinates remain excluded.

## Additional 3D acupuncture implementation references

- `spacejohnlf/tcm-acupoints`: MIT code is a useful implementation reference for Three.js interaction/surface snapping, but its README explicitly labels its 3D acupoint coordinates as teaching/illustrative coordinates rather than a standard clinical coordinate database. Its body model is separately CC BY-SA 4.0 and its medical prose provenance is insufficient for direct runtime import. No data/assets are imported by this checkpoint.
- `kany-e/AcuGuide`: public source but proprietary. Its license permits reading/study/evaluation and forbids reuse in another product without written permission. Reference-only; no code/data import.
- `wwwwwangg/smplify-m-new` (SMPLify-M): useful research reference for mapping acupoints to a 3D human mesh and visualizing meridian routes, but the repository follows the restrictive SMPL-X/SMPLify-X research license and explicitly notes that acupoint indices depend on a specific SMPL-X vertex ordering. No code, model, vertex-index table or coordinate data is imported.

## Additional open 3D anatomy reference

Z-Anatomy is publicly licensed under CC BY-SA 4.0 at repository level. It is recorded as REFERENCE_ONLY for this project because ShareAlike obligations and the repository's listed upstream inclusions require exact-file provenance/compatibility review before any asset is bundled. No Z-Anatomy asset is imported by this checkpoint.

## Acupuncture data gate

Two spatial candidates now pass the **license** gate: AcuAtlas (361 records, CC BY 4.0) and AcuSim/Dryad (174 cervicocranial points, CC0). Neither passes the **BodyParts3D registration** gate. AcuAtlas's exact public JSON exposes mapped 2D plate coordinates (`view/x/y`) rather than transferable BodyParts3D anchors; AcuSim documents 2D/3D keypoints in its synthetic-model coordinate context without a validated transform to BodyParts3D. Runtime catalogue acupoints are now **361 metadata records**, while runtime **spatially registered acupoints remain 0**. No insertion angle/depth, indication, warning or therapeutic claim is synthesized. See `docs/ACUPOINT_SPATIAL_AUDIT.md`.

## Clean-room rule

kinhlac.online is used only to enumerate public viewer journeys (3D rotation, meridian selection, point lookup, search/fly-to). No private API, source, model, database or copied prose is used. The HIU implementation is clean-room and keeps spatial publication behind the BodyParts3D registration/review gate.

## User-provided course/reference PDFs

Four supplied PDFs are audited into source metadata only. No PDF binary, scan page, diagram, long prose, or coordinate table is bundled. The Bộ Y tế document is used to corroborate point nomenclature/clinical usage; the illustrated Ngô Trung Triều atlas is a human visual reference for pilot registration. Neither is treated as a transferable BodyParts3D coordinate source. See `docs/USER_PROVIDED_SOURCE_AUDIT.md`.

## FuriaRozkwit/acupuncture-3d pinned import

Pinned upstream commit: `1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.

The HIU vendor subset imports 361 point identifiers with authored anchor geometry, 14 channel definitions, the proportional rig and structural reference metadata. Clinical prose, categories, needling material and `point_meta.json` are explicitly excluded. Upstream channel topology contains 360 unique point codes and omits BL-39 from the drawn path set; HIU records that fact and does not silently invent a BL-39 path segment. The imported layer is eligible only for a clearly labelled licensed schematic/unverified visualization until BodyParts3D registration and review gates are satisfied.

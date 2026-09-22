# USER_PROVIDED_SOURCE_AUDIT

Audit date: 2026-09-21.

The user supplied four PDFs for the HIU YHCT 3D Atlas project. They are treated as **REFERENCE_ONLY** until exact redistribution/reuse rights are documented. The PDFs themselves, page images, diagrams, and expressive text are not committed into the repository or runtime bundle.

| Source ID | Supplied document | Verified use in this checkpoint | Runtime decision |
|---|---|---|---|
| USER-BYT-2020-YHCT-GUIDELINE | Bộ Y tế — Hướng dẫn chẩn đoán và điều trị bệnh theo YHCT, kết hợp YHCT và YHHĐ, Tập I | Clinical/nomenclature cross-check; supplied text contains the pilot codes/names ST-36, LI-4, LU-5, LU-9 and ST-41 in treatment formulas | REFERENCE_ONLY |
| USER-HANOI-YHCT-LECTURE-T1-2005 | Bài giảng Y học cổ truyền — Tập I, Trường Đại học Y Hà Nội, NXB Y học, Hà Nội 2005 | Foundational YHCT / tạng phủ / kinh lạc theory reference | REFERENCE_ONLY |
| USER-CONGSI-KINH-LAC-HOC | Công Sĩ — Kinh Lạc Học (Kỳ Huyệt), NXB Phương Đông | Kỳ huyệt/diagram reference; not accepted as an automatic coordinate source for the 14-meridian pilot | REFERENCE_ONLY |
| USER-NGO-TRUNG-TRIEU-HUYET-VI-KINH-LAC | Ngô Trung Triều — Huyệt Vị Kinh Lạc Cơ Thể Người, NXB Hồng Đức | Visual human reference for standard meridians/acupoints; pilot locators point reviewers to the relevant meridian sections | REFERENCE_ONLY |

## Pilot reference mapping

The runtime still contains **zero published 3D acupoint coordinates** from these PDFs.

For each pilot point, `content/registration/reference-evidence.json` stores only short bibliographic locators:
- ST-36 and ST-41: WHO standard reference + Bộ Y tế nomenclature/clinical cross-check + the supplied Túc Dương Minh Vị Kinh visual section.
- LI-4: WHO standard reference + Bộ Y tế cross-check + the supplied Thủ Dương Minh Đại Trường Kinh visual section.
- LU-5 and LU-9: WHO standard reference + Bộ Y tế cross-check + the supplied Thủ Thái Âm Phế Kinh visual section.

These locators guide a human reviewer while clicking directly on the BodyParts3D skin surface. They are **not coordinates** and must never be converted into an invented z-axis or automatic BodyParts3D transform.

## Copyright / provenance rule

User possession or upload is not treated as a redistribution license. Until exact rights are documented:
1. do not commit the PDFs or extracted page images;
2. do not copy long prose or diagrams into the application;
3. do not use these sources as DIRECT_USE runtime datasets;
4. keep all newly captured surface anchors UNVERIFIED until faculty review.

# reference-parity-matrix

Reference: https://kinhlac.online/xem-3d  
Rule: do not calculate or claim ≥95% until a fresh side-by-side browser run is completed.

| # | Journey | HIU status | Weight | Test/evidence |
|---:|---|---|---:|---|
|1|3D human body visible|PARTIAL|6|BodyParts3D model exists; fresh branch browser E2E pending|
|2|Drag to rotate|PARTIAL|5|OrbitControls exists; fresh E2E pending|
|3|Pinch/wheel zoom|PARTIAL|5|Implemented; physical tablet pending|
|4|Pan|PARTIAL|3|Implemented; touch E2E pending|
|5|Select meridian|FAIL|6|14 nomenclature records; no 3D path|
|6|Toggle meridian|FAIL|4|Not wired to scene|
|7|Display meridian path|FAIL|7|No validated spatial path|
|8|Display acupoint markers|FAIL|7|0 verified 3D acupoints|
|9|Tap point → info|FAIL|5|0 runtime points|
|10|Search point code/name|FAIL|5|0 verified point records|
|11|Search → camera focus|FAIL|6|No point anchors|
|12|Highlight selected point|FAIL|3|No point anchors|
|13|Highlight containing meridian|FAIL|3|No path registration|
|14|Reset camera|PARTIAL|3|Implemented; fresh branch E2E pending|
|15|Front view|PARTIAL|3|Implemented|
|16|Back view|PARTIAL|3|Implemented|
|17|Left/right view|PARTIAL|3|One side preset; not separate left/right|
|18|Anatomy layers|PARTIAL|5|15 BodyParts3D display systems|
|19|Opacity/isolate|PARTIAL|3|Isolate exists; generic opacity control pending|
|20|Load/error states|PARTIAL|2|Implemented; network E2E pending|
|21|Tablet landscape UX|PARTIAL|5|Responsive code exists; real tablet not run|
|22|Desktop UX|PARTIAL|4|Existing desktop layout; fresh E2E pending|
|23|Offline shell/data|PARTIAL|4|PWA service worker added; offline browser test pending|
|24|Educational simulation|FAIL|4|Safety/data gate blocks unverified needle geometry|

**Weighted parity score: NOT MEASURED.**

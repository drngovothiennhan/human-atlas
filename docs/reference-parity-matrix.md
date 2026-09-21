# reference-parity-matrix

Reference: https://kinhlac.online/xem-3d  
Rule: do not calculate or claim >=95% until a fresh side-by-side browser run is completed.

Latest internal browser evidence: GitHub Actions push run 35559640239 and PR run 35559642282 on commit `5760d0473fb661c579c80628e7162d490b49b61b`. These runs verify HIU behaviour only; they are **not** a side-by-side reference parity measurement.

| # | Journey | HIU status | Weight | Test/evidence |
|---:|---|---|---:|---|
|1|3D human body visible|PASS|6|Browser smoke: canvas rendered and 27 successful model responses observed|
|2|Drag to rotate|PASS|5|Browser smoke desktop 1440x900: rotated screenshot hash changed|
|3|Pinch/wheel zoom|PARTIAL|5|Desktop wheel zoom browser smoke PASS; dedicated pinch-zoom assertion/physical tablet still pending|
|4|Pan|PARTIAL|3|Interaction validator covers drag/multitouch contracts; dedicated browser pan assertion pending|
|5|Select meridian|FAIL|6|14 nomenclature records; no validated 3D path|
|6|Toggle meridian|FAIL|4|Not wired to a validated scene path|
|7|Display meridian path|FAIL|7|No validated spatial path|
|8|Display acupoint markers|FAIL|7|0 verified 3D acupoints|
|9|Tap point -> info|FAIL|5|0 runtime points|
|10|Search point code/name|FAIL|5|0 verified point records|
|11|Search -> camera focus|FAIL|6|No point anchors|
|12|Highlight selected point|FAIL|3|No point anchors|
|13|Highlight containing meridian|FAIL|3|No path registration|
|14|Reset camera|PARTIAL|3|Implemented; dedicated fresh browser assertion pending|
|15|Front view|PARTIAL|3|Implemented; dedicated fresh browser assertion pending|
|16|Back view|PARTIAL|3|Implemented; dedicated fresh browser assertion pending|
|17|Left/right view|PARTIAL|3|One side preset exists; separate left/right acceptance still pending|
|18|Anatomy layers|PARTIAL|5|15 BodyParts3D display systems; layer-control E2E coverage not complete|
|19|Opacity/isolate|PARTIAL|3|Isolate exists; generic opacity control acceptance pending|
|20|Load/error states|PARTIAL|2|Current browser smoke records no console errors; fault-injection/error-state journey pending|
|21|Tablet landscape UX|PARTIAL|5|1024x768 touch-emulated browser smoke PASS; physical tablet test pending|
|22|Desktop UX|PASS|4|1440x900 browser smoke PASS for model, rotate, zoom and study panel interactions|
|23|Offline shell/data|PARTIAL|4|Service worker ready + offline app-shell reload PASS; selective pack/full offline model acceptance pending|
|24|Educational simulation|FAIL|4|Safety/data gate blocks unverified needle geometry|

**Weighted parity score: NOT MEASURED.**  
Reason: no fresh side-by-side reference run has been executed, and the acupoint/meridian spatial journeys required for a valid score remain unavailable.

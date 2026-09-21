# reference-parity-matrix

Reference: https://kinhlac.online/xem-3d  
Rule: clean-room behavioural reference only. Do not calculate or claim >=95% until a fresh side-by-side browser run is completed.

Latest HIU internal browser evidence: code commit `5046b736efc98ddce81347718edcdf5e8920a4a5`; push CI `35572643746` (#66) and PR CI `35572647309` (#67), both SUCCESS. These runs verify HIU behaviour only; they are **not** a side-by-side reference parity measurement.

| # | Journey | HIU status | Weight | Test/evidence |
|---:|---|---|---:|---|
|1|3D human body visible|PASS|6|Browser smoke: model loaded; 48 successful model responses|
|2|Drag to rotate|PASS|5|Desktop 1440x900 screenshot changed after rotate|
|3|Pinch/wheel zoom|PARTIAL|5|Desktop wheel zoom PASS; dedicated pinch/physical tablet acceptance pending|
|4|Pan|PARTIAL|3|Interaction contract exists; dedicated browser pan assertion pending|
|5|Select meridian|PARTIAL|6|14 meridians and ordered point sequences available; 3D path selection unavailable|
|6|Toggle meridian|FAIL|4|No reviewed 3D path to toggle|
|7|Display meridian path|FAIL|7|0 reviewed/published spatial paths|
|8|Display acupoint markers|FAIL|7|361 catalogue records; 0 published BodyParts3D anchors|
|9|Tap point -> info|PARTIAL|5|Catalogue/reference entries are browsable; 3D marker tap unavailable|
|10|Search point code/name|PARTIAL|5|Point-code search PASS; full-name coverage incomplete|
|11|Search -> camera focus|FAIL|6|No published point anchors|
|12|Highlight selected point|FAIL|3|No published point anchors|
|13|Highlight containing meridian|FAIL|3|No reviewed path|
|14|Reset camera|PASS|3|Dedicated browser reset assertion PASS|
|15|Front view|PASS|3|Dedicated front preset browser assertion PASS|
|16|Back view|PASS|3|Dedicated back preset browser assertion PASS|
|17|Left/right view|PARTIAL|3|Side preset tested; independent left/right acceptance remains pending|
|18|Anatomy layers|PARTIAL|5|Skeleton and All presets browser-tested; exhaustive 15-system toggle acceptance pending|
|19|Opacity/isolate|PARTIAL|3|Isolate exists; generic opacity-control acceptance pending|
|20|Load/error states|PARTIAL|2|Normal-load browser smoke has zero console errors; fault-injection journey pending|
|21|Tablet landscape UX|PARTIAL|5|1024x768 touch emulation PASS; physical tablet pending|
|22|Desktop UX|PASS|4|1440x900 desktop browser smoke PASS|
|23|Offline shell/data|PARTIAL|4|Offline app-shell reload PASS; full/selective offline model pack acceptance pending|
|24|Educational simulation|FAIL|4|Safety/data gate blocks unreviewed needle/spatial geometry|

**Weighted parity score: NOT MEASURED.**  
Reason: no fresh side-by-side reference run has been executed, and the high-weight spatial journeys remain blocked by the absence of faculty-reviewed BodyParts3D anchors.

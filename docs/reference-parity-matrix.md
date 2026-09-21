# reference-parity-matrix

Reference: https://kinhlac.online/xem-3d  
Rule: clean-room behavioural reference only. Do not calculate or claim >=95% until a fresh side-by-side browser run is completed.

Latest HIU internal browser evidence: runtime code commit `b06b4acacf3f02037ffbdea5da75ab957a79db15`; push CI `35580796392` (#98) and PR CI `35580801767` (#99), both SUCCESS. Browser smoke artifact `10630243332`. These runs verify HIU behaviour only; they are **not** a side-by-side reference parity measurement.

| # | Journey | HIU status | Weight | Test/evidence |
|---:|---|---|---:|---|
|1|3D human body visible|PASS|6|Browser smoke: 48 successful model responses|
|2|Drag to rotate|PASS|5|Desktop rendered screenshot changed after orbit|
|3|Pinch/wheel zoom|PASS|5|Desktop wheel zoom and tablet pinch emulation both changed rendered screenshots|
|4|Pan|PASS|3|Dedicated desktop pan assertion changed rendered screenshot|
|5|Select meridian|PARTIAL|6|Clean-room Kinh lạc 3D panel exposes 14-meridian selector; full reviewed spatial content is not yet available|
|6|Toggle meridian|PARTIAL|4|Overlay show/hide control exists; reviewed runtime paths remain absent|
|7|Display meridian path|FAIL|7|0 reviewed/published BodyParts3D meridian paths; renderer deliberately refuses to synthesize a path|
|8|Display acupoint markers|PARTIAL|7|Local UNVERIFIED BodyParts3D draft marker is rendered in smoke test; published runtime markers remain 0|
|9|Tap point -> info|PARTIAL|5|3D panel point selection/detail works; published marker-tap corpus is not yet available|
|10|Search point code/name|PARTIAL|5|ST36/ST-36 search PASS; full bilingual naming coverage remains incomplete|
|11|Search -> camera focus|PARTIAL|6|Focus behavior exists for an anchored point; published spatial corpus remains 0|
|12|Highlight selected point|PARTIAL|3|Selected-point detail/marker workflow exists; published corpus remains 0|
|13|Highlight containing meridian|PARTIAL|3|Point selection drives its meridian context; no reviewed path exists to highlight|
|14|Reset camera|PASS|3|Dedicated browser reset assertion PASS|
|15|Front view|PASS|3|Browser preset assertion PASS|
|16|Back view|PASS|3|Browser preset assertion PASS|
|17|Left/right view|PARTIAL|3|Side camera preset and LEFT/RIGHT meridian filter exist; independent physical-device acceptance remains pending|
|18|Anatomy layers|PARTIAL|5|Skeleton/All presets browser-tested; exhaustive 15-system acceptance pending|
|19|Opacity/isolate|PARTIAL|3|Isolate exists; generic opacity-control acceptance pending|
|20|Load/error states|PARTIAL|2|Normal-load smoke has zero console errors; fault-injection pending|
|21|Tablet landscape UX|PARTIAL|5|1024x768 touch orbit + pinch emulation PASS; physical tablet pending|
|22|Desktop UX|PASS|4|1440x900 browser smoke PASS|
|23|Offline shell/data|PARTIAL|4|Offline app-shell reload PASS; full/selective offline model pack acceptance pending|
|24|Educational simulation|FAIL|4|Safety/data gate blocks unreviewed needle/spatial geometry|

**Weighted parity score: NOT MEASURED.**  
Reason: no fresh side-by-side reference run has been executed and the high-weight published spatial journeys remain blocked by the absence of faculty-reviewed BodyParts3D anchors/paths.

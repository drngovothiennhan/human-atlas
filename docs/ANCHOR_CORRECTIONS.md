# Textbook anchor corrections

Render-layer corrections in `scripts/anchor-corrections.mjs`, applied by `build-furia-schematic.mjs`
before anchors are resolved. Vendor data is untouched; all anchors remain UNVERIFIED.

## Audit method
Trunk anchors were compared with textbook cun rules using the fitted trunk ruler (pubis 0, umbilicus 5, xiphoid 13, notch 22 cun).
- Abdomen (CV-3…CV-15, ST-19…30, KI-11…21, SP-15): within 0.5 cun of the textbook — no change.
- Chest: CV-16…CV-21, ST-13…18, KI-22…27, SP-17…20, LU-1/2, PC-1 and CV-22 sat ~1.4–1.8 cun too low, and CV-16 lay below CV-15.

## Fix
The sternum is 9 cun from the suprasternal notch (CV-22) to the xiphisternal joint (CV-16); CV-17…CV-21 follow in 1.6-cun steps
(CV-21 is 1 cun below CV-22). Lateral points on the same rib level share the height (ST 4 cun, KI 2 cun, SP 6 cun, LU-1/2, PC-1). Levels are stored as cun above the xiphoid landmark.

## Not yet audited
Limbs, back (BL, GV vertebral levels), head and face points still use vendor anchors. Next pass: limb cun rules (upper arm 9, forearm 12, thigh 19, leg 16) and vertebral levels.

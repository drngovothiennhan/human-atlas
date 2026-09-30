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

## Pass 2 (limbs, back, head)
- Forearm (LU, PC, HT, TE, LI, SI), shank (SP, KI, ST, BL, GB, LR) cun rules, BL 1.5/3 cun lateral offsets, BL vertebral levels and GV vertebral levels all agree with the textbook within ~1 cun — no change.
- Occiput: GV-15/16, BL-10, GB-20 sat ~6 cm too low and GV-17, BL-9, GB-19 ~6 cm too high (GV-16→17 was 5 cun, GB-19→20 was 20 cm). Re-levelled on the skin mesh (inion z≈1.62 m; GV-16 1.5 cun below).
- ST-41 was ~6.5 cm above the ankle crease; re-anchored at the anterior ankle crease.

## Not yet audited
Upper arm, thigh, face and hand/foot fine points still use vendor anchors (no gross errors found by ordering/monotonic checks).

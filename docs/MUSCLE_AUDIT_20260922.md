# Source inventory and corrections

Baseline atlas: 2,234 parts, 402 labelled muscular. Existing pinned source asset contains 1,388 mesh nodes. Existing head allowlist: 78 meshes, 39 bilateral pairs; these overlap some base structures and are not 78 new anatomical structures.

Corrected runtime grouping, preserving IDs and geometry: FJ1409/FJ1409M (fibularis brevis), FJ1410/FJ1410M (fibularis longus), FJ1411/FJ1411M (fibularis tertius), FJ1439/FJ1439M (tibialis anterior), FJ1440/FJ1440M (tibialis posterior). Source JSON misclassified them as skeletal. Corrected muscular total: 412.

Added exact existing source nodes absent by name from base inventory: Dorsal interossei muscles of foot.l/.r, Extensor digitorum brevis.l/.r, Longus colli muscle.r. The base contains left longus colli subdivisions, which are not duplicated.

Bilateral SCM, platysma, scalenes, gastrocnemius, soleus, plantaris and long toe flexors/extensors are already present. No geometry is invented to cover exposed bone.

Supplement source: Nurkan1/Anatria-3D@949ac80cc9763539afc48e60b5246132f00468db, public/anatomy/muscular_male.glb, Z-Anatomy/BodyParts3D adaptation, CC BY-SA 4.0 per recorded provenance. Preserve separate mesh attribution.

All source transforms are retained. Name/inventory coverage is verified; clinical completeness, overlap and visual alignment require rendered review. Cloud browser reports WebGL disabled; CI renderer evidence must be reported separately from physical-device QA.

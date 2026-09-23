export const SKELETAL_SOURCE = {
  repository:'Nurkan1/Anatria-3D',
  commit:'949ac80cc9763539afc48e60b5246132f00468db',
  runtimeAsset:'/models/z-skeletal-male.glb',
  runtimeManifest:'/models/z-skeletal-manifest.json',
  license:'CC BY-SA 4.0',
  expectedMeshCount:335,
  scope:'Pinned male skeletal meshes used as an aligned reference layer; source world transforms are preserved without per-bone manual offsets.'
} as const;

export const ARTICULAR_SOURCE = {
  repository:'Nurkan1/Anatria-3D',
  commit:'949ac80cc9763539afc48e60b5246132f00468db',
  runtimeAsset:'/models/z-articular-male.glb',
  runtimeManifest:'/models/z-articular-manifest.json',
  license:'CC BY-SA 4.0',
  expectedMeshCount:413,
  scope:'Pinned articular-system meshes including joint capsules, discs, menisci and ligaments where present in the source hierarchy.'
} as const;

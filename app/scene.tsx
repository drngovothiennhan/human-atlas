import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {SYSTEMS,DEFAULT_LAYER_OPACITY,isMeridianLandmarkMuscle,isPrimarySurfacePart,PRIMARY_SURFACE_CONCEPT_ID,type Atlas,type SceneState} from './anatomy';
import {BODY_CANONICAL_COORDINATE_SYSTEM,type SurfaceCapture} from '../src/acupoints/registration/coordinate-system';
import type {MeridianFocusTarget,MeridianOverlayState} from './meridian-overlay';
import {ARTICULAR_SOURCE,SKELETAL_SOURCE} from './reference-anatomy';
import {detectRenderCapabilities,QUALITY_CONFIG,selectInitialProfile,stepAdaptiveProfile,type RenderQualityMode,type RenderQualityProfile} from './render-quality';
interface Props {atlas:Atlas;state:SceneState;renderQuality:RenderQualityMode;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;registrationMode?:boolean;onRegisterSurface?:(capture:SurfaceCapture)=>void;meridianOverlay?:MeridianOverlayState;focusAcupoint?:MeridianFocusTarget|null;onSelectAcupoint?:(pointCode:string)=>void}
const assetUrl=(url:string)=>url.startsWith('/')?import.meta.env.BASE_URL+url.slice(1):url;
export default function AnatomyScene({atlas,state,renderQuality,onSelect,onProgress,onError,registrationMode=false,onRegisterSurface,meridianOverlay,focusAcupoint,onSelectAcupoint}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),quality=useRef(renderQuality),select=useRef(onSelect),registration=useRef(registrationMode),registerSurface=useRef(onRegisterSurface),overlay=useRef(meridianOverlay),focus=useRef(focusAcupoint),selectAcupoint=useRef(onSelectAcupoint);
 latest.current=state;quality.current=renderQuality;select.current=onSelect;registration.current=registrationMode;registerSurface.current=onRegisterSurface;overlay.current=meridianOverlay;focus.current=focusAcupoint;selectAcupoint.current=onSelectAcupoint;
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',lastRequestedChunkKey='',amount=0,renderCount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController(),capabilities=detectRenderCapabilities();
  let qualityProfile:RenderQualityProfile=selectInitialProfile(renderQuality,capabilities),lastQualityMode:RenderQualityMode=renderQuality,qualityConfig=QUALITY_CONFIG[qualityProfile];
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:qualityConfig.antialias,alpha:false,powerPreference:'high-performance'});}catch{onError('Không khởi động được mô hình 3D. Vui lòng dùng trình duyệt có hỗ trợ WebGL.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,qualityConfig.pixelRatioCap));renderer.setClearColor('#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=qualityConfig.shadows;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.style.touchAction='none';renderer.domElement.style.userSelect='none';el.appendChild(renderer.domElement);
  renderer.domElement.dataset.renderQualityMode=renderQuality;renderer.domElement.dataset.renderQualityProfile=qualityProfile;renderer.domElement.dataset.renderPixelRatio=renderer.getPixelRatio().toFixed(2);renderer.domElement.dataset.renderAntialias=String(renderer.getContext().getContextAttributes()?.antialias??false);renderer.domElement.dataset.renderShadows=String(qualityConfig.shadows);renderer.domElement.dataset.renderTubeSegments=String(qualityConfig.tubeRadialSegments);renderer.domElement.dataset.renderFlowParticlesPerPath=String(qualityConfig.flowParticlesPerPath);renderer.domElement.dataset.renderSuspended='false';renderer.domElement.dataset.renderCount='0';renderer.domElement.dataset.renderAdaptations='0';renderer.domElement.dataset.renderCapabilities=JSON.stringify({webgl:capabilities.webgl,webgl2:capabilities.webgl2,maxTextureSize:capabilities.maxTextureSize,hardwareConcurrency:capabilities.hardwareConcurrency,deviceMemoryGb:capabilities.deviceMemoryGb,devicePixelRatio:capabilities.devicePixelRatio,viewportPixels:capabilities.viewportPixels});
  renderer.domElement.setAttribute('aria-label','Giải phẫu tương tác: kéo để xoay, chụm hoặc cuộn để thu phóng, chạm để xem cấu trúc.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=.07;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.zoomToCursor=true;renderer.domElement.dataset.cameraMotion='idle';renderer.domElement.dataset.cameraMotionSeq='0';
  let cameraMotionSeq=0;
  type CameraMotion={startedAt:number;duration:number;fromPosition:T.Vector3;fromTarget:T.Vector3;toPosition:T.Vector3;toTarget:T.Vector3};
  let cameraMotion:CameraMotion|null=null;
  const startCameraMotion=(toTarget:T.Vector3,toPosition:T.Vector3,duration=.92)=>{
   cameraMotion={startedAt:performance.now(),duration,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition:toPosition.clone(),toTarget:toTarget.clone()};
   cameraMotionSeq++;renderer.domElement.dataset.cameraMotionSeq=String(cameraMotionSeq);renderer.domElement.dataset.cameraMotion='active';dirty=true;
  };
  controls.addEventListener('start',()=>{if(cameraMotion){cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';dirty=true;}});
  controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);key.castShadow=qualityConfig.shadows;key.shadow.mapSize.set(1024,1024);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;ground.receiveShadow=qualityConfig.shadows;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0xeeeeec,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x8c969f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0xa4aeb8,transparent:true,opacity:.16,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x64748b,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const registrationMarker=new T.Mesh(new T.SphereGeometry(.009,qualityConfig.markerSegments,Math.max(8,qualityConfig.markerSegments-4)),new T.MeshBasicMaterial({color:0x0f766e,depthTest:false}));registrationMarker.visible=false;registrationMarker.renderOrder=30;scene.add(registrationMarker);
  const meridianGroup=new T.Group();meridianGroup.name='hiu-meridian-overlay';scene.add(meridianGroup);
  const jointGroup=new T.Group();jointGroup.name='hiu-articular';jointGroup.visible=false;scene.add(jointGroup);
  const skeletalReferenceGroup=new T.Group();skeletalReferenceGroup.name='hiu-skeletal-reference';skeletalReferenceGroup.visible=false;scene.add(skeletalReferenceGroup);
  const jointMaterial=new T.MeshStandardMaterial({color:0xc6b98f,metalness:.02,roughness:.68,transparent:false,opacity:1,depthWrite:true,side:T.DoubleSide});
  const skeletalReferenceMaterial=new T.MeshStandardMaterial({color:0xe2d9ba,metalness:.02,roughness:.7,transparent:false,opacity:1,depthWrite:true,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-.2,polygonOffsetUnits:-.2});
  type RuntimeNodeManifest={meshCount:number;nodes:string[]};
  let jointStatus:'idle'|'loading'|'ready'|'error'='idle',skeletalStatus:'idle'|'loading'|'ready'|'error'='idle';
  renderer.domElement.dataset.articularStatus='idle';
  renderer.domElement.dataset.articularExpected=String(ARTICULAR_SOURCE.expectedMeshCount);
  renderer.domElement.dataset.skeletalReferenceStatus='idle';renderer.domElement.dataset.skeletalReferenceExpected=String(SKELETAL_SOURCE.expectedMeshCount);renderer.domElement.dataset.anatomyAlignmentPolicy='source-world-transform';renderer.domElement.dataset.anatomyOcclusionPolicy='opaque-depth-tested';renderer.domElement.dataset.musclePolicy='meridian-landmarks';renderer.domElement.dataset.muscleLandmarkCount=String(atlas.parts.filter(p=>p.system==='muscular'&&isMeridianLandmarkMuscle(p.name)).length);renderer.domElement.dataset.anatomyProfile='meridian-first';renderer.domElement.dataset.surfacePrimaryStructure=PRIMARY_SURFACE_CONCEPT_ID;renderer.domElement.dataset.surfaceStructureCount=String(atlas.parts.filter(p=>p.system==='integumentary'&&isPrimarySurfacePart(p)).length);renderer.domElement.dataset.surfaceFacePolicy='front-side-only';renderer.domElement.dataset.anatomyLoadPolicy='visible-chunks-on-demand';renderer.domElement.dataset.anatomyTotalChunks=String(atlas.chunks.length);
  const clearGroup=(group:T.Group)=>{while(group.children.length)group.remove(group.children[0]);};
  const bakeStaticGeometry=(mesh:T.Mesh)=>{
   const baked=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
   baked.applyMatrix4(mesh.matrixWorld);
   Object.keys(baked.attributes).forEach(key=>{if(key!=='position'&&key!=='normal')baked.deleteAttribute(key);});
   if(!baked.getAttribute('normal'))baked.computeVertexNormals();
   baked.clearGroups();return baked;
  };
  const addMergedMesh=(group:T.Group,parts:T.BufferGeometry[],material:T.Material,name:string,renderOrder:number)=>{
   const merged=mergeGeometries(parts,false);parts.forEach(part=>part.dispose());if(!merged)throw new Error('Không thể gộp batch giải phẫu: '+name);
   merged.computeBoundingBox();merged.computeBoundingSphere();geometries.push(merged);
   const mesh=new T.Mesh(merged,material);mesh.name=name;mesh.frustumCulled=false;mesh.castShadow=qualityConfig.shadows;mesh.renderOrder=renderOrder;group.add(mesh);return mesh;
  };
  const loadManifest=async(url:string,expected:number)=>{
   const response=await fetch(assetUrl(url),{signal:abort.signal});if(!response.ok)throw new Error('Không tải được manifest giải phẫu: '+response.status);
   const manifest=await response.json() as RuntimeNodeManifest;
   if(manifest.meshCount!==expected||!Array.isArray(manifest.nodes)||manifest.nodes.length!==expected)throw new Error('Manifest giải phẫu không khớp: '+manifest.meshCount+'/'+expected);
   return manifest;
  };
  const ensureJoints=()=>{
   if(jointStatus==='loading'||jointStatus==='ready')return;
   jointStatus='loading';renderer.domElement.dataset.articularStatus='loading';dirty=true;
   const draco=new DRACOLoader();draco.setDecoderPath(assetUrl('/draco/'));
   const loader=new GLTFLoader();loader.setDRACOLoader(draco);
   Promise.all([loadManifest(ARTICULAR_SOURCE.runtimeManifest,ARTICULAR_SOURCE.expectedMeshCount),loader.loadAsync(assetUrl(ARTICULAR_SOURCE.runtimeAsset))]).then(([manifest,gltf])=>{
    if(disposed)return;
    gltf.scene.updateMatrixWorld(true);clearGroup(jointGroup);const allowed=new Set(manifest.nodes.map(name=>T.PropertyBinding.sanitizeNodeName(name))),box=new T.Box3(),parts:T.BufferGeometry[]=[];let count=0;
    gltf.scene.traverse(object=>{
     if(!(object instanceof T.Mesh))return;const clean=T.PropertyBinding.sanitizeNodeName(object.name);if(!allowed.has(clean))return;
     if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();const worldBox=object.geometry.boundingBox?.clone().applyMatrix4(object.matrixWorld);if(worldBox)box.union(worldBox);
     parts.push(bakeStaticGeometry(object));count++;
    });
    if(count!==ARTICULAR_SOURCE.expectedMeshCount)throw new Error('Articular source mismatch: '+count+'/'+ARTICULAR_SOURCE.expectedMeshCount);
    addMergedMesh(jointGroup,parts,jointMaterial,'hiu-articular-batch',11);renderer.domElement.dataset.articularDrawCalls='1';
    jointStatus='ready';lastState=null;renderer.domElement.dataset.articularStatus='ready';renderer.domElement.dataset.articularCount=String(count);renderer.domElement.dataset.articularBounds=[box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z].map(v=>v.toFixed(4)).join(',');
    const s=latest.current;jointGroup.visible=s.visible.includes('articular')&&!s.isolate&&s.explode<.01;dirty=true;
   }).catch(error=>{
    if(disposed)return;jointStatus='error';clearGroup(jointGroup);renderer.domElement.dataset.articularStatus='error';renderer.domElement.dataset.articularError=error instanceof Error?error.message:'load failed';console.error('[articular]',error);dirty=true;
   }).finally(()=>draco.dispose());
  };
  const ensureSkeletalReference=()=>{
   if(skeletalStatus==='loading'||skeletalStatus==='ready')return;
   skeletalStatus='loading';renderer.domElement.dataset.skeletalReferenceStatus='loading';dirty=true;
   const draco=new DRACOLoader();draco.setDecoderPath(assetUrl('/draco/'));const loader=new GLTFLoader();loader.setDRACOLoader(draco);
   Promise.all([loadManifest(SKELETAL_SOURCE.runtimeManifest,SKELETAL_SOURCE.expectedMeshCount),loader.loadAsync(assetUrl(SKELETAL_SOURCE.runtimeAsset))]).then(([manifest,gltf])=>{
    if(disposed)return;gltf.scene.updateMatrixWorld(true);clearGroup(skeletalReferenceGroup);
    const allowed=new Set(manifest.nodes.map(name=>T.PropertyBinding.sanitizeNodeName(name))),box=new T.Box3(),parts:T.BufferGeometry[]=[];let count=0;
    gltf.scene.traverse(object=>{if(!(object instanceof T.Mesh))return;const clean=T.PropertyBinding.sanitizeNodeName(object.name);if(!allowed.has(clean))return;if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();const worldBox=object.geometry.boundingBox?.clone().applyMatrix4(object.matrixWorld);if(worldBox)box.union(worldBox);parts.push(bakeStaticGeometry(object));count++;});
    if(count!==SKELETAL_SOURCE.expectedMeshCount)throw new Error('Skeletal source mismatch: '+count+'/'+SKELETAL_SOURCE.expectedMeshCount);
    addMergedMesh(skeletalReferenceGroup,parts,skeletalReferenceMaterial,'hiu-skeletal-batch',10);renderer.domElement.dataset.skeletalReferenceDrawCalls='1';
    skeletalStatus='ready';lastState=null;renderer.domElement.dataset.skeletalReferenceStatus='ready';renderer.domElement.dataset.skeletalReferenceCount=String(count);renderer.domElement.dataset.skeletalReferenceBounds=[box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z].map(v=>v.toFixed(4)).join(',');
    const s=latest.current;skeletalReferenceGroup.visible=s.visible.includes('skeletal')&&!s.isolate&&s.explode<.01;dirty=true;
   }).catch(error=>{if(disposed)return;skeletalStatus='error';clearGroup(skeletalReferenceGroup);renderer.domElement.dataset.skeletalReferenceStatus='error';renderer.domElement.dataset.skeletalReferenceError=error instanceof Error?error.message:'load failed';console.error('[skeletal-reference]',error);dirty=true;}).finally(()=>draco.dispose());
  };
  const reduceMeridianMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  type MeridianFlowParticle={mesh:T.Mesh;curve:T.CatmullRomCurve3;offset:number;speed:number};
  let meridianMarkers:T.Mesh[]=[],meridianPulseMarkers:T.Mesh[]=[],meridianFlowParticles:MeridianFlowParticle[]=[],needleMesh:T.Mesh|null=null,needleHandParts:T.Mesh[]=[];
  const meridianColors:Record<string,number>={LU:0x1d4ed8,LI:0xc2410c,ST:0x854d0e,SP:0x84cc16,HT:0xb91c1c,SI:0x0369a1,BL:0x334155,KI:0x0f766e,PC:0xbe185d,TE:0x0e7490,GB:0x4d7c0f,LR:0x15803d,CV:0x6d28d9,GV:0x991b1b};
  const MERIDIAN_LINE_EDGE_RADIUS=.00185,MERIDIAN_LINE_CORE_RADIUS=.00115;
  const MERIDIAN_LINE_EDGE_OPACITY=.28,MERIDIAN_LINE_CORE_OPACITY=.86;
  const MERIDIAN_FLOW_WORLD_SPEED=.075;
  const ACUPOINT_RADIUS_SCHEMATIC=.0062,ACUPOINT_RADIUS_LOCAL=.0067,ACUPOINT_RADIUS_PUBLISHED=.0072,ACUPOINT_RADIUS_SELECTED=.0082;
  const disposeOverlay=()=>{
   meridianMarkers=[];meridianPulseMarkers=[];meridianFlowParticles=[];needleMesh=null;needleHandParts=[];
   while(meridianGroup.children.length){
    const child=meridianGroup.children.pop()!;
    const geometry=(child as T.Mesh).geometry as T.BufferGeometry|undefined;geometry?.dispose();
    const material=(child as T.Mesh).material as T.Material|T.Material[]|undefined;
    if(Array.isArray(material))material.forEach(item=>item.dispose());else material?.dispose();
   }
  };
  const rebuildOverlay=(value:MeridianOverlayState|undefined)=>{
   renderer.domElement.dataset.meridianId=value?.enabled?(value.meridianId??''):'';
   renderer.domElement.dataset.meridianSelectedPoint=value?.selectedPointCode??'';
   renderer.domElement.dataset.meridianLineOuterRadius=String(MERIDIAN_LINE_EDGE_RADIUS);
   renderer.domElement.dataset.meridianLineCoreRadius=String(MERIDIAN_LINE_CORE_RADIUS);
   renderer.domElement.dataset.meridianLineCoreOpacity=String(MERIDIAN_LINE_CORE_OPACITY);renderer.domElement.dataset.meridianFlowDirection='source-order';renderer.domElement.dataset.meridianFlowWorldSpeed=String(MERIDIAN_FLOW_WORLD_SPEED);
   renderer.domElement.dataset.meridianLineTransparent='true';renderer.domElement.dataset.meridianDepthOcclusion='anatomy-surface';
   renderer.domElement.dataset.meridianPointMinRadius=String(ACUPOINT_RADIUS_SCHEMATIC);
   disposeOverlay();renderer.domElement.dataset.acupunctureSimulation='off';renderer.domElement.dataset.acupunctureOperatorRig='off';renderer.domElement.dataset.acupunctureHandPartCount='0';renderer.domElement.dataset.meridianAnchors='0';renderer.domElement.dataset.meridianPaths='0';renderer.domElement.dataset.meridianSchematicAnchors='0';renderer.domElement.dataset.meridianSchematicPaths='0';renderer.domElement.dataset.meridianPulseMarkers='0';renderer.domElement.dataset.meridianSelectedMarkers='0';renderer.domElement.dataset.meridianFlowParticles='0';renderer.domElement.dataset.meridianEffect=value?.enabled?(reduceMeridianMotion?'reduced':'flow'):'off';if(!value?.enabled)return;
   const fallbackColor=0x0f766e;let trustedAnchors=0,schematicAnchors=0,schematicPaths=0,trustedPaths=0,selectedMarkers=0;
   for(const anchor of value.effects?.acupoints===false?[]:value.anchors){
    if(![anchor.x,anchor.y,anchor.z].every(Number.isFinite))continue;
    const schematic=anchor.sourceKind==='LICENSED_SCHEMATIC',selected=value.selectedPointCode===anchor.pointCode;
    const color=meridianColors[anchor.meridianId]??fallbackColor;
    const baseOpacity=selected?1:anchor.sourceKind==='PUBLISHED'?.98:schematic?.94:.96;
    const material=new T.MeshBasicMaterial({color,transparent:true,opacity:baseOpacity,depthTest:true,depthWrite:false});
    const radius=selected?ACUPOINT_RADIUS_SELECTED:anchor.sourceKind==='PUBLISHED'?ACUPOINT_RADIUS_PUBLISHED:schematic?ACUPOINT_RADIUS_SCHEMATIC:ACUPOINT_RADIUS_LOCAL;
    const marker=new T.Mesh(new T.SphereGeometry(radius,qualityConfig.markerSegments,Math.max(8,qualityConfig.markerSegments-4)),material);
    marker.position.set(anchor.x,anchor.y,anchor.z);marker.renderOrder=selected?26:24;marker.userData.pointCode=anchor.pointCode;marker.userData.side=anchor.side;marker.userData.verificationStatus=anchor.verificationStatus;marker.userData.sourceKind=anchor.sourceKind;marker.userData.baseOpacity=baseOpacity;marker.userData.selected=selected;
    meridianGroup.add(marker);meridianMarkers.push(marker);meridianPulseMarkers.push(marker);if(selected)selectedMarkers++;if(schematic)schematicAnchors++;else trustedAnchors++;
   }
   renderer.domElement.dataset.meridianAnchors=String(trustedAnchors);renderer.domElement.dataset.meridianSchematicAnchors=String(schematicAnchors);
   for(const path of value.effects?.meridians===false?[]:value.paths){
    if(path.points.length<2)continue;
    const schematic=path.sourceKind==='LICENSED_SCHEMATIC'&&path.verificationStatus==='UNVERIFIED';
    const reviewed=['FACULTY_REVIEWED','PUBLISHED'].includes(path.verificationStatus);
    if(!schematic&&!reviewed)continue;
    const color=meridianColors[path.meridianId]??fallbackColor,lineColor=new T.Color(color).offsetHSL(0,.04,-.12);
    const points=path.points.map(point=>new T.Vector3(point[0],point[1],point[2]));
    const curve=new T.CatmullRomCurve3(points,false,'centripetal');
    const segments=Math.max(36,points.length*18);
    // Thin semi-transparent channels stay legible without masking anatomy.
    const edge=new T.Mesh(new T.TubeGeometry(curve,segments,MERIDIAN_LINE_EDGE_RADIUS,qualityConfig.tubeRadialSegments,false),new T.MeshBasicMaterial({color:0x17212b,transparent:true,opacity:MERIDIAN_LINE_EDGE_OPACITY,depthTest:true,depthWrite:false}));
    edge.renderOrder=21;meridianGroup.add(edge);
    const tube=new T.Mesh(new T.TubeGeometry(curve,segments,MERIDIAN_LINE_CORE_RADIUS,qualityConfig.tubeRadialSegments,false),new T.MeshBasicMaterial({color:lineColor,transparent:true,opacity:MERIDIAN_LINE_CORE_OPACITY,depthTest:true,depthWrite:false}));
    tube.renderOrder=22;meridianGroup.add(tube);
    // Several moving lights make motion visible along long channels, not only at one end.
    for(let i=0;i<qualityConfig.flowParticlesPerPath;i++){
     const particle=new T.Mesh(new T.SphereGeometry(.0029,Math.max(8,qualityConfig.markerSegments-2),8),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthTest:true,depthWrite:false}));
     const offset=i/qualityConfig.flowParticlesPerPath,length=Math.max(.01,curve.getLength()),speed=T.MathUtils.clamp(MERIDIAN_FLOW_WORLD_SPEED/length,.025,.18);particle.position.copy(curve.getPointAt(offset));particle.renderOrder=25;
     meridianGroup.add(particle);meridianFlowParticles.push({mesh:particle,curve,offset,speed});
    }
    if(schematic)schematicPaths++;else trustedPaths++;
   }
   const needle=value.needleSimulation;
   if(needle&&[needle.x,needle.y,needle.z,needle.angleDegrees,needle.visualLengthMm].every(Number.isFinite)){
    const surface=new T.Vector3(needle.x,needle.y,needle.z);
    const inward=new T.Vector3(-needle.x,0,-needle.z);
    if(inward.lengthSq()<1e-8)inward.set(0,0,1);
    inward.normalize();const needleNormal=inward.clone();
    const tangent=new T.Vector3(0,1,0);
    tangent.addScaledVector(inward,-tangent.dot(inward)).normalize();
    const angle=T.MathUtils.degToRad(T.MathUtils.clamp(needle.angleDegrees,5,90));
    const entryDirection=needleNormal.clone().multiplyScalar(Math.sin(angle)).add(tangent.clone().multiplyScalar(Math.cos(angle))).normalize();
    const outward=entryDirection.clone().negate();
    const length=T.MathUtils.clamp(needle.visualLengthMm,8,120)/1000;
    const start=surface.clone();
    const end=surface.clone().addScaledVector(outward,length);
    const axis=end.clone().sub(start),needleObject=new T.Mesh(new T.CylinderGeometry(.0012,.0012,axis.length(),8),new T.MeshBasicMaterial({color:0xc87937,depthTest:true,depthWrite:false}));
    needleObject.position.copy(start).add(end).multiplyScalar(.5);
    needleObject.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.clone().normalize());
    needleObject.renderOrder=27;needleObject.userData.acupunctureSimulation=needle.pointCode;needleObject.userData.needleStart=start;needleObject.userData.needleDirection=outward.clone();needleObject.userData.needleLength=length;needleObject.userData.needleBaseQuaternion=needleObject.quaternion.clone();needleObject.userData.needleAction=needle.action;meridianGroup.add(needleObject);needleMesh=needleObject;
    const gripDirection=tangent.clone().addScaledVector(outward,-tangent.dot(outward)).normalize();
    const handle=new T.Mesh(new T.CylinderGeometry(.00055,.00055,.012,6),new T.MeshBasicMaterial({color:0x4b5563,depthTest:true,depthWrite:false}));handle.position.copy(end);handle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),gripDirection);handle.renderOrder=28;meridianGroup.add(handle);needleObject.userData.needleHandle=handle;needleObject.userData.needleGripDirection=gripDirection;
    const handSkin=new T.MeshStandardMaterial({color:0xd2a08b,roughness:.78,depthWrite:false});
    const handAdd=(geometry:T.BufferGeometry,position:T.Vector3,quaternion?:T.Quaternion)=>{
     const part=new T.Mesh(geometry,handSkin);part.position.copy(position);if(quaternion)part.quaternion.copy(quaternion);part.renderOrder=29;part.userData.needleHandRest=position.clone();meridianGroup.add(part);needleHandParts.push(part);return part;
    };
    const orientAlong=(axis:T.Vector3)=>new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis.clone().normalize());
    const sideAxis=new T.Vector3().crossVectors(outward,tangent).normalize();
    if(sideAxis.lengthSq()<1e-8)sideAxis.set(1,0,0);
    const grip=surface.clone().addScaledVector(outward,length*.72);
    const palmCenter=grip.clone().addScaledVector(tangent,.027);
    const handFrame=new T.Matrix4().makeBasis(sideAxis,outward,tangent),palm=handAdd(new T.SphereGeometry(.04,16,10),palmCenter,new T.Quaternion().setFromRotationMatrix(handFrame));
    palm.scale.set(.78,.34,1.05);
    const forearmCenter=grip.clone().addScaledVector(tangent,.137);
    handAdd(new T.CapsuleGeometry(.021,.12,4,8),forearmCenter,orientAlong(tangent));
    const addFingerSegment=(from:T.Vector3,to:T.Vector3,radius:number)=>{
     const axis=to.clone().sub(from),distance=axis.length();
     handAdd(new T.CapsuleGeometry(radius,Math.max(.001,distance-radius*2),4,7),from.clone().add(to).multiplyScalar(.5),orientAlong(axis));
    };
    const indexBase=grip.clone().addScaledVector(sideAxis,.029).addScaledVector(tangent,.005);
    const indexMid=grip.clone().addScaledVector(sideAxis,.014).addScaledVector(tangent,.002);
    const indexTip=grip.clone().addScaledVector(sideAxis,.002);
    addFingerSegment(indexBase,indexMid,.007);
    addFingerSegment(indexMid,indexTip,.0065);
    const thumbBase=grip.clone().addScaledVector(sideAxis,-.03).addScaledVector(tangent,-.008);
    const thumbMid=grip.clone().addScaledVector(sideAxis,-.015).addScaledVector(tangent,-.003);
    const thumbTip=grip.clone().addScaledVector(sideAxis,-.002);
    addFingerSegment(thumbBase,thumbMid,.008);
    addFingerSegment(thumbMid,thumbTip,.0065);
    for(let finger=0;finger<3;finger++){
     const offset=(finger-1)*.015;
     const base=grip.clone().addScaledVector(sideAxis,offset).addScaledVector(tangent,.045);
     const bend=grip.clone().addScaledVector(sideAxis,offset*1.25).addScaledVector(tangent,.029);
     const tip=grip.clone().addScaledVector(sideAxis,offset*1.1).addScaledVector(tangent,.015);
     addFingerSegment(base,bend,.0065);addFingerSegment(bend,tip,.006);
    }
    renderer.domElement.dataset.acupunctureSimulation=needle.pointCode;renderer.domElement.dataset.acupunctureOperatorRig='stylized-hand-arm';renderer.domElement.dataset.acupunctureHandPartCount=String(needleHandParts.length);
   }else {renderer.domElement.dataset.acupunctureSimulation='off';renderer.domElement.dataset.acupunctureOperatorRig='off';}
   renderer.domElement.dataset.meridianPaths=String(trustedPaths);renderer.domElement.dataset.meridianSchematicPaths=String(schematicPaths);renderer.domElement.dataset.meridianPulseMarkers=String(meridianPulseMarkers.length);renderer.domElement.dataset.meridianSelectedMarkers=String(selectedMarkers);renderer.domElement.dataset.meridianFlowParticles=String(meridianFlowParticles.length);
  };
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const materialFor=(system:string)=>{
   const surface=system==='integumentary';
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:surface?T.FrontSide:T.DoubleSide,transparent:false,opacity:1,depthWrite:true});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  const loadedChunks=new Set<number>(),loadingChunks=new Map<number,Promise<void>>();
  const chunksForState=(s:SceneState)=>{
   const visible=new Set(s.visible),selection=new Set(s.selected),chunks=new Set<number>();
   atlas.parts.forEach(p=>{
    const selected=selection.has(p.id);
    if(!selected&&!isPrimarySurfacePart(p))return;
    if(p.system==='muscular'&&!selected&&!isMeridianLandmarkMuscle(p.name))return;
    if(selected||visible.has(p.system))chunks.add(p.chunk);
   });
   return [...chunks].sort((a,b)=>a-b);
  };
  const updateChunkMetrics=()=>{
   renderer.domElement.dataset.anatomyLoadedChunks=String(loadedChunks.size);
   renderer.domElement.dataset.anatomyLoadingChunks=String(loadingChunks.size);
  };
  const loadChunk=(ci:number)=>{
   if(loadedChunks.has(ci))return Promise.resolve();
   const existing=loadingChunks.get(ci);if(existing)return existing;
   const task=(async()=>{
    const timeout=new AbortController();const timer=setTimeout(()=>timeout.abort(),45000);
    let buffer:ArrayBuffer;try{const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(assetUrl(compressed?chunk.gzip!:chunk.url),{signal:AbortSignal.any([abort.signal,timeout.signal])});buffer=await decodeModelResponse(response,chunk.bytes,compressed);}finally{clearTimeout(timer);}if(disposed)return;
    const groups=new Map<string,T.BufferGeometry[]>();
    atlas.parts.forEach((p,i)=>{
     if(p.chunk!==ci)return;
     const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
     // GPU normalized signed-short normals keep the complete atlas compact in memory.
     g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
     g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
     g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
     const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
    });
    groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Không ghép được hình học giải phẫu.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.name='hiu-atlas-'+system+'-chunk-'+ci;mesh.frustumCulled=false;mesh.castShadow=qualityConfig.shadows;scene.add(mesh);});
    loadedChunks.add(ci);lastState=null;dirty=true;
   })();
   loadingChunks.set(ci,task);updateChunkMetrics();
   return task.finally(()=>{loadingChunks.delete(ci);updateChunkMetrics();});
  };
  const ensureStateChunks=(s:SceneState)=>{
   const requested=chunksForState(s);renderer.domElement.dataset.anatomyRequestedChunks=requested.join(',');
   return Promise.all(requested.map(loadChunk)).then(()=>undefined);
  };
  (async()=>{try{
   const initialChunks=chunksForState(latest.current);
   if(!initialChunks.length)throw new Error('Không tìm thấy lớp bề mặt ban đầu.');
   renderer.domElement.dataset.initialAnatomyChunkCount=String(initialChunks.length);onProgress(0);
   let completed=0;
   await Promise.all(initialChunks.map(async ci=>{await loadChunk(ci);completed++;onProgress(Math.round(completed/initialChunks.length*100));}));
   if(!disposed){ready=true;onProgress(100);dirty=true;}
  }catch(e){if(!disposed)onError(e instanceof Error&&e.name==='AbortError'?'Tải mô hình quá thời gian. Vui lòng kiểm tra kết nối và tải lại.':e instanceof Error?e.message:'Không tải được mô hình giải phẫu.');}})();
  const fit=(view:string,extent=0,animated=false)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   const target=new T.Vector3(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0),position=target.clone().addScaledVector(direction,distance);
   if(animated)startCameraMotion(target,position);else{cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';controls.target.copy(target);camera.position.copy(position);controls.update();dirty=true;}
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,qualityConfig.pixelRatioCap));renderer.domElement.dataset.renderPixelRatio=renderer.getPixelRatio().toFixed(2);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const capturePointer=(e:PointerEvent)=>{try{if(!renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.setPointerCapture(e.pointerId);}catch{}};
  const releasePointer=(e:PointerEvent)=>{try{if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);}catch{}};
  const down=(e:PointerEvent)=>{hover.hidden=true;capturePointer(e);tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(registration.current){hover.hidden=true;renderer.domElement.style.cursor='crosshair';return;}if(e.buttons||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;if(meridianMarkers.length){pointer.set(x/rect.width*2-1,-y/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const markerHit=raycaster.intersectObjects(meridianMarkers,false)[0],pointCode=markerHit?.object?.userData?.pointCode;if(typeof pointCode==='string'&&pointCode){hover.hidden=false;hover.textContent=pointCode;hover.dataset.kind='acupoint';hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-150))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;renderer.domElement.style.cursor='pointer';return;}}delete hover.dataset.kind;if(amount<.5){hover.hidden=true;renderer.domElement.style.cursor='grab';return;}const index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>{tap.cancel(e.pointerId);releasePointer(e);};
  const makeSurfaceCapture=(partIndex:number,mesh:T.Mesh,hit:T.Intersection):SurfaceCapture|null=>{
   const faceIndex=hit.faceIndex;if(faceIndex==null)return null;
   const geometry=mesh.geometry as T.BufferGeometry,index=geometry.getIndex(),position=geometry.getAttribute('position');if(!index||!position)return null;
   const base=faceIndex*3;if(base+2>=index.count)return null;
   const a=new T.Vector3().fromBufferAttribute(position,index.getX(base)),b=new T.Vector3().fromBufferAttribute(position,index.getX(base+1)),cc=new T.Vector3().fromBufferAttribute(position,index.getX(base+2));
   const local=mesh.worldToLocal(hit.point.clone()),bary=new T.Vector3();
   const baryResult=T.Triangle.getBarycoord(local,a,b,cc,bary);if(!baryResult)return null;
   if(![local.x,local.y,local.z,bary.x,bary.y,bary.z].every(Number.isFinite))return null;
   return {x:local.x,y:local.y,z:local.z,coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,surfaceStructureId:atlas.parts[partIndex].id,surfaceStructureName:atlas.parts[partIndex].name,triangleIndex:faceIndex,barycentric:[bary.x,bary.y,bary.z],nearestSurfaceDistance:0};
  };
  const up=(e:PointerEvent)=>{
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);releasePointer(e);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   if(!registration.current&&meridianMarkers.length){
    const markerHit=raycaster.intersectObjects(meridianMarkers,false)[0];
    const pointCode=markerHit?.object?.userData?.pointCode;
    if(typeof pointCode==='string'&&pointCode){selectAcupoint.current?.(pointCode);return;}
   }
   if(registration.current){
    let nearest=Infinity,found=-1,bestHit:T.Intersection|null=null,bestMesh:T.Mesh|null=null;
    for(let i=0;i<pickers.length;i++){const mesh=pickers[i];if(!mesh||atlas.parts[i].system!=='integumentary'||!isPrimarySurfacePart(atlas.parts[i]))continue;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))continue;const hit=raycaster.intersectObject(mesh,false)[0];if(hit&&hit.distance<nearest){nearest=hit.distance;found=i;bestHit=hit;bestMesh=mesh;}}
    if(found>=0&&bestHit&&bestMesh){const capture=makeSurfaceCapture(found,bestMesh,bestHit);if(capture){registrationMarker.position.copy(bestHit.point);registrationMarker.visible=true;dirty=true;registerSurface.current?.(capture);}}
    return;
   }
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1,lastOverlayKey='',lastFocusKey='',lastMeridianEffectFrame=-1,lastFrameSample=performance.now(),lastAdaptAt=performance.now(),lastMetricAt=performance.now(),slowWindows=0,fastWindows=0,adaptations=0;let frameSamples:number[]=[];
  const applyQualityProfile=(next:RenderQualityProfile,reason:string)=>{
   if(next===qualityProfile){renderer.domElement.dataset.renderQualityMode=quality.current;return;}
   qualityProfile=next;qualityConfig=QUALITY_CONFIG[next];renderer.setPixelRatio(Math.min(devicePixelRatio,qualityConfig.pixelRatioCap));renderer.shadowMap.enabled=qualityConfig.shadows;key.castShadow=qualityConfig.shadows;ground.receiveShadow=qualityConfig.shadows;
   scene.traverse(object=>{if(object instanceof T.Mesh&&object!==ground)object.castShadow=qualityConfig.shadows;});
   adaptations++;renderer.domElement.dataset.renderQualityMode=quality.current;renderer.domElement.dataset.renderQualityProfile=qualityProfile;renderer.domElement.dataset.renderPixelRatio=renderer.getPixelRatio().toFixed(2);renderer.domElement.dataset.renderShadows=String(qualityConfig.shadows);renderer.domElement.dataset.renderTubeSegments=String(qualityConfig.tubeRadialSegments);renderer.domElement.dataset.renderFlowParticlesPerPath=String(qualityConfig.flowParticlesPerPath);renderer.domElement.dataset.renderAdaptations=String(adaptations);renderer.domElement.dataset.renderAdaptationReason=reason;lastOverlayKey='';dirty=true;
  };
  const sampleAdaptiveQuality=(now:number)=>{
   const interval=now-lastFrameSample;lastFrameSample=now;if(interval>0&&interval<30000){frameSamples.push(Math.min(interval,1000));if(frameSamples.length>120)frameSamples=frameSamples.slice(-120);}
   if(quality.current!==lastQualityMode){lastQualityMode=quality.current;slowWindows=0;fastWindows=0;frameSamples=[];lastAdaptAt=now;applyQualityProfile(selectInitialProfile(quality.current,capabilities),'manual-mode');}
   if(quality.current!=='auto')return;
   if(frameSamples.length>=5&&now-lastMetricAt>=2000){const metric=frameSamples.slice(-Math.min(30,frameSamples.length)),metricMean=metric.reduce((sum,value)=>sum+value,0)/metric.length;renderer.domElement.dataset.renderFrameMeanMs=metricMean.toFixed(2);renderer.domElement.dataset.renderFrameSampleCount=String(metric.length);lastMetricAt=now;}
   const adaptiveSampleReady=frameSamples.length>=45||(frameSamples.length>=8&&now-lastAdaptAt>=10000);if(!adaptiveSampleReady||now-lastAdaptAt<6000)return;
   const sample=frameSamples.splice(0,frameSamples.length),mean=sample.reduce((sum,value)=>sum+value,0)/sample.length;renderer.domElement.dataset.renderFrameMeanMs=mean.toFixed(2);
   if(mean>28){slowWindows++;fastWindows=0;}else if(mean<16){fastWindows++;slowWindows=0;}else{slowWindows=0;fastWindows=0;}
   if(slowWindows>=2||fastWindows>=3){const next=stepAdaptiveProfile(qualityProfile,mean);slowWindows=0;fastWindows=0;lastAdaptAt=now;if(next!==qualityProfile)applyQualityProfile(next,mean>28?'measured-slow':'measured-fast');}
  };
  const animate=()=>{
   if(disposed||document.hidden){frame=0;renderer.domElement.dataset.renderSuspended=String(document.hidden);return;}frame=requestAnimationFrame(animate);const now=performance.now();sampleAdaptiveQuality(now);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   renderer.domElement.dataset.sceneView=s.view;
   renderer.domElement.dataset.visibleSystems=s.visible.join(',');
   const requestedChunks=chunksForState(s),requestedChunkKey=requestedChunks.join(',');
   if(requestedChunkKey!==lastRequestedChunkKey){
    lastRequestedChunkKey=requestedChunkKey;
    void ensureStateChunks(s).catch(error=>{if(!disposed)onError(error instanceof Error&&error.name==='AbortError'?'Tải lớp giải phẫu quá thời gian.':error instanceof Error?error.message:'Không tải được lớp giải phẫu.');});
   }
   const overlayValue=overlay.current;
   const overlayKey=overlayValue?.enabled
    ?[qualityProfile,overlayValue.meridianId,overlayValue.side,overlayValue.selectedPointCode??'',overlayValue.effects?.meridians,overlayValue.effects?.acupoints,overlayValue.needleSimulation?JSON.stringify(overlayValue.needleSimulation):'',overlayValue.anchors.map(anchor=>[anchor.pointCode,anchor.side,anchor.x.toFixed(5),anchor.y.toFixed(5),anchor.z.toFixed(5),anchor.verificationStatus].join(':')).join('|'),overlayValue.paths.map(path=>path.meridianId+':'+path.verificationStatus+':'+path.points.length).join('|')].join('::')
    :'off';
   if(overlayKey!==lastOverlayKey){rebuildOverlay(overlayValue);lastOverlayKey=overlayKey;dirty=true;}
   if(overlayValue?.enabled&&overlayValue.effects?.motion!==false&&!reduceMeridianMotion&&(meridianFlowParticles.length||meridianPulseMarkers.length)){
    const effectFrame=Math.floor(clock.elapsedTime*30);
    if(effectFrame!==lastMeridianEffectFrame){
     meridianFlowParticles.forEach((entry,index)=>{entry.curve.getPointAt((clock.elapsedTime*entry.speed+entry.offset+index*.025)%1,entry.mesh.position);entry.mesh.scale.setScalar(1+.1*(.5+.5*Math.sin(clock.elapsedTime*6.2+index)));});
     meridianPulseMarkers.forEach((marker,index)=>{const wave=.5+.5*Math.sin(clock.elapsedTime*5.4+index*.43),selected=Boolean(marker.userData.selected),pulse=1+(selected?.2:.075)*wave;marker.scale.setScalar(pulse);const material=marker.material as T.MeshBasicMaterial,base=Number(marker.userData.baseOpacity??.94);material.opacity=Math.min(1,base*(selected?.92+.08*wave:.88+.1*wave));});
     renderer.domElement.dataset.meridianEffect='flow';renderer.domElement.dataset.meridianEffectFrame=String(effectFrame);lastMeridianEffectFrame=effectFrame;dirty=true;
    }
   }else {renderer.domElement.dataset.meridianEffect=!overlayValue?.enabled?'off':reduceMeridianMotion?'reduced':'paused';}
   if(needleMesh&&overlayValue?.needleSimulation?.animated&&!reduceMeridianMotion){
    const cycle=.5+.5*Math.sin(clock.elapsedTime*3.2),base=Number(needleMesh.userData.needleLength),factor=overlayValue.needleSimulation.action==='insert'?.58+.42*cycle:overlayValue.needleSimulation.action==='lift-thrust'?.72+.24*cycle:1,length=base*factor,start=needleMesh.userData.needleStart as T.Vector3,direction=needleMesh.userData.needleDirection as T.Vector3,handle=needleMesh.userData.needleHandle as T.Mesh;
    needleMesh.scale.y=factor;needleMesh.position.copy(start).addScaledVector(direction,length/2);handle.position.copy(start).addScaledVector(direction,length);needleHandParts.forEach(part=>part.position.copy(part.userData.needleHandRest as T.Vector3).addScaledVector(direction,(length-base)*.72));if(overlayValue.needleSimulation.action==='twist'){const gripDirection=(needleMesh.userData.needleGripDirection as T.Vector3).clone().applyAxisAngle(direction,cycle*Math.PI*2);handle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),gripDirection);needleMesh.quaternion.copy(needleMesh.userData.needleBaseQuaternion as T.Quaternion).multiply(new T.Quaternion().setFromAxisAngle(direction,cycle*Math.PI*2));}dirty=true;
   }
   const focusValue=focus.current;
   if(focusValue?.key&&focusValue.key!==lastFocusKey){
    const point=new T.Vector3(focusValue.x,focusValue.y,focusValue.z),destination=point.clone().add(new T.Vector3(.28,.12,.42).normalize().multiplyScalar(.48));
    camera.clearViewOffset();startCameraMotion(point,destination,1.08);lastFocusKey=focusValue.key;dirty=true;
   }
   if(cameraMotion){
    const t=Math.min(1,(performance.now()-cameraMotion.startedAt)/(cameraMotion.duration*1000)),e=t*t*t*(t*(t*6-15)+10);
    camera.position.lerpVectors(cameraMotion.fromPosition,cameraMotion.toPosition,e);controls.target.lerpVectors(cameraMotion.fromTarget,cameraMotion.toTarget,e);controls.update();dirty=true;
    if(t>=1){cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';}
   }
   const detailedReplacement=false;
   const jointsWanted=s.visible.includes('articular')&&!s.isolate&&s.explode<.01;jointGroup.visible=jointsWanted;if(jointsWanted)ensureJoints();const articularReplacement=jointsWanted&&jointStatus==='ready';renderer.domElement.dataset.articularActive=String(jointsWanted);renderer.domElement.dataset.articularReplacement=String(articularReplacement);
   const skeletalWanted=s.visible.includes('skeletal')&&!s.isolate&&s.explode<.01;skeletalReferenceGroup.visible=skeletalWanted;if(skeletalWanted)ensureSkeletalReference();const skeletalReplacement=skeletalWanted&&skeletalStatus==='ready';renderer.domElement.dataset.skeletalReferenceActive=String(skeletalWanted);renderer.domElement.dataset.skeletalReferenceReplacement=String(skeletalReplacement);
   const changed=lastState?.visible!==s.visible||lastState?.opacity!==s.opacity||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate;
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    if(lastState?.opacity!==s.opacity){for(const system of SYSTEMS){const material=mats.get(system.id);if(!material)continue;const alpha=(s.opacity?.[system.id]??DEFAULT_LAYER_OPACITY[system.id])/100;material.opacity=alpha;material.transparent=alpha<1;material.depthWrite=alpha>=1;material.side=system.id==='integumentary'?T.FrontSide:T.DoubleSide;material.needsUpdate=true;}jointMaterial.opacity=(s.opacity?.articular??100)/100;jointMaterial.transparent=jointMaterial.opacity<1;jointMaterial.depthWrite=jointMaterial.opacity>=1;skeletalReferenceMaterial.opacity=(s.opacity?.skeletal??100)/100;skeletalReferenceMaterial.transparent=skeletalReferenceMaterial.opacity<1;skeletalReferenceMaterial.depthWrite=skeletalReferenceMaterial.opacity>=1;}
    const visible=new Set(s.visible),selection=new Set(s.selected);
    const visibleParts=atlas.parts.filter(p=>{const selected=selection.has(p.id);if(s.isolate)return selected;if(!selected&&!isPrimarySurfacePart(p))return false;if(p.system==='muscular'&&!selected&&!isMeridianLandmarkMuscle(p.name))return false;return visible.has(p.system)||selected;});
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id),surfaceAllowed=selected||isPrimarySurfacePart(p),muscleAllowed=p.system!=='muscular'||selected||isMeridianLandmarkMuscle(p.name),baseVisible=surfaceAllowed&&muscleAllowed&&(s.isolate?selected:visible.has(p.system)||selected),replaced=!selected&&((p.system==='muscular'&&detailedReplacement)||(p.system==='articular'&&articularReplacement)||(p.system==='skeletal'&&skeletalReplacement));data.set([dx,dy,dz,baseVisible&&!replaced?1:0],i*4);selectedData[i*4]=selected?255:0;
     markerPositions.set(data[i*4+3]>.5?[c.x+dx,c.y+dy,c.z+dz]:[10000,10000,10000],i*3);const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount,lastView!==''||lastReset>=0);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);startCameraMotion(center,center.clone().add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance)),.62);dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount,true);}
    lastIsolate=isolateKey;
   }
   controls.enableRotate=amount<.8;controls.mouseButtons.LEFT=amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;ground.visible=platform.visible=ring.visible=innerRing.visible=false;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4&&!cameraMotion;controls.autoRotateSpeed=.48;controls.update();if(controls.autoRotate||cameraMotion)dirty=true;
   if(dirty){renderer.domElement.dataset.cameraPosition=[camera.position.x,camera.position.y,camera.position.z].map(v=>v.toFixed(6)).join(',');renderer.domElement.dataset.cameraTarget=[controls.target.x,controls.target.y,controls.target.z].map(v=>v.toFixed(6)).join(',');renderer.render(scene,camera);renderCount++;renderer.domElement.dataset.renderCount=String(renderCount);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };
  const visibilityChange=()=>{if(disposed)return;if(document.hidden){renderer.domElement.dataset.renderSuspended='true';if(frame)cancelAnimationFrame(frame);frame=0;}else{renderer.domElement.dataset.renderSuspended='false';clock.getDelta();dirty=true;if(!frame)animate();}};
  document.addEventListener('visibilitychange',visibilityChange);animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('Thiết bị đã tạm dừng phiên 3D. Bấm tải lại để tiếp tục.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();if(frame)cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibilityChange);renderer.domElement.removeEventListener('webglcontextlost',contextLost);observer.disconnect();controls.dispose();disposeOverlay();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)&&!o.name.startsWith('hiu-head:')&&!o.name.startsWith('hiu-muscle:')&&!o.name.startsWith('hiu-joint:')&&!o.name.startsWith('hiu-skeleton:')){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});jointGroup.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});skeletalReferenceGroup.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});jointMaterial.dispose();skeletalReferenceMaterial.dispose();env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}

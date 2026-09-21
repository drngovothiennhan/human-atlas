import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
import {BODY_CANONICAL_COORDINATE_SYSTEM,type SurfaceCapture} from '../src/acupoints/registration/coordinate-system';
import type {MeridianFocusTarget,MeridianOverlayState} from './meridian-overlay';
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;registrationMode?:boolean;onRegisterSurface?:(capture:SurfaceCapture)=>void;meridianOverlay?:MeridianOverlayState;focusAcupoint?:MeridianFocusTarget|null;onSelectAcupoint?:(pointCode:string)=>void}
const assetUrl=(url:string)=>url.startsWith('/')?import.meta.env.BASE_URL+url.slice(1):url;
export default function AnatomyScene({atlas,state,onSelect,onProgress,onError,registrationMode=false,onRegisterSurface,meridianOverlay,focusAcupoint,onSelectAcupoint}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),registration=useRef(registrationMode),registerSurface=useRef(onRegisterSurface),overlay=useRef(meridianOverlay),focus=useRef(focusAcupoint),selectAcupoint=useRef(onSelectAcupoint);
 latest.current=state;select.current=onSelect;registration.current=registrationMode;registerSurface.current=onRegisterSurface;overlay.current=meridianOverlay;focus.current=focusAcupoint;selectAcupoint.current=onSelectAcupoint;
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#f2f3f3');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.zoomToCursor=true;renderer.domElement.dataset.cameraMotion='idle';renderer.domElement.dataset.cameraMotionSeq='0';
  let cameraMotionSeq=0;
  type CameraMotion={startedAt:number;duration:number;fromPosition:T.Vector3;fromTarget:T.Vector3;toPosition:T.Vector3;toTarget:T.Vector3};
  let cameraMotion:CameraMotion|null=null;
  const startCameraMotion=(toTarget:T.Vector3,toPosition:T.Vector3,duration=.68)=>{
   cameraMotion={startedAt:performance.now(),duration,fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition:toPosition.clone(),toTarget:toTarget.clone()};
   cameraMotionSeq++;renderer.domElement.dataset.cameraMotionSeq=String(cameraMotionSeq);renderer.domElement.dataset.cameraMotion='active';dirty=true;
  };
  controls.addEventListener('start',()=>{if(cameraMotion){cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';dirty=true;}});
  controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
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
  const registrationMarker=new T.Mesh(new T.SphereGeometry(.009,18,12),new T.MeshBasicMaterial({color:0x0f766e,depthTest:false}));registrationMarker.visible=false;registrationMarker.renderOrder=30;scene.add(registrationMarker);
  const meridianGroup=new T.Group();meridianGroup.name='hiu-meridian-overlay';scene.add(meridianGroup);
  const reduceMeridianMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  type MeridianFlowParticle={mesh:T.Mesh;curve:T.CatmullRomCurve3;offset:number};
  let meridianMarkers:T.Mesh[]=[],meridianPulseMarkers:T.Mesh[]=[],meridianFlowParticles:MeridianFlowParticle[]=[];
  const meridianColors:Record<string,number>={LU:0x2563eb,LI:0xf97316,ST:0xeab308,SP:0x8b5cf6,HT:0xdc2626,SI:0x0ea5e9,BL:0x475569,KI:0x0f766e,PC:0xdb2777,TE:0x06b6d4,GB:0x65a30d,LR:0x16a34a,CV:0x7c3aed,GV:0xb91c1c};
  const disposeOverlay=()=>{
   meridianMarkers=[];meridianPulseMarkers=[];meridianFlowParticles=[];
   while(meridianGroup.children.length){
    const child=meridianGroup.children.pop()!;
    const geometry=(child as T.Mesh).geometry as T.BufferGeometry|undefined;geometry?.dispose();
    const material=(child as T.Mesh).material as T.Material|T.Material[]|undefined;
    if(Array.isArray(material))material.forEach(item=>item.dispose());else material?.dispose();
   }
  };
  const rebuildOverlay=(value:MeridianOverlayState|undefined)=>{
   renderer.domElement.dataset.meridianId=value?.enabled?(value.meridianId??''):'';
   disposeOverlay();renderer.domElement.dataset.meridianAnchors='0';renderer.domElement.dataset.meridianPaths='0';renderer.domElement.dataset.meridianSchematicAnchors='0';renderer.domElement.dataset.meridianSchematicPaths='0';renderer.domElement.dataset.meridianPulseMarkers='0';renderer.domElement.dataset.meridianFlowParticles='0';renderer.domElement.dataset.meridianEffect=value?.enabled?(reduceMeridianMotion?'reduced':'flow'):'off';if(!value?.enabled)return;
   const color=meridianColors[value.meridianId??'']??0x0f766e;let trustedAnchors=0,schematicAnchors=0,schematicPaths=0,trustedPaths=0;
   for(const anchor of value.anchors){
    if(![anchor.x,anchor.y,anchor.z].every(Number.isFinite))continue;
    const schematic=anchor.sourceKind==='LICENSED_SCHEMATIC';
    const baseOpacity=anchor.sourceKind==='PUBLISHED'?1:schematic?.9:.92;
    const material=new T.MeshBasicMaterial({color,transparent:true,opacity:baseOpacity,depthTest:false});
    const marker=new T.Mesh(new T.SphereGeometry(anchor.sourceKind==='PUBLISHED'?.0135:schematic?.0105:.012,18,14),material);
    marker.position.set(anchor.x,anchor.y,anchor.z);marker.renderOrder=24;marker.userData.pointCode=anchor.pointCode;marker.userData.side=anchor.side;marker.userData.verificationStatus=anchor.verificationStatus;marker.userData.sourceKind=anchor.sourceKind;marker.userData.baseOpacity=baseOpacity;
    meridianGroup.add(marker);meridianMarkers.push(marker);meridianPulseMarkers.push(marker);if(schematic)schematicAnchors++;else trustedAnchors++;
   }
   renderer.domElement.dataset.meridianAnchors=String(trustedAnchors);renderer.domElement.dataset.meridianSchematicAnchors=String(schematicAnchors);
   for(const path of value.paths){
    if(path.points.length<2)continue;
    const schematic=path.sourceKind==='LICENSED_SCHEMATIC'&&path.verificationStatus==='UNVERIFIED';
    const reviewed=['FACULTY_REVIEWED','PUBLISHED'].includes(path.verificationStatus);
    if(!schematic&&!reviewed)continue;
    const points=path.points.map(point=>new T.Vector3(point[0],point[1],point[2]));
    if(schematic){
     const flowCurve=new T.CatmullRomCurve3(points,false,'centripetal');
     const guideGeometry=new T.TubeGeometry(flowCurve,Math.max(18,points.length*12),.0028,6,false);
     const guideMaterial=new T.MeshBasicMaterial({color,transparent:true,opacity:.42,depthTest:false});
     const guide=new T.Mesh(guideGeometry,guideMaterial);guide.renderOrder=21;meridianGroup.add(guide);
     const geometry=new T.BufferGeometry().setFromPoints(points);
     const material=new T.LineDashedMaterial({color,transparent:true,opacity:.96,dashSize:.014,gapSize:.006,depthTest:false});
     const line=new T.Line(geometry,material);line.computeLineDistances();line.renderOrder=22;meridianGroup.add(line);
     const flowParticle=new T.Mesh(new T.SphereGeometry(.008,12,10),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthTest:false}));
     flowParticle.position.copy(flowCurve.getPointAt(0));flowParticle.renderOrder=25;meridianGroup.add(flowParticle);meridianFlowParticles.push({mesh:flowParticle,curve:flowCurve,offset:(schematicPaths*.37)%1});schematicPaths++;
    }else{
     const curve=new T.CatmullRomCurve3(points,false,'centripetal');
     const geometry=new T.TubeGeometry(curve,Math.max(16,points.length*12),.0055,7,false);
     const material=new T.MeshBasicMaterial({color,transparent:true,opacity:.95,depthTest:false});
     const tube=new T.Mesh(geometry,material);tube.renderOrder=22;meridianGroup.add(tube);
     const flowParticle=new T.Mesh(new T.SphereGeometry(.0085,12,10),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthTest:false}));
     flowParticle.position.copy(curve.getPointAt(0));flowParticle.renderOrder=25;meridianGroup.add(flowParticle);meridianFlowParticles.push({mesh:flowParticle,curve,offset:(trustedPaths*.41)%1});trustedPaths++;
    }
   }
   renderer.domElement.dataset.meridianPaths=String(trustedPaths);renderer.domElement.dataset.meridianSchematicPaths=String(schematicPaths);renderer.domElement.dataset.meridianPulseMarkers=String(meridianPulseMarkers.length);renderer.domElement.dataset.meridianFlowParticles=String(meridianFlowParticles.length);
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
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary',opacity:system==='integumentary'?.1:1,depthWrite:system!=='integumentary'});
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
  let loaded=0;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(assetUrl(compressed?chunk.gzip!:chunk.url),{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
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
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const fit=(view:string,extent=0,animated=false)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   const target=new T.Vector3(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0),position=target.clone().addScaledVector(direction,distance);
   if(animated)startCameraMotion(target,position);else{cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';controls.target.copy(target);camera.position.copy(position);controls.update();dirty=true;}
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const down=(e:PointerEvent)=>{hover.hidden=true;tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(registration.current){hover.hidden=true;renderer.domElement.style.cursor='crosshair';return;}if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
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
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   if(!registration.current&&meridianMarkers.length){
    const markerHit=raycaster.intersectObjects(meridianMarkers,false)[0];
    const pointCode=markerHit?.object?.userData?.pointCode;
    if(typeof pointCode==='string'&&pointCode){selectAcupoint.current?.(pointCode);return;}
   }
   if(registration.current){
    let nearest=Infinity,found=-1,bestHit:T.Intersection|null=null,bestMesh:T.Mesh|null=null;
    for(let i=0;i<pickers.length;i++){const mesh=pickers[i];if(!mesh||atlas.parts[i].system!=='integumentary')continue;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))continue;const hit=raycaster.intersectObject(mesh,false)[0];if(hit&&hit.distance<nearest){nearest=hit.distance;found=i;bestHit=hit;bestMesh=mesh;}}
    if(found>=0&&bestHit&&bestMesh){const capture=makeSurfaceCapture(found,bestMesh,bestHit);if(capture){registrationMarker.position.copy(bestHit.point);registrationMarker.visible=true;dirty=true;registerSurface.current?.(capture);}}
    return;
   }
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1,lastOverlayKey='',lastFocusKey='',lastMeridianEffectFrame=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   const overlayValue=overlay.current;
   const overlayKey=overlayValue?.enabled
    ?[overlayValue.meridianId,overlayValue.side,overlayValue.anchors.map(anchor=>[anchor.pointCode,anchor.side,anchor.x.toFixed(5),anchor.y.toFixed(5),anchor.z.toFixed(5),anchor.verificationStatus].join(':')).join('|'),overlayValue.paths.map(path=>path.meridianId+':'+path.verificationStatus+':'+path.points.length).join('|')].join('::')
    :'off';
   if(overlayKey!==lastOverlayKey){rebuildOverlay(overlayValue);lastOverlayKey=overlayKey;dirty=true;}
   if(overlayValue?.enabled&&!reduceMeridianMotion&&(meridianFlowParticles.length||meridianPulseMarkers.length)){
    const effectFrame=Math.floor(clock.elapsedTime*30);
    if(effectFrame!==lastMeridianEffectFrame){
     meridianFlowParticles.forEach((entry,index)=>{entry.curve.getPointAt((clock.elapsedTime*.18+entry.offset+index*.07)%1,entry.mesh.position);entry.mesh.scale.setScalar(1.12+.28*(.5+.5*Math.sin(clock.elapsedTime*7+index)));});
     meridianPulseMarkers.forEach((marker,index)=>{const wave=.5+.5*Math.sin(clock.elapsedTime*5.4+index*.43),pulse=1.08+.42*wave;marker.scale.setScalar(pulse);const material=marker.material as T.MeshBasicMaterial;const base=Number(marker.userData.baseOpacity??.9);material.opacity=Math.min(1,base*(.84+.18*wave));});
     renderer.domElement.dataset.meridianEffect='flow';renderer.domElement.dataset.meridianEffectFrame=String(effectFrame);lastMeridianEffectFrame=effectFrame;dirty=true;
    }
   }else if(!overlayValue?.enabled){renderer.domElement.dataset.meridianEffect='off';}
   const focusValue=focus.current;
   if(focusValue?.key&&focusValue.key!==lastFocusKey){
    const point=new T.Vector3(focusValue.x,focusValue.y,focusValue.z),destination=point.clone().add(new T.Vector3(.28,.12,.42).normalize().multiplyScalar(.48));
    camera.clearViewOffset();startCameraMotion(point,destination,.78);lastFocusKey=focusValue.key;dirty=true;
   }
   if(cameraMotion){
    const t=Math.min(1,(performance.now()-cameraMotion.startedAt)/(cameraMotion.duration*1000)),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    camera.position.lerpVectors(cameraMotion.fromPosition,cameraMotion.toPosition,e);controls.target.lerpVectors(cameraMotion.fromTarget,cameraMotion.toTarget,e);controls.update();dirty=true;
    if(t>=1){cameraMotion=null;renderer.domElement.dataset.cameraMotion='idle';}
   }
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate;
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    const visibleParts=atlas.parts.filter(p=>s.isolate?selection.has(p.id):visible.has(p.system)||selection.has(p.id));
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);selectedData[i*4]=selected?255:0;
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
   controls.enableRotate=amount<.8;controls.mouseButtons.LEFT=amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4&&!cameraMotion;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate||cameraMotion)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();disposeOverlay();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}

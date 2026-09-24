import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';

type NeedlePhase='approach'|'contact'|'insert'|'withdraw';

const PHASES:Array<{id:NeedlePhase;label:string}>=[
  {id:'approach',label:'Tiếp cận'},
  {id:'contact',label:'Chạm bề mặt'},
  {id:'insert',label:'Mô phỏng tiến kim'},
  {id:'withdraw',label:'Rút kim'}
];

export default function NeedleSimulation(){
  const host=useRef<HTMLDivElement>(null);
  const angleRef=useRef(35),travelRef=useRef(12),phaseRef=useRef<NeedlePhase>('approach'),responseRef=useRef(false);
  const [angle,setAngle]=useState(35),[travel,setTravel]=useState(12),[phase,setPhase]=useState<NeedlePhase>('approach'),[response,setResponse]=useState(false),[available,setAvailable]=useState(true);
  angleRef.current=angle;travelRef.current=travel;phaseRef.current=phase;responseRef.current=response;

  useEffect(()=>{
    const root=host.current;if(!root)return;
    let renderer:THREE.WebGLRenderer;
    try{
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    }catch{setAvailable(false);return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff,0);
    root.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,30);
    camera.position.set(3.05,2.45,4.4);camera.lookAt(0,.02,0);
    scene.add(new THREE.HemisphereLight(0xeaf4ff,0x816b62,2.0));
    const key=new THREE.DirectionalLight(0xfff4e5,3.0);key.position.set(-2,4,3);scene.add(key);
    const fill=new THREE.DirectionalLight(0xc7e1f0,1.15);fill.position.set(3,2,-3);scene.add(fill);

    const tissue=new THREE.Group();scene.add(tissue);
    const base=new THREE.Mesh(new THREE.BoxGeometry(2.55,.48,1.62),new THREE.MeshPhysicalMaterial({color:0xd99779,roughness:.72,clearcoat:.06}));
    base.position.y=-.25;tissue.add(base);
    const dermis=new THREE.Mesh(new THREE.BoxGeometry(2.57,.13,1.64),new THREE.MeshPhysicalMaterial({color:0xf0c4a8,roughness:.46,clearcoat:.16}));
    dermis.position.y=-.015;tissue.add(dermis);
    const epidermis=new THREE.Mesh(new THREE.BoxGeometry(2.58,.045,1.65),new THREE.MeshPhysicalMaterial({color:0xf5d9c6,roughness:.34,clearcoat:.22}));
    epidermis.position.y=.072;tissue.add(epidermis);
    const fascia=new THREE.Mesh(new THREE.BoxGeometry(2.5,.018,1.56),new THREE.MeshStandardMaterial({color:0xf8e8d8,roughness:.82}));
    fascia.position.y=-.09;tissue.add(fascia);
    const surface=new THREE.Mesh(new THREE.PlaneGeometry(2.56,1.62),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide}));
    surface.rotation.x=-Math.PI/2;surface.position.y=.096;tissue.add(surface);
    const target=new THREE.Mesh(new THREE.SphereGeometry(.035,18,12),new THREE.MeshBasicMaterial({color:0x8f4c51}));
    target.position.set(0,.105,0);tissue.add(target);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.07,.006,8,32),new THREE.MeshBasicMaterial({color:0xe9ae58,transparent:true,opacity:0,depthWrite:false}));
    halo.rotation.x=Math.PI/2;halo.position.set(0,.105,0);tissue.add(halo);
    const halo2=new THREE.Mesh(new THREE.TorusGeometry(.105,.004,8,32),new THREE.MeshBasicMaterial({color:0xf4d18b,transparent:true,opacity:0,depthWrite:false}));
    halo2.rotation.x=Math.PI/2;halo2.position.set(0,.106,0);tissue.add(halo2);

    const needle=new THREE.Group();scene.add(needle);
    const steel=new THREE.MeshPhysicalMaterial({color:0xdce4e9,metalness:.94,roughness:.19,clearcoat:1,clearcoatRoughness:.12});
    const shaftLength=1.12;
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.009,.006,shaftLength,12,1),steel);
    shaft.position.y=shaftLength/2+.035;needle.add(shaft);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(.006,.045,12),steel);
    tip.rotation.z=Math.PI;tip.position.y=.0225;needle.add(tip);
    const glint=new THREE.Mesh(new THREE.CylinderGeometry(.0015,.001,shaftLength*.9,6),new THREE.MeshBasicMaterial({color:0xffffff}));
    glint.position.set(-.005,shaftLength*.48+.035,.004);needle.add(glint);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.017,.014,.07,12),new THREE.MeshStandardMaterial({color:0x78909c,metalness:.7,roughness:.27}));
    hub.position.y=shaftLength+.075;needle.add(hub);
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.021,.018,.28,12),new THREE.MeshStandardMaterial({color:0xb9c4c9,metalness:.78,roughness:.26}));
    handle.position.y=shaftLength+.245;needle.add(handle);
    for(let i=0;i<6;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.019,.0025,5,16),new THREE.MeshStandardMaterial({color:0x697982,metalness:.55,roughness:.38}));
      ring.position.y=shaftLength+.14+i*.035;needle.add(ring);
    }
    const shadow=new THREE.Mesh(new THREE.CylinderGeometry(.035,.02,.006,20),new THREE.MeshBasicMaterial({color:0x674d43,transparent:true,opacity:.2}));
    shadow.rotation.x=Math.PI/2;shadow.position.set(0,.101,0);tissue.add(shadow);

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xf1f4f5,roughness:1}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.52;scene.add(ground);
    const grid=new THREE.GridHelper(10,30,0xd4dcdf,0xe4e9eb);grid.position.y=-.515;scene.add(grid);

    let frame=0,disposed=false;
    const resize=()=>{
      if(!root.clientWidth||!root.clientHeight)return;
      camera.aspect=root.clientWidth/root.clientHeight;camera.updateProjectionMatrix();
      renderer.setSize(root.clientWidth,root.clientHeight,false);
    };
    const observer=new ResizeObserver(resize);observer.observe(root);resize();
    const clock=new THREE.Clock();
    const render=()=>{
      if(disposed)return;
      frame=requestAnimationFrame(render);
      const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime,angleRad=THREE.MathUtils.degToRad(angleRef.current);
      const inserted=phaseRef.current==='insert'||phaseRef.current==='withdraw';
      const targetDepth=phaseRef.current==='insert'?travelRef.current*.012:0;
      const targetX=Math.sin(angleRad)*targetDepth;
      const targetY=.108-Math.cos(angleRad)*targetDepth;
      needle.position.x=THREE.MathUtils.damp(needle.position.x,targetX,18,dt);
      needle.position.y=THREE.MathUtils.damp(needle.position.y,phaseRef.current==='approach'?.36:phaseRef.current==='contact'?.096:targetY,18,dt);
      needle.position.z=0;
      needle.rotation.z=angleRad;
      const contact=phaseRef.current==='contact'||inserted;
      target.scale.setScalar(contact?1.45+.12*Math.sin(t*4):1);
      const pulse=responseRef.current&&inserted?(.5+.5*Math.sin(t*3.2)):0;
      halo.material.opacity=pulse*.48;halo2.material.opacity=pulse*.32;
      halo.scale.setScalar(.9+pulse*.55);halo2.scale.setScalar(.88+pulse*.65);
      shadow.position.x=targetX;shadow.material.opacity=inserted?.28:.18;
      renderer.render(scene,camera);
    };
    render();
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();
      scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose();}});
      renderer.dispose();renderer.domElement.remove();
    };
  },[]);

  return <div className="needle-simulation" data-needle-simulation="3d">
    <div className="needle-3d-view" ref={host} role="img" aria-label="Mô phỏng 3D kim và lát cắt mô mềm minh họa">
      {!available&&<div className="needle-webgl-fallback" role="status">Thiết bị chưa hỗ trợ WebGL; có thể tiếp tục học bằng các điều khiển mô phỏng.</div>}
      <span className="needle-view-label">MÔ HÌNH MINH HỌA · KHÔNG THEO TỶ LỆ</span>
    </div>
    <div className="needle-phase-controls" aria-label="Giai đoạn hoạt ảnh kim">
      {PHASES.map(item=><button key={item.id} type="button" aria-pressed={phase===item.id} onClick={()=>setPhase(item.id)}>{item.label}</button>)}
    </div>
    <label className="needle-range">Góc đồ họa <output>{angle}°</output><input type="range" min="15" max="85" step="1" value={angle} onChange={event=>setAngle(Number(event.target.value))} aria-label="Góc đồ họa, không phải chỉ định châm cứu"/></label>
    <label className="needle-range">Độ sâu minh họa <output>{travel} đv mô phỏng</output><input type="range" min="0" max="30" step="1" value={travel} onChange={event=>setTravel(Number(event.target.value))} aria-label="Độ sâu đồ họa theo đơn vị mô phỏng, không phải độ sâu châm cứu"/></label>
    <label className="needle-response"><input type="checkbox" checked={response} onChange={event=>setResponse(event.target.checked)}/> Hiệu ứng gợn sóng minh họa</label>
    <small className="needle-disclaimer">Góc và hành trình chỉ điều khiển đồ họa tổng quát, không phải thông số châm cứu. Hiệu ứng gợn sóng không xác định hay chẩn đoán cảm giác đắc khí. Chưa gắn kim vào huyệt thật vì tọa độ chưa được thẩm định.</small>
  </div>;
}

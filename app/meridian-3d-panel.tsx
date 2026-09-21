import {useEffect,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {AcupointAnchorDraft} from '../src/acupoints/registration/coordinate-system';
import {
  draftToSceneAnchor,
  type MeridianFocusTarget,
  type MeridianOverlaySide,
  type MeridianOverlayState,
  type MeridianSceneAnchor,
  type MeridianScenePath
} from './meridian-overlay';

type Meridian={id:string;code:string;vietnameseName:string;englishName:string;pointIds:string[];path3d:number[][];reviewStatus:string;spatialStatus:string};
type Acupoint={code:string;meridianId:string;sequence:number;vietnameseName?:string|null;englishName?:string|null;position3d?:{x:number;y:number;z:number;coordinateSystem?:string;source?:string}|null;reviewStatus?:string;verificationStatus?:string};
type SchematicSpatial={anchors:MeridianSceneAnchor[];paths:MeridianScenePath[];source?:{repository?:string;commit?:string;license?:string};omittedTopology?:string[];sourceSideWarnings?:{pointCode:string;reason:string}[]};

interface Props{drafts:AcupointAnchorDraft[];selectedPointCode:string|null;onOverlayChange:(overlay:MeridianOverlayState)=>void;onFocus:(target:MeridianFocusTarget|null)=>void}

const norm=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const sideLabel=(side:MeridianOverlaySide)=>side==='BOTH'?'Hai bên':side==='LEFT'?'Trái':'Phải';

export default function Meridian3DPanel({drafts,selectedPointCode,onOverlayChange,onFocus}:Props){
  const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false);
  const [meridians,setMeridians]=useState<Meridian[]>([]),[points,setPoints]=useState<Acupoint[]>([]);
  const [schematic,setSchematic]=useState<SchematicSpatial>({anchors:[],paths:[]});
  const [activeMeridian,setActiveMeridian]=useState('ST'),[side,setSide]=useState<MeridianOverlaySide>('BOTH');
  const [query,setQuery]=useState(''),[selected,setSelected]=useState<string|null>(null);
  const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[loadAttempt,setLoadAttempt]=useState(0);

  useEffect(()=>{
    let alive=true;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    setLoading(true);setLoadError('');
    Promise.all([
      fetch(import.meta.env.BASE_URL+'data/meridians.json',{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('meridian data unavailable');return await r.json() as Meridian[]}),
      fetch(import.meta.env.BASE_URL+'data/acupoints.json',{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('acupoint data unavailable');return await r.json() as Acupoint[]}),
      fetch(import.meta.env.BASE_URL+'data/schematic-spatial.json',{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('schematic spatial data unavailable');return await r.json() as SchematicSpatial})
    ]).then(([m,p,s])=>{
      if(!Array.isArray(m)||!m.length||!Array.isArray(p)||!p.length||!Array.isArray(s.anchors)||!s.anchors.length||!Array.isArray(s.paths)||!s.paths.length)throw new Error('invalid meridian dataset');
      if(alive){setMeridians(m);setPoints(p);setSchematic(s)}
    }).catch(()=>{if(alive)setLoadError('Chưa tải được dữ liệu huyệt và kinh lạc. Kiểm tra kết nối rồi thử lại.');controller.abort();})
      .finally(()=>{clearTimeout(timer);if(alive)setLoading(false)});
    return()=>{alive=false;clearTimeout(timer);controller.abort()};
  },[loadAttempt]);

  useEffect(()=>{
    if(!selectedPointCode)return;
    const point=points.find(item=>item.code===selectedPointCode);
    if(point)setActiveMeridian(point.meridianId);
    setSelected(selectedPointCode);setEnabled(true);setOpen(true);
  },[selectedPointCode,points]);

  const draftAnchors=useMemo(()=>drafts.map(draftToSceneAnchor),[drafts]);
  const publishedAnchors=useMemo<MeridianSceneAnchor[]>(()=>points.flatMap(point=>{
    const position=point.position3d,status=point.reviewStatus??point.verificationStatus??'UNVERIFIED';
    if(!position||!['FACULTY_REVIEWED','PUBLISHED'].includes(status)||![position.x,position.y,position.z].every(Number.isFinite))return [];
    return [{pointCode:point.code,meridianId:point.meridianId,sequence:point.sequence,side:(point.meridianId==='CV'||point.meridianId==='GV'?'MIDLINE':'UNKNOWN') as MeridianSceneAnchor['side'],x:position.x,y:position.y,z:position.z,verificationStatus:status as MeridianSceneAnchor['verificationStatus'],sourceKind:'PUBLISHED' as const}];
  }),[points]);
  const publishedPaths=useMemo<MeridianScenePath[]>(()=>meridians.flatMap(meridian=>{
    if(!['FACULTY_REVIEWED','PUBLISHED'].includes(meridian.reviewStatus)||!Array.isArray(meridian.path3d)||meridian.path3d.length<2)return [];
    if(!meridian.path3d.every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)))return [];
    return [{meridianId:meridian.id,side:meridian.id==='CV'||meridian.id==='GV'?'MIDLINE':'UNKNOWN',points:meridian.path3d.map(p=>[p[0],p[1],p[2]] as [number,number,number]),verificationStatus:meridian.reviewStatus as 'FACULTY_REVIEWED'|'PUBLISHED',sourceKind:'PUBLISHED'}];
  }),[meridians]);

  const allAnchors=useMemo(()=>{
    const byKey=new Map<string,MeridianSceneAnchor>();
    schematic.anchors.forEach(a=>byKey.set(a.pointCode+':'+a.side,a));
    draftAnchors.forEach(a=>byKey.set(a.pointCode+':'+a.side,a));
    publishedAnchors.forEach(a=>byKey.set(a.pointCode+':'+a.side,a));
    return [...byKey.values()];
  },[schematic.anchors,draftAnchors,publishedAnchors]);

  const visibleAnchors=useMemo(()=>allAnchors.filter(a=>a.meridianId===activeMeridian&&(side==='BOTH'||a.side===side||a.side==='MIDLINE'||a.side==='UNKNOWN')),[allAnchors,activeMeridian,side]);
  const visiblePaths=useMemo(()=>{
    const reviewed=publishedPaths.filter(p=>p.meridianId===activeMeridian);
    if(reviewed.length)return reviewed;
    return schematic.paths.filter(p=>p.meridianId===activeMeridian&&(side==='BOTH'||p.side===side||p.side==='MIDLINE'||p.side==='UNKNOWN'));
  },[publishedPaths,schematic.paths,activeMeridian,side]);

  useEffect(()=>{onOverlayChange({enabled,meridianId:activeMeridian,side,anchors:visibleAnchors,paths:visiblePaths})},[enabled,activeMeridian,side,visibleAnchors,visiblePaths,onOverlayChange]);

  const filteredPoints=useMemo(()=>{const q=norm(query),codeQuery=q.replace(/[-\s]/g,'');return points.filter(p=>q?p.code.toLowerCase().replace(/-/g,'').includes(codeQuery)||[p.vietnameseName??'',p.englishName??''].some(v=>norm(v).includes(q)):p.meridianId===activeMeridian).slice(0,80)},[points,activeMeridian,query]);
  const active=meridians.find(m=>m.id===activeMeridian),selectedRecord=points.find(p=>p.code===selected),selectedAnchors=allAnchors.filter(a=>a.pointCode===selected);
  const publishedCount=publishedAnchors.filter(a=>a.meridianId===activeMeridian).length,draftCount=draftAnchors.filter(a=>a.meridianId===activeMeridian).length,schematicCount=schematic.anchors.filter(a=>a.meridianId===activeMeridian).length;
  const schematicPaths=visiblePaths.filter(p=>p.sourceKind==='LICENSED_SCHEMATIC').length;

  const focusPoint=(point:Acupoint)=>{
    setSelected(point.code);setActiveMeridian(point.meridianId);setEnabled(true);
    const candidates=allAnchors.filter(a=>a.pointCode===point.code);
    const anchor=(side==='LEFT'||side==='RIGHT')?candidates.find(a=>a.side===side)||candidates[0]:candidates[0];
    if(!anchor){onFocus(null);return}
    onFocus({key:point.code+':'+anchor.side+':'+Date.now(),pointCode:point.code,x:anchor.x,y:anchor.y,z:anchor.z});
  };

  return <>
    <Button variant="ghost" className={'meridian3d-launch '+(enabled?'active':'')} onClick={()=>open?setOpen(false):(setOpen(true),setEnabled(true))} aria-label="Mở mô hình kinh lạc 3D" data-meridian3d-launch="true">
      <strong>Kinh lạc 3D</strong>
      <span>{loading?'Đang tải dữ liệu…':loadError?'Chưa tải được dữ liệu — bấm để thử lại':`${points.length} huyệt · ${meridians.length} kinh · ${schematic.anchors.length} vị trí 3D sơ đồ`}</span>
    </Button>
    {open&&<aside className="meridian3d-panel glass" data-meridian3d-panel="true" aria-label="Mô hình kinh lạc và huyệt vị 3D">
      <div className="meridian3d-head"><div><strong>Mô hình kinh lạc · huyệt vị 3D</strong><small>Vị trí sơ đồ được chiếu lên BodyParts3D từ nguồn mở có giấy phép; trạng thái UNVERIFIED cho tới khi được duyệt chuyên môn.</small></div><Button variant="ghost" onClick={()=>setOpen(false)} aria-label="Đóng mô hình kinh lạc 3D">×</Button></div>
      {loading&&<p role="status">Đang tải dữ liệu huyệt và kinh lạc…</p>}
      {loadError&&<div role="alert" data-meridian3d-load-error="true"><p>{loadError}</p><Button variant="ghost" disabled={loading} onClick={()=>setLoadAttempt(v=>v+1)}>Thử tải lại dữ liệu</Button></div>}
      <div className="meridian3d-controls">
        <label>Kinh<select value={activeMeridian} onChange={e=>{setActiveMeridian(e.target.value);setQuery('');setSelected(null);onFocus(null)}}>{meridians.map(m=><option key={m.id} value={m.id}>{m.code} · {m.vietnameseName}</option>)}</select></label>
        <label>Bên<select value={side} onChange={e=>setSide(e.target.value as MeridianOverlaySide)}><option value="BOTH">Hai bên</option><option value="LEFT">Trái</option><option value="RIGHT">Phải</option></select></label>
      </div>
      <div className="meridian3d-summary">
        <strong>{active?.vietnameseName??activeMeridian}</strong>
        <span>{active?.pointIds.length??filteredPoints.length} huyệt · {sideLabel(side)} · {schematicCount} anchor sơ đồ · {publishedCount} anchor đã duyệt · {draftCount} anchor nháp local</span>
        <span>{publishedPaths.some(p=>p.meridianId===activeMeridian)?'Có đường kinh 3D đã kiểm duyệt':schematicPaths?schematicPaths+' đoạn đường kinh sơ đồ nguồn mở · UNVERIFIED · Chưa có path 3D đã kiểm duyệt':'Chưa có path 3D đã kiểm duyệt — không tự nối điểm'}</span>
      </div>
      <div className="meridian3d-actions"><Button variant="ghost" className={enabled?'active':''} onClick={()=>setEnabled(v=>!v)}>{enabled?'Ẩn khỏi mô hình':'Hiện trên mô hình'}</Button><a href="https://kinhlac.online/xem-3d/" target="_blank" rel="noreferrer">Đối chiếu kinhlac.online ↗</a></div>
      <input className="meridian3d-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm ST-36, LI-4…" aria-label="Tìm huyệt để bay tới"/>
      {!loading&&!loadError&&!filteredPoints.length&&<p role="status">Không tìm thấy huyệt phù hợp.</p>}
      <div className="meridian3d-list">{filteredPoints.map(point=>{const anchors=allAnchors.filter(a=>a.pointCode===point.code);return <button key={point.code} onClick={()=>focusPoint(point)} data-meridian3d-point={point.code}><b>{point.code}</b><span>{point.vietnameseName||point.englishName||'Huyệt chuẩn'}</span><small>{anchors.length?anchors.length+' anchor 3D · bấm để bay tới':'chưa có anchor 3D'}</small></button>})}</div>
      {selectedRecord&&<div className="meridian3d-detail" data-meridian3d-detail="true">
        <strong>{selectedRecord.code}{selectedRecord.vietnameseName?' · '+selectedRecord.vietnameseName:''}</strong>
        {schematic.sourceSideWarnings?.some(w=>w.pointCode===selectedRecord.code)&&<small role="status">Nguồn sơ đồ có dữ liệu hai bên không thống nhất với kinh giữa thân tại huyệt này; cần đối chiếu chuyên môn, chưa dùng để xác định vị trí chuẩn.</small>}
        <span>{selectedAnchors.some(a=>a.sourceKind==='PUBLISHED')?'Có tọa độ BodyParts3D đã kiểm duyệt.':'Chưa có tọa độ BodyParts3D đã kiểm duyệt. '}{selectedAnchors.length?selectedAnchors.map(a=>a.side+': '+(a.sourceKind==='PUBLISHED'?'đã duyệt':a.sourceKind==='LOCAL_DRAFT'?'nháp local · UNVERIFIED':'sơ đồ nguồn mở · UNVERIFIED')).join(' · '):'Chưa có tọa độ BodyParts3D đã đăng ký.'}</span>
        <small>Sơ đồ nguồn mở dùng để học/định hướng, không được tự nâng thành tọa độ xuất bản. Capture local và sơ đồ đều giữ UNVERIFIED cho đến khi có duyệt chuyên môn.</small>
      </div>}
      <footer>Nguồn hình học sơ đồ: FuriaRozkwit/acupuncture-3d (MIT cho code/anchor; dữ liệu hiệu chỉnh BodyParts3D/Z-Anatomy theo CC BY-SA, xem THIRD_PARTY_NOTICES). BL-39 không có trong topology nguồn nên không tạo đoạn nối giả. kinhlac.online chỉ là tham chiếu hành vi clean-room.</footer>
    </aside>}
  </>;
}

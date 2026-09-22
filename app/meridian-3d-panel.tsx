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

type Language='vi'|'en'|'zh';
type Meridian={id:string;code:string;vietnameseName:string;englishName:string;chineseName?:string|null;pointIds:string[];path3d:number[][];reviewStatus:string;spatialStatus:string};
type Acupoint={code:string;meridianId:string;sequence:number;vietnameseName?:string|null;englishName?:string|null;chineseName?:string|null;pinyin?:string|null;position3d?:{x:number;y:number;z:number;coordinateSystem?:string;source?:string}|null;reviewStatus?:string;verificationStatus?:string};
type SchematicSpatial={anchors:MeridianSceneAnchor[];paths:MeridianScenePath[];source?:{repository?:string;commit?:string;license?:string};omittedTopology?:string[];sourceSideWarnings?:{pointCode:string;reason:string}[]};
type PointDocumentReference={pointCode:string;meridianId:string;label:string;heading:string;pdfPageRange:number[];spatialStatus:string};
type PointDocumentReferences={points:PointDocumentReference[]};

interface Props{drafts:AcupointAnchorDraft[];selectedPointCode:string|null;onOverlayChange:(overlay:MeridianOverlayState)=>void;onFocus:(target:MeridianFocusTarget|null)=>void}

const norm=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const sideLabel=(side:MeridianOverlaySide)=>side==='BOTH'?'Hai bên':side==='LEFT'?'Trái':'Phải';
const MERIDIAN_ZH:Record<string,string>={LU:'手太阴肺经',LI:'手阳明大肠经',ST:'足阳明胃经',SP:'足太阴脾经',HT:'手少阴心经',SI:'手太阳小肠经',BL:'足太阳膀胱经',KI:'足少阴肾经',PC:'手厥阴心包经',TE:'手少阳三焦经',GB:'足少阳胆经',LR:'足厥阴肝经',CV:'任脉',GV:'督脉'};

export default function Meridian3DPanel({drafts,selectedPointCode,onOverlayChange,onFocus}:Props){
  const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(true);
  const [motion,setMotion]=useState(true),[showMeridians,setShowMeridians]=useState(true),[showPoints,setShowPoints]=useState(true),[showCollaterals,setShowCollaterals]=useState(false);
  const [language,setLanguage]=useState<Language>('vi');
  const [meridians,setMeridians]=useState<Meridian[]>([]),[points,setPoints]=useState<Acupoint[]>([]);
  const [schematic,setSchematic]=useState<SchematicSpatial>({anchors:[],paths:[]});
  const [documentRefs,setDocumentRefs]=useState<PointDocumentReference[]>([]);
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
    let alive=true;
    fetch(import.meta.env.BASE_URL+'data/point-document-references.json')
      .then(async r=>r.ok?await r.json() as PointDocumentReferences:{points:[]})
      .then(data=>{if(alive&&Array.isArray(data.points))setDocumentRefs(data.points)})
      .catch(()=>{});
    return()=>{alive=false};
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

  useEffect(()=>{onOverlayChange({enabled,meridianId:activeMeridian,side,selectedPointCode:selected,anchors:visibleAnchors,paths:visiblePaths,effects:{motion,meridians:showMeridians,acupoints:showPoints,collaterals:showCollaterals}})},[enabled,activeMeridian,side,selected,visibleAnchors,visiblePaths,motion,showMeridians,showPoints,showCollaterals,onOverlayChange]);

  const meridianName=(m:Meridian|undefined)=>{
    if(!m)return activeMeridian;
    if(language==='zh')return (m.vietnameseName||m.code)+' · '+(m.chineseName||MERIDIAN_ZH[m.id]||m.code);
    if(language==='en')return (m.vietnameseName||m.code)+' · '+(m.englishName||m.code);
    return m.vietnameseName||m.code;
  };
  const pointName=(p:Acupoint)=>{
    if(language==='zh')return (p.vietnameseName||p.code)+' · '+(p.chineseName||p.pinyin||p.code);
    if(language==='en')return (p.vietnameseName||p.code)+' · '+(p.englishName||p.pinyin||p.code);
    return p.vietnameseName||('Huyệt '+p.code);
  };

  const filteredPoints=useMemo(()=>{const q=norm(query),codeQuery=q.replace(/[-\s]/g,'');return points.filter(p=>q?p.code.toLowerCase().replace(/-/g,'').includes(codeQuery)||[p.vietnameseName??'',p.englishName??'',p.chineseName??'',p.pinyin??''].some(v=>norm(v).includes(q)):p.meridianId===activeMeridian).slice(0,80)},[points,activeMeridian,query]);
  const active=meridians.find(m=>m.id===activeMeridian),selectedRecord=points.find(p=>p.code===selected),selectedAnchors=allAnchors.filter(a=>a.pointCode===selected);
  const selectedDocumentRef=documentRefs.find(r=>r.pointCode===selected);
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
      <div className="meridian3d-head"><div><strong>Mô hình kinh lạc · huyệt vị 3D</strong><small>Chế độ học tập · theo giáo trình và nguồn tham chiếu. Tọa độ huyệt và đường kinh 3D là mô phỏng phục vụ học tập, chưa được thẩm định vị trí giải phẫu.</small></div><Button variant="ghost" onClick={()=>setOpen(false)} aria-label="Đóng mô hình kinh lạc 3D">×</Button></div>
      {loading&&<p role="status">Đang tải dữ liệu huyệt và kinh lạc…</p>}
      {loadError&&<div role="alert" data-meridian3d-load-error="true"><p>{loadError}</p><Button variant="ghost" disabled={loading} onClick={()=>setLoadAttempt(v=>v+1)}>Thử tải lại dữ liệu</Button></div>}
      <div className="meridian3d-controls">
        <label>Kinh<select value={activeMeridian} onChange={e=>{setActiveMeridian(e.target.value);setEnabled(true);setMotion(true);setShowMeridians(true);setQuery('');setSelected(null);onFocus(null)}}>{meridians.map(m=><option key={m.id} value={m.id}>{m.code} · {meridianName(m)}</option>)}</select></label>
        <label>Bên<select value={side} onChange={e=>setSide(e.target.value as MeridianOverlaySide)}><option value="BOTH">Hai bên</option><option value="LEFT">Trái</option><option value="RIGHT">Phải</option></select></label>
        <label>Ngôn ngữ phụ<select value={language} onChange={e=>setLanguage(e.target.value as Language)} data-meridian-language="true"><option value="vi">Chỉ tiếng Việt</option><option value="en">Kèm tiếng Anh</option><option value="zh">Kèm tiếng Trung</option></select></label>
      </div>
      <div className="meridian3d-summary">
        <strong>{meridianName(active)}</strong>
        <span>{active?.pointIds.length??filteredPoints.length} huyệt · {sideLabel(side)} · {schematicCount} vị trí mô phỏng · {publishedCount} vị trí đã đăng ký · {draftCount} vị trí nháp trên máy</span>
        <span>{publishedPaths.some(p=>p.meridianId===activeMeridian)?'Có đường kinh 3D đã đăng ký':schematicPaths?schematicPaths+' đoạn đường kinh sơ đồ nguồn mở · THAM CHIẾU HỌC TẬP':'Chưa có đường kinh 3D — không tự nối điểm'}</span>
        {showCollaterals&&<span role="status">Chưa có dữ liệu đường lạc phù hợp để hiển thị.</span>}
      </div>
      <div className="meridian3d-effect-controls" data-meridian3d-effect-controls="true" aria-label="Điều khiển hiệu ứng kinh lạc">
        <button type="button" data-effect-master="true" aria-pressed={enabled} className={enabled?'active':''} onClick={()=>setEnabled(v=>!v)}>Hiệu ứng: {enabled?'Bật':'Tắt'}</button>
        <button type="button" data-effect-motion="true" aria-pressed={motion} className={motion?'active':''} onClick={()=>setMotion(v=>!v)}>Chuyển động</button>
        <button type="button" data-effect-meridian="true" aria-pressed={showMeridians} className={showMeridians?'active':''} onClick={()=>setShowMeridians(v=>!v)}>Kinh</button>
        <button type="button" data-effect-collateral="true" aria-pressed={showCollaterals} className={showCollaterals?'active':''} onClick={()=>setShowCollaterals(v=>!v)}>Lạc</button>
        <button type="button" data-effect-acupoint="true" aria-pressed={showPoints} className={showPoints?'active':''} onClick={()=>setShowPoints(v=>!v)}>Huyệt</button>
      </div>
      <div className="meridian3d-effect-note" aria-label="Chú giải hiệu ứng 3D"><span><i className="effect-dot"/>Huyệt nhịp</span><span><i className="effect-flow"/>Dòng kinh</span><span>Chạm huyệt → phóng tới vị trí</span></div>
      <input className="meridian3d-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm ST-36, LI-4, tên Việt/Anh/中文…" aria-label="Tìm huyệt để bay tới"/>
      {!loading&&!loadError&&!filteredPoints.length&&<p role="status">Không tìm thấy huyệt phù hợp.</p>}
      <div className="meridian3d-list">{filteredPoints.map(point=>{const anchors=allAnchors.filter(a=>a.pointCode===point.code),activePoint=selected===point.code;return <button key={point.code} className={activePoint?'selected':''} aria-pressed={activePoint} onClick={()=>focusPoint(point)} data-meridian3d-point={point.code}><b>{point.code}</b><span>{pointName(point)}</span><small>{anchors.length?anchors.length+' vị trí 3D · bấm để bay tới':'chưa có vị trí 3D'}</small></button>})}</div>
      {selectedRecord&&<div className="meridian3d-detail" data-meridian3d-detail="true">
        <strong>{selectedRecord.code} · {pointName(selectedRecord)}</strong>
        <div className="meridian3d-facts">
          <span><small>Kinh</small><b>{meridianName(meridians.find(m=>m.id===selectedRecord.meridianId))}</b></span>
          <span><small>Thứ tự</small><b>{selectedRecord.sequence}</b></span>
          <span><small>Vị trí đang có</small><b>{selectedAnchors.length}</b></span>
          <span><small>Trạng thái</small><b>{selectedAnchors.some(a=>a.sourceKind==='PUBLISHED')?'Đã đăng ký 3D':'Tham chiếu học tập'}</b></span>
        </div>
        {selectedDocumentRef&&<small className="meridian3d-source-label" data-document-reference="true">{selectedDocumentRef.label} · {selectedDocumentRef.heading}</small>}
        {schematic.sourceSideWarnings?.some(w=>w.pointCode===selectedRecord.code)&&<small role="status">Nguồn sơ đồ có dữ liệu hai bên không thống nhất với kinh giữa thân tại huyệt này; giữ nhãn tham chiếu học tập.</small>}
        <span>{selectedAnchors.some(a=>a.sourceKind==='PUBLISHED')?'Có tọa độ BodyParts3D đã đăng ký.':'Chưa có tọa độ BodyParts3D đã đăng ký. '}{selectedAnchors.length?selectedAnchors.map(a=>a.side+': '+(a.sourceKind==='PUBLISHED'?'đã đăng ký':a.sourceKind==='LOCAL_DRAFT'?'nháp trên máy':'sơ đồ nguồn mở')).join(' · '):'Chưa có vị trí trên mô hình.'}</span>
        <small>Ứng dụng học tập: giáo trình/tài liệu được dùng làm căn cứ tra cứu và gắn nhãn nguồn; hình 2D không tự động trở thành tọa độ 3D chuẩn.</small>
      </div>}
      <footer>Nguồn hình học sơ đồ: FuriaRozkwit/acupuncture-3d. Tài liệu nội bộ được ghi nguồn theo trang; nguồn ngoài được kiểm tra giấy phép. BL-39 chưa có đoạn nối trong dữ liệu nguồn.</footer>
    </aside>}
  </>;
}

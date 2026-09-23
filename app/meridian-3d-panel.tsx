import {useEffect,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import type {StudyCommand} from './yhct-study-panel';
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
type SchematicSpatial={anchors:MeridianSceneAnchor[];paths:MeridianScenePath[];source?:{repository?:string;commit?:string;license?:string};calibration?:{status?:string;method?:string;documentTitle?:string;documentSourceId?:string};omittedTopology?:string[];sourceSideWarnings?:{pointCode:string;reason:string}[]};

interface Props{drafts:AcupointAnchorDraft[];selectedPointCode:string|null;studyCommand:(StudyCommand&{seq:number})|null;onStudyAction:(command:StudyCommand)=>void;onOverlayChange:(overlay:MeridianOverlayState)=>void;onFocus:(target:MeridianFocusTarget|null)=>void}

const norm=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const sideLabel=(side:MeridianOverlaySide)=>side==='BOTH'?'Hai bên':side==='LEFT'?'Trái':'Phải';
const MERIDIAN_ZH:Record<string,string>={LU:'手太阴肺经',LI:'手阳明大肠经',ST:'足阳明胃经',SP:'足太阴脾经',HT:'手少阴心经',SI:'手太阳小肠经',BL:'足太阳膀胱经',KI:'足少阴肾经',PC:'手厥阴心包经',TE:'手少阳三焦经',GB:'足少阳胆经',LR:'足厥阴肝经',CV:'任脉',GV:'督脉'};
const MAIN_MERIDIAN_IDS=['LU','LI','ST','SP','HT','SI','BL','KI','PC','TE','GB','LR'] as const;
const MIDLINE_MERIDIAN_IDS=['CV','GV'] as const;
const ALL_MAIN_MERIDIANS='ALL';

export default function Meridian3DPanel({drafts,selectedPointCode,studyCommand,onStudyAction,onOverlayChange,onFocus}:Props){
  const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false);
  const [motion,setMotion]=useState(true),[showMeridians,setShowMeridians]=useState(true),[showPoints,setShowPoints]=useState(true),[showCollaterals,setShowCollaterals]=useState(false);
  const [language,setLanguage]=useState<Language>('vi');
  const [meridians,setMeridians]=useState<Meridian[]>([]),[points,setPoints]=useState<Acupoint[]>([]);
  const [schematic,setSchematic]=useState<SchematicSpatial>({anchors:[],paths:[]});
  const [activeMeridian,setActiveMeridian]=useState(ALL_MAIN_MERIDIANS),[side,setSide]=useState<MeridianOverlaySide>('BOTH');
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

  useEffect(()=>{
    if(!studyCommand)return;
    const command=studyCommand;
    const point=command.pointCode?points.find(item=>item.code===command.pointCode):undefined;
    const meridianId=command.meridianId??point?.meridianId;
    if(meridianId)setActiveMeridian(meridianId);
    if(command.effects){
      if(typeof command.effects.motion==='boolean')setMotion(command.effects.motion);
      if(typeof command.effects.meridians==='boolean')setShowMeridians(command.effects.meridians);
      if(typeof command.effects.acupoints==='boolean')setShowPoints(command.effects.acupoints);
      if(typeof command.effects.collaterals==='boolean')setShowCollaterals(command.effects.collaterals);
    }
    setEnabled(true);setOpen(true);
    if(point){
      setSelected(point.code);setQuery('');
      const candidates=allAnchors.filter(a=>a.pointCode===point.code),anchor=candidates[0];
      if(anchor)onFocus({key:'study:'+studyCommand.seq+':'+point.code+':'+anchor.side,pointCode:point.code,x:anchor.x,y:anchor.y,z:anchor.z});
      else onFocus(null);
    }
  },[studyCommand?.seq,points,allAnchors,onFocus]);

  const activeMeridianIds=useMemo(()=>activeMeridian===ALL_MAIN_MERIDIANS?[...MAIN_MERIDIAN_IDS]:[activeMeridian],[activeMeridian]);
  const matchesSide=(candidate:MeridianOverlaySide|'MIDLINE'|'UNKNOWN'|undefined)=>side==='BOTH'||candidate===side||candidate==='MIDLINE'||candidate==='UNKNOWN'||candidate===undefined;
  const visibleAnchors=useMemo(()=>allAnchors.filter(a=>activeMeridianIds.includes(a.meridianId)&&matchesSide(a.side)),[allAnchors,activeMeridianIds,side]);
  const visiblePaths=useMemo(()=>activeMeridianIds.flatMap(id=>{
    const reviewed=publishedPaths.filter(p=>p.meridianId===id&&matchesSide(p.side));
    if(reviewed.length)return reviewed;
    return schematic.paths.filter(p=>p.meridianId===id&&matchesSide(p.side));
  }),[publishedPaths,schematic.paths,activeMeridianIds,side]);

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

  const filteredPoints=useMemo(()=>{const q=norm(query),codeQuery=q.replace(/[-\s]/g,'');return points.filter(p=>q?p.code.toLowerCase().replace(/-/g,'').includes(codeQuery)||[p.vietnameseName??'',p.englishName??'',p.chineseName??'',p.pinyin??''].some(v=>norm(v).includes(q)):activeMeridianIds.includes(p.meridianId)).slice(0,80)},[points,activeMeridianIds,query]);
  const active=meridians.find(m=>m.id===activeMeridian),selectedRecord=points.find(p=>p.code===selected),selectedAnchors=allAnchors.filter(a=>a.pointCode===selected);
  const activePointCount=points.filter(p=>activeMeridianIds.includes(p.meridianId)).length;
  const activeLabel=activeMeridian===ALL_MAIN_MERIDIANS?'12 chính kinh':meridianName(active);
  const publishedCount=publishedAnchors.filter(a=>activeMeridianIds.includes(a.meridianId)).length,draftCount=draftAnchors.filter(a=>activeMeridianIds.includes(a.meridianId)).length,schematicCount=schematic.anchors.filter(a=>activeMeridianIds.includes(a.meridianId)).length;
  const selectedMeridianPoints=selectedRecord?points.filter(p=>p.meridianId===selectedRecord.meridianId).sort((a,b)=>a.sequence-b.sequence):[];
  const selectedIndex=selectedRecord?selectedMeridianPoints.findIndex(p=>p.code===selectedRecord.code):-1;

  const selectMeridian=(id:string)=>{setActiveMeridian(id);setEnabled(true);setMotion(true);setShowMeridians(true);setQuery('');setSelected(null);onFocus(null)};
  const focusPoint=(point:Acupoint)=>{
    setSelected(point.code);setActiveMeridian(point.meridianId);setEnabled(true);
    const candidates=allAnchors.filter(a=>a.pointCode===point.code);
    const anchor=(side==='LEFT'||side==='RIGHT')?candidates.find(a=>a.side===side)||candidates[0]:candidates[0];
    if(!anchor){onFocus(null);return}
    onFocus({key:point.code+':'+anchor.side+':'+Date.now(),pointCode:point.code,x:anchor.x,y:anchor.y,z:anchor.z});
  };
  const moveSelected=(delta:number)=>{
    if(!selectedMeridianPoints.length||selectedIndex<0)return;
    const next=selectedMeridianPoints[(selectedIndex+delta+selectedMeridianPoints.length)%selectedMeridianPoints.length];
    if(next)focusPoint(next);
  };

  return <>
    <Button variant="ghost" className={'meridian3d-launch '+(enabled?'active':'')} onClick={()=>open?setOpen(false):(setOpen(true),setEnabled(true))} aria-pressed={enabled} aria-expanded={open} aria-label="Mở mô hình kinh lạc 3D" data-meridian3d-launch="true">
      <strong>Đồ hình Kinh lạc 3D</strong>
      <span>{loading?'Đang tải dữ liệu…':loadError?'Chưa tải được dữ liệu — bấm để thử lại':`${points.length} huyệt · 12 chính kinh + Nhâm/Đốc · tìm huyệt và bay tới 3D`}</span>
    </Button>
    {open&&<aside className="meridian3d-panel glass" data-meridian3d-panel="true" aria-label="Mô hình kinh lạc và huyệt vị 3D">
      <div className="meridian3d-head"><div><strong>Đồ hình Kinh lạc 3D · HIU</strong><small>Xoay mô hình, xem đồng thời 12 chính kinh, chọn từng kinh hoặc tìm huyệt để bay tới vị trí 3D đã được hiệu chỉnh theo mốc giải phẫu.</small></div><Button variant="ghost" onClick={()=>setOpen(false)} aria-label="Đóng mô hình kinh lạc 3D">×</Button></div>
      {loading&&<p role="status">Đang tải dữ liệu huyệt và kinh lạc…</p>}
      {loadError&&<div role="alert" data-meridian3d-load-error="true"><p>{loadError}</p><Button variant="ghost" disabled={loading} onClick={()=>setLoadAttempt(v=>v+1)}>Thử tải lại dữ liệu</Button></div>}
      <div className="meridian3d-controls">
        <label>Kinh<select value={activeMeridian} onChange={e=>selectMeridian(e.target.value)}><option value={ALL_MAIN_MERIDIANS}>12 chính kinh · Hiển thị đồng thời</option>{meridians.map(m=><option key={m.id} value={m.id}>{m.code} · {meridianName(m)}</option>)}</select></label>
        <label>Bên<select value={side} onChange={e=>setSide(e.target.value as MeridianOverlaySide)}><option value="BOTH">Hai bên</option><option value="LEFT">Trái</option><option value="RIGHT">Phải</option></select></label>
        <label>Ngôn ngữ phụ<select value={language} onChange={e=>setLanguage(e.target.value as Language)} data-meridian-language="true"><option value="vi">Chỉ tiếng Việt</option><option value="en">Kèm tiếng Anh</option><option value="zh">Kèm tiếng Trung</option></select></label>
      </div>
      <div className="meridian3d-quick" aria-label="Chọn nhanh đường kinh">
        <button type="button" data-meridian-scope="ALL" className={activeMeridian===ALL_MAIN_MERIDIANS?'active primary':''} onClick={()=>selectMeridian(ALL_MAIN_MERIDIANS)}>12 chính kinh</button>
        {MAIN_MERIDIAN_IDS.map(id=>{const m=meridians.find(item=>item.id===id);return <button type="button" key={id} data-meridian-scope={id} className={activeMeridian===id?'active':''} onClick={()=>selectMeridian(id)}><b>{id}</b><span>{m?.vietnameseName?.replace(/^Kinh\s+/,'')||id}</span></button>})}
        <small>Mạch giữa thân</small>
        {MIDLINE_MERIDIAN_IDS.map(id=>{const m=meridians.find(item=>item.id===id);return <button type="button" key={id} data-meridian-scope={id} className={activeMeridian===id?'active':''} onClick={()=>selectMeridian(id)}><b>{id}</b><span>{m?.vietnameseName?.replace(/^Kinh\s+/,'')||id}</span></button>})}
      </div>
      <div className="meridian3d-summary">
        <strong>{activeLabel}</strong>
        <span>{activePointCount} huyệt · {sideLabel(side)} · {schematicCount} vị trí 3D đã hiệu chỉnh · {publishedCount} vị trí đã duyệt · {draftCount} vị trí nháp trên máy</span>
        <span>{visiblePaths.length?visiblePaths.length+' đường/đoạn 3D đang hiển thị':'Chưa có đường kinh 3D — không tự nối điểm'}</span>
        {showCollaterals&&<span role="status">Chưa có dữ liệu đường lạc phù hợp để hiển thị.</span>}
      </div>
      <div className="meridian3d-model-controls" data-meridian3d-model-controls="true">
        <div><span>Góc nhìn</span><button type="button" data-meridian-view="three-quarter" onClick={()=>onStudyAction({view:'three-quarter'})}>¾</button><button type="button" data-meridian-view="front" onClick={()=>onStudyAction({view:'front'})}>Trước</button><button type="button" data-meridian-view="side" onClick={()=>onStudyAction({view:'side'})}>Bên</button><button type="button" data-meridian-view="back" onClick={()=>onStudyAction({view:'back'})}>Sau</button></div>
        <div><span>Nền giải phẫu</span><button type="button" data-anatomy-preset="surface" onClick={()=>onStudyAction({anatomyPreset:'surface'})}>Bề mặt</button><button type="button" data-anatomy-preset="muscle-landmarks" onClick={()=>onStudyAction({anatomyPreset:'muscle-landmarks'})}>Cơ mốc</button><button type="button" data-anatomy-preset="skeleton" onClick={()=>onStudyAction({anatomyPreset:'skeleton'})}>Xương</button></div>
      </div>
      <Button variant="ghost" data-exit-meridians="true" onClick={()=>{setEnabled(false);setOpen(false);onFocus(null);onStudyAction({anatomyPreset:'surface',view:'three-quarter'})}}>Về giải phẫu</Button>
      <div className="meridian3d-effect-controls" data-meridian3d-effect-controls="true" aria-label="Điều khiển hiệu ứng kinh lạc">
        <button type="button" data-effect-master="true" aria-pressed={enabled} className={enabled?'active':''} onClick={()=>setEnabled(v=>!v)}>Hiệu ứng: {enabled?'Bật':'Tắt'}</button>
        <button type="button" data-effect-motion="true" aria-pressed={motion} className={motion?'active':''} onClick={()=>setMotion(v=>!v)}>Chuyển động</button>
        <button type="button" data-effect-meridian="true" aria-pressed={showMeridians} className={showMeridians?'active':''} onClick={()=>setShowMeridians(v=>!v)}>Kinh</button>
        <button type="button" data-effect-collateral="true" aria-disabled="true" disabled title="Chưa có dữ liệu đường lạc đã thẩm định để hiển thị">Lạc · chưa dữ liệu</button>
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
          <span><small>Thứ tự</small><b>{selectedRecord.sequence}</b></span><span><small>Mã huyệt</small><b>{selectedRecord.code}</b></span>
          <span><small>Vị trí đang có</small><b>{selectedAnchors.length}</b></span>
          <span><small>Trạng thái</small><b>{selectedAnchors.length?'Đã có tọa độ 3D trên mô hình':'Chưa có tọa độ 3D'}</b></span>
        </div>
        <div className="meridian3d-point-nav" aria-label="Điều hướng huyệt trong cùng đường kinh">
          <button type="button" onClick={()=>moveSelected(-1)} disabled={selectedMeridianPoints.length<2}>← Huyệt trước</button>
          <span>{selectedIndex>=0?selectedIndex+1:0}/{selectedMeridianPoints.length}</span>
          <button type="button" onClick={()=>moveSelected(1)} disabled={selectedMeridianPoints.length<2}>Huyệt sau →</button>
        </div>
        <span>{selectedAnchors.length?selectedAnchors.map(a=>a.side+': tọa độ 3D').join(' · '):'Chưa có vị trí trên mô hình.'}</span>
      </div>}
      <details className="meridian3d-info" data-spatial-source-license="true"><summary>Thông tin & nguồn tham khảo</summary><p><b>Tài liệu đối chiếu:</b> {schematic.calibration?.documentTitle??'Huyệt Vị Kinh Lạc Cơ Thể Người — Ngô Trung Triều, NXB Hồng Đức'}.</p><p><b>Mô hình giải phẫu:</b> BodyParts3D 4.0. Tọa độ huyệt được tính từ mốc giải phẫu, quy đổi theo thốn/tỷ lệ vùng khi có, sau đó chiếu ray lên bề mặt da BodyParts3D FMA7163.</p><p><b>Dữ liệu anchor/topology:</b> {schematic.source?.repository??'FuriaRozkwit/acupuncture-3d'}; giấy phép {schematic.source?.license??'MIT / CC BY-SA theo thành phần'}.</p><p>361 huyệt thuộc 12 chính kinh + Nhâm/Đốc đều có tọa độ 3D. BL-39 có tọa độ huyệt nhưng nguồn topology hiện không cung cấp đoạn nối nên ứng dụng không tự bịa đường nối qua BL-39.</p></details>
    </aside>}
  </>;
}


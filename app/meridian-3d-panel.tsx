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

type Meridian={
  id:string;
  code:string;
  vietnameseName:string;
  englishName:string;
  pointIds:string[];
  path3d:number[][];
  reviewStatus:string;
  spatialStatus:string;
};

type Acupoint={
  code:string;
  meridianId:string;
  sequence:number;
  vietnameseName?:string|null;
  englishName?:string|null;
  position3d?:{
    x:number;
    y:number;
    z:number;
    coordinateSystem?:string;
    source?:string;
  }|null;
  reviewStatus?:string;
  verificationStatus?:string;
};

interface Props{
  drafts:AcupointAnchorDraft[];
  selectedPointCode:string|null;
  onOverlayChange:(overlay:MeridianOverlayState)=>void;
  onFocus:(target:MeridianFocusTarget|null)=>void;
}

const norm=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();

const sideLabel=(side:MeridianOverlaySide)=>side==='BOTH'?'Hai bên':side==='LEFT'?'Trái':'Phải';

export default function Meridian3DPanel({drafts,selectedPointCode,onOverlayChange,onFocus}:Props){
  const [open,setOpen]=useState(false);
  const [enabled,setEnabled]=useState(false);
  const [meridians,setMeridians]=useState<Meridian[]>([]);
  const [points,setPoints]=useState<Acupoint[]>([]);
  const [activeMeridian,setActiveMeridian]=useState('ST');
  const [side,setSide]=useState<MeridianOverlaySide>('BOTH');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<string|null>(null);

  useEffect(()=>{
    let alive=true;
    Promise.all([
      fetch(import.meta.env.BASE_URL+'data/meridians.json').then(async response=>{
        if(!response.ok)throw new Error('meridian data unavailable');
        return await response.json() as Meridian[];
      }),
      fetch(import.meta.env.BASE_URL+'data/acupoints.json').then(async response=>{
        if(!response.ok)throw new Error('acupoint data unavailable');
        return await response.json() as Acupoint[];
      })
    ]).then(([m,p])=>{if(alive){setMeridians(m);setPoints(p)}}).catch(()=>{});
    return()=>{alive=false};
  },[]);

  useEffect(()=>{
    if(!selectedPointCode)return;
    const point=points.find(item=>item.code===selectedPointCode);
    if(point)setActiveMeridian(point.meridianId);
    setSelected(selectedPointCode);
    setEnabled(true);
    setOpen(true);
  },[selectedPointCode,points]);

  const draftAnchors=useMemo(()=>drafts.map(draftToSceneAnchor),[drafts]);

  const publishedAnchors=useMemo<MeridianSceneAnchor[]>(()=>points.flatMap(point=>{
    const position=point.position3d;
    const status=point.reviewStatus??point.verificationStatus??'UNVERIFIED';
    if(!position||!['FACULTY_REVIEWED','PUBLISHED'].includes(status))return [];
    if(![position.x,position.y,position.z].every(Number.isFinite))return [];
    return [{
      pointCode:point.code,
      meridianId:point.meridianId,
      sequence:point.sequence,
      side:(point.meridianId==='CV'||point.meridianId==='GV'?'MIDLINE':'UNKNOWN') as MeridianSceneAnchor['side'],
      x:position.x,
      y:position.y,
      z:position.z,
      verificationStatus:status as MeridianSceneAnchor['verificationStatus'],
      sourceKind:'PUBLISHED' as const
    }];
  }),[points]);

  const publishedPaths=useMemo<MeridianScenePath[]>(()=>meridians.flatMap(meridian=>{
    if(!['FACULTY_REVIEWED','PUBLISHED'].includes(meridian.reviewStatus))return [];
    if(!Array.isArray(meridian.path3d)||meridian.path3d.length<2)return [];
    const valid=meridian.path3d.every(point=>Array.isArray(point)&&point.length===3&&point.every(Number.isFinite));
    if(!valid)return [];
    return [{
      meridianId:meridian.id,
      points:meridian.path3d.map(point=>[point[0],point[1],point[2]] as [number,number,number]),
      verificationStatus:meridian.reviewStatus as 'FACULTY_REVIEWED'|'PUBLISHED'
    }];
  }),[meridians]);

  const allAnchors=useMemo(()=>{
    const publishedCodes=new Set(publishedAnchors.map(anchor=>anchor.pointCode+':'+anchor.side));
    return publishedAnchors.concat(draftAnchors.filter(anchor=>!publishedCodes.has(anchor.pointCode+':'+anchor.side)));
  },[publishedAnchors,draftAnchors]);

  const visibleAnchors=useMemo(()=>allAnchors.filter(anchor=>
    anchor.meridianId===activeMeridian
    &&(side==='BOTH'||anchor.side===side||anchor.side==='MIDLINE'||anchor.side==='UNKNOWN')
  ),[allAnchors,activeMeridian,side]);

  const visiblePaths=useMemo(()=>publishedPaths.filter(path=>path.meridianId===activeMeridian),[publishedPaths,activeMeridian]);

  useEffect(()=>{
    onOverlayChange({
      enabled,
      meridianId:activeMeridian,
      side,
      anchors:visibleAnchors,
      paths:visiblePaths
    });
  },[enabled,activeMeridian,side,visibleAnchors,visiblePaths,onOverlayChange]);

  const filteredPoints=useMemo(()=>{
    const q=norm(query);
    return points
      .filter(point=>point.meridianId===activeMeridian)
      .filter(point=>!q||[point.code,point.vietnameseName??'',point.englishName??''].some(value=>norm(value).includes(q)))
      .slice(0,80);
  },[points,activeMeridian,query]);

  const active=meridians.find(meridian=>meridian.id===activeMeridian);
  const selectedRecord=points.find(point=>point.code===selected);
  const selectedAnchors=allAnchors.filter(anchor=>anchor.pointCode===selected);
  const publishedCount=publishedAnchors.filter(anchor=>anchor.meridianId===activeMeridian).length;
  const draftCount=draftAnchors.filter(anchor=>anchor.meridianId===activeMeridian).length;

  const focusPoint=(point:Acupoint)=>{
    setSelected(point.code);
    const candidates=allAnchors.filter(anchor=>anchor.pointCode===point.code);
    const anchor=(side==='LEFT'||side==='RIGHT')
      ?candidates.find(item=>item.side===side)||candidates[0]
      :candidates[0];
    if(!anchor){onFocus(null);return}
    onFocus({
      key:`${point.code}:${anchor.side}:${anchor.x.toFixed(5)}:${anchor.y.toFixed(5)}:${anchor.z.toFixed(5)}`,
      pointCode:point.code,
      x:anchor.x,
      y:anchor.y,
      z:anchor.z
    });
  };

  const openViewer=()=>{
    setOpen(true);
    setEnabled(true);
  };

  return <>
    <Button
      variant="ghost"
      className={`meridian3d-launch ${enabled?'active':''}`}
      onClick={()=>open?setOpen(false):openViewer()}
      aria-label="Mở mô hình kinh lạc 3D"
      data-meridian3d-launch="true"
    >
      <strong>Kinh lạc 3D</strong>
      <span>{publishedAnchors.length} duyệt · {draftAnchors.length} nháp local</span>
    </Button>
    {open&&<aside className="meridian3d-panel glass" data-meridian3d-panel="true" aria-label="Mô hình kinh lạc và huyệt vị 3D">
      <div className="meridian3d-head">
        <div>
          <strong>Mô hình kinh lạc · huyệt vị 3D</strong>
          <small>Clean-room UX · chỉ hiển thị tọa độ có bằng chứng hoặc bản nháp local</small>
        </div>
        <Button variant="ghost" onClick={()=>setOpen(false)} aria-label="Đóng mô hình kinh lạc 3D">×</Button>
      </div>

      <div className="meridian3d-controls">
        <label>Kinh
          <select value={activeMeridian} onChange={event=>{setActiveMeridian(event.target.value);setSelected(null);onFocus(null)}}>
            {meridians.map(meridian=><option key={meridian.id} value={meridian.id}>{meridian.code} · {meridian.vietnameseName}</option>)}
          </select>
        </label>
        <label>Bên
          <select value={side} onChange={event=>setSide(event.target.value as MeridianOverlaySide)}>
            <option value="BOTH">Hai bên</option>
            <option value="LEFT">Trái</option>
            <option value="RIGHT">Phải</option>
          </select>
        </label>
      </div>

      <div className="meridian3d-summary">
        <strong>{active?.vietnameseName??activeMeridian}</strong>
        <span>{sideLabel(side)} · {publishedCount} anchor đã duyệt · {draftCount} anchor nháp local</span>
        <span>{visiblePaths.length?'Có đường kinh 3D đã kiểm duyệt':'Chưa có path 3D đã kiểm duyệt — không tự nối điểm'}</span>
      </div>

      <div className="meridian3d-actions">
        <Button variant="ghost" className={enabled?'active':''} onClick={()=>setEnabled(value=>!value)}>
          {enabled?'Ẩn khỏi mô hình':'Hiện trên mô hình'}
        </Button>
        <a href="https://kinhlac.online/xem-3d/" target="_blank" rel="noreferrer">Đối chiếu kinhlac.online ↗</a>
      </div>

      <input
        className="meridian3d-search"
        value={query}
        onChange={event=>setQuery(event.target.value)}
        placeholder="Tìm ST-36, LI-4…"
        aria-label="Tìm huyệt để bay tới"
      />

      <div className="meridian3d-list">
        {filteredPoints.map(point=>{
          const anchors=allAnchors.filter(anchor=>anchor.pointCode===point.code);
          const spatial=anchors.length>0;
          return <button key={point.code} onClick={()=>focusPoint(point)} data-meridian3d-point={point.code}>
            <b>{point.code}</b>
            <span>{point.vietnameseName||point.englishName||'Huyệt chuẩn'}</span>
            <small>{spatial?`${anchors.length} anchor 3D · bấm để bay tới`:'chưa có anchor 3D'}</small>
          </button>
        })}
      </div>

      {selectedRecord&&<div className="meridian3d-detail" data-meridian3d-detail="true">
        <strong>{selectedRecord.code}{selectedRecord.vietnameseName?' · '+selectedRecord.vietnameseName:''}</strong>
        <span>{selectedAnchors.length
          ?selectedAnchors.map(anchor=>`${anchor.side}: ${anchor.sourceKind==='PUBLISHED'?'đã duyệt':'nháp local · UNVERIFIED'}`).join(' · ')
          :'Chưa có tọa độ BodyParts3D đã đăng ký.'}</span>
        <small>Bấm marker trên cơ thể hoặc chọn huyệt trong danh sách. Dữ liệu nháp không được coi là tọa độ xuất bản.</small>
      </div>}

      <footer>
        Mẫu tương tác tham chiếu hành vi công khai của kinhlac.online: xoay 3D, chọn kinh, bấm huyệt, tìm kiếm/bay tới huyệt. Không sao chép mã nguồn, mô hình hay cơ sở dữ liệu của website.
      </footer>
    </aside>}
  </>;
}

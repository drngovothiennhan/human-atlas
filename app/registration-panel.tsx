import {useEffect,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import {
  BODY_CANONICAL_COORDINATE_SYSTEM,
  type AcupointAnchorDraft,
  type RegistrationSide,
  type SurfaceCapture
} from '../src/acupoints/registration/coordinate-system';

type PilotTarget={
  pointCode:string;
  meridianId:string;
  requiredSides:RegistrationSide[];
  geometrySource:string;
  locationReferenceSources:string[];
  referenceOnlyLabel:string;
  status:string;
  anchors:AcupointAnchorDraft[];
};
type PilotFile={schemaVersion:string;coordinateSystem:string;policy:string;pilot:PilotTarget[]};
type Target={pointCode:string;side:RegistrationSide};
interface Props{target:Target;capture:SurfaceCapture|null;onTargetChange:(target:Target)=>void}

const STORAGE_KEY='hiu-yhct-registration-drafts-v0.1';

export default function RegistrationPanel({target,capture,onTargetChange}:Props){
  const [pilot,setPilot]=useState<PilotFile|null>(null);
  const [drafts,setDrafts]=useState<AcupointAnchorDraft[]>([]);

  useEffect(()=>{
    let live=true;
    fetch('/data/registration-pilot.json')
      .then(response=>{if(!response.ok)throw new Error('registration pilot unavailable');return response.json();})
      .then((data:unknown)=>{if(live)setPilot(data as PilotFile);})
      .catch(()=>{});
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      if(saved)setDrafts(JSON.parse(saved));
    }catch{}
    return()=>{live=false;};
  },[]);

  const active=useMemo(
    ()=>pilot?.pilot.find(point=>point.pointCode===target.pointCode)??pilot?.pilot[0]??null,
    [pilot,target.pointCode]
  );

  useEffect(()=>{
    if(active&&active.pointCode!==target.pointCode){
      onTargetChange({pointCode:active.pointCode,side:'LEFT'});
    }
  },[active,target.pointCode,onTargetChange]);

  useEffect(()=>{
    if(!capture||!active)return;
    const draft:AcupointAnchorDraft={
      ...capture,
      pointCode:active.pointCode,
      side:target.side,
      geometrySource:active.geometrySource,
      locationReferenceSources:active.locationReferenceSources,
      verificationStatus:'UNVERIFIED',
      capturedAt:new Date().toISOString(),
      reviewer:null,
      reviewedAt:null
    };
    setDrafts(current=>{
      const next=current
        .filter(item=>!(item.pointCode===draft.pointCode&&item.side===draft.side))
        .concat(draft);
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{}
      return next;
    });
  },[capture,active,target.side]);

  const currentDraft=drafts.find(item=>item.pointCode===target.pointCode&&item.side===target.side);

  const exportDrafts=()=>{
    const payload={
      schemaVersion:'0.1.0',
      coordinateSystem:BODY_CANONICAL_COORDINATE_SYSTEM,
      reviewState:'UNVERIFIED',
      drafts
    };
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download='hiu-yhct-registration-draft.json';
    anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  };

  const google='https://www.google.com/search?q='+
    encodeURIComponent((active?.pointCode??target.pointCode)+' acupuncture point location anatomy');

  return <aside className="registration-panel" data-registration-panel="true" aria-label="BodyParts3D acupoint registration">
    <div className="registration-kicker">Faculty review staging · không xuất bản runtime</div>
    <h2>Đăng ký anchor BodyParts3D</h2>
    <p>Chạm trực tiếp lên bề mặt cơ thể để ghi triangle, barycentric và XYZ chuẩn BodyParts3D. Mọi điểm mới luôn ở trạng thái UNVERIFIED.</p>
    <div className="registration-grid">
      <label>Huyệt
        <select value={target.pointCode} onChange={event=>onTargetChange({pointCode:event.target.value,side:target.side})}>
          {pilot?.pilot.map(point=><option key={point.pointCode} value={point.pointCode}>{point.pointCode}</option>)}
        </select>
      </label>
      <label>Bên
        <select value={target.side} onChange={event=>onTargetChange({pointCode:target.pointCode,side:event.target.value as RegistrationSide})}>
          <option value="LEFT">LEFT</option>
          <option value="RIGHT">RIGHT</option>
        </select>
      </label>
    </div>
    <p className="registration-note">{active?.referenceOnlyLabel??'Tham khảo Google/nguồn công khai – không tái sử dụng dữ liệu'}</p>
    <a href={google} target="_blank" rel="noreferrer">Mở tham khảo Google cho {target.pointCode}</a>
    {currentDraft
      ?<div className="capture-card">
        <strong>Đã ghi bản nháp {currentDraft.pointCode} · {currentDraft.side}</strong>
        <code>{currentDraft.surfaceStructureName} · triangle {currentDraft.triangleIndex}</code>
        <code>xyz {currentDraft.x.toFixed(6)}, {currentDraft.y.toFixed(6)}, {currentDraft.z.toFixed(6)}</code>
        <code>bary {currentDraft.barycentric.map(value=>value.toFixed(5)).join(', ')}</code>
      </div>
      :<div className="capture-card">
        <strong>Chưa có anchor cho lựa chọn này</strong>
        <code>Chạm bề mặt da trên mô hình để ghi bản nháp.</code>
      </div>}
    <div className="registration-actions">
      <Button variant="ghost" onClick={exportDrafts} disabled={!drafts.length}>Xuất JSON kiểm duyệt ({drafts.length})</Button>
    </div>
    <p className="registration-note">Đường kinh chỉ được sinh từ anchor FACULTY_REVIEWED/PUBLISHED; bản nháp UNVERIFIED bị gate chặn.</p>
  </aside>;
}

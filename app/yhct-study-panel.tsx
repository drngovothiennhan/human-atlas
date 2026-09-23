import {useEffect,useMemo,useState} from 'react';

type Meridian={
  id:string;
  code:string;
  vietnameseName:string;
  englishName:string;
  pointIds:string[];
  path3d:number[][];
  reviewStatus:string;
  spatialStatus:string;
  sources:string[];
  referenceUrl?:string|null;
};
type Acupoint={
  id:string;
  code:string;
  meridianId:string;
  sequence:number;
  vietnameseName?:string|null;
  englishName?:string|null;
  pinyin?:string|null;
  chineseName?:string|null;
  position3d?:{x:number;y:number;z:number}|null;
  references?:string[];
  sources?:string[];
  spatialStatus?:string;
  reviewStatus?:string;
  verificationStatus?:string;
};
type SchematicAnchor={pointCode:string;meridianId:string;sequence:number;side:string;x:number;y:number;z:number;sourceKind?:string;verificationStatus?:string};
type SchematicSpatial={anchors:SchematicAnchor[];paths:{meridianId:string;points:number[][]}[]};
type Tab='points'|'meridians'|'anatomy'|'assistant';
type StudyMode='explore'|'study'|'quiz'|'simulation'|null;

export type StudyCommand={
  meridianId?:string;
  pointCode?:string;
  view?:'three-quarter'|'front'|'side'|'back';
  anatomyPreset?:'surface'|'muscle-landmarks'|'skeleton';
  effects?:Partial<{motion:boolean;meridians:boolean;acupoints:boolean;collaterals:boolean}>;
};

interface Props{
  localDraftCount:number;
  onStudyCommand:(command:StudyCommand)=>void;
}

const norm=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const canonicalPointCode=(v:string)=>{
  const compact=v.trim().toUpperCase().replace(/[\s_-]+/g,'');
  const match=compact.match(/^([A-Z]+)(\d+)$/);
  return match?`${match[1]}-${Number(match[2])}`:compact;
};
const googleReference=(query:string)=>`https://www.google.com/search?q=${encodeURIComponent(query)}`;

export default function YhctStudyPanel({localDraftCount,onStudyCommand}:Props){
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState<Tab>('meridians');
  const [meridians,setMeridians]=useState<Meridian[]>([]);
  const [points,setPoints]=useState<Acupoint[]>([]);
  const [schematic,setSchematic]=useState<SchematicSpatial>({anchors:[],paths:[]});
  const [catalogError,setCatalogError]=useState(false);
  const [spatialError,setSpatialError]=useState(false);
  const [loadAttempt,setLoadAttempt]=useState(0);
  const [query,setQuery]=useState('');
  const [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState('Tra cứu cục bộ sẽ trả lời từ catalog đã nạp trong ứng dụng.');
  const [mode,setMode]=useState<StudyMode>(null);
  const [modeMessage,setModeMessage]=useState('');
  const [studyMeridian,setStudyMeridian]=useState('ST');
  const [studyIndex,setStudyIndex]=useState(0);
  const [exploreIndex,setExploreIndex]=useState(0);
  const [quizIndex,setQuizIndex]=useState(0);
  const [quizResult,setQuizResult]=useState('');
  const [simulation,setSimulation]=useState({motion:true,meridians:true,acupoints:true});

  useEffect(()=>{
    let alive=true;
    setCatalogError(false);setSpatialError(false);
    Promise.all([
      fetch(import.meta.env.BASE_URL+'data/meridians.json').then(async r=>{if(!r.ok)throw new Error('meridians');return await r.json() as Meridian[]}),
      fetch(import.meta.env.BASE_URL+'data/acupoints.json').then(async r=>{if(!r.ok)throw new Error('acupoints');return await r.json() as Acupoint[]})
    ]).then(([m,p])=>{if(!Array.isArray(m)||!Array.isArray(p))throw new Error('catalog');if(alive){setMeridians(m);setPoints(p)}})
      .catch(()=>{if(alive)setCatalogError(true)});
    fetch(import.meta.env.BASE_URL+'data/schematic-spatial.json')
      .then(async r=>{if(!r.ok)throw new Error('schematic');return await r.json() as SchematicSpatial})
      .then(s=>{if(!Array.isArray(s.anchors)||!Array.isArray(s.paths))throw new Error('schematic');if(alive)setSchematic(s)})
      .catch(()=>{if(alive)setSpatialError(true)});
    return()=>{alive=false};
  },[loadAttempt]);

  const reviewedPointCount=useMemo(()=>points.filter(p=>Boolean(p.position3d)&&['FACULTY_REVIEWED','PUBLISHED'].includes(p.reviewStatus??p.verificationStatus??'')).length,[points]);
  const schematicUniquePoints=useMemo(()=>new Set(schematic.anchors.map(a=>a.pointCode)).size,[schematic.anchors]);
  const filtered=useMemo(()=>{
    const q=norm(query),canonical=canonicalPointCode(query);
    if(!q)return (tab==='points'?points:meridians).slice(0,80);
    const rows=tab==='points'?points:meridians;
    return rows.filter(row=>{
      const record=row as Acupoint&Meridian;
      if(tab==='points'&&canonicalPointCode(record.code)===canonical)return true;
      return [record.code,record.vietnameseName,record.englishName,record.pinyin,record.chineseName,record.meridianId].filter(Boolean).some(v=>norm(String(v)).includes(q));
    }).slice(0,80);
  },[query,tab,points,meridians]);

  const pointByCode=useMemo(()=>new Map(points.map(p=>[p.code,p])),[points]);
  const studyPoints=useMemo(()=>points.filter(p=>p.meridianId===studyMeridian).sort((a,b)=>a.sequence-b.sequence),[points,studyMeridian]);
  const currentStudyPoint=studyPoints.length?studyPoints[Math.min(studyIndex,studyPoints.length-1)]:null;
  const quizCandidates=useMemo(()=>{
    const unique=[...new Set(schematic.anchors.map(a=>a.pointCode))].map(code=>pointByCode.get(code)).filter((p):p is Acupoint=>Boolean(p));
    return unique;
  },[schematic.anchors,pointByCode]);
  const quizPoint=quizCandidates.length?quizCandidates[quizIndex%quizCandidates.length]:null;
  const quizOptions=useMemo(()=>{
    if(!quizPoint)return[];
    const same=points.filter(p=>p.meridianId===quizPoint.meridianId);
    const start=Math.max(0,same.findIndex(p=>p.code===quizPoint.code));
    const options=[quizPoint,...same.slice(start+1,start+4),...same.slice(Math.max(0,start-3),start)].filter((p,i,a)=>a.findIndex(x=>x.code===p.code)===i).slice(0,4);
    return options.sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
  },[quizPoint,points]);

  const ask=()=>{
    const raw=question.trim(),q=norm(raw),canonical=canonicalPointCode(raw);
    if(!q){setAnswer('Nhập câu hỏi dựa trên dữ liệu đã nạp trong ứng dụng.');return}
    const exactPoint=points.find(p=>canonicalPointCode(p.code)===canonical||q.includes(norm(p.code))||Boolean(p.vietnameseName&&q.includes(norm(p.vietnameseName))));
    if(exactPoint){
      const m=meridians.find(x=>x.id===exactPoint.meridianId),isReviewed=Boolean(exactPoint.position3d)&&['FACULTY_REVIEWED','PUBLISHED'].includes(exactPoint.reviewStatus??exactPoint.verificationStatus??'');
      setAnswer(`${exactPoint.code}${exactPoint.vietnameseName?' · '+exactPoint.vietnameseName:''} thuộc ${m?.vietnameseName||exactPoint.meridianId}. Vị trí BodyParts3D đã duyệt: ${isReviewed?'có':'chưa có'}. Lớp mô phỏng 3D nếu hiện chỉ là tham chiếu học tập. Nguồn catalog: ${(exactPoint.sources||[]).join(', ')||'record cục bộ đã kiểm tra'}.`);
      return;
    }
    const exactMeridian=meridians.find(m=>q.includes(norm(m.code))||q.includes(norm(m.vietnameseName))||q.includes(norm(m.englishName)));
    if(exactMeridian){
      const owned=points.filter(p=>p.meridianId===exactMeridian.id).sort((a,b)=>a.sequence-b.sequence);
      setAnswer(q.includes('huyet')
        ?`${exactMeridian.vietnameseName} có ${owned.length} huyệt trong catalog: ${owned.map(p=>p.code).join(', ')}. Đây là thứ tự danh mục, không phải hướng dẫn châm cứu.`
        :`${exactMeridian.code} · ${exactMeridian.vietnameseName} (${exactMeridian.englishName}). Catalog: ${exactMeridian.pointIds.length} huyệt; điểm đầu ${exactMeridian.pointIds[0]}, điểm cuối ${exactMeridian.pointIds.at(-1)}. Trạng thái dữ liệu nguồn: ${exactMeridian.spatialStatus}. Đường mô phỏng 3D được gắn nhãn UNVERIFIED nếu chưa qua thẩm định.`);
      return;
    }
    setAnswer('Không tìm thấy trong cơ sở dữ liệu cục bộ. Liên kết Google chỉ mở tham khảo bên ngoài; ứng dụng không tự chép kết quả tìm kiếm vào catalog.');
  };

  const focusPoint=(point:Acupoint,message?:string)=>{onStudyCommand({meridianId:point.meridianId,pointCode:point.code});if(message)setModeMessage(message)};
  const startExplore=()=>{
    if(!meridians.length)return;
    const m=meridians[exploreIndex%meridians.length],point=points.find(p=>p.meridianId===m.id);
    if(point){focusPoint(point,`Khám phá ${m.vietnameseName}: mở mô hình 3D tại ${point.code}.`);setExploreIndex(v=>v+1)}
    setMode('explore');
  };
  const startStudy=()=>{
    const selected=meridians.find(m=>m.id===studyMeridian)??meridians[0];
    if(!selected)return;
    setStudyMeridian(selected.id);setStudyIndex(0);setMode('study');setQuizResult('');
    const point=points.filter(p=>p.meridianId===selected.id).sort((a,b)=>a.sequence-b.sequence)[0];
    if(point)focusPoint(point,`Bắt đầu học ${selected.vietnameseName} từ ${point.code}.`);
  };
  const moveStudy=(delta:number)=>{
    if(!studyPoints.length)return;
    const next=(studyIndex+delta+studyPoints.length)%studyPoints.length;setStudyIndex(next);
    focusPoint(studyPoints[next],`${studyPoints[next].code} · ${next+1}/${studyPoints.length} trong kinh đang học.`);
  };
  const startQuiz=()=>{
    if(!quizPoint)return;setMode('quiz');setQuizResult('');
    focusPoint(quizPoint,'Quiz 3D đã đưa camera tới một vị trí mô phỏng. Chọn mã huyệt đúng trong các đáp án.');
  };
  const answerQuiz=(code:string)=>{
    if(!quizPoint)return;
    const correct=code===quizPoint.code;setQuizResult(correct?`Đúng: ${quizPoint.code}.`:`Chưa đúng. Đáp án của lượt này: ${quizPoint.code}.`);
  };
  const nextQuiz=()=>{if(!quizCandidates.length)return;const next=(quizIndex+1)%quizCandidates.length;setQuizIndex(next);setQuizResult('');const p=quizCandidates[next];focusPoint(p,'Đã chuyển sang mục tiêu mô phỏng tiếp theo.')};
  const applySimulation=(next:typeof simulation)=>{
    setSimulation(next);onStudyCommand({meridianId:studyMeridian,pointCode:currentStudyPoint?.code??points.find(p=>p.meridianId===studyMeridian)?.code,effects:{motion:next.motion,meridians:next.meridians,acupoints:next.acupoints}});
  };
  const startSimulation=()=>{setMode('simulation');applySimulation(simulation);setModeMessage('Simulation Lab điều khiển hiệu ứng hiển thị học tập; không mô phỏng dòng chảy sinh lý.')};

  return <>
    <button className="yhct-launch glass" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="yhct-study-panel">
      YHCT <span>{meridians.length} kinh · {points.length} huyệt</span>
    </button>
    {open&&<aside id="yhct-study-panel" className="yhct-panel glass" aria-label="Huyệt vị, kinh lạc và trợ lý học tập">
      <div className="yhct-head">
        <div><strong>Huyệt vị · Kinh lạc</strong><small>HIU CLB YHCT · tra cứu cục bộ · nguồn có kiểm soát</small></div>
        <button onClick={()=>setOpen(false)} aria-label="Đóng bảng YHCT">×</button>
      </div>
      <div className="yhct-stats" data-yhct-spatial-counts="true">
        <span>{points.length}/361 huyệt catalog</span>
        <span>{schematic.anchors.length} vị trí mô phỏng · {schematicUniquePoints} mã huyệt</span>
        <span>{localDraftCount} nháp BodyParts3D · {reviewedPointCount} đã duyệt</span>
      </div>
      {(catalogError||spatialError)&&<div role="alert" data-yhct-load-error="true">
        <p>{catalogError?'Không tải được danh mục kinh huyệt.':'Chưa tải được vị trí mô phỏng 3D. Danh mục kinh huyệt vẫn có thể tra cứu.'}</p>
        <button type="button" onClick={()=>setLoadAttempt(v=>v+1)}>Thử tải lại dữ liệu YHCT</button>
      </div>}
      <div className="yhct-tabs">
        {([['meridians','Kinh'],['points','Huyệt'],['anatomy','Giải phẫu'],['assistant','Trợ lý']] as [Tab,string][]).map(([id,label])=>
          <button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setQuery('')}}>{label}</button>
        )}
      </div>

      {(tab==='meridians'||tab==='points')&&<>
        <input className="yhct-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='points'?'Tìm mã huyệt, ví dụ ST36…':'Tìm mã/tên kinh…'} aria-label="Tìm dữ liệu YHCT"/>
        <div className="yhct-list">
          {filtered.length?filtered.map(row=>tab==='meridians'
            ?<article key={(row as Meridian).id}>
              <b>{(row as Meridian).code}</b>
              <span>{(row as Meridian).vietnameseName||(row as Meridian).englishName}</span>
              <small>{(row as Meridian).pointIds?.length||0} huyệt · đầu {(row as Meridian).pointIds?.[0]||'—'} · cuối {(row as Meridian).pointIds?.at(-1)||'—'}</small>
              <p className="yhct-sequence">{(row as Meridian).pointIds?.length?`${(row as Meridian).pointIds.slice(0,4).join(' → ')} → … → ${(row as Meridian).pointIds.at(-1)}`:'Chưa có chuỗi huyệt.'}</p>
              <div className="yhct-links">
                <button type="button" data-study-meridian={(row as Meridian).id} onClick={()=>{const p=points.find(point=>point.meridianId===(row as Meridian).id);if(p)focusPoint(p,`Mở ${(row as Meridian).vietnameseName} trên mô hình 3D.`)}}>Xem 3D</button>
                {(row as Meridian).referenceUrl&&<a href={(row as Meridian).referenceUrl!} target="_blank" rel="noreferrer">AcuAtlas ↗</a>}
                <a href={googleReference(`${(row as Meridian).code} ${(row as Meridian).vietnameseName} acupuncture meridian`)} target="_blank" rel="noreferrer">Tham khảo Google ↗</a>
              </div>
            </article>
            :<article key={(row as Acupoint).id}>
              <b>{(row as Acupoint).code}</b>
              <span>{(row as Acupoint).vietnameseName||(row as Acupoint).pinyin||(row as Acupoint).englishName||'Tên chi tiết đang chờ nguồn tái sử dụng phù hợp'}</span>
              <small>{(row as Acupoint).meridianId} · {schematic.anchors.some(a=>a.pointCode===(row as Acupoint).code)?'có vị trí mô phỏng':'chưa có vị trí mô phỏng'} · {Boolean((row as Acupoint).position3d)?'có dữ liệu BodyParts3D':'chưa có BodyParts3D đã duyệt'}</small>
              <div className="yhct-links">
                <button type="button" data-study-point={(row as Acupoint).code} onClick={()=>focusPoint(row as Acupoint,`Đã mở ${(row as Acupoint).code} trong Kinh lạc 3D.`)}>Bay tới 3D</button>
                <a href={(row as Acupoint).references?.[0]||'https://acupointatlas.com/acupuncture-points/'} target="_blank" rel="noreferrer">Nguồn catalog ↗</a>
                <a href={googleReference(`${(row as Acupoint).code} acupuncture point WHO`)} target="_blank" rel="noreferrer">Tham khảo Google ↗</a>
              </div>
            </article>)
            :<p>Không có record cục bộ phù hợp.</p>}
        </div>
      </>}

      {tab==='anatomy'&&<div className="yhct-copy">
        <strong>Giải phẫu quanh huyệt</strong>
        <p>Viewer BodyParts3D có 15 nhóm hiển thị gồm xương, cơ, mạch, thần kinh, cơ quan và bề mặt cơ thể. Quan hệ lâm sàng quanh huyệt chỉ được công nhận khi có dữ liệu và thẩm định tương ứng.</p>
        <p className="guard">{schematicUniquePoints} mã huyệt có lớp tọa độ mô phỏng học tập; {reviewedPointCount} huyệt hiện có vị trí BodyParts3D đã duyệt. Không chuyển tọa độ mô phỏng thành hướng dẫn châm cứu.</p>
      </div>}

      {tab==='assistant'&&<div className="yhct-assistant">
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ví dụ: ST36 thuộc kinh nào? / Kinh Phế có những huyệt nào?"/>
        <button onClick={ask}>Tra cứu local</button>
        <p>{answer}</p>
        <small>Đây là tra cứu cục bộ, không phải LLM. Không dùng API key, không gọi cloud AI và không bịa nội dung khi thiếu dữ liệu.</small>
      </div>}

      <div className="yhct-modes" aria-label="Chế độ học YHCT">
        <button data-yhct-mode="explore" className={mode==='explore'?'active':''} onClick={startExplore} disabled={!points.length}>Khám phá</button>
        <button data-yhct-mode="study" className={mode==='study'?'active':''} onClick={startStudy} disabled={!points.length}>Học theo kinh</button>
        <button data-yhct-mode="quiz" className={mode==='quiz'?'active':''} onClick={startQuiz} disabled={!quizCandidates.length}>Quiz 3D</button>
        <button data-yhct-mode="simulation" className={mode==='simulation'?'active':''} onClick={startSimulation} disabled={!quizCandidates.length}>Simulation Lab</button>
      </div>

      {mode==='explore'&&<section className="yhct-mode-panel" data-mode-panel="explore">
        <strong>Khám phá tuần tự</strong><p>{modeMessage||'Mỗi lần bấm Khám phá sẽ chuyển sang kinh kế tiếp và mở vị trí mô phỏng đầu tiên có dữ liệu.'}</p>
        <button onClick={startExplore}>Kinh kế tiếp</button>
      </section>}

      {mode==='study'&&<section className="yhct-mode-panel" data-mode-panel="study">
        <strong>Học theo kinh</strong>
        <label>Kinh<select value={studyMeridian} onChange={e=>{setStudyMeridian(e.target.value);setStudyIndex(0);const p=points.find(point=>point.meridianId===e.target.value);if(p)focusPoint(p)}}>{meridians.map(m=><option key={m.id} value={m.id}>{m.code} · {m.vietnameseName}</option>)}</select></label>
        <p data-study-progress="true">{currentStudyPoint?`${currentStudyPoint.code} · ${studyIndex+1}/${studyPoints.length}`:'Chưa có dữ liệu'}</p>
        <div><button onClick={()=>moveStudy(-1)} disabled={!studyPoints.length}>← Trước</button><button onClick={()=>moveStudy(1)} disabled={!studyPoints.length}>Tiếp →</button></div>
      </section>}

      {mode==='quiz'&&quizPoint&&<section className="yhct-mode-panel" data-mode-panel="quiz">
        <strong>Quiz 3D · nhận diện vị trí mô phỏng</strong>
        <p>Camera đã bay tới một điểm trong lớp LICENSED_SCHEMATIC · UNVERIFIED. Chọn mã huyệt tương ứng.</p>
        <div className="quiz-options">{quizOptions.map(option=><button key={option.code} onClick={()=>answerQuiz(option.code)}>{option.code}</button>)}</div>
        {quizResult&&<p role="status" data-quiz-result="true">{quizResult}</p>}
        <button onClick={nextQuiz}>Câu tiếp theo</button>
      </section>}

      {mode==='simulation'&&<section className="yhct-mode-panel" data-mode-panel="simulation">
        <strong>Simulation Lab · hiệu ứng học tập</strong>
        <p>Điều khiển hiển thị, không mô phỏng sinh lý và không xác nhận vị trí lâm sàng.</p>
        <div className="simulation-controls">
          <button aria-pressed={simulation.motion} onClick={()=>applySimulation({...simulation,motion:!simulation.motion})}>Chuyển động</button>
          <button aria-pressed={simulation.meridians} onClick={()=>applySimulation({...simulation,meridians:!simulation.meridians})}>Đường kinh</button>
          <button aria-pressed={simulation.acupoints} onClick={()=>applySimulation({...simulation,acupoints:!simulation.acupoints})}>Điểm huyệt</button>
          <button onClick={()=>onStudyCommand({view:'front'})}>Mặt trước</button>
          <button onClick={()=>onStudyCommand({view:'side'})}>Mặt bên</button>
          <button onClick={()=>onStudyCommand({view:'back'})}>Mặt sau</button>
        </div>
      </section>}

      {modeMessage&&mode!=='quiz'&&<p className="yhct-mode-message" role="status">{modeMessage}</p>}
      <footer>Catalog 361 huyệt dùng cho học tập. Lớp 3D sơ đồ được ghi rõ mô phỏng/UNVERIFIED; vị trí BodyParts3D chỉ được gọi là đã duyệt khi có trạng thái FACULTY_REVIEWED hoặc PUBLISHED.</footer>
    </aside>}
  </>;
}

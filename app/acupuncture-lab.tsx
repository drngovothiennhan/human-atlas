import {useEffect,useMemo,useRef,useState} from 'react';
import NeedleSimulation from './needle-simulation';
import {loadFormulaData,loadNeedlingData,methodIntensity,regionRuleFor,resolveFormula,TAC_TO_MODEL_MM,type FormulaData,type NeedlingData,type ResolvedFormulaPoint,type TechniqueAngle} from './acupuncture-data';
import type {FormulaOverlay,MeridianSceneAnchor,NeedleAction,NeedleIntensity,NeedlePhase,NeedleSimulationState} from './meridian-overlay';

type LabPoint={code:string;meridianId:string;vietnameseName?:string|null;anatomicalLocation?:{surfaceRegionEn?:string|null;surfaceRegionVi?:string|null}|null};
type Props={
  selectedPoint:LabPoint|null;
  points:LabPoint[];
  anchors:MeridianSceneAnchor[];
  side:'BOTH'|'LEFT'|'RIGHT';
  focusRequest:number;
  onNeedleChange:(state:NeedleSimulationState|null)=>void;
  onFormulaChange:(overlay:FormulaOverlay|null)=>void;
  onFocusPoint:(code:string)=>void;
};
type Tab='needle'|'formula'|'quiz';
type Step={phase:NeedlePhase;label:string;ms:number;page:number;deqi?:boolean};

const MOTIONS:{id:NeedleAction;label:string}[]=[{id:'lift-thrust',label:'Tiến – lui kim'},{id:'twist',label:'Vê xoay kim'},{id:'twist-lift',label:'Tiến lui + vê'},{id:'scrape',label:'Cạo kim'},{id:'shake',label:'Lay kim'}];
const SEQUENCE:Step[]=[
  {phase:'approach',label:'Xác định huyệt, đưa kim tới mặt da',ms:1200,page:10},
  {phase:'pierce',label:'Châm nhanh qua da tới độ sâu',ms:1100,page:11},
  {phase:'manipulate',label:'Thao tác kim, chờ đắc khí',ms:4200,page:13,deqi:true},
  {phase:'retain',label:'Lưu kim (rút gọn để minh họa)',ms:2600,page:19,deqi:true},
  {phase:'withdraw',label:'Rút kim (bổ: nhanh, bịt lỗ · tả: từ từ, lắc rộng lỗ)',ms:1800,page:15}
];
const pick=<T,>(list:T[],n:number,exclude:Set<T>)=>{const pool=list.filter(x=>!exclude.has(x));const out:T[]=[];while(pool.length&&out.length<n){out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}return out};
const shuffle=<T,>(list:T[])=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

export default function AcupunctureLab({selectedPoint,points,anchors,side,focusRequest,onNeedleChange,onFormulaChange,onFocusPoint}:Props){
  const [tab,setTab]=useState<Tab>('needle');
  const [needling,setNeedling]=useState<NeedlingData|null>(null),[formulas,setFormulas]=useState<FormulaData|null>(null),[loadError,setLoadError]=useState('');
  const [active,setActive]=useState(false),[angleId,setAngleId]=useState<TechniqueAngle['id']>('perpendicular'),[angle,setAngle]=useState(90),[depthTac,setDepthTac]=useState(1);
  const [action,setAction]=useState<NeedleAction>('twist'),[intensity,setIntensity]=useState<NeedleIntensity>('moderate'),[phase,setPhase]=useState<NeedlePhase>('pierce'),[playing,setPlaying]=useState(true),[deqi,setDeqi]=useState(true);
  const [stepIndex,setStepIndex]=useState(-1);
  const [formulaId,setFormulaId]=useState(''),[showFormula,setShowFormula]=useState(false),[runIndex,setRunIndex]=useState(-1),[runPoint,setRunPoint]=useState<string|null>(null);
  const timers=useRef<number[]>([]);
  const root=useRef<HTMLElement>(null);
  const clearTimers=()=>{timers.current.forEach(t=>clearTimeout(t));timers.current=[]};
  useEffect(()=>()=>clearTimers(),[]);
  useEffect(()=>{if(focusRequest>0)root.current?.scrollIntoView({block:'start',behavior:'smooth'})},[focusRequest]);

  useEffect(()=>{
    let alive=true;
    Promise.all([loadNeedlingData(),loadFormulaData()]).then(([n,f])=>{if(alive){setNeedling(n);setFormulas(f);setFormulaId(f.formulas[0]?.id??'')}}).catch(()=>{if(alive)setLoadError('Chưa tải được dữ liệu thủ thuật châm và phối huyệt. Kiểm tra kết nối rồi mở lại.')});
    return()=>{alive=false};
  },[]);

  const pointByCode=useMemo(()=>new Map(points.map(p=>[p.code,p])),[points]);
  const anchorFor=(code:string)=>{const list=anchors.filter(a=>a.pointCode===code);return list.find(a=>side==='BOTH'||a.side===side)||list[0]||null};
  const needlePointCode=runPoint??selectedPoint?.code??null;
  const needlePoint=needlePointCode?pointByCode.get(needlePointCode)??null:null;
  const region=regionRuleFor(needling,needlePoint?.anatomicalLocation?.surfaceRegionEn,needlePoint?.meridianId??'');
  const angleInfo=needling?.angles.find(a=>a.id===angleId)??null;
  const guideDepth:[number,number]|null=region?.spine?region.rule.spineDepthTac??null:region?.rule.depthTac??region?.rule.examples?.find(e=>e.code===needlePointCode)?.depthTac??null;
  const angleAdvice=region&&!region.rule.recommendedAngles.includes(angleId)&&!(region.spine&&angleId==='perpendicular');
  const depthAdvice=guideDepth&&depthTac>guideDepth[1];
  const caution=needling?.depthByRegion.flatMap(r=>r.cautionPoints??[]).includes(needlePointCode??'')??false;

  // Push the needle into the scene.
  useEffect(()=>{
    const anchor=needlePointCode?anchorFor(needlePointCode):null;
    if(!active||!anchor||!needlePointCode){onNeedleChange(null);return}
    onNeedleChange({pointCode:needlePointCode,x:anchor.x,y:anchor.y,z:anchor.z,angleDegrees:angle,visualLengthMm:36,depthMm:Math.round(depthTac*TAC_TO_MODEL_MM),animated:playing,action,intensity,phase,deqi});
  },[active,needlePointCode,anchors,side,angle,depthTac,playing,action,intensity,phase,deqi,onNeedleChange]);
  useEffect(()=>()=>{onNeedleChange(null);onFormulaChange(null)},[onNeedleChange,onFormulaChange]);

  const chooseAngle=(id:TechniqueAngle['id'])=>{setAngleId(id);const a=needling?.angles.find(x=>x.id===id);if(a)setAngle(a.degrees)};
  const applyRegionDefaults=()=>{
    if(!region)return;
    const first=region.spine?'perpendicular':region.rule.recommendedAngles[0];chooseAngle(first);
    const guide=region.spine?region.rule.spineDepthTac:region.rule.depthTac??region.rule.examples?.find(e=>e.code===needlePointCode)?.depthTac;
    if(guide)setDepthTac(Number(guide[0].toFixed(1)));else if(region.rule.id==='head-face'||region.rule.id==='chest-back')setDepthTac(.3);
  };
  useEffect(()=>{applyRegionDefaults()},[needlePointCode,needling]);

  const runSequence=(onDone?:()=>void,steps=SEQUENCE)=>{
    clearTimers();setActive(true);setPlaying(true);
    let elapsed=0;
    steps.forEach((step,i)=>{timers.current.push(window.setTimeout(()=>{setStepIndex(i);setPhase(step.phase);setDeqi(Boolean(step.deqi))},elapsed));elapsed+=step.ms});
    timers.current.push(window.setTimeout(()=>{setStepIndex(-1);onDone?.()},elapsed));
  };

  // ---- Phối huyệt
  const formula=formulas?.formulas.find(f=>f.id===formulaId)??null;
  const resolved:ResolvedFormulaPoint[]=useMemo(()=>formulas&&formula?resolveFormula(formulas,formula):[],[formulas,formula]);
  const placeable=resolved.filter(p=>p.code&&anchorFor(p.code));
  useEffect(()=>{
    if(!showFormula||!formula){onFormulaChange(null);return}
    const pts=resolved.flatMap(p=>{if(!p.code)return [];const list=anchors.filter(a=>a.pointCode===p.code);const chosen=side==='BOTH'?list:list.filter(a=>a.side===side||a.side==='MIDLINE');return (chosen.length?chosen:list.slice(0,1)).map(a=>({code:p.code!,x:a.x,y:a.y,z:a.z,method:p.method,order:p.order,active:runPoint===p.code}))});
    onFormulaChange({id:formula.id,points:pts});
  },[showFormula,formula,resolved,anchors,side,runPoint,onFormulaChange]);
  const runFormula=()=>{
    const list=placeable;if(!list.length)return;
    setShowFormula(true);
    const next=(i:number)=>{
      if(i>=list.length){setRunIndex(-1);setRunPoint(null);setActive(false);return}
      const p=list[i];setRunIndex(i);setRunPoint(p.code);setIntensity(methodIntensity(p.method));onFocusPoint(p.code!);
      runSequence(()=>next(i+1),[{...SEQUENCE[0],ms:1500},{...SEQUENCE[1],ms:900},{...SEQUENCE[2],ms:2600},{...SEQUENCE[4],ms:1300}]);
    };
    next(0);
  };
  const stopAll=()=>{clearTimers();setStepIndex(-1);setRunIndex(-1);setRunPoint(null);setPhase('pierce')};

  // ---- Quiz (đáp án lấy từ dữ liệu tài liệu)
  type Question={prompt:string;options:string[];answer:string;source:string};
  const [question,setQuestion]=useState<Question|null>(null),[picked,setPicked]=useState(''),[score,setScore]=useState({right:0,total:0});
  const nameOf=(code:string)=>`${code} · ${pointByCode.get(code)?.vietnameseName??resolved.find(p=>p.code===code)?.name??''}`.trim();
  const newQuestion=()=>{
    if(!formulas)return;
    const f=formulas.formulas[Math.floor(Math.random()*formulas.formulas.length)],pts=resolveFormula(formulas,f).filter(p=>p.code);
    const src=`${formulas.source.title.split(' — ')[0]} · tr. ${f.pages.join('–')}`;
    const kind=Math.floor(Math.random()*3);
    if(kind===0&&pts.length){
      const own=new Set(pts.map(p=>p.code!)),all=[...new Set(formulas.formulas.flatMap(x=>resolveFormula(formulas,x)).map(p=>p.code).filter((c):c is string=>!!c))];
      const right=pts[Math.floor(Math.random()*pts.length)].code!,wrong=pick(all,3,own);
      setQuestion({prompt:`Huyệt nào có trong công thức châm ${f.disease} — ${f.pattern}?`,options:shuffle([right,...wrong]).map(nameOf),answer:nameOf(right),source:src});
    }else if(kind===1){
      const others=pick([...new Set(formulas.formulas.map(x=>x.principle))],3,new Set([f.principle]));
      setQuestion({prompt:`Pháp điều trị của ${f.disease} — ${f.pattern} là gì?`,options:shuffle([f.principle,...others]),answer:f.principle,source:src});
    }else{
      const p=pts[Math.floor(Math.random()*pts.length)];if(!p){newQuestion();return}
      setQuestion({prompt:`Trong công thức ${f.disease} — ${f.pattern}, huyệt ${nameOf(p.code!)} được châm bổ hay châm tả?`,options:['Châm bổ','Châm tả'],answer:p.method==='bo'?'Châm bổ':'Châm tả',source:src});
    }
    setPicked('');
  };
  const answer=(o:string)=>{if(picked||!question)return;setPicked(o);setScore(s=>({right:s.right+(o===question.answer?1:0),total:s.total+1}))};

  const sourceLine=needling?`${needling.source.title} (${needling.source.publisher})`:'';
  const selectedLabel=needlePoint?`${needlePoint.code}${needlePoint.vietnameseName?' · '+needlePoint.vietnameseName:''}`:'';

  return <section ref={root} className="acupuncture-sim acupuncture-lab" data-acupuncture-simulator="true" data-acupuncture-lab="true" aria-label="Phòng châm: mô phỏng châm kim và phối huyệt">
    <div className="meridian3d-section-label">Phòng châm · minh họa học tập</div>
    {loadError&&<p role="alert">{loadError}</p>}
    <div className="lab-tabs" role="tablist">
      {([['needle','Châm kim'],['formula','Phối huyệt'],['quiz','Ôn tập']] as [Tab,string][]).map(([id,label])=><button key={id} type="button" role="tab" aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)} data-lab-tab={id}>{label}</button>)}
    </div>

    {tab==='needle'&&<div className="lab-pane" data-lab-pane="needle">
      {!needlePoint||!needlePointCode||!anchorFor(needlePointCode)?<p role="status">Chọn một huyệt có vị trí 3D trong danh sách bên trên để bắt đầu.</p>:<>
        <div className="lab-point"><b>{selectedLabel}</b><span>{needlePoint.anatomicalLocation?.surfaceRegionVi??'Chưa có vùng cơ thể'}</span></div>
        <div className="lab-row">
          <button type="button" className="lab-primary" aria-pressed={active} onClick={()=>{if(active){stopAll();setActive(false)}else{setActive(true);setPhase('pierce')}}} data-needle-toggle="true">{active?'Tắt kim':'Hiện kim trên huyệt'}</button>
          <button type="button" onClick={()=>runSequence()} disabled={!needling} data-needle-sequence="true">Chạy trình tự châm</button>
          {stepIndex>=0&&<button type="button" onClick={stopAll}>Dừng</button>}
        </div>
        {stepIndex>=0&&<ol className="lab-steps" aria-live="polite">{SEQUENCE.map((s,i)=><li key={s.phase} className={i===stepIndex?'current':i<stepIndex?'done':''}>{s.label} <small>tr. {s.page}</small></li>)}</ol>}
        <NeedleSimulation angleDegrees={angle} depthTac={depthTac} phase={active?phase:'approach'} action={action} intensity={intensity} playing={playing&&active} deqi={deqi&&active} regionName={region?.rule.name??null} guideDepthTac={guideDepth}/>
        {region?<div className="lab-guide" data-region-rule={region.rule.id}>
          <b>Theo sách · vùng {region.rule.name.toLowerCase()} (tr. {region.rule.page})</b>
          <p>{region.spine?'Huyệt dọc cột sống: có thể châm thẳng hay xiên ở đường giữa, sâu khoảng 1–1,5 tấc.':region.rule.summary}{region.upperAbdomen?' Huyệt bụng trên không châm quá sâu.':''}</p>
          {region.rule.examples?.some(e=>e.code===needlePointCode)&&<p>Ví dụ sách nêu cho huyệt này: {region.rule.examples.filter(e=>e.code===needlePointCode).map(e=>`${e.depthTac[0]}–${e.depthTac[1]} tấc`).join(', ')}.</p>}
          <button type="button" onClick={applyRegionDefaults}>Đặt góc và độ sâu theo vùng</button>
        </div>:<p className="lab-guide muted">Sách không nêu quy tắc độ sâu riêng cho vùng này; dùng nguyên tắc chung: {needling?.depthGeneral.summary} (tr. {needling?.depthGeneral.page})</p>}
        {caution&&<p className="acupuncture-warning">Huyệt sau gáy nơi hiểm yếu: sách lưu ý đặc biệt về độ sâu (tr. 18).</p>}

        <fieldset className="lab-field"><legend>Hướng kim (tr. 17)</legend>
          <div className="lab-chips">{needling?.angles.map(a=><button key={a.id} type="button" aria-pressed={angleId===a.id} onClick={()=>chooseAngle(a.id)} title={a.use}>{a.name} · {a.degrees}°</button>)}</div>
          <label>Góc đồ họa · {angle}°<input type="range" min={angleInfo?.range[0]??10} max={angleInfo?.range[1]??90} step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))} disabled={angleInfo?.range[0]===angleInfo?.range[1]}/></label>
          {angleInfo&&<small>{angleInfo.use}</small>}
          {angleAdvice&&<small className="lab-warn">Vùng này sách khuyên {region!.rule.recommendedAngles.map(id=>needling?.angles.find(a=>a.id===id)?.name.toLowerCase()).join(' hoặc ')}.</small>}
        </fieldset>
        <fieldset className="lab-field"><legend>Độ sâu minh họa</legend>
          <label>{depthTac.toFixed(1)} tấc<input type="range" min="0" max="3" step="0.1" value={depthTac} onChange={e=>setDepthTac(Number(e.target.value))}/></label>
          {depthAdvice&&<small className="lab-warn">Vượt mức sách nêu cho vùng này ({guideDepth![0]}–{guideDepth![1]} tấc).</small>}
        </fieldset>
        <fieldset className="lab-field"><legend>Thao tác (tr. 13–14)</legend>
          <div className="lab-chips">{MOTIONS.map(m=><button key={m.id} type="button" aria-pressed={action===m.id} onClick={()=>{setAction(m.id);setActive(true);setPhase('manipulate');setPlaying(true)}} data-needle-motion={m.id}>{m.label}</button>)}</div>
          {needling&&<small>{needling.manipulations.find(m=>m.motion===action)?.summary}{needling.manipulations.find(m=>m.motion===action)?.caution?' '+needling.manipulations.find(m=>m.motion===action)?.caution:''}</small>}
        </fieldset>
        <fieldset className="lab-field"><legend>Mức kích thích / bổ – tả (tr. 15–16)</legend>
          <div className="lab-chips">{needling?.stimulation.map(s=><button key={s.id} type="button" aria-pressed={intensity===s.id} onClick={()=>setIntensity(s.id)} data-needle-intensity={s.id}>{s.name} ≈ {s.equivalent==='bo'?'bổ':s.equivalent==='ta'?'tả':'bình'}</button>)}</div>
          {needling&&<small>{needling.stimulation.find(s=>s.id===intensity)?.summary} Dùng khi: {needling.stimulation.find(s=>s.id===intensity)?.indication}</small>}
          <div className="lab-row"><button type="button" aria-pressed={playing} onClick={()=>setPlaying(v=>!v)}>{playing?'Tạm dừng động tác':'Chạy động tác'}</button><button type="button" aria-pressed={deqi} onClick={()=>setDeqi(v=>!v)}>Đắc khí minh họa</button></div>
        </fieldset>
        <details className="lab-details"><summary>Cách tiến kim · bổ tả · tai biến</summary>
          <h4>Cách đưa kim qua da (tr. 11–12)</h4>
          <ul>{needling?.insertion.map(t=><li key={t.id}><b>{t.name}:</b> {t.summary} <i>{t.use}</i></li>)}</ul>
          <h4>Các cặp bổ – tả (tr. 15–16)</h4>
          <ul>{needling?.tonificationReduction.map(t=><li key={t.id}><b>{t.name}:</b> {t.bo?`Bổ — ${t.bo} `:''}{t.ta?`Tả — ${t.ta}`:''}{t.binh??''}</li>)}</ul>
          <h4>Đắc khí (tr. {needling?.deqi.page})</h4><p>{needling?.deqi.summary}</p>
          <h4>Lưu kim (tr. {needling?.retention.page})</h4><p>{needling?.retention.summary}</p>
          <h4>Tai biến và xử lý (tr. 19–21)</h4>
          <ul>{needling?.accidents.map(a=><li key={a.id}><b>{a.name}:</b> {a.summary}</li>)}</ul>
        </details>
      </>}
    </div>}

    {tab==='formula'&&<div className="lab-pane" data-lab-pane="formula">
      {!formulas?<p role="status">Đang tải công thức…</p>:<>
        <label className="lab-select">Công thức theo bệnh – thể<select value={formulaId} onChange={e=>{stopAll();setFormulaId(e.target.value)}} data-formula-select="true">{[...new Set(formulas.formulas.map(f=>f.disease))].map(d=><optgroup key={d} label={d}>{formulas.formulas.filter(f=>f.disease===d).map(f=><option key={f.id} value={f.id}>{f.pattern}</option>)}</optgroup>)}</select></label>
        {formula&&<div className="lab-formula" data-formula={formula.id}>
          <p className="lab-principle"><small>Pháp (tác dụng khi phối)</small><b>{formula.principle}</b></p>
          <ol className="lab-formula-points">{resolved.map(p=><li key={p.order+p.name} className={`method-${p.method} ${runPoint&&p.code===runPoint?'current':''}`}>
            <span className="lab-badge">{p.method==='bo'?'Bổ':'Tả'}</span>
            <button type="button" disabled={!p.code||!anchorFor(p.code)} onClick={()=>p.code&&onFocusPoint(p.code)}>{p.name}{p.code?` · ${p.code}`:''}</button>
            <small>{p.role}{p.inherited?' (giống thể gốc)':''}{p.note?` · ${p.note}`:''}{p.printedCode?` · sách in mã ${p.printedCode}`:''}{!p.code?' · không có mã chuẩn, không vẽ 3D':''}</small>
          </li>)}</ol>
          {formula.technique&&<small>Kỹ thuật ghi trong tài liệu: {formula.technique}.</small>}
          {formula.retention&&<small>{formula.retention}.</small>}
          <div className="lab-row">
            <button type="button" className="lab-primary" aria-pressed={showFormula} onClick={()=>setShowFormula(v=>!v)} data-formula-show="true">{showFormula?'Ẩn trên 3D':'Hiện công thức trên 3D'}</button>
            {runIndex<0?<button type="button" onClick={runFormula} disabled={!placeable.length} data-formula-run="true">Chạy trình tự châm ({placeable.length} huyệt)</button>:<button type="button" onClick={()=>{stopAll();setActive(false)}}>Dừng ({runIndex+1}/{placeable.length})</button>}
          </div>
          <p className="lab-legend"><span className="method-bo">● bổ</span> <span className="method-ta">● tả</span> Số = thứ tự trong tài liệu; nét đứt chỉ nối thứ tự, không phải đường kinh.</p>
          <small className="lab-source">Nguồn: {formulas.source.title} — {formulas.source.issuer}, tr. {formula.pages.join('–')}. Chép theo tài liệu, chờ giảng viên duyệt.</small>
        </div>}
      </>}
    </div>}

    {tab==='quiz'&&<div className="lab-pane" data-lab-pane="quiz">
      {!formulas?<p role="status">Đang tải dữ liệu…</p>:<>
        <p className="lab-score">Đúng {score.right}/{score.total} trong lần học này</p>
        {!question?<button type="button" className="lab-primary" onClick={newQuestion} data-quiz-start="true">Bắt đầu ôn phối huyệt</button>:<div className="lab-question">
          <p><b>{question.prompt}</b></p>
          <div className="lab-options">{question.options.map(o=><button key={o} type="button" onClick={()=>answer(o)} className={picked?(o===question.answer?'right':o===picked?'wrong':''):''} disabled={Boolean(picked)}>{o}</button>)}</div>
          {picked&&<p role="status">{picked===question.answer?'Đúng.':`Chưa đúng — đáp án: ${question.answer}.`} <small>({question.source})</small></p>}
          <button type="button" onClick={newQuestion}>Câu tiếp theo</button>
        </div>}
        <small className="lab-source">Câu hỏi sinh từ dữ liệu phối huyệt của tài liệu Bộ Y tế đã chép vào app; chờ giảng viên duyệt.</small>
      </>}
    </div>}

    <p className="acupuncture-warning">Hình và hoạt ảnh chỉ minh họa cho học tập, không phải chỉ dẫn châm trên người. Chỉ người được đào tạo và cấp chứng chỉ hành nghề mới thực hiện châm cứu.</p>
    {sourceLine&&<small className="lab-source">Thủ thuật châm: {sourceLine}, Chương I, tr. 10–21.</small>}
  </section>;
}

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
};
type Tab='points'|'meridians'|'anatomy'|'assistant';

const norm=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const canonicalPointCode=(v:string)=>{
  const compact=v.trim().toUpperCase().replace(/[\s_-]+/g,'');
  const match=compact.match(/^([A-Z]+)(\d+)$/);
  return match?`${match[1]}-${Number(match[2])}`:compact;
};
const googleReference=(query:string)=>`https://www.google.com/search?q=${encodeURIComponent(query)}`;

export default function YhctStudyPanel(){
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState<Tab>('meridians');
  const [meridians,setMeridians]=useState<Meridian[]>([]);
  const [points,setPoints]=useState<Acupoint[]>([]);
  const [query,setQuery]=useState('');
  const [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState('Dữ liệu local đã sẵn sàng sau khi tải.');

  useEffect(()=>{
    let alive=true;
    Promise.all([
      fetch(import.meta.env.BASE_URL+'data/meridians.json').then(async r=>(await r.json()) as Meridian[]),
      fetch(import.meta.env.BASE_URL+'data/acupoints.json').then(async r=>(await r.json()) as Acupoint[])
    ]).then(([m,p])=>{if(alive){setMeridians(m);setPoints(p)}})
      .catch(()=>{if(alive)setAnswer('Không tải được cơ sở dữ liệu local. Hãy thử tải lại ứng dụng.')});
    return()=>{alive=false};
  },[]);

  const spatialPointCount=useMemo(()=>points.filter(p=>p.position3d).length,[points]);
  const filtered=useMemo(()=>{
    const q=norm(query),canonical=canonicalPointCode(query);
    if(!q)return (tab==='points'?points:meridians).slice(0,80);
    const rows=tab==='points'?points:meridians;
    return rows.filter((r:any)=>{
      if(tab==='points'&&canonicalPointCode(r.code)===canonical)return true;
      return [r.code,r.vietnameseName,r.englishName,r.pinyin,r.chineseName,r.meridianId].filter(Boolean).some((v:string)=>norm(v).includes(q));
    }).slice(0,80);
  },[query,tab,points,meridians]);

  const ask=()=>{
    const raw=question.trim(),q=norm(raw),canonical=canonicalPointCode(raw);
    if(!q){setAnswer('Nhập câu hỏi dựa trên dữ liệu đã kiểm duyệt trong ứng dụng.');return}
    const exactPoint=points.find(p=>canonicalPointCode(p.code)===canonical||q.includes(norm(p.code))||Boolean(p.vietnameseName&&q.includes(norm(p.vietnameseName))));
    if(exactPoint){
      const m=meridians.find(x=>x.id===exactPoint.meridianId);
      setAnswer(`${exactPoint.code}${exactPoint.vietnameseName?' · '+exactPoint.vietnameseName:''} thuộc ${m?.vietnameseName||exactPoint.meridianId}. Tọa độ 3D: ${exactPoint.position3d?'đã đăng ký':'chưa có anchor đã xác minh'}. Nguồn catalog: ${(exactPoint.sources||[]).join(', ')||'record đã kiểm duyệt'}.`);
      return;
    }
    const exactMeridian=meridians.find(m=>q.includes(norm(m.code))||q.includes(norm(m.vietnameseName))||q.includes(norm(m.englishName)));
    if(exactMeridian){
      if(q.includes('huyet')){
        const owned=points.filter(p=>p.meridianId===exactMeridian.id).sort((a,b)=>a.sequence-b.sequence);
        setAnswer(`${exactMeridian.vietnameseName} có ${owned.length} huyệt trong catalog đã kiểm tra: ${owned.map(p=>p.code).join(', ')}. Đây là thứ tự danh mục; đường 3D vẫn chờ đăng ký bề mặt.`);
      }else{
        setAnswer(`${exactMeridian.code} · ${exactMeridian.vietnameseName} (${exactMeridian.englishName}). Catalog: ${exactMeridian.pointIds.length} huyệt. Trạng thái không gian: ${exactMeridian.spatialStatus}; chưa hiển thị đường 3D nếu chưa được đăng ký.`);
      }
      return;
    }
    setAnswer('Không tìm thấy trong cơ sở dữ liệu đã kiểm duyệt. Có thể dùng liên kết Tham khảo Google ở tab Huyệt/Kinh; ứng dụng không tự chép dữ liệu ngoài vào catalog.');
  };

  return <>
    <button className="yhct-launch glass" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="yhct-study-panel">
      YHCT <span>{meridians.length} kinh · {points.length} huyệt</span>
    </button>
    {open&&<aside id="yhct-study-panel" className="yhct-panel glass" aria-label="Huyệt vị, kinh lạc và trợ lý học tập">
      <div className="yhct-head">
        <div><strong>Huyệt vị · Kinh lạc</strong><small>HIU CLB YHCT · catalog license-gated · zero-token</small></div>
        <button onClick={()=>setOpen(false)} aria-label="Đóng bảng YHCT">×</button>
      </div>
      <div className="yhct-stats">
        <span>{points.length}/361 huyệt catalog</span>
        <span>{spatialPointCount} anchor 3D</span>
      </div>
      <div className="yhct-tabs">
        {([['meridians','Kinh'],['points','Huyệt'],['anatomy','Giải phẫu'],['assistant','Trợ lý']] as [Tab,string][]).map(([id,label])=>
          <button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setQuery('')}}>{label}</button>
        )}
      </div>

      {(tab==='meridians'||tab==='points')&&<>
        <input className="yhct-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='points'?'Tìm mã huyệt, ví dụ ST36…':'Tìm mã/tên kinh…'} aria-label="Tìm dữ liệu YHCT"/>
        <div className="yhct-list">
          {filtered.length?filtered.map((r:any)=>tab==='meridians'
            ?<article key={r.id}>
              <b>{r.code}</b>
              <span>{r.vietnameseName||r.englishName}</span>
              <small>{r.pointIds?.length||0} huyệt · {r.path3d?.length?'Đã có đường 3D':'Chuỗi thứ tự đã xác minh · chưa đăng ký đường 3D'}</small>
              <p className="yhct-sequence">{r.pointIds?.length?`${r.pointIds.slice(0,4).join(' → ')} → … → ${r.pointIds.at(-1)}`:'Chưa có chuỗi huyệt.'}</p>
              <div className="yhct-links">
                {r.referenceUrl&&<a href={r.referenceUrl} target="_blank" rel="noreferrer">AcuAtlas ↗</a>}
                <a href={googleReference(`${r.code} ${r.vietnameseName} acupuncture meridian`)} target="_blank" rel="noreferrer">Tham khảo Google ↗</a>
              </div>
            </article>
            :<article key={r.id}>
              <b>{r.code}</b>
              <span>{r.vietnameseName||r.pinyin||r.englishName||'Tên chi tiết đang chờ nhập từ nguồn được phép'}</span>
              <small>{r.meridianId} · {r.position3d?'Đã có anchor 3D':'Chưa có anchor 3D đã xác minh'}</small>
              <div className="yhct-links">
                <a href={r.references?.[0]||'https://acupointatlas.com/acupuncture-points/'} target="_blank" rel="noreferrer">Nguồn catalog ↗</a>
                <a href={googleReference(`${r.code} acupuncture point WHO`)} target="_blank" rel="noreferrer">Tham khảo Google ↗</a>
              </div>
            </article>)
            :<p>Không có record đã kiểm duyệt phù hợp.</p>}
        </div>
      </>}

      {tab==='anatomy'&&<div className="yhct-copy">
        <strong>Giải phẫu quanh huyệt</strong>
        <p>Viewer BodyParts3D có 15 nhóm hiển thị gồm xương, cơ, động mạch, tĩnh mạch, thần kinh, cơ quan và bề mặt cơ thể. Quan hệ quanh huyệt chỉ được bật khi huyệt có anchor và quan hệ đã xác minh.</p>
        <p className="guard">361 huyệt đã có trong catalog, nhưng hiện chưa điểm nào được phép gắn lên mesh 3D. Không suy luận cấu trúc nguy hiểm hoặc tự tạo tọa độ từ sơ đồ 2D.</p>
      </div>}

      {tab==='assistant'&&<div className="yhct-assistant">
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ví dụ: ST36 thuộc kinh nào? / Kinh Phế có những huyệt nào?"/>
        <button onClick={ask}>Tra cứu local</button>
        <p>{answer}</p>
        <small>Không dùng API key · không gọi cloud LLM · không bịa tọa độ/nội dung khi thiếu dữ liệu.</small>
      </div>}

      <div className="yhct-modes">
        <button>Khám phá</button>
        <button disabled={!points.length}>Học theo kinh</button>
        <button disabled={!spatialPointCount}>Quiz 3D</button>
        <button disabled={!spatialPointCount}>Simulation Lab</button>
      </div>
      <footer>Catalog 361 huyệt và chuỗi kinh dùng cho học tập. Đường/điểm 3D chỉ xuất hiện sau registration gate. Nội dung ngoài license chỉ mở dưới dạng liên kết tham khảo.</footer>
    </aside>}
  </>;
}

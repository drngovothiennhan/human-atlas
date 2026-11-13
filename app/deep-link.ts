import type {StudyCommand} from './yhct-study-panel';

/**
 * Liên kết sâu để hiutmc.com và các app khác mở Atlas đúng chỗ:
 *   ?huyet=ST36 | ?huyet=ST-36   mở huyệt (kèm đường kinh của huyệt)
 *   ?kinh=ST | ?kinh=all         mở một đường kinh, hoặc 12 kinh chính
 *   &cham=1                      mở Phòng châm tại huyệt đó
 * Tham số tiếng Anh tương đương: point, meridian, lab. Giá trị không hợp lệ thì bỏ qua (trả null).
 */
export const DEEP_LINK_MERIDIANS=['LU','LI','ST','SP','HT','SI','BL','KI','PC','TE','GB','LR','CV','GV'] as const;
const MERIDIAN_SET=new Set<string>(DEEP_LINK_MERIDIANS);
/** Số huyệt của từng kinh (361 huyệt kinh). Dùng để loại mã ngoài phạm vi trước khi gửi lệnh. */
export const MERIDIAN_POINT_COUNT:Record<string,number>={LU:11,LI:20,ST:45,SP:21,HT:9,SI:19,BL:67,KI:27,PC:9,TE:23,GB:44,LR:14,CV:24,GV:28};

export function normalizePointCode(value:string|null|undefined):string|null{
  const compact=String(value??'').trim().toUpperCase().replace(/[\s_-]+/g,'');
  const match=compact.match(/^([A-Z]{2})(\d{1,2})$/);
  if(!match||!MERIDIAN_SET.has(match[1]))return null;
  const n=Number(match[2]);
  if(n<1||n>MERIDIAN_POINT_COUNT[match[1]])return null;
  return `${match[1]}-${n}`;
}

export function parseDeepLink(search:string):StudyCommand|null{
  const q=new URLSearchParams(search);
  if(q.get('register')==='1')return null;
  const pointCode=normalizePointCode(q.get('huyet')??q.get('point'));
  const rawMeridian=String(q.get('kinh')??q.get('meridian')??'').trim().toUpperCase();
  const meridianId=rawMeridian==='ALL'||rawMeridian==='TATCA'?'ALL':MERIDIAN_SET.has(rawMeridian)?rawMeridian:null;
  const lab=(q.get('cham')??q.get('lab'))==='1';
  if(pointCode)return {pointCode,meridianId:pointCode.split('-')[0],...(lab?{openLab:true}:{openPanel:true})};
  if(meridianId)return {meridianId};
  return null;
}

/** Ghi huyệt/kinh vừa xem để hiutmc.com gợi ý "tiếp tục" (cùng origin khi mở qua hiutmc.com/apps/atlas). */
export const LAST_VIEW_KEY='hiutmc-atlas-last-view-v1';
export function rememberLastView(view:{pointCode?:string|null;meridianId?:string|null}){
  if(typeof window==='undefined')return;
  const pointCode=normalizePointCode(view.pointCode);
  const meridianId=pointCode?pointCode.split('-')[0]:view.meridianId&&MERIDIAN_SET.has(view.meridianId)?view.meridianId:null;
  if(!pointCode&&!meridianId)return;
  try{localStorage.setItem(LAST_VIEW_KEY,JSON.stringify({pointCode,meridianId,at:new Date().toISOString()}))}catch{/* storage is optional */}
}

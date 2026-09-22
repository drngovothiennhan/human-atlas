export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'Bộ xương',color:'#e2d9ba',description:'Xương tạo khung nâng đỡ cơ thể, bảo vệ cơ quan và làm điểm bám cho cơ. Mô xương còn dự trữ khoáng chất và tham gia tạo máu.'},
 {id:'muscular',name:'Cơ',color:'#a85b50',description:'Cơ xương tạo chuyển động, ổn định tư thế và sinh nhiệt.'},
 {id:'cardiac',name:'Tim',color:'#b96760',description:'Tim là bơm cơ gồm bốn buồng. Các van định hướng máu qua tuần hoàn phổi và tuần hoàn hệ thống.'},
 {id:'sensory',name:'Cơ quan cảm giác',color:'#b0c8ce',description:'Các cấu trúc hỗ trợ thị giác, thính giác và thăng bằng.'},
 {id:'arterial',name:'Động mạch',color:'#c05245',description:'Động mạch đưa máu từ tim tới các mô hoặc tới phổi.'},
 {id:'venous',name:'Tĩnh mạch',color:'#527c9f',description:'Tĩnh mạch đưa máu trở về tim.'},
 {id:'nervous',name:'Hệ thần kinh',color:'#d8b565',description:'Não, tủy sống và thần kinh ngoại biên tiếp nhận, xử lý và truyền tín hiệu.'},
 {id:'respiratory',name:'Hô hấp',color:'#b98991',description:'Đường thở dẫn khí tới phổi, nơi trao đổi oxy và carbon dioxide giữa khí và máu.'},
 {id:'digestive',name:'Tiêu hóa',color:'#b8916b',description:'Hệ tiêu hóa phân giải thức ăn, hấp thu dưỡng chất và nước, vận chuyển chất thải.'},
 {id:'urinary',name:'Tiết niệu',color:'#b47961',description:'Thận lọc máu và điều hòa nước, điện giải, cân bằng acid–base. Nước tiểu qua niệu quản tới bàng quang rồi ra niệu đạo.'},
 {id:'lymphatic',name:'Bạch huyết',color:'#879f7c',description:'Mạch bạch huyết đưa dịch mô dư về tuần hoàn. Các cơ quan lympho tham gia miễn dịch.'},
 {id:'endocrine',name:'Nội tiết',color:'#c5a09a',description:'Các cơ quan nội tiết tiết hormone vào máu để điều hòa hoạt động cơ thể.'},
 {id:'reproductive',name:'Sinh dục',color:'#bda098',description:'Mô hình cơ quan sinh dục nam liên quan tới sản xuất, trưởng thành và vận chuyển tinh trùng, sản xuất hormone sinh dục.'},
 {id:'integumentary',name:'Bề mặt cơ thể',color:'#ba9b7d',description:'Bề mặt cơ thể là mốc tham chiếu bên ngoài, góp phần bảo vệ, cảm giác và điều hòa nhiệt.'},
 {id:'connective',name:'Mô liên kết',color:'#aec3bb',description:'Sụn, dây chằng và các mô liên kết nâng đỡ, liên kết và phân cách cấu trúc.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;headMuscles?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
export const EXPLANATIONS:Record<string,string> = {
 'heart':'Bơm cơ trong lồng ngực. Tim phải đưa máu tới phổi; tim trái đưa máu vào tuần hoàn hệ thống.',
 'liver':'Cơ quan lớn dưới bên phải cơ hoành, xử lý dưỡng chất, tạo mật và tổng hợp nhiều protein huyết tương.',
 'brain':'Cơ quan trung ương của hệ thần kinh, tham gia cảm nhận, vận động, trí nhớ, ngôn ngữ và điều hòa cơ thể.',
 'stomach':'Túi cơ giữa thực quản và ruột non, chứa và trộn thức ăn với acid và enzyme trước khi đưa tới tá tràng.',
 'spleen':'Cơ quan lympho ở bụng trên bên trái, lọc máu, loại bỏ tế bào máu già và tham gia miễn dịch.',
 'pancreas':'Cơ quan có chức năng tiêu hóa và nội tiết, tiết enzyme vào ruột non và hormone như insulin, glucagon.',
 'urinary bladder':'Túi cơ trong chậu hông chứa nước tiểu từ thận qua niệu quản.',
 'trachea':'Đường dẫn khí từ thanh quản tới phế quản, được các sụn nâng đỡ.',
 'diaphragm':'Cơ ngăn ngực và bụng; khi co làm tăng thể tích lồng ngực, hỗ trợ hít vào.',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[name.toLowerCase()] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';}

const ANATOMY_VI:Record<string,string>={'heart': 'Tim', 'liver': 'Gan', 'brain': 'Não', 'stomach': 'Dạ dày', 'spleen': 'Lách', 'pancreas': 'Tụy', 'urinary bladder': 'Bàng quang', 'trachea': 'Khí quản', 'diaphragm': 'Cơ hoành'};
export const anatomyName=(name:string)=>ANATOMY_VI[name.toLowerCase()]?ANATOMY_VI[name.toLowerCase()]+" · "+name:name;


// Source atlas labels incorrectly group these named lower-leg muscles as bone.
const LEG_MUSCLE_IDS=new Set(["FJ1409","FJ1409M","FJ1410","FJ1410M","FJ1411","FJ1411M","FJ1439","FJ1439M","FJ1440","FJ1440M"]);
export function normalizeAtlasSystems(atlas:Atlas):Atlas{return {...atlas,parts:atlas.parts.map(part=>LEG_MUSCLE_IDS.has(part.id)?{...part,system:"muscular" as SystemId}:part)};}

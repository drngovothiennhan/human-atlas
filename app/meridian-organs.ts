// Tạng phủ that each of the 12 chính kinh "thuộc" (belongs to) and "lạc" (connects to): the biểu–lý pairs taught in every
// Châm cứu học textbook (e.g. Thủ Thái âm Phế kinh thuộc Phế, lạc Đại trường). Nhâm/Đốc are kỳ kinh and have no tạng phủ pair.
// `parts` are BodyParts3D atlas names; `visceral` are nodes of the Anatria visceral reference layer (lungs, liver).
// Tâm bào and Tam tiêu have no mesh in either source, so they carry a note instead of a 3D highlight.

export type OrganTarget={id:string;label:string;anatomy:string;parts:string[];visceral:string[];note?:string};
export type MeridianOrganLink={meridianId:string;thuoc:OrganTarget;lac:OrganTarget};

const LUNG_LOBES=['Superior lobe of right lung','Middle lobe of right lung','Inferior lobe of right lung','Superior lobe of left lung','Inferior lobe of left lung'];
const BRONCHI=['Left main bronchus','Right main bronchus proper'];
const HEART=['Wall of left atrium','Wall of right atrium','Wall of ventricle','Cavity of left atrium','Cavity of right atrium','Cavity of left ventricle','Cavity of right ventricle'];

export const VISCERAL_NODES=[...LUNG_LOBES,'Liver'] as const;

const ORGANS:Record<string,OrganTarget>={
 phe:{id:'phe',label:'Phế',anatomy:'phổi',parts:BRONCHI,visceral:LUNG_LOBES},
 daiTruong:{id:'daiTruong',label:'Đại trường',anatomy:'ruột già',parts:['Appendix','Ascending colon','Transverse colon','Descending colon','Rectum'],visceral:[]},
 vi:{id:'vi',label:'Vị',anatomy:'dạ dày',parts:['Stomach'],visceral:[]},
 ty:{id:'ty',label:'Tỳ',anatomy:'lách',parts:['Spleen'],visceral:[]},
 tam:{id:'tam',label:'Tâm',anatomy:'tim',parts:HEART,visceral:[]},
 tieuTruong:{id:'tieuTruong',label:'Tiểu trường',anatomy:'ruột non',parts:['Duodenum','Proximal part of jejunum','Middle part of jejunum','Distal part of jejunum','Proximal part of ileum','Middle part of ileum','Distal part of ileum'],visceral:[]},
 bangQuang:{id:'bangQuang',label:'Bàng quang',anatomy:'bàng quang',parts:['Urinary bladder'],visceral:[]},
 than:{id:'than',label:'Thận',anatomy:'thận',parts:['Left kidney','Right kidney'],visceral:[]},
 tamBao:{id:'tamBao',label:'Tâm bào',anatomy:'màng ngoài tim',parts:[],visceral:[],note:'Mô hình chưa có màng ngoài tim nên không tô 3D.'},
 tamTieu:{id:'tamTieu',label:'Tam tiêu',anatomy:'thượng – trung – hạ tiêu',parts:[],visceral:[],note:'Tam tiêu là phủ chức năng, không có một cơ quan giải phẫu riêng để tô.'},
 dom:{id:'dom',label:'Đởm',anatomy:'túi mật',parts:['Gallbladder'],visceral:[]},
 can:{id:'can',label:'Can',anatomy:'gan',parts:['Caudate lobe of liver'],visceral:['Liver']}
};

const pair=(meridianId:string,thuoc:string,lac:string):MeridianOrganLink=>({meridianId,thuoc:ORGANS[thuoc],lac:ORGANS[lac]});

export const MERIDIAN_ORGANS:Record<string,MeridianOrganLink>={
 LU:pair('LU','phe','daiTruong'),LI:pair('LI','daiTruong','phe'),
 ST:pair('ST','vi','ty'),SP:pair('SP','ty','vi'),
 HT:pair('HT','tam','tieuTruong'),SI:pair('SI','tieuTruong','tam'),
 BL:pair('BL','bangQuang','than'),KI:pair('KI','than','bangQuang'),
 PC:pair('PC','tamBao','tamTieu'),TE:pair('TE','tamTieu','tamBao'),
 GB:pair('GB','dom','can'),LR:pair('LR','can','dom')
};

export const meridianOrganLink=(meridianId:string|null|undefined)=>meridianId?MERIDIAN_ORGANS[meridianId]??null:null;

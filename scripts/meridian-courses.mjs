// Meridian surface courses (đường tuần hành) for the 14 channels.
//
// Each course is an ordered list of waypoints. A waypoint is either
//   {pt:'ST-36'}                       -> use the ray of that catalogue point's anchor
//   {seg:'thigh',cun:6,from:'p1',az:20}      -> segment/azimuth ray (same DSL as points.anchors.json)
//   {seg:'trunk',z_from:'umbilicus',z_cun:-5,lat:2,face:'anterior'}
//   {struct:'First metacarpal bone',...,region:'hand'}  -> structural ray
// Rays between consecutive waypoints are interpolated and re-cast onto the
// BodyParts3D skin, so the drawn line follows the body surface instead of
// chords between sparse anchors.
//
// SOURCE POLICY: routes are written from the "Đường đi" (course) paragraphs of the
// teaching textbooks in the owner's library — Viện YHCT Việt Nam "Châm cứu học"
// (12 primary channels, Nhâm, Đốc) and Học viện YHCT Trung Quốc "Châm cứu học
// Trung Quốc" (Phế, Đại trường, Vị). Only landmark sequences are encoded here;
// no book text is stored. Internal (zàng-fǔ) segments are not drawn.
//
// A course has: id, codes (catalogue points that lie on this drawn branch, in
// source order — flow runs first to last), waypoints, and optional `note`.
// Left side is the mirror of right; CV/GV are drawn once on the midline.

const P=code=>({pt:code});
const pts=(ch,from,to)=>Array.from({length:to-from+1},(_,i)=>P(`${ch}-${from+i}`));
const codes=(ch,from,to)=>Array.from({length:to-from+1},(_,i)=>`${ch}-${from+i}`);

// Segment-ray waypoint helper (same DSL as points.anchors.json).
const R=(seg,pos,az)=>({seg,...pos,az});
const T=(pos,lat,face)=>({seg:'trunk',...pos,lat,face});

// LU intentionally keeps its previously reviewed legacy thumb course in scripts/build-furia-schematic.mjs.
export const courseSpecs={
  LI:[{
    id:'main',codes:codes('LI',1,20),
    note:'Đầu ngón trỏ (bờ quay) → Hợp cốc → mặt ngoài cẳng tay → ngoài khuỷu → bờ trước mặt ngoài cánh tay → Kiên ngung → đỉnh vai → Đại chùy (GV-14) → hố trên đòn (ST-12) → cổ → má → cánh mũi đối bên (Nghênh hương).',
    waypoints:[...pts('LI',1,16),P('GV-14'),R('neck',{z_frac:.842},85),P('ST-12'),P('LI-17'),P('LI-18'),P('LI-19'),P('LI-20')]
  }],
  ST:[
    {id:'face',codes:['ST-ROUTE-ORIGIN',...codes('ST',1,8)],
     note:'Ngoài cánh mũi (khởi) → khóe mắt trong (Tình minh) → Thừa khấp → quanh môi, gặp nhau ở Thừa tương → Đại nghênh → Giáp xa → trước tai → Đầu duy (nhánh mặt).',
     waypoints:[{struct:'Nasal bone',along:1,dir:'anterior',shift:{down:10,lateral:13}},P('BL-1'),...pts('ST',1,4),P('CV-24'),...pts('ST',5,8)]},
    {id:'trunk-leg',codes:[...codes('ST',9,39),...codes('ST',41,45)],
     note:'Từ Đại nghênh → Nhân nghênh → cổ → hố trên đòn → xuống theo đường núm vú → cạnh rốn → Khí xung → Bễ quan → Phục thỏ → bờ ngoài xương bánh chè → mào chày phía ngoài → mu bàn chân → góc ngoài móng ngón chân II (Lệ đoài).',
     waypoints:[P('ST-5'),...pts('ST',9,39),...pts('ST',41,45)]},
    {id:'leg-branch',codes:['ST-40'],
     note:'Nhánh tách ở Túc tam lý xuống Phong long.',
     waypoints:[P('ST-36'),R('shank',{cun:6,from:'p0'},30),P('ST-40')]}
  ],
  SP:[{id:'main',codes:codes('SP',1,21),waypoints:pts('SP',1,21),
     note:'Góc trong móng ngón chân cái → bờ da gan/mu chân → trước mắt cá trong → bờ sau xương chày (cắt chéo và đi trước kinh Can) → mặt trong gối, đùi → bụng → ngực (Chu vinh, Đại bao).'}],
  SI:[{id:'main',codes:codes('SI',1,19),waypoints:pts('SI',1,19),note:'Góc ngoài móng ngón út → bờ trụ bàn tay → cổ tay (Uyển cốt, Dương cốc) → bờ sau cẳng tay → khuỷu (giữa mỏm khuỷu và mỏm trên lồi cầu trong) → mặt sau trong cánh tay → sau vai → hố trên xương bả → cổ → má → trước tai (Thính cung).'}],
  HT:[{id:'main',codes:codes('HT',1,9),
     note:'Từ hõm nách → bờ sau mặt trong cánh tay (trong kinh Phế và Tâm bào) → khuỷu (trong) → bờ trụ cẳng tay phía gan tay → xương đậu → gan tay → bờ quay ngón út (Thiếu xung).',
     waypoints:[P('HT-1'),P('HT-2'),P('HT-3'),R('forearm',{t:.3},-82),...pts('HT',4,9)]}],
  BL:[
    {id:'inner',codes:codes('BL',1,35),waypoints:pts('BL',1,35),note:'Khóe mắt trong → trán → đỉnh đầu → gáy → hai bên cột sống (1,5 thốn) tới xương cùng.'},
    {id:'outer',codes:codes('BL',41,54),waypoints:pts('BL',41,54),note:'Nhánh từ vai đi dọc hai bên cột sống (3 thốn) tới mấu chuyển lớn.'},
    {id:'bl39',codes:['BL-39'],waypoints:[P('BL-38'),P('BL-39')],note:'Ủy dương: đầu ngoài nếp khoeo, nhánh ngắn từ Phù khích (BL-38).'},
    {id:'leg',codes:['BL-36','BL-37','BL-38','BL-40',...codes('BL',55,67)],waypoints:[P('BL-36'),P('BL-37'),P('BL-38'),P('BL-40'),...pts('BL',55,67)],note:'Mặt sau đùi → giữa khoeo → sau mắt cá ngoài (Côn lôn) → bờ ngoài bàn chân → ngón chân út (Chí âm).'}
  ],
  KI:[{id:'main',codes:codes('KI',1,27),waypoints:pts('KI',1,27),note:'Dưới ngón chân út vào lòng bàn chân → xương thuyền → sau mắt cá trong → bờ sau xương chày → trong khoeo → mặt trong đùi → bụng (0,5 thốn cạnh Nhâm) → ngực (2 thốn cạnh Nhâm).'}],
  PC:[{id:'main',codes:codes('PC',1,9),waypoints:pts('PC',1,9),note:'Cạnh vú (ngực) → nếp nách trước → giữa Phế và Tâm → giữa khuỷu → giữa hai gân cẳng tay → gan tay → đầu ngón giữa.'}],
  TE:[{id:'main',codes:codes('TE',1,23),waypoints:pts('TE',1,23),note:'Ngón đeo nhẫn → mu tay giữa xương bàn 4-5 → giữa xương quay và trụ → mỏm khuỷu → mặt sau ngoài cánh tay → vai → gáy → sau tai → trước tai → đuôi mày (Ty trúc không).'}],
  GB:[{id:'main',codes:codes('GB',1,44),waypoints:pts('GB',1,44),note:'Đuôi mắt → thái dương, quanh tai → gáy → vai → nách → sườn (Chương môn) → mấu chuyển lớn → mặt ngoài đùi, cẳng chân → mu chân → ngón chân IV.'}],
  LR:[{id:'main',codes:codes('LR',1,14),waypoints:pts('LR',1,14),note:'Chòm lông ngón chân cái → mu chân → trước mắt cá trong → mặt trong đùi → vùng mu → bụng dưới → sườn (Chương môn, Kỳ môn).'}],
  CV:[{id:'main',codes:codes('CV',1,24),waypoints:pts('CV',1,24),note:'Hội âm → giữa bụng, ngực → họng → cằm (Thừa tương).'}],
  GV:[{id:'main',codes:codes('GV',1,28),waypoints:pts('GV',1,28),note:'Trường cường → dọc giữa cột sống → Phong phủ → đỉnh đầu → trán → mũi → nướu răng trên (Ngân giao).'}]
};

// Textbook corrections to vendor anchors (render layer only; anchors stay UNVERIFIED).
//
// Chest levels. The vendor file placed the sternal/chest points with crude
// height fractions, which sit ~1.5 cun too low and even invert CV-15/CV-16.
// The textbooks fix these levels by intercostal space: the sternum is 9 cun long
// from the suprasternal notch (CV-22) to the xiphisternal joint (CV-16), and CV-17…CV-21
// follow in 1.6-cun steps (CV-21 is 1 cun below CV-22). Lateral points at the same rib
// level share it: ST-13…18 (4 cun), KI-22…27 (2 cun), SP-17…20 (6 cun), LU-1/2, PC-1.
// Levels are expressed as cun above the fitted xiphoid landmark (trunk ruler).
const LEVEL={ // cun above xiphisternal joint
  'CV-16':0,'CV-17':1.6,'CV-18':3.2,'CV-19':4.8,'CV-20':6.4,'CV-21':8,
  'KI-22':0,'KI-23':1.6,'KI-24':3.2,'KI-25':4.8,'KI-26':6.4,'KI-27':8,
  'ST-18':0,'ST-17':1.6,'ST-16':3.2,'ST-15':4.8,'ST-14':6.4,'ST-13':8,
  'SP-17':0,'SP-18':1.6,'SP-19':3.2,'SP-20':4.8,
  'CV-22':9,'LU-1':6.4,'LU-2':8,'PC-1':1.6
};
export const CHEST_LEVEL_FIXES=LEVEL;

// Full anchor replacements (source coordinates: z = height above floor, fit.height = 1.7195 m).
// Occiput. Vendor placed GV-15/16, BL-10 and GB-20 on the top of the neck segment (chin level,
// ~6 cm below the nape hairline) and GV-17/BL-9/GB-19 ~6 cm above the external occipital
// protuberance, so GV-16→GV-17 was 5 cun apart instead of 1.5 and GB-19→GB-20 was 20 cm.
// Textbook: GV-17 on the upper border of the protuberance (posterior-most midline skin, z≈1.62 m),
// GV-16 1.5 cun below in the occipital hollow, GV-15 between C1 and C2, GB-19 level with GV-17,
// GB-20 level with GV-16, BL-9 level with GV-17 (1.3 cun lateral), BL-10 level with GV-15.
const H=1.7195,zf=z=>+(z/H).toFixed(4);
const REPLACE={
  'DU-17':{seg:'head',z_frac:zf(1.62),az:180},
  'DU-16':{seg:'head',z_frac:zf(1.56),az:180},
  'DU-15':{seg:'head',z_frac:zf(1.525),az:180},
  'BL-9':{seg:'head',z_frac:zf(1.62),lat:1.3,face:'posterior'},
  'BL-10':{seg:'head',z_frac:zf(1.525),lat:1.3,face:'posterior'},
  'GB-19':{seg:'head',z_frac:zf(1.62),lat:2.25,face:'posterior'},
  'GB-20':{seg:'head',z_frac:zf(1.56),lat:2.6,face:'posterior'},
  // ST-41 (ankle crease, between the extensor tendons) was cast from the talus 6.5 cm above the crease.
  'ST-41':{seg:'shank',cun:.7,from:'p1',az:0}
};

const stripZ=a=>{const {z_frac,z_from,z_cun,t,cun,from,vertebra,dz_cun,...rest}=a;return rest};

/** Apply the chest-level correction to a channel-point list (mutates anchors). */
export function applyTextbookAnchorFixes(points,canonicalCode){
  const fixed=[];
  for(const point of points){
    const code=canonicalCode(point.code),cun=LEVEL[code];
    if(cun===undefined||!point.anchor||point.anchor.seg!=='trunk')continue;
    point.anchor={...stripZ(point.anchor),z_from:'xiphoid',z_cun:cun};
    fixed.push(code);
  }
  for(const point of points){
    const code=canonicalCode(point.code),a=REPLACE[code]??REPLACE[point.code];
    if(!a)continue;
    point.anchor={...a};fixed.push(code);
  }
  return fixed;
}

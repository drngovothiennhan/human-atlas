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
  return fixed;
}

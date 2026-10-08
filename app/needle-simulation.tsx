import type {NeedleAction,NeedleIntensity,NeedlePhase} from './meridian-overlay';

/**
 * Lát cắt mô tại huyệt — a 2D, illustrative cross-section that follows the needle on the 3D body.
 * Pure SVG + CSS (no second WebGL context). Layer thicknesses are generic, not to scale.
 */
type Props={
  angleDegrees:number;
  depthTac:number;
  phase:NeedlePhase;
  action:NeedleAction;
  intensity:NeedleIntensity;
  playing:boolean;
  deqi:boolean;
  regionName?:string|null;
  guideDepthTac?:[number,number]|null;
};

const W=320,H=190,SKIN_Y=58,PX_PER_TAC=46;
const LAYERS=[
  {name:'Da',y:SKIN_Y,h:10,fill:'#f2c9ae'},
  {name:'Mô dưới da',y:SKIN_Y+10,h:28,fill:'#f7e3c4'},
  {name:'Cơ',y:SKIN_Y+38,h:62,fill:'#d98f80'},
  {name:'Xương / mô sâu',y:SKIN_Y+100,h:H-SKIN_Y-100,fill:'#e7e2d6'}
];

export default function NeedleSimulation({angleDegrees,depthTac,phase,action,intensity,playing,deqi,regionName,guideDepthTac}:Props){
  const entryX=W/2,inside=phase==='approach'||phase==='withdraw'?0:depthTac;
  const tipOffset=phase==='approach'?-14:phase==='withdraw'?-24:inside*PX_PER_TAC;
  const shaft=150;
  // Needle drawn along +y in its own frame, rotated so 90° = straight down into the skin.
  const rotation=90-angleDegrees;
  const motionClass=playing&&phase==='manipulate'?`needle-motion-${action} needle-speed-${intensity}`:'';
  const guideY=guideDepthTac?SKIN_Y+guideDepthTac[1]*PX_PER_TAC*Math.sin(angleDegrees*Math.PI/180):null;
  return <figure className="needle-simulation" data-needle-simulation="cross-section" data-needle-phase={phase}>
    <svg className="needle-section" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Lát cắt mô minh họa tại huyệt: góc đồ họa ${angleDegrees} độ, độ sâu minh họa ${depthTac} tấc`}>
      {LAYERS.map(layer=><g key={layer.name}><rect x="0" y={layer.y} width={W} height={layer.h} fill={layer.fill}/><text x="8" y={layer.y+Math.min(layer.h-3,14)} className="needle-layer-label">{layer.name}</text></g>)}
      <rect x="0" y="0" width={W} height={SKIN_Y} fill="#f6f8f9"/>
      {guideY!==null&&guideY<H&&<g className="needle-guide"><line x1="0" x2={W} y1={guideY} y2={guideY}/><text x={W-6} y={guideY-4} textAnchor="end">giới hạn sách nêu cho vùng</text></g>}
      {deqi&&inside>0&&<circle className="needle-deqi" cx={entryX} cy={SKIN_Y} r="16"/>}
      <g transform={`translate(${entryX} ${SKIN_Y}) rotate(${-rotation})`}>
        <g className={motionClass}>
          <g transform={`translate(0 ${tipOffset})`}>
            <line x1="0" y1="0" x2="0" y2={-shaft} className="needle-shaft"/>
            <rect x="-3.5" y={-shaft-34} width="7" height="34" rx="2" className="needle-handle"/>
            <line x1="-3.5" x2="3.5" y1={-shaft-26} y2={-shaft-24} className="needle-grip"/>
            <line x1="-3.5" x2="3.5" y1={-shaft-16} y2={-shaft-14} className="needle-grip"/>
          </g>
        </g>
      </g>
      <text x="8" y="14" className="needle-view-label">MÔ HÌNH MINH HỌA · KHÔNG THEO TỶ LỆ{regionName?` · ${regionName}`:''}</text>
    </svg>
    <figcaption className="needle-disclaimer">Góc đồ họa {angleDegrees}° · Độ sâu minh họa {depthTac} tấc. Lớp mô vẽ chung, không phải thông số châm cứu cho người thật.</figcaption>
  </figure>;
}

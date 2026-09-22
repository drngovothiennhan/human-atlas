export type RenderQualityMode='auto'|'economy'|'high';
export type RenderQualityProfile='economy'|'balanced'|'high';

export interface RenderCapabilities{
  webgl:boolean;
  webgl2:boolean;
  maxTextureSize:number|null;
  hardwareConcurrency:number|null;
  deviceMemoryGb:number|null;
  devicePixelRatio:number;
  viewportPixels:number;
}

export interface RenderQualityConfig{
  pixelRatioCap:number;
  antialias:boolean;
  shadows:boolean;
  tubeRadialSegments:number;
  markerSegments:number;
  flowParticlesPerPath:number;
}

export const QUALITY_CONFIG:Record<RenderQualityProfile,RenderQualityConfig>={
  economy:{pixelRatioCap:1,antialias:false,shadows:false,tubeRadialSegments:5,markerSegments:10,flowParticlesPerPath:2},
  balanced:{pixelRatioCap:1.5,antialias:true,shadows:false,tubeRadialSegments:6,markerSegments:14,flowParticlesPerPath:3},
  high:{pixelRatioCap:2,antialias:true,shadows:true,tubeRadialSegments:8,markerSegments:18,flowParticlesPerPath:5},
};

const finiteNumber=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?value:null;

export function detectRenderCapabilities():RenderCapabilities{
  const dpr=Math.max(1,Math.min(4,finiteNumber(globalThis.devicePixelRatio)??1));
  const width=Math.max(1,globalThis.innerWidth||1),height=Math.max(1,globalThis.innerHeight||1);
  const nav=globalThis.navigator as Navigator&{deviceMemory?:number};
  const hardwareConcurrency=finiteNumber(nav?.hardwareConcurrency);
  const deviceMemoryGb=finiteNumber(nav?.deviceMemory);
  let webgl=false,webgl2=false,maxTextureSize:number|null=null;
  try{
    const canvas=document.createElement('canvas');
    const context2=canvas.getContext('webgl2',{powerPreference:'high-performance'});
    const context=context2||canvas.getContext('webgl',{powerPreference:'high-performance'});
    webgl=Boolean(context);webgl2=Boolean(context2);
    if(context)maxTextureSize=finiteNumber(context.getParameter(context.MAX_TEXTURE_SIZE));
    const lose=context?.getExtension('WEBGL_lose_context');lose?.loseContext();
  }catch{}
  return {webgl,webgl2,maxTextureSize,hardwareConcurrency,deviceMemoryGb,devicePixelRatio:dpr,viewportPixels:width*height*dpr*dpr};
}

export function selectInitialProfile(mode:RenderQualityMode,caps:RenderCapabilities):RenderQualityProfile{
  if(mode==='economy')return 'economy';
  if(mode==='high')return 'high';
  if(!caps.webgl)return 'economy';
  const constrainedMemory=caps.deviceMemoryGb!==null&&caps.deviceMemoryGb<4;
  const constrainedCpu=caps.hardwareConcurrency!==null&&caps.hardwareConcurrency<4;
  const constrainedTexture=caps.maxTextureSize!==null&&caps.maxTextureSize<8192;
  const veryDenseViewport=caps.viewportPixels>5_500_000;
  if(constrainedMemory||constrainedCpu||constrainedTexture||veryDenseViewport)return 'economy';
  const roomyMemory=caps.deviceMemoryGb===null||caps.deviceMemoryGb>=8;
  const roomyCpu=caps.hardwareConcurrency===null||caps.hardwareConcurrency>=8;
  const capableTexture=caps.maxTextureSize===null||caps.maxTextureSize>=16384;
  if(caps.webgl2&&roomyMemory&&roomyCpu&&capableTexture&&caps.viewportPixels<=3_500_000)return 'high';
  return 'balanced';
}

export function stepAdaptiveProfile(profile:RenderQualityProfile,meanFrameMs:number):RenderQualityProfile{
  if(!Number.isFinite(meanFrameMs)||meanFrameMs<=0)return profile;
  if(meanFrameMs>28)return profile==='high'?'balanced':profile==='balanced'?'economy':'economy';
  if(meanFrameMs<16)return profile==='economy'?'balanced':profile==='balanced'?'high':'high';
  return profile;
}

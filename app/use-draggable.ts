import {useCallback,useEffect,useRef,type PointerEvent as ReactPointerEvent} from 'react';

type StoredPosition={x:number;y:number};
const positionKey=(key:string)=>`hiu-atlas-drag:${key}:v1`;

export function useDraggable(key:string){
  const ref=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    try{const saved=localStorage.getItem(positionKey(key));if(saved&&ref.current){const p=JSON.parse(saved) as StoredPosition;if(Number.isFinite(p.x)&&Number.isFinite(p.y))ref.current.style.translate=`${p.x}px ${p.y}px`}}catch{}
  },[key]);
  const onPointerDown=useCallback((event:ReactPointerEvent<HTMLElement>)=>{
    const node=ref.current;if(!node||event.button!==0)return;
    event.preventDefault();event.stopPropagation();
    const startX=event.clientX,startY=event.clientY;
    const current=node.style.translate.match(/^(-?[\d.]+)px\s+(-?[\d.]+)px$/);
    const originX=current?Number(current[1]):0,originY=current?Number(current[2]):0;
    const rect=node.getBoundingClientRect();
    const handle=event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const move=(next:PointerEvent)=>{
      if(next.pointerId!==event.pointerId)return;
      const dx=next.clientX-startX,dy=next.clientY-startY;
      const x=Math.min(innerWidth-rect.left+originX-rect.width,Math.max(-rect.left+originX,originX+dx));
      const y=Math.min(innerHeight-rect.top+originY-rect.height,Math.max(-rect.top+originY,originY+dy));
      node.style.translate=`${x}px ${y}px`;
    };
    const end=(next:PointerEvent)=>{
      if(next.pointerId!==event.pointerId)return;
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);
      const values=node.style.translate.match(/^(-?[\d.]+)px\s+(-?[\d.]+)px$/);
      if(values)try{localStorage.setItem(positionKey(key),JSON.stringify({x:Number(values[1]),y:Number(values[2])}))}catch{}
    };
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
  },[key]);
  return {ref,onPointerDown};
}

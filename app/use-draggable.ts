import {useCallback,useEffect,useRef,type PointerEvent as ReactPointerEvent} from 'react';

type StoredPosition={x:number;y:number};
const positionKey=(key:string)=>`hiu-atlas-drag:${key}:v1`;

export function useDraggable(key:string){
  const ref=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    const node=ref.current;if(!node)return;
    const read=()=>node.style.translate.match(/^(-?[\\d.]+)px\\s+(-?[\\d.]+)px$/);
    const clamp=()=>{
      const values=read(),x=values?Number(values[1]):0,y=values?Number(values[2]):0,rect=node.getBoundingClientRect();
      const nextX=x+Math.min(window.innerWidth-rect.right,Math.max(-rect.left,0));
      const nextY=y+Math.min(window.innerHeight-rect.bottom,Math.max(-rect.top,0));
      if(nextX!==x||nextY!==y){node.style.translate=`${nextX}px ${nextY}px`;try{localStorage.setItem(positionKey(key),JSON.stringify({x:nextX,y:nextY}))}catch{}}
    };
    try{const saved=localStorage.getItem(positionKey(key));if(saved){const p=JSON.parse(saved) as StoredPosition;if(Number.isFinite(p.x)&&Number.isFinite(p.y))node.style.translate=`${p.x}px ${p.y}px`}}catch{}
    const frame=requestAnimationFrame(clamp);
    window.addEventListener('resize',clamp);
    const observer=new ResizeObserver(clamp);observer.observe(node);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',clamp);observer.disconnect()};
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

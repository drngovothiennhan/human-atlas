import {useEffect,useRef} from 'react';

/**
 * Mobile layout shows every panel as a bottom sheet in the same place, so only
 * one may be open at a time. Opening a sheet announces it; every other sheet
 * closes itself. Desktop keeps its free-floating, multi-panel behaviour.
 */
export const SHEET_OPEN_EVENT='hiu-atlas:sheet-open';

export const isMobileLayout=()=>typeof document!=='undefined'&&!!document.querySelector('.studio.layout-mobile');

export function useExclusiveSheet(id:string,open:boolean,close:()=>void){
  const closeRef=useRef(close);
  closeRef.current=close;
  useEffect(()=>{
    if(!open||!isMobileLayout())return;
    window.dispatchEvent(new CustomEvent(SHEET_OPEN_EVENT,{detail:id}));
  },[id,open]);
  useEffect(()=>{
    if(!open)return;
    const onOpen=(event:Event)=>{
      const other=(event as CustomEvent<string>).detail;
      if(other!==id&&isMobileLayout())closeRef.current();
    };
    window.addEventListener(SHEET_OPEN_EVENT,onOpen);
    return()=>window.removeEventListener(SHEET_OPEN_EVENT,onOpen);
  },[id,open]);
}

const STORAGE_KEY='hiu-atlas-floating-menu-size-v1';
type SavedSize={width:number;height:number};
type SizeMap=Record<string,SavedSize>;

const readSizes=():SizeMap=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') as SizeMap}catch{return {}}};
const writeSizes=(sizes:SizeMap)=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sizes))}catch{}};

/** Adds persistent mouse and touch resizing to panels already moved by useDraggable. */
export function installFloatingMenuResize(root:HTMLElement):()=>void{
  const listeners:Array<()=>void>=[];
  const initialized=new WeakSet<HTMLElement>();
  const initialize=(panel:HTMLElement)=>{
    if(initialized.has(panel))return;
    initialized.add(panel);
    const id=panel.dataset.floatingMenu;
    if(!id)return;
    const saved=readSizes()[id];
    if(saved&&Number.isFinite(saved.width)&&Number.isFinite(saved.height)){
      panel.dataset.floatingResized='true';
      panel.style.setProperty('--floating-width',`${Math.max(panel.hasAttribute('data-floating-compact')?180:220,saved.width)}px`);
      panel.style.setProperty('--floating-height',`${Math.max(panel.hasAttribute('data-floating-compact')?44:120,saved.height)}px`);
    }
    const begin=(event:PointerEvent)=>{
      if(event.button!==0)return;
      if(event.target!==panel)return;
      const rect=panel.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
      if(x<rect.width-28||y<rect.height-28)return;
      event.preventDefault();event.stopPropagation();
      const rootRect=root.getBoundingClientRect();
      const startX=event.clientX,startY=event.clientY,startWidth=rect.width,startHeight=rect.height;
      try{panel.setPointerCapture(event.pointerId)}catch{}
      const move=(next:PointerEvent)=>{
        const width=Math.max(panel.hasAttribute('data-floating-compact')?180:220,Math.min(startWidth+next.clientX-startX,rootRect.right-rect.left-8));
        const height=Math.max(panel.hasAttribute('data-floating-compact')?44:120,Math.min(startHeight+next.clientY-startY,rootRect.bottom-rect.top-8));
        panel.dataset.floatingResized='true';
        panel.style.setProperty('--floating-width',`${width}px`);
        panel.style.setProperty('--floating-height',`${height}px`);
      };
      const finish=()=>{
        panel.removeEventListener('pointermove',move);panel.removeEventListener('pointerup',finish);panel.removeEventListener('pointercancel',finish);
        try{panel.releasePointerCapture(event.pointerId)}catch{}
        const current=readSizes(),size=panel.getBoundingClientRect();
        current[id]={width:size.width,height:size.height};writeSizes(current);
      };
      panel.addEventListener('pointermove',move);panel.addEventListener('pointerup',finish,{once:true});panel.addEventListener('pointercancel',finish,{once:true});
    };
    panel.addEventListener('pointerdown',begin);listeners.push(()=>panel.removeEventListener('pointerdown',begin));
  };
  const scan=()=>root.querySelectorAll<HTMLElement>('[data-floating-menu]').forEach(initialize);
  scan();
  const observer=new MutationObserver(scan);observer.observe(root,{childList:true,subtree:true});
  return()=>{observer.disconnect();listeners.forEach(remove=>remove())};
}

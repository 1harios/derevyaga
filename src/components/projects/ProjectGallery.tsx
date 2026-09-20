'use client'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { LuArrowLeft, LuArrowRight, LuMaximize2, LuMinus, LuPlus, LuRotateCcw } from 'react-icons/lu'
import { Modal } from '@/components/ui/Modal'
import styles from './ProjectMedia.module.css'
export function ProjectGallery({ images, name, plan = false }: { images: { src: string; alt: string }[]; name: string; plan?: boolean }) {
  const unique = images.filter((im, i) => images.findIndex(other => other.src === im.src) === i)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({x:0,y:0})
  const viewport = useRef<HTMLDivElement>(null)
  const drag = useRef<{x:number;y:number;ox:number;oy:number}|null>(null)
  const reset = () => {setScale(1);setOffset({x:0,y:0})}
  const move = (n:number) => {setActive(i=>(i+n+unique.length)%unique.length);reset()}
  const clamp = (x:number,y:number,z:number) => {const r=viewport.current?.getBoundingClientRect();const mx=(r?.width??0)*(z-1)/2;const my=(r?.height??0)*(z-1)/2;return {x:Math.max(-mx,Math.min(mx,x)),y:Math.max(-my,Math.min(my,y))}}
  const zoom = (n:number) => {const z=Math.max(1,Math.min(4,n));setScale(z);setOffset(o=>clamp(o.x,o.y,z))}
  return <div className={`relative flex min-w-0 flex-col ${plan ? 'h-full' : ''}`} onKeyDown={e=>{if(!open)return;if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale+.5)}if(e.key==='-'){e.preventDefault();zoom(scale-.5)}if(e.key==='0')reset()}}>
    <button type="button" className={`relative block w-full overflow-hidden rounded-2xl ${plan?'aspect-[4/3] bg-white lg:aspect-auto lg:min-h-[320px] lg:flex-1':'aspect-[4/5] flex-1 lg:aspect-auto lg:min-h-[520px]'}`} aria-label={`Открыть ${plan?'планировку':'фотографии'} дома ${name}`} onClick={e=>{e.currentTarget.focus();reset();setOpen(true)}}>
      <Image key={active} src={unique[active].src} alt={unique[active].alt} fill loading="eager" sizes="(min-width: 1024px) 55vw, 100vw" className={`${plan?'object-contain p-4':'object-cover'} ${styles.reveal}`}/><span className="absolute bottom-5 right-5 rounded-full bg-white p-4 text-ink"><LuMaximize2/></span>
    </button>
    {unique.length>1&&<div className="mt-3 flex gap-2 overflow-x-auto p-1">{unique.map((im,i)=><button key={im.src} type="button" aria-label={`Фотография ${i+1}: ${im.alt}`} aria-pressed={active===i} onClick={()=>{setActive(i);reset()}} className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-[8px] border-2 transition-all duration-200 motion-reduce:transition-none ${active===i?'border-brand ring-1 ring-brand':'border-transparent opacity-65 hover:opacity-100'}`}><Image src={im.src} alt="" fill sizes="96px" className="object-cover"/></button>)}</div>}
    <Modal open={open} onClose={()=>setOpen(false)} title={`${name} · ${active+1} / ${unique.length}`} size="gallery">
      <div ref={viewport} className={styles.viewer} style={{cursor:scale>1?'grab':'zoom-in',background:plan?'#eeefeb':undefined}} onDoubleClick={()=>zoom(scale===1?2:1)} onWheel={e=>zoom(scale+(e.deltaY<0?.25:-.25))} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y}}} onPointerMove={e=>{const d=drag.current;if(d&&scale>1)setOffset(clamp(d.ox+e.clientX-d.x,d.oy+e.clientY-d.y,scale))}} onPointerUp={e=>{const d=drag.current;if(d&&scale===1&&Math.abs(e.clientX-d.x)>60)move(e.clientX>d.x?-1:1);drag.current=null}} onPointerCancel={()=>{drag.current=null}}>
        <div className={styles.picture} style={{transform:`translate(${offset.x}px, ${offset.y}px) scale(${scale})`}}><Image src={unique[active].src} alt={unique[active].alt} fill unoptimized draggable={false} className="object-contain"/></div>
      </div>
      <div className={styles.controls}><button className={styles.control} disabled={unique.length<2} aria-label="Предыдущее фото" onClick={()=>move(-1)}><LuArrowLeft/></button><button className={styles.control} disabled={scale===1} aria-label="Уменьшить" onClick={()=>zoom(scale-.5)}><LuMinus/></button><output className="w-14 text-center text-sm text-white" aria-live="polite">{Math.round(scale*100)}%</output><button className={styles.control} disabled={scale===4} aria-label="Увеличить" onClick={()=>zoom(scale+.5)}><LuPlus/></button><button className={styles.control} aria-label="Сбросить масштаб" onClick={reset}><LuRotateCcw/></button><button className={styles.control} disabled={unique.length<2} aria-label="Следующее фото" onClick={()=>move(1)}><LuArrowRight/></button></div>
      <p className="mt-3 text-center text-xs text-white/60">Двойное нажатие — масштаб · Потяните увеличенное фото, чтобы рассмотреть детали</p>
    </Modal>
  </div>
}

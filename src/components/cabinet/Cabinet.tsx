'use client'

/* CRM media can use signed URLs; keep requests in the browser, outside the image proxy. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react'
import { FiArrowDown, FiArrowRight, FiCalendar, FiCheck, FiChevronDown, FiEye, FiEyeOff, FiImage, FiLogOut, FiMessageSquare, FiPlay, FiRefreshCw, FiSend, FiShield, FiX } from 'react-icons/fi'
import { DEMO_PASSWORD, DEMO_PHONE, type CabinetData, type Media } from '@/lib/cabinet/types'
import s from './Cabinet.module.css'

type Tab='overview'|'stages'|'media'|'messages'
const tabs:{id:Tab;label:string}[]=[{id:'overview',label:'Обзор'},{id:'stages',label:'Этапы стройки'},{id:'media',label:'Фото и видео'},{id:'messages',label:'Переписка'}]
const date=(value:string)=>new Date(value).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})

async function api(path='',method='GET',value?:unknown) {
  const response=await fetch('/api/cabinet'+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},...(value===undefined ? {} : {body:JSON.stringify(value)})})
  const payload=await response.json()
  if(!response.ok) throw Object.assign(new Error(payload.error || 'Не удалось выполнить запрос'),{status:response.status})
  return payload
}

export function Cabinet({demo}:{demo:boolean}) {
  const [data,setData]=useState<CabinetData|null>(null)
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const [phone,setPhone]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false)
  const [tab,setTab]=useState<Tab>('overview'),[filter,setFilter]=useState('all'),[selected,setSelected]=useState<Media|null>(null)
  const [message,setMessage]=useState(''),[sending,setSending]=useState(false),[sent,setSent]=useState('')
  const [authenticated,setAuthenticated]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null),chatEnd=useRef<HTMLDivElement>(null)
  const requestEpoch=useRef(0)
  const load=useCallback(async()=>{
    const epoch=requestEpoch.current
    try {const result=await api();if(epoch!==requestEpoch.current)return;setData(result);setAuthenticated(true);setError('')}
    catch(e) {if(epoch!==requestEpoch.current)return;const err=e as Error & {status?:number};if(err.status===401){setData(null);setSelected(null);setAuthenticated(false)} else {if(err.status===502)setAuthenticated(true);setError(err.message)}}
    finally {if(epoch===requestEpoch.current)setLoading(false)}
  },[])
  useEffect(()=>{const timer=setTimeout(()=>{void load()},0);return ()=>clearTimeout(timer)},[load])
  useEffect(()=>{
    if(!authenticated) return
    const timer=setInterval(()=>{if(document.visibilityState==='visible') void load()},60000)
    return ()=>clearInterval(timer)
  },[authenticated,load])
  useEffect(()=>{if(selected)dialog.current?.showModal();else dialog.current?.close()},[selected])
  useEffect(()=>{if(tab==='messages')chatEnd.current?.scrollIntoView({block:'nearest'})},[tab,data?.messages.length])

  async function login(e:React.FormEvent) {
    requestEpoch.current++
    e.preventDefault();setBusy(true);setError('')
    try {await api('/auth','POST',{phone,password});setPassword('');setAuthenticated(true);await load()}
    catch(e){setError((e as Error).message)} finally {setBusy(false)}
  }
  async function logout() {
    requestEpoch.current++
    setBusy(true)
    try {await api('/auth','DELETE');setData(null);setSelected(null);setAuthenticated(false);setMessage('');setSent('');setTab('overview');setError('')}
    catch(e){setError((e as Error).message)} finally {setBusy(false)}
  }
  async function send(e:React.FormEvent) {
    e.preventDefault();if(!message.trim() || sending)return;setSending(true);setSent('');setError('')
    try {const result=await api('/messages','POST',{text:message});setData(d=>d ? {...d,messages:[...d.messages,result.message]}:d);setMessage('');setSent(result.demo ? 'Сохранено в вашей демосессии. Команде не отправляется.' : 'Сообщение передано команде через amoCRM.')}
    catch(e){setError((e as Error).message)}finally{setSending(false)}
  }
  function chooseTab(next:Tab){setTab(next);setSent('')}
  const current=data?.stages.find(stage=>stage.status==='active')
  const media=data?.media.filter(m=>filter==='all' || m.kind===filter) || []

  return <section className={`shell ${s.cabinet}`} aria-label="Личный кабинет">
    {loading ? <div className={s.loading} role="status"><FiRefreshCw className={s.spin}/><span>Открываем кабинет</span></div> : !authenticated ? <div className={s.login}>
      <div className={s.loginVisual}>
        <img src="/photos/proekt-sosnovka.webp" alt="Каркасный дом проекта Сосновка"/>
        <span className={s.visualTag}>Деревяга · кабинет заказчика</span>
        <div className={s.visualCopy}><span>От первого шага до ключей</span><h2>Ближе к дому,<br/>где бы вы ни были.</h2><p>Вся история строительства —<br/>в одном месте.</p></div>
      </div>
      <div className={s.loginForm}>
        <span className={s.eyebrow}>Личный кабинет</span><h2>Рады вас видеть</h2><p className={s.muted}>Войдите, чтобы посмотреть, как строится ваш дом.</p>
        <form onSubmit={login}>
          <label htmlFor="cabinet-phone">Номер телефона</label><input id="cabinet-phone" name="phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" value={phone} maxLength={24} onChange={e=>setPhone(e.target.value)} required/>
          <label htmlFor="cabinet-password">Пароль</label><div className={s.password}><input id="cabinet-password" name="password" type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} maxLength={128} required/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Скрыть пароль':'Показать пароль'}>{showPassword?<FiEyeOff/>:<FiEye/>}</button></div>
          {error && <p role="alert" className={s.error}>{error}</p>}
          <button className={s.primary} disabled={busy} type="submit">{busy?'Входим…':'Войти в кабинет'}<FiArrowRight/></button>
        </form>
        {demo ? <div className={s.demoAccess}><strong>Посмотрите, как это работает</strong><p>Тестовый кабинет с вымышленной стройкой. Фотографии — иллюстрации из каталога.</p><div><span>{DEMO_PHONE}</span><code>{DEMO_PASSWORD}</code></div><button type="button" onClick={()=>{setPhone(DEMO_PHONE);setPassword(DEMO_PASSWORD);setError('')}}>Заполнить демодоступ <FiArrowDown/></button></div> : <p className={s.help}>Доступ и восстановление пароля — через вашего менеджера. Вход по SMS появится позже.</p>}
        <p className={s.security}><FiShield/> Вход по телефону и паролю{demo?' · SMS — позже':''}</p>
      </div>
    </div> : <>
      <div className={s.toolbar}><div><span className={s.eyebrow}>Личный кабинет</span><h2>{data ? `${data.name}, ваш дом строится`:'Ваш кабинет'}</h2></div><div className={s.actions}><button aria-label="Обновить данные" title="Обновить данные" disabled={busy} onClick={async()=>{setBusy(true);await load();setBusy(false)}}><FiRefreshCw className={busy?s.spin:undefined}/></button><button onClick={logout} disabled={busy} aria-label="Выйти из кабинета"><FiLogOut/><span>Выйти</span></button></div></div>
      <div className={s.notice}><FiShield/><p>{demo ? <><strong>Демонстрационный кабинет.</strong> Данные вымышлены, медиа иллюстративные. Сообщения остаются только в вашей тестовой сессии.</> : <><strong>На связи со стройкой.</strong> Здесь — опубликованные командой отчёты и сообщения. Данные обновляются автоматически раз в минуту.</>}</p></div>
      {error && <p role="alert" className={s.error}>{error}</p>}
      {data && <>
        <nav className={s.tabs} aria-label="Разделы кабинета">{tabs.map(t=><button key={t.id} aria-current={tab===t.id?'page':undefined} onClick={()=>chooseTab(t.id)}>{t.label}{t.id==='media'&&<span>{data.media.length}</span>}</button>)}</nav>
        {tab==='overview' && <div className={s.overview}>
          <div className={s.project}>
            <div className={s.projectPhoto}><img src={data.media.find(m=>m.kind==='photo')?.src || '/photos/proekt-sosnovka.webp'} alt={demo?'Иллюстрация строительных работ':'Последний фотоотчёт со стройки'} referrerPolicy="no-referrer"/><span>{demo?'Пример строительного отчёта':'Последний фотоотчёт'}</span></div>
            <div className={s.projectInfo}><span className={s.eyebrow}>Ваш проект · {data.area} м²</span><h3>Дом «{data.project}»</h3><p className={s.muted}>{data.location}</p><div className={s.progressTitle}><span>Готовность дома</span><strong>{data.progress}%</strong></div><div className={s.progress} role="progressbar" aria-label="Готовность дома" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.progress}><span style={{width:`${data.progress}%`}}/></div><div className={s.projectDates}><div><span>Начали строительство</span><strong>{date(data.start)}</strong></div><div><span>Плановая передача</span><strong>{date(data.finish)}</strong></div></div></div>
          </div>
          <div className={s.side}>
            <div className={s.activeStage}><span className={s.eyebrow}>Сейчас на участке</span><span className={s.stageBadge}>{current?'В работе':data.progress===100?'Дом готов':'По плану'}</span><h3>{current?.title || 'Готовимся к следующему этапу'}</h3><p>{current?.detail || 'Новые подробности появятся в отчёте команды.'}</p><button onClick={()=>chooseTab('stages')}>Все этапы стройки <FiArrowRight/></button></div>
            <button className={s.contact} onClick={()=>chooseTab('messages')}><span className={s.avatar}>{data.manager.charAt(0)}</span><span><strong>{data.manager}</strong><small>Написать команде</small></span><FiMessageSquare/></button>
          </div>
          <div className={s.reports}><div className={s.sectionTitle}><div><span className={s.eyebrow}>С вашего участка</span><h3>Свежие отчёты</h3></div><button onClick={()=>chooseTab('media')}>Смотреть все <FiArrowRight/></button></div>{data.media.length ? <div className={s.previewGrid}>{data.media.slice(0,3).map(m=><MediaCard key={m.id} item={m} open={()=>setSelected(m)}/>)}</div> : <p className={s.empty}>Команда пока не добавила фото и видео.</p>}</div>
          <div className={s.meta}><span>Договор № {data.contract}</span><span>Отчёт обновлён {date(data.updatedAt)}{demo?' · пример':''}</span></div>
        </div>}
        {tab==='stages' && <div className={s.stages}><div className={s.sectionTitle}><div><span className={s.eyebrow}>Шаг за шагом</span><h3>Путь к вашему дому</h3></div><span className={s.muted}>{data.stages.filter(st=>st.status==='done').length} из {data.stages.length} этапов готовы</span></div><div className={s.timeline}>{data.stages.map((st,i)=><details key={i} className={`${s.stage} ${st.status==='active'?s.currentStage:''}`} open={st.status==='active'}><summary><span className={`${s.stageNumber} ${st.status==='done'?s.done:''}`}>{st.status==='done'?<FiCheck/>:String(i+1).padStart(2,'0')}</span><span className={s.stageText}><strong>{st.title}</strong><small><FiCalendar/>{st.dates}</small></span><span className={s.status}>{st.status==='done'?'Завершён':st.status==='active'?'В работе':'Впереди'}</span><FiChevronDown/></summary><p>{st.detail}</p></details>)}</div><p className={s.help}>Даты — план строительства. Изменения и подробности команда публикует в отчётах.</p></div>}
        {tab==='media' && <div className={s.mediaPanel}><div className={s.sectionTitle}><div><span className={s.eyebrow}>История строительства</span><h3>Фото и видео с участка</h3></div><div className={s.filters}>{[{id:'all',label:'Все'},{id:'photo',label:'Фото'},{id:'video',label:'Видео'}].map(f=><button key={f.id} aria-pressed={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label}</button>)}</div></div>{media.length ? <div className={s.mediaGrid}>{media.map(m=><MediaCard key={m.id} item={m} open={()=>setSelected(m)}/>)}</div> : <p className={s.empty}>Здесь появятся новые отчёты команды.</p>}</div>}
        {tab==='messages' && <div className={s.chatLayout}><aside className={s.chatAside}><span className={s.avatar}>{data.manager.charAt(0)}</span><h3>{data.manager}</h3><p>Вопросы по этапам, материалам и работам на участке — пишите здесь.</p><div><FiShield/><p>{demo?'Это пример переписки. Новые сообщения видны только вам до выхода из демосессии.':'Переписка сохраняется в вашей сделке amoCRM. Ответ команды появится здесь после публикации.'}</p></div></aside><div className={s.chat}><div className={s.chatHeading}><span><strong>Команда вашего дома</strong><small>{demo?'Демонстрационная переписка':'Переписка по строительству'}</small></span><FiMessageSquare/></div><div className={s.messages} role="log" aria-label="Переписка с командой">{data.messages.length ? data.messages.map(m=><div className={`${s.bubble} ${m.from==='client'?s.mine:''}`} key={m.id}><span>{m.from==='client'?'Вы':m.name}</span><p>{m.text}</p><time dateTime={m.date}>{date(m.date)} · {new Date(m.date).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</time></div>) : <p className={s.empty}>Задайте команде первый вопрос.</p>}<div ref={chatEnd}/></div><form onSubmit={send} className={s.composer}><label className="sr-only" htmlFor="cabinet-message">Сообщение команде</label><textarea id="cabinet-message" value={message} onChange={e=>setMessage(e.target.value)} maxLength={2000} placeholder="Напишите ваш вопрос…" rows={2} required/><div><small>{message.length} / 2000</small><button className={s.primary} type="submit" disabled={sending||!message.trim()}>{sending?'Отправляем…':demo?'Сохранить в демо':'Отправить'}<FiSend/></button></div>{sent&&<p role="status" className={s.sent}>{sent}</p>}</form></div></div>}
      </>}
    </>}
    <dialog ref={dialog} className={s.dialog} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null)}} onClose={()=>setSelected(null)} aria-label={selected?.title || 'Просмотр отчёта'}>{selected&&<><div className={s.dialogHeader}><span>{selected.stage} · {date(selected.date)}</span><button autoFocus onClick={()=>setSelected(null)} aria-label="Закрыть отчёт"><FiX/></button></div>{selected.kind==='video'?<video key={selected.src} src={selected.src} poster={selected.poster} controls playsInline preload="metadata"/>:<><img src={selected.src} alt={selected.title} referrerPolicy="no-referrer"/></>}<h3>{selected.title}</h3>{demo&&<p>Иллюстрация для демонстрации кабинета</p>}</>}</dialog>
  </section>
}

function MediaCard({item,open}:{item:Media;open:()=>void}) {
  return <button className={s.mediaCard} onClick={open}><div className={s.mediaImage}><img src={item.kind==='video'?item.poster || '/photos/proekt-sosnovka.webp':item.src} alt="" loading="lazy" referrerPolicy="no-referrer"/><span className={s.mediaType}>{item.kind==='video'?<FiPlay/>:<FiImage/>}{item.kind==='video'?'Видео':'Фото'}</span>{item.kind==='video'&&<span className={s.play}><FiPlay/></span>}</div><div className={s.mediaCaption}><span>{item.stage} · {date(item.date)}</span><strong>{item.title}</strong></div></button>
}

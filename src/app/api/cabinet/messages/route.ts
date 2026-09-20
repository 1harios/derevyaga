import { randomUUID } from 'node:crypto'
import { body, json, sameOrigin, session } from '@/lib/cabinet/http'
import { limit, transaction } from '@/lib/cabinet/store'
import { addNote, CLIENT_MARKER, linkedContact } from '@/lib/cabinet/amocrm'
import type { Message } from '@/lib/cabinet/types'

export const runtime='nodejs'
export async function POST(request:Request) {
  if(!sameOrigin(request)) return json({error:'Недопустимый источник запроса'},403)
  const s=await session()
  if(!s) return json({error:'Войдите в личный кабинет'},401)
  let text:string
  try { const p=await body(request,10000); if(typeof p.text!=='string' || !p.text.trim() || p.text.trim().length>2000) throw new Error(); text=p.text.trim() }
  catch { return json({error:'Сообщение должно содержать от 1 до 2000 символов'},400) }
  const allowed=await transaction(db=>limit(db,'message:'+s.account.id,15,60000))
  if(!allowed) return json({error:'Слишком много сообщений. Подождите минуту.'},429)
  const message:Message={id:randomUUID(),from:'client',name:s.account.name,text,date:new Date().toISOString()}
  if(s.account.mode==='demo') {
    const saved=await transaction(db=>{const current=db.sessions[s.id]; if(!current) return false; current.messages=[...current.messages,message].slice(-100); return true})
    return saved ? json({message,demo:true}) : json({error:'Сессия завершена'},401)
  }
  try {
    await linkedContact(s.account.leadId,s.account.contactId)
    const note=await addNote(s.account.leadId,CLIENT_MARKER+JSON.stringify({text}))
    return json({message:{...message,id:String(note.id),date:note.created_at ? new Date(note.created_at*1000).toISOString() : message.date},demo:false})
  } catch { return json({error:'amoCRM не подтвердила отправку. Обновите переписку перед повторной попыткой.'},502) }
}

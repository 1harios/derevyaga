import { normalizePhone, parseConstruction, type CabinetData, type Construction, type Message } from './types'

export const REPORT_MARKER = '[Кабинет: стройка]\n'
export const TEAM_MARKER = '[Кабинет: сообщение]\n'
export const CLIENT_MARKER = '[Кабинет: клиент]\n'
type Note = { id:number; created_at:number; note_type:string; params?:{text?:string} }

async function request<T>(path:string, body?:unknown):Promise<T> {
  const domain=process.env.AMO_DOMAIN?.trim()
  if (!domain || !/^[a-z0-9-]+\.amocrm\.(ru|com)$/.test(domain) || !process.env.AMO_TOKEN) throw new Error('amoCRM не настроена')
  const response=await fetch(`https://${domain}/api/v4${path}`, {
    method:body === undefined ? 'GET' : 'POST', cache:'no-store', signal:AbortSignal.timeout(15000),
    headers:{Authorization:`Bearer ${process.env.AMO_TOKEN}`,'Content-Type':'application/json'},
    ...(body === undefined ? {} : {body:JSON.stringify(body)}),
  })
  if(!response.ok) throw new Error(`amoCRM: HTTP ${response.status}`)
  if(response.status===204) return {} as T
  return response.json()
}

export async function linkedContact(leadId:number,contactId:number) {
  const lead=await request<{_embedded?:{contacts?:{id:number}[]}}>(`/leads/${leadId}?with=contacts`)
  if(!lead._embedded?.contacts?.some(c=>c.id===contactId)) throw new Error('Контакт не связан со сделкой')
  const contact=await request<{name:string;custom_fields_values?:{field_code:string;values:{value:string}[]}[]}>(`/contacts/${contactId}`)
  const phones=contact.custom_fields_values?.find(f=>f.field_code==='PHONE')?.values.map(v=>normalizePhone(String(v.value))).filter(Boolean) || []
  return {name:contact.name,phones}
}

export function safeMediaUrl(value:string) {
  try {
    const url=new URL(value)
    const hosts=(process.env.CABINET_MEDIA_HOSTS || '').split(',').map(h=>h.trim().toLowerCase()).filter(Boolean)
    return url.protocol==='https:' && !url.username && !url.password && !url.port && hosts.includes(url.hostname)
  } catch { return false }
}

export function validateReport(value:unknown):Construction {
  const report=parseConstruction(value)
  if(report.media.some(m=>!safeMediaUrl(m.src) || (m.poster && !safeMediaUrl(m.poster)))) throw new Error('Медиа должны быть на разрешённом HTTPS-хосте')
  if(JSON.stringify(report).length>16000) throw new Error('Отчёт слишком большой: максимум 16 000 символов')
  return report
}

/** Internal notes are private by default. Only exact publication markers are exposed. */
export function publishedData(notes:Note[]):CabinetData {
  const ordered=[...notes].sort((a,b)=>a.created_at-b.created_at || a.id-b.id)
  const reports=ordered.filter(n=>n.note_type==='common' && n.params?.text?.startsWith(REPORT_MARKER))
  const latest=reports.at(-1)
  if(!latest) throw new Error('Отчёт ещё не опубликован')
  const report=validateReport(JSON.parse(latest.params!.text!.slice(REPORT_MARKER.length)))
  const messages:Message[]=ordered.flatMap<Message>(n=>{
    if(n.note_type!=='common') return []
    const text=n.params?.text || ''
    if(text.startsWith(TEAM_MARKER) && text.length<=TEAM_MARKER.length+2000) return [{id:String(n.id),from:'team' as const,name:report.manager,text:text.slice(TEAM_MARKER.length),date:new Date(n.created_at*1000).toISOString()}]
    if(text.startsWith(CLIENT_MARKER)) {
      try {
        const p=JSON.parse(text.slice(CLIENT_MARKER.length))
        if(typeof p.text==='string' && p.text.length<=2000) return [{id:String(n.id),from:'client' as const,name:report.name,text:p.text,date:new Date(n.created_at*1000).toISOString()}]
      } catch { /* Invalid notes remain private. */ }
    }
    return []
  })
  return {...report,messages:messages.slice(-200),mode:'amocrm',updatedAt:new Date(latest.created_at*1000).toISOString()}
}

export async function readConstruction(leadId:number,contactId:number) {
  await linkedContact(leadId,contactId)
  const notes:Note[]=[]
  // Bound requests and fail explicitly instead of returning a silently incomplete report.
  for(let page=1;page<=40;page++) {
    const result=await request<{_embedded?:{notes?:Note[]};_links?:{next?:unknown}}>(`/leads/${leadId}/notes?limit=250&page=${page}`)
    notes.push(...(result._embedded?.notes || []))
    if(!result._links?.next) return publishedData(notes)
  }
  throw new Error('Слишком много примечаний для синхронизации')
}

export async function addNote(leadId:number,text:string) {
  const result=await request<{_embedded?:{notes?:{id:number;created_at:number}[]}}>(`/leads/${leadId}/notes`,[{note_type:'common',params:{text}}])
  const note=result._embedded?.notes?.[0]
  if(!note?.id) throw new Error('amoCRM не подтвердила сохранение')
  return note
}

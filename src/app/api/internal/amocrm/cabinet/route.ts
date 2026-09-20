import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { body, json } from '@/lib/cabinet/http'
import { hashPassword, transaction } from '@/lib/cabinet/store'
import { addNote, linkedContact, REPORT_MARKER, validateReport } from '@/lib/cabinet/amocrm'
import { normalizePhone } from '@/lib/cabinet/types'

export const runtime='nodejs'
function authorized(request:Request) {
  const a=process.env.AMO_ADMIN_SECRET,b=request.headers.get('x-admin-secret')
  return !!a && !!b && Buffer.byteLength(a)===Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b))
}
function validId(id:unknown):id is number {return typeof id==='number' && Number.isSafeInteger(id) && id>0}

/** Provision/reset a cabinet from a verified contact attached to a specific deal. */
export async function POST(request:Request) {
  if(!authorized(request)) return json({error:'Недостаточно прав'},401)
  try {
    const p=await body(request,3000)
    if(!validId(p.leadId) || !validId(p.contactId) || typeof p.phone!=='string') return json({error:'Нужны leadId, contactId и phone'},400)
    const phone=normalizePhone(p.phone),contact=await linkedContact(p.leadId,p.contactId)
    if(!phone || !contact.phones.includes(phone)) return json({error:'Телефон не принадлежит связанному контакту'},400)
    const password=randomBytes(12).toString('base64url')
    const outcome=await transaction(db=>{
      const existing=db.accounts.find(a=>a.phone===phone && a.mode==='amocrm')
      if(existing && (existing.leadId!==p.leadId || existing.contactId!==p.contactId || p.reset!==true)) return null
      const id=existing?.id || randomUUID()
      if(existing) {existing.passwordHash=hashPassword(password); existing.name=contact.name; for(const [key,s] of Object.entries(db.sessions)) if(s.accountId===id) delete db.sessions[key]}
      else db.accounts.push({id,phone,name:contact.name,passwordHash:hashPassword(password),leadId:p.leadId,contactId:p.contactId,mode:'amocrm'})
      return id
    })
    if(!outcome) return json({error:'Кабинет уже существует. Для сброса пароля той же сделки передайте reset: true. Один телефон — один кабинет.'},409)
    return json({id:outcome,phone,password,loginPath:'/lk',notice:'Передайте пароль клиенту по защищённому каналу. Пароль показан только в этом ответе.'},201)
  } catch { return json({error:'Не удалось создать кабинет. Проверьте подключение amoCRM и связь контакта со сделкой.'},502) }
}

/** Publish an explicitly approved construction snapshot as an amoCRM deal note. */
export async function PUT(request:Request) {
  if(!authorized(request)) return json({error:'Недостаточно прав'},401)
  try {
    const p=await body(request,70000)
    if(!validId(p.leadId)) return json({error:'Нужен leadId'},400)
    let report
    try {report=validateReport(p.report)} catch {return json({error:'Проверьте поля отчёта и разрешённые хосты медиа'},400)}
    const note=await addNote(p.leadId,REPORT_MARKER+JSON.stringify(report))
    return json({ok:true,noteId:note.id})
  } catch {return json({error:'amoCRM не подтвердила публикацию'},502)}
}

export async function DELETE(request:Request) {
  if(!authorized(request)) return json({error:'Недостаточно прав'},401)
  try {
    const p=await body(request,2000)
    if(typeof p.id!=='string') return json({error:'Нужен id кабинета'},400)
    await transaction(db=>{db.accounts=db.accounts.filter(a=>a.id!==p.id || a.mode!=='amocrm'); for(const [key,s] of Object.entries(db.sessions)) if(s.accountId===p.id) delete db.sessions[key]})
    return json({ok:true})
  } catch {return json({error:'Не удалось закрыть доступ'},400)}
}

import { json, session } from '@/lib/cabinet/http'
import { demoConstruction } from '@/lib/cabinet/demo'
import { readConstruction } from '@/lib/cabinet/amocrm'

export const runtime='nodejs'
export async function GET() {
  const s=await session()
  if(!s) return json({error:'Войдите в личный кабинет'},401)
  if(s.account.mode==='demo') return json({...demoConstruction,messages:[...demoConstruction.messages,...s.messages],mode:'demo',updatedAt:'2026-09-11T15:00:00+03:00'})
  try { return json(await readConstruction(s.account.leadId,s.account.contactId)) }
  catch { return json({error:'Не удалось получить опубликованный отчёт из amoCRM. Обратитесь к менеджеру или обновите позже.'},502) }
}

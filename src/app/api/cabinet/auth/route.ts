import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { body, COOKIE, json, sameOrigin } from '@/lib/cabinet/http'
import { cabinetMode, hashPassword, limit, sessionTTL, tokenDigest, transaction, verifyPassword } from '@/lib/cabinet/store'
import { DEMO_PASSWORD, DEMO_PHONE, normalizePhone } from '@/lib/cabinet/types'

export const runtime='nodejs'
export async function POST(request:Request) {
  if(!sameOrigin(request)) return json({error:'Недопустимый источник запроса'},403)
  try {
    const p=await body(request,2000)
    const phone=typeof p.phone==='string' ? normalizePhone(p.phone) : ''
    if(!phone || typeof p.password!=='string' || p.password.length>128) return json({error:'Проверьте номер телефона и пароль'},400)
    const token=randomBytes(32).toString('hex')
    const oldToken=(await cookies()).get(COOKIE)?.value
    const result=await transaction(db=>{
      if(!limit(db,'login:'+phone,8,15*60*1000) || !limit(db,'login:global',200,15*60*1000)) return 429
      if(cabinetMode()==='demo' && !db.accounts.some(a=>a.id==='demo')) db.accounts.push({id:'demo',phone:normalizePhone(DEMO_PHONE),name:'Александр',passwordHash:hashPassword(DEMO_PASSWORD),leadId:0,contactId:0,mode:'demo'})
      const account=db.accounts.find(a=>a.phone===phone && a.mode===cabinetMode())
      // Run the same expensive hash even when the account does not exist.
      const hash=account?.passwordHash || '00000000000000000000000000000000:'+ '00'.repeat(64)
      if(!verifyPassword(p.password,hash) || !account) return 401
      if(oldToken) delete db.sessions[tokenDigest(oldToken)]
      db.sessions[tokenDigest(token)]={accountId:account.id,expires:Date.now()+sessionTTL*1000,messages:[]}
      return 200
    })
    if(result!==200) return json({error:result===429 ? 'Слишком много попыток. Попробуйте через 15 минут.' : 'Неверный телефон или пароль'},result)
    ;(await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:'strict',secure:new URL(request.url).protocol==='https:' || process.env.CABINET_ORIGIN?.startsWith('https://')===true,path:'/api/cabinet',maxAge:sessionTTL})
    return json({ok:true})
  } catch { return json({error:'Не удалось войти. Попробуйте ещё раз.'},400) }
}
export async function DELETE(request:Request) {
  if(!sameOrigin(request)) return json({error:'Недопустимый источник запроса'},403)
  const token=(await cookies()).get(COOKIE)?.value
  if(token) await transaction(db=>{delete db.sessions[tokenDigest(token)]})
  ;(await cookies()).set(COOKIE,'',{httpOnly:true,sameSite:'strict',path:'/api/cabinet',maxAge:0})
  return json({ok:true})
}

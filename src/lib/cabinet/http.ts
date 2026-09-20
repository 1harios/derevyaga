import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { cabinetMode, tokenDigest, transaction } from './store'

export const COOKIE='derevyaga_cabinet'
export const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
export function sameOrigin(request:Request) {
  // Next's standalone server can normalize request.url to localhost even when
  // opened at 127.0.0.1. Only honor loopback Host here; production uses its origin.
  const host=request.headers.get('host') || ''
  const local=/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)
  const expected=process.env.CABINET_ORIGIN || (local ? new URL(request.url).protocol+'//'+host : new URL(request.url).origin)
  return request.headers.get('origin')===expected && request.headers.get('content-type')?.includes('application/json')
}
export async function body(request:Request,max=24000) {
  const reader=request.body?.getReader()
  if(!reader) throw new Error('Пустой запрос')
  const chunks:Uint8Array[]=[]
  let total=0
  while(true) { const {value,done}=await reader.read(); if(done) break; total+=value.length; if(total>max) { await reader.cancel(); throw new Error('Запрос слишком большой') }; chunks.push(value) }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
export async function session() {
  const token=(await cookies()).get(COOKIE)?.value
  if(!token || !/^[a-f0-9]{64}$/.test(token)) return null
  return transaction(db=>{
    const id=tokenDigest(token),s=db.sessions[id]
    const account=s && db.accounts.find(a=>a.id===s.accountId && a.mode===cabinetMode())
    return account ? {id,account,messages:s.messages} : null
  })
}

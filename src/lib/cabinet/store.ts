import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'
import type { Message } from './types'

export type Account = { id:string; phone:string; name:string; passwordHash:string; leadId:number; contactId:number; mode:'demo'|'amocrm' }
type Session = { accountId:string; expires:number; messages:Message[] }
type Store = { accounts:Account[]; sessions:Record<string,Session>; attempts:Record<string,{count:number;until:number}> }
const storePath = () => path.join(process.env.CABINET_DATA_DIR || path.join(process.cwd(), '.cabinet'), 'store.json')
const key = Symbol.for('derevyaga.cabinet.store.queue')
const shared = globalThis as typeof globalThis & { [key]?: Promise<unknown> }

/** Atomic file updates, serialized across route bundles in one Node process. Use one replica. */
export function transaction<T>(fn:(db:Store)=>T|Promise<T>):Promise<T> {
  const run = (shared[key] || Promise.resolve()).then(async () => {
    let db:Store
    try { db=JSON.parse(await readFile(storePath(),'utf8')) } catch(e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; db={accounts:[],sessions:{},attempts:{}} }
    for(const [id,s] of Object.entries(db.sessions)) if(s.expires<Date.now()) delete db.sessions[id]
    for(const [id,a] of Object.entries(db.attempts)) if(a.until<Date.now()) delete db.attempts[id]
    const result=await fn(db)
    await mkdir(path.dirname(storePath()),{recursive:true,mode:0o700})
    const temp=storePath()+'.tmp'
    await writeFile(temp,JSON.stringify(db),{mode:0o600})
    await rename(temp,storePath())
    return result
  })
  shared[key]=run.catch(()=>{})
  return run
}
export const tokenDigest=(token:string)=>createHash('sha256').update(token).digest('hex')
export function hashPassword(password:string) { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex') }
export function verifyPassword(password:string,stored:string) { const [salt,hash]=stored.split(':'); const expected=Buffer.from(hash,'hex'); const actual=scryptSync(password,salt,64); return actual.length===expected.length && timingSafeEqual(actual,expected) }
export const sessionTTL=8*60*60
export const cabinetMode=()=>process.env.CABINET_MODE === 'amocrm' ? 'amocrm' as const : 'demo' as const
export function limit(db:Store,key:string,max:number,windowMs:number) { const now=Date.now(); const previous=db.attempts[key]; const next=previous && previous.until>now ? previous : {count:0,until:now+windowMs}; next.count++; db.attempts[key]=next; return next.count<=max }

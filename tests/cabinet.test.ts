import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { demoConstruction } from '../src/lib/cabinet/demo'
import { normalizePhone, parseConstruction } from '../src/lib/cabinet/types'
import { addNote, CLIENT_MARKER, linkedContact, publishedData, readConstruction, REPORT_MARKER, safeMediaUrl, TEAM_MARKER, validateReport } from '../src/lib/cabinet/amocrm'
import { hashPassword, limit, tokenDigest, transaction, verifyPassword } from '../src/lib/cabinet/store'

test('phone normalization and report validation reject malformed values',()=>{
  assert.equal(normalizePhone('8 (900) 000-00-00'),'79000000000')
  assert.equal(normalizePhone('123'),'')
  assert.throws(()=>parseConstruction({...demoConstruction,progress:101}))
  assert.throws(()=>parseConstruction({...demoConstruction,stages:[]}))
  assert.deepEqual(parseConstruction(demoConstruction).messages,[])
})

test('password hashing uses salt; wrong passwords and token digests cannot authenticate',()=>{
  const first=hashPassword('test-password'),second=hashPassword('test-password')
  assert.notEqual(first,second)
  assert.equal(verifyPassword('test-password',first),true)
  assert.equal(verifyPassword('wrong',first),false)
  assert.notEqual(tokenDigest('token'),'token')
})

test('CRM exposes only explicit publications, filters internal notes and rejects unsafe media',()=>{
  process.env.CABINET_MEDIA_HOSTS='media.example.com'
  const report={...demoConstruction,media:[{...demoConstruction.media[0],src:'https://media.example.com/photo.jpg'}]}
  const note=(id:number,text:string,note_type='common')=>({id,created_at:1700000000+id,note_type,params:{text}})
  const result=publishedData([
    note(1,'Private: costs and subcontractors'),
    note(2,REPORT_MARKER+JSON.stringify({...report,progress:20})),
    note(3,TEAM_MARKER+'Фото добавлены'),
    note(4,CLIENT_MARKER+JSON.stringify({text:'Спасибо'})),
    note(5,REPORT_MARKER+JSON.stringify(report)),
    note(6,TEAM_MARKER+'Internal service note','service_message'),
    note(7,CLIENT_MARKER+'broken-json'),
  ])
  assert.equal(result.progress,58)
  assert.deepEqual(result.messages.map(m=>m.text),['Фото добавлены','Спасибо'])
  assert.equal(JSON.stringify(result).includes('Private'),false)
  assert.throws(()=>publishedData([note(1,'No public report')]))
  for(const url of ['javascript:alert(1)','http://media.example.com/x','https://media.example.com.evil.test/x','https://user:pass@media.example.com/x','/private/photo.jpg']) assert.equal(safeMediaUrl(url),false,url)
  assert.equal(safeMediaUrl('https://media.example.com/photo.jpg?signature=abc'),true)
  assert.throws(()=>validateReport(demoConstruction))
  delete process.env.CABINET_MEDIA_HOSTS
})

test('CRM adapter verifies deal ownership, paginates and requires write confirmation',async()=>{
  const original=globalThis.fetch
  process.env.AMO_DOMAIN='test.amocrm.ru';process.env.AMO_TOKEN='test-token'
  const calls:string[]=[]
  const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})
  globalThis.fetch=async(input,init)=>{
    const url=String(input);calls.push(url)
    assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer test-token')
    if(url.includes('/leads/42?'))return reply({_embedded:{contacts:[{id:8}]}})
    if(url.endsWith('/contacts/8'))return reply({name:'Client',custom_fields_values:[{field_code:'PHONE',values:[{value:'+7 (900) 111-22-33'}]}]})
    if(init?.method==='POST')return reply({_embedded:{notes:[{id:99,created_at:1700000000}]}})
    if(url.includes('page=1'))return reply({_embedded:{notes:[{id:1,created_at:1700000000,note_type:'common',params:{text:'private'}}]},_links:{next:{href:'https://untrusted.invalid'}}})
    if(url.includes('page=2'))return reply({_embedded:{notes:[{id:2,created_at:1700000001,note_type:'common',params:{text:REPORT_MARKER+JSON.stringify({...demoConstruction,media:[]})}}]}})
    throw new Error('Unexpected URL '+url)
  }
  try {
    assert.deepEqual((await linkedContact(42,8)).phones,['79001112233'])
    await assert.rejects(linkedContact(42,9),/не связан/)
    const data=await readConstruction(42,8)
    assert.equal(data.project,'Сосновка')
    assert.equal(calls.some(url=>url.includes('untrusted.invalid')),false)
    assert.equal((await addNote(42,'test')).id,99)
    globalThis.fetch=async()=>reply({})
    await assert.rejects(addNote(42,'test'),/не подтвердила/)
    globalThis.fetch=async()=>reply({error:'temporary'},503)
    await assert.rejects(addNote(42,'test'),/HTTP 503/)
  } finally {globalThis.fetch=original;delete process.env.AMO_DOMAIN;delete process.env.AMO_TOKEN}
})

test('session store serializes concurrent writes, persists limits and prunes expired sessions',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'derevyaga-cabinet-test-'))
  process.env.CABINET_DATA_DIR=directory
  try {
    await Promise.all(Array.from({length:20},(_,i)=>transaction(db=>{db.sessions[String(i)]={accountId:'test',expires:Date.now()+100000,messages:[]}})))
    assert.equal(await transaction(db=>Object.keys(db.sessions).length),20)
    assert.equal(await transaction(db=>limit(db,'test',1,100000)),true)
    assert.equal(await transaction(db=>limit(db,'test',1,100000)),false)
    await transaction(db=>{db.sessions.expired={accountId:'test',expires:0,messages:[]}})
    assert.equal(await transaction(db=>db.sessions.expired),undefined)
    assert.equal(JSON.parse(await readFile(path.join(directory,'store.json'),'utf8')).attempts.test.count,2)
  } finally {delete process.env.CABINET_DATA_DIR;await rm(directory,{recursive:true,force:true})}
})

import test from 'node:test'
import assert from 'node:assert/strict'

const origin=process.env.CABINET_TEST_ORIGIN || 'http://127.0.0.1:3000'
const headers={'Content-Type':'application/json',Origin:origin}
const login=()=>fetch(origin+'/api/cabinet/auth',{method:'POST',headers,body:JSON.stringify({phone:'+7 (900) 000-00-00',password:'Dom2026!'})})

test('demo HTTP: auth, CSRF, private data, session isolation, messages and logout',async()=>{
  assert.equal((await fetch(origin+'/api/cabinet')).status,401)
  assert.equal((await fetch(origin+'/api/cabinet/messages',{method:'POST',headers,body:'{"text":"test"}'})).status,401)
  assert.equal((await fetch(origin+'/api/cabinet/auth',{method:'POST',headers:{...headers,Origin:'https://other.invalid'},body:'{}'})).status,403)
  assert.equal((await fetch(origin+'/api/internal/amocrm/cabinet',{method:'POST',headers,body:'{}'})).status,401)
  const invalid=await fetch(origin+'/api/cabinet/auth',{method:'POST',headers,body:JSON.stringify({phone:'+7 (900) 000-00-00',password:'wrong'})})
  assert.equal(invalid.status,401)
  const a=await login(),b=await login()
  assert.equal(a.status,200);assert.equal(b.status,200)
  const cookieA=a.headers.get('set-cookie')!,cookieB=b.headers.get('set-cookie')!
  assert.match(cookieA,/HttpOnly/i);assert.match(cookieA,/SameSite=strict/i)
  const ha={...headers,Cookie:cookieA.split(';')[0]},hb={...headers,Cookie:cookieB.split(';')[0]}
  const initial=await fetch(origin+'/api/cabinet',{headers:ha})
  assert.match(initial.headers.get('cache-control')!,/no-store/)
  const data=await initial.json();assert.equal(data.mode,'demo');assert.equal(data.passwordHash,undefined)
  assert.equal((await fetch(origin+'/api/cabinet/messages',{method:'POST',headers:ha,body:JSON.stringify({text:' '})})).status,400)
  const text='HTTP session isolation test '+Date.now()
  const sent=await fetch(origin+'/api/cabinet/messages',{method:'POST',headers:ha,body:JSON.stringify({text,leadId:999})})
  assert.equal(sent.status,200);assert.equal((await sent.json()).demo,true)
  const own=await(await fetch(origin+'/api/cabinet',{headers:ha})).json()
  const other=await(await fetch(origin+'/api/cabinet',{headers:hb})).json()
  assert.equal(own.messages.some((m:{text:string})=>m.text===text),true)
  assert.equal(other.messages.some((m:{text:string})=>m.text===text),false)
  for(const h of [ha,hb])assert.equal((await fetch(origin+'/api/cabinet/auth',{method:'DELETE',headers:h})).status,200)
  assert.equal((await fetch(origin+'/api/cabinet',{headers:ha})).status,401)
  const video=await fetch(origin+'/cabinet/demo-report.webm',{headers:{Range:'bytes=0-100'}})
  assert.ok(video.status===200 || video.status===206)
  assert.match(video.headers.get('content-type')!,/video\/webm/)
})

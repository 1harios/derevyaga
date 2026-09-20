// Local UI fixture: all writes are intercepted, never forwarded to the site/CRM.
// node scripts/preview-promotions-mock.mjs -> http://127.0.0.1:3001/promotions
import http from 'node:http'
import net from 'node:net'

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/lead') {
      let body = ''
      for await (const chunk of req) body += chunk
      const payload = JSON.parse(body)
      const failed = payload.formType === 'promotion-planning' || payload.projectSlug === 'toksovo-78'
      console.log(JSON.stringify({ formType: payload.formType, projectSlug: payload.projectSlug, area: payload.area, scenario: failed ? 'failure' : 'success' }))
      // Long enough to inspect the disabled submit state in the browser.
      setTimeout(() => {
        res.writeHead(failed ? 503 : 200, { 'content-type': 'application/json' })
        res.end(JSON.stringify(failed ? { error: 'Тест: сервис временно недоступен.' } : { leadId: 'local-mock-only' }))
      }, 2500)
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405); res.end('Fixture blocks all other writes'); return
    }
    const upstream = await fetch(new URL(req.url, 'http://127.0.0.1:3000'), { redirect: 'manual' })
    const headers = Object.fromEntries(upstream.headers)
    delete headers['content-encoding']
    delete headers['content-length']
    res.writeHead(upstream.status, headers)
    res.end(Buffer.from(await upstream.arrayBuffer()))
  } catch {
    res.writeHead(502); res.end('Local fixture: upstream unavailable')
  }
})
// Forward only the local development websocket so Next does not reload forms in a loop.
server.on('upgrade', (req, socket, head) => {
  if (!req.url.startsWith('/_next/')) { socket.destroy(); return }
  const upstream = net.connect(3000, '127.0.0.1', () => {
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${req.rawHeaders.reduce((lines, value, index, all) => index % 2 === 0 ? [...lines, `${value}: ${all[index + 1]}`] : lines, []).join('\r\n')}\r\n\r\n`)
    if (head.length) upstream.write(head)
    upstream.pipe(socket); socket.pipe(upstream)
  })
  upstream.on('error', () => socket.destroy())
  socket.on('error', () => upstream.destroy())
})
server.listen(3001, '127.0.0.1', () => console.log('Promotion fixture on http://127.0.0.1:3001'))

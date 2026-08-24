/**
 * Скриншоты ВСЕХ страниц статического экспорта: полная высота на десктопе
 * и мобильном. Главная дополнительно снимается на пяти контрольных
 * разрешениях — как в scripts/shots.mjs.
 *
 * Запуск: node scripts/shots-all.mjs [порт]
 * Перед запуском должен быть собран ./out (scripts/build-preview.sh).
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'out')
const SHOTS = join(ROOT, 'shots')
const PORT = Number(process.argv[2] ?? 4174)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
}

const fileAt = (path) => {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0])
  let filePath = join(OUT, normalize(url))
  if (url.endsWith('/')) filePath = join(filePath, 'index.html')
  // Маршрут может быть и файлом «route.html», и папкой «route/» с детьми:
  // сначала пробуем сам путь, затем «.html», затем «index.html» внутри папки
  if (!fileAt(filePath)) {
    if (fileAt(filePath + '.html')) filePath += '.html'
    else if (fileAt(join(filePath, 'index.html'))) filePath = join(filePath, 'index.html')
  }
  try {
    const body = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
})

await new Promise((resolve) => server.listen(PORT, resolve))
await mkdir(SHOTS, { recursive: true })

/** Все страницы: имя файла ← маршрут */
const pages = [
  ['home', '/'],
  ['projects', '/projects'],
  ['project-ladoga', '/projects/ladoga-132'],
  ['project-toksovo', '/projects/toksovo-78'],
  ['complectations', '/complectations'],
  ['calculator', '/calculator'],
  ['prices', '/prices'],
  ['technology', '/technology'],
  ['objects', '/objects'],
  ['reviews', '/reviews'],
  ['about', '/about'],
  ['guarantee', '/guarantee'],
  ['mortgage', '/mortgage'],
  ['faq', '/faq'],
  ['blog', '/blog'],
  ['blog-article', '/blog/kak-chitat-smetu'],
  ['contacts', '/contacts'],
  ['vacancies', '/vacancies'],
  ['city-vsevolozhsk', '/karkasnye-doma/vsevolozhsk'],
  ['city-priozersk', '/karkasnye-doma/priozersk'],
  ['lk', '/lk'],
  ['legal-privacy', '/legal/privacy'],
  ['not-found', '/_not-found'],
]

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'mobile-390', width: 390, height: 844 },
]

/** Главная — ещё и на промежуточных разрешениях */
const homeExtraViewports = [
  { name: 'laptop-1024', width: 1024, height: 800 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-360', width: 360, height: 780 },
]

const browser = await chromium.launch()
const messages = []

async function shoot(pageName, route, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    window.localStorage.setItem('derevyaga.cookie-consent', 'necessary')
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') messages.push(`[${pageName} ${viewport.name}] ${msg.text()}`)
  })
  page.on('pageerror', (error) => messages.push(`[${pageName} ${viewport.name}] ${error.message}`))

  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      // На html стоит scroll-behavior: smooth — прыгаем мгновенно,
      // иначе прокрутка не успевает за циклом и reveal-анимации не срабатывают
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((resolve) => setTimeout(resolve, 90))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(500)

  await page.screenshot({ path: join(SHOTS, `${pageName}--${viewport.name}.png`), fullPage: true })
  await context.close()
}

for (const [pageName, route] of pages) {
  for (const viewport of viewports) {
    await shoot(pageName, route, viewport)
  }
}
for (const viewport of homeExtraViewports) {
  await shoot('home', '/', viewport)
}

await browser.close()
server.close()

if (messages.length) {
  console.log('Ошибки в консоли:')
  for (const message of [...new Set(messages)]) console.log(' -', message)
} else {
  console.log('Ошибок в консоли нет')
}
console.log(`Готово: ${pages.length * viewports.length + homeExtraViewports.length} скриншотов в ./shots`)

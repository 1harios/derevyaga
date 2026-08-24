/**
 * Скриншоты статического экспорта на контрольных разрешениях.
 * Запуск: node scripts/shots.mjs [порт]
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
const PORT = Number(process.argv[2] ?? 4173)

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

const browser = await chromium.launch()
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'laptop-1024', width: 1024, height: 800 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 780 },
]

const messages = []

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  // Баннер cookie прячем заранее, иначе он закрывает вёрстку на снимках
  await page.addInitScript(() => {
    window.localStorage.setItem('derevyaga.cookie-consent', 'necessary')
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') messages.push(`[${viewport.name}] ${msg.text()}`)
  })
  page.on('pageerror', (error) => messages.push(`[${viewport.name}] ${error.message}`))

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  // Прокручиваем страницу целиком, чтобы подтянулись отложенные изображения,
  // иначе на снимке они окажутся пустыми
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      // На html стоит scroll-behavior: smooth — прыгаем мгновенно,
      // иначе прокрутка не успевает за циклом и reveal-анимации не срабатывают
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(700)

  await page.screenshot({ path: join(SHOTS, `${viewport.name}-full.png`), fullPage: true })
  await page.screenshot({ path: join(SHOTS, `${viewport.name}-top.png`) })

  await context.close()
}

await browser.close()
server.close()

if (messages.length) {
  console.log('Ошибки в консоли:')
  for (const message of messages) console.log(' -', message)
} else {
  console.log('Ошибок в консоли нет')
}
console.log('Скриншоты в ./shots')

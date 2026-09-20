import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
const output = 'reports/constructor-approved-integration'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
async function ready() { await page.locator('.photo-house[aria-busy="false"]').waitFor({ timeout: 30000 }) }
async function tab(name) { await page.getByRole('button', { name, exact: true }).click() }
async function choice(name) { await page.locator('.constructor-choices').getByRole('button', { name }).click(); await ready() }
try {
  await page.goto('http://127.0.0.1:3000/calculator')
  await ready()
  const decline = page.getByRole('button', { name: 'Отказаться', exact: true })
  await decline.waitFor({ state: 'visible', timeout: 10000 }).then(() => decline.click()).catch(() => {})
  const rows = []
  for (const size of ['6×6', '6×8', '6×10', '8×8', '8×10']) {
    await tab('Размер дома'); await choice(new RegExp('^' + size + ' м'))
    await tab('Фасад'); await choice(/Брус с покраской/)
    await tab('Фундамент'); await choice(/Железобетонные/)
    await tab('Кровля'); await choice(/Мягкая черепица/)
    const layers = await page.locator('.photo-house image').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))
    if (!layers.every(src => src.includes('/' + size.replace('×','x') + '/'))) throw Error('Wrong size: ' + size)
    if (!layers.some(src => src.endsWith('roof-shingles.webp'))) throw Error('Roof lost')
    await page.locator('.photo-house').screenshot({ path: `${output}/${size.replace('×','x')}-composite.png` })
    await tab('Терраса'); await choice(/Без террасы/)
    await tab('Фасад')
    for (const [label, material] of [[/Брус с покраской/, 'painted'], [/Планкен/, 'planken']]) {
      await choice(label)
      const image = page.locator('.photo-house-composite')
      if (await image.getAttribute('data-terrace') !== 'false') throw Error('Facade restored terrace')
      if (!(await page.locator('[data-layer="base"]').getAttribute('href')).endsWith(`/facade-${material}-entry.webp`)) throw Error('Incorrect entry facade')
      if (!(await page.locator('[data-layer="roof"]').getAttribute('href')).endsWith('/roof-shingles.webp')) throw Error('Facade reset roof')
      if (!(await page.locator('[data-layer="foundation"]').getAttribute('href')).endsWith('/foundation-concrete.webp')) throw Error('Facade reset foundation')
      await page.locator('.photo-house').screenshot({ path: `${output}/${size.replace('×','x')}-${material}-entry.png` })
    }
    await tab('Терраса'); await choice(/С террасой/)
    rows.push({ size, layers })
  }
  await tab('Утепление')
  for (const thickness of ['100','150','200']) {
    await choice(new RegExp(thickness + ' мм'))
    const image = page.locator('.constructor-choice[aria-pressed="true"] .constructor-choice-preview img')
    await image.evaluate(img => img.decode())
    if (!(await image.getAttribute('src')).includes('insulation-' + thickness)) throw Error('Incorrect cutaway')
  }
  const widths = []
  for (const width of [360,390,768,1280]) {
    await page.setViewportSize({ width, height: 1000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    if (overflow) throw Error('Overflow: ' + width)
    widths.push({ width, overflow })
    if (width === 390) await page.locator('#constructor').screenshot({ path: `${output}/mobile-insulation.png` })
  }
  await tab('Размер дома'); await choice(/Свой размер/)
  if (!(await page.locator('.photo-house-title').innerText()).includes('Пример 6×6 м')) throw Error('Custom size must clearly identify the example')
  // A temporary asset failure must leave the last scene visible and allow recovery.
  let failOnce = true
  await page.route('**/6x6/roof-metal.webp', async route => {
    if (failOnce) { failOnce = false; await route.abort() } else await route.continue()
  })
  await tab('Кровля')
  await page.locator('.constructor-choices').getByRole('button', { name: /Металлочерепица/ }).click()
  await page.getByRole('button', { name: 'Повторить загрузку изображения' }).click()
  await ready()
  if (!(await page.locator('[data-layer="roof"]').getAttribute('href')).endsWith('/roof-metal.webp')) throw Error('Retry did not recover')
  await fs.writeFile(`${output}/checks.json`, JSON.stringify({ rows, widths, cutaways: 3, entryFacades: 10, custom: 'passed', retry: 'passed', errors }, null, 2))
  if (errors.length) throw Error(errors.join('\n'))
  console.log(JSON.stringify({ sizes: rows.length, widths, cutaways: 3, errors }))
} finally { await browser.close() }

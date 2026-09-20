import { chromium } from 'playwright-core'
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/constructor/approved-variants-v1')
const entries = JSON.parse(await fs.readFile(path.join(root, 'catalog.json'), 'utf8'))
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.goto('http://127.0.0.1:3000/constructor/approved-variants-v1/index.html')
await page.waitForFunction(() => document.querySelector('#selected').complete && document.querySelector('#selected').naturalWidth > 0)
for (const entry of entries) {
  await page.selectOption('#size', entry.size)
  await page.selectOption('#variant', entry.kind)
  await page.waitForFunction(({ png, label }) => document.querySelector('#download').getAttribute('href') === png && document.querySelector('#status').textContent.includes(label), entry)
  if (!await page.locator('#selected').evaluate(image => image.complete && image.naturalWidth > 0)) throw new Error(`Failed image: ${entry.png}`)
}
const widths = []
await page.selectOption('#size', '8x10')
await page.selectOption('#variant', 'facade-painted')
await page.waitForFunction(() => document.querySelector('#download').getAttribute('href') === '8x10/facade-painted.png')
for (const width of [360, 390, 768, 1280]) {
  await page.setViewportSize({ width, height: 900 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  if (overflow) throw new Error(`Overflow at ${width}`)
  widths.push({ width, overflow })
}
await page.locator('#toggle').click()
if (await page.locator('#selected').evaluate(image => image.style.opacity) !== '0') throw new Error('Original toggle failed')
await page.locator('#toggle').click()
if (await page.locator('#selected').evaluate(image => image.style.opacity) !== '1') throw new Error('Variant toggle failed')
await page.locator('#opacity').fill('50')
if (await page.locator('#selected').evaluate(image => image.style.opacity) !== '0.5') throw new Error('Comparison slider failed')
await page.locator('#opacity').fill('100')
const downloadPromise = page.waitForEvent('download')
await page.locator('#download').click()
const download = await downloadPromise
if (!download.suggestedFilename().endsWith('.png')) throw new Error('PNG download failed')
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: path.join(root, 'review-desktop.png') })
await page.setViewportSize({ width: 390, height: 900 })
await page.screenshot({ path: path.join(root, 'review-mobile.png') })
await page.selectOption('#size', 'details')
await page.waitForFunction(() => document.querySelector('#base').hidden)
if (await page.locator('#compare-label').isVisible()) throw new Error('Comparison should be hidden for wall details')
await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
const report = { imagesChecked: entries.length, widths, comparison: 'passed', download: 'passed', pageErrors: errors }
await fs.writeFile(path.join(root, 'review-checks.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report))

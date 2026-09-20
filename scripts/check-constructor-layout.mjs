import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const out = 'reports/constructor-layout'
await fs.mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const results = []
const steps = ['Размер дома', 'Фундамент', 'Утепление', 'Кровля', 'Фасад', 'Терраса']
async function selectStep(name) {
  if (await page.locator('.constructor-tabs').isVisible()) {
    await page.locator('.constructor-tabs').getByRole('button', { name, exact: true }).click()
    return
  }
  const target = steps.indexOf(name)
  let current = steps.indexOf(await page.locator('.constructor-wizard-body h2').innerText())
  while (current !== target) {
    await page.locator('.constructor-wizard-nav').getByRole('button', { name: current < target ? 'Далее' : 'Назад', exact: true }).click()
    current += current < target ? 1 : -1
  }
}
try {
  await page.goto('http://127.0.0.1:3000/calculator')
  await page.locator('.photo-house[aria-busy="false"]').waitFor()
  await page.getByRole('button', { name: 'Отказаться', exact: true }).click({ timeout: 3000 }).catch(() => {})
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1100 })
    assert.equal(await page.locator('.constructor-tabs').isVisible(), width > 900)
    assert.equal(await page.locator('.photo-house-tools').isVisible(), width > 900)
    const positions = []
    for (const name of steps) {
      await selectStep(name)
      await page.locator('.constructor-choice-preview img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())))
      const geometry = await page.evaluate(() => {
        const box = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height } }
        const panel = document.querySelector('.constructor-options')
        return { panel: box('.constructor-options'), nav: box('.constructor-wizard-nav'), total: box('.constructor-total'), choices: box('.constructor-choices'), studio: box('#constructor'), hero: box('.constructor-page-heading .panel'), scene: box('.constructor-scene-slot'), overflow: document.documentElement.scrollWidth > innerWidth, panelOverflow: panel.scrollHeight > panel.clientHeight + 1 }
      })
      assert.equal(geometry.overflow, false, `Horizontal overflow at ${width}: ${name}`)
      assert.equal(geometry.panelOverflow, false, `Panel overflow at ${width}: ${name}`)
      assert.ok(geometry.choices.y + geometry.choices.height <= geometry.nav.y, `Choices overlap navigation at ${width}: ${name}`)
      assert.ok(Math.abs(geometry.studio.x - geometry.hero.x) < 1 && Math.abs(geometry.studio.width - geometry.hero.width) < 1, `Hero alignment at ${width}`)
      if (width > 900) {
        assert.ok(Math.abs(geometry.panel.x + geometry.panel.width - geometry.scene.x) < 1, 'Gap next to house')
        assert.ok(Math.abs(geometry.studio.x + geometry.studio.width - geometry.scene.x - geometry.scene.width) < 1, 'Photo must reach the right edge')
      }
      positions.push({ name, ...geometry })
      if (name === 'Утепление' || name === 'Кровля') await page.locator('#constructor').screenshot({ path: `${out}/${width}-${name === 'Кровля' ? 'roof' : 'insulation'}.png` })
    }
    for (const item of positions) {
      assert.ok(Math.abs(item.total.y - positions[0].total.y) < 1, `Price moved at ${width}`)
      assert.ok(Math.abs(item.nav.y - positions[0].nav.y) < 1, `Navigation moved at ${width}`)
    }
    await page.locator('.constructor-delivery-extra summary').click()
    const totalAfter = await page.locator('.constructor-total').evaluate(e => e.getBoundingClientRect().y + scrollY)
    assert.ok(Math.abs(totalAfter - positions[0].total.y) < 1, 'Delivery shifted price')
    await page.locator('.constructor-delivery-extra summary').click()
    results.push({ width, steps: positions.length, stable: true })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await selectStep('Размер дома')
  for (const size of ['6×6', '6×8', '6×10', '8×8', '8×10']) {
    await page.locator('.constructor-choices').getByRole('button', { name: new RegExp('^' + size + ' м') }).click()
    await page.locator('.photo-house[aria-busy="false"]').waitFor()
    await page.locator('.constructor-scene-slot').screenshot({ path: `${out}/mobile-${size.replace('×','x')}.png` })
  }
  await page.locator('.constructor-choices').getByRole('button', { name: /Свой размер/ }).click()
  await page.locator('.photo-house[aria-busy="false"]').waitFor()
  assert.ok(await page.locator('.photo-house-title').getByText('Пример 6×6 м · ваши размеры согласуем').isVisible())
  await page.locator('.constructor-wizard-nav').scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => scrollY)
  await page.locator('.constructor-wizard-nav').getByRole('button', { name: 'Далее' }).click()
  assert.ok(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) < 1, 'Next step must not scroll the page')
  assert.equal(await page.locator('.constructor-wizard-body h2').innerText(), 'Фундамент')
  assert.equal(await page.locator('.constructor-page-heading .lead strong').first().evaluate(e => getComputedStyle(e).fontWeight), '500')
  assert.equal(await page.locator('.photo-house-title').evaluate(e => getComputedStyle(e).color), 'rgb(99, 106, 100)')
  await selectStep('Размер дома')
  await page.locator('.constructor-choices').getByRole('button', { name: /^6×8 м/ }).click()
  await page.locator('.photo-house[aria-busy="false"]').waitFor()
  const typography = await page.locator('.photo-house-heading').evaluate(e => ({
    name: getComputedStyle(e.querySelector('strong')).fontSize,
    weight: getComputedStyle(e.querySelector('strong')).fontWeight,
    area: getComputedStyle(e.querySelector('small')).fontSize,
  }))
  assert.ok(Number(typography.weight) >= 600 && parseFloat(typography.area) < parseFloat(typography.name))
  assert.equal(await page.locator('.photo-house-composite').evaluate(e => getComputedStyle(e).animationName), 'constructor-photo-change')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await page.locator('.photo-house-composite').evaluate(e => getComputedStyle(e).animationName), 'none')
  assert.deepEqual(errors, [])
  await fs.writeFile(`${out}/checks.json`, JSON.stringify({ results, errors }, null, 2))
  console.log(JSON.stringify({ results, errors }))
} finally { await browser.close() }

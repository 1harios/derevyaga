import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve('public/constructor/approved-variants-v1')
const referenceRoot = path.resolve('public/constructor/approval-reference')
const bases = { '6x6': 'house-6x6-front-gable.png', '6x8': 'house-6x8.png', '6x10': 'house-6x10.png', '8x8': 'house-8x8.png', '8x10': 'house-8x10.png' }
for (const [size, file] of Object.entries(bases)) {
  await fs.mkdir(path.join(root, size), { recursive: true })
  await fs.copyFile(path.join(referenceRoot, file), path.join(root, size, 'base.png'))
}
await fs.copyFile(path.join(referenceRoot, 'house-6x6-foundation-concrete.png'), path.join(root, '6x6/foundation-concrete.png'))
await fs.copyFile(path.join(referenceRoot, 'house-6x6-foundation-concrete.json'), path.join(root, '6x6/foundation-concrete.json'))

const labels = { base: 'Исходный дом', 'foundation-concrete': 'Железобетонные сваи', 'roof-ondulin': 'Ондулин', 'roof-metal': 'Металлочерепица', 'roof-shingles': 'Мягкая черепица', 'facade-painted': 'Фасад: мох', 'facade-planken': 'Вертикальный планкен', 'terrace-no': 'Без террасы', 'insulation-100': 'Утепление 100 мм', 'insulation-150': 'Утепление 150 мм', 'insulation-200': 'Утепление 200 мм' }
const entries = []
for (const size of [...Object.keys(bases), 'details']) {
  for (const filename of (await fs.readdir(path.join(root, size))).filter(file => file.endsWith('.png')).sort()) {
    const kind = filename.slice(0, -4)
    const source = path.join(root, size, filename)
    const meta = await sharp(source).metadata()
    if (size !== 'details' && (meta.width !== 1536 || meta.height !== 1024)) throw new Error(`Unexpected canvas: ${size}/${filename}`)
    await sharp(source).webp({ quality: 94 }).toFile(path.join(root, size, `${kind}.webp`))
    entries.push({ size, kind, label: labels[kind] || kind, png: `${size}/${filename}`, webp: `${size}/${kind}.webp`, width: meta.width, height: meta.height })
  }
}
const expected = 43
if (entries.length !== expected) throw new Error(`Expected ${expected} assets including bases; found ${entries.length}`)
await fs.writeFile(path.join(root, 'catalog.json'), JSON.stringify(entries, null, 2))

// Read-only registration audit of wall regions unchanged by roof/foundation edits.
const alignment = []
for (const size of Object.keys(bases)) {
  const base = await sharp(path.join(root, size, 'base.png')).removeAlpha().greyscale().raw().toBuffer()
  for (const item of entries.filter(entry => entry.size === size && /^(roof-|foundation-)/.test(entry.kind))) {
    const variant = await sharp(path.join(root, item.png)).removeAlpha().greyscale().raw().toBuffer()
    let best = { meanAbsoluteDifference: Infinity, dx: 0, dy: 0 }
    for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
      let difference = 0, count = 0
      for (let y = 470; y < 660; y += 5) for (let x = 330; x < 1250; x += 5) {
        difference += Math.abs(base[y * 1536 + x] - variant[(y + dy) * 1536 + x + dx]); count++
      }
      const meanAbsoluteDifference = difference / count
      if (meanAbsoluteDifference < best.meanAbsoluteDifference) best = { meanAbsoluteDifference, dx, dy }
    }
    alignment.push({ size, kind: item.kind, ...best })
  }
}
await fs.writeFile(path.join(root, 'alignment-audit.json'), JSON.stringify({ method: 'Grayscale matching of unchanged wall region; shifts -8..8 pixels. Not a pixel-perfect compositing guarantee.', results: alignment }, null, 2))
console.log(JSON.stringify({ assets: entries.length, alignment }, null, 2))

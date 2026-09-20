import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = 'public/constructor/layers-v3'
const manifest = JSON.parse(await fs.readFile(`${root}/generation.json`, 'utf8'))
for (const item of manifest) {
  if (!item.path) throw new Error(`Missing generated file: ${item.id || item.kind}`)
  const name = item.id === 'wall-detail' ? 'wall-detail' : item.kind ? `${item.size}/${item.kind}` : `${item.id}/base`
  const output = `${root}/${name}.webp`
  await fs.mkdir(path.dirname(output), { recursive: true })
  await sharp(item.path).webp({ quality: 94 }).toFile(output)
}
console.log(`Prepared ${manifest.length} individual images`)

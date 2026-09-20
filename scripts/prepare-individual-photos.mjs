import sharp from 'sharp'
import fs from 'node:fs'
const directory = 'public/constructor/individual'
const data = JSON.parse(fs.readFileSync(`${directory}/generation.json`, 'utf8'))
for (const image of data.images) {
  fs.copyFileSync(image.path, `${directory}/${image.id}.png`)
  await sharp(image.path).webp({ quality: 95 }).toFile(`${directory}/${image.id}.webp`)
}
for (const id of ['size-6x6', 'facade-timber', 'terrace-yes']) {
  await sharp(`${directory}/approved.png`).webp({ quality: 95 }).toFile(`${directory}/${id}.webp`)
}
console.log(`Saved ${data.images.length + 3} individual scenes`)

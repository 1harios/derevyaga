/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node asset preparation script */
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const root = 'C:/Users/kkkar/.codex/generated_images/01a07bf9-6f28-7533-9d96-2e1e57d2b17d';
const sheets = { ondulin: 'exec-b641861f-b98b-484a-90ef-42be3c34faae.png', metal: 'exec-2012720c-c7cf-4558-816e-7d91976eec33.png', shingles: 'exec-b8ec7a96-cf44-49eb-bd0f-794e85752f19.png' };
const output = 'public/constructor/photo';
(async () => {
  for (const [roof, file] of Object.entries(sheets)) {
    const source = path.join(root, file);
    fs.copyFileSync(source, path.join(output, roof + '-sheet.png'));
    const meta = await sharp(source).metadata();
    const width = Math.floor(meta.width / 2), height = Math.floor(meta.height / 3);
    for (const [row, facade] of ['timber', 'painted', 'planken'].entries()) {
      for (const [col, terrace] of ['terrace', 'entry'].entries()) {
        await sharp(source).extract({ left: col * width, top: row * height, width, height }).webp({ quality: 92 }).toFile(path.join(output, `${roof}-${facade}-${terrace}.webp`));
      }
    }
    console.log(roof, meta.width, meta.height);
  }
})();


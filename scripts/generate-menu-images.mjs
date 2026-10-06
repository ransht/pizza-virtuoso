// Builds the responsive menu images in public/images/menu/ from the *-menu.webp sources.
// Run after adding or replacing a source image: node scripts/generate-menu-images.mjs
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const nodeRequire = createRequire(import.meta.url);
const sharp = createRequire(nodeRequire.resolve('astro/package.json'))('sharp');
const sourceDir = 'public/images';
const outDir = join(sourceDir, 'menu');
const widths = [480, 800, 1122];
// Menu cards are always 4:3 with object-position "center 58%" (see .menu-item-media in global.css),
// so portrait sources are cropped to exactly the area the card shows.
const focusY = 0.58;

mkdirSync(outDir, { recursive: true });
for (const file of readdirSync(sourceDir).filter((name) => name.endsWith('-menu.webp'))) {
  const source = join(sourceDir, file);
  const { width, height } = await sharp(source).metadata();
  const cropHeight = Math.min(height, Math.round(width * 3 / 4));
  const top = Math.round((height - cropHeight) * focusY);
  for (const target of widths.filter((value) => value <= width)) {
    const output = join(outDir, file.replace('-menu.webp', `-${target}.webp`));
    await sharp(source).extract({ left: 0, top, width, height: cropHeight }).resize({ width: target }).webp({ quality: 80 }).toFile(output);
    console.log(`${output} ${Math.round(statSync(output).size / 1024)} KB`);
  }
}

// The supplier logo is displayed 132px wide; 264px covers 2x screens.
const logo = join(sourceDir, 'gad-logo-264.webp');
await sharp(join(sourceDir, 'gad-logo.png')).resize({ width: 264 }).webp({ quality: 88 }).toFile(logo);
console.log(`${logo} ${Math.round(statSync(logo).size / 1024)} KB`);

// Hero: phones get a portrait crop centred on the pizza (the hero is taller than wide there);
// wider screens get the landscape original in two widths.
const heroSource = join(sourceDir, 'hero-pizza.webp');
const heroDir = join(sourceDir, 'hero');
mkdirSync(heroDir, { recursive: true });
const hero = await sharp(heroSource).metadata();
const heroCropWidth = Math.round(hero.height * 3 / 4);
const heroOutputs = [
  [join(heroDir, 'hero-pizza-mobile.webp'), sharp(heroSource).extract({ left: Math.round((hero.width - heroCropWidth) * 0.77), top: 0, width: heroCropWidth, height: hero.height }).webp({ quality: 74 })],
  [join(heroDir, 'hero-pizza-1100.webp'), sharp(heroSource).resize({ width: 1100 }).webp({ quality: 76 })],
  [join(heroDir, 'hero-pizza-1672.webp'), sharp(heroSource).webp({ quality: 78 })],
];
for (const [output, pipeline] of heroOutputs) {
  await pipeline.toFile(output);
  console.log(`${output} ${Math.round(statSync(output).size / 1024)} KB`);
}

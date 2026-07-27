import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);
const sharp = nodeRequire('sharp');
const background = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#f6eedf"/>
    <path d="M720 0h480v630H590z" fill="#efc5c5"/>
    <circle cx="1090" cy="80" r="190" fill="none" stroke="#a7221c" stroke-opacity=".14"/>
  </svg>
`);

const pizza = await sharp('public/images/heart-pizza.png')
  .resize(570, 570, { fit: 'contain' })
  .png()
  .toBuffer();

await sharp(background)
  .composite([{ input: pizza, left: 55, top: 30 }])
  .jpeg({ quality: 90 })
  .toFile('public/images/og-love-campaign.jpg');

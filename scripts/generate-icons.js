import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcSvg = path.join(__dirname, '../src/assets/app_icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    console.log(`Reading SVG from: ${srcSvg}`);
    if (!fs.existsSync(srcSvg)) {
      throw new Error(`Source SVG not found at ${srcSvg}`);
    }

    const icon192Path = path.join(publicDir, 'icon-192.png');
    const icon512Path = path.join(publicDir, 'icon-512.png');

    console.log('Generating 192x192 PNG...');
    await sharp(srcSvg)
      .resize(192, 192)
      .png()
      .toFile(icon192Path);
    console.log(`Successfully generated: ${icon192Path}`);

    console.log('Generating 512x512 PNG...');
    await sharp(srcSvg)
      .resize(512, 512)
      .png()
      .toFile(icon512Path);
    console.log(`Successfully generated: ${icon512Path}`);

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating PWA icons:', error);
    process.exit(1);
  }
}

generateIcons();

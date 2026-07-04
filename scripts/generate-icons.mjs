// scripts/generate-icons.mjs
// Extracts the embedded PNG from the SVG and generates PWA icon sizes using sharp.
import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgPath = path.resolve(__dirname, '../src/assets/app_icon.svg');
const publicDir = path.resolve(__dirname, '../public');

const svgContent = readFileSync(svgPath, 'utf8');

// Extract the base64 PNG data embedded inside the SVG <image> tag
const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (!match) {
  console.error('Could not find embedded PNG in SVG. Falling back to SVG rasterization.');
  process.exit(1);
}

const base64Data = match[1];
const pngBuffer = Buffer.from(base64Data, 'base64');

async function generateIcons() {
  // 192×192
  await sharp(pngBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ icon-192.png generated');

  // 512×512
  await sharp(pngBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-512.png generated');
}

generateIcons().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});

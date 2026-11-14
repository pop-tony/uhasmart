const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Standard SVG (squircle with subtle shadow, transparent outside)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="varsmart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D4ED8" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#1e3a8a" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Squircle Base with smooth rounded corners -->
  <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#varsmart-grad)" filter="url(#shadow)" />
  <rect x="6" y="6" width="88" height="88" rx="24" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />

  <!-- Bag Handle / Arc -->
  <path d="M38 40 C38 27, 62 27, 62 40" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />

  <!-- Stylized Shopping Tote Bag -->
  <path d="M26 38 L74 38 C75.8 38 77.3 39.4 77.1 41.2 L73.2 73.2 C72.4 79 67.5 83.5 61.6 83.5 L38.4 83.5 C32.5 83.5 27.6 79 26.8 73.2 L22.9 41.2 C22.7 39.4 24.2 38 26 38 Z" fill="#FFFFFF" fill-opacity="0.18" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />

  <!-- Bold Central 'V' Monogram inside Bag (for VarsMart) -->
  <path d="M39 48 L50 69 L61 48" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Modern Dynamic Sparkle Star (Top-Right) -->
  <path d="M74 14 C74 21, 81 28, 88 28 C81 28, 74 35, 74 42 C74 35, 67 28, 60 28 C67 28, 74 21, 74 14 Z" fill="url(#spark-grad)" />
</svg>`;

// 2. Full-bleed SVG for Apple Touch Icon and Android Maskable Icon
const fullBleedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="varsmart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D4ED8" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <!-- Full bleed background: ensures iOS and Android maskable have zero black borders -->
  <rect width="100" height="100" fill="url(#varsmart-grad)" />

  <!-- Centered Bag Emblem nicely proportioned for safe zone -->
  <g transform="translate(50, 50) scale(0.82) translate(-50, -50)">
    <!-- Bag Handle / Arc -->
    <path d="M38 40 C38 27, 62 27, 62 40" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />

    <!-- Stylized Shopping Tote Bag -->
    <path d="M26 38 L74 38 C75.8 38 77.3 39.4 77.1 41.2 L73.2 73.2 C72.4 79 67.5 83.5 61.6 83.5 L38.4 83.5 C32.5 83.5 27.6 79 26.8 73.2 L22.9 41.2 C22.7 39.4 24.2 38 26 38 Z" fill="#FFFFFF" fill-opacity="0.22" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />

    <!-- Bold Central 'V' Monogram inside Bag (for VarsMart) -->
    <path d="M39 48 L50 69 L61 48" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Modern Dynamic Sparkle Star (Top-Right) -->
    <path d="M74 14 C74 21, 81 28, 88 28 C81 28, 74 35, 74 42 C74 35, 67 28, 60 28 C67 28, 74 21, 74 14 Z" fill="url(#spark-grad)" />
  </g>
</svg>`;

// Helper function to build a valid multi-image ICO file from PNG buffers
function createIco(images) {
  // images: Array<{ size: number, buffer: Buffer }>
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 (ico)
  header.writeUInt16LE(images.length, 4); // count

  const dirSize = 16 * images.length;
  let currentOffset = 6 + dirSize;

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // size of image data
    entry.writeUInt32LE(currentOffset, 12); // offset of image data
    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const appDir = path.join(root, 'src', 'app');

  console.log('Generating VarsMart app icons...');

  // 1. Render standard PNGs
  const png512 = await sharp(Buffer.from(standardSvg)).resize(512, 512).png().toBuffer();
  const png192 = await sharp(Buffer.from(standardSvg)).resize(192, 192).png().toBuffer();
  
  // 2. Render full-bleed PNGs for Apple touch and Android maskable
  const appleTouch180 = await sharp(Buffer.from(fullBleedSvg)).resize(180, 180).png().toBuffer();
  const maskable512 = await sharp(Buffer.from(fullBleedSvg)).resize(512, 512).png().toBuffer();

  // 3. Render favicons
  const fav48 = await sharp(Buffer.from(standardSvg)).resize(48, 48).png().toBuffer();
  const fav32 = await sharp(Buffer.from(standardSvg)).resize(32, 32).png().toBuffer();
  const fav16 = await sharp(Buffer.from(standardSvg)).resize(16, 16).png().toBuffer();
  const icoBuffer = createIco([
    { size: 48, buffer: fav48 },
    { size: 32, buffer: fav32 },
    { size: 16, buffer: fav16 },
  ]);

  // Write to public/
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), maskable512);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch180);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32);
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), fav16);

  // Write to src/app/ (Next.js App router conventions)
  fs.writeFileSync(path.join(appDir, 'icon.png'), png192);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleTouch180);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

  console.log('Successfully generated all icons!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(size) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);  // 8 bits per channel
  ihdr.writeUInt8(6, 9);  // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines (RGBA)
  const rowLen = 1 + size * 4;
  const rawData = Buffer.alloc(rowLen * size);

  const radius = size * 0.22;
  const center = size / 2;

  // Draw sleek Calculator Icon:
  // Rounded background (deep indigo/slate), top screen (slate-950), keypad grid with keys
  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter: 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded rect boundary
      const dx = Math.max(0, Math.abs(x - center) - (center - radius));
      const dy = Math.max(0, Math.abs(y - center) - (center - radius));
      const isOutside = Math.sqrt(dx * dx + dy * dy) > radius;

      if (isOutside) {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Default background: Indigo/Slate gradient
      let r = 37, g = 99, b = 235, a = 255; // #2563eb

      // Top display box
      if (x >= size * 0.18 && x <= size * 0.82 && y >= size * 0.16 && y <= size * 0.34) {
        r = 15; g = 23; b = 42; // dark display
      }
      // Top display subtle digital digits / line
      if (x >= size * 0.55 && x <= size * 0.78 && y >= size * 0.23 && y <= size * 0.27) {
        r = 56; g = 189; b = 248; // sky-400 indicator
      }

      // Keypad dots / buttons
      const inGridX = (x >= size * 0.18 && x <= size * 0.82);
      const inGridY = (y >= size * 0.42 && y <= size * 0.84);
      if (inGridX && inGridY) {
        // Check 3x3 key buttons
        const cellX = Math.floor((x - size * 0.18) / (size * 0.64 / 3));
        const cellY = Math.floor((y - size * 0.42) / (size * 0.42 / 3));

        const relX = (x - (size * 0.18 + cellX * (size * 0.64 / 3))) / (size * 0.64 / 3);
        const relY = (y - (size * 0.42 + cellY * (size * 0.42 / 3))) / (size * 0.42 / 3);

        if (relX >= 0.15 && relX <= 0.85 && relY >= 0.15 && relY <= 0.85) {
          if (cellX === 2 && cellY === 2) {
            // Equal key: accent orange/gold
            r = 245; g = 158; b = 11;
          } else if (cellX === 2) {
            // Operations: amber
            r = 217; g = 119; b = 6;
          } else {
            // White keys
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const pwa192 = generatePng(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('✓ Created pwa-192x192.png');

// Generate 512x512
const pwa512 = generatePng(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pwa192);
console.log('✓ Created pwa-512x512.png, maskable-icon-512x512.png, apple-touch-icon.png');

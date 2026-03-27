/**
 * Generate placeholder PNG icons for Tauri.
 * Run: node scripts/generate-icons.mjs
 *
 * Replace the source icon (public/app-icon.svg) with your brand icon,
 * then run `npx tauri icon public/app-icon.png` to regenerate all sizes.
 *
 * This script creates minimal valid PNGs as placeholders so the project
 * compiles before you have real icons.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { deflateSync } from "zlib";

const ICONS_DIR = join(process.cwd(), "src-tauri", "icons");
mkdirSync(ICONS_DIR, { recursive: true });

function createPng(width, height, r = 0, g = 113, b = 227) {
  // Build raw image data (RGBA, filter byte 0 per row)
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = 255;
    }
  }

  const compressed = deflateSync(raw);

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const combined = Buffer.concat([typeB, data]);
    const crc = crc32(combined);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, combined, crcB]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", iend),
  ]);
}

// CRC32 for PNG chunks
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const sizes = [
  { name: "32x32.png", w: 32, h: 32 },
  { name: "128x128.png", w: 128, h: 128 },
  { name: "128x128@2x.png", w: 256, h: 256 },
];

for (const { name, w, h } of sizes) {
  const png = createPng(w, h);
  writeFileSync(join(ICONS_DIR, name), png);
  console.log(`  Created ${name} (${w}x${h})`);
}

// For .icns and .ico, create symlinks/copies from the 256px PNG
// (Real builds should use `tauri icon` to generate proper .icns/.ico)
writeFileSync(join(ICONS_DIR, "icon.icns"), createPng(256, 256));
writeFileSync(join(ICONS_DIR, "icon.ico"), createPng(256, 256));
console.log("  Created icon.icns and icon.ico (placeholder PNGs)");

console.log("\nDone! For production icons, replace with:\n  npx tauri icon path/to/your-1024x1024-icon.png\n");

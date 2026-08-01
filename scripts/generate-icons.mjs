/**
 * Generate placeholder icons for Tauri.
 * Run: node scripts/generate-icons.mjs
 *
 * Writes a 1024x1024 source PNG to public/app-icon.png, then delegates to
 * `tauri icon` to produce the real platform icon set (.ico with the proper
 * multi-image ICO container, .icns, and the PNG sizes).
 *
 * Do NOT write PNG bytes straight to icon.ico: Windows RC.EXE rejects it with
 * "error RC2175: resource file ... is not in 3.00 format" and the build fails.
 *
 * To use your own artwork, replace public/app-icon.png (1024x1024) and run
 * `npx tauri icon public/app-icon.png`.
 */
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { deflateSync } from "zlib";
import { execFileSync } from "child_process";

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

// Write the 1024x1024 source that `tauri icon` derives every platform icon from.
const SOURCE = join(process.cwd(), "public", "app-icon.png");
mkdirSync(join(process.cwd(), "public"), { recursive: true });
writeFileSync(SOURCE, createPng(1024, 1024));
console.log("  Created public/app-icon.png (1024x1024 source)");

// Delegate to the Tauri CLI, which emits a real ICO container and ICNS.
try {
  execFileSync("npx", ["tauri", "icon", SOURCE, "--output", ICONS_DIR], {
    stdio: "inherit",
  });
  // tauri icon always emits mobile asset trees; this boilerplate is desktop-only.
  for (const dir of ["android", "ios"]) {
    rmSync(join(ICONS_DIR, dir), { recursive: true, force: true });
  }
  console.log("\nDone. Replace public/app-icon.png with your artwork and re-run.\n");
} catch {
  console.error(
    "\n`tauri icon` failed. Install deps first (npm install), then run:\n" +
      "  npx tauri icon public/app-icon.png --output src-tauri/icons\n"
  );
  process.exit(1);
}

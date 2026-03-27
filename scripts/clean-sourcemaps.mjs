/**
 * Pre-build script: strip source maps from the dist folder
 * to prevent leaking source code in production bundles.
 */
import { readdir, unlink } from "fs/promises";
import { join } from "path";

const DIST = join(process.cwd(), "dist");

async function clean(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    // dist doesn't exist yet — nothing to clean
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await clean(full);
    } else if (entry.name.endsWith(".map")) {
      await unlink(full);
      console.log(`  Removed: ${full}`);
    }
  }
}

console.log("Cleaning source maps from dist/...");
await clean(DIST);
console.log("Done.");

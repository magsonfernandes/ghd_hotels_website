/**
 * Generates placeholder hero images for the frontend when real assets are missing.
 * Run from repo root: node scripts/generate-placeholder-heroes.js
 * Output: src/frontend/public/assets/generated/*.jpg
 */
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../src/frontend/public/assets/generated");

const HEROES = [
  { name: "hero-home", color: [0x2a, 0x25, 0x20] },
  { name: "hero-celestra", color: [0x2a, 0x28, 0x22] },
  { name: "hero-samraya", color: [0x28, 0x26, 0x22] },
  { name: "hero-nivaara", color: [0x26, 0x24, 0x20] },
  { name: "hero-vision", color: [0x22, 0x24, 0x26] },
  { name: "hero-contact", color: [0x24, 0x22, 0x20] },
  { name: "hero-about", color: [0x26, 0x24, 0x22] },
];

const WIDTH = 1920;
const HEIGHT = 1080;
const FILENAME = (name) => `${name}.dim_${WIDTH}x${HEIGHT}.jpg`;

async function generatePlaceholders() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { name, color } of HEROES) {
    const [r, g, b] = color;
    const buffer = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: { r, g, b },
      },
    })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filePath = path.join(OUT_DIR, FILENAME(name));
    await writeFile(filePath, buffer);
    console.log("Created:", filePath);
  }

  console.log("Done. Placeholder hero images are in src/frontend/public/assets/generated");
}

generatePlaceholders().catch((err) => {
  console.error(err);
  process.exit(1);
});

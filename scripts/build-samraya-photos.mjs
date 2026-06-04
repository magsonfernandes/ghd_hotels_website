/**
 * Build public/SAMRAYA/photos/ for the property carousel.
 * Sources: SAMRAYA/photos (if present), else legacy category folders from git.
 *
 * Run: node scripts/build-samraya-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const samrayaDir = path.join(repoRoot, "src/frontend/public/SAMRAYA");
const photosDir = path.join(samrayaDir, "photos");
const morePhotosDir = path.join(samrayaDir, "more photos");

const JPEG_QUALITY = 88;
const PNG_QUALITY = 92;
const MAX_EDGE = 2400;

/** @type {Array<{ srcDir: string; src: string; destName: string }>} */
const PLAN = [
  { srcDir: "Villa", src: "YAD07419.JPG", destName: "samraya-villa-01.jpg" },
  { srcDir: "Villa", src: "YAD07441.JPG", destName: "samraya-villa-02.jpg" },
  { srcDir: "Villa", src: "YAD07512.JPG", destName: "samraya-villa-03.jpg" },
  { srcDir: "Villa", src: "YAD07641.JPG", destName: "samraya-villa-04.jpg" },
  { srcDir: "2 BHK", src: "YAD07957.JPG", destName: "samraya-2bhk-01.jpg" },
  { srcDir: "2 BHK", src: "YAD08011.JPG", destName: "samraya-2bhk-02.jpg" },
  { srcDir: "2 BHK", src: "YAD08078.JPG", destName: "samraya-2bhk-03.jpg" },
  { srcDir: "2 BHK", src: "YAD08118.JPG", destName: "samraya-2bhk-04.jpg" },
  { srcDir: "2 BHK", src: "YAD08123.JPG", destName: "samraya-2bhk-05.jpg" },
  { srcDir: "1 BHK", src: "YAD08148.JPG", destName: "samraya-1bhk-01.jpg" },
  { srcDir: "1 BHK", src: "YAD08203.JPG", destName: "samraya-1bhk-02.jpg" },
  { srcDir: "1 BHK", src: "YAD08218.JPG", destName: "samraya-1bhk-03.jpg" },
  { srcDir: "1 BHK", src: "YAD08273.JPG", destName: "samraya-1bhk-04.jpg" },
  { srcDir: "1 BHK", src: "YAD08283.JPG", destName: "samraya-1bhk-05.jpg" },
  { srcDir: "1 BHK", src: "YAD08303.JPG", destName: "samraya-1bhk-06.jpg" },
  { srcDir: "1 BHK", src: "YAD08336.JPG", destName: "samraya-1bhk-07.jpg" },
  { srcDir: "1 BHK", src: "YAD08373.JPG", destName: "samraya-1bhk-08.jpg" },
];

const LEGACY_DIRS = ["Villa", "2 BHK", "1 BHK"];

function resolveSource(item) {
  const inPhotos = path.join(photosDir, item.destName);
  if (fs.existsSync(inPhotos)) return inPhotos;

  const flatSrc = path.join(photosDir, item.src);
  if (fs.existsSync(flatSrc)) return flatSrc;

  const legacy = path.join(samrayaDir, item.srcDir, item.src);
  if (fs.existsSync(legacy)) return legacy;

  return null;
}

async function optimizeInPlace(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const tmp = `${absPath}.opt.tmp`;
  const img = sharp(absPath).rotate();

  if (ext === ".jpg" || ext === ".jpeg") {
    await img
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(tmp);
  } else if (ext === ".png") {
    await img
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ quality: PNG_QUALITY, compressionLevel: 9 })
      .toFile(tmp);
  } else {
    return;
  }

  fs.renameSync(tmp, absPath);
}

/** Ingest numbered PNGs from SAMRAYA/more photos → samraya-gallery-NN.png */
function ingestMorePhotos() {
  if (!fs.existsSync(morePhotosDir)) return [];

  const numbered = fs
    .readdirSync(morePhotosDir)
    .filter((n) => /^\d+\.png$/i.test(n))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));

  const added = [];
  for (let i = 0; i < numbered.length; i++) {
    const destName = `samraya-gallery-${String(i + 1).padStart(2, "0")}.png`;
    fs.copyFileSync(
      path.join(morePhotosDir, numbered[i]),
      path.join(photosDir, destName),
    );
    added.push(destName);
    console.log("→", destName, `(from more photos/${numbered[i]})`);
  }

  fs.rmSync(morePhotosDir, { recursive: true, force: true });
  console.log("Removed folder: more photos");
  return added;
}

function listSourceFiles() {
  return fs
    .readdirSync(photosDir)
    .filter(
      (n) => n.startsWith("samraya-") && /\.(jpe?g|png)$/i.test(n) && !/\.w\d+\.webp$/i.test(n),
    )
    .sort();
}

function pruneLegacyDirs() {
  for (const name of LEGACY_DIRS) {
    const dir = path.join(samrayaDir, name);
    if (!fs.existsSync(dir)) continue;
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed legacy folder:", name);
  }
}

async function main() {
  fs.mkdirSync(photosDir, { recursive: true });

  for (const item of PLAN) {
    const from = resolveSource(item);
    if (!from) {
      console.error("Missing source for", item.destName, `(tried ${item.srcDir}/${item.src})`);
      process.exit(1);
    }
    const to = path.join(photosDir, item.destName);
    fs.copyFileSync(from, to);
    console.log("→", item.destName);
  }

  ingestMorePhotos();

  console.log("\nCompressing sources…");
  for (const name of listSourceFiles()) {
    const abs = path.join(photosDir, name);
    const before = fs.statSync(abs).size;
    await optimizeInPlace(abs);
    const after = fs.statSync(abs).size;
    console.log(
      `  ${name}: ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`,
    );
  }

  pruneLegacyDirs();

  console.log("\nNext:");
  console.log("  ONLY_IMAGES=/SAMRAYA/photos pnpm optimize:assets");
  console.log("  node scripts/update-samraya-manifest.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

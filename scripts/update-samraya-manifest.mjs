/**
 * Refresh media-manifest.json entries for /SAMRAYA/ images (after organize + webp).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "src/frontend/public");
const manifestPath = path.join(
  repoRoot,
  "src/frontend/src/generated/media-manifest.json",
);

const WEBP_QUALITY = 82;
const GALLERY_WIDTHS = [480, 800, 1200, 1600];
const IMAGE_EXT = /\.(png|jpe?g)$/i;
const SKIP_OPT = /\.w\d+\.webp$/i;

function toPublicUrl(absPath) {
  const rel = path.relative(publicDir, absPath).split(path.sep).join("/");
  return `/${rel}`;
}

function optBasename(absInput, width) {
  const dir = path.dirname(absInput);
  const base = path.basename(absInput).replace(IMAGE_EXT, "");
  return path.join(dir, `${base}.w${width}.webp`);
}

function capWidths(widths, maxW) {
  const capped = widths.filter((x) => x <= maxW);
  if (capped.length) return capped;
  const fallback = widths.find((x) => x >= maxW) ?? widths[widths.length - 1];
  return [Math.min(fallback, maxW)];
}

function walkSamraya(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      walkSamraya(abs, files);
      continue;
    }
    if (!IMAGE_EXT.test(name) || SKIP_OPT.test(name)) continue;
    files.push(abs);
  }
  return files;
}

async function entryFor(absInput) {
  const meta = await sharp(absInput).metadata();
  const maxW = meta.width ?? 1600;
  const widths = capWidths(GALLERY_WIDTHS, maxW);
  const sources = widths.map((width) => ({
    width,
    url: toPublicUrl(optBasename(absInput, width)),
  }));
  const largest = sources[sources.length - 1];
  return {
    original: toPublicUrl(absInput),
    src: largest.url,
    srcSet: sources.map((s) => `${s.url} ${s.width}w`).join(", "),
    widths: sources.map((s) => s.width),
  };
}

async function main() {
  const photosDir = path.join(publicDir, "SAMRAYA", "photos");
  const samrayaDir = fs.existsSync(photosDir) ? photosDir : path.join(publicDir, "SAMRAYA");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.images = manifest.images ?? {};

  for (const key of Object.keys(manifest.images)) {
    if (key.startsWith("/SAMRAYA/")) delete manifest.images[key];
  }

  const files = walkSamraya(samrayaDir);
  for (const abs of files) {
    const e = await entryFor(abs);
    manifest.images[e.original] = {
      src: e.src,
      srcSet: e.srcSet,
      widths: e.widths,
    };
    console.log("✓", e.original);
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

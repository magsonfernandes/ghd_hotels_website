/**
 * Generates WebP variants + manifest for all raster images under src/frontend/public.
 * Optionally re-encodes hero videos when ffmpeg is available.
 *
 * Usage: node scripts/optimize-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "src/frontend/public");
const manifestPath = path.join(
  repoRoot,
  "src/frontend/src/generated/media-manifest.json",
);

const WEBP_QUALITY = 82;
const LOGO_QUALITY = 88;

const HERO_WIDTHS = [640, 960, 1280, 1920];
const SECTION_WIDTHS = [480, 768, 1280, 1920];
const GALLERY_WIDTHS = [480, 800, 1200, 1600];
const CARD_WIDTHS = [400, 800, 1200];
const LOGO_WIDTHS = [200, 400, 600];
const SMALL_WIDTHS = [256, 512];

const IMAGE_EXT = /\.(png|jpe?g)$/i;
const SKIP_OPT = /\.w\d+\.webp$/i;

function hasFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function pickWidths(meta, publicPath) {
  const w = meta.width ?? 1920;
  const p = publicPath.toLowerCase();
  if (p.includes("/logo/") || p.includes("qr")) return LOGO_WIDTHS;
  if (p.includes("/nivaara/") || p.includes("/celestra dodamarg/"))
    return GALLERY_WIDTHS;
  if (p.includes("hero-") || p.includes("hero.")) return HERO_WIDTHS;
  if (w <= 600) return SMALL_WIDTHS;
  if (w <= 1200) return CARD_WIDTHS;
  return SECTION_WIDTHS;
}

/** Keep only preset breakpoints that fit the source; never add native full width (e.g. 6k). */
function capWidths(widths, maxW) {
  const capped = widths.filter((x) => x <= maxW);
  if (capped.length) return capped;
  const fallback = widths.find((x) => x >= maxW) ?? widths[widths.length - 1];
  return [Math.min(fallback, maxW)];
}

function toPublicUrl(absPath) {
  const rel = path.relative(publicDir, absPath).split(path.sep).join("/");
  return `/${rel}`;
}

function optBasename(absInput, width) {
  const dir = path.dirname(absInput);
  const base = path.basename(absInput).replace(IMAGE_EXT, "");
  return path.join(dir, `${base}.w${width}.webp`);
}

function variantsFresh(absInput, widths) {
  const srcMtime = fs.statSync(absInput).mtimeMs;
  return widths.every((width) => {
    const outPath = optBasename(absInput, width);
    return fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= srcMtime;
  });
}

async function optimizeImage(absInput) {
  const publicPath = toPublicUrl(absInput);
  const meta = await sharp(absInput).metadata();
  const maxW = meta.width ?? 1920;
  const widths = capWidths(pickWidths(meta, publicPath), maxW);
  const sources = [];
  const fresh = variantsFresh(absInput, widths);

  if (!fresh) {
    for (const width of widths) {
      const outPath = optBasename(absInput, width);
      await sharp(absInput)
        .resize({ width, withoutEnlargement: true })
        .webp({
          quality: publicPath.includes("/logo/") ? LOGO_QUALITY : WEBP_QUALITY,
        })
        .toFile(outPath);
      sources.push({ width, url: toPublicUrl(outPath) });
    }
  } else {
    for (const width of widths) {
      sources.push({ width, url: toPublicUrl(optBasename(absInput, width)) });
    }
  }

  const largest = sources[sources.length - 1];
  return {
    original: publicPath,
    src: largest.url,
    srcSet: sources.map((s) => `${s.url} ${s.width}w`).join(", "),
    widths: sources.map((s) => s.width),
  };
}

async function optimizeVideo(inputAbs, outBaseName) {
  const outDir = path.dirname(inputAbs);
  const mp4Out = path.join(outDir, outBaseName + ".mp4");
  const webmOut = path.join(outDir, outBaseName + ".webm");
  const posterOut = path.join(outDir, outBaseName + "-poster.w1280.webp");

  const scale =
    outBaseName === "home-hero-mobile"
      ? "scale=-2:1920"
      : "scale=1920:-2";
  execSync(
    `ffmpeg -y -i "${inputAbs}" -vf "${scale}" -c:v libx264 -crf 23 -preset medium -movflags +faststart -an "${mp4Out}"`,
    { stdio: "ignore" },
  );
  try {
    execSync(
      `ffmpeg -y -i "${inputAbs}" -vf "${scale}" -c:v libvpx-vp9 -crf 32 -b:v 0 -an "${webmOut}"`,
      { stdio: "ignore" },
    );
  } catch {
    /* webm optional */
  }
  execSync(
    `ffmpeg -y -i "${inputAbs}" -vframes 1 -vf "scale=1280:-2" -q:v 2 "${posterOut.replace(".webp", ".jpg")}"`,
    { stdio: "ignore" },
  );
  await sharp(posterOut.replace(".webp", ".jpg"))
    .webp({ quality: 80 })
    .toFile(posterOut);
  fs.unlinkSync(posterOut.replace(".webp", ".jpg"));

  return {
    mp4: toPublicUrl(mp4Out),
    webm: fs.existsSync(webmOut) ? toPublicUrl(webmOut) : undefined,
    poster: toPublicUrl(posterOut),
  };
}

function walkImages(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walkImages(abs, files);
      continue;
    }
    if (!IMAGE_EXT.test(name) || SKIP_OPT.test(name)) continue;
    files.push(abs);
  }
  return files;
}

async function main() {
  console.log("Optimizing images in", publicDir);
  const images = walkImages(publicDir);
  const manifest = { images: {}, videos: {} };

  let i = 0;
  for (const abs of images) {
    i += 1;
    process.stdout.write(`\r[${i}/${images.length}] ${path.basename(abs)}`.padEnd(60));
    try {
      const entry = await optimizeImage(abs);
      manifest.images[entry.original] = {
        src: entry.src,
        srcSet: entry.srcSet,
        widths: entry.widths,
      };
    } catch (err) {
      console.error("\nFailed:", abs, err.message);
    }
  }
  console.log("\n");

  if (hasFfmpeg()) {
    console.log("Optimizing hero videos…");
    const videoCandidates = [
      {
        key: "homeHeroDesktop",
        files: [
          path.join(
            publicDir,
            "assets/generated/GHD Hotels website video (2).mp4",
          ),
          path.join(
            publicDir,
            "assets/generated/WhatsApp Video 2026-04-27 at 17.02.37.mp4",
          ),
        ],
        out: "home-hero",
      },
      {
        key: "homeHeroMobile",
        files: [
          path.join(
            publicDir,
            "assets/generated/GHD Hotels website video (2).mp4",
          ),
          path.join(publicDir, "assets/generated/MainPage.mov"),
        ],
        out: "home-hero",
      },
      {
        key: "celestraHero",
        files: [
          path.join(publicDir, "Celestra Dodamarg/GHD celestra.mov"),
          path.join(publicDir, "assets/generated/celestra video.mov"),
          path.join(publicDir, "assets/generated/celestra-hero.mov"),
        ],
        out: "celestra-hero",
      },
    ];
    for (const { key, files, out } of videoCandidates) {
      const input = files.find((f) => fs.existsSync(f));
      if (!input) continue;
      try {
        manifest.videos[key] = await optimizeVideo(input, out);
        console.log("  ✓", key);
      } catch (err) {
        console.error("  ✗", key, err.message);
      }
    }
  } else {
    console.warn("ffmpeg not found — skipping video optimization.");
  }

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("Wrote", manifestPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

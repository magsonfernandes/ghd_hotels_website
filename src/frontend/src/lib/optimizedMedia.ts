import manifest from "../generated/media-manifest.json";

export type OptimizedImageEntry = {
  src: string;
  srcSet: string;
  widths: number[];
};

export type OptimizedVideoEntry = {
  mp4: string;
  webm?: string;
  poster: string;
};

const images = manifest.images as Record<string, OptimizedImageEntry>;
const videos = manifest.videos as Record<string, OptimizedVideoEntry>;

/** Resolve raster path to optimized WebP (falls back to original if not in manifest). */
export function optimizeImagePath(publicPath: string): OptimizedImageEntry {
  const entry = images[publicPath];
  if (entry) return entry;
  return { src: publicPath, srcSet: "", widths: [] };
}

export function optimizeSrc(publicPath: string): string {
  return optimizeImagePath(publicPath).src;
}

export function optimizeSrcSet(publicPath: string): string | undefined {
  const { srcSet } = optimizeImagePath(publicPath);
  return srcSet || undefined;
}

/** Default sizes for full-bleed heroes */
export const HERO_IMAGE_SIZES = "100vw";

/** Property / room gallery */
export const GALLERY_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px";

/** Brand cards on home */
export const CARD_IMAGE_SIZES = "(max-width: 768px) 100vw, 400px";

/** Logos */
export const LOGO_IMAGE_SIZES = "(max-width: 640px) 40vw, 200px";

export const HOME_HERO_VIDEO_DESKTOP =
  videos.homeHeroDesktop ?? {
    mp4: "/assets/generated/home-hero.mp4",
    webm: "/assets/generated/home-hero.webm",
    poster: "/assets/generated/home-hero-poster.w1280.webp",
  };

export const HOME_HERO_VIDEO_MOBILE = HOME_HERO_VIDEO_DESKTOP;

export const CELESTRA_HERO_VIDEO =
  videos.celestraHero ?? {
    mp4: "/assets/generated/celestra-hero.mp4",
    webm: "/assets/generated/celestra-hero.webm",
    poster: "/assets/generated/celestra-hero-poster.w1280.webp",
  };

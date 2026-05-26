import type { CSSProperties } from "react";
import { HERO_IMAGE_SIZES, optimizeImagePath } from "../lib/optimizedMedia";

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  /** Applied to the inner img (object-cover layer) */
  imgClassName?: string;
  imgStyle?: CSSProperties;
};

/**
 * Full-bleed cover image (replaces CSS background-image for optimized delivery).
 */
export function MediaBackground({
  src,
  className = "",
  style,
  sizes = HERO_IMAGE_SIZES,
  priority = false,
  imgClassName = "absolute inset-0 h-full w-full object-cover",
  imgStyle,
}: Props) {
  const opt = optimizeImagePath(src);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`.trim()} style={style}>
      <img
        src={opt.src}
        srcSet={opt.srcSet || undefined}
        sizes={opt.srcSet ? sizes : undefined}
        alt=""
        aria-hidden
        draggable={false}
        className={imgClassName}
        style={imgStyle}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
      />
    </div>
  );
}

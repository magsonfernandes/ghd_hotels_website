import type { CSSProperties, ImgHTMLAttributes } from "react";
import {
  optimizeImagePath,
  type OptimizedImageEntry,
} from "../lib/optimizedMedia";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  /** Public URL path, e.g. `/assets/generated/hero-nivaara.dim_1920x1080.png` */
  src: string;
  /** Pre-resolved entry (skips manifest lookup) */
  resolved?: OptimizedImageEntry;
  sizes?: string;
  /** LCP / above-fold */
  priority?: boolean;
};

export function ResponsiveImage({
  src,
  resolved,
  sizes,
  priority = false,
  loading,
  decoding,
  fetchPriority,
  ...rest
}: Props) {
  const opt = resolved ?? optimizeImagePath(src);
  const hasSet = Boolean(opt.srcSet);

  return (
    <img
      {...rest}
      src={opt.src}
      srcSet={hasSet ? opt.srcSet : undefined}
      sizes={hasSet && sizes ? sizes : undefined}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? (priority ? "sync" : "async")}
      fetchPriority={fetchPriority ?? (priority ? "high" : undefined)}
    />
  );
}

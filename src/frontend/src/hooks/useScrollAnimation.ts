import { useEffect, useRef } from "react";

const SCROLL_SELECTOR =
  ".animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right";

export function useScrollAnimation() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            entry.target.classList.add("animate-visible-x");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" },
    );

    // Observe element itself and all children with animation classes
    observer.observe(el);
    const children = el.querySelectorAll(SCROLL_SELECTOR);
    for (const child of children) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useScrollAnimationAll() {
  useEffect(() => {
    const elements = document.querySelectorAll(SCROLL_SELECTOR);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            entry.target.classList.add("animate-visible-x");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);
}

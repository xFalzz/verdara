"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __verdaraLenis?: Lenis;
  }
}

/**
 * Site-wide smooth scrolling.
 * Lenis drives the native scroll position, GSAP's ticker drives Lenis,
 * and every Lenis frame updates ScrollTrigger so scrubbed animations stay in sync.
 * Skipped entirely for users who prefer reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      anchors: { offset: -72 },
      // Let inner scroll areas (popovers, lists, code blocks) scroll natively.
      prevent: (node: HTMLElement) =>
        !!node.closest?.(
          "[data-lenis-prevent], .overflow-y-auto, .overflow-auto, .overflow-x-auto"
        ),
    });
    window.__verdaraLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__verdaraLenis;
    };
  }, []);

  return null;
}

/** Smoothly scroll to an element, falling back to native behaviour without Lenis. */
export function smoothScrollTo(target: HTMLElement | string, offset = -72) {
  const lenis = typeof window !== "undefined" ? window.__verdaraLenis : undefined;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

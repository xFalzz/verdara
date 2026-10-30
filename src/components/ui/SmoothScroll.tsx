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
 * Clean, lightweight inertial smooth scrolling.
 * Uses a responsive lerp factor (0.14) and native requestAnimationFrame loop
 * so scrolling feels crisp, immediate, and never rubbery or laggy.
 * Excludes WebGL canvases and nested scrollable containers automatically.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
      syncTouch: false,
      autoRaf: false,
      anchors: { offset: -76 },
      prevent: (node: HTMLElement) =>
        !!node.closest?.(
          "[data-lenis-prevent], .overflow-y-auto, .overflow-auto, .overflow-x-auto, canvas"
        ),
    });
    window.__verdaraLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__verdaraLenis;
    };
  }, []);

  return null;
}

/** Smoothly scroll to an element, falling back to native behaviour without Lenis. */
export function smoothScrollTo(target: HTMLElement | string, offset = -76) {
  const lenis = typeof window !== "undefined" ? window.__verdaraLenis : undefined;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 0.9 });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

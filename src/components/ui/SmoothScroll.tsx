"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __verdaraLenis?: Lenis;
  }
}

/**
 * Finds the nearest ancestor (including the target itself) that actually has
 * scrollable vertical or horizontal overflow.
 */
function findScrollableAncestor(
  start: HTMLElement | null,
  deltaX: number,
  deltaY: number
): { el: HTMLElement; axis: "y" | "x" } | null {
  let node: HTMLElement | null = start;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 2;
    if (canScrollY && Math.abs(deltaY) >= Math.abs(deltaX)) {
      const atTop = node.scrollTop <= 0 && deltaY < 0;
      const atBottom =
        node.scrollTop + node.clientHeight >= node.scrollHeight - 1 &&
        deltaY > 0;
      if (!atTop && !atBottom) {
        return { el: node, axis: "y" };
      }
    }

    const canScrollX =
      (overflowX === "auto" || overflowX === "scroll") &&
      node.scrollWidth > node.clientWidth + 2;
    if (canScrollX && Math.abs(deltaX) > Math.abs(deltaY)) {
      const atLeft = node.scrollLeft <= 0 && deltaX < 0;
      const atRight =
        node.scrollLeft + node.clientWidth >= node.scrollWidth - 1 &&
        deltaX > 0;
      if (!atLeft && !atRight) {
        return { el: node, axis: "x" };
      }
    }

    node = node.parentElement;
  }
  return null;
}

/**
 * Universal Smooth Scroll Engine for Verdara:
 * 1. Drives smooth inertial scrolling across the entire document on every route
 *    (/, /login, /dashboard, /lens, /radar, /council, /academy, /settings, /docs, /faq).
 * 2. Smoothly interpolates nested scrollable containers (dropdown lists, modals,
 *    tables, and horizontal rails) at 60 FPS using an internal lerp map, handing
 *    off seamlessly to the main page scroll when reaching top/bottom edges.
 * 3. Automatically recalculates scroll bounds via ResizeObserver and route transitions
 *    so expanding accordions, switching tabs, or loading dynamic content never clips.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.13,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      syncTouch: false,
      autoRaf: false,
      anchors: { offset: -76 },
      prevent: (node: HTMLElement) => {
        if (!node) return false;
        if (
          node.tagName === "CANVAS" ||
          node.closest?.("canvas") ||
          node.closest?.("[data-lenis-prevent]")
        ) {
          return true;
        }
        return false;
      },
    });
    window.__verdaraLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // Smooth inertial scrolling for nested scrollable containers (dropdowns, panels, tables)
    const nestedTargets = new Map<
      HTMLElement,
      { targetTop: number; targetLeft: number; active: boolean }
    >();

    const onWheelCapture = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.tagName === "CANVAS" ||
        target.closest?.("canvas") ||
        target.closest?.("[data-lenis-prevent]")
      ) {
        return;
      }

      const scrollable = findScrollableAncestor(target, e.deltaX, e.deltaY);
      if (!scrollable) return;

      // Prevent main Lenis from scrolling while the inner container scrolls smoothly
      e.stopPropagation();
      e.preventDefault();

      const { el, axis } = scrollable;
      let state = nestedTargets.get(el);
      if (!state || !state.active) {
        state = {
          targetTop: el.scrollTop,
          targetLeft: el.scrollLeft,
          active: true,
        };
        nestedTargets.set(el, state);
      }

      const multiplier = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 320 : 1;
      if (axis === "y") {
        const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
        state.targetTop = Math.max(
          0,
          Math.min(maxTop, state.targetTop + e.deltaY * multiplier)
        );
      } else {
        const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
        state.targetLeft = Math.max(
          0,
          Math.min(
            maxLeft,
            state.targetLeft + (e.deltaX || e.deltaY) * multiplier
          )
        );
      }
      state.active = true;
    };

    window.addEventListener("wheel", onWheelCapture, {
      passive: false,
      capture: true,
    });

    // Automatically recalculate Lenis dimensions when page content changes height
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);

      // Step nested container smooth scroll animations
      nestedTargets.forEach((state, el) => {
        if (!el.isConnected) {
          nestedTargets.delete(el);
          return;
        }
        if (!state.active) return;

        const dy = state.targetTop - el.scrollTop;
        const dx = state.targetLeft - el.scrollLeft;

        if (Math.abs(dy) > 0.4) {
          el.scrollTop += dy * 0.2;
        } else {
          el.scrollTop = state.targetTop;
        }

        if (Math.abs(dx) > 0.4) {
          el.scrollLeft += dx * 0.2;
        } else {
          el.scrollLeft = state.targetLeft;
        }

        if (Math.abs(dy) <= 0.4 && Math.abs(dx) <= 0.4) {
          state.active = false;
        }
      });

      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheelCapture, { capture: true });
      resizeObserver.disconnect();
      lenis.destroy();
      delete window.__verdaraLenis;
    };
  }, []);

  // Recalculate dimensions and sync scroll on Next.js route changes
  useEffect(() => {
    const lenis = window.__verdaraLenis;
    if (!lenis) return;
    const timer = window.setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

/** Smoothly scroll to an element or top, falling back to native behaviour without Lenis. */
export function smoothScrollTo(
  target: HTMLElement | string | number,
  offset = -76
) {
  const lenis = typeof window !== "undefined" ? window.__verdaraLenis : undefined;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 0.85 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
  if (!start) return null;
  // High-performance fast path: Never use getComputedStyle in a while loop
  const candidate = start.closest?.(
    "[data-scrollable], .overflow-y-auto, .overflow-y-scroll, .overflow-x-auto, .overflow-x-scroll, .dovv-bottom-dock, .country-pill-rail, .drag-slide-rail"
  ) as HTMLElement | null;
  if (!candidate || candidate === document.body || candidate === document.documentElement) {
    return null;
  }

  const canScrollY = candidate.scrollHeight > candidate.clientHeight + 2;
  if (canScrollY && Math.abs(deltaY) >= Math.abs(deltaX)) {
    const atTop = candidate.scrollTop <= 0 && deltaY < 0;
    const atBottom =
      candidate.scrollTop + candidate.clientHeight >= candidate.scrollHeight - 1 &&
      deltaY > 0;
    if (!atTop && !atBottom) {
      return { el: candidate, axis: "y" };
    }
  }

  const canScrollX = candidate.scrollWidth > candidate.clientWidth + 2;
  const isHorizontalRail =
    candidate.classList.contains("dovv-bottom-dock") ||
    candidate.classList.contains("country-pill-rail") ||
    candidate.classList.contains("drag-slide-rail");
  if (
    canScrollX &&
    (Math.abs(deltaX) > Math.abs(deltaY) || (!canScrollY && isHorizontalRail))
  ) {
    const effectiveDelta = Math.abs(deltaX) > 0.5 ? deltaX : deltaY;
    const atLeft = candidate.scrollLeft <= 0 && effectiveDelta < 0;
    const atRight =
      candidate.scrollLeft + candidate.clientWidth >= candidate.scrollWidth - 1 &&
      effectiveDelta > 0;
    if (!atLeft && !atRight) {
      return { el: candidate, axis: "x" };
    }
  }

  return null;
}

/**
 * Finds the nearest horizontal scrollable rail/dock/table container for drag-to-slide.
 */
function findHorizontalDragContainer(
  start: HTMLElement | null
): HTMLElement | null {
  if (!start) return null;
  if (
    start.tagName === "CANVAS" ||
    start.tagName === "INPUT" ||
    start.tagName === "TEXTAREA" ||
    start.tagName === "SELECT"
  ) {
    return null;
  }
  const rail = start.closest?.(
    ".dovv-bottom-dock, .country-pill-rail, .drag-slide-rail, [data-horizontal-rail]"
  ) as HTMLElement | null;
  if (!rail) return null;
  if (rail.scrollWidth <= rail.clientWidth + 2) return null;
  return rail;
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.18,
      smoothWheel: typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches,
      wheelMultiplier: 1,
      touchMultiplier: 0,
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

    // Automatically recalculate Lenis dimensions when page content changes height (debounced to avoid hydration thrashing)
    let resizeTimer: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 160);
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

  // Universal Horizontal Drag-to-Slide & Inertial Momentum Engine for all Docks, Pill Rails & Wide Containers
  useEffect(() => {
    let activeRail: HTMLElement | null = null;
    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let momentumRafId = 0;
    let suppressNextClickUntil = 0;

    const stopMomentum = () => {
      if (momentumRafId) {
        window.cancelAnimationFrame(momentumRafId);
        momentumRafId = 0;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      // Only handle primary button for mouse, or any touch/pen contact
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const rail = findHorizontalDragContainer(target);
      if (!rail) return;

      stopMomentum();
      activeRail = rail;
      isDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastTime = performance.now();
      velocityX = 0;
      startScrollLeft = rail.scrollLeft;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown || !activeRail) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        // If user is clearly scrolling vertically on touch, release horizontal lock
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.25) {
          isDown = false;
          activeRail = null;
          return;
        }
        if (Math.abs(dx) > 5) {
          isDragging = true;
          activeRail.classList.add("is-dragging-rail");
        }
      }

      if (isDragging) {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const stepDx = e.clientX - lastX;
        velocityX = (stepDx / dt) * 16;
        lastX = e.clientX;
        lastTime = now;

        activeRail.scrollLeft = startScrollLeft - dx;
      }
    };

    const finishDrag = () => {
      if (!isDown) return;
      const rail = activeRail;
      const wasDragging = isDragging;
      isDown = false;
      isDragging = false;
      activeRail = null;

      if (rail) {
        rail.classList.remove("is-dragging-rail");
      }

      if (wasDragging && rail) {
        suppressNextClickUntil = performance.now() + 180;
        let vx = velocityX;
        const stepMomentum = () => {
          if (!rail.isConnected || Math.abs(vx) < 0.45) {
            momentumRafId = 0;
            return;
          }
          rail.scrollLeft -= vx;
          vx *= 0.91;
          momentumRafId = window.requestAnimationFrame(stepMomentum);
        };
        if (Math.abs(vx) > 0.8) {
          momentumRafId = window.requestAnimationFrame(stepMomentum);
        }
      }
    };

    const onDragStartCapture = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && findHorizontalDragContainer(target)) {
        e.preventDefault();
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (performance.now() < suppressNextClickUntil) {
        e.preventDefault();
        e.stopPropagation();
        suppressNextClickUntil = 0;
      }
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", finishDrag, { passive: true });
    window.addEventListener("pointercancel", finishDrag, { passive: true });
    window.addEventListener("dragstart", onDragStartCapture, { capture: true });
    window.addEventListener("click", onClickCapture, { capture: true });

    return () => {
      stopMomentum();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      window.removeEventListener("dragstart", onDragStartCapture, {
        capture: true,
      });
      window.removeEventListener("click", onClickCapture, { capture: true });
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

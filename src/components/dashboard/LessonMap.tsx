"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type LessonMapItem = {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  unlocked: boolean;
  href: string | null;
};

type LessonMapProps = {
  lessons: LessonMapItem[];
};

type ItemVisual = {
  scale: number;
  opacity: number;
};

const MIN_SCALE = 0.62;
const MIN_OPACITY = 0.48;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node: HTMLElement | null = el;
  while (node) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    if (
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function visualFromDistance(distancePx: number, halfViewport: number): ItemVisual {
  // 0 at center → 1 at ~half viewport away
  const t = clamp(Math.abs(distancePx) / Math.max(1, halfViewport * 0.9), 0, 1);
  // Smooth ease-out curve
  const eased = t * t * (3 - 2 * t);
  return {
    scale: 1 - eased * (1 - MIN_SCALE),
    opacity: 1 - eased * (1 - MIN_OPACITY),
  };
}

export function LessonMap({ lessons }: LessonMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [visuals, setVisuals] = useState<ItemVisual[]>(() =>
    lessons.map(() => ({ scale: 1, opacity: 1 })),
  );
  const frameRef = useRef<number | null>(null);

  const updateVisuals = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = findScrollParent(root);
    let viewportTop = 0;
    let viewportHeight = window.innerHeight;

    if (scroller instanceof HTMLElement) {
      const rect = scroller.getBoundingClientRect();
      viewportTop = rect.top;
      viewportHeight = rect.height;
    }

    const centerY = viewportTop + viewportHeight / 2;
    const half = viewportHeight / 2;

    const next = lessons.map((_, index) => {
      const el = itemRefs.current[index];
      if (!el) return { scale: MIN_SCALE, opacity: MIN_OPACITY };
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      return visualFromDistance(itemCenter - centerY, half);
    });

    setVisuals(next);
  }, [lessons]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current != null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updateVisuals();
    });
  }, [updateVisuals]);

  useLayoutEffect(() => {
    updateVisuals();
  }, [updateVisuals]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = findScrollParent(root);

    const onScroll = () => scheduleUpdate();
    const onResize = () => scheduleUpdate();

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleUpdate())
        : null;
    if (root) ro?.observe(root);

    scheduleUpdate();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scheduleUpdate]);

  return (
    <div
      ref={rootRef}
      className="lesson-roadmap relative mx-auto w-full max-w-md"
      dir="ltr"
    >
      <div
        className="pointer-events-none absolute top-8 bottom-10 left-1/2 w-10 -translate-x-1/2"
        aria-hidden
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 40 800"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M20 0
               C 34 80, 6 160, 20 240
               C 34 320, 6 400, 20 480
               C 34 560, 6 640, 20 720
               C 28 760, 16 790, 20 800"
            className="stroke-[#E8E0D4] dark:stroke-[#2E3E46]"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Extra vertical padding so first/last can sit at visual center */}
      <ol className="relative z-10 flex flex-col gap-6 py-[18vh]">
        {lessons.map((lesson, index) => {
          const leanLeft = index % 2 === 0;
          const label = `LESSON ${String(lesson.number).padStart(2, "0")}`;
          const isActive = lesson.unlocked;
          const { scale, opacity } = visuals[index] ?? {
            scale: 1,
            opacity: 1,
          };
          // Gentle winding offset (same idea as sin path, project colors unchanged)
          const windX = Math.sin(index * 0.85) * (leanLeft ? -10 : 10);

          return (
            <li
              key={lesson.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`relative flex items-center will-change-transform ${
                leanLeft ? "justify-start pe-[16%]" : "justify-end ps-[16%]"
              }`}
              style={{
                transform: `translate3d(${windX}px, 0, 0) scale(${scale})`,
                opacity,
                transformOrigin: leanLeft ? "left center" : "right center",
              }}
            >
              <span
                className={`absolute top-1/2 left-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow duration-200 ${
                  isActive
                    ? "bg-apricot shadow-[0_0_0_4px_rgba(240,160,90,0.28)]"
                    : "border-2 border-[#D9D0C4] bg-[#F9F6EE] dark:border-[#37464F] dark:bg-[#1F2E35]"
                }`}
                aria-hidden
              />

              <div className="w-[78%] min-w-0">
                {lesson.unlocked && lesson.href ? (
                  <Link
                    href={lesson.href}
                    className="block rounded-2xl border border-apricot/40 bg-card p-3.5 shadow-md shadow-orange-950/5 transition-transform duration-200 active:scale-[0.98]"
                  >
                    <p className="text-[10px] font-extrabold tracking-[0.16em] text-apricot-deep">
                      {label}
                    </p>
                    <p className="mt-1 text-base font-extrabold text-black dark:text-white sm:text-lg">
                      {lesson.title}
                    </p>
                    <p className="text-sm text-slate-500" dir="rtl">
                      {lesson.titleAr}
                    </p>
                    <p className="mt-2 text-xs font-bold text-apricot-deep">
                      ابدأ ←
                    </p>
                  </Link>
                ) : (
                  <div className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-card-border/70 bg-card/50 px-3 py-3 dark:bg-[#1F2E35]/50">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold tracking-[0.16em] text-slate-400">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-slate-500">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-400" dir="rtl">
                        {lesson.titleAr}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      قريبًا
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

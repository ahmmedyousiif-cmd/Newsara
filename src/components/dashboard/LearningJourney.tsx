"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { JourneyStation } from "../../../content/dev/journeyScrollTest";

type LearningJourneyProps = {
  stations: JourneyStation[];
};

const VIEW_W = 1000;
const TOP_PAD = 56;
const BOTTOM_PAD = 72;
const GAP = 148;

function stationAnchorX(side: JourneyStation["side"]): number {
  if (side === "left") return 270;
  if (side === "right") return 730;
  return 500;
}

function buildJourneyPath(stations: JourneyStation[]): {
  path: string;
  height: number;
  points: Array<{ x: number; y: number }>;
} {
  const height = TOP_PAD + Math.max(1, stations.length) * GAP + BOTTOM_PAD;
  const points = stations.map((station, index) => {
    const y = TOP_PAD + index * GAP + GAP * 0.42;
    // Slight organic drift so the path is not a perfect sine zigzag
    const drift = Math.sin(index * 1.15) * 28 + Math.cos(index * 0.55) * 12;
    return {
      x: stationAnchorX(station.side) + drift,
      y,
    };
  });

  if (!points.length) {
    return { path: "", height, points };
  }

  let d = `M ${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x.toFixed(1)} ${midY.toFixed(1)}, ${curr.x.toFixed(1)} ${midY.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  return { path: d, height, points };
}

export function LearningJourney({ stations }: LearningJourneyProps) {
  const { path, height, points } = useMemo(
    () => buildJourneyPath(stations),
    [stations],
  );

  return (
    <div
      className="learning-journey-viewport relative w-full overflow-x-hidden pb-6"
      dir="ltr"
    >
      <div
        className="relative mx-auto w-full max-w-md"
        style={{ height: `${height}px`, minHeight: `${height}px` }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VIEW_W} ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={path}
            fill="none"
            stroke="var(--journey-path-color, #E8E0D4)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {stations.map((station, index) => {
          const point = points[index];
          if (!point) return null;

          const topPx = point.y - 56;
          const isActive = station.status === "active";
          const isLocked = station.status === "locked";
          const align =
            station.side === "right"
              ? "right-[5%]"
              : station.side === "center"
                ? "left-1/2 -translate-x-1/2"
                : "left-[5%]";

          const card = (
            <div
              className={`min-h-[7rem] w-full rounded-[1.35rem] border px-4 py-3.5 transition-transform duration-200 active:scale-[0.98] ${
                isActive
                  ? "border-apricot/45 bg-card shadow-md shadow-orange-950/10"
                  : "border-card-border/80 bg-card/70 dark:bg-[#1F2E35]/65"
              } ${isLocked ? "opacity-75" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-[11px] font-extrabold tracking-[0.14em] ${
                    isActive ? "text-apricot-deep" : "text-slate-400"
                  }`}
                >
                  LESSON {String(station.number).padStart(2, "0")}
                </p>
                {isLocked ? (
                  <span className="text-[10px] font-bold text-slate-400">
                    قريبًا
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-1 text-[1.05rem] font-extrabold leading-snug ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {station.title}
              </p>
              <p
                className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400"
                dir="rtl"
              >
                {station.subtitle}
              </p>
              {isActive ? (
                <p className="mt-2 text-xs font-bold text-apricot-deep">
                  ابدأ ←
                </p>
              ) : null}
            </div>
          );

          return (
            <div
              key={station.id}
              className={`absolute z-10 w-[min(46%,11.5rem)] ${align}`}
              style={{ top: topPx }}
            >
              {/* Path node */}
              <span
                className={`absolute top-1/2 z-20 h-3 w-3 -translate-y-1/2 rounded-full ${
                  station.side === "right"
                    ? "left-0 -translate-x-1/2"
                    : station.side === "center"
                      ? "left-1/2 -translate-x-1/2"
                      : "right-0 translate-x-1/2"
                } ${
                  isActive
                    ? "bg-apricot shadow-[0_0_0_4px_rgba(240,160,90,0.25)]"
                    : "border-2 border-[#D9D0C4] bg-[#F9F6EE] dark:border-[#37464F] dark:bg-[#1F2E35]"
                }`}
                aria-hidden
              />

              {isActive && station.href ? (
                <Link href={station.href} className="block min-h-11">
                  {card}
                </Link>
              ) : (
                <div className="block min-h-11" aria-disabled>
                  {card}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

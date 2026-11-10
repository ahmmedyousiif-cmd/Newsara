"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { JourneyStation } from "../../../content/dev/journeyScrollTest";

type LearningJourneyProps = {
  stations: JourneyStation[];
};

const VIEW_W = 1000;
const VIEW_H = 1400;
const TOP_PAD = 28;
const BOTTOM_PAD = 96;
/** Compact vertical rhythm for smaller cards on mobile */
const GAP = 108;

function stationAlign(side: JourneyStation["side"]): string {
  if (side === "right") return "right-[4%]";
  if (side === "center") return "left-1/2 -translate-x-1/2";
  return "left-[4%]";
}

function nodeSideClass(side: JourneyStation["side"]): string {
  if (side === "right") return "left-0 -translate-x-1/2";
  if (side === "center") return "left-1/2 -translate-x-1/2";
  return "right-0 translate-x-1/2";
}

/** Static serpentine track drawn once in the viewport (does not scroll). */
function buildFixedTrackPath(): string {
  const steps = 10;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = 48 + t * (VIEW_H - 96);
    const x = 500 + Math.sin(i * 1.05) * 210 + Math.cos(i * 0.45) * 36;
    points.push({ x, y });
  }

  let d = `M ${points[0]!.x.toFixed(1)} ${points[0]!.y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x.toFixed(1)} ${midY.toFixed(1)}, ${curr.x.toFixed(1)} ${midY.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export function LearningJourney({ stations }: LearningJourneyProps) {
  const trackPath = useMemo(() => buildFixedTrackPath(), []);
  const scrollHeight = useMemo(
    () => TOP_PAD + Math.max(1, stations.length) * GAP + BOTTOM_PAD,
    [stations.length],
  );

  return (
    <div className="learning-journey-viewport relative w-full" dir="ltr">
      {/* Fixed curved track — stays put while cards scroll past */}
      <div
        className="pointer-events-none fixed inset-x-0 top-[3.35rem] bottom-[4.75rem] z-0 flex justify-center"
        aria-hidden
      >
        <svg
          className="h-full w-full max-w-md opacity-90"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
        >
          <path
            d={trackPath}
            fill="none"
            stroke="var(--journey-path-color, #E8E0D4)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Scrolling compact lesson cards */}
      <div
        className="relative z-10 mx-auto w-full max-w-md"
        style={{ height: `${scrollHeight}px`, minHeight: `${scrollHeight}px` }}
      >
        {stations.map((station, index) => {
          const topPx = TOP_PAD + index * GAP;
          const isActive = station.status === "active";
          const isLocked = station.status === "locked";

          const card = (
            <div
              className={`w-full rounded-2xl border px-3 py-2.5 transition-transform duration-200 active:scale-[0.98] ${
                isActive
                  ? "border-apricot/45 bg-card shadow-sm shadow-orange-950/10"
                  : "border-card-border/80 bg-card/80 dark:bg-[#1F2E35]/70"
              } ${isLocked ? "opacity-75" : ""}`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <p
                  className={`text-[10px] font-extrabold tracking-[0.12em] ${
                    isActive ? "text-apricot-deep" : "text-slate-400"
                  }`}
                >
                  LESSON {String(station.number).padStart(2, "0")}
                </p>
                {isLocked ? (
                  <span className="text-[9px] font-bold text-slate-400">
                    قريبًا
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-0.5 text-[0.95rem] font-extrabold leading-snug ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {station.title}
              </p>
              <p
                className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400"
                dir="rtl"
              >
                {station.subtitle}
              </p>
              {isActive ? (
                <p className="mt-1 text-[11px] font-bold text-apricot-deep">
                  ابدأ ←
                </p>
              ) : null}
            </div>
          );

          return (
            <div
              key={station.id}
              className={`absolute z-10 w-[min(42%,9.75rem)] ${stationAlign(station.side)}`}
              style={{ top: topPx }}
            >
              <span
                className={`absolute top-1/2 z-20 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${nodeSideClass(
                  station.side,
                )} ${
                  isActive
                    ? "bg-apricot shadow-[0_0_0_3px_rgba(240,160,90,0.28)]"
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

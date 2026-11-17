"use client";

import Link from "next/link";

type LessonTopBarProps = {
  progress: number;
  /** Shown after the matching cards are finished. */
  showDictation?: boolean;
  dictationActive?: boolean;
  onStartDictation?: () => void;
};

export function LessonTopBar({
  progress,
  showDictation = false,
  dictationActive = false,
  onStartDictation,
}: LessonTopBarProps) {
  return (
    <div className="relative z-[20] shrink-0 px-4 pt-4">
      <div className="flex items-center gap-2 py-2" dir="rtl">
        <Link
          href="/"
          aria-label="رجوع"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-apricot-deep transition-transform active:scale-95 dark:text-apricot"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-progress-track">
          <div
            className="h-full rounded-full bg-apricot transition-all duration-300 ease-out dark:bg-[#58CC02]"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        {showDictation ? (
          <button
            type="button"
            onClick={onStartDictation}
            aria-label={dictationActive ? "رجوع من الإملاء" : "تدريب إملاء اختياري"}
            className={`flex h-12 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-extrabold transition-transform active:scale-95 ${
              dictationActive
                ? "border-apricot bg-apricot text-white"
                : "border-card-border bg-card text-apricot-deep dark:text-apricot"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 5h10v14H5zM15 8h4v11H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M8 9h4M8 13h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {dictationActive ? "رجوع" : "الإملاء"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);

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
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((value) => !value)}
            className={`flex h-11 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-extrabold transition-transform active:scale-95 ${
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
            الإملاء
          </button>
        ) : null}
      </div>

      {showDictation && open ? (
        <div
          dir="rtl"
          role="menu"
          className="absolute inset-x-4 top-[4.25rem] z-30 rounded-2xl border border-[#EDD9BC] bg-card p-3 text-right shadow-md dark:border-white/10"
        >
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            الإملاء
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">
            اختياري. اضغط الكلمة إذا تريد تتدرّب على كتابتها.
          </p>
          {dictationActive ? null : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onStartDictation?.();
              }}
              className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-apricot text-sm font-extrabold text-white transition-transform active:scale-95"
            >
              تدرّب على هذه الكلمة
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

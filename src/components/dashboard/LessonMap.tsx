"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

export function LessonMap({ lessons }: LessonMapProps) {
  return (
    <div
      className="lesson-roadmap relative mx-auto w-full max-w-md"
      dir="ltr"
    >
      {/* Soft curved guide line down the center */}
      <div
        className="pointer-events-none absolute top-6 bottom-8 left-1/2 w-10 -translate-x-1/2"
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

      <ol className="relative z-10 flex flex-col gap-5 py-1">
        {lessons.map((lesson, index) => {
          const leanLeft = index % 2 === 0;
          const label = `LESSON ${String(lesson.number).padStart(2, "0")}`;
          const isActive = lesson.unlocked;

          return (
            <motion.li
              key={lesson.id}
              className={`relative flex items-center ${
                leanLeft ? "justify-start pe-[18%]" : "justify-end ps-[18%]"
              }`}
              initial={{ opacity: 0.55, scale: 0.94, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ amount: 0.55, margin: "-8% 0px -8% 0px" }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Path node */}
              <span
                className={`absolute top-1/2 left-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
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
                  <div className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-card-border/70 bg-card/50 px-3 py-3 opacity-70 dark:bg-[#1F2E35]/50">
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
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

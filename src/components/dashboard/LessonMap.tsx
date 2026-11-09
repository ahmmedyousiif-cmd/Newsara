"use client";

import Link from "next/link";

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
    <ol className="relative flex flex-col" dir="ltr">
      {lessons.map((lesson, index) => {
        const isLast = index === lessons.length - 1;
        const label = `LESSON ${String(lesson.number).padStart(2, "0")}`;

        return (
          <li key={lesson.id} className="relative flex gap-4">
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={`z-10 mt-4 h-3.5 w-3.5 rounded-full ${
                  lesson.unlocked
                    ? "bg-apricot shadow-[0_0_0_4px_rgba(240,160,90,0.25)]"
                    : "border-2 border-[#D9D0C4] bg-[#F9F6EE] dark:border-[#37464F] dark:bg-[#1F2E35]"
                }`}
                aria-hidden
              />
              {!isLast ? (
                <span
                  className="mt-1 w-px min-h-12 flex-1 bg-[#E8E0D4] dark:bg-[#2E3E46]"
                  aria-hidden
                />
              ) : null}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-2" : "pb-3"}`}>
              {lesson.unlocked && lesson.href ? (
                <Link
                  href={lesson.href}
                  className="block rounded-2xl border border-apricot/40 bg-card p-4 shadow-md shadow-orange-950/5 transition-all duration-200 active:scale-[0.99]"
                >
                  <p className="text-[10px] font-extrabold tracking-[0.16em] text-apricot-deep">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-black dark:text-white">
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
                <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl px-1 py-3 opacity-65">
                  <div>
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
  );
}

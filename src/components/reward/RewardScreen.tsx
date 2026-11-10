"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { playCorrectClick } from "@/lib/sounds";
import {
  getPerformanceLevel,
  pickMotivationalTitle,
  pickPedagogicalNarrative,
} from "@/lib/rewardCopy";

export type RewardScreenProps = {
  unitLabel: string;
  lessonLabel: string;
  lessonName: string;
  schoolName: string;
  studentName: string;
  avatarUrl?: string;
  stats: {
    correctAnswers: number;
    totalQuestions: number;
    comboStreak: number;
    timeInSeconds: number;
    date: string;
  };
  onContinue: () => void;
};

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} دقيقة`;
}

const cardMotion = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.06 + i * 0.05,
      type: "spring" as const,
      stiffness: 400,
      damping: 26,
    },
  }),
};

export function RewardScreen({
  unitLabel,
  lessonLabel,
  lessonName,
  schoolName,
  studentName = "علي حسن",
  avatarUrl = "/anime-student.png",
  stats,
  onContinue,
}: RewardScreenProps) {
  const level = useMemo(
    () => getPerformanceLevel(stats.correctAnswers, stats.totalQuestions),
    [stats.correctAnswers, stats.totalQuestions],
  );

  const title = useMemo(() => pickMotivationalTitle(level), [level]);
  const narrative = useMemo(() => pickPedagogicalNarrative(level), [level]);

  const handleContinue = () => {
    playCorrectClick();
    onContinue();
  };

  return (
    <div
      dir="rtl"
      className="flex h-full min-h-0 w-full flex-col bg-cream-soft font-[family-name:var(--font-cairo-family),Cairo,sans-serif] select-none dark:bg-[#131F24]"
    >
      {/* Compact scroll region — full text visible, no bottom clip */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 pb-4">
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-wide text-apricot-deep dark:text-apricot">
              {unitLabel}
            </p>
            <p className="mt-0.5 text-xs font-extrabold text-slate-800 dark:text-slate-100">
              {lessonLabel} - {lessonName}
            </p>
          </div>

          <header className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 340, damping: 20 }}
              className="h-12 w-12 overflow-hidden rounded-full border border-black/5 bg-card dark:border-white/15 sm:h-14 sm:w-14"
            >
              <img
                src={avatarUrl}
                alt="Student Avatar"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <p className="mt-1 text-center text-[11px] font-medium text-slate-700 dark:text-slate-200">
              {schoolName}
            </p>
          </header>

          <section className="text-center">
            <h1 className="text-base font-extrabold leading-snug text-black dark:text-white sm:text-lg">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              أهلاً بك{" "}
              <span className="font-extrabold text-apricot-deep dark:text-apricot">
                {studentName}
              </span>
            </p>
          </section>

          <motion.div
            className="grid w-full grid-cols-2 gap-1.5"
            initial="hidden"
            animate="show"
          >
            <motion.div
              custom={0}
              variants={cardMotion}
              className="rounded-2xl border border-black/5 bg-[#FFFDF8] p-2.5 dark:border-white/10 dark:bg-[#1F2E35]"
            >
              <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-success/15 text-success">
                <CheckIcon />
              </div>
              <p className="text-[10px] font-medium text-slate-500">
                الإجابات الصحيحة
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-black dark:text-white">
                {stats.correctAnswers}/{stats.totalQuestions}
              </p>
            </motion.div>

            <motion.div
              custom={1}
              variants={cardMotion}
              className="rounded-2xl border border-black/5 bg-[#FFFDF8] p-2.5 dark:border-white/10 dark:bg-[#1F2E35]"
            >
              <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-apricot/20 text-apricot-deep">
                <FireIcon />
              </div>
              <p className="text-[10px] font-medium text-slate-500">
                إجابات متتالية
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-black dark:text-white">
                {stats.comboStreak} متتالية
              </p>
            </motion.div>

            <motion.div
              custom={2}
              variants={cardMotion}
              className="col-span-2 rounded-2xl border border-black/5 bg-[#FFFDF8] px-2.5 py-2 dark:border-white/10 dark:bg-[#1F2E35]"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber/20 text-amber">
                  <TimerIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-500">الزمن</p>
                  <p className="text-sm font-extrabold text-black dark:text-white">
                    {formatTime(stats.timeInSeconds)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={3}
              variants={cardMotion}
              className="col-span-2 rounded-2xl border border-black/5 bg-[#FFFDF8] px-2.5 py-2 dark:border-white/10 dark:bg-[#1F2E35]"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                  <CalendarIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-500">
                    التاريخ
                  </p>
                  <p className="break-words text-sm font-extrabold leading-snug text-black dark:text-white">
                    {stats.date}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Extra bottom padding so narrative is never clipped under the CTA */}
          <p className="px-1 pb-2 text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {narrative}
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-black/5 bg-cream-soft px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-[#131F24]">
        <button
          type="button"
          onClick={handleContinue}
          className="mx-auto flex min-h-11 w-full max-w-md items-center justify-center rounded-full bg-apricot text-sm font-extrabold text-white transition-transform duration-200 active:scale-95 dark:bg-apricot-deep"
        >
          متابعة
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.5 10.8 15 16 9.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c2 3 1 5 1 5s3-1 4 2c1.2 3.2-.4 7-5 8.5C7.4 19.9 5 17 5 13.5 5 10 8 8 9 6c0 0 1 2 3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 13V9M9 3h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3.5 10h17M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

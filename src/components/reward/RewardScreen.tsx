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
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.12 + i * 0.08,
      type: "spring" as const,
      stiffness: 380,
      damping: 24,
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
    // Haptic intent: navigator.vibrate?.(12)
    playCorrectClick();
    onContinue();
  };

  return (
    <div
      dir="rtl"
      className="flex h-[100dvh] w-full flex-col overflow-hidden bg-cream-soft px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-[family-name:var(--font-cairo-family),Cairo,sans-serif] select-none dark:bg-[#131F24]"
    >
      {/* Hierarchical lesson header */}
      <div className="mb-3 text-center">
        <p className="text-xs font-bold tracking-wide text-apricot-deep dark:text-apricot">
          {unitLabel}
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
          {lessonLabel} - {lessonName}
        </p>
      </div>

      {/* Avatar + school */}
      <header className="relative mb-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="h-24 w-24 overflow-hidden rounded-full border border-black/5 bg-card dark:border-white/15 sm:h-28 sm:w-28"
        >
          <img
            src={avatarUrl}
            alt="Student Avatar"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <p className="mt-2 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
          {schoolName}
        </p>
      </header>

      {/* Motivational hero */}
      <section className="mb-4 text-center">
        <h1 className="text-xl font-extrabold text-black dark:text-white sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          أهلاً بك{" "}
          <span className="font-extrabold text-apricot-deep dark:text-apricot">
            {studentName}
          </span>
        </p>
      </section>

      {/* Bento stats */}
      <motion.div
        className="mx-auto grid w-full max-w-md flex-1 grid-cols-2 content-start gap-2.5 overflow-hidden"
        initial="hidden"
        animate="show"
      >
        <motion.div
          custom={0}
          variants={cardMotion}
          className="rounded-3xl border border-black/5 bg-[#FFFDF8] p-3.5 dark:border-white/10 dark:bg-[#1F2E35]"
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckIcon />
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            الإجابات الصحيحة
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-black dark:text-white">
            {stats.correctAnswers}/{stats.totalQuestions}
          </p>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardMotion}
          className="rounded-3xl border border-black/5 bg-[#FFFDF8] p-3.5 dark:border-white/10 dark:bg-[#1F2E35]"
        >
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-apricot/20 text-apricot-deep">
            <FireIcon />
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            إجابات متتالية
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-black dark:text-white">
            {stats.comboStreak} متتالية
          </p>
        </motion.div>

        <motion.div
          custom={2}
          variants={cardMotion}
          className="col-span-2 rounded-3xl border border-black/5 bg-[#FFFDF8] px-4 py-3 dark:border-white/10 dark:bg-[#1F2E35]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber/20 text-amber">
              <TimerIcon />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">الزمن</p>
              <p className="text-lg font-extrabold text-black dark:text-white">
                {formatTime(stats.timeInSeconds)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={3}
          variants={cardMotion}
          className="col-span-2 rounded-3xl border border-black/5 bg-[#FFFDF8] px-4 py-3 dark:border-white/10 dark:bg-[#1F2E35]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-200">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">التاريخ</p>
              <p className="text-lg font-extrabold text-black dark:text-white">
                {stats.date}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Pedagogical narrative */}
      <p className="mx-auto mt-3 max-w-md truncate text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {narrative}
      </p>

      {/* Continue only */}
      <div className="mx-auto mt-3 w-full max-w-md">
        <button
          type="button"
          onClick={handleContinue}
          className="flex min-h-14 w-full items-center justify-center rounded-full bg-apricot text-base font-extrabold text-white transition-transform duration-200 active:scale-95 dark:bg-apricot-deep"
        >
          متابعة
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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

"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { playFinaleSound } from "@/lib/sounds";

type ExerciseCompletionCardProps = {
  lessonName: string;
  completed: number;
  total: number;
  correctAnswers: number;
  scoreOutOfTen: number;
  percent: number;
  date: string;
  onRetry: () => void;
  onHome: () => void;
};

export function ExerciseCompletionCard({
  lessonName,
  completed,
  total,
  correctAnswers,
  scoreOutOfTen,
  percent,
  date,
  onRetry,
  onHome,
}: ExerciseCompletionCardProps) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    playFinaleSound();
  }, []);

  const rows = [
    ["اسم الدرس", lessonName],
    ["الجمل المكتملة", `${completed} من ${total}`],
    ["الإجابات الصحيحة", String(correctAnswers)],
    ["النتيجة", `${scoreOutOfTen}/10`],
    ["النسبة", `${percent}%`],
    ["التاريخ", date],
  ];

  return (
    <div
      dir="rtl"
      data-review="done"
      className="stats-screen-lock mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col justify-center overflow-hidden overscroll-none bg-cream-soft px-4 py-3 touch-none select-none dark:bg-[#131F24]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="max-h-full overflow-hidden rounded-2xl border border-[#EDD9BC] bg-card px-4 py-4 shadow-md dark:border-white/10"
      >
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="text-center text-xl font-extrabold text-slate-900 dark:text-white"
        >
          أحسنت! اكتمل التمرين.
        </motion.p>
        <dl className="mt-3 space-y-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-cream-soft px-3 py-2.5 dark:bg-[#1A2C34]"
            >
              <dt className="text-sm font-bold text-slate-500">{label}</dt>
              <dd className="text-end text-base font-extrabold text-slate-900 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          data-review="retry"
          onClick={onRetry}
          className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-apricot text-base font-extrabold text-white transition-transform active:scale-95"
        >
          إعادة التمرين
        </button>
        <button
          type="button"
          onClick={onHome}
          className="mt-2 flex min-h-12 w-full items-center justify-center rounded-2xl text-sm font-extrabold text-apricot-deep active:scale-95 dark:text-apricot"
        >
          العودة للرئيسية
        </button>
      </motion.div>
    </div>
  );
}

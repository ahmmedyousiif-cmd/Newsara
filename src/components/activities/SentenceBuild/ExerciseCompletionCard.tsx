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
      className="mx-auto flex h-full min-h-full w-full max-w-md flex-col justify-center bg-cream-soft px-4 py-6 dark:bg-[#131F24]"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="rounded-2xl border border-[#EDD9BC] bg-card px-4 py-5 shadow-md dark:border-white/10"
      >
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="text-center text-2xl font-extrabold text-slate-900 dark:text-white"
        >
          أحسنت! اكتمل التمرين.
        </motion.p>
        <dl className="mt-5 space-y-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-cream-soft px-3 py-3 dark:bg-[#1A2C34]"
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
          className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-apricot text-base font-extrabold text-white transition-transform active:scale-95"
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

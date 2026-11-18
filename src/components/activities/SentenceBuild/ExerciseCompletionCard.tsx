"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { saveCompletionCardPng } from "@/lib/completionCardImage";
import { playFinaleSound } from "@/lib/sounds";

type ExerciseCompletionCardProps = {
  lessonName: string;
  completed: number;
  total: number;
  correctAnswers: number;
  scoreOutOfTen: number;
  percent: number;
  date: string;
  perfect: boolean;
  onRetry: () => void;
  onHome: () => void;
};

const PAPERS = [
  { left: "6%", top: "10%", rotate: -18, color: "#F0A05A", width: 18, height: 28, delay: 0.05 },
  { left: "18%", top: "6%", rotate: 16, color: "#F5C542", width: 14, height: 22, delay: 0.12 },
  { left: "78%", top: "8%", rotate: 22, color: "#E8893A", width: 16, height: 26, delay: 0.08 },
  { left: "88%", top: "16%", rotate: -14, color: "#3D9A6A", width: 12, height: 20, delay: 0.18 },
  { left: "8%", top: "78%", rotate: 12, color: "#E4A11B", width: 16, height: 24, delay: 0.16 },
  { left: "84%", top: "74%", rotate: -20, color: "#F0A05A", width: 20, height: 14, delay: 0.1 },
  { left: "22%", top: "86%", rotate: 8, color: "#EDD9BC", width: 12, height: 18, delay: 0.22 },
  { left: "70%", top: "84%", rotate: -10, color: "#F5C542", width: 14, height: 20, delay: 0.2 },
] as const;

export function ExerciseCompletionCard({
  lessonName,
  completed,
  total,
  correctAnswers,
  scoreOutOfTen,
  percent,
  date,
  perfect,
  onRetry,
  onHome,
}: ExerciseCompletionCardProps) {
  const playedRef = useRef(false);
  const [saving, setSaving] = useState(false);

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

  const saveCard = () => {
    if (saving) return;
    setSaving(true);
    void saveCompletionCardPng({
      lessonName,
      completed,
      total,
      correctAnswers,
      scoreOutOfTen,
      percent,
      date,
      perfect,
    }).finally(() => setSaving(false));
  };

  return (
    <div
      dir="rtl"
      data-review="done"
      className="stats-screen-lock relative mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col justify-center overflow-hidden overscroll-none bg-cream-soft px-4 py-3 touch-none select-none dark:bg-[#131F24]"
    >
      {perfect
        ? PAPERS.map((paper) => (
            <motion.span
              key={`${paper.left}-${paper.top}`}
              aria-hidden
              initial={{ opacity: 0, y: -36, rotate: paper.rotate - 12 }}
              animate={{ opacity: 1, y: 0, rotate: paper.rotate }}
              transition={{ duration: 0.7, delay: paper.delay, ease: "easeOut" }}
              className="pointer-events-none absolute rounded-sm shadow-sm"
              style={{
                left: paper.left,
                top: paper.top,
                width: paper.width,
                height: paper.height,
                backgroundColor: paper.color,
              }}
            />
          ))
        : null}

      <button
        type="button"
        aria-label="حفظ البطاقة"
        onClick={saveCard}
        disabled={saving}
        className="absolute top-3 start-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[#EDD9BC] bg-card text-apricot-deep shadow-sm transition-transform active:scale-95 disabled:opacity-70 dark:border-white/10 dark:bg-[#1F2E35] dark:text-apricot"
      >
        <SaveMark />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative z-10 max-h-full overflow-hidden rounded-2xl border border-[#EDD9BC] bg-card px-4 py-4 shadow-md dark:border-white/10"
      >
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="text-center text-xl font-extrabold text-slate-900 dark:text-white"
        >
          {perfect ? "أحسنت! بدون أخطاء." : "أحسنت! اكتمل التمرين."}
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

function SaveMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4.5h12a1 1 0 011 1V20l-7-3.2L5 20V5.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

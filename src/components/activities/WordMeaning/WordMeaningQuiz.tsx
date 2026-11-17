"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FeedbackSheet } from "@/components/activities/TranslateWord/FeedbackSheet";
import {
  playFinaleSound,
  playSuccessSound,
  playWrongSound,
} from "@/lib/sounds";
import { shuffleCards } from "@/types/matching";
import type { WordMeaningItem } from "@/types/meaning";
import type { InteractionState } from "@/types/translate";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";

type WordMeaningQuizProps = {
  instruction: string;
  item: WordMeaningItem;
  /** 0–100 overall lesson progress for the header. */
  progress: number;
  isFinalItem?: boolean;
  interactionLocked?: boolean;
  onResult?: (correct: boolean) => void;
  onContinue: () => void;
};

export function WordMeaningQuiz({
  instruction,
  item,
  progress,
  isFinalItem = false,
  interactionLocked = false,
  onResult,
  onContinue,
}: WordMeaningQuizProps) {
  const [interactionState, setInteractionState] =
    useState<InteractionState>("IDLE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scoredRef = useRef(false);

  const locked =
    interactionLocked ||
    interactionState === "VALIDATING" ||
    interactionState === "SUCCESS" ||
    interactionState === "ERROR";

  const options = useMemo(
    () => shuffleCards([...item.options]),
    [item],
  );

  useEffect(() => {
    scoredRef.current = false;
    setInteractionState("IDLE");
    setSelectedId(null);
  }, [item]);

  useEffect(() => {
    if (interactionLocked) return;
    const timer = window.setTimeout(() => {
      void PremiumTTSManager.playWord(item.promptEn);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [item.promptEn, interactionLocked]);

  const correctText =
    item.options.find((option) => option.id === item.correctId)?.text ??
    item.correctId;

  const canCheck = !locked && selectedId !== null;

  const handleCheck = () => {
    if (!canCheck || scoredRef.current) return;
    const correct = selectedId === item.correctId;
    scoredRef.current = true;
    if (correct) {
      if (isFinalItem) playFinaleSound();
      else playSuccessSound();
    } else {
      playWrongSound();
    }
    onResult?.(correct);
    setInteractionState(correct ? "SUCCESS" : "ERROR");
  };

  const handleContinue = () => {
    if (interactionState !== "SUCCESS" && interactionState !== "ERROR") return;
    onContinue();
  };

  const feedbackState =
    interactionState === "SUCCESS" || interactionState === "ERROR"
      ? interactionState
      : null;

  return (
    <div className="relative mx-auto flex h-full min-h-full w-full max-w-md flex-col overflow-hidden bg-cream-soft select-none dark:bg-[#131F24]">
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
        </div>
      </div>

      <div className="relative z-[10] flex min-h-0 flex-1 flex-col px-4 pb-4">
        <h2
          dir="rtl"
          className="mt-2 mb-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl"
        >
          {instruction}
        </h2>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-6 pt-2">
          <div className="flex flex-col items-center gap-3">
            <p
              dir="ltr"
              className="text-center text-5xl font-extrabold tracking-tight text-black dark:text-white"
            >
              {item.promptEn}
            </p>
            <button
              type="button"
              aria-label="استمع إلى الكلمة"
              onClick={() => {
                void PremiumTTSManager.playWord(item.promptEn);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-b-4 border-card-border bg-card text-apricot-deep transition-transform active:scale-95 dark:text-apricot"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 10v4h3l5 4V6L7 10H4z"
                  fill="currentColor"
                />
                <path
                  d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            dir="rtl"
            className="flex w-full max-w-sm flex-col gap-3"
            role="listbox"
            aria-label="اختر معنى الكلمة"
          >
            {options.map((option) => {
              const selected = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    setSelectedId((prev) =>
                      prev === option.id ? null : option.id,
                    );
                  }}
                  className={`flex min-h-14 w-full touch-manipulation items-center justify-center rounded-2xl border-2 border-b-4 px-4 text-2xl font-extrabold transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed ${
                    selected
                      ? "border-[#1CB0F6] bg-[#DDF4FF] text-black shadow-[0_0_0_2px_rgba(28,176,246,0.28)] dark:border-[#1CB0F6] dark:bg-[#1A3A4A] dark:text-white"
                      : "border-card-border bg-card text-black hover:border-apricot/60 dark:text-white dark:hover:bg-[#25373F]"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>

        {!feedbackState ? (
          <div className="relative z-[30] mt-auto shrink-0 pb-2 pt-3">
            <button
              type="button"
              disabled={!canCheck}
              onClick={handleCheck}
              className={`flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#58CC02] text-lg font-extrabold text-white transition-[opacity,transform,filter] duration-200 ease-out active:scale-[0.98] ${
                canCheck
                  ? "opacity-100 shadow-md shadow-green-900/15 hover:brightness-105"
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              تحقق
            </button>
          </div>
        ) : (
          <div className="min-h-24 shrink-0" aria-hidden />
        )}
      </div>

      {feedbackState ? (
        <FeedbackSheet
          state={feedbackState}
          correctAnswer={correctText}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}

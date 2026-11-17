"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackSheet } from "@/components/activities/TranslateWord/FeedbackSheet";
import {
  playFinaleSound,
  playSuccessSound,
  playWrongSound,
} from "@/lib/sounds";
import { gradeTypedAnswer } from "@/lib/typo";
import type { DictationItem } from "@/types/meaning";
import type { InteractionState } from "@/types/translate";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";
import { LessonTopBar } from "./LessonTopBar";

type DictationQuizProps = {
  item: DictationItem;
  progress: number;
  isFinalItem?: boolean;
  interactionLocked?: boolean;
  onResult?: (correct: boolean) => void;
  onContinue: () => void;
  onExit?: () => void;
};

export function DictationQuiz({
  item,
  progress,
  isFinalItem = false,
  interactionLocked = false,
  onResult,
  onContinue,
  onExit,
}: DictationQuizProps) {
  const [interactionState, setInteractionState] =
    useState<InteractionState>("IDLE");
  const [typed, setTyped] = useState("");
  const scoredRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const locked =
    interactionLocked ||
    interactionState === "VALIDATING" ||
    interactionState === "SUCCESS" ||
    interactionState === "TYPO" ||
    interactionState === "ERROR";

  useEffect(() => {
    scoredRef.current = false;
    setInteractionState("IDLE");
    setTyped("");
  }, [item]);

  useEffect(() => {
    if (locked) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, [item, locked]);

  const canCheck = !locked && typed.trim().length > 0;

  const handleCheck = () => {
    if (!canCheck || scoredRef.current) return;
    const grade = gradeTypedAnswer(typed, item.answerEn);
    const next: InteractionState =
      grade === "correct" ? "SUCCESS" : grade === "typo" ? "TYPO" : "ERROR";
    scoredRef.current = true;
    const correct = next === "SUCCESS" || next === "TYPO";
    void PremiumTTSManager.playWord(item.answerEn);
    if (correct) {
      if (isFinalItem) playFinaleSound();
      else playSuccessSound();
    } else {
      playWrongSound();
    }
    onResult?.(correct);
    setInteractionState(next);
  };

  const handleContinue = () => {
    if (
      interactionState !== "SUCCESS" &&
      interactionState !== "TYPO" &&
      interactionState !== "ERROR"
    ) {
      return;
    }
    onContinue();
  };

  const feedbackState =
    interactionState === "SUCCESS" ||
    interactionState === "TYPO" ||
    interactionState === "ERROR"
      ? interactionState
      : null;

  return (
    <div
      data-review-scope={item.id}
      data-review-locked={interactionLocked ? "1" : "0"}
      className="relative mx-auto flex h-full min-h-full w-full max-w-md flex-col overflow-hidden bg-cream-soft select-none dark:bg-[#131F24]"
    >
      <LessonTopBar
        progress={progress}
        showDictation
        dictationActive
        onStartDictation={onExit}
      />

      <div className="relative z-[10] flex min-h-0 flex-1 flex-col px-4 pb-4">
        <h2
          dir="rtl"
          className="mt-2 mb-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl"
        >
          الإملاء
        </h2>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-6 pt-4">
          <p
            dir="rtl"
            className="text-center text-2xl font-extrabold text-black dark:text-white"
          >
            {item.promptAr}
          </p>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={locked}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCheck();
            }}
            dir="ltr"
            placeholder="اكتب الترجمة"
            data-review="typed"
            data-review-answer={item.answerEn}
            aria-label="اكتب الترجمة بالإنجليزي"
            className="w-full max-w-sm touch-manipulation rounded-2xl border-2 border-b-4 border-card-border bg-card px-4 py-3.5 text-center text-2xl font-extrabold text-black outline-none placeholder:text-base placeholder:font-bold placeholder:text-slate-400 focus:border-[#1CB0F6] disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {!feedbackState ? (
          <div className="relative z-[30] mt-auto shrink-0 pb-2 pt-3">
            <button
              type="button"
              data-review="check"
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
          correctAnswer={item.answerEn}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedbackSheet } from "@/components/activities/TranslateWord/FeedbackSheet";
import {
  playFinaleSound,
  playSuccessSound,
  playWrongSound,
} from "@/lib/sounds";
import { gradeTypedAnswer } from "@/lib/typo";
import { takeRotatingDictation } from "@/lib/lessonRounds";
import { shuffleCards, type MatchingPair } from "@/types/matching";
import type { DictationItem, WordMeaningItem } from "@/types/meaning";
import type { InteractionState } from "@/types/translate";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";
import { DictationQuiz } from "./DictationQuiz";
import { LessonTopBar } from "./LessonTopBar";

type WordMeaningQuizProps = {
  instruction: string;
  item: WordMeaningItem;
  progress: number;
  isFinalItem?: boolean;
  interactionLocked?: boolean;
  pairs?: MatchingPair[];
  dictationStart?: number;
  onDictationStarted?: () => void;
  onResult?: (correct: boolean) => void;
  onContinue: () => void;
};

export function WordMeaningQuiz({
  instruction,
  item,
  progress,
  isFinalItem = false,
  interactionLocked = false,
  pairs = [],
  dictationStart = 0,
  onDictationStarted,
  onResult,
  onContinue,
}: WordMeaningQuizProps) {
  const [interactionState, setInteractionState] =
    useState<InteractionState>("IDLE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [dictationItems, setDictationItems] = useState<DictationItem[] | null>(
    null,
  );
  const [dictationIndex, setDictationIndex] = useState(0);
  const scoredRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const locked =
    interactionLocked ||
    interactionState === "VALIDATING" ||
    interactionState === "SUCCESS" ||
    interactionState === "TYPO" ||
    interactionState === "ERROR";

  const options = useMemo(() => {
    if (item.mode !== "choice") return [];
    return shuffleCards([...item.options]);
  }, [item]);

  useEffect(() => {
    scoredRef.current = false;
    setInteractionState("IDLE");
    setSelectedId(null);
    setTyped("");
    setDictationItems(null);
    setDictationIndex(0);
  }, [item]);

  useEffect(() => {
    if (interactionLocked) return;
    const timer = window.setTimeout(() => {
      void PremiumTTSManager.playWord(item.promptEn);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [item.promptEn, interactionLocked]);

  useEffect(() => {
    if (item.mode !== "type" || locked) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => window.clearTimeout(timer);
  }, [item, locked]);

  const correctText = item.mode === "choice"
    ? (item.options.find((option) => option.id === item.correctId)?.text ??
      item.correctId)
    : item.answerAr;

  const canCheck =
    !locked &&
    (item.mode === "choice" ? selectedId !== null : typed.trim().length > 0);

  const handleCheck = () => {
    if (!canCheck || scoredRef.current) return;
    let next: InteractionState = "ERROR";
    if (item.mode === "choice") {
      next = selectedId === item.correctId ? "SUCCESS" : "ERROR";
    } else {
      const grade = gradeTypedAnswer(typed, item.answerAr);
      next =
        grade === "correct" ? "SUCCESS" : grade === "typo" ? "TYPO" : "ERROR";
    }

    scoredRef.current = true;
    const correct = next === "SUCCESS" || next === "TYPO";
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

  const startDictation = () => {
    if (locked || dictationItems) return;
    const items = takeRotatingDictation(pairs, dictationStart, 5);
    if (items.length === 0) return;
    setDictationIndex(0);
    setDictationItems(items);
    onDictationStarted?.();
  };

  const closeDictation = () => {
    setDictationItems(null);
    setDictationIndex(0);
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
        showDictation={pairs.length > 0}
        onStartDictation={startDictation}
      />

      <div className="relative z-[10] flex min-h-0 flex-1 flex-col px-4 pb-4">
        <h2
          dir="rtl"
          className="mt-2 mb-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl"
        >
          {instruction}
        </h2>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-6 pt-2">
          <div dir="ltr" className="flex items-center justify-center gap-3">
            <button
              type="button"
              data-review="listen"
              data-review-listen={item.id}
              aria-label="استمع إلى الكلمة"
              onClick={() => {
                void PremiumTTSManager.playWord(item.promptEn);
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-apricot/45 transition-transform active:scale-95 dark:text-apricot/40"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" />
                <path
                  d="M16.5 8.5a5 5 0 010 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="text-center text-4xl font-extrabold tracking-tight text-black sm:text-5xl dark:text-white">
              {item.promptEn}
            </p>
          </div>
          {item.mode === "choice" && item.layout === "horizontal" ? (
            <div className="flex min-h-0 w-full max-w-sm flex-1 flex-col">
              <div
                dir="rtl"
                className="flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#EDD9BC] bg-card px-4 dark:border-white/15"
              >
                {selectedId ? (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setSelectedId(null);
                    }}
                    className="animate-word-rise text-2xl font-extrabold text-black active:scale-95 dark:text-white"
                  >
                    {options.find((option) => option.id === selectedId)?.text}
                  </button>
                ) : null}
              </div>
              <div
                dir="rtl"
                className="mt-6 flex w-full gap-3"
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
                      data-review="choice"
                      data-review-correct={option.id === item.correctId ? "1" : "0"}
                      aria-selected={selected}
                      disabled={locked || selected}
                      onClick={() => {
                        if (locked) return;
                        setSelectedId(option.id);
                      }}
                      className={`flex min-h-14 min-w-0 flex-1 touch-manipulation items-center justify-center rounded-2xl border-2 border-b-4 px-1 text-base font-extrabold leading-5 transition-[transform,background-color,border-color,opacity] duration-200 ease-out active:scale-95 disabled:cursor-not-allowed ${
                        selected
                          ? "border-dashed border-[#EDD9BC] bg-transparent text-transparent shadow-none dark:border-white/15"
                          : "border-card-border bg-card text-black dark:text-white"
                      }`}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : item.mode === "choice" ? (
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
                    data-review="choice"
                    data-review-correct={option.id === item.correctId ? "1" : "0"}
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
          ) : (
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              disabled={locked}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCheck();
              }}
              dir="rtl"
              placeholder="اكتب المعنى"
              data-review="typed"
              data-review-answer={item.answerAr}
              aria-label="اكتب معنى الكلمة بالعربية"
              className="w-full max-w-sm touch-manipulation rounded-2xl border-2 border-b-4 border-card-border bg-card px-4 py-3.5 text-center text-2xl font-extrabold text-black outline-none placeholder:text-base placeholder:font-bold placeholder:text-slate-400 focus:border-[#1CB0F6] disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500"
            />
          )}
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

      {dictationItems ? (
        <div className="absolute inset-0 z-50 bg-cream-soft dark:bg-[#131F24]">
          <DictationQuiz
            key={dictationItems[dictationIndex]!.id}
            item={dictationItems[dictationIndex]!}
            progress={progress}
            interactionLocked={interactionLocked}
            onExit={closeDictation}
            onContinue={() => {
              if (dictationIndex + 1 >= dictationItems.length) {
                closeDictation();
                return;
              }
              setDictationIndex((current) => current + 1);
            }}
          />
        </div>
      ) : null}

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

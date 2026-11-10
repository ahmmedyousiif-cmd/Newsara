"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LayoutGroup } from "framer-motion";
import { FeedbackSheet } from "./FeedbackSheet";
import { WordChip } from "./WordChip";
import {
  playFinaleSound,
  playSuccessSound,
  playWrongSound,
} from "@/lib/sounds";
import { gradeTypedAnswer, normalizeAnswer } from "@/lib/typo";
import { shuffleCards } from "@/types/matching";
import type {
  InteractionState,
  TranslateItem,
  TranslateWordBankItem,
} from "@/types/translate";

type BankWord = { id: string; text: string };

type TranslateWordQuizProps = {
  instruction: string;
  item: TranslateItem;
  /** 0–100 overall lesson progress for the header. */
  progress: number;
  /** Last question in the lesson — play finale tone instead of success. */
  isFinalItem?: boolean;
  interactionLocked?: boolean;
  onResult?: (correct: boolean) => void;
  onContinue: () => void;
};

function buildBank(item: TranslateWordBankItem): BankWord[] {
  return item.bank.map((text, i) => ({
    id: `${item.id}-w${i}-${text}`,
    text,
  }));
}

export function TranslateWordQuiz({
  instruction,
  item,
  progress,
  isFinalItem = false,
  interactionLocked = false,
  onResult,
  onContinue,
}: TranslateWordQuizProps) {
  const [interactionState, setInteractionState] =
    useState<InteractionState>("IDLE");
  const [typed, setTyped] = useState("");
  const [bankOrder, setBankOrder] = useState<BankWord[]>(() =>
    item.mode === "word-bank" ? shuffleCards(buildBank(item)) : [],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [verticalSelectedId, setVerticalSelectedId] = useState<string | null>(
    null,
  );
  /** Brief flash id for instant press confirmation on bank chips. */
  const [pressFlashId, setPressFlashId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scoredRef = useRef(false);
  const flashTimerRef = useRef<number | null>(null);

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
    setSelectedIds([]);
    setVerticalSelectedId(null);
    setPressFlashId(null);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    if (item.mode === "word-bank") {
      setBankOrder(shuffleCards(buildBank(item)));
    }
  }, [item]);

  useEffect(() => {
    if (item.mode !== "text-input" || locked) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [item, locked]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const selectedWords = useMemo(() => {
    if (item.mode !== "word-bank") return [];
    return selectedIds
      .map((id) => bankOrder.find((w) => w.id === id))
      .filter((w): w is BankWord => Boolean(w));
  }, [item.mode, selectedIds, bankOrder]);

  const verticalOptions = useMemo(() => {
    if (item.mode !== "vertical-choice") return [];
    return shuffleCards([...item.options]);
  }, [item]);

  const canCheck =
    !locked &&
    (item.mode === "text-input"
      ? typed.trim().length > 0
      : item.mode === "vertical-choice"
        ? verticalSelectedId !== null
        : selectedIds.length > 0);

  const correctDisplay =
    item.mode === "text-input"
      ? item.answer
      : item.mode === "vertical-choice"
        ? (item.options.find((o) => o.id === item.correctId)?.text ??
          item.correctId)
        : item.answerWords.join(" ");

  const flashPress = (id: string) => {
    setPressFlashId(id);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => {
      setPressFlashId(null);
      flashTimerRef.current = null;
    }, 120);
  };

  const handleSelectBankWord = (word: BankWord) => {
    if (locked) return;
    if (selectedIds[0] === word.id) return;
    flashPress(word.id);
    setSelectedIds([word.id]);
  };

  const handleDeselectBankWord = (word: BankWord) => {
    if (locked) return;
    flashPress(word.id);
    setSelectedIds((prev) => prev.filter((id) => id !== word.id));
  };

  const handleSelectVertical = (optionId: string) => {
    if (locked) return;
    // Tap again to clear; otherwise replace selection (single choice).
    // No tap tone — only success/error plays on check.
    setVerticalSelectedId((prev) => (prev === optionId ? null : optionId));
  };

  const handleCheck = () => {
    if (!canCheck || scoredRef.current) return;
    setInteractionState("VALIDATING");

    let next: InteractionState = "ERROR";
    if (item.mode === "text-input") {
      const grade = gradeTypedAnswer(
        typed,
        item.answer,
        item.acceptedAnswers,
      );
      next =
        grade === "correct" ? "SUCCESS" : grade === "typo" ? "TYPO" : "ERROR";
    } else if (item.mode === "vertical-choice") {
      next =
        verticalSelectedId === item.correctId ? "SUCCESS" : "ERROR";
    } else {
      const chosen = selectedWords.map((w) => normalizeAnswer(w.text));
      const expected = item.answerWords.map(normalizeAnswer);
      const ok =
        chosen.length === expected.length &&
        chosen.every((w, i) => w === expected[i]);
      next = ok ? "SUCCESS" : "ERROR";
    }

    scoredRef.current = true;
    if (next === "SUCCESS" || next === "TYPO") {
      // One tone only: finale on last question, otherwise single success file.
      if (isFinalItem) playFinaleSound();
      else playSuccessSound();
      onResult?.(true);
    } else {
      playWrongSound();
      onResult?.(false);
    }
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
    <div className="relative mx-auto flex h-full min-h-full w-full max-w-md flex-col overflow-hidden bg-cream-soft select-none dark:bg-[#131F24]">
      <div className="relative z-[20] shrink-0 px-4 pt-4">
        <div className="flex items-center gap-2 py-2" dir="rtl">
          <Link
            href="/"
            aria-label="رجوع"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-apricot-deep transition-transform active:scale-95 dark:text-apricot"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
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

        <LayoutGroup id={`quiz-${item.id}`}>
          <div
            className={`flex min-h-[28vh] flex-1 flex-col items-center gap-6 ${
              item.mode === "vertical-choice"
                ? "justify-start pt-2"
                : "justify-center"
            }`}
          >
            <p
              dir="rtl"
              className="text-center text-4xl font-extrabold text-black dark:text-white sm:text-5xl"
            >
              {item.promptAr}
            </p>

            {item.mode === "text-input" ? (
              <div className="relative w-full max-w-sm">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={locked}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheck();
                  }}
                  dir="ltr"
                  placeholder="Type in English…"
                  aria-label="اكتب الترجمة بالإنجليزي"
                  className="w-full touch-manipulation rounded-2xl border-2 border-b-4 border-card-border bg-card px-12 py-3.5 text-center text-xl font-extrabold text-black outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-base placeholder:font-bold placeholder:text-slate-400 focus:border-[#1CB0F6] focus:bg-[#DDF4FF]/40 focus:shadow-[0_0_0_3px_rgba(28,176,246,0.2)] disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#1A3A4A]/50"
                />
                {typed.trim().length > 0 && !locked ? (
                  <button
                    type="button"
                    aria-label="مسح الإجابة"
                    onClick={() => {
                      setTyped("");
                      inputRef.current?.focus();
                    }}
                    className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition-transform active:scale-95 hover:bg-cream-soft dark:hover:bg-[#25373F]"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>
            ) : null}

            {item.mode === "word-bank" ? (
              <div
                dir="ltr"
                aria-hidden={selectedWords.length === 0}
                className={`flex min-h-14 w-full max-w-sm flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-card-border bg-card/60 px-3 py-3 transition-opacity duration-200 ease-out ${
                  selectedWords.length === 0 ? "opacity-40" : "opacity-100"
                }`}
              >
                {selectedWords.map((word) => (
                  <WordChip
                    key={`slot-${word.id}`}
                    id={word.id}
                    text={word.text}
                    selected
                    disabled={locked}
                    onTap={() => handleDeselectBankWord(word)}
                  />
                ))}
              </div>
            ) : null}

            {item.mode === "vertical-choice" ? (
              <div
                dir="ltr"
                className="flex w-full max-w-sm flex-col gap-3 pt-2"
                role="listbox"
                aria-label="خيارات الإجابة"
              >
                {verticalOptions.map((opt) => {
                  const selected = verticalSelectedId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={locked}
                      onClick={() => handleSelectVertical(opt.id)}
                      className={`flex min-h-14 w-full touch-manipulation select-none items-center justify-center rounded-2xl border-2 border-b-4 px-4 text-lg font-extrabold transition-[transform,background-color,border-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed ${
                        selected
                          ? "border-[#1CB0F6] bg-[#DDF4FF] text-black shadow-[0_0_0_2px_rgba(28,176,246,0.28)] dark:border-[#1CB0F6] dark:bg-[#1A3A4A] dark:text-white"
                          : "border-card-border bg-card text-black hover:border-apricot/60 dark:text-white dark:hover:bg-[#25373F]"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {item.mode === "word-bank" ? (
            <div
              dir="ltr"
              className="mt-2 flex min-h-[22vh] flex-wrap content-start justify-center gap-2 py-3"
            >
              {bankOrder.map((word) => {
                const taken = selectedIds.includes(word.id);
                if (taken) {
                  return (
                    <WordChip
                      key={`ghost-${word.id}`}
                      id={word.id}
                      text={word.text}
                      ghost
                    />
                  );
                }
                return (
                  <WordChip
                    key={word.id}
                    id={word.id}
                    text={word.text}
                    selected={pressFlashId === word.id}
                    disabled={locked}
                    onTap={() => handleSelectBankWord(word)}
                  />
                );
              })}
            </div>
          ) : null}
        </LayoutGroup>

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
          correctAnswer={correctDisplay}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { playSuccessSound, playWrongSound } from "@/lib/sounds";
import { formatArabicDate } from "@/lib/rewardCopy";
import { normalizeAnswer } from "@/lib/typo";
import type { SentenceBuildActivity, SentenceBuildItem } from "@/types/sentenceBuild";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";
import { ExerciseCompletionCard } from "./ExerciseCompletionCard";

type Token = { id: string; text: string };

type PastSimpleExerciseProps = {
  activity: SentenceBuildActivity;
};

const chipMotion = {
  type: "spring" as const,
  stiffness: 520,
  damping: 34,
  mass: 0.65,
};

function tokensOf(item: SentenceBuildItem): Token[] {
  return item.bank.map((text, index) => ({
    id: `${item.id}-${index}`,
    text,
  }));
}

function spokenWord(text: string) {
  return text.replace(/[.,!?]/g, "").trim();
}

export function PastSimpleExercise({ activity }: PastSimpleExerciseProps) {
  const router = useRouter();
  const items = activity.items;
  const [index, setIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [date, setDate] = useState("");
  const firstMarkedRef = useRef(false);
  const lastCheckedRef = useRef("");
  const advanceTimer = useRef<number | null>(null);
  const speakTimer = useRef<number | null>(null);

  const item = items[index];
  const bank = useMemo(() => (item ? tokensOf(item) : []), [item]);
  const byId = useMemo(() => new Map(bank.map((token) => [token.id, token])), [bank]);
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((token): token is Token => Boolean(token));

  useEffect(() => {
    setDate(formatArabicDate());
  }, []);

  useEffect(() => {
    setSelectedIds([]);
    setShake(false);
    setSolved(false);
    setSpeaking(null);
    firstMarkedRef.current = false;
    lastCheckedRef.current = "";
    PremiumTTSManager.cancel();
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [item?.id]);

  const markSpeaking = (key: string) => {
    setSpeaking(key);
    if (speakTimer.current) window.clearTimeout(speakTimer.current);
    speakTimer.current = window.setTimeout(() => {
      setSpeaking((current) => (current === key ? null : current));
    }, 900);
  };

  const speak = (key: string, text: string) => {
    markSpeaking(key);
    void PremiumTTSManager.playWord(text);
  };

  const grade = (nextIds: string[]) => {
    if (!item || solved) return;
    const chosen = nextIds.map((id) => byId.get(id)?.text ?? "");
    const signature = chosen.join("|");
    if (chosen.length !== item.answer.length) return;
    if (signature === lastCheckedRef.current) return;
    lastCheckedRef.current = signature;

    const correct =
      chosen.length === item.answer.length &&
      chosen.every((word, i) => normalizeAnswer(word) === normalizeAnswer(item.answer[i] ?? ""));

    if (!firstMarkedRef.current) {
      firstMarkedRef.current = true;
      if (correct) setFirstTryCorrect((count) => count + 1);
    }

    if (!correct) {
      playWrongSound();
      setShake(true);
      window.setTimeout(() => setShake(false), 360);
      return;
    }

    setSolved(true);
    const isLast = index >= items.length - 1;
    if (!isLast) playSuccessSound();
    advanceTimer.current = window.setTimeout(() => {
      if (isLast) setDone(true);
      else setIndex((current) => current + 1);
    }, 620);
  };

  const addToken = (id: string) => {
    if (solved || selectedIds.includes(id)) return;
    const next = [...selectedIds, id];
    setSelectedIds(next);
    grade(next);
  };

  const removeToken = (id: string) => {
    if (solved) return;
    const next = selectedIds.filter((current) => current !== id);
    lastCheckedRef.current = "";
    setSelectedIds(next);
  };

  if (done) {
    const total = items.length;
    const percent = Math.round((firstTryCorrect / Math.max(1, total)) * 100);
    const scoreOutOfTen = firstTryCorrect === total ? 10 : Math.round((firstTryCorrect / total) * 10);
    return (
      <ExerciseCompletionCard
        lessonName={activity.lessonName}
        completed={total}
        total={total}
        correctAnswers={firstTryCorrect}
        scoreOutOfTen={scoreOutOfTen}
        percent={percent}
        date={date}
        onRetry={() => {
          setDone(false);
          setIndex(0);
          setFirstTryCorrect(0);
          setDate(formatArabicDate());
        }}
        onHome={() => router.push("/")}
      />
    );
  }

  if (!item) return null;

  return (
    <div className="mx-auto flex h-full min-h-full w-full max-w-md flex-col bg-cream-soft px-4 pt-4 pb-6 select-none dark:bg-[#131F24]">
      <div className="flex items-center gap-2" dir="rtl">
        <Link
          href="/"
          aria-label="رجوع"
          className="flex h-12 w-12 items-center justify-center rounded-xl text-apricot-deep active:scale-95 dark:text-apricot"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="flex-1 text-center text-sm font-extrabold text-slate-700 dark:text-slate-200">
          {`\u202A${index + 1} من ${items.length}\u202C`}
        </p>
        <span className="w-12" />
      </div>

      <div dir="ltr" className="mt-5 flex items-start justify-center gap-2">
        <p className="text-center text-xl font-extrabold leading-8 text-slate-900 dark:text-white">
          {item.prompt}{" "}
          <span className="text-base font-bold text-slate-500">({item.sentenceType})</span>
        </p>
        <button
          type="button"
          aria-label="استمع إلى الجملة"
          onClick={() => speak("sentence", item.spoken)}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-apricot-deep transition-transform active:scale-95 dark:text-apricot ${
            speaking === "sentence" ? "bg-apricot/20" : ""
          }`}
        >
          <SpeakerIcon />
        </button>
      </div>

      <LayoutGroup id={item.id}>
        <div
          dir="ltr"
          className={`mt-5 flex min-h-28 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed px-3 py-3 ${
            solved
              ? "border-[#3D9A6A] bg-[#3D9A6A]/10"
              : "border-[#EDD9BC] dark:border-white/15"
          } ${shake ? "animate-shake" : ""}`}
        >
          {selected.map((token) => (
            <WordTile
              key={token.id}
              token={token}
              speaking={false}
              inAnswer
              onSelect={() => removeToken(token.id)}
              onSpeak={() => {}}
            />
          ))}
        </div>

        <div dir="ltr" className="mt-auto flex flex-wrap gap-2 pt-8">
          {bank.map((token) => {
            const taken = selectedIds.includes(token.id);
            if (taken) {
              return (
                <span
                  key={token.id}
                  aria-hidden
                  className="inline-flex min-h-12 min-w-12 rounded-2xl border-2 border-transparent px-3 opacity-0"
                >
                  {token.text}
                </span>
              );
            }
            return (
              <WordTile
                key={token.id}
                token={token}
                speaking={speaking === token.id}
                onSelect={() => addToken(token.id)}
                onSpeak={() => speak(token.id, spokenWord(token.text))}
              />
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function WordTile({
  token,
  speaking,
  inAnswer = false,
  onSelect,
  onSpeak,
}: {
  token: Token;
  speaking: boolean;
  inAnswer?: boolean;
  onSelect: () => void;
  onSpeak: () => void;
}) {
  return (
    <motion.div
      layout
      layoutId={token.id}
      transition={chipMotion}
      className={`inline-flex items-stretch overflow-hidden rounded-2xl border-2 border-b-4 bg-card shadow-sm ${
        speaking
          ? "border-apricot"
          : "border-card-border"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        dir="ltr"
        className="min-h-12 touch-manipulation px-3 text-lg font-extrabold text-black active:scale-95 dark:text-white"
      >
        {token.text}
      </button>
      {inAnswer ? null : (
        <button
          type="button"
          aria-label={`استمع إلى ${spokenWord(token.text)}`}
          onClick={onSpeak}
          className="flex w-11 items-center justify-center border-s border-card-border text-apricot-deep active:scale-95 dark:text-apricot"
        >
          <SpeakerIcon />
        </button>
      )}
    </motion.div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

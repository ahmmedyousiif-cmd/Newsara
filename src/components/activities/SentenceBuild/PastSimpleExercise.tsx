"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { FeedbackSheet } from "@/components/activities/TranslateWord/FeedbackSheet";
import { playFinaleSound, playSuccessSound, playWrongSound } from "@/lib/sounds";
import { encouragementForStep, formatArabicDate } from "@/lib/rewardCopy";
import { normalizeAnswer } from "@/lib/typo";
import type { SentenceBuildActivity, SentenceBuildItem } from "@/types/sentenceBuild";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";
import { LessonTopBar } from "@/components/activities/WordMeaning/LessonTopBar";
import { ExerciseCompletionCard } from "./ExerciseCompletionCard";

type Token = { id: string; text: string };

type PastSimpleExerciseProps = {
  activity: SentenceBuildActivity;
};

const RISE_MS = 640;

const chipMotion = {
  layout: { duration: RISE_MS / 1000, ease: [0.22, 1, 0.36, 1] as const },
  backgroundColor: { duration: RISE_MS / 1000, ease: "easeOut" as const },
  borderColor: { duration: RISE_MS / 1000, ease: "easeOut" as const },
};

const chipColors = {
  light: {
    bank: "#fffdf8",
    bankBorder: "#edd9bc",
    placed: "#ffe0bc",
    placedBorder: "#e8893a",
  },
  dark: {
    bank: "#1f2e35",
    bankBorder: "#37464f",
    placed: "#4a3424",
    placedBorder: "#f0a05a",
  },
} as const;

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
  const [feedback, setFeedback] = useState<"SUCCESS" | "ERROR" | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [date, setDate] = useState("");
  const firstMarkedRef = useRef(false);
  const lastCheckedRef = useRef("");
  const speakTimer = useRef<number | null>(null);
  const successTimer = useRef<number | null>(null);
  const sentenceTimer = useRef<number | null>(null);
  const [dark, setDark] = useState(false);

  const item = items[index];
  const bank = useMemo(() => (item ? tokensOf(item) : []), [item]);
  const byId = useMemo(() => new Map(bank.map((token) => [token.id, token])), [bank]);
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((token): token is Token => Boolean(token));

  useEffect(() => {
    setDate(formatArabicDate());
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (successTimer.current) window.clearTimeout(successTimer.current);
    if (sentenceTimer.current) window.clearTimeout(sentenceTimer.current);
    setSelectedIds([]);
    setShake(false);
    setFeedback(null);
    setSpeaking(null);
    firstMarkedRef.current = false;
    lastCheckedRef.current = "";
    PremiumTTSManager.cancel();
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

  const speakSentenceAfter = (text: string, delay: number) => {
    if (sentenceTimer.current) window.clearTimeout(sentenceTimer.current);
    sentenceTimer.current = window.setTimeout(() => {
      speak("sentence", text);
    }, delay);
  };

  const grade = (nextIds: string[]) => {
    if (!item || feedback) return;
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

    const spoken = item.spoken;

    if (!correct) {
      if (successTimer.current) window.clearTimeout(successTimer.current);
      playWrongSound();
      setShake(true);
      setFeedback("ERROR");
      speakSentenceAfter(spoken, 480);
      window.setTimeout(() => setShake(false), 360);
      return;
    }

    if (successTimer.current) window.clearTimeout(successTimer.current);
    const step = index;
    const last = step >= items.length - 1;
    successTimer.current = window.setTimeout(() => {
      setFeedback("SUCCESS");
      if (last) playFinaleSound();
      else playSuccessSound();
      speakSentenceAfter(spoken, last ? 980 : 720);
    }, RISE_MS);
  };

  const continueAfterFeedback = () => {
    if (!feedback) return;
    if (index >= items.length - 1) setDone(true);
    else setIndex((current) => current + 1);
  };

  const addToken = (id: string) => {
    if (feedback || selectedIds.includes(id)) return;
    const next = [...selectedIds, id];
    setSelectedIds(next);
    grade(next);
  };

  const removeToken = (id: string) => {
    if (feedback) return;
    if (successTimer.current) window.clearTimeout(successTimer.current);
    const next = selectedIds.filter((current) => current !== id);
    lastCheckedRef.current = "";
    setSelectedIds(next);
  };

  const praise = encouragementForStep(index, items.length);
  const palette = dark ? chipColors.dark : chipColors.light;
  const stepById = useMemo(() => {
    const map = new Map<string, number>();
    if (!item) return map;
    const used = new Set<string>();
    item.answer.forEach((word, step) => {
      const token = bank.find(
        (entry) =>
          !used.has(entry.id) &&
          normalizeAnswer(entry.text) === normalizeAnswer(word),
      );
      if (!token) return;
      used.add(token.id);
      map.set(token.id, step);
    });
    return map;
  }, [bank, item]);

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
    <div className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-md flex-col overflow-hidden bg-cream-soft pb-6 select-none dark:bg-[#131F24]">
      <LessonTopBar
        progress={Math.round(((index + 1) / items.length) * 100)}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          data-review-scope={item.id}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <div
            dir="ltr"
            className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-[#EDD9BC] bg-[#FFFDF8] px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <button
              type="button"
              data-review="listen"
              data-review-listen={item.id}
              aria-label="استمع إلى الجملة"
              onClick={() => speak("sentence", item.spoken)}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-apricot-deep transition-transform active:scale-95 dark:text-apricot ${
                speaking === "sentence" ? "bg-apricot/20" : ""
              }`}
            >
              <SpeakerIcon large />
            </button>
            <p className="pt-2 text-left text-xl font-extrabold leading-8 text-slate-900 dark:text-white">
              {item.prompt}{" "}
              <span className="text-base font-bold text-slate-500">({item.sentenceType})</span>
            </p>
          </div>

          <LayoutGroup id={item.id}>
            <div
              dir="ltr"
              className={`mx-4 mt-4 flex min-h-28 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed px-3 py-3 ${
                feedback === "SUCCESS"
                  ? "border-[#3D9A6A] bg-[#3D9A6A]/10"
                  : "border-[#F0C48A] bg-[#FFF3E4] dark:border-apricot/40 dark:bg-apricot/10"
              } ${shake ? "animate-shake" : ""}`}
            >
              {selected.map((token) => (
                <WordTile
                  key={token.id}
                  token={token}
                  placed
                  reviewStep={stepById.get(token.id) ?? -1}
                  palette={palette}
                  speaking={speaking === token.id}
                  onSelect={() => {
                    speak(token.id, spokenWord(token.text));
                    removeToken(token.id);
                  }}
                />
              ))}
            </div>

            <div dir="ltr" className="mt-5 flex flex-wrap gap-2 px-4">
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
                    placed={false}
                    reviewStep={stepById.get(token.id) ?? -1}
                    palette={palette}
                    speaking={speaking === token.id}
                    onSelect={() => {
                      speak(token.id, spokenWord(token.text));
                      addToken(token.id);
                    }}
                  />
                );
              })}
            </div>
          </LayoutGroup>
        </motion.div>
      </AnimatePresence>
      {feedback ? (
        <FeedbackSheet
          state={feedback}
          correctAnswer={item.spoken}
          title={feedback === "SUCCESS" ? praise.title : undefined}
          subtitle={feedback === "SUCCESS" ? praise.subtitle : undefined}
          onContinue={continueAfterFeedback}
        />
      ) : null}
    </div>
  );
}

function WordTile({
  token,
  placed,
  reviewStep,
  palette,
  speaking,
  onSelect,
}: {
  token: Token;
  placed: boolean;
  reviewStep: number;
  palette: (typeof chipColors)[keyof typeof chipColors];
  speaking: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      data-review="token"
      data-review-step={reviewStep}
      data-review-bank={placed ? "0" : "1"}
      layout
      layoutId={token.id}
      transition={chipMotion}
      animate={{
        backgroundColor: placed ? palette.placed : palette.bank,
        borderColor: speaking ? "#f0a05a" : placed ? palette.placedBorder : palette.bankBorder,
      }}
      onClick={onSelect}
      dir="ltr"
      aria-label={token.text}
      className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-2xl border-2 border-b-4 px-4 text-lg font-extrabold text-black shadow-sm active:scale-95 dark:text-white"
    >
      {token.text}
    </motion.button>
  );
}

function SpeakerIcon({ large = false }: { large?: boolean }) {
  const size = large ? 30 : 16;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

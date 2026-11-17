"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchingPairsContainer } from "./MatchingPairsContainer";
import { WordMeaningQuiz } from "@/components/activities/WordMeaning/WordMeaningQuiz";
import { RewardScreen } from "@/components/reward/RewardScreen";
import {
  playCompleteSound,
  playContinueRoundSound,
  playFinaleSound,
  vibrateMatchingComplete,
} from "@/lib/sounds";
import { buildLessonRounds } from "@/lib/lessonRounds";
import { formatArabicDate } from "@/lib/rewardCopy";
import { getActivitySets, type MatchingActivity, type MatchingPair } from "@/types/matching";
import lessonsJson from "../../../../content/curriculum/lessons.json";

type MatchingActivityFlowProps = {
  activity: MatchingActivity;
};

const SLIDE_MS = 1100;

const lessonMeta = (() => {
  const data = lessonsJson as {
    unitTitle: string;
    lessons: Array<{
      number: number;
      title: string;
      titleAr: string;
      href: string | null;
      unlocked: boolean;
    }>;
  };
  const lesson = data.lessons.find((l) => l.number === 1) ?? data.lessons[0];
  const next = data.lessons.find((l) => l.number === (lesson?.number ?? 1) + 1);
  return {
    unitLabel: data.unitTitle,
    lessonLabel: lesson ? `Lesson ${lesson.number}` : "Lesson 1",
    lessonName: lesson?.titleAr ?? activityFallbackTitle(),
    nextHref: next?.unlocked && next.href ? next.href : null,
  };
})();

function activityFallbackTitle() {
  return "أهم المفردات";
}

export function MatchingActivityFlow({ activity }: MatchingActivityFlowProps) {
  const router = useRouter();
  const sets = useMemo(() => getActivitySets(activity), [activity]);
  const pairs = useMemo<MatchingPair[]>(
    () => sets.flatMap((set) => set.pairs),
    [sets],
  );
  const [roundSeed, setRoundSeed] = useState(1);
  const [dictationStart, setDictationStart] = useState(0);
  const rounds = useMemo(
    () => buildLessonRounds(pairs, roundSeed),
    [pairs, roundSeed],
  );
  const meaningItems = rounds.meaning;
  const meaningStart = sets.length;
  const rewardIndex = meaningStart + meaningItems.length;
  const totalPairs = pairs.length;
  const totalQuestions = totalPairs + meaningItems.length;

  const [boardSeed, setBoardSeed] = useState("board");
  const [stage, setStage] = useState<number[]>([0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outgoingExiting, setOutgoingExiting] = useState(false);
  const [incomingActive, setIncomingActive] = useState(false);
  const lockRef = useRef(false);
  const finalePlayedRef = useRef(false);

  const startedAtRef = useRef<number>(0);
  const [correctCount, setCorrectCount] = useState(0);
  /** Solved units across whole lesson: each matched pair + each quiz item. */
  const [completedUnits, setCompletedUnits] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const comboCurrentRef = useRef(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rewardDate, setRewardDate] = useState("");

  useEffect(() => {
    startedAtRef.current = Date.now();
    setBoardSeed(`${Date.now()}-${Math.random()}`);
    setRewardDate(formatArabicDate());
  }, []);

  const isTransitioning = stage.length > 1;
  const showingReward = currentIndex >= rewardIndex && !isTransitioning;

  const lessonProgress = useMemo(() => {
    const total = Math.max(1, totalQuestions);
    return Math.round(
      (Math.min(completedUnits, total) / total) * 100,
    );
  }, [completedUnits, totalQuestions]);

  const bumpCombo = useCallback(() => {
    comboCurrentRef.current += 1;
    setComboStreak((max) => Math.max(max, comboCurrentRef.current));
  }, []);

  const breakCombo = useCallback(() => {
    comboCurrentRef.current = 0;
  }, []);

  const handlePairMatched = useCallback(() => {
    setCorrectCount((n) => n + 1);
    setCompletedUnits((n) => n + 1);
    bumpCombo();
  }, [bumpCombo]);

  const handlePairMissed = useCallback(() => {
    breakCombo();
  }, [breakCombo]);

  const handleQuizResult = useCallback(
    (correct: boolean) => {
      setCompletedUnits((n) => n + 1);
      if (correct) {
        setCorrectCount((n) => n + 1);
        bumpCombo();
        // Finale already starts inside the quiz when isFinalItem.
        if (currentIndex === rewardIndex - 1) {
          finalePlayedRef.current = true;
        }
      } else {
        breakCombo();
      }
    },
    [bumpCombo, breakCombo, currentIndex, rewardIndex],
  );

  const slideTo = useCallback(
    (next: number, sound: "complete" | "continue" | "none" = "complete") => {
      if (lockRef.current) return;
      lockRef.current = true;

      setStage([currentIndex, next]);
      setOutgoingExiting(false);
      setIncomingActive(false);

      if (sound === "continue") playContinueRoundSound();
      else if (sound === "complete") playCompleteSound();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOutgoingExiting(true);
          setIncomingActive(true);
        });
      });

      window.setTimeout(() => {
        setCurrentIndex(next);
        setStage([next]);
        setOutgoingExiting(false);
        setIncomingActive(false);
        lockRef.current = false;
        if (next >= rewardIndex) {
          setElapsedSeconds(
            Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
          );
          setRewardDate(formatArabicDate());
          // Finale plays on last-question check (or continue if missed) — not after slide.
        }
      }, SLIDE_MS);
    },
    [currentIndex, rewardIndex],
  );

  const handleSetComplete = useCallback(() => {
    if (lockRef.current) return;

    const isLastMatching = currentIndex >= sets.length - 1;
    if (isLastMatching) {
      // Both matching boards done — haptic, then meaning / quiz / reward.
      vibrateMatchingComplete();
      const nextStage = meaningItems.length > 0 ? meaningStart : rewardIndex;
      slideTo(nextStage);
      return;
    }

    // Matching set 1 → set 2: motivational continue cue + haptic
    slideTo(currentIndex + 1, "continue");
  }, [
    currentIndex,
    meaningItems.length,
    meaningStart,
    rewardIndex,
    sets.length,
    slideTo,
  ]);

  const handleQuizContinue = useCallback(() => {
    if (lockRef.current) return;
    const next = currentIndex + 1;
    if (next >= rewardIndex) {
      // Last question was wrong (or tone missed) — start finale now, not after slide.
      if (!finalePlayedRef.current) {
        finalePlayedRef.current = true;
        playFinaleSound();
      }
      slideTo(rewardIndex, "none");
      return;
    }
    // Between quiz items: no extra chime (correct already played its one tone).
    slideTo(next, "none");
  }, [currentIndex, rewardIndex, slideTo]);

  const handleRetry = useCallback(() => {
    lockRef.current = false;
    finalePlayedRef.current = false;
    comboCurrentRef.current = 0;
    startedAtRef.current = Date.now();
    setCorrectCount(0);
    setCompletedUnits(0);
    setComboStreak(0);
    setElapsedSeconds(0);
    setRewardDate(formatArabicDate());
    setBoardSeed(`${Date.now()}-${Math.random()}`);
    setRoundSeed(Date.now());
    setDictationStart(0);
    setOutgoingExiting(false);
    setIncomingActive(false);
    setCurrentIndex(0);
    setStage([0]);
  }, []);

  const handleNextLesson = useCallback(() => {
    router.push(lessonMeta.nextHref ?? "/");
  }, [router]);

  if (!sets.length) {
    return (
      <div className="flex min-h-full items-center justify-center text-slate-500">
        لا توجد مجموعات
      </div>
    );
  }

  return (
    <div
      className={`groups-wrapper relative bg-cream-soft dark:bg-[#131F24] ${
        showingReward ? "stats-screen-lock" : ""
      }`}
    >
      {stage.map((index) => {
        const isReward = index >= rewardIndex;
        const isMeaning = !isReward && index >= meaningStart;
        const isOutgoing = index === currentIndex && isTransitioning;
        const isIncoming = index !== currentIndex && isTransitioning;
        const isSolo = !isTransitioning;

        let blockClass = "group-active";
        if (isReward) {
          blockClass = "stats-screen-lock";
        } else if (isOutgoing && outgoingExiting) blockClass = "group-exit-right";
        else if (isOutgoing && !outgoingExiting) blockClass = "group-active";
        else if (isIncoming && incomingActive) blockClass = "group-active";
        else if (isIncoming && !incomingActive) blockClass = "group-enter-left";
        else if (isSolo) blockClass = "group-active";

        const meaningItem = meaningItems[index - meaningStart];
        const blockKey = isReward
          ? "reward"
          : isMeaning
            ? `${meaningItem?.id ?? `meaning-${index}`}-${roundSeed}`
            : sets[index]?.id;

        return (
          <div
            key={blockKey}
            className={`group-block ${blockClass}`}
            style={{
              zIndex: isIncoming ? 3 : isOutgoing ? 1 : 2,
            }}
          >
            {isReward ? (
              <RewardScreen
                unitLabel={lessonMeta.unitLabel}
                lessonLabel={lessonMeta.lessonLabel}
                lessonName={lessonMeta.lessonName || activity.title}
                schoolName="مدرسة التفوق الأهلية"
                studentName="علي حسن"
                avatarUrl="/anime-student.png"
                stats={{
                  correctAnswers: correctCount,
                  totalQuestions,
                  comboStreak,
                  timeInSeconds: elapsedSeconds,
                  date: rewardDate,
                }}
                nextLessonReady={Boolean(lessonMeta.nextHref)}
                onRetry={handleRetry}
                onNextLesson={handleNextLesson}
              />
            ) : isMeaning && meaningItem ? (
              <WordMeaningQuiz
                key={`${meaningItem.id}-${roundSeed}`}
                instruction="ما معنى الكلمة"
                item={meaningItem}
                progress={lessonProgress}
                isFinalItem={index === rewardIndex - 1}
                pairs={pairs}
                dictationStart={dictationStart}
                onDictationStarted={() =>
                  setDictationStart((start) => start + 5)
                }
                interactionLocked={isTransitioning || showingReward}
                onResult={
                  index === currentIndex && !isTransitioning
                    ? handleQuizResult
                    : undefined
                }
                onContinue={
                  index === currentIndex && !isTransitioning
                    ? handleQuizContinue
                    : () => {}
                }
              />
            ) : (
              <MatchingPairsContainer
                key={`${sets[index]!.id}-${boardSeed}`}
                wordSet={sets[index]!}
                instruction={activity.instruction}
                isLastSet={index >= sets.length - 1}
                lessonProgress={lessonProgress}
                interactionLocked={isTransitioning || showingReward}
                onPairMatched={
                  index === currentIndex && !isTransitioning
                    ? handlePairMatched
                    : undefined
                }
                onPairMissed={
                  index === currentIndex && !isTransitioning
                    ? handlePairMissed
                    : undefined
                }
                onSetComplete={
                  index === currentIndex && !isTransitioning
                    ? handleSetComplete
                    : () => {}
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchingPairsContainer } from "./MatchingPairsContainer";
import { TranslateWordQuiz } from "@/components/activities/TranslateWord/TranslateWordQuiz";
import { RewardScreen } from "@/components/reward/RewardScreen";
import {
  playCompleteSound,
  playContinueRoundSound,
  playFinaleSound,
  vibrateMatchingComplete,
} from "@/lib/sounds";
import { formatArabicDate } from "@/lib/rewardCopy";
import { getActivitySets, type MatchingActivity } from "@/types/matching";
import type { TranslateActivity } from "@/types/translate";
import lessonsJson from "../../../../content/curriculum/lessons.json";
import translateJson from "../../../../content/activities/translate-vocab.json";

type MatchingActivityFlowProps = {
  activity: MatchingActivity;
};

const SLIDE_MS = 1100;
const translateActivity = translateJson as TranslateActivity;

const lessonMeta = (() => {
  const data = lessonsJson as {
    unitTitle: string;
    lessons: Array<{
      number: number;
      title: string;
      titleAr: string;
      href: string | null;
    }>;
  };
  const lesson = data.lessons.find((l) => l.number === 1) ?? data.lessons[0];
  return {
    unitLabel: data.unitTitle,
    lessonLabel: lesson ? `Lesson ${lesson.number}` : "Lesson 1",
    lessonName: lesson?.titleAr ?? activityFallbackTitle(),
  };
})();

function activityFallbackTitle() {
  return "أهم المفردات";
}

export function MatchingActivityFlow({ activity }: MatchingActivityFlowProps) {
  const router = useRouter();
  const sets = useMemo(() => getActivitySets(activity), [activity]);
  const quizItems = translateActivity.items;
  const quizStart = sets.length;
  const rewardIndex = quizStart + quizItems.length;
  const totalPairs = useMemo(
    () => sets.reduce((sum, set) => sum + set.pairs.length, 0),
    [sets],
  );
  const totalQuestions = totalPairs + quizItems.length;

  const [boardSeed, setBoardSeed] = useState("board");
  const [stage, setStage] = useState<number[]>([0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outgoingExiting, setOutgoingExiting] = useState(false);
  const [incomingActive, setIncomingActive] = useState(false);
  const lockRef = useRef(false);

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
      } else {
        breakCombo();
      }
    },
    [bumpCombo, breakCombo],
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
          playFinaleSound();
        }
      }, SLIDE_MS);
    },
    [currentIndex, rewardIndex],
  );

  const handleSetComplete = useCallback(() => {
    if (lockRef.current) return;

    const isLastMatching = currentIndex >= sets.length - 1;
    if (isLastMatching) {
      // Both matching boards done — haptic, then quiz / reward.
      vibrateMatchingComplete();
      slideTo(quizStart < rewardIndex ? quizStart : rewardIndex);
      return;
    }

    // Matching set 1 → set 2: motivational continue cue + haptic
    slideTo(currentIndex + 1, "continue");
  }, [currentIndex, sets.length, quizStart, rewardIndex, slideTo]);

  const handleQuizContinue = useCallback(() => {
    if (lockRef.current) return;
    const next = currentIndex + 1;
    slideTo(next >= rewardIndex ? rewardIndex : next);
  }, [currentIndex, rewardIndex, slideTo]);

  if (!sets.length) {
    return (
      <div className="flex min-h-full items-center justify-center text-slate-500">
        لا توجد مجموعات
      </div>
    );
  }

  return (
    <div className="groups-wrapper relative bg-cream-soft dark:bg-[#131F24]">
      {stage.map((index) => {
        const isReward = index >= rewardIndex;
        const isQuiz = !isReward && index >= quizStart;
        const isOutgoing = index === currentIndex && isTransitioning;
        const isIncoming = index !== currentIndex && isTransitioning;
        const isSolo = !isTransitioning;

        let blockClass = "group-active";
        if (isOutgoing && outgoingExiting) blockClass = "group-exit-right";
        else if (isOutgoing && !outgoingExiting) blockClass = "group-active";
        else if (isIncoming && incomingActive) blockClass = "group-active";
        else if (isIncoming && !incomingActive) blockClass = "group-enter-left";
        else if (isSolo) blockClass = "group-active";

        const quizItemIndex = index - quizStart;
        const quizItem = quizItems[quizItemIndex];
        const blockKey = isReward
          ? "reward"
          : isQuiz
            ? quizItem?.id ?? `quiz-${index}`
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
                onContinue={() => router.push("/")}
              />
            ) : isQuiz && quizItem ? (
              <TranslateWordQuiz
                key={quizItem.id}
                instruction={translateActivity.instruction}
                item={quizItem}
                progress={lessonProgress}
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

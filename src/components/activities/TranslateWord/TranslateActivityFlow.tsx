"use client";

import { useCallback, useState } from "react";
import { TranslateWordQuiz } from "./TranslateWordQuiz";
import { playFinaleSound } from "@/lib/sounds";
import type { TranslateActivity } from "@/types/translate";

type TranslateActivityFlowProps = {
  activity: TranslateActivity;
};

export function TranslateActivityFlow({ activity }: TranslateActivityFlowProps) {
  const [index, setIndex] = useState(0);
  const items = activity.items;
  const item = items[index];
  const progress = Math.round(((index + 1) / Math.max(1, items.length)) * 100);

  const handleContinue = useCallback(() => {
    const next = index + 1;
    if (next >= items.length) {
      playFinaleSound();
      return;
    }
    setIndex(next);
  }, [index, items.length]);

  if (!item) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-soft text-slate-500 dark:bg-[#131F24]">
        انتهى التمرين
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-cream-soft dark:bg-[#131F24]">
      <TranslateWordQuiz
        key={item.id}
        instruction={activity.instruction}
        item={item}
        progress={progress}
        onContinue={handleContinue}
      />
    </div>
  );
}

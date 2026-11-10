"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CardItem } from "./CardItem";
import {
  playCorrectMatchClick,
  playLuxuriousClick,
} from "@/lib/sounds";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";
import {
  dealMatchingColumns,
  flattenPairs,
  type MatchCard,
  type MatchingSet,
} from "@/types/matching";

type MatchingPairsContainerProps = {
  wordSet: MatchingSet;
  instruction: string;
  /** True when this is the final set in the activity. */
  isLastSet?: boolean;
  /** Blocks input during group slide transition. */
  interactionLocked?: boolean;
  /** Fired after the last pair of this set is solved (post-jump). */
  onSetComplete: () => void;
  /** Fired when a pair is matched successfully. */
  onPairMatched?: () => void;
  /** Fired when two cards mismatch (for combo tracking only). */
  onPairMissed?: () => void;
};

export function MatchingPairsContainer({
  wordSet,
  instruction,
  isLastSet = true,
  interactionLocked = false,
  onSetComplete,
  onPairMatched,
  onPairMissed,
}: MatchingPairsContainerProps) {
  const baseCards = useMemo(
    () => flattenPairs(wordSet.pairs),
    [wordSet.pairs],
  );

  const [deal, setDeal] = useState(() => dealMatchingColumns(wordSet.pairs));
  const enItems = deal.en;
  const arItems = deal.ar;
  const [selectedItem, setSelectedItem] = useState<MatchCard | null>(null);
  const [celebratingIds, setCelebratingIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const matchTimers = useRef<number[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setSelectedItem(null);
    setCelebratingIds([]);
    setMatchedIds([]);
    setErrorIds([]);
    setIsFinished(false);
    setDeal(dealMatchingColumns(wordSet.pairs));
  }, [wordSet.id, wordSet.pairs]);

  useEffect(() => {
    return () => {
      matchTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const progress = Math.round((matchedIds.length / baseCards.length) * 100);

  const handleCardClick = (item: MatchCard) => {
    if (interactionLocked) return;

    // Speak English word on tap (ElevenLabs if key exists, else browser voice).
    if (item.type === "en") {
      void PremiumTTSManager.playWord(item.text);
    }

    if (isFinished) return;
    if (matchedIds.includes(item.id)) return;
    if (celebratingIds.includes(item.id)) return;
    if (selectedItem?.id === item.id) return;
    if (errorIds.length) return;

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.type === item.type) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.pairId === item.pairId) {
      const pairIds = [selectedItem.id, item.id];
      const matchStep = matchedIds.length / 2 + 1;
      const totalPairs = baseCards.length / 2;
      const isLastPairOfSet = matchStep >= totalPairs;

      setSelectedItem(null);
      setCelebratingIds(pairIds);
      onPairMatched?.();

      // 1–4: ascending pops; final-set end audio handled by flow (finale / 3D)
      if (!isLastPairOfSet) {
        playCorrectMatchClick(Math.min(matchStep, 4));
      } else if (!isLastSet) {
        // mid-set last pair: transition music comes from flow
      }

      const t1 = window.setTimeout(() => {
        setCelebratingIds([]);
        setMatchedIds((prev) => {
          const next = [...prev, ...pairIds];
          if (next.length === baseCards.length && !completedRef.current) {
            completedRef.current = true;
            setIsFinished(true);
            window.setTimeout(() => onSetComplete(), 120);
          }
          return next;
        });
      }, 320);

      matchTimers.current.push(t1);
      return;
    }

    playLuxuriousClick();
    onPairMissed?.();
    setErrorIds([selectedItem.id, item.id]);
    window.setTimeout(() => {
      setErrorIds([]);
      setSelectedItem(null);
    }, 420);
  };

  return (
    <div className="relative mx-auto flex h-full min-h-full w-full max-w-md flex-col overflow-hidden bg-cream-soft px-4 pb-8 pt-4 select-none dark:bg-[#131F24]">
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
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2
        dir="rtl"
        className="mt-4 mb-5 text-center text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl"
      >
        {instruction}
      </h2>

      <div
        className="grid flex-1 grid-cols-2 content-start items-start gap-3 py-1"
        dir="ltr"
      >
        <div className="flex flex-col gap-2.5">
          {enItems.map((item) => (
            <CardItem
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              isError={errorIds.includes(item.id)}
              isCelebrating={celebratingIds.includes(item.id)}
              isMatched={matchedIds.includes(item.id)}
              onSelect={handleCardClick}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {arItems.map((item) => (
            <CardItem
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              isError={errorIds.includes(item.id)}
              isCelebrating={celebratingIds.includes(item.id)}
              isMatched={matchedIds.includes(item.id)}
              onSelect={handleCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

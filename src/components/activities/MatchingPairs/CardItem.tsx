"use client";

import type { MatchCard } from "@/types/matching";

type CardItemProps = {
  item: MatchCard;
  isSelected: boolean;
  isError: boolean;
  isCelebrating: boolean;
  isMatched: boolean;
  onSelect: (item: MatchCard) => void;
};

export function CardItem({
  item,
  isSelected,
  isError,
  isCelebrating,
  isMatched,
  onSelect,
}: CardItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      disabled={(isMatched && item.type === "ar") || isCelebrating}
      dir={item.type === "en" ? "ltr" : "rtl"}
      className={`flex min-h-16 w-full items-center justify-center rounded-2xl border-2 px-3 py-3.5 text-xl font-extrabold shadow-sm transition-all duration-200 sm:min-h-[4.5rem] sm:text-2xl ${
        isCelebrating
          ? "animate-match-jump border-[#58CC02] bg-[#58CC02]/25 text-[#2f7a52] dark:text-[#58CC02]"
          : isMatched
            ? "cursor-default border-card-border bg-card text-muted opacity-40"
            : isError
              ? "animate-shake border-error bg-error/10 text-error"
              : isSelected
                ? "border-[#1CB0F6] bg-[#1CB0F6]/15 text-[#1CB0F6] shadow-md"
                : "border-card-border border-b-4 bg-card text-black hover:border-apricot/60 active:scale-95 dark:text-white dark:hover:bg-[#25373F]"
      }`}
    >
      {item.text}
    </button>
  );
}

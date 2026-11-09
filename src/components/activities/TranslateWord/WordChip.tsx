"use client";

import { motion } from "framer-motion";

type WordChipProps = {
  id: string;
  text: string;
  disabled?: boolean;
  ghost?: boolean;
  /** Instant visual confirmation that this chip is part of the answer. */
  selected?: boolean;
  onTap?: () => void;
};

export function WordChip({
  id,
  text,
  disabled = false,
  ghost = false,
  selected = false,
  onTap,
}: WordChipProps) {
  if (ghost) {
    return (
      <div
        aria-hidden
        className="pointer-events-none inline-flex min-h-12 items-center rounded-2xl border-2 border-transparent px-4 py-2 text-lg font-extrabold opacity-0"
      >
        {text}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      layoutId={`chip-${id}`}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      disabled={disabled}
      onClick={onTap}
      onPointerDown={(e) => {
        // Keep hit-testing on this chip; avoid scroll/gesture steal on mobile.
        if (e.pointerType === "touch") e.currentTarget.setPointerCapture(e.pointerId);
      }}
      dir="ltr"
      aria-pressed={selected}
      className={`inline-flex min-h-12 min-w-[3rem] touch-manipulation select-none items-center justify-center rounded-2xl border-2 border-b-4 px-4 py-2 text-lg font-extrabold shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-75 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-[#1CB0F6] bg-[#DDF4FF] text-black shadow-[0_0_0_2px_rgba(28,176,246,0.28)] dark:border-[#1CB0F6] dark:bg-[#1A3A4A] dark:text-white"
          : "border-card-border bg-card text-black dark:text-white dark:hover:bg-[#25373F]"
      } ${disabled || selected ? "" : "hover:border-apricot/60"}`}
    >
      {text}
    </motion.button>
  );
}

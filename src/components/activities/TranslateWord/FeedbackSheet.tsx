"use client";

import type { InteractionState } from "@/types/translate";

type FeedbackSheetProps = {
  state: Extract<InteractionState, "SUCCESS" | "TYPO" | "ERROR">;
  correctAnswer: string;
  onContinue: () => void;
};

const COPY = {
  SUCCESS: {
    title: "أحسنت!",
    subtitle: "إجابة رائعة، تابع!",
    sheet: "bg-[#58CC02]",
    button: "bg-white text-[#58CC02]",
  },
  TYPO: {
    title: "أنت قريب من الإجابة الصحيحة",
    subtitle: null as string | null,
    sheet: "bg-[#58CC02]",
    button: "bg-white text-[#58CC02]",
  },
  ERROR: {
    title: "إجابة خاطئة",
    subtitle: null as string | null,
    sheet: "bg-[#FF4B4B]",
    button: "bg-white text-[#E03E3E]",
  },
} as const;

export function FeedbackSheet({
  state,
  correctAnswer,
  onContinue,
}: FeedbackSheetProps) {
  const copy = COPY[state];

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex flex-col justify-end"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto animate-slide-up rounded-t-3xl px-5 pb-6 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] will-change-transform ${copy.sheet}`}
      >
        <p dir="rtl" className="text-xl font-extrabold text-white sm:text-2xl">
          {copy.title}
        </p>

        {state === "SUCCESS" && copy.subtitle ? (
          <p dir="rtl" className="mt-1 text-base font-semibold text-white/90">
            {copy.subtitle}
          </p>
        ) : null}

        {/* Near miss: auto-reveal the correct spelling, then continue. */}
        {state === "TYPO" ? (
          <p dir="rtl" className="mt-2 text-base font-bold text-white/95">
            الإجابة الصحيحة:{" "}
            <span dir="ltr" className="inline-block underline decoration-2">
              {correctAnswer}
            </span>
          </p>
        ) : null}

        {/* Far wrong: message only — no auto-solve. */}

        <button
          type="button"
          onClick={onContinue}
          className={`mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-extrabold shadow-md transition-transform duration-200 active:scale-[0.98] ${copy.button}`}
        >
          المتابعة
        </button>
      </div>
    </div>
  );
}

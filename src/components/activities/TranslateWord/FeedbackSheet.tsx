"use client";

import type { InteractionState } from "@/types/translate";

type FeedbackSheetProps = {
  state: Extract<InteractionState, "SUCCESS" | "TYPO" | "ERROR">;
  correctAnswer: string;
  onContinue: () => void;
  onRetry?: () => void;
  translation?: string;
  title?: string;
  subtitle?: string | null;
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
  onRetry,
  translation,
  title,
  subtitle,
}: FeedbackSheetProps) {
  const copy = COPY[state];
  const heading = title ?? copy.title;
  const detail = subtitle !== undefined ? subtitle : copy.subtitle;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex flex-col justify-end"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto animate-slide-up rounded-t-3xl px-5 pb-6 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] will-change-transform ${copy.sheet}`}
      >
        <p dir="rtl" className="text-xl font-extrabold text-white sm:text-2xl">
          {heading}
        </p>

        {state === "SUCCESS" && detail ? (
          <p dir="rtl" className="mt-1 text-base font-semibold text-white/90">
            {detail}
          </p>
        ) : null}

        {state === "SUCCESS" && translation ? (
          <p dir="rtl" className="mt-2 text-lg font-extrabold leading-8 text-white">
            {translation}
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

        {state === "ERROR" && onRetry ? (
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              data-review="retry-item"
              onClick={onRetry}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-white/80 text-lg font-extrabold text-white transition-transform duration-200 active:scale-[0.98]"
            >
              إعادة السؤال
            </button>
            <button
              type="button"
              data-review="continue"
              onClick={onContinue}
              className={`flex min-h-12 w-full items-center justify-center rounded-2xl text-lg font-extrabold shadow-md transition-transform duration-200 active:scale-[0.98] ${copy.button}`}
            >
              المتابعة
            </button>
          </div>
        ) : (
          <button
            type="button"
            data-review="continue"
            onClick={onContinue}
            className={`mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-extrabold shadow-md transition-transform duration-200 active:scale-[0.98] ${copy.button}`}
          >
            المتابعة
          </button>
        )}
      </div>
    </div>
  );
}

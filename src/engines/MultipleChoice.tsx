"use client";

import { useState } from "react";
import type { MultipleChoiceItem } from "@/types/exercise";

type MultipleChoiceProps = {
  item: MultipleChoiceItem;
  onResult?: (correct: boolean) => void;
  /** `session`: after check, primary CTA is «التالي». `retry`: endless practice retry. */
  mode?: "retry" | "session";
  onNext?: () => void;
};

export function MultipleChoice({
  item,
  onResult,
  mode = "retry",
  onNext,
}: MultipleChoiceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (id: string) => {
    if (isSubmitted) return;
    setSelectedId(id);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    const correct = selectedId === item.correctId;
    setIsCorrect(correct);
    setIsSubmitted(true);
    onResult?.(correct);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setSelectedId(null);
    setIsCorrect(false);
  };

  return (
    <div>
      <div className="mb-6 text-xs leading-relaxed rounded-2xl border border-[#EBE4DA] bg-white p-3.5 text-slate-600 shadow-sm">
        <strong className="text-slate-800">القاعدة:</strong> {item.grammarRule}
      </div>

      <div className="mb-6">
        <h2
          className="mb-2 text-xl font-extrabold tracking-tight text-slate-900"
          dir="ltr"
        >
          {item.prompt}
        </h2>
        <p className="text-sm font-medium text-slate-500">{item.arabicHint}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3">
        {item.options.map((opt) => {
          let stateStyles =
            "bg-white border-[#EBE4DA] text-slate-700 hover:border-purple-300 hover:bg-purple-50/20";

          if (selectedId === opt.id) {
            stateStyles =
              "bg-purple-50/90 border-purple-500 text-purple-950 shadow-sm ring-2 ring-purple-400/20 font-bold";
          }

          if (isSubmitted) {
            if (opt.id === item.correctId) {
              stateStyles =
                "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/20 font-bold";
            } else if (selectedId === opt.id) {
              stateStyles =
                "bg-rose-50 border-rose-400 text-rose-950 animate-[shake_0.35s_ease-out]";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              disabled={isSubmitted}
              className={`flex w-full min-h-12 items-center justify-between rounded-2xl border-2 px-5 py-4 text-base transition-all duration-200 active:scale-[0.98] ${stateStyles}`}
              dir="ltr"
            >
              <span>{opt.text}</span>
              {isSubmitted && opt.id === item.correctId && (
                <span className="text-xs font-extrabold text-emerald-600">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!selectedId}
          className={`w-full min-h-12 rounded-2xl py-4 text-base font-bold text-white shadow-lg transition-all duration-200 ${
            selectedId
              ? "bg-lavender shadow-purple-600/25 hover:bg-lavender-light active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          تحقق من الإجابة
        </button>
      ) : (
        <div
          className={`rounded-2xl border p-5 transition-all ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
              : "border-amber-200 bg-amber-50/90 text-amber-950"
          }`}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <p className="text-sm font-extrabold">
              {isCorrect ? "أحسنت!" : "توضيح"}
            </p>
          </div>
          <p className="mb-4 text-xs leading-relaxed opacity-90">
            {item.explanation}
          </p>

          {mode === "session" ? (
            <button
              type="button"
              onClick={onNext}
              className="w-full min-h-12 rounded-xl bg-lavender py-3 text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all duration-200 hover:bg-lavender-light active:scale-[0.99]"
            >
              التالي
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="w-full min-h-12 rounded-xl border border-black/5 bg-white/80 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-white"
            >
              إعادة التمرين ⟳
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { playSuccessSound, playWrongSound } from "@/lib/sounds";
import { gradeTypedAnswer } from "@/lib/typo";

type OptionalDictationSheetProps = {
  promptAr: string;
  answerEn: string;
  onClose: () => void;
};

export function OptionalDictationSheet({
  promptAr,
  answerEn,
  onClose,
}: OptionalDictationSheetProps) {
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<"idle" | "ok" | "wrong">("idle");

  useEffect(() => {
    setTyped("");
    setResult("idle");
  }, [promptAr, answerEn]);

  const finished = result !== "idle";

  const handleCheck = () => {
    if (finished || typed.trim().length === 0) return;
    const grade = gradeTypedAnswer(typed, answerEn);
    if (grade === "correct" || grade === "typo") {
      playSuccessSound();
      setResult("ok");
      return;
    }
    playWrongSound();
    setResult("wrong");
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/35">
      <div
        dir="rtl"
        className="w-full rounded-t-3xl border-t border-[#EDD9BC] bg-card px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-md dark:border-white/10"
      >
        <p className="text-center text-sm font-extrabold text-apricot-deep dark:text-apricot">
          إملاء اختياري
        </p>
        <p className="mt-3 text-center text-4xl font-extrabold text-black dark:text-white">
          {promptAr}
        </p>
        <p className="mt-1 text-center text-sm font-bold text-slate-500">
          اكتب الترجمة بالإنجليزي
        </p>

        {finished ? (
          <p
            className={`mt-4 text-center text-lg font-extrabold ${
              result === "ok" ? "text-[#3D9A6A]" : "text-[#E07A5F]"
            }`}
          >
            {result === "ok" ? "أحسنت" : answerEn}
          </p>
        ) : (
          <input
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCheck();
            }}
            dir="ltr"
            placeholder="اكتب الترجمة"
            aria-label="اكتب الترجمة بالإنجليزي"
            className="mt-4 w-full rounded-2xl border-2 border-b-4 border-card-border bg-cream-soft px-4 py-3 text-center text-2xl font-extrabold text-black outline-none placeholder:text-base placeholder:font-bold placeholder:text-slate-400 focus:border-[#1CB0F6] dark:bg-[#131F24] dark:text-white"
          />
        )}

        <div className="mt-4 flex flex-col gap-2">
          {finished ? null : (
            <button
              type="button"
              disabled={typed.trim().length === 0}
              onClick={handleCheck}
              className={`flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#58CC02] text-base font-extrabold text-white active:scale-[0.98] ${
                typed.trim().length === 0 ? "opacity-40" : ""
              }`}
            >
              تحقق
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-[#EDD9BC] text-base font-extrabold text-slate-800 active:scale-[0.98] dark:border-white/15 dark:text-white"
          >
            رجوع للسؤال
          </button>
        </div>
      </div>
    </div>
  );
}

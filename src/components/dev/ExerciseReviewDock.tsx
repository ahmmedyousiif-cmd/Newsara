"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PremiumTTSManager } from "@/utils/PremiumTTSManager";

const AUTOSTART_KEY = "nl-review-autostart";

type Phase = "idle" | "running" | "paused" | "done";
type Speed = 1 | 2 | 3;

function reviewEnabled() {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production") return true;
  return new URLSearchParams(window.location.search).get("review") === "1";
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function isShown(el: HTMLElement) {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity) < 0.05) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 4 && rect.height > 4;
}

function isLocked(el: HTMLElement) {
  return Boolean(el.closest('[data-review-locked="1"]'));
}

function nodes(role: string) {
  return [...document.querySelectorAll<HTMLElement>(`[data-review="${role}"]`)].filter(
    (el) => isShown(el) && !isLocked(el),
  );
}

function usable(el: HTMLElement) {
  if (el.getAttribute("data-review-matched") === "1") return false;
  if (el.getAttribute("data-review-busy") === "1") return false;
  if (el instanceof HTMLButtonElement && el.disabled) return false;
  if (el instanceof HTMLInputElement && el.disabled) return false;
  return true;
}

function fillInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function waitForAudio(signal: AbortSignal) {
  await sleep(160, signal);
  const started = Date.now();
  while (!PremiumTTSManager.isBusy() && Date.now() - started < 1000) {
    await sleep(80, signal);
  }
  const cap = Date.now() + 8000;
  while (PremiumTTSManager.isBusy() && Date.now() < cap) {
    await sleep(90, signal);
  }
}

function swappedSteps(steps: number[], tokens: HTMLElement[]) {
  if (steps.length < 2) return null;
  const textAt = (step: number) =>
    tokens.find((token) => Number(token.dataset.reviewStep) === step)?.textContent?.trim() ?? "";
  for (let i = steps.length - 1; i > 0; i -= 1) {
    const left = steps[i - 1]!;
    const right = steps[i]!;
    if (textAt(left) && textAt(left) !== textAt(right)) {
      const next = [...steps];
      next[i - 1] = right;
      next[i] = left;
      return next;
    }
  }
  return null;
}

export function ExerciseReviewDock() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [open, setOpen] = useState(false);
  const speedRef = useRef<Speed>(1);
  const phaseRef = useRef<Phase>("idle");
  const pauseRef = useRef<(() => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(reviewEnabled());
  }, []);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!enabled || !mounted) return;
    if (window.sessionStorage.getItem(AUTOSTART_KEY) !== "1") return;
    window.sessionStorage.removeItem(AUTOSTART_KEY);
    const timer = window.setTimeout(() => startRef.current(), 700);
    return () => window.clearTimeout(timer);
  }, [enabled, mounted]);

  const pace = (ms: number) => Math.max(180, Math.round(ms / speedRef.current));

  const waitPause = async (signal: AbortSignal) => {
    while (phaseRef.current === "paused") {
      await new Promise<void>((resolve) => {
        pauseRef.current = resolve;
      });
      if (signal.aborted) throw new DOMException("aborted", "AbortError");
    }
  };

  const run = async (signal: AbortSignal) => {
    const heard = new Set<string>();
    let mistakePending = true;
    let tokenScope = "";
    let tokenPlan: number[] | null = null;
    let idle = 0;

    const click = (el: HTMLElement) => {
      el.click();
    };

    while (!signal.aborted) {
      await waitPause(signal);
      if (nodes("done").length > 0) {
        phaseRef.current = "done";
        setPhase("done");
        setOpen(true);
        return;
      }

      const continueButton = nodes("continue").find(usable);
      if (continueButton) {
        await sleep(pace(880), signal);
        await waitPause(signal);
        click(continueButton);
        tokenPlan = null;
        await sleep(pace(420), signal);
        idle = 0;
        continue;
      }

      const listen = nodes("listen").find((button) => {
        if (!usable(button)) return false;
        const key = button.dataset.reviewListen || button.getAttribute("aria-label") || "listen";
        return !heard.has(key);
      });
      if (listen) {
        const key = listen.dataset.reviewListen || listen.getAttribute("aria-label") || "listen";
        heard.add(key);
        click(listen);
        await waitForAudio(signal);
        idle = 0;
        continue;
      }

      const bank = nodes("token").filter(
        (token) => usable(token) && token.dataset.reviewBank === "1" && Number(token.dataset.reviewStep) >= 0,
      );
      if (bank.length > 0) {
        const scope = bank[0]?.closest("[data-review-scope]")?.getAttribute("data-review-scope") ?? "tokens";
        if (scope !== tokenScope || !tokenPlan) {
          tokenScope = scope;
          const steps = [...new Set(bank.map((token) => Number(token.dataset.reviewStep)))].sort((a, b) => a - b);
          const wrong = mistakePending ? swappedSteps(steps, bank) : null;
          if (wrong) mistakePending = false;
          tokenPlan = wrong ?? steps;
        }
        const nextStep = tokenPlan[0];
        const token = bank.find((item) => Number(item.dataset.reviewStep) === nextStep);
        if (token && nextStep !== undefined) {
          click(token);
          tokenPlan = tokenPlan.slice(1);
          if (tokenPlan.length === 0) tokenPlan = null;
          await Promise.all([waitForAudio(signal), sleep(pace(680), signal)]);
          idle = 0;
          continue;
        }
        tokenPlan = null;
      }

      const busyMatch = nodes("match").some((card) => card.dataset.reviewBusy === "1");
      const matches = nodes("match").filter(
        (card) => usable(card) && card.dataset.reviewMatched !== "1",
      );
      if (busyMatch) {
        await sleep(pace(220), signal);
        continue;
      }
      if (matches.length > 0) {
        if (mistakePending) {
          const english = matches.find((card) => card.dataset.reviewSide === "en");
          const arabic = matches.find(
            (card) =>
              card.dataset.reviewSide === "ar" &&
              card.dataset.reviewPair !== english?.dataset.reviewPair,
          );
          if (english && arabic) {
            click(english);
            await waitForAudio(signal);
            click(arabic);
            mistakePending = false;
            await sleep(pace(560), signal);
            idle = 0;
            continue;
          }
        }
        const english = matches.find((card) => card.dataset.reviewSide === "en");
        const arabic = matches.find(
          (card) =>
            card.dataset.reviewSide === "ar" &&
            card.dataset.reviewPair === english?.dataset.reviewPair,
        );
        if (english && arabic) {
          click(english);
          await waitForAudio(signal);
          click(arabic);
          await sleep(pace(520), signal);
          idle = 0;
          continue;
        }
      }

      const choices = nodes("choice");
      const selected = choices.some((choice) => choice.getAttribute("aria-selected") === "true");
      const openChoice = choices.filter(usable);
      if (!selected && openChoice.length > 0) {
        const wrong = openChoice.find((choice) => choice.dataset.reviewCorrect === "0");
        const right = openChoice.find((choice) => choice.dataset.reviewCorrect === "1");
        const pick = mistakePending && wrong ? wrong : right ?? openChoice[0];
        if (pick) {
          if (pick === wrong) mistakePending = false;
          click(pick);
          await sleep(pace(320), signal);
          idle = 0;
          continue;
        }
      }

      const field = nodes("typed").find(
        (el): el is HTMLInputElement => el instanceof HTMLInputElement && usable(el),
      );
      if (field && field.value.trim().length === 0) {
        const answer = field.dataset.reviewAnswer ?? "";
        fillInput(field, mistakePending ? "خطأ" : answer);
        if (mistakePending) mistakePending = false;
        await sleep(pace(240), signal);
        idle = 0;
        continue;
      }

      const check = nodes("check").find(usable);
      if (check) {
        click(check);
        await sleep(pace(420), signal);
        idle = 0;
        continue;
      }

      idle += 1;
      if (idle > 40) {
        phaseRef.current = "idle";
        setPhase("idle");
        return;
      }
      await sleep(220, signal);
    }
  };

  const stopLoop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    runningRef.current = false;
    pauseRef.current?.();
    pauseRef.current = null;
  };

  const startRef = useRef<() => void>(() => {});

  const start = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    phaseRef.current = "running";
    setPhase("running");
    setOpen(true);
    void run(controller.signal)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("[review]", error);
      })
      .finally(() => {
        runningRef.current = false;
        if (phaseRef.current === "running") {
          phaseRef.current = "idle";
          setPhase("idle");
        }
      });
  };

  startRef.current = start;

  const pause = () => {
    if (phaseRef.current !== "running") return;
    setPhase("paused");
    phaseRef.current = "paused";
  };

  const resume = () => {
    if (phaseRef.current !== "paused") return;
    setPhase("running");
    phaseRef.current = "running";
    pauseRef.current?.();
    pauseRef.current = null;
  };

  const stop = () => {
    stopLoop();
    setPhase("idle");
    phaseRef.current = "idle";
  };

  const restart = () => {
    stopLoop();
    const retry = nodes("retry").find(usable);
    if (retry) {
      retry.click();
      window.setTimeout(() => startRef.current(), 600);
      return;
    }
    window.sessionStorage.setItem(AUTOSTART_KEY, "1");
    window.location.reload();
  };

  if (!enabled || !mounted) return null;

  return createPortal(
    <div className="fixed top-[4.6rem] left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2" dir="rtl">
      {!open ? (
        <button
          type="button"
          aria-label="تشغيل التجربة التلقائية"
          onClick={() => {
            setOpen(true);
            start();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDD9BC] bg-[#FFFDF8] text-apricot-deep shadow-md active:scale-95 dark:border-white/15 dark:bg-[#1F2E35] dark:text-apricot"
        >
          <PlayIcon />
        </button>
      ) : (
        <div className="flex items-center gap-1 rounded-full border border-[#EDD9BC] bg-[#FFFDF8] p-1 shadow-md dark:border-white/15 dark:bg-[#1F2E35]">
          {phase === "running" ? (
            <Control label="إيقاف مؤقت" onClick={pause}>
              <PauseIcon />
            </Control>
          ) : (
            <Control label={phase === "paused" ? "استئناف" : "تشغيل"} onClick={phase === "paused" ? resume : start}>
              <PlayIcon />
            </Control>
          )}
          <Control label="إيقاف" onClick={stop}>
            <StopIcon />
          </Control>
          <Control label="من البداية" onClick={restart}>
            <RestartIcon />
          </Control>
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`السرعة ${value}`}
              aria-pressed={speed === value}
              onClick={() => setSpeed(value)}
              className={`min-h-9 min-w-9 rounded-full px-2 text-xs font-extrabold active:scale-95 ${
                speed === value
                  ? "bg-apricot text-white"
                  : "text-slate-700 dark:text-white"
              }`}
            >
              ×{value}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

function Control({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-apricot-deep active:scale-95 dark:text-apricot"
    >
      {children}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12a7 7 0 1 1-2-4.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M19 4.5V8h-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

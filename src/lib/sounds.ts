/** File-based + synthesized UI audio from /public/sounds */

const SOUND_FILES = {
  tap: "/sounds/tap.mp3",
  complete: "/sounds/complete.mp3",
  success: "/sounds/success.mp3",
  wrong: "/sounds/wrong.mp3",
  /** From sounds/New folder — end of final group */
  finale: "/sounds/finale.mp3",
  /** WhatsApp clip — matching set 1 → set 2 */
  whatsappTransition: "/sounds/whatsapp-transition.mpeg",
} as const;

let fileAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
const tapPool: HTMLAudioElement[] = [];

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

function playFile(src: string) {
  if (typeof window === "undefined") return;
  try {
    if (fileAudio) {
      fileAudio.pause();
      fileAudio.currentTime = 0;
    }
    fileAudio = new Audio(src);
    fileAudio.volume = 1;
    void fileAudio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Ascending soft pops for correct matches 1–4 within a set. */
export function playCorrectMatchClick(step: number) {
  if (step < 1 || step > 4) return;

  const ctx = getCtx();
  if (!ctx) return;

  try {
    void ctx.resume();
    const frequencies = [440, 550, 660, 770];
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[step - 1], now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch {
    /* ignore */
  }
}

/** Light click file — legacy / misc UI. */
export function playCorrectClick() {
  if (typeof window === "undefined") return;
  try {
    let a = tapPool.pop();
    if (!a) a = new Audio(SOUND_FILES.tap);
    a.currentTime = 0;
    a.volume = 1;
    void a.play().catch(() => {});
    a.onended = () => {
      tapPool.push(a!);
    };
  } catch {
    /* ignore */
  }
}

/** Deep / luxurious click for incorrect match. */
export function playLuxuriousClick() {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    void ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

    filter.type = "lowshelf";
    filter.frequency.value = 120;
    filter.gain.value = 10;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.55, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch {
    /* ignore */
  }
}

/** @deprecated — prefer playCorrectClick / playLuxuriousClick */
export function playTapSound() {
  playCorrectClick();
}

/** Victory / between-groups chime. */
export function playCompleteSound() {
  playFile(SOUND_FILES.complete);
}

/** WhatsApp audio between matching set 1 and set 2. */
export function playWhatsAppTransitionSound() {
  playFile(SOUND_FILES.whatsappTransition);
}

/** End of last group — audio from New folder. */
export function playFinaleSound() {
  playFile(SOUND_FILES.finale);
}

/** Luxurious celebratory music between word sets (file). */
export function playCelebratorySound() {
  playFile(SOUND_FILES.complete);
}

/**
 * Between matching sets: ~3s high, gentle, loud arpeggio (not a fast sting).
 * Web Audio — no external file required.
 */
export function playTransitionSuccessSound() {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    void ctx.resume();
    const now = ctx.currentTime;
    // High register major sparkle: G5 → B5 → D6 → G6 → B6
    const frequencies = [784.0, 987.8, 1174.7, 1568.0, 1975.5];
    const step = 0.48;
    const noteLen = 1.35;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, now);
    master.connect(ctx.destination);

    frequencies.forEach((freq, index) => {
      const start = now + index * step;

      const sine = ctx.createOscillator();
      const tri = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      sine.type = "sine";
      tri.type = "triangle";
      sine.frequency.setValueAtTime(freq, start);
      tri.frequency.setValueAtTime(freq, start);

      filter.type = "highshelf";
      filter.frequency.value = 2200;
      filter.gain.value = 6;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.55, start + 0.08);
      gain.gain.setValueAtTime(0.42, start + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + noteLen);

      sine.connect(filter);
      tri.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      sine.start(start);
      tri.start(start);
      sine.stop(start + noteLen + 0.05);
      tri.stop(start + noteLen + 0.05);
    });

    // Soft high shimmer pad under the phrase
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = "sine";
    pad.frequency.setValueAtTime(1568.0, now);
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    padGain.gain.setValueAtTime(0.14, now + 2.2);
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.05);
    pad.connect(padGain);
    padGain.connect(master);
    pad.start(now);
    pad.stop(now + 3.1);
  } catch {
    /* ignore */
  }
}

/** Correct-answer file from /public/sounds/success.mp3 */
export function playSuccessSound() {
  playFile(SOUND_FILES.success);
}

export function playWrongSound() {
  playLuxuriousClick();
}

export function playUiSound(
  kind: "tap" | "correct" | "error" | "complete",
) {
  if (kind === "tap" || kind === "correct") {
    playCorrectClick();
    return;
  }
  if (kind === "error") {
    playLuxuriousClick();
    return;
  }
  if (kind === "complete") {
    playCompleteSound();
  }
}

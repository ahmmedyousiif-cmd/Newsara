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

/** Physical haptic pulse — essential for “continue to next round” feedback. */
export function vibrateContinuePulse() {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    // Impact → short rhythmic fade (ms: vibrate, gap, vibrate, gap, …)
    navigator.vibrate([60, 35, 40, 45, 32, 50, 26, 60, 20, 80, 16, 100, 12]);
  } catch {
    /* unsupported / blocked */
  }
}

/**
 * After matching set 1 → set 2: ~2.5s motivational “great — continue” cue.
 * Soft success hit + rising momentum (not a final course celebration).
 * Always triggers haptic pulse when the platform allows it.
 */
export function playContinueRoundSound() {
  vibrateContinuePulse();

  const ctx = getCtx();
  if (!ctx) {
    // Haptic already fired; fall back to file if Web Audio unavailable.
    playFile(SOUND_FILES.whatsappTransition);
    return;
  }

  try {
    void ctx.resume();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, now);
    master.connect(ctx.destination);

    // 1) Soft confident success hit + low rumble pulse
    const hit = ctx.createOscillator();
    const hitGain = ctx.createGain();
    const hitFilter = ctx.createBiquadFilter();
    hit.type = "triangle";
    hit.frequency.setValueAtTime(392, now); // G4
    hit.frequency.exponentialRampToValueAtTime(262, now + 0.18);
    hitFilter.type = "lowpass";
    hitFilter.frequency.value = 1800;
    hitGain.gain.setValueAtTime(0.0001, now);
    hitGain.gain.linearRampToValueAtTime(0.55, now + 0.012);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    hit.connect(hitFilter);
    hitFilter.connect(hitGain);
    hitGain.connect(master);
    hit.start(now);
    hit.stop(now + 0.34);

    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(72, now);
    rumble.frequency.exponentialRampToValueAtTime(42, now + 0.28);
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.linearRampToValueAtTime(0.42, now + 0.02);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    rumble.connect(rumbleGain);
    rumbleGain.connect(master);
    rumble.start(now);
    rumble.stop(now + 0.4);

    // 2) Rising motivational progression (forward momentum, not finale)
    // C5 → E5 → G5 → C6 with overlapping soft attacks
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, index) => {
      const start = now + 0.22 + index * 0.38;
      const sine = ctx.createOscillator();
      const tri = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      sine.type = "sine";
      tri.type = "triangle";
      sine.frequency.setValueAtTime(freq, start);
      tri.frequency.setValueAtTime(freq * 2, start);

      filter.type = "highshelf";
      filter.frequency.value = 2400;
      filter.gain.value = 4;

      const peak = 0.28 + index * 0.04;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.05);
      gain.gain.setValueAtTime(peak * 0.7, start + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);

      sine.connect(filter);
      tri.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      sine.start(start);
      tri.start(start);
      sine.stop(start + 0.9);
      tri.stop(start + 0.9);
    });

    // 3) Gentle forward “push” pad that fades (invites next round)
    const pad = ctx.createOscillator();
    const pad2 = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = "sine";
    pad2.type = "sine";
    pad.frequency.setValueAtTime(523.25, now + 0.35);
    pad2.frequency.setValueAtTime(783.99, now + 0.35);
    padGain.gain.setValueAtTime(0.0001, now + 0.35);
    padGain.gain.linearRampToValueAtTime(0.14, now + 0.7);
    padGain.gain.setValueAtTime(0.12, now + 1.9);
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.55);
    pad.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(master);
    pad.start(now + 0.35);
    pad2.start(now + 0.35);
    pad.stop(now + 2.6);
    pad2.stop(now + 2.6);

    // Soft delayed haptic echo while melody rises (platforms that allow chaining)
    window.setTimeout(() => {
      try {
        navigator.vibrate?.([28, 40, 22, 55, 16]);
      } catch {
        /* ignore */
      }
    }, 420);
  } catch {
    playFile(SOUND_FILES.whatsappTransition);
  }
}

/** @deprecated — use playContinueRoundSound */
export function playWhatsAppTransitionSound() {
  playContinueRoundSound();
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

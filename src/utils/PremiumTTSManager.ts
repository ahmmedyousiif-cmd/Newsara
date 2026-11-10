const CACHE_KEY_PREFIX = "en:";

/** ElevenLabs deep-male voice: Adam */
const FALLBACK_VOICE_HINT = "Adam";

const PREFERRED_BROWSER_VOICES = [
  "Google US English",
  "Samantha",
  "Alex",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Zira - English (United States)",
  "Google UK English Female",
] as const;

type PlayOptions = {
  /** Extra gain multiplier after LowShelf (default 1.35). */
  gain?: number;
};

class PremiumTTSManagerImpl {
  private audioCtx: AudioContext | null = null;
  private cache = new Map<string, AudioBuffer>();
  private currentSource: AudioBufferSourceNode | null = null;
  private inflight = new Map<string, Promise<AudioBuffer>>();
  private playGeneration = 0;
  private browserVoices: SpeechSynthesisVoice[] = [];
  private voicesHooked = false;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AC();
    }
    return this.audioCtx;
  }

  private ensureBrowserVoices(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      this.browserVoices = window.speechSynthesis.getVoices();
    };
    load();
    if (!this.voicesHooked) {
      this.voicesHooked = true;
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  private pickEnglishVoice(): SpeechSynthesisVoice | null {
    this.ensureBrowserVoices();
    for (const name of PREFERRED_BROWSER_VOICES) {
      const match = this.browserVoices.find((v) => v.name === name);
      if (match) return match;
    }
    const enUs = this.browserVoices.find(
      (v) => v.lang === "en-US" || v.lang.toLowerCase().startsWith("en-us"),
    );
    if (enUs) return enUs;
    return (
      this.browserVoices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
      null
    );
  }

  private stopBrowserSpeech(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  private stopCurrent(): void {
    if (!this.currentSource) return;
    try {
      this.currentSource.onended = null;
      this.currentSource.stop();
    } catch {
      /* already stopped */
    }
    this.currentSource.disconnect();
    this.currentSource = null;
  }

  private async fetchAndDecode(word: string): Promise<AudioBuffer> {
    const key = `${CACHE_KEY_PREFIX}${word.toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const pending = this.inflight.get(key);
    if (pending) return pending;

    const job = (async () => {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, voiceHint: FALLBACK_VOICE_HINT }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(
          `Premium TTS failed (${res.status}): ${detail || res.statusText}`,
        );
      }

      const arrayBuffer = await res.arrayBuffer();
      const ctx = this.getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      this.cache.set(key, audioBuffer);
      this.inflight.delete(key);
      return audioBuffer;
    })().catch((err) => {
      this.inflight.delete(key);
      throw err;
    });

    this.inflight.set(key, job);
    return job;
  }

  private playBuffer(buffer: AudioBuffer, gainBoost = 1.35): void {
    const ctx = this.getContext();
    void ctx.resume();

    this.stopBrowserSpeech();
    this.stopCurrent();

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // LowShelf: thicken / deepen the male voice
    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 180;
    bass.gain.value = 7.5;

    const gain = ctx.createGain();
    // Cap to avoid hard clipping while staying loud
    gain.gain.value = Math.min(2.2, Math.max(1, gainBoost));

    source.connect(bass);
    bass.connect(gain);
    gain.connect(ctx.destination);

    this.currentSource = source;
    source.onended = () => {
      if (this.currentSource === source) this.currentSource = null;
    };
    source.start(0);
  }

  /** Free browser voice when ElevenLabs key/API is unavailable. */
  private playBrowserFallback(text: string): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      this.stopBrowserSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
      utterance.volume = 1;

      const voice = this.pickEnglishVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-US";
      }

      // Mobile browsers often drop speak() right after cancel(); defer one tick.
      window.setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          /* ignore */
        }
      }, 0);
    } catch {
      /* ignore */
    }
  }

  async playWord(word: string, options: PlayOptions = {}): Promise<void> {
    if (typeof window === "undefined") return;
    const text = word.trim();
    if (!text) return;

    const generation = ++this.playGeneration;
    this.stopCurrent();
    this.stopBrowserSpeech();

    // Unlock audio on mobile (gesture-gated AudioContext).
    try {
      void this.getContext().resume();
    } catch {
      /* ignore */
    }

    try {
      const buffer = await this.fetchAndDecode(text);
      if (generation !== this.playGeneration) return;
      this.playBuffer(buffer, options.gain ?? 1.35);
    } catch (err) {
      if (generation !== this.playGeneration) return;
      console.warn(
        "[PremiumTTSManager] premium TTS unavailable, using browser voice",
        err,
      );
      this.playBrowserFallback(text);
    }
  }

  cancel(): void {
    this.playGeneration += 1;
    this.stopCurrent();
    this.stopBrowserSpeech();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const PremiumTTSManager = new PremiumTTSManagerImpl();

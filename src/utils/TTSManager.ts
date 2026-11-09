type SpeakOptions = {
  rate?: number;
  volume?: number;
  lang?: string;
};

const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Samantha",
  "Alex",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Zira - English (United States)",
  "Google UK English Female",
] as const;

class TTSManagerImpl {
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private initialized = false;

  init(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (this.initialized) return;
    this.initialized = true;

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      this.preferredVoice = this.pickPreferredVoice(this.voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  private pickPreferredVoice(
    voices: SpeechSynthesisVoice[],
  ): SpeechSynthesisVoice | null {
    for (const name of PREFERRED_VOICE_NAMES) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }

    const enUs = voices.find(
      (v) => v.lang === "en-US" || v.lang.toLowerCase().startsWith("en-us"),
    );
    if (enUs) return enUs;

    const anyEn = voices.find((v) =>
      v.lang.toLowerCase().startsWith("en"),
    );
    return anyEn ?? null;
  }

  speak(text: string, options: SpeakOptions = {}): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!text.trim()) return;

    this.init();

    const { rate = 0.68, volume = 1.0, lang = "en-US" } = options;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang;
    utterance.rate = Math.min(0.75, Math.max(0.6, rate));
    utterance.volume = volume;
    utterance.pitch = 1;

    const voice =
      this.preferredVoice ?? this.pickPreferredVoice(this.voices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || lang;
    }

    window.speechSynthesis.speak(utterance);
  }

  cancel(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }
}

export const TTSManager = new TTSManagerImpl();

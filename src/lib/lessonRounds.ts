import type { MatchingPair } from "@/types/matching";
import type { DictationItem, WordMeaningItem } from "@/types/meaning";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

/** Five lesson words, shifting forward each time the optional drill is opened. */
export function takeRotatingDictation(
  pairs: MatchingPair[],
  start: number,
  count = 5,
): DictationItem[] {
  if (pairs.length === 0) return [];
  const size = Math.min(count, pairs.length);
  const origin = ((start % pairs.length) + pairs.length) % pairs.length;
  return Array.from({ length: size }, (_, index) => {
    const word = pairs[(origin + index) % pairs.length]!;
    return {
      id: `dict-${origin}-${word.pairId}`,
      promptAr: word.ar,
      answerEn: word.en,
    };
  });
}

export function buildLessonRounds(pairs: MatchingPair[], seed: number) {
  const rand = mulberry32(seed || 1);
  const words = shuffle(pairs, rand);

  const meaning: WordMeaningItem[] = words.slice(0, 5).map((word, index) => {
    const distractors = shuffle(
      words.filter((other) => other.pairId !== word.pairId),
      rand,
    ).slice(0, 2);
    const options = shuffle([word, ...distractors], rand).map((option) => ({
      id: option.pairId,
      text: option.ar,
    }));

    return {
      id: `choice-${word.pairId}`,
      mode: "choice" as const,
      promptEn: word.en,
      correctId: word.pairId,
      layout: index < 3 ? "vertical" : "horizontal",
      options,
    };
  });

  return { meaning };
}

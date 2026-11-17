import type { MatchingPair } from "@/types/matching";
import type { WordMeaningItem } from "@/types/meaning";

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

export function buildLessonRounds(pairs: MatchingPair[], seed: number) {
  const rand = mulberry32(seed || 1);
  const words = shuffle(pairs, rand);
  const choiceFirst = rand() < 0.5;

  const meaning: WordMeaningItem[] = words.map((word, index) => {
    const useChoice = index % 2 === 0 ? choiceFirst : !choiceFirst;
    if (!useChoice) {
      return {
        id: `type-${word.pairId}`,
        mode: "type" as const,
        promptEn: word.en,
        answerAr: word.ar,
      };
    }

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
      options,
    };
  });

  return { meaning };
}

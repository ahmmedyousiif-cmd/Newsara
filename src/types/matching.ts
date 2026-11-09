export type MatchingPair = {
  pairId: string;
  en: string;
  ar: string;
};

export type MatchingPedagogicalGuide = {
  title: string;
  objective: string;
  steps: string[];
  example: {
    en: string;
    ar: string;
    note: string;
  };
};

export type MatchingSet = {
  id: string;
  title: string;
  titleEn: string;
  pairs: MatchingPair[];
};

export type MatchingActivity = {
  id: string;
  engine: "matching-pairs";
  title: string;
  titleEn: string;
  instruction: string;
  pedagogicalGuide?: MatchingPedagogicalGuide;
  /** Multi-round word sets (played in order). */
  sets: MatchingSet[];
  /** Legacy single-board pairs (optional). */
  pairs?: MatchingPair[];
};

export type MatchCard = {
  id: string;
  pairId: string;
  text: string;
  type: "en" | "ar";
};

export function getActivitySets(activity: MatchingActivity): MatchingSet[] {
  if (activity.sets?.length) return activity.sets;
  if (activity.pairs?.length) {
    return [
      {
        id: "default",
        title: activity.title,
        titleEn: activity.titleEn,
        pairs: activity.pairs,
      },
    ];
  }
  return [];
}

export function flattenPairs(pairs: MatchingPair[]): MatchCard[] {
  return pairs.flatMap((pair) => [
    {
      id: `${pair.pairId}-en`,
      pairId: pair.pairId,
      text: pair.en,
      type: "en" as const,
    },
    {
      id: `${pair.pairId}-ar`,
      pairId: pair.pairId,
      text: pair.ar,
      type: "ar" as const,
    },
  ]);
}

export function shuffleCards<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Shuffle EN + AR so no pair sits on the same row index. */
export function dealMatchingColumns(pairs: MatchingPair[]): {
  en: MatchCard[];
  ar: MatchCard[];
} {
  const flat = flattenPairs(pairs);
  const enSource = flat.filter((c) => c.type === "en");
  const arSource = flat.filter((c) => c.type === "ar");
  const en = shuffleCards(enSource);

  let ar = shuffleCards(arSource);
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const aligned = en.some((card, i) => card.pairId === ar[i]?.pairId);
    if (!aligned) break;
    ar = shuffleCards(arSource);
  }

  // Force-break any remaining same-row matches (tiny boards).
  for (let i = 0; i < en.length; i += 1) {
    if (en[i]?.pairId !== ar[i]?.pairId) continue;
    const swapWith = ar.findIndex(
      (card, j) => j !== i && card.pairId !== en[i]?.pairId,
    );
    if (swapWith >= 0) {
      [ar[i], ar[swapWith]] = [ar[swapWith], ar[i]];
    }
  }

  return { en, ar };
}

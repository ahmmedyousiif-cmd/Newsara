/** Levenshtein distance for short spelling checks. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;

  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    for (let j = 0; j <= n; j += 1) prev[j] = curr[j]!;
  }
  return prev[n]!;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Exact → correct. Near miss (1 edit, or 2 if word length ≥ 5) → typo.
 * Otherwise → wrong.
 */
export function gradeTypedAnswer(
  raw: string,
  answer: string,
  acceptedAnswers: string[] = [],
): "correct" | "typo" | "wrong" {
  const typed = normalizeAnswer(raw);
  if (!typed) return "wrong";

  const canon = normalizeAnswer(answer);
  const accepted = [canon, ...acceptedAnswers.map(normalizeAnswer)];
  if (accepted.includes(typed)) return "correct";

  const maxDist = canon.length >= 5 ? 2 : 1;
  for (const target of accepted) {
    if (levenshtein(typed, target) <= maxDist) return "typo";
  }
  return "wrong";
}

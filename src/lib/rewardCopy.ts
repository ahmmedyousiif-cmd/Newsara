export type PerformanceLevel =
  | "excellent"
  | "veryGood"
  | "good"
  | "acceptable"
  | "weak";

const TITLES: Record<PerformanceLevel, [string, string, string]> = {
  excellent: [
    "أداء استثنائي يا بطل!",
    "أنت عبقري حقاً!",
    "عمل رائع وإنجاز مبهر!",
  ],
  veryGood: [
    "عمل رائع يا بطل!",
    "مجهود ممتاز!",
    "أنت تقترب من القمة!",
  ],
  good: [
    "أداء جيد، استمر!",
    "أحسنت صنعاً!",
    "مجهود طيب يا بطل!",
  ],
  acceptable: [
    "نجاح مقبول، يمكنك تقديم الأفضل!",
    "لقد اجتزت التحدي!",
    "بداية جيدة، لكنك تستطيع المزيد!",
  ],
  weak: [
    "لا تستسلم، حاول مرة أخرى!",
    "كل خطأ هو فرصة للتعلم!",
    "أنت قادر على تجاوز هذا التحدي!",
  ],
};

const NARRATIVES: Record<PerformanceLevel, [string, string, string]> = {
  excellent: [
    "تركيزك العالي واهتمامك بالتفاصيل قادك لهذا النجاح الباهر، استمر في تألقك.",
    "لقد أثبتّ قدرة فائقة على استيعاب المفاهيم، هذا ثمرة جهدك المستمر.",
    "إجاباتك الدقيقة تعكس فهماً عميقاً للدرس، أنت نموذج للطالب المتميز.",
  ],
  veryGood: [
    "لقد أبليت بلاءً حسناً وفهمت معظم أجزاء الدرس، بقليل من التركيز ستصل للعلامة الكاملة.",
    "استيعابك للموضوع ممتاز، خطوة واحدة تفصلك عن القمة، واصل التدريب.",
    "جهد واضح ومستوى مبشر جداً، راجع أخطاءك البسيطة لتصبح من الأوائل.",
  ],
  good: [
    "مستواك جيد ويدل على متابعتك للدرس، ركز أكثر في المرات القادمة.",
    "لقد نجحت في فهم الأساسيات، التدريب المستمر سيصقل مهاراتك بشكل أفضل.",
    "أداء يرضي الطموح، لكن إمكانياتك تسمح لك بتحقيق مستوى أعلى.",
  ],
  acceptable: [
    "لقد تجاوزت المرحلة، لكنك تحتاج إلى مراجعة بعض المفاهيم الأساسية لتثبيت معلوماتك.",
    "ننصحك بإعادة قراءة الدرس بتركيز أكبر، التدريب سيعالج نقاط الضعف.",
    "لقد بذلت جهداً، ولكن لا يزال هناك مجال كبير للتحسين، لا تتردد في المحاولة مجدداً.",
  ],
  weak: [
    "التعثر ليس نهاية المطاف، راجع الدرس خطوة بخطوة وحاول مرة أخرى بثقة.",
    "تحتاج إلى المزيد من التركيز والمراجعة، نحن هنا لمساعدتك على التحسن.",
    "النجاح يبدأ من هنا، قم بمراجعة الإجابات الخاطئة واجعلها نقطة انطلاقك الجديدة.",
  ],
};

export function getPerformanceLevel(
  correctAnswers: number,
  totalQuestions: number,
): PerformanceLevel {
  if (totalQuestions <= 0) return "weak";
  const pct = (correctAnswers / totalQuestions) * 100;
  if (pct >= 90) return "excellent";
  if (pct >= 80) return "veryGood";
  if (pct >= 70) return "good";
  if (pct >= 50) return "acceptable";
  return "weak";
}

function pickRotated(
  key: string,
  phrases: [string, string, string],
): string {
  if (typeof window === "undefined") {
    return phrases[0];
  }
  const storageKey = `reward-phrase:${key}`;
  const last = Number(window.sessionStorage.getItem(storageKey));
  let next = Math.floor(Math.random() * phrases.length);
  if (Number.isFinite(last) && phrases.length > 1 && next === last) {
    next = (last + 1) % phrases.length;
  }
  window.sessionStorage.setItem(storageKey, String(next));
  return phrases[next]!;
}

export function pickMotivationalTitle(level: PerformanceLevel): string {
  return pickRotated(`title:${level}`, TITLES[level]);
}

export function pickPedagogicalNarrative(level: PerformanceLevel): string {
  return pickRotated(`narrative:${level}`, NARRATIVES[level]);
}

const ARABIC_MONTHS = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
] as const;

export function formatArabicDate(date = new Date()): string {
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()] ?? "";
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

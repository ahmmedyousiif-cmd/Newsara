/**
 * Temporary visual stations for Learning Journey scroll testing ONLY.
 * Flip USE_JOURNEY_SCROLL_TEST to false to restore official curriculum list.
 * Does not modify content/curriculum/lessons.json.
 */
export const USE_JOURNEY_SCROLL_TEST = true;

export type JourneyStation = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: "active" | "locked" | "completed";
  /** Organic side bias for path placement */
  side: "left" | "right" | "center";
  href: string | null;
};

/** Extra locked topics used only while scroll-test mode is on. */
const TEST_LOCKED_TOPICS: Array<{ title: string; subtitle: string }> = [
  { title: "Lesson 2", subtitle: "قراءة قصيرة" },
  { title: "Lesson 3", subtitle: "قواعد بسيطة" },
  { title: "Lesson 4", subtitle: "استماع" },
  { title: "Lesson 5", subtitle: "كتابة" },
  { title: "Lesson 6", subtitle: "مفردات جديدة" },
  { title: "Lesson 7", subtitle: "محادثة" },
  { title: "Lesson 8", subtitle: "تدريبات" },
  { title: "Lesson 9", subtitle: "مراجعة" },
  { title: "Lesson 10", subtitle: "جمل يومية" },
  { title: "Lesson 11", subtitle: "أسئلة وأجوبة" },
  { title: "Lesson 12", subtitle: "نطق" },
  { title: "Lesson 13", subtitle: "قراءة متوسطة" },
  { title: "Lesson 14", subtitle: "قواعد إضافية" },
  { title: "Lesson 15", subtitle: "حوار" },
  { title: "Lesson 16", subtitle: "مراجعة وحدة" },
  { title: "Lesson 17", subtitle: "اختبار قصير" },
];

/** Non-mechanical left/right rhythm for the journey path. */
const SIDE_PATTERN: Array<"left" | "right" | "center"> = [
  "left",
  "right",
  "left",
  "center",
  "right",
  "left",
  "right",
  "left",
  "right",
  "center",
  "left",
  "right",
  "left",
  "right",
  "left",
  "center",
  "right",
  "left",
];

type OfficialLesson = {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  unlocked: boolean;
  href: string | null;
};

export function buildJourneyStations(
  official: OfficialLesson[],
): JourneyStation[] {
  if (!USE_JOURNEY_SCROLL_TEST) {
    return official.map((lesson, index) => ({
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      subtitle: lesson.titleAr,
      status: lesson.unlocked
        ? ("active" as const)
        : ("locked" as const),
      side: SIDE_PATTERN[index % SIDE_PATTERN.length]!,
      href: lesson.href,
    }));
  }

  const stations: JourneyStation[] = [];

  const first = official[0];
  if (first) {
    stations.push({
      id: first.id,
      number: 1,
      title: first.title,
      subtitle: first.titleAr,
      status: first.unlocked ? "active" : "locked",
      side: "left",
      href: first.href,
    });
  } else {
    stations.push({
      id: "test-01",
      number: 1,
      title: "Lesson 1",
      subtitle: "أهم المفردات",
      status: "active",
      side: "left",
      href: "/lesson/1",
    });
  }

  TEST_LOCKED_TOPICS.forEach((topic, i) => {
    const number = i + 2;
    stations.push({
      id: `journey-test-${String(number).padStart(2, "0")}`,
      number,
      title: topic.title,
      subtitle: topic.subtitle,
      status: "locked",
      side: SIDE_PATTERN[number - 1] ?? (number % 2 === 0 ? "right" : "left"),
      href: null,
    });
  });

  return stations;
}

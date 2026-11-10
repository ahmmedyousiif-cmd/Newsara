import { LearningJourney } from "@/components/dashboard/LearningJourney";
import {
  buildJourneyStations,
  USE_JOURNEY_SCROLL_TEST,
} from "../../../content/dev/journeyScrollTest";
import lessonsJson from "../../../content/curriculum/lessons.json";

const data = lessonsJson as {
  lessons: Array<{
    id: string;
    number: number;
    title: string;
    titleAr: string;
    unlocked: boolean;
    href: string | null;
  }>;
};

const stations = buildJourneyStations(data.lessons);

export default function DashboardPage() {
  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="shrink-0 text-center">
        <h1
          dir="ltr"
          className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
        >
          English for Iraq
        </h1>
        {USE_JOURNEY_SCROLL_TEST ? (
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            وضع تجربة السكرول — دروس إضافية مؤقتة
          </p>
        ) : null}
      </header>

      <LearningJourney stations={stations} />
    </div>
  );
}

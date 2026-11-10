import { LearningJourney } from "@/components/dashboard/LearningJourney";
import { buildJourneyStations } from "../../../content/dev/journeyScrollTest";
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
    <div dir="rtl" className="relative flex flex-col">
      {/* Fully fixed title — never moves with page scroll */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-card-border/60 bg-cream-soft/95 px-4 pb-2.5 pt-[max(0.4rem,env(safe-area-inset-top))] text-center backdrop-blur-md supports-[backdrop-filter]:bg-cream-soft/90 dark:border-white/10 dark:bg-[#131F24]/95">
        <div className="mx-auto w-full max-w-lg">
          <h1
            dir="ltr"
            className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
          >
            English for Iraq
          </h1>
        </div>
      </header>

      {/* Spacer so content starts below the fixed header */}
      <div className="h-[3.35rem] shrink-0" aria-hidden />

      <LearningJourney stations={stations} />
    </div>
  );
}

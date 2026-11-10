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
    <div dir="rtl" className="flex flex-col">
      {/* Stays pinned while topics scroll underneath */}
      <header className="sticky top-0 z-30 -mx-4 mb-2 border-b border-card-border/60 bg-cream-soft/95 px-4 pb-3 pt-1 text-center backdrop-blur-md dark:border-white/10 dark:bg-[#131F24]/95">
        <h1
          dir="ltr"
          className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
        >
          English for Iraq
        </h1>
      </header>

      <LearningJourney stations={stations} />
    </div>
  );
}

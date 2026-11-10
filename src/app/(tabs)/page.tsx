import { LessonMap, type LessonMapItem } from "@/components/dashboard/LessonMap";
import lessonsJson from "../../../content/curriculum/lessons.json";

const data = lessonsJson as {
  lessons: LessonMapItem[];
};

export default function DashboardPage() {
  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="shrink-0 text-center">
        <h1
          dir="ltr"
          className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
        >
          English for Iraq
        </h1>
      </header>

      <div className="lesson-roadmap-scroll min-h-0 flex-1">
        <LessonMap lessons={data.lessons} />
      </div>
    </div>
  );
}

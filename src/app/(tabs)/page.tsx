import { LessonMap, type LessonMapItem } from "@/components/dashboard/LessonMap";
import lessonsJson from "../../../content/curriculum/lessons.json";

const data = lessonsJson as {
  lessons: LessonMapItem[];
};

export default function DashboardPage() {
  return (
    <div dir="rtl" className="flex flex-col gap-6">
      <header className="text-center">
        <h1
          dir="ltr"
          className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
        >
          English for Iraq
        </h1>
      </header>

      <LessonMap lessons={data.lessons} />
    </div>
  );
}

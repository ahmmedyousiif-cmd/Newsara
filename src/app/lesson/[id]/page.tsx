import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MatchingActivityFlow } from "@/components/activities/MatchingPairs/MatchingActivityFlow";
import { PastSimpleExercise } from "@/components/activities/SentenceBuild/PastSimpleExercise";
import type { MatchingActivity } from "@/types/matching";
import type { SentenceBuildActivity } from "@/types/sentenceBuild";
import activityJson from "../../../../content/activities/drinks-matching.json";
import pastSimpleJson from "../../../../content/activities/past-simple-affirmative.json";

const activity = activityJson as MatchingActivity;
const pastSimple = pastSimpleJson as SentenceBuildActivity;

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

async function LessonContent({ params }: LessonPageProps) {
  const { id } = await params;

  if (id === "2") {
    return (
      <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-cream-soft dark:bg-[#131F24]">
        <PastSimpleExercise activity={pastSimple} />
      </div>
    );
  }

  if (id !== "1") notFound();

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-cream-soft dark:bg-[#131F24]">
      <MatchingActivityFlow activity={activity} />
    </div>
  );
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-cream-soft text-slate-500 dark:bg-[#131F24]">
          جاري التحميل…
        </div>
      }
    >
      <LessonContent params={params} />
    </Suspense>
  );
}

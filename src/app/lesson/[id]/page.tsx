import { notFound } from "next/navigation";
import { MatchingActivityFlow } from "@/components/activities/MatchingPairs/MatchingActivityFlow";
import type { MatchingActivity } from "@/types/matching";
import activityJson from "../../../../content/activities/drinks-matching.json";

const activity = activityJson as MatchingActivity;

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;

  if (id !== "1") notFound();

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-cream-soft dark:bg-[#131F24]">
      <MatchingActivityFlow activity={activity} />
    </div>
  );
}

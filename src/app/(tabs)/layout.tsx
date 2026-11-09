import { BottomNav } from "@/components/nav/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-cream-soft dark:bg-[#131F24]">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

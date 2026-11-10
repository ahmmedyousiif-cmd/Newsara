import { BottomNav } from "@/components/nav/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-cream-soft dark:bg-[#131F24]">
      <main className="mx-auto w-full max-w-lg px-4 pb-[4.75rem] pt-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

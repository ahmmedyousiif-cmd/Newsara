"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "الرئيسية", icon: HomeIcon },
  { href: "/lessons", label: "الدروس", icon: BookIcon },
  { href: "/progress", label: "تقدمي", icon: ChartIcon },
  { href: "/library", label: "مكتبتي", icon: LibraryIcon },
  { href: "/settings", label: "الإعدادات", icon: GearIcon },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      className="bottom-navigation fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-cream/95 backdrop-blur-md dark:bg-[#131F24]/95"
      aria-label="التنقل الرئيسي"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                prefetch
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-[11px] font-medium leading-tight transition-colors duration-200 ${
                  active
                    ? "text-apricot-deep dark:text-apricot"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <Icon active={active} />
                <span className="nav-label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="nav-icon"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="nav-icon"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinejoin="round"
      />
      <path
        d="M17 7h2a2 2 0 0 1 2 2v10.5H17"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="nav-icon"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 19V10M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="nav-icon"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 4h3v16H5V4Zm5.5 0h3v16h-3V4ZM16 6.5h3V20h-3V6.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="nav-icon"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M4.9 7.1l1.6 1.5M17.5 15.4l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.9 16.9l1.6-1.5M17.5 8.6l1.6-1.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

"use client";

import {
  FONT_SCALE_OPTIONS,
  usePreferences,
} from "@/components/preferences/PreferencesProvider";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { fontScale, setFontScale } = usePreferences();

  return (
    <div dir="rtl" className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-extrabold text-black dark:text-white">
          الإعدادات
        </h1>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-extrabold text-slate-800 dark:text-slate-100">
          المظهر
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`min-h-12 rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              theme === "light"
                ? "border-apricot bg-apricot/15 text-apricot-deep"
                : "border-card-border text-slate-600 dark:text-slate-300"
            }`}
          >
            مضيء
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`min-h-12 rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              theme === "dark"
                ? "border-apricot bg-apricot/15 text-apricot"
                : "border-card-border text-slate-600 dark:text-slate-300"
            }`}
          >
            داكن
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-extrabold text-slate-800 dark:text-slate-100">
          حجم الخط
        </h2>
        <div className="flex flex-col gap-2">
          {FONT_SCALE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFontScale(option.id)}
              className={`flex min-h-12 items-center rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                fontScale === option.id
                  ? "border-apricot bg-apricot/15 text-apricot-deep dark:text-apricot"
                  : "border-card-border text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

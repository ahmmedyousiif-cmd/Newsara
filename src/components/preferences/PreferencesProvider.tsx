"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type FontScaleId =
  | "default"
  | "small"
  | "medium"
  | "large"
  | "huge";

export const FONT_SCALE_OPTIONS: {
  id: FontScaleId;
  label: string;
  scale: number;
}[] = [
  { id: "default", label: "افتراضي", scale: 1 },
  { id: "small", label: "صغير", scale: 0.9 },
  { id: "medium", label: "متوسط", scale: 1.05 },
  { id: "large", label: "كبير", scale: 1.15 },
  { id: "huge", label: "ضخم", scale: 1.28 },
];

type PreferencesContextValue = {
  fontScale: FontScaleId;
  setFontScale: (id: FontScaleId) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const STORAGE_KEY = "newlearn-font-scale";

function applyFontScale(id: FontScaleId) {
  const option =
    FONT_SCALE_OPTIONS.find((o) => o.id === id) ?? FONT_SCALE_OPTIONS[0];
  document.documentElement.style.setProperty(
    "--app-font-scale",
    String(option.scale),
  );
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontScale, setFontScaleState] = useState<FontScaleId>("default");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as FontScaleId | null;
    const valid = FONT_SCALE_OPTIONS.some((o) => o.id === stored)
      ? (stored as FontScaleId)
      : "default";
    setFontScaleState(valid);
    applyFontScale(valid);
  }, []);

  const setFontScale = useCallback((id: FontScaleId) => {
    setFontScaleState(id);
    applyFontScale(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({ fontScale, setFontScale }),
    [fontScale, setFontScale],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}

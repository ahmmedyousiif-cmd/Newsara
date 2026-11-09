import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo-family",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEW LEARN",
  description: "Interactive English learning — NEW LEARN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${cairo.className} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-soft font-sans text-foreground dark:bg-[#131F24]">
        <ThemeProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

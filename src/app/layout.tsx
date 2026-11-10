import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { PwaRegister } from "@/components/pwa/PwaRegister";
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
  applicationName: "NEW LEARN",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NEW LEARN",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0A05A" },
    { media: "(prefers-color-scheme: dark)", color: "#131F24" },
  ],
  colorScheme: "light dark",
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
      className={`${cairo.variable} ${cairo.className} min-h-full antialiased`}
    >
      <body className="min-h-dvh bg-cream-soft font-sans text-foreground dark:bg-[#131F24]">
        <ThemeProvider>
          <PreferencesProvider>
            {children}
            <PwaRegister />
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

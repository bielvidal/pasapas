import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { UI } from "@/lib/texts";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: UI.app,
  description: UI.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Pas a pas" },
  icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: THEME_COLORS.light, // s'actualitza al client segons el tema triat
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" suppressHydrationWarning>
      <head>
        {/* Aplica el tema desat abans del primer render (evita el parpelleig). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh font-sans">
        <header
          className="mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-4"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <Link href="/" className="text-lg font-bold tracking-tight">
            {UI.app}
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link
              href="/progres"
              className="min-h-tap inline-flex items-center rounded-full px-3 text-accent dark:text-accent-dark"
            >
              {UI.nav.progres}
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <RegisterSW />
      </body>
    </html>
  );
}

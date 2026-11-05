import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { RegisterSW } from "@/components/RegisterSW";
import { UI } from "@/lib/texts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { LIGHT } from "@/lib/tokens";

export const metadata: Metadata = {
  title: UI.app,
  description: UI.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Pas a pas" },
  icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: LIGHT.paper, // s'actualitza al client segons el tema triat
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
        <AuthGate>{children}</AuthGate>
        <RegisterSW />
      </body>
    </html>
  );
}

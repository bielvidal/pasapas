"use client";
// Marc de pàgina (calcat del portal de PPER): capçalera enganxosa amb marca i navegació, contingut
// centrat i estret (mòbil primer).
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Me } from "@/lib/api";
import { UI } from "@/lib/texts";

export function Frame({
  title,
  children,
  nav = true,
  me,
}: {
  title?: string;
  children: ReactNode;
  nav?: boolean;
  me?: Me | null;
}) {
  const pathname = usePathname();
  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={`min-h-tap inline-flex items-center rounded-full px-3 text-sm ${pathname === href ? "font-semibold text-teal" : "text-soft hover:text-teal"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="min-h-dvh">
      <header
        className="sticky top-0 z-10 border-b border-line bg-card/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-2 gap-y-0 px-4 py-2">
          <Link href="/" className="font-display text-lg font-semibold text-teal">
            {UI.app}
          </Link>
          {nav && me && (
            <nav className="-mr-3 flex flex-wrap items-center">
              {item("/progres", UI.nav.progres)}
              {me.role === "tutor" && item("/admin", UI.nav.admin)}
              {item("/compte", me.alias || UI.nav.compte)}
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 py-6">
        {title && <h1 className="mb-4 font-display text-2xl font-semibold">{title}</h1>}
        {children}
      </main>
    </div>
  );
}

export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "ok" | "error";
  children: ReactNode;
}) {
  const cls =
    kind === "ok"
      ? "bg-okSoft text-ok"
      : kind === "error"
        ? "bg-dangerSoft text-danger"
        : "bg-tealSoft text-teal";
  return <div className={`rounded-xl px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function Pill({
  color,
  children,
}: {
  color: "ok" | "amber" | "danger" | "grey" | "teal";
  children: ReactNode;
}) {
  const cls = {
    ok: "bg-okSoft text-ok",
    amber: "bg-amberSoft text-amber",
    danger: "bg-dangerSoft text-danger",
    grey: "bg-paper2 text-soft",
    teal: "bg-tealSoft text-teal",
  }[color];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function Loading() {
  return <p className="text-sm text-soft">{UI.carregant}</p>;
}

/** Títol de secció petit en majúscules. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="label">{children}</h2>;
}

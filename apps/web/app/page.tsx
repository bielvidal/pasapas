"use client";
import { blockMastery, dueReviews, reviewState } from "@pasapas/engine";
import Link from "next/link";
import { BlockCard } from "@/components/BlockCard";
import { ThemeSelector } from "@/components/ThemeSelector";
import { BLOCS } from "@/lib/content";
import { UI } from "@/lib/texts";
import { useAttempts } from "@/lib/useAttempts";

export default function Inici() {
  const attempts = useAttempts() ?? [];
  const due = dueReviews(reviewState(attempts)).length;
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <p className="text-stone-600 dark:text-stone-300">{UI.tagline}</p>
      {due > 0 && (
        <Link
          href="/repas"
          className="min-h-tap flex items-center justify-between rounded-3xl bg-accent px-5 py-4 text-lg font-semibold text-white shadow-sm dark:bg-accent-dark dark:text-stone-900"
        >
          <span>{UI.inici.repassa}</span>
          <span className="text-sm font-normal opacity-90">{UI.inici.repassaN(due)}</span>
        </Link>
      )}
      <h1 className="mt-2 text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {UI.inici.blocs}
      </h1>
      <div className="flex flex-col gap-3">
        {BLOCS.map((b) => (
          <BlockCard
            key={b.id}
            id={b.id}
            title={b.titol}
            mastery={blockMastery(attempts, b.id)}
            available={b.disponible}
          />
        ))}
      </div>
      <div className="mt-8">
        <ThemeSelector />
      </div>
      <p className="mt-2 text-center text-xs text-stone-400">
        {UI.versio(process.env.NEXT_PUBLIC_APP_VERSION ?? "dev")}
      </p>
    </div>
  );
}

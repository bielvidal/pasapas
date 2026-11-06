"use client";
import { blockMastery, dueReviews, reviewState } from "@pasapas/engine";
import Link from "next/link";
import { BlockCard } from "@/components/BlockCard";
import { SectionTitle } from "@/components/Frame";
import { BLOCS } from "@/lib/content";
import { useMe } from "@/lib/session";
import { UI } from "@/lib/texts";
import { useAttempts } from "@/lib/useAttempts";

export default function Inici() {
  const { me } = useMe();
  const attempts = useAttempts() ?? [];
  const due = dueReviews(reviewState(attempts)).length;
  return (
    <div className="flex flex-col gap-4 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl font-semibold">{UI.inici.hola(me.alias)}</h1>
        <p className="text-soft">{UI.tagline}</p>
      </div>
      {due > 0 && (
        <Link
          href="/repas"
          className="btn justify-between rounded-2xl px-5 py-4 text-lg font-semibold"
        >
          <span>{UI.inici.repassa}</span>
          <span className="text-sm font-normal opacity-90">{UI.inici.repassaN(due)}</span>
        </Link>
      )}
      {attempts.length > 0 && (
        <Link
          href="/proposats"
          className="card flex items-center justify-between gap-3 border-teal transition hover:bg-tealSoft"
        >
          <span>
            <span className="block font-display text-lg font-semibold text-teal">
              {UI.proposats.boto}
            </span>
            <span className="text-sm text-soft">{UI.proposats.botoSub}</span>
          </span>
          <span className="text-2xl text-teal" aria-hidden>
            →
          </span>
        </Link>
      )}
      <SectionTitle>{UI.inici.blocs}</SectionTitle>
      <div className="-mt-2 flex flex-col gap-3">
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
      <p className="mt-4 text-center text-xs text-faint">
        {UI.versio(process.env.NEXT_PUBLIC_APP_VERSION ?? "dev")}
      </p>
    </div>
  );
}

"use client";
import type { BlockMastery } from "@pasapas/engine";
import Link from "next/link";
import { UI } from "@/lib/texts";

const stateStyle: Record<BlockMastery["state"], string> = {
  en_marxa: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
  ho_vaig_agafant: "bg-accent-soft text-accent dark:bg-accent/20 dark:text-accent-dark",
  dominat: "bg-ok-soft text-ok dark:bg-ok/20 dark:text-ok-dark",
};

export function BlockCard({
  id,
  title,
  mastery,
  available,
}: {
  id: string;
  title: string;
  mastery: BlockMastery;
  available: boolean;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {id}
          </p>
          <h2 className="text-lg font-semibold leading-snug">{title}</h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${available ? stateStyle[mastery.state] : "bg-stone-100 text-stone-400 dark:bg-stone-800"}`}
        >
          {available ? UI.estat[mastery.state] : UI.inici.aviat}
        </span>
      </div>
      {available && mastery.total > 0 && (
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
          aria-hidden
        >
          <div
            className="h-full bg-accent dark:bg-accent-dark"
            style={{ width: `${mastery.rate ?? 0}%` }}
          />
        </div>
      )}
    </>
  );
  const cls = "block rounded-3xl bg-paper-card p-5 shadow-sm dark:bg-paper-darkcard";
  return available ? (
    <Link href={`/bloc/${id}`} className={`${cls} active:bg-accent-soft dark:active:bg-stone-700`}>
      {inner}
    </Link>
  ) : (
    <div className={`${cls} opacity-70`} aria-disabled>
      {inner}
    </div>
  );
}

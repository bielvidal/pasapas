"use client";
import type { BlockMastery } from "@pasapas/engine";
import Link from "next/link";
import { UI } from "@/lib/texts";
import { Pill } from "./Frame";

const stateColor: Record<BlockMastery["state"], "grey" | "teal" | "ok"> = {
  en_marxa: "grey",
  ho_vaig_agafant: "teal",
  dominat: "ok",
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
          <p className="label">{id}</p>
          <h2 className="font-display text-lg font-semibold leading-snug text-teal">{title}</h2>
        </div>
        <Pill color={available ? stateColor[mastery.state] : "grey"}>
          {available ? UI.estat[mastery.state] : UI.inici.aviat}
        </Pill>
      </div>
      {available && mastery.total > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper2" aria-hidden>
          <div className="h-full bg-teal" style={{ width: `${mastery.rate ?? 0}%` }} />
        </div>
      )}
    </>
  );
  return available ? (
    <Link
      href={`/bloc/${id}`}
      className="card block transition hover:border-teal active:bg-tealSoft"
    >
      {inner}
    </Link>
  ) : (
    <div className="card opacity-70" aria-disabled>
      {inner}
    </div>
  );
}

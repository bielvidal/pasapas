"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Ronda } from "@/components/Ronda";
import { ALL_TEMPLATES } from "@/lib/content";
import { db } from "@/lib/db";
import { randomSeed } from "@/lib/ids";
import { buildReviewRound, type RoundItem } from "@/lib/round";
import { UI } from "@/lib/texts";

export default function Repas() {
  const [seed, setSeed] = useState(() => randomSeed());
  const [items, setItems] = useState<RoundItem[] | null>(null);
  useEffect(() => {
    let alive = true;
    void db()
      .attempts.toArray()
      .then((attempts) => {
        if (alive) setItems(buildReviewRound(ALL_TEMPLATES, attempts, seed));
      });
    return () => {
      alive = false;
    };
  }, [seed]);
  if (!items) return <div className="p-6 text-center text-stone-500">…</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-bold">{UI.repas.titol}</h1>
        <p className="text-lg">{UI.repas.buit}</p>
        <Link
          href="/"
          className="min-h-tap rounded-2xl border-2 border-stone-300 px-4 py-3 text-center text-lg dark:border-stone-600"
        >
          {UI.final.inici}
        </Link>
      </div>
    );
  }
  return (
    <Ronda
      key={seed}
      items={items}
      mode="repas"
      block={null}
      onAgain={() => setSeed(randomSeed())}
    />
  );
}

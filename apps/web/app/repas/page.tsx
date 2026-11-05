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
  if (!items) return <p className="text-soft">{UI.carregant}</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold">{UI.repas.titol}</h1>
        <p className="text-lg">{UI.repas.buit}</p>
        <Link href="/" className="btn-soft py-3 text-lg">
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

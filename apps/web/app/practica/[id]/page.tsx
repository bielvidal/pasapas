"use client";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Ronda } from "@/components/Ronda";
import { ALL_TEMPLATES, blocById } from "@/lib/content";
import { db } from "@/lib/db";
import { randomSeed } from "@/lib/ids";
import { buildPracticeRound, type RoundItem } from "@/lib/round";
import { UI } from "@/lib/texts";

export default function Practica() {
  const { id } = useParams<{ id: string }>();
  const bloc = blocById(id);
  const [seed, setSeed] = useState(() => randomSeed());
  const [items, setItems] = useState<RoundItem[] | null>(null);
  const templates = useMemo(() => ALL_TEMPLATES.filter((t) => t.block === id), [id]);

  useEffect(() => {
    // La ronda es planifica una vegada, amb els intents que hi ha en aquell moment.
    let alive = true;
    void db()
      .attempts.toArray()
      .then((attempts) => {
        if (alive) setItems(buildPracticeRound(templates, attempts, id, seed));
      });
    return () => {
      alive = false;
    };
  }, [templates, id, seed]);

  if (!bloc || !bloc.disponible) notFound();
  if (!items) return <p className="text-soft">{UI.carregant}</p>;
  return (
    <Ronda
      key={seed}
      items={items}
      mode="practica"
      block={id}
      onAgain={() => setSeed(randomSeed())}
    />
  );
}

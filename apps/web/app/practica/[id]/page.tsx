"use client";
import type { QuestionType } from "@pasapas/engine";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Pill } from "@/components/Frame";
import { Ronda } from "@/components/Ronda";
import { ALL_TEMPLATES, blocById } from "@/lib/content";
import { db } from "@/lib/db";
import { parseDifficulty, readDifficulty, type Difficulty } from "@/lib/difficulty";
import { randomSeed } from "@/lib/ids";
import { buildPracticeRound, type RoundItem } from "@/lib/round";
import { UI } from "@/lib/texts";

const TYPES: QuestionType[] = ["mc_result", "next_step", "valid_step", "find_error"];

export default function PracticaPage() {
  return (
    <Suspense fallback={<p className="text-soft">{UI.carregant}</p>}>
      <Practica />
    </Suspense>
  );
}

function Practica() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const bloc = blocById(id);
  const [seed, setSeed] = useState(() => randomSeed());
  const [items, setItems] = useState<RoundItem[] | null>(null);
  const templates = useMemo(() => ALL_TEMPLATES.filter((t) => t.block === id), [id]);
  // ?nivell= i ?tipus= (des del mapa de calor) manen; si no, la dificultat triada al bloc.
  const fromUrl = parseDifficulty(params.get("nivell"));
  const tipus = params.get("tipus");
  const types = tipus && (TYPES as string[]).includes(tipus) ? [tipus as QuestionType] : undefined;
  const [level] = useState<Difficulty>(() => fromUrl ?? readDifficulty(id));

  useEffect(() => {
    // La ronda es planifica una vegada, amb els intents que hi ha en aquell moment.
    let alive = true;
    void db()
      .attempts.toArray()
      .then((attempts) => {
        if (!alive) return;
        const choice = types ? { level, types } : { level };
        setItems(buildPracticeRound(templates, attempts, id, seed, new Date(), choice));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, id, seed, level, tipus]);

  if (!bloc || !bloc.disponible) notFound();
  if (!items) return <p className="text-soft">{UI.carregant}</p>;
  const D = UI.dificultat;
  return (
    <>
      <div className="mb-2 flex flex-wrap gap-2">
        <Pill color="teal">{D.ara(level === "auto" ? D.auto : D.curt[level]!)}</Pill>
        {types && <Pill color="grey">{D.tipus(UI.tipus[types[0]!]!)}</Pill>}
      </div>
      <Ronda
        key={seed}
        items={items}
        mode="practica"
        block={id}
        onAgain={() => setSeed(randomSeed())}
      />
    </>
  );
}

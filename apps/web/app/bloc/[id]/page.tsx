"use client";
import type { Level } from "@pasapas/engine";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SectionTitle } from "@/components/Frame";
import { Math, MixedText } from "@/components/Math";
import { blocById, templatesOfBlock } from "@/lib/content";
import { UI } from "@/lib/texts";

export default function Apren() {
  const { id } = useParams<{ id: string }>();
  const bloc = blocById(id);
  if (!bloc || !bloc.disponible) notFound();
  const levels = [...new Set(templatesOfBlock(id).map((t) => t.level))].sort() as Level[];
  return (
    <div className="flex flex-col gap-5 animate-fadeUp">
      <div>
        <p className="label">{bloc.id}</p>
        <h1 className="font-display text-2xl font-semibold leading-tight">{bloc.titol}</h1>
      </div>
      <section className="rounded-2xl bg-tealSoft p-5">
        <h2 className="label text-teal">{UI.apren.reglaOr}</h2>
        <p className="mt-2 text-lg leading-relaxed">
          <MixedText text={bloc.reglaOr} />
        </p>
      </section>
      <section className="card">
        <SectionTitle>{UI.apren.exemples}</SectionTitle>
        <ol className="mt-2 flex flex-col gap-3">
          {bloc.exemples.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-semibold text-faint">{i + 1}.</span>
              <Math latex={e} display className="flex-1 text-lg" />
            </li>
          ))}
        </ol>
      </section>
      <DifficultySelector block={bloc.id} levels={levels} />
      <Link href={`/practica/${bloc.id}`} className="btn py-4 text-lg">
        {UI.apren.comenca}
      </Link>
      <Link href="/" className="link min-h-tap py-2 text-center">
        {UI.apren.tornar}
      </Link>
    </div>
  );
}

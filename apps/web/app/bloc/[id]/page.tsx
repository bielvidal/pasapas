"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Math, MixedText } from "@/components/Math";
import { blocById } from "@/lib/content";
import { UI } from "@/lib/texts";

export default function Apren() {
  const { id } = useParams<{ id: string }>();
  const bloc = blocById(id);
  if (!bloc || !bloc.disponible) notFound();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {bloc.id}
        </p>
        <h1 className="text-2xl font-bold leading-tight">{bloc.titol}</h1>
      </div>
      <section className="rounded-3xl bg-accent-soft p-5 dark:bg-accent/15">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent dark:text-accent-dark">
          {UI.apren.reglaOr}
        </h2>
        <p className="mt-2 text-lg leading-relaxed">
          <MixedText text={bloc.reglaOr} />
        </p>
      </section>
      <section className="rounded-3xl bg-paper-card p-5 shadow-sm dark:bg-paper-darkcard">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {UI.apren.exemples}
        </h2>
        <ol className="mt-2 flex flex-col gap-3">
          {bloc.exemples.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-semibold text-stone-400">{i + 1}.</span>
              <Math latex={e} display className="flex-1 text-lg" />
            </li>
          ))}
        </ol>
      </section>
      <Link
        href={`/practica/${bloc.id}`}
        className="min-h-tap rounded-2xl bg-accent px-4 py-4 text-center text-lg font-semibold text-white dark:bg-accent-dark dark:text-stone-900"
      >
        {UI.apren.comenca}
      </Link>
      <Link href="/" className="min-h-tap py-2 text-center text-accent dark:text-accent-dark">
        {UI.apren.tornar}
      </Link>
    </div>
  );
}

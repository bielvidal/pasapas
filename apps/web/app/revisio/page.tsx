"use client";
// Revisió (només tutor): totes les plantilles amb exemples generats i renderitzats, per revisar
// enunciats, opcions, tags i textos sense llegir TypeScript.
import { buildItem, type Item } from "@pasapas/engine";
import type { Machine } from "@pasapas/content-algebra";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Pill, SectionTitle } from "@/components/Frame";
import { Math, MixedText } from "@/components/Math";
import { ALL_TEMPLATES, BLOCS, tagName } from "@/lib/content";
import { useMe } from "@/lib/session";
import { UI } from "@/lib/texts";

export default function RevisioPage() {
  return (
    <Suspense fallback={null}>
      <Revisio />
    </Suspense>
  );
}

function Revisio() {
  const { me } = useMe();
  const router = useRouter();
  const params = useSearchParams();
  const only = params.get("t");
  useEffect(() => {
    if (me.role !== "tutor") router.replace("/");
  }, [me, router]);
  if (me.role !== "tutor") return null;
  const templates = only ? ALL_TEMPLATES.filter((t) => t.id === only) : ALL_TEMPLATES;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{UI.revisio.titol}</h1>
        <p className="text-soft">{UI.revisio.sub}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/revisio"
            className={`min-h-tap inline-flex items-center rounded-full border px-3 text-sm ${!only ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
          >
            Tot
          </a>
          {ALL_TEMPLATES.map((t) => (
            <a
              key={t.id}
              href={`/revisio?t=${t.id}`}
              className={`min-h-tap inline-flex items-center rounded-full border px-3 text-sm ${only === t.id ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
            >
              {t.id}
            </a>
          ))}
        </div>
      </div>
      {BLOCS.map((b) => {
        const ts = templates.filter((t) => t.block === b.id);
        if (!ts.length) return null;
        return (
          <section key={b.id} className="space-y-4">
            <SectionTitle>
              {b.id} · {b.titol}
            </SectionTitle>
            {ts.map((t) => (
              <TemplateCard key={t.id} id={t.id} initial={only ? 6 : 2} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function TemplateCard({ id, initial }: { id: string; initial: number }) {
  const t = ALL_TEMPLATES.find((x) => x.id === id)!;
  const [n, setN] = useState(initial);
  const items: Item<Machine>[] = Array.from({ length: n }, (_, i) => buildItem(t, i + 1));
  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-lg font-semibold text-teal">{t.id}</span>
        <Pill color="grey">{t.type}</Pill>
        <Pill color="grey">{UI.revisio.nivell(t.level)}</Pill>
      </div>
      {items.map((item) => (
        <ItemView key={item.seed} item={item} />
      ))}
      <button className="btn-soft" onClick={() => setN(n + 3)}>
        {UI.revisio.mes}
      </button>
    </div>
  );
}

function ItemView({ item }: { item: Item<Machine> }) {
  return (
    <div className="rounded-xl border border-line bg-paper2 p-3 text-sm">
      <p className="label">
        {UI.revisio.llavor(item.seed)} · {item.instruction}
      </p>
      {item.type === "valid_step" ? (
        <p className="my-1 text-base">
          <Math latex={item.step.beforeLatex} /> <span className="text-faint">⟹</span>{" "}
          <Math latex={item.step.afterLatex} />{" "}
          <Pill color={item.step.valid ? "ok" : "amber"}>
            {item.step.valid ? UI.revisio.valid : `${UI.revisio.invalid} · ${item.step.errorTag}`}
          </Pill>
        </p>
      ) : (
        <Math latex={item.promptLatex} display className="my-1 text-base" />
      )}
      {item.type === "find_error" && (
        <ol className="my-1 space-y-1">
          {item.steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-faint">{i + 1}.</span>
              <Math latex={s.latex} />
              {item.errorIndex === i && <Pill color="amber">{UI.revisio.error}</Pill>}
            </li>
          ))}
        </ol>
      )}
      <ul className="my-1 space-y-1">
        {item.options.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-2">
            <span className={o.correct ? "font-bold text-ok" : "text-faint"}>
              {o.correct ? "✓" : "·"}
            </span>
            <span>{o.text ? <MixedText text={o.text} /> : <Math latex={o.latex} />}</span>
            {o.errorTag && (
              <span className="text-xs text-soft">
                {o.errorTag} · {tagName(o.errorTag)}
              </span>
            )}
            {o.explanationOverride && (
              <span className="text-xs italic text-soft">override: {o.explanationOverride}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-soft">
        <MixedText text={item.explanationCorrect} />
      </p>
    </div>
  );
}

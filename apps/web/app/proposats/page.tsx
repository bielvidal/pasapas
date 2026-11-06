"use client";
import { mulberry32, planProposedRound, type ProposalReason } from "@pasapas/engine";
import { tagTemplateIndex } from "@pasapas/content-algebra";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MixedText } from "@/components/Math";
import { Ronda } from "@/components/Ronda";
import { ALL_TEMPLATES, blocById, tagName, templateById } from "@/lib/content";
import { db } from "@/lib/db";
import { randomSeed } from "@/lib/ids";
import type { RoundItem } from "@/lib/round";
import { buildItem } from "@pasapas/engine";
import { UI } from "@/lib/texts";

/** «Proposats per a tu»: ronda personal calculada al dispositiu amb els intents de l'alumna. */
export default function Proposats() {
  const [seed, setSeed] = useState(() => randomSeed());
  const [state, setState] = useState<{ items: RoundItem[]; reason: ProposalReason } | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let alive = true;
    void db()
      .attempts.toArray()
      .then((attempts) => {
        if (!alive) return;
        const { plan, reason } = planProposedRound({
          templates: ALL_TEMPLATES,
          attempts,
          tagTemplates: tagTemplateIndex(),
          rng: mulberry32(seed),
        });
        const items = plan.map((p) => ({
          plan: p,
          item: buildItem(templateById(p.templateId)!, p.seed),
        }));
        setState({ items, reason });
      });
    return () => {
      alive = false;
    };
  }, [seed]);

  const P = UI.proposats;
  if (!state) return <p className="text-soft">{UI.carregant}</p>;
  const { items, reason } = state;
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold">{P.titol}</h1>
        <p className="text-lg">{P.buit}</p>
        <Link href="/" className="btn-soft py-3 text-lg">
          {UI.final.inici}
        </Link>
      </div>
    );
  }
  if (started) {
    return (
      <Ronda
        key={seed}
        items={items}
        mode="proposats"
        block={null}
        focusTags={[...reason.reinforce, ...(reason.confirm ? [reason.confirm] : [])]}
        onAgain={() => {
          setStarted(false);
          setState(null);
          setSeed(randomSeed());
        }}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4 animate-fadeUp">
      <h1 className="font-display text-2xl font-semibold">{P.titol}</h1>
      <div className="card space-y-2">
        <p>{P.intro}</p>
        <ul className="list-disc space-y-1 pl-5">
          {reason.reinforce.length > 0 && (
            <li>
              {P.reforcar(reason.reinforce.length)}:
              <ul className="mt-1 list-none space-y-1 pl-0">
                {reason.reinforce.map((t) => (
                  <li key={t} className="text-soft">
                    · <MixedText text={tagName(t)} />
                  </li>
                ))}
              </ul>
            </li>
          )}
          {reason.weakCell && (
            <li>
              {P.cella(
                blocById(reason.weakCell.block)?.titol ?? reason.weakCell.block,
                reason.weakCell.level,
              )}
            </li>
          )}
          {reason.reviews > 0 && <li>{P.repas(reason.reviews)}</li>}
          {reason.confirm && <li>{P.confirmar}</li>}
        </ul>
      </div>
      <button className="btn py-4 text-lg" onClick={() => setStarted(true)}>
        {UI.apren.comenca}
      </button>
      <Link href="/" className="link min-h-tap py-2 text-center">
        {UI.apren.tornar}
      </Link>
    </div>
  );
}

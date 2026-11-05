"use client";
import type { Grade } from "@pasapas/engine";
import { useState } from "react";
import { tagExplanation, tagName } from "@/lib/content";
import { UI } from "@/lib/texts";
import { MixedText } from "./Math";

/**
 * Explicació després de respondre (§2, principis 3-5): mai «incorrecte» a seques.
 * - encert: «Molt bé!» + «Per què és correcte?» desplegable;
 * - error: «Aquí has fet: <nom del tag>» + explicació del tag + com es fa;
 * - saltat: la explicació sense més.
 */
export function Explanation({
  grade,
  explanationCorrect,
  override,
  onOpenCorrect,
}: {
  grade: Grade;
  explanationCorrect: string;
  override?: string | undefined;
  onOpenCorrect: () => void;
}) {
  const [open, setOpen] = useState(grade.outcome !== "correct");
  const openCorrect = () => {
    setOpen(true);
    onOpenCorrect();
  };
  return (
    <div
      className="mt-4 rounded-2xl bg-stone-100 p-4 text-base leading-relaxed dark:bg-stone-800"
      role="status"
    >
      {grade.outcome === "correct" && (
        <p className="font-semibold text-ok dark:text-ok-dark">{UI.pregunta.moltBe}</p>
      )}
      {grade.outcome === "incorrect" && grade.errorTag && (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-warm dark:text-warm-dark">
            {UI.pregunta.aquiHasFet}
          </p>
          <p className="font-semibold">{tagName(grade.errorTag)}</p>
          <p className="mt-1">
            <MixedText text={override ?? tagExplanation(grade.errorTag)} />
          </p>
        </div>
      )}
      {grade.outcome === "skipped" && <p className="font-semibold">{UI.pregunta.capProblema}</p>}

      {open ? (
        <div
          className={
            grade.outcome === "correct"
              ? "mt-2"
              : "mt-3 border-t border-stone-300 pt-3 dark:border-stone-600"
          }
        >
          {grade.outcome === "incorrect" && (
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {UI.pregunta.comEsFa}
            </p>
          )}
          <p>
            <MixedText text={explanationCorrect} />
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={openCorrect}
          className="mt-2 min-h-tap text-accent underline-offset-2 hover:underline dark:text-accent-dark"
        >
          {UI.pregunta.perQueCorrecte}
        </button>
      )}
    </div>
  );
}

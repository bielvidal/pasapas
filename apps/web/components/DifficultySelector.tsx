"use client";
import type { Level } from "@pasapas/engine";
import { useDifficulty, type Difficulty } from "@/lib/difficulty";
import { UI } from "@/lib/texts";

/** Tria de dificultat d'un bloc: Automàtica o un nivell fix (es recorda al dispositiu). */
export function DifficultySelector({ block, levels }: { block: string; levels: Level[] }) {
  const [d, setD] = useDifficulty(block);
  const opts: Difficulty[] = ["auto", ...levels];
  const T = UI.dificultat;
  return (
    <fieldset className="card space-y-2">
      <legend className="sr-only">{T.titol}</legend>
      <span className="label">{T.titol}</span>
      <div role="radiogroup" aria-label={T.titol} className="flex flex-col gap-2">
        {opts.map((o) => {
          const active = d === o;
          return (
            <button
              key={String(o)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setD(o)}
              className={`min-h-tap rounded-xl border-2 px-4 py-2 text-left transition ${active ? "border-teal bg-tealSoft" : "border-line bg-card hover:border-teal"}`}
            >
              <span className="font-medium">{o === "auto" ? T.auto : T.nivells[o]}</span>
              {o === "auto" && <span className="block text-sm text-soft">{T.autoDesc}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

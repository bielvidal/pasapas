"use client";
import { grade as gradeChoice, type Attempt, type Grade } from "@pasapas/engine";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tagName } from "@/lib/content";
import { db } from "@/lib/db";
import { uuid } from "@/lib/ids";
import { gradeValidStep, makeAttempt, summarizeRound, type RoundItem } from "@/lib/round";
import { UI } from "@/lib/texts";
import { Explanation } from "./Explanation";
import { Math, MixedText } from "./Math";
import { OptionButton, type OptionState } from "./OptionButton";

type Phase = "answer" | "answered" | "done";

/**
 * Una ronda completa: pregunta → explicació → següent → resum. Sense cronòmetre, sense punts
 * negatius (§2). Cada resposta es desa a IndexedDB a l'instant.
 */
export function Ronda({
  items,
  mode,
  block,
  onAgain,
}: {
  items: RoundItem[];
  mode: "practica" | "repas";
  block: string | null;
  onAgain: () => void;
}) {
  const sessionId = useMemo(() => uuid(), []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [saidValid, setSaidValid] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const lastAttemptId = useRef<string | null>(null);

  useEffect(() => {
    void db().sessions.put({
      id: sessionId,
      mode,
      block,
      startedAt: new Date().toISOString(),
      endedAt: null,
    });
  }, [sessionId, mode, block]);

  const current = items[index];

  const record = useCallback(
    async (g: Grade) => {
      if (!current) return;
      const a = makeAttempt(sessionId, current, g);
      lastAttemptId.current = a.id;
      await db().attempts.add(a);
      setAttempts((prev) => [...prev, a]);
      setGrade(g);
      setPhase("answered");
    },
    [current, sessionId],
  );

  const choose = (optionId: string | null) => {
    if (!current || phase !== "answer") return;
    if (current.item.type === "valid_step") {
      void record(gradeValidStep(current.item, saidValid ?? !current.item.step.valid, optionId));
    } else {
      void record(gradeChoice(current.item, optionId));
    }
  };

  const openCorrect = () => {
    if (lastAttemptId.current)
      void db().attempts.update(lastAttemptId.current, { explanationOpened: true });
  };

  const next = async () => {
    if (index + 1 >= items.length) {
      await db().sessions.update(sessionId, { endedAt: new Date().toISOString() });
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setPhase("answer");
    setGrade(null);
    setSaidValid(null);
  };

  if (phase === "done" || !current) return <Resum attempts={attempts} onAgain={onAgain} />;

  const { item, plan } = current;
  const answered = phase === "answered";
  const stateOf = (id: string, correct: boolean): OptionState => {
    if (!answered) return "idle";
    if (grade?.chosenOptionId === id) return correct ? "chosen-correct" : "chosen-wrong";
    if (correct) return "reveal-correct";
    return "dim";
  };
  const chosenOverride = grade?.chosenOptionId
    ? item.options.find((o) => o.id === grade.chosenOptionId)?.explanationOverride
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-28 pt-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>{UI.pregunta.de(index + 1, items.length)}</span>
        <span className="flex gap-2">
          {plan.slot === "review" && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent dark:bg-accent/20 dark:text-accent-dark">
              {UI.pregunta.repas}
            </span>
          )}
          {plan.slot === "next" && (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 dark:bg-stone-700">
              {UI.pregunta.nouNivell}
            </span>
          )}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
        aria-hidden
      >
        <div
          className="h-full bg-accent transition-all dark:bg-accent-dark"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      <section className="rounded-3xl bg-paper-card p-5 shadow-sm dark:bg-paper-darkcard">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {item.instruction}
        </p>
        {item.type === "find_error" ? (
          <Math latex={item.promptLatex} display className="mt-2 text-xl" />
        ) : item.type === "valid_step" ? (
          <div className="mt-3 flex flex-col items-center gap-1 text-2xl">
            <Math latex={item.step.beforeLatex} display />
            <span className="text-stone-400">⇓</span>
            <Math latex={item.step.afterLatex} display />
          </div>
        ) : (
          <Math latex={item.promptLatex} display className="mt-2 text-2xl" />
        )}
      </section>

      {item.type === "find_error" && (
        <ol className="flex flex-col gap-2">
          {item.steps.map((s, i) => (
            <li key={i}>
              <OptionButton
                option={item.options[i]!}
                state={stateOf(`step:${i}`, item.options[i]!.correct)}
                onClick={() => choose(`step:${i}`)}
                disabled={answered}
                label={UI.pregunta.pas(i + 1)}
              />
            </li>
          ))}
          <li>
            <OptionButton
              option={item.options[item.steps.length]!}
              state={stateOf("none", item.errorIndex === null)}
              onClick={() => choose("none")}
              disabled={answered}
            />
          </li>
        </ol>
      )}

      {item.type === "valid_step" && saidValid === null && !answered && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSaidValid(true)}
            className="min-h-tap rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-lg dark:border-stone-600 dark:bg-paper-darkcard"
          >
            {UI.pregunta.siValid}
          </button>
          <button
            type="button"
            onClick={() => setSaidValid(false)}
            className="min-h-tap rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 text-lg dark:border-stone-600 dark:bg-paper-darkcard"
          >
            {UI.pregunta.noValid}
          </button>
        </div>
      )}

      {item.type === "valid_step" && (saidValid !== null || answered) && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {saidValid === null ? "" : saidValid ? UI.pregunta.siValid : UI.pregunta.noValid} ·{" "}
            {UI.pregunta.perQue}
          </p>
          {item.options.map((o) => (
            <OptionButton
              key={o.id}
              option={o}
              state={stateOf(o.id, o.correct)}
              onClick={() => choose(o.id)}
              disabled={answered}
            />
          ))}
        </div>
      )}

      {(item.type === "mc_result" || item.type === "next_step") && (
        <div className="flex flex-col gap-2">
          {item.options.map((o) => (
            <OptionButton
              key={o.id}
              option={o}
              state={stateOf(o.id, o.correct)}
              onClick={() => choose(o.id)}
              disabled={answered}
            />
          ))}
        </div>
      )}

      {answered && grade && (
        <Explanation
          grade={grade}
          explanationCorrect={item.explanationCorrect}
          override={chosenOverride}
          onOpenCorrect={openCorrect}
        />
      )}

      <div
        className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-paper/95 p-3 backdrop-blur dark:border-stone-700 dark:bg-paper-dark/95"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl gap-3">
          {!answered ? (
            <button
              type="button"
              onClick={() => choose(null)}
              className="min-h-tap flex-1 rounded-2xl border-2 border-stone-300 px-4 py-3 text-lg text-stone-700 dark:border-stone-600 dark:text-stone-200"
            >
              {UI.pregunta.encaraNo}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void next()}
              className="min-h-tap flex-1 rounded-2xl bg-accent px-4 py-3 text-lg font-semibold text-white dark:bg-accent-dark dark:text-stone-900"
            >
              {index + 1 >= items.length ? UI.pregunta.acabar : UI.pregunta.seguent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Resum({ attempts, onAgain }: { attempts: Attempt[]; onAgain: () => void }) {
  const s = summarizeRound(attempts);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6">
      <h1 className="text-2xl font-bold">{UI.final.titol}</h1>
      <p className="text-lg">
        {UI.final.resum(s.correct, s.total)}
        {s.skipped > 0 && <span className="text-stone-500"> · {UI.final.saltades(s.skipped)}</span>}
      </p>
      {s.avoided.length > 0 && (
        <section className="rounded-3xl bg-ok-soft p-5 dark:bg-ok/15">
          <h2 className="font-semibold text-ok dark:text-ok-dark">{UI.final.jaNoEtPassa}</h2>
          <ul className="mt-2 list-disc pl-5">
            {s.avoided.map((t) => (
              <li key={t}>{tagName(t)}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-3xl bg-stone-100 p-5 dark:bg-stone-800">
        <h2 className="font-semibold">{UI.final.perRepassar}</h2>
        {s.chosen.length === 0 ? (
          <p className="mt-2">{UI.final.resPerRepassar}</p>
        ) : (
          <ul className="mt-2 list-disc pl-5">
            {s.chosen.map(({ tag, count }) => (
              <li key={tag}>
                <MixedText text={tagName(tag)} />
                {count > 1 && (
                  <span className="text-stone-500"> · {UI.progres.vegades(count)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="min-h-tap rounded-2xl bg-accent px-4 py-3 text-lg font-semibold text-white dark:bg-accent-dark dark:text-stone-900"
        >
          {UI.final.unaAltra}
        </button>
        <Link
          href="/"
          className="min-h-tap rounded-2xl border-2 border-stone-300 px-4 py-3 text-center text-lg dark:border-stone-600"
        >
          {UI.final.inici}
        </Link>
      </div>
    </div>
  );
}

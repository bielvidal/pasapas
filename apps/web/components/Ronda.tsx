"use client";
import { grade as gradeChoice, type Attempt, type Grade } from "@pasapas/engine";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tagName } from "@/lib/content";
import { db } from "@/lib/db";
import { uuid } from "@/lib/ids";
import { gradeValidStep, makeAttempt, summarizeRound, type RoundItem } from "@/lib/round";
import { scheduleSync } from "@/lib/sync";
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
  focusTags = [],
}: {
  items: RoundItem[];
  mode: "practica" | "repas" | "proposats";
  block: string | null;
  onAgain: () => void;
  /** «Proposats per a tu»: errors treballats, per al resum. */
  focusTags?: string[];
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
      synced: 0,
    });
  }, [sessionId, mode, block]);

  const current = items[index];

  const record = useCallback(
    async (g: Grade) => {
      if (!current) return;
      const a = makeAttempt(sessionId, current, g);
      lastAttemptId.current = a.id;
      await db().attempts.add({ ...a, synced: 0 });
      scheduleSync();
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
      await db().sessions.update(sessionId, { endedAt: new Date().toISOString(), synced: 0 });
      scheduleSync(300);
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setPhase("answer");
    setGrade(null);
    setSaidValid(null);
  };

  if (phase === "done" || !current)
    return <Resum attempts={attempts} onAgain={onAgain} focusTags={focusTags} />;

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
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center justify-between text-sm text-soft">
        <span>{UI.pregunta.de(index + 1, items.length)}</span>
        <span className="flex gap-2">
          {plan.slot === "review" && (
            <span className="rounded-full bg-tealSoft px-2 py-0.5 text-teal">
              {UI.pregunta.repas}
            </span>
          )}
          {plan.slot === "next" && (
            <span className="rounded-full bg-paper2 px-2 py-0.5">{UI.pregunta.nouNivell}</span>
          )}
          {plan.slot === "reinforce" && (
            <span className="rounded-full bg-amberSoft px-2 py-0.5 text-amber">
              {UI.pregunta.reforc}
            </span>
          )}
          {plan.slot === "confirm" && (
            <span className="rounded-full bg-okSoft px-2 py-0.5 text-ok">
              {UI.pregunta.confirmacio}
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper2" aria-hidden>
        <div
          className="h-full bg-teal transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      <section className="card">
        <p className="label">{item.instruction}</p>
        {item.type === "find_error" ? (
          <Math latex={item.promptLatex} display className="mt-2 text-xl" />
        ) : item.type === "valid_step" ? (
          <div className="mt-3 flex flex-col items-center gap-1 text-2xl">
            <Math latex={item.step.beforeLatex} display />
            <span className="text-faint">⇓</span>
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
            className="min-h-tap rounded-2xl border-2 border-line2 bg-card px-4 py-3 text-lg hover:border-teal active:bg-tealSoft"
          >
            {UI.pregunta.siValid}
          </button>
          <button
            type="button"
            onClick={() => setSaidValid(false)}
            className="min-h-tap rounded-2xl border-2 border-line2 bg-card px-4 py-3 text-lg hover:border-teal active:bg-tealSoft"
          >
            {UI.pregunta.noValid}
          </button>
        </div>
      )}

      {item.type === "valid_step" && (saidValid !== null || answered) && (
        <div className="flex flex-col gap-2">
          <p className="label">
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
        className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 p-3 backdrop-blur"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl gap-3">
          {!answered ? (
            <button
              type="button"
              onClick={() => choose(null)}
              className="btn-soft flex-1 rounded-2xl px-4 py-3 text-lg"
            >
              {UI.pregunta.encaraNo}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void next()}
              className="btn flex-1 rounded-2xl px-4 py-3 text-lg font-semibold"
            >
              {index + 1 >= items.length ? UI.pregunta.acabar : UI.pregunta.seguent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Resum({
  attempts,
  onAgain,
  focusTags,
}: {
  attempts: Attempt[];
  onAgain: () => void;
  focusTags: string[];
}) {
  const s = summarizeRound(attempts);
  const P = UI.proposats;
  // Errors treballats: només els que s'han presentat de debò en aquesta ronda.
  const worked = focusTags.filter((t) => attempts.some((a) => a.presentedErrorTags.includes(t)));
  return (
    <div className="flex flex-col gap-5 animate-fadeUp">
      <h1 className="font-display text-2xl font-semibold">{UI.final.titol}</h1>
      <p className="text-lg">
        {UI.final.resum(s.correct, s.total)}
        {s.skipped > 0 && <span className="text-soft"> · {UI.final.saltades(s.skipped)}</span>}
      </p>
      {worked.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">{P.hemTreballat}</h2>
          <ul className="mt-2 space-y-1">
            {worked.map((t) => {
              const again = attempts.some((a) => a.errorTag === t);
              return (
                <li key={t} className="flex flex-wrap items-center gap-2">
                  <MixedText text={tagName(t)} />
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${again ? "bg-amberSoft text-amber" : "bg-okSoft text-ok"}`}
                  >
                    {again ? P.encaraEtPassa : P.jaNoEtPassa}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {s.avoided.length > 0 && (
        <section className="rounded-2xl bg-okSoft p-5">
          <h2 className="font-semibold text-ok">{UI.final.jaNoEtPassa}</h2>
          <ul className="mt-2 list-disc pl-5">
            {s.avoided.map((t) => (
              <li key={t}>{tagName(t)}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="card bg-paper2 p-5">
        <h2 className="font-semibold">{UI.final.perRepassar}</h2>
        {s.chosen.length === 0 ? (
          <p className="mt-2">{UI.final.resPerRepassar}</p>
        ) : (
          <ul className="mt-2 list-disc pl-5">
            {s.chosen.map(({ tag, count }) => (
              <li key={tag}>
                <MixedText text={tagName(tag)} />
                {count > 1 && <span className="text-soft"> · {UI.progres.vegades(count)}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={onAgain} className="btn py-3 text-lg">
          {UI.final.unaAltra}
        </button>
        <Link href="/" className="btn-soft py-3 text-lg">
          {UI.final.inici}
        </Link>
      </div>
    </div>
  );
}

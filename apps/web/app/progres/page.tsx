"use client";
import {
  activeDays,
  allTagsMastery,
  blockMastery,
  weeklySeries,
  weeklyTagChoices,
} from "@pasapas/engine";
import { MixedText } from "@/components/Math";
import { Sparkline } from "@/components/Sparkline";
import { BLOCS, tagName } from "@/lib/content";
import { UI } from "@/lib/texts";
import { useAttempts } from "@/lib/useAttempts";

const WEEKS = 8;

/**
 * «El meu progrés» = el panell del tutor (§2, principi 7): la mateixa vista per a tothom.
 * Progrés en positiu (§2.6): primer el que ja domina. Sense temps per pregunta, mai.
 */
export default function Progres() {
  const attempts = useAttempts() ?? [];
  const now = new Date();
  const weeks = weeklySeries(attempts, WEEKS, now);
  const tags = allTagsMastery(attempts).sort((a, b) => {
    if (a.state !== b.state) return a.state === "actiu" ? -1 : 1;
    return b.chosen - a.chosen;
  });
  const days = new Set(activeDays(attempts));
  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (27 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, active: days.has(key) };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.attempts));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">{UI.progres.titol}</h1>
        <p className="text-stone-500 dark:text-stone-400">{UI.progres.subtitol}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {UI.progres.blocs}
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {BLOCS.filter((b) => b.disponible).map((b) => {
            const m = blockMastery(attempts, b.id);
            return (
              <li
                key={b.id}
                className="rounded-2xl bg-paper-card p-4 shadow-sm dark:bg-paper-darkcard"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{b.titol}</span>
                  <span className="text-sm">{UI.estat[m.state]}</span>
                </div>
                {m.total === 0 ? (
                  <p className="mt-1 text-sm text-stone-500">{UI.progres.senseIntents}</p>
                ) : (
                  <p className="mt-1 text-sm text-stone-500">
                    {m.correct}/{m.total} {UI.progres.encerts} (últims {m.total})
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {UI.progres.setmanes}
        </h2>
        <div
          className="mt-2 flex h-28 items-end gap-2 rounded-2xl bg-paper-card p-4 shadow-sm dark:bg-paper-darkcard"
          role="img"
          aria-label={UI.progres.setmanes}
        >
          {weeks.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-col justify-end" style={{ height: 64 }}>
                <div
                  className="w-full rounded-t bg-stone-200 dark:bg-stone-700"
                  style={{ height: `${(w.attempts / maxWeek) * 100}%` }}
                >
                  <div
                    className="w-full rounded-t bg-accent dark:bg-accent-dark"
                    style={{ height: w.attempts ? `${(w.correct / w.attempts) * 100}%` : 0 }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-stone-400">
                {w.week.slice(8)}/{w.week.slice(5, 7)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {UI.progres.errors}
        </h2>
        {tags.length === 0 ? (
          <p className="mt-2 text-stone-500">{UI.progres.errorsBuit}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {tags.map((t) => (
              <li
                key={t.tag}
                className="flex items-center gap-3 rounded-2xl bg-paper-card p-4 shadow-sm dark:bg-paper-darkcard"
              >
                <div className="flex-1">
                  <p className="font-medium leading-snug">
                    <MixedText text={tagName(t.tag)} />
                  </p>
                  <p className="text-sm text-stone-500">
                    {UI.progres.vegades(t.chosen)} · {t.tag.slice(0, 2)}
                  </p>
                </div>
                <Sparkline values={weeklyTagChoices(attempts, t.tag, WEEKS, now)} />
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${t.state === "superat" ? "bg-ok-soft text-ok dark:bg-ok/20 dark:text-ok-dark" : "bg-warm-soft text-warm dark:bg-warm/20 dark:text-warm-dark"}`}
                >
                  {t.state === "superat" ? UI.progres.superat : UI.progres.actiu}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {UI.progres.diesActius}
        </h2>
        <div className="mt-2 grid grid-cols-7 gap-2 rounded-2xl bg-paper-card p-4 shadow-sm dark:bg-paper-darkcard">
          {last28.map((d) => (
            <div
              key={d.key}
              title={d.key}
              className={`aspect-square rounded-lg ${d.active ? "bg-accent dark:bg-accent-dark" : "bg-stone-100 dark:bg-stone-800"}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";
import {
  activeDays,
  allTagsMastery,
  blockMastery,
  currentLevel,
  levelMastery,
  weeklySeries,
  weeklyTagChoices,
  type Attempt,
  type BlockMastery,
} from "@pasapas/engine";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Loading, Notice, Pill, SectionTitle } from "@/components/Frame";
import { MixedText } from "@/components/Math";
import { Sparkline } from "@/components/Sparkline";
import { api, type UserRow } from "@/lib/api";
import { BLOCS, tagName } from "@/lib/content";
import { useMe } from "@/lib/session";
import { fetchAttemptsOf, syncAll } from "@/lib/sync";
import { ago, UI } from "@/lib/texts";
import { useAttempts } from "@/lib/useAttempts";

const WINDOWS = [4, 8, 12] as const;

/**
 * «El meu progrés» = el panell del tutor (§2, principi 7): la mateixa vista per a tothom. El tutor
 * tria l'alumna (`?user=`) i veu, amb el mateix codi, els intents d'ella llegits del servidor
 * (ACUERDO D3: agregació en TS al client). Progrés en positiu (§2.6). Sense temps per pregunta, mai.
 */
export default function ProgresPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Progres />
    </Suspense>
  );
}

function Progres() {
  const { me } = useMe();
  const params = useSearchParams();
  const userParam = Number(params.get("user"));
  const other = me.role === "tutor" && userParam && userParam !== me.id ? userParam : null;
  const local = useAttempts();
  const [remoteByUser, setRemoteByUser] = useState<Record<number, Attempt[]>>({});
  const [students, setStudents] = useState<UserRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void syncAll();
  }, []);
  useEffect(() => {
    if (me.role !== "tutor") return;
    api<UserRow[]>("/api/admin/users")
      .then((u) => setStudents(u.filter((x) => x.id !== me.id)))
      .catch(() => {});
  }, [me]);
  useEffect(() => {
    if (!other) return;
    fetchAttemptsOf(other)
      .then((a) => {
        setRemoteByUser((prev) => ({ ...prev, [other]: a }));
        setError("");
      })
      .catch((e: Error) => setError(e.message));
  }, [other]);

  const student = students.find((s) => s.id === other);
  const attempts = other ? remoteByUser[other] : local;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {other ? UI.progres.titolDe(student?.alias || student?.email || "…") : UI.progres.titol}
        </h1>
        <p className="text-soft">{other ? UI.progres.subtitolTutor : UI.progres.subtitol}</p>
        {me.role === "tutor" && students.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Choice href="/progres" active={!other} label={UI.progres.jo} />
            {students.map((s) => (
              <Choice
                key={s.id}
                href={`/progres?user=${s.id}`}
                active={other === s.id}
                label={s.alias || s.email}
              />
            ))}
          </div>
        )}
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {!attempts ? (
        <p className="text-soft">{other ? UI.progres.carregant : UI.carregant}</p>
      ) : (
        <Panels attempts={attempts} />
      )}
    </div>
  );
}

function Choice({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`min-h-tap inline-flex items-center rounded-full border px-4 text-sm ${active ? "border-teal bg-tealSoft font-semibold text-teal" : "border-line bg-card text-soft"}`}
    >
      {label}
    </a>
  );
}

const stateColor = (m: BlockMastery): "ok" | "teal" | "grey" =>
  m.state === "dominat" ? "ok" : m.state === "ho_vaig_agafant" ? "teal" : "grey";

function Panels({ attempts }: { attempts: Attempt[] }) {
  const [weeks, setWeeks] = useState<(typeof WINDOWS)[number]>(8);
  const [block, setBlock] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);
  const since = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - weeks * 7);
    return d.toISOString();
  }, [now, weeks]);
  const inWindow = useMemo(
    () => attempts.filter((a) => a.clientCreatedAt >= since && (!block || a.block === block)),
    [attempts, since, block],
  );
  const series = weeklySeries(
    block ? attempts.filter((a) => a.block === block) : attempts,
    weeks,
    now,
  );
  const tags = allTagsMastery(block ? attempts.filter((a) => a.block === block) : attempts);
  const lastChosen = new Map<string, string>();
  const chosenInWindow = new Map<string, number>();
  for (const a of inWindow) {
    if (!a.errorTag) continue;
    chosenInWindow.set(a.errorTag, (chosenInWindow.get(a.errorTag) ?? 0) + 1);
    const prev = lastChosen.get(a.errorTag);
    if (!prev || prev < a.clientCreatedAt) lastChosen.set(a.errorTag, a.clientCreatedAt);
  }
  // Tag «superat en la finestra»: ara superat i va ser triat alguna vegada dins la finestra.
  const superats = tags.filter((t) => t.state === "superat" && chosenInWindow.has(t.tag));
  const actius = tags
    .filter((t) => t.state === "actiu")
    .sort(
      (a, b) =>
        (chosenInWindow.get(b.tag) ?? 0) - (chosenInWindow.get(a.tag) ?? 0) || b.chosen - a.chosen,
    );
  const frequents = [...chosenInWindow.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = inWindow.filter((a) => a.outcome !== "skipped").length;
  const ok = inWindow.filter((a) => a.outcome === "correct").length;
  const skipped = inWindow.filter((a) => a.outcome === "skipped").length;
  const days = new Set(activeDays(attempts));
  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (27 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, active: days.has(key) };
  });
  const maxWeek = Math.max(1, ...series.map((w) => w.attempts));
  const available = BLOCS.filter((b) => b.disponible);

  return (
    <>
      <section className="flex flex-wrap items-center gap-2">
        <span className="label">{UI.progres.finestra}</span>
        {WINDOWS.map((w) => (
          <button
            key={w}
            onClick={() => setWeeks(w)}
            className={`min-h-tap rounded-full border px-3 text-sm ${weeks === w ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
          >
            {UI.progres.setmanesN(w)}
          </button>
        ))}
      </section>

      <section className="card">
        <SectionTitle>{UI.progres.resum}</SectionTitle>
        <p className="mt-1 text-lg">{UI.progres.resumLinia(total, ok, skipped)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setBlock(null)}
            className={`min-h-tap rounded-full border px-3 text-sm ${!block ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
          >
            {UI.progres.totsElsBlocs}
          </button>
          {available.map((b) => (
            <button
              key={b.id}
              onClick={() => setBlock(block === b.id ? null : b.id)}
              className={`min-h-tap rounded-full border px-3 text-sm ${block === b.id ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
            >
              {b.id}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>{UI.progres.blocs}</SectionTitle>
        <ul className="mt-2 flex flex-col gap-2">
          {available
            .filter((b) => !block || b.id === block)
            .map((b) => {
              const m = blockMastery(attempts, b.id);
              const lvl = currentLevel(attempts, b.id);
              return (
                <li key={b.id} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{b.titol}</span>
                    <Pill color={stateColor(m)}>{UI.estat[m.state]}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-soft">
                    {m.total === 0
                      ? UI.progres.senseIntents
                      : `${m.correct}/${m.total} ${UI.progres.encerts} (últims ${m.total})`}
                  </p>
                  {m.total > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                      {([1, 2, 3] as const).map((l) => {
                        const lm = levelMastery(attempts, b.id, l);
                        return (
                          <Pill key={l} color={lm.total === 0 ? "grey" : stateColor(lm)}>
                            {UI.progres.nivell(l)}
                            {lm.total > 0 ? ` ${lm.correct}/${lm.total}` : ""}
                            {l === lvl ? ` · ${UI.progres.nivellActual}` : ""}
                          </Pill>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </section>

      <section>
        <SectionTitle>{UI.progres.setmanes}</SectionTitle>
        <div
          className="card mt-2 flex h-28 items-end gap-2"
          role="img"
          aria-label={UI.progres.setmanes}
        >
          {series.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-col justify-end" style={{ height: 64 }}>
                <div
                  className="w-full rounded-t bg-line"
                  style={{ height: `${(w.attempts / maxWeek) * 100}%` }}
                >
                  <div
                    className="w-full rounded-t bg-teal"
                    style={{ height: w.attempts ? `${(w.correct / w.attempts) * 100}%` : 0 }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-faint">
                {w.week.slice(8)}/{w.week.slice(5, 7)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {frequents.length > 0 && (
        <section className="card">
          <SectionTitle>{UI.progres.mesFrequents}</SectionTitle>
          <ol className="mt-2 space-y-1">
            {frequents.map(([tag, n], i) => (
              <li key={tag} className="flex items-center gap-2">
                <span className="text-faint">{i + 1}.</span>
                <span className="flex-1">
                  <MixedText text={tagName(tag)} />
                </span>
                <span className="text-sm text-soft">{UI.progres.vegades(n)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <SectionTitle>{UI.progres.errors}</SectionTitle>
        {actius.length === 0 ? (
          <p className="mt-2 text-soft">{UI.progres.errorsBuit}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {actius.map((t) => (
              <li key={t.tag} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium leading-snug">
                    <MixedText text={tagName(t.tag)} />
                  </p>
                  <p className="text-sm text-soft">
                    {UI.progres.vegades(chosenInWindow.get(t.tag) ?? 0)} · {t.tag.slice(0, 2)}
                    {lastChosen.has(t.tag) &&
                      ` · ${UI.progres.ultimCop} ${ago(lastChosen.get(t.tag)!, now)}`}
                  </p>
                </div>
                <Sparkline values={weeklyTagChoices(attempts, t.tag, weeks, now)} />
                <Pill color="amber">{UI.progres.actiu}</Pill>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>{UI.progres.superatsRecent}</SectionTitle>
        {superats.length === 0 ? (
          <p className="mt-2 text-soft">{UI.progres.capSuperat}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {superats.map((t) => (
              <li key={t.tag} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium leading-snug">
                    <MixedText text={tagName(t.tag)} />
                  </p>
                  <p className="text-sm text-soft">
                    {UI.progres.ultimCop} {ago(lastChosen.get(t.tag)!, now)} · {t.tag.slice(0, 2)}
                  </p>
                </div>
                <Sparkline values={weeklyTagChoices(attempts, t.tag, weeks, now)} />
                <Pill color="ok">{UI.progres.superat}</Pill>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>{UI.progres.diesActius}</SectionTitle>
        <div className="card mt-2 grid grid-cols-7 gap-2">
          {last28.map((d) => (
            <div
              key={d.key}
              title={d.key}
              className={`aspect-square rounded-lg ${d.active ? "bg-teal" : "bg-paper2"}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}

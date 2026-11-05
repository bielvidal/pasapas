"use client";
import {
  activeDays,
  allTagsMastery,
  blockMastery,
  weeklySeries,
  weeklyTagChoices,
  type Attempt,
} from "@pasapas/engine";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loading, Notice, Pill, SectionTitle } from "@/components/Frame";
import { MixedText } from "@/components/Math";
import { Sparkline } from "@/components/Sparkline";
import { api, type UserRow } from "@/lib/api";
import { BLOCS, tagName } from "@/lib/content";
import { useMe } from "@/lib/session";
import { fetchAttemptsOf, syncAll } from "@/lib/sync";
import { UI } from "@/lib/texts";
import { useAttempts } from "@/lib/useAttempts";

const WEEKS = 8;

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

function Panels({ attempts }: { attempts: Attempt[] }) {
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
    <>
      <section>
        <SectionTitle>{UI.progres.blocs}</SectionTitle>
        <ul className="mt-2 flex flex-col gap-2">
          {BLOCS.filter((b) => b.disponible).map((b) => {
            const m = blockMastery(attempts, b.id);
            return (
              <li key={b.id} className="card">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{b.titol}</span>
                  <Pill
                    color={
                      m.state === "dominat" ? "ok" : m.state === "ho_vaig_agafant" ? "teal" : "grey"
                    }
                  >
                    {UI.estat[m.state]}
                  </Pill>
                </div>
                <p className="mt-1 text-sm text-soft">
                  {m.total === 0
                    ? UI.progres.senseIntents
                    : `${m.correct}/${m.total} ${UI.progres.encerts} (últims ${m.total})`}
                </p>
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
          {weeks.map((w) => (
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

      <section>
        <SectionTitle>{UI.progres.errors}</SectionTitle>
        {tags.length === 0 ? (
          <p className="mt-2 text-soft">{UI.progres.errorsBuit}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {tags.map((t) => (
              <li key={t.tag} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium leading-snug">
                    <MixedText text={tagName(t.tag)} />
                  </p>
                  <p className="text-sm text-soft">
                    {UI.progres.vegades(t.chosen)} · {t.tag.slice(0, 2)}
                  </p>
                </div>
                <Sparkline values={weeklyTagChoices(attempts, t.tag, WEEKS, now)} />
                <Pill color={t.state === "superat" ? "ok" : "amber"}>
                  {t.state === "superat" ? UI.progres.superat : UI.progres.actiu}
                </Pill>
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

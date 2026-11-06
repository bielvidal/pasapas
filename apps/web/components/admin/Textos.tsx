"use client";
// Edició de textos sense desplegar (fase 4): tots els textos de l'alumna, amb l'original, l'edició
// del tutor i l'estat (esborrany: només el veu el tutor; aprovat: el rep l'alumna).
import { listTexts, type TextEntry } from "@pasapas/content-algebra/texts/ca";
import { useEffect, useMemo, useState } from "react";
import { Loading, Notice, Pill } from "@/components/Frame";
import { MixedText } from "@/components/Math";
import { del, put } from "@/lib/api";
import { refreshOverrides, type OverrideRow } from "@/lib/overrides";
import { UI } from "@/lib/texts";

type Group = "tag" | "bloc" | "template";

export function Textos() {
  const t = UI.admin.textos;
  const all = useMemo(() => listTexts(), []);
  const [rows, setRows] = useState<Record<string, OverrideRow> | null>(null);
  const [group, setGroup] = useState<Group>("tag");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = () =>
    refreshOverrides()
      .then((list) => setRows(Object.fromEntries((list ?? []).map((o) => [o.key, o]))))
      .catch((e: Error) => setError(e.message));
  useEffect(() => {
    void load();
  }, []);

  const q = filter.trim().toLowerCase();
  const visible = all.filter((e) => {
    if (!e.key.startsWith(group + ":")) return false;
    if (!q) return true;
    const ov = rows?.[e.key]?.text ?? "";
    return (
      e.key.toLowerCase().includes(q) ||
      e.original.toLowerCase().includes(q) ||
      ov.toLowerCase().includes(q)
    );
  });
  const edited = all.filter((e) => rows?.[e.key]).length;

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!rows) return <Loading />;
  return (
    <div className="space-y-4">
      <p className="text-sm text-soft">{t.intro}</p>
      <div className="flex flex-wrap items-center gap-2">
        {(["tag", "bloc", "template"] as Group[]).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`min-h-tap rounded-full border px-3 text-sm ${group === g ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`}
          >
            {t.grups[g]}
          </button>
        ))}
        <input
          className="field max-w-xs"
          placeholder={t.cerca}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className="text-xs text-soft">{t.editats(edited)}</span>
      </div>
      <div className="card divide-y divide-line p-0">
        {visible.slice(0, 200).map((e) => (
          <Row
            key={e.key + (rows[e.key]?.updated_at ?? "")}
            entry={e}
            row={rows[e.key]}
            open={open === e.key}
            onOpen={() => setOpen(open === e.key ? null : e.key)}
            onChanged={load}
          />
        ))}
        {visible.length > 200 && <p className="px-4 py-2 text-xs text-soft">{t.massa}</p>}
        {visible.length === 0 && <p className="px-4 py-2 text-sm text-soft">{t.buit}</p>}
      </div>
    </div>
  );
}

function Row({
  entry,
  row,
  open,
  onOpen,
  onChanged,
}: {
  entry: TextEntry;
  row: OverrideRow | undefined;
  open: boolean;
  onOpen: () => void;
  onChanged: () => Promise<void>;
}) {
  const t = UI.admin.textos;
  const [text, setText] = useState(row?.text ?? entry.original);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(state: "esborrany" | "aprovat") {
    setBusy(true);
    setErr("");
    try {
      await put(`/api/admin/content/overrides/${encodeURIComponent(entry.key)}`, { text, state });
      await onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    setBusy(true);
    try {
      await del(`/api/admin/content/overrides/${encodeURIComponent(entry.key)}`);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }
  const label = entry.key.split(":").slice(1).join(" · ");
  return (
    <div className="px-4 py-2.5">
      <button className="flex w-full flex-wrap items-center gap-2 text-left" onClick={onOpen}>
        <span className="font-mono text-xs text-soft">{label}</span>
        {row && <Pill color={row.state === "aprovat" ? "ok" : "amber"}>{t.estat[row.state]}</Pill>}
        <span className="basis-full text-sm">
          <MixedText text={row?.text ?? entry.original} />
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {row && (
            <p className="text-xs text-soft">
              {t.original}: <MixedText text={entry.original} />
            </p>
          )}
          <textarea
            className="field min-h-24 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-soft">{t.ajuda}</p>
          {err && <Notice kind="error">{err}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-soft"
              disabled={busy || !text.trim()}
              onClick={() => void save("esborrany")}
            >
              {t.desaEsborrany}
            </button>
            <button
              className="btn"
              disabled={busy || !text.trim()}
              onClick={() => void save("aprovat")}
            >
              {t.aprova}
            </button>
            {row && (
              <button className="btn-danger" disabled={busy} onClick={() => void reset()}>
                {t.tornaOriginal}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

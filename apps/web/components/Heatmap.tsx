"use client";
// Mapa de calor del progrés (calcat del de PPER): blocs × nivells (o tipus de pregunta), vista
// recent o històrica. Cada cel·la porta a practicar justament això. Mateixa vista per a tothom.
import {
  heatBand,
  heatmap,
  type Attempt,
  type HeatColumns,
  type HeatKey,
  type HeatView,
} from "@pasapas/engine";
import Link from "next/link";
import { useState } from "react";
import { ALL_TEMPLATES, BLOCS } from "@/lib/content";
import { UI } from "@/lib/texts";
import { SectionTitle } from "./Frame";

const BAND_BG = ["bg-heat0", "bg-heat1", "bg-heat2", "bg-heat3", "bg-heat4"];

function practiceHref(block: string, columns: HeatColumns, key: HeatKey): string {
  if (key === "total") return `/practica/${block}?nivell=auto`;
  return columns === "level"
    ? `/practica/${block}?nivell=${key}`
    : `/practica/${block}?nivell=auto&tipus=${key}`;
}

function colLabel(columns: HeatColumns, key: HeatKey): string {
  if (key === "total") return UI.progres.total;
  return columns === "level" ? UI.dificultat.curt[key]! : UI.tipus[key]!;
}

export function Heatmap({ attempts }: { attempts: Attempt[] }) {
  const [view, setView] = useState<HeatView>("recent");
  const [columns, setColumns] = useState<HeatColumns>("level");
  const blocks = BLOCS.filter((b) => b.disponible);
  const rows = heatmap(
    ALL_TEMPLATES,
    attempts,
    blocks.map((b) => b.id),
    columns,
    view,
  );
  const keys = rows[0]?.cells.map((c) => c.key) ?? [];
  const P = UI.progres;
  const chip = (active: boolean) =>
    `min-h-tap rounded-full border px-3 text-sm ${active ? "border-teal bg-tealSoft text-teal" : "border-line text-soft"}`;
  const weak = rows
    .flatMap((r) =>
      r.cells
        .filter((c) => c.key !== "total" && c.cell.ok + c.cell.ko >= 3 && (c.cell.rate ?? 1) < 0.7)
        .map((c) => ({ block: r.block, ...c })),
    )
    .sort((a, b) => (a.cell.rate ?? 0) - (b.cell.rate ?? 0))
    .slice(0, 6);

  return (
    <section className="space-y-3">
      <SectionTitle>{P.mapa}</SectionTitle>
      <div className="flex flex-wrap gap-2">
        <button className={chip(view === "recent")} onClick={() => setView("recent")}>
          {P.mapaRecent}
        </button>
        <button className={chip(view === "historic")} onClick={() => setView("historic")}>
          {P.mapaHistoric}
        </button>
        <span className="w-2" />
        <button className={chip(columns === "level")} onClick={() => setColumns("level")}>
          {P.mapaPerNivell}
        </button>
        <button className={chip(columns === "type")} onClick={() => setColumns("type")}>
          {P.mapaPerTipus}
        </button>
      </div>
      <p className="text-xs text-soft">
        {view === "recent" ? P.mapaAjudaRecent : P.mapaAjudaHistoric} {P.mapaAjuda}
      </p>
      <div className="card overflow-x-auto p-2">
        <table className="border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th />
              {keys.map((k) => (
                <th key={String(k)} className="px-1 pb-1 text-[11px] font-semibold text-soft">
                  {colLabel(columns, k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const b = blocks.find((x) => x.id === r.block)!;
              return (
                <tr key={r.block}>
                  <th
                    className="sticky left-0 bg-card pr-2 text-left text-xs font-semibold"
                    title={b.titol}
                  >
                    {b.id}
                    <span className="block max-w-[7rem] truncate font-normal text-soft">
                      {b.titol}
                    </span>
                  </th>
                  {r.cells.map(({ key, cell }) => {
                    const tries = cell.ok + cell.ko;
                    const band = heatBand(cell);
                    const content = (
                      <>
                        <span className="text-base font-bold">
                          {cell.rate === null ? "·" : Math.round(cell.rate * 100)}
                        </span>
                        <small className="text-[10px] text-soft">
                          {cell.templates ? `${tries}` : ""}
                        </small>
                      </>
                    );
                    const cls = `flex h-14 min-w-[3.6rem] flex-col items-center justify-center rounded-lg ${BAND_BG[band]}`;
                    return (
                      <td key={String(key)} className="p-0">
                        {cell.templates === 0 ? (
                          <div className={`${cls} opacity-40`} />
                        ) : (
                          <Link
                            href={practiceHref(r.block, columns, key)}
                            className={`${cls} transition hover:brightness-95`}
                          >
                            {content}
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-2 flex flex-wrap gap-3 px-1 text-xs text-soft">
          {[1, 2, 3, 4, 0].map((band, i) => (
            <span key={band} className="inline-flex items-center gap-1">
              <i className={`inline-block h-3 w-3 rounded ${BAND_BG[band]}`} />
              {P.llegenda[i]}
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <SectionTitle>{P.perReforcar}</SectionTitle>
        {weak.length === 0 ? (
          <p className="mt-1 text-sm text-soft">{P.perReforcarBuit}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {weak.map((w) => (
              <li
                key={`${w.block}-${String(w.key)}`}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  <b>{w.block}</b> · {colLabel(columns, w.key)} ·{" "}
                  {Math.round((w.cell.rate ?? 0) * 100)} % ·{" "}
                  <span className="text-soft">
                    {w.cell.ok + w.cell.ko} {P.intents}
                  </span>
                </span>
                <Link className="link" href={practiceHref(w.block, columns, w.key)}>
                  {P.practicar}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

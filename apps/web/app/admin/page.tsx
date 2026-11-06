"use client";
// Administració (només tutor): convidats (amb codi dictat) i usuaris (progrés, dispositius, esborrar).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loading, Notice, Pill } from "@/components/Frame";
import {
  api,
  del,
  post,
  type DeviceSession,
  type DictatedCode,
  type InvitationRow,
  type UserRow,
} from "@/lib/api";
import { Textos } from "@/components/admin/Textos";
import { useMe } from "@/lib/session";
import { ago, UI } from "@/lib/texts";

type Tab = "convidats" | "usuaris" | "textos";

export default function Admin() {
  const { me } = useMe();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("convidats");
  useEffect(() => {
    if (me.role !== "tutor") router.replace("/");
  }, [me, router]);
  if (me.role !== "tutor") return null;
  const tabs = Object.keys(UI.admin.tabs) as Tab[];
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-semibold">{UI.admin.titol}</h1>
      <div className="flex gap-1 border-b border-line">
        {tabs.map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`min-h-tap border-b-2 px-3 text-sm font-medium ${tab === k ? "border-teal text-teal" : "border-transparent text-soft hover:text-ink"}`}
          >
            {UI.admin.tabs[k]}
          </button>
        ))}
      </div>
      {tab === "convidats" ? (
        <Invitations />
      ) : tab === "usuaris" ? (
        <Users meId={me.id} />
      ) : (
        <Textos />
      )}
    </div>
  );
}

function Invitations() {
  const t = UI.admin.convidats;
  const [list, setList] = useState<InvitationRow[] | null>(null);
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<DictatedCode | null>(null);
  const load = useCallback(
    () =>
      api<InvitationRow[]>("/api/admin/invitations")
        .then(setList)
        .catch((e: Error) => setError(e.message)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await post("/api/admin/invitations", { email, alias });
      setEmail("");
      setAlias("");
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  }
  async function remove(em: string) {
    await del(`/api/admin/invitations/${encodeURIComponent(em)}`);
    void load();
  }
  async function dictate(em: string) {
    setCode(await post<DictatedCode>(`/api/admin/invitations/${encodeURIComponent(em)}/code`));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={invite} className="card space-y-2">
        <p className="text-sm text-soft">{t.intro}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="label">{t.email}</span>
            <input
              className="field mt-1"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@gmail.com"
            />
          </label>
          <label className="block">
            <span className="label">{t.alies}</span>
            <input
              className="field mt-1"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={80}
            />
          </label>
        </div>
        <button className="btn" disabled={!email.trim()}>
          {t.boto}
        </button>
      </form>
      {error && <Notice kind="error">{error}</Notice>}
      {code && (
        <Notice kind="ok">
          <span className="font-mono text-2xl tracking-[0.3em]">{code.code}</span>
          <br />
          {code.email} · {t.codiExplica(code.expires_minutes)}
        </Notice>
      )}
      {!list ? (
        <Loading />
      ) : list.length === 0 ? (
        <p className="text-soft">{t.buit}</p>
      ) : (
        <div className="card divide-y divide-line p-0">
          {list.map((i) => (
            <div
              key={i.email}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
            >
              <div>
                <span className="font-medium">{i.alias || i.email}</span>
                {i.alias && <span className="text-soft"> · {i.email}</span>}
                <div className="text-xs text-soft">
                  {i.has_entered ? (
                    <Pill color="ok">{t.haEntrat}</Pill>
                  ) : (
                    <Pill color="grey">{t.noHaEntrat}</Pill>
                  )}{" "}
                  · {t.convidatPer} {i.invited_by} · {ago(i.created_at)}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-soft" onClick={() => void dictate(i.email)}>
                  {t.codi}
                </button>
                <button className="btn-danger" onClick={() => void remove(i.email)}>
                  {t.treure}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Users({ meId }: { meId: number }) {
  const t = UI.admin.usuaris;
  const [list, setList] = useState<UserRow[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(
    () =>
      api<UserRow[]>("/api/admin/users")
        .then(setList)
        .catch((e: Error) => setError(e.message)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  async function show(id: number) {
    setConfirm(false);
    setOpen(id);
    setSessions(await api<DeviceSession[]>(`/api/admin/users/${id}/sessions`));
  }
  async function closeSession(uid: number, sid: number) {
    await del(`/api/admin/users/${uid}/sessions/${sid}`);
    void show(uid);
  }
  async function remove(id: number) {
    await del(`/api/admin/users/${id}`);
    setOpen(null);
    void load();
  }

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!list) return <Loading />;
  if (list.length === 0) return <p className="text-soft">{t.buit}</p>;
  const u = list.find((x) => x.id === open);
  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              {t.cols.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr
                key={x.id}
                className="cursor-pointer hover:bg-paper2"
                onClick={() => void show(x.id)}
              >
                <td>
                  <div className="font-medium">
                    {x.alias || "—"} {x.id === meId && <span className="text-soft">({t.tu})</span>}
                  </div>
                  <div className="text-xs text-soft">{x.email}</div>
                </td>
                <td>
                  <Pill color={x.role === "tutor" ? "teal" : "grey"}>{x.role}</Pill>
                </td>
                <td className="tabular-nums">{x.attempts}</td>
                <td className="whitespace-nowrap">{ago(x.last_attempt)}</td>
                <td className="whitespace-nowrap">{ago(x.last_activity)}</td>
                <td>
                  <Link
                    className="link whitespace-nowrap"
                    href={`/progres?user=${x.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t.veureProgres}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {u && (
        <div className="card animate-fadeUp space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold">{u.alias || u.email}</h3>
              <p className="text-sm text-soft">
                {u.email} · {u.attempts} {UI.progres.intents}
              </p>
            </div>
            <button className="btn-soft" onClick={() => setOpen(null)}>
              ×
            </button>
          </div>
          <div>
            <h4 className="label mb-1">{t.dispositius}</h4>
            {sessions.length === 0 ? (
              <p className="text-sm text-soft">—</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-2">
                    <span className="font-medium">{s.device}</span>
                    <span className="text-soft">
                      {new Date(s.created_at).toLocaleDateString("ca-ES")} · {ago(s.last_activity)}
                    </span>
                    <button className="link" onClick={() => void closeSession(u.id, s.id)}>
                      {t.tancarSessio}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {u.id !== meId &&
            (!confirm ? (
              <button className="btn-danger" onClick={() => setConfirm(true)}>
                {t.esborrar}
              </button>
            ) : (
              <div className="space-y-2">
                <Notice kind="error">{t.esborrarConfirma}</Notice>
                <div className="flex gap-2">
                  <button className="btn-danger" onClick={() => void remove(u.id)}>
                    {t.si}
                  </button>
                  <button className="btn-soft" onClick={() => setConfirm(false)}>
                    {t.no}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

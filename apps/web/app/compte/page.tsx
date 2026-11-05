"use client";
// El meu compte: àlies, dispositius, sincronització, aparença, sortir i esborrar el compte.
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Notice, Pill, SectionTitle } from "@/components/Frame";
import { ThemeSelector } from "@/components/ThemeSelector";
import { api, del, post, put, type DeviceSession, type Me } from "@/lib/api";
import { db } from "@/lib/db";
import { cacheMe, useMe } from "@/lib/session";
import { syncAll } from "@/lib/sync";
import { ago, UI } from "@/lib/texts";

export default function Compte() {
  const { me, setMe } = useMe();
  const [alias, setAlias] = useState(me.alias);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [syncing, setSyncing] = useState(false);
  const pending = useLiveQuery(() => db().attempts.where("synced").equals(0).count(), []) ?? 0;

  const loadSessions = useCallback(
    () =>
      api<DeviceSession[]>("/api/me/sessions")
        .then(setSessions)
        .catch(() => {}),
    [],
  );
  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  async function saveAlias(e: FormEvent) {
    e.preventDefault();
    setMe(await put<Me>("/api/me/alias", { alias }));
    setMsg(UI.compte.desat);
    setTimeout(() => setMsg(""), 1500);
  }
  async function closeSession(id: number) {
    await del(`/api/me/sessions/${id}`);
    void loadSessions();
  }
  async function logout() {
    await post("/api/auth/logout").catch(() => {});
    cacheMe(null);
    window.location.replace("/entrar");
  }
  async function deleteAccount() {
    await del("/api/me");
    cacheMe(null);
    window.location.replace("/entrar");
  }
  async function syncNow() {
    setSyncing(true);
    await syncAll();
    setSyncing(false);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-semibold">{UI.compte.titol}</h1>

      <section className="card space-y-3">
        <form onSubmit={saveAlias} className="flex flex-wrap items-end gap-2">
          <label className="block grow">
            <span className="label">{UI.compte.alies}</span>
            <input
              className="field mt-1"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={80}
            />
          </label>
          <button className="btn-soft">{UI.compte.desar}</button>
          {msg && <span className="text-sm text-ok">{msg}</span>}
        </form>
        <p className="text-sm text-soft">
          {me.email} · <Pill color={me.role === "tutor" ? "teal" : "grey"}>{me.role}</Pill>
        </p>
      </section>

      <section className="card space-y-2">
        <SectionTitle>{UI.compte.sync}</SectionTitle>
        {pending > 0 ? (
          <Notice kind="info">{UI.compte.syncPendents(pending)}</Notice>
        ) : (
          <p className="text-sm text-soft">{UI.compte.syncAlDia}</p>
        )}
        <button className="btn-soft" onClick={() => void syncNow()} disabled={syncing}>
          {UI.compte.syncAra}
        </button>
      </section>

      {sessions.length > 0 && (
        <section className="card">
          <SectionTitle>{UI.compte.dispositius}</SectionTitle>
          <p className="mt-1 text-sm text-soft">{UI.compte.dispositiusSub}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-2">
                <span className="font-medium">{s.device}</span>
                <span className="text-soft">
                  {UI.compte.des} {new Date(s.created_at).toLocaleDateString("ca-ES")} ·{" "}
                  {UI.compte.activitat} {ago(s.last_activity)}
                </span>
                {s.current ? (
                  <Pill color="teal">{UI.compte.aquest}</Pill>
                ) : (
                  <button className="link" onClick={() => void closeSession(s.id)}>
                    {UI.compte.tancar}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <ThemeSelector />
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap gap-2">
          <button className="btn-soft" onClick={() => void logout()}>
            {UI.compte.sortir}
          </button>
          {!confirm && (
            <button className="btn-danger" onClick={() => setConfirm(true)}>
              {UI.compte.esborrar}
            </button>
          )}
        </div>
        {confirm && (
          <div className="space-y-2">
            <Notice kind="error">{UI.compte.esborrarConfirma}</Notice>
            <div className="flex gap-2">
              <button className="btn-danger" onClick={() => void deleteAccount()}>
                {UI.compte.esborrarSi}
              </button>
              <button className="btn-soft" onClick={() => setConfirm(false)}>
                {UI.compte.esborrarNo}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

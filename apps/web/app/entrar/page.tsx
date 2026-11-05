"use client";
// Entrar: correu → codi de 6 xifres (per correu o dictat pel tutor) → sessió en AQUEST navegador.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Frame, Notice } from "@/components/Frame";
import { ApiError, post, type Me } from "@/lib/api";
import { cacheMe } from "@/lib/session";
import { UI } from "@/lib/texts";

function Form() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/code", { email });
      setCode("");
      setNotice(UI.entrar.enviat);
      setStep("code");
    } catch (err) {
      setError((err as Error).message || UI.entrar.error);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const me = await post<Me>("/api/auth/login", { email, code });
      cacheMe(me);
      window.location.replace("/"); // recàrrega completa: l'AuthGate arrenca amb la sessió nova
    } catch (err) {
      setError((err as Error).message || UI.entrar.error);
      if (err instanceof ApiError && err.code === "code_expired") setNotice("");
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={login} className="space-y-3">
        <p className="text-sm text-soft">{email}</p>
        {notice && <Notice kind="ok">{notice}</Notice>}
        <label className="block">
          <span className="label">{UI.entrar.codi}</span>
          <input
            className="field mt-1 text-center text-2xl tracking-[0.5em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            required
            autoFocus
            maxLength={7}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
            placeholder="000000"
          />
        </label>
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn w-full" disabled={busy || code.replace(/\D/g, "").length !== 6}>
          {busy ? UI.entrar.entrant : UI.entrar.entrar}
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="link text-sm"
            disabled={busy}
            onClick={() => requestCode()}
          >
            {UI.entrar.altreCodi}
          </button>
          <button
            type="button"
            className="link text-sm"
            onClick={() => {
              setStep("email");
              setError("");
              setNotice("");
            }}
          >
            {UI.entrar.canviarCorreu}
          </button>
        </div>
      </form>
    );
  }
  return (
    <form onSubmit={requestCode} className="space-y-3">
      <label className="block">
        <span className="label">{UI.entrar.email}</span>
        <input
          className="field mt-1"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@gmail.com"
        />
      </label>
      {error && <Notice kind="error">{error}</Notice>}
      <button className="btn w-full" disabled={busy}>
        {UI.entrar.boto}
      </button>
      {router && <p className="text-xs text-faint">{UI.entrar.privacitat}</p>}
    </form>
  );
}

export default function Entrar() {
  return (
    <Frame title={UI.entrar.titol} nav={false}>
      <div className="card max-w-md animate-fadeUp">
        <p className="mb-1 text-sm text-soft">{UI.tagline}</p>
        <p className="mb-5 text-soft">{UI.entrar.explicacio}</p>
        <Form />
      </div>
    </Frame>
  );
}

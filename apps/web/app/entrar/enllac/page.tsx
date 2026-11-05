"use client";
// Destí de l'enllaç de rescat del CLI: canvia el token per la cookie i va a l'inici.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Frame, Notice } from "@/components/Frame";
import { api, ApiError, post, type Me } from "@/lib/api";
import { cacheMe } from "@/lib/session";
import { UI } from "@/lib/texts";

function Redeem() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [used, setUsed] = useState(false);
  useEffect(() => {
    const token = params.get("t") ?? "";
    const go = (me: Me) => {
      cacheMe(me);
      window.location.replace("/");
    };
    // Si aquest navegador ja té sessió (l'enllaç s'obre dues vegades), no es gasta l'enllaç.
    api<Me>("/api/me")
      .then(go)
      .catch(() =>
        post<Me>("/api/auth/redeem-link", { token })
          .then(go)
          .catch((e: Error) => {
            setUsed(e instanceof ApiError && e.code === "link_used");
            setError(e.message || UI.entrar.enllacMal);
          }),
      );
  }, [params]);
  return (
    <div className="card max-w-md">
      {error ? (
        <div className="space-y-3">
          <Notice kind="error">{error}</Notice>
          {used && <p className="text-sm text-soft">{UI.entrar.enllacUsatAjuda}</p>}
          <div className="flex flex-wrap gap-2">
            {used && (
              <Link className="btn-soft" href="/">
                {UI.entrar.irInici}
              </Link>
            )}
            <Link className="btn-soft" href="/entrar">
              {UI.entrar.titol}
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-soft">{UI.entrar.canjeant}</p>
      )}
    </div>
  );
}

export default function Enllac() {
  return (
    <Frame nav={false}>
      <Suspense fallback={<p className="text-soft">{UI.entrar.canjeant}</p>}>
        <Redeem />
      </Suspense>
    </Frame>
  );
}

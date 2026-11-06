"use client";
import { useEffect } from "react";
import { BLOCS } from "@/lib/content";

/** Registra el service worker (generat per Workbox al build) i escalfa la caché de les rutes. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(async () => {
        // Primera visita: demana les pantalles perquè quedin a la caché i l'app vagi offline.
        await Promise.allSettled(
          [
            "/",
            "/repas",
            "/proposats",
            "/progres",
            "/compte",
            ...BLOCS.filter((b) => b.disponible).flatMap((b) => [
              `/bloc/${b.id}`,
              `/practica/${b.id}`,
            ]),
          ].map((u) => fetch(u, { cache: "no-store" })),
        );
      })
      .catch(() => undefined);
  }, []);
  return null;
}

// Genera public/sw.js amb Workbox després de `next build` (patró de la casa).
// Precaché dels estàtics del build + caché en temps d'execució perquè l'app vagi offline
// després de la primera visita. KaTeX i les fonts van dins del bundle (sense CDN).
import { generateSW } from "workbox-build";

const { count, size, warnings } = await generateSW({
  globDirectory: ".next",
  globPatterns: ["static/**/*.{js,css,woff,woff2,ttf}"],
  modifyURLPrefix: { "static/": "/_next/static/" },
  swDest: "public/sw.js",
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  mode: "production",
  navigateFallback: "/",
  navigateFallbackDenylist: [/^\/api\//],
  runtimeCaching: [
    {
      // L'API mai de la caché.
      urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
    },
    {
      // Pantalles: fresques si hi ha xarxa, de la caché si no.
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pasapas-pages",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 30 },
      },
    },
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.endsWith(".webmanifest"),
      handler: "CacheFirst",
      options: {
        cacheName: "pasapas-assets",
        expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 3600 },
      },
    },
  ],
});
for (const w of warnings) console.warn(w);
console.log(`sw.js: ${count} fitxers precachejats (${(size / 1024).toFixed(0)} KB)`);

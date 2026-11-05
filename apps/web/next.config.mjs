import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// En desenvolupament el portal (3011) i l'API (8900) són orígens diferents: el rewrite fa que el
// navegador parli sempre amb /api/* del mateix origen (cookie de sessió sense CORS). En producció
// el túnel enruta pasapas.nereidlabs.net/api/* a :8900 i el rewrite no intervé.
const API = process.env.PASAPAS_API_URL || "http://localhost:8900";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API}/api/:path*` }];
  },
  // Els paquets del workspace s'exporten com a .ts sense build: Next els transpila.
  transpilePackages: ["@pasapas/engine", "@pasapas/content-algebra"],
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};
export default nextConfig;

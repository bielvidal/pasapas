"use client";
import katex from "katex";
import { useMemo } from "react";

/** Renderitza LaTeX amb KaTeX (local, sense CDN: funciona offline). */
export function Math({
  latex,
  display = false,
  className = "",
}: {
  latex: string;
  display?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
        output: "html",
        strict: "ignore",
      }),
    [latex, display],
  );
  return (
    <span
      className={`${display ? "block overflow-x-auto py-1" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Text amb matemàtiques inline entre $...$ i negreta amb **...**.
 * Els textos venen del catàleg (revisats per Biel), no de l'alumna.
 */
export function MixedText({ text, className = "" }: { text: string; className?: string }) {
  const parts = useMemo(() => text.split(/(\$[^$]+\$)/g), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("$") && p.endsWith("$")) return <Math key={i} latex={p.slice(1, -1)} />;
        const bold = p.split(/(\*\*[^*]+\*\*)/g);
        return bold.map((b, j) =>
          b.startsWith("**") && b.endsWith("**") ? (
            <strong key={`${i}-${j}`}>{b.slice(2, -2)}</strong>
          ) : (
            <span key={`${i}-${j}`}>{b}</span>
          ),
        );
      })}
    </span>
  );
}

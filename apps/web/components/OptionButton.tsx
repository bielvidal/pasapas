"use client";
import type { Option } from "@pasapas/engine";
import { Math, MixedText } from "./Math";

export type OptionState = "idle" | "chosen-correct" | "chosen-wrong" | "reveal-correct" | "dim";

const styles: Record<OptionState, string> = {
  idle: "border-line2 bg-card hover:border-teal active:bg-tealSoft",
  "chosen-correct": "border-ok bg-okSoft",
  "chosen-wrong": "border-amber bg-amberSoft",
  "reveal-correct": "border-ok border-dashed bg-card",
  dim: "border-line bg-paper2 text-soft",
};

export function OptionButton({
  option,
  state,
  onClick,
  disabled,
  label,
}: {
  option: Option;
  state: OptionState;
  onClick: () => void;
  disabled: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state.startsWith("chosen")}
      className={`flex min-h-tap w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg transition ${styles[state]}`}
    >
      {label && <span className="shrink-0 text-sm font-semibold text-soft">{label}</span>}
      <span className="flex-1">
        {option.text ? <MixedText text={option.text} /> : <Math latex={option.latex} />}
      </span>
    </button>
  );
}

"use client";
import type { Option } from "@pasapas/engine";
import { Math, MixedText } from "./Math";

export type OptionState = "idle" | "chosen-correct" | "chosen-wrong" | "reveal-correct" | "dim";

const styles: Record<OptionState, string> = {
  idle: "border-stone-300 bg-white dark:bg-paper-darkcard dark:border-stone-600 active:bg-accent-soft dark:active:bg-stone-700",
  "chosen-correct": "border-ok bg-ok-soft dark:bg-ok/20 dark:border-ok-dark",
  "chosen-wrong": "border-warm bg-warm-soft dark:bg-warm/20 dark:border-warm-dark",
  "reveal-correct": "border-ok bg-white dark:bg-paper-darkcard dark:border-ok-dark border-dashed",
  dim: "border-stone-200 bg-stone-50 text-stone-500 dark:bg-paper-dark dark:border-stone-700 dark:text-stone-400",
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
      {label && (
        <span className="shrink-0 text-sm font-semibold text-stone-500 dark:text-stone-400">
          {label}
        </span>
      )}
      <span className="flex-1">
        {option.text ? <MixedText text={option.text} /> : <Math latex={option.latex} />}
      </span>
    </button>
  );
}

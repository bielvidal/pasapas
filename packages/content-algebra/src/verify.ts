/**
 * Verificació automàtica (§5.5): cap «resposta correcta» pot ser incorrecta. S'executa als
 * tests de propietat amb centenars de llavors per plantilla, i es pot cridar en desenvolupament.
 * Tot és exacte (racionals): no hi ha toleràncies.
 */
import type { Item } from "@pasapas/engine";
import { TAGS } from "../texts/ca";
import type { Machine } from "./machine";
import type { RF } from "./math/rf";

const rf = (m: Machine | undefined): RF | null => (m && m.kind === "rf" ? m.rf : null);

export function verifyItem(item: Item<Machine>): string[] {
  const problems: string[] = [];
  const tagsUsed = new Set<string>();
  for (const o of item.options) if (o.errorTag) tagsUsed.add(o.errorTag);
  if (item.type === "valid_step" && item.step.errorTag) tagsUsed.add(item.step.errorTag);
  for (const t of tagsUsed) if (!TAGS[t]) problems.push(`error_tag desconegut: ${t}`);

  if (/\[\[\w+\]\]/.test(item.explanationCorrect))
    problems.push("explanationCorrect té paràmetres sense omplir");
  for (const o of item.options) {
    if (o.explanationOverride && /\[\[\w+\]\]/.test(o.explanationOverride)) {
      problems.push(`override de ${o.id} té paràmetres sense omplir`);
    }
  }

  switch (item.type) {
    case "mc_result":
    case "next_step": {
      const prompt = rf(item.promptMachine);
      if (!prompt) {
        problems.push("l'enunciat no té forma màquina");
        break;
      }
      for (const o of item.options) {
        const m = o.machine;
        if (!m) {
          problems.push(`l'opció ${o.id} no té forma màquina`);
          continue;
        }
        if (m.kind === "rf") {
          const eq = m.rf.equals(prompt);
          if (o.correct && !eq)
            problems.push(`la correcta ${o.id} (${o.latex}) NO equival a l'enunciat`);
          if (!o.correct && eq)
            problems.push(`el distractor ${o.id} (${o.latex}) equival a l'enunciat`);
        } else {
          const simplifiable = prompt.isSimplifiable();
          if (o.correct && simplifiable)
            problems.push(
              "«No es pot simplificar» marcada correcta però l'enunciat SÍ es pot simplificar",
            );
          if (!o.correct && !simplifiable)
            problems.push(
              "«No es pot simplificar» com a distractor però l'enunciat NO es pot simplificar",
            );
        }
      }
      // La correcta ha d'estar simplificada de debò (si és racional).
      const correct = item.options.find((o) => o.correct);
      const crf = rf(correct?.machine);
      if (crf && crf.isSimplifiable() && item.instruction === "Simplifica") {
        problems.push(`la correcta ${correct!.latex} encara es pot simplificar`);
      }
      break;
    }
    case "valid_step": {
      const before = rf(item.step.beforeMachine);
      const after = rf(item.step.afterMachine);
      if (!before || !after) {
        problems.push("el pas no té forma màquina");
        break;
      }
      const eq = before.equals(after);
      if (item.step.valid !== eq) {
        problems.push(
          `el pas està marcat ${item.step.valid ? "vàlid" : "invàlid"} però ${eq ? "SÍ" : "NO"} és una equivalència`,
        );
      }
      if (!item.step.valid && !item.step.errorTag) problems.push("pas invàlid sense errorTag");
      if (item.step.valid && item.step.errorTag) problems.push("pas vàlid amb errorTag");
      break;
    }
    case "find_error": {
      const prompt = rf(item.promptMachine);
      const steps = item.steps.map((s) => rf(s.machine));
      if (!prompt || steps.some((s) => !s)) {
        problems.push("find_error: falta forma màquina a l'enunciat o a algun pas");
        break;
      }
      const e = item.errorIndex;
      steps.forEach((s, i) => {
        const prev = i === 0 ? prompt : steps[i - 1]!;
        const eq = s!.equals(prev);
        if (e === null || i < e) {
          if (!eq) problems.push(`el pas ${i} (correcte) no equival a l'anterior`);
        } else if (i === e) {
          if (eq) problems.push(`el pas ${i} (erroni) equival a l'anterior: no hi ha error`);
        } else if (!eq) {
          problems.push(`el pas ${i} no és coherent amb el pas erroni ${e}`);
        }
      });
      break;
    }
  }
  return problems;
}

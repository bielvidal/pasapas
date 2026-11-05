/** Metadades dels 7 blocs: títol, regla d'or i exemples de la pantalla «Aprèn». */
export interface BlockText {
  id: string;
  titol: string;
  reglaOr: string;
  /** Exemples resolts, en LaTeX (es mostren en display). */
  exemples: string[];
  /** Hi ha plantilles implementades? (les que no, es mostren com «Aviat»). */
  disponible: boolean;
}

export const BLOCS: BlockText[] = [
  {
    id: "B1",
    titol: "Signes i parèntesis",
    reglaOr:
      "Un signe menys davant d'un parèntesi canvia el signe de **tots** els termes de dins. Un número davant d'un parèntesi multiplica **tots** els termes de dins.",
    exemples: [
      "5 - (2x - 3) = 5 - 2x + 3 = 8 - 2x",
      "3(x - 4) - 2(x + 1) = 3x - 12 - 2x - 2 = x - 14",
    ],
    disponible: true,
  },
  {
    id: "B2",
    titol: "Fraccions numèriques",
    reglaOr:
      "Per sumar o restar fraccions cal el **mateix denominador** (i llavors se sumen només els numeradors). Per multiplicar: numerador per numerador i denominador per denominador. Per dividir: multiplica per la inversa de la segona.",
    exemples: [
      "\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}",
      "\\frac{2}{3} : \\frac{4}{5} = \\frac{2}{3} \\cdot \\frac{5}{4} = \\frac{10}{12} = \\frac{5}{6}",
    ],
    disponible: true,
  },
  {
    id: "B3",
    titol: "Potències i arrels",
    reglaOr:
      "Les propietats de les potències funcionen amb **productes i quocients**, mai amb **sumes**: $(a \\cdot b)^n = a^n \\cdot b^n$, però $(a + b)^n \\neq a^n + b^n$.",
    exemples: ["(2x^3)^2 = 2^2 \\cdot (x^3)^2 = 4x^6", "(x + 3)^2 = (x + 3)(x + 3) = x^2 + 6x + 9"],
    disponible: true,
  },
  {
    id: "B4",
    titol: "Identitats notables i factorització",
    reglaOr:
      "Factoritzar és escriure com a **producte**. Comprova-ho sempre desenvolupant: si en multiplicar no tornes a l'expressió inicial, la factorització és incorrecta.",
    exemples: [
      "2x^2 + 6x = 2x(x + 3) \\quad\\text{(comprovació: } 2x \\cdot x + 2x \\cdot 3 = 2x^2 + 6x\\text{)}",
      "x^2 - 25 = (x + 5)(x - 5) \\quad\\text{(comprovació: } x^2 - 5x + 5x - 25 = x^2 - 25\\text{)}",
    ],
    disponible: true,
  },
  {
    id: "B5",
    titol: "Simplificar fraccions algebraiques",
    reglaOr:
      "Només es poden tatxar **factors** (coses que multipliquen tot el numerador i tot el denominador), mai **termes** (coses que se sumen o es resten). Si hi ha sumes, primer factoritza.",
    exemples: [
      "\\frac{x^2 - 9}{x + 3} = \\frac{(x + 3)(x - 3)}{x + 3} = x - 3",
      "\\frac{x + 6}{6}\\text{: el 6 de dalt està sumant, no es pot tatxar. Com a molt: } \\frac{x}{6} + 1",
    ],
    disponible: true,
  },
  {
    id: "B6",
    titol: "Equacions amb fraccions",
    reglaOr:
      "Multiplica **tots** els termes dels **dos** costats pel mínim comú múltiple dels denominadors. Posa parèntesis als numeradors abans de multiplicar. Si hi ha $x$ al denominador, comprova que la solució no anul·la cap denominador.",
    exemples: [
      "\\frac{x}{2} + \\frac{x}{3} = 5 \\;\\xrightarrow{\\cdot 6}\\; 3x + 2x = 30 \\;\\Rightarrow\\; 5x = 30 \\;\\Rightarrow\\; x = 6",
      "\\frac{x}{2} - \\frac{x - 1}{3} = 1 \\;\\xrightarrow{\\cdot 6}\\; 3x - 2(x - 1) = 6 \\;\\Rightarrow\\; 3x - 2x + 2 = 6 \\;\\Rightarrow\\; x = 4",
    ],
    disponible: true,
  },
  {
    id: "B7",
    titol: "Què es pot fer als dos costats d'una igualtat",
    reglaOr:
      "Pots fer qualsevol operació si la fas als **dos** costats i amb **tots** els termes. Excepció: no divideixis per una expressió que pugui valer 0 (com $x$), perquè perds solucions. En lloc de dividir per $x$, treu factor comú.",
    exemples: [
      "x^2 = 3x \\;\\Rightarrow\\; x^2 - 3x = 0 \\;\\Rightarrow\\; x(x - 3) = 0 \\;\\Rightarrow\\; x = 0 \\text{ o } x = 3",
      "2x + 6 = 10 \\;\\xrightarrow{: 2}\\; x + 3 = 5 \\;\\Rightarrow\\; x = 2",
    ],
    disponible: true,
  },
];

export const blocById = (id: string): BlockText | undefined => BLOCS.find((b) => b.id === id);

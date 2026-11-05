/**
 * Catàleg d'errors típics (error_tag) — TOTS els blocs. Font: docs/02_CATALOGO_CONTENIDO.md.
 * `nom` és el que veu el panell; `explicacio` és el que veu l'alumna quan tria aquest error.
 * Les matemàtiques van entre $...$ (LaTeX inline). Textos revisables per Biel sense tocar codi.
 */
export interface TagText {
  nom: string;
  explicacio: string;
}

export const TAGS: Record<string, TagText> = {
  // ── B1 · Signes i parèntesis ──────────────────────────────────────────────
  B1_SIGNE_PARCIAL: {
    nom: "El menys només canvia el primer terme",
    explicacio:
      "El signe menys davant del parèntesi afecta **tots** els termes de dins, no només el primer. $-(2x - 3) = -2x + 3$: el $-3$ es converteix en $+3$.",
  },
  B1_SIGNE_OBLIDAT: {
    nom: "Treure el parèntesi sense el menys",
    explicacio:
      "Has tret el parèntesi com si davant hi hagués un $+$. Amb un $-$ davant, tots els signes de dins canvien.",
  },
  B1_DISTRIB_PARCIAL: {
    nom: "El número només multiplica el primer terme",
    explicacio:
      "El número de fora multiplica **cada** terme del parèntesi: $3(x + 4) = 3x + 12$, no $3x + 4$.",
  },
  B1_ORDRE_OPERACIONS: {
    nom: "Ordre de les operacions",
    explicacio:
      "Primer potències, després multiplicacions i divisions, i al final sumes i restes, si no hi ha parèntesis que diguin el contrari. $2 + 3 \\cdot 4 = 2 + 12 = 14$.",
  },
  B1_QUADRAT_NEGATIU: {
    nom: "−n² amb (−n)²",
    explicacio:
      "A $-3^2$ l'exponent afecta només el 3: $-3^2 = -(3^2) = -9$. Per elevar el $-3$ cal escriure $(-3)^2 = 9$.",
  },
  B1_QUADRAT_DOBLE: {
    nom: "Elevar al quadrat com multiplicar per 2",
    explicacio:
      "Elevar al quadrat és multiplicar el número per ell mateix: $5^2 = 5 \\cdot 5 = 25$, no $5 \\cdot 2 = 10$.",
  },
  B1_TERMES_NO_SEMBLANTS: {
    nom: "Sumar termes que no són semblants",
    explicacio:
      "Només es poden sumar termes amb la mateixa part literal. $3x + 2$ no es pot ajuntar: no és $5x$.",
  },

  // ── B2 · Fraccions numèriques ─────────────────────────────────────────────
  B2_SUMA_DENOMINADORS: {
    nom: "Sumar els denominadors",
    explicacio:
      "Els denominadors no se sumen. Primer cal posar les fraccions amb el mateix denominador: $\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$, no $\\frac{2}{5}$.",
  },
  B2_AMPLIFICA_NOMES_DENOMINADOR: {
    nom: "Canviar el denominador sense el numerador",
    explicacio:
      "Si canvies el denominador, has de multiplicar el numerador pel mateix número; si no, la fracció canvia de valor. $\\frac{1}{2} = \\frac{3}{6}$, no $\\frac{1}{6}$.",
  },
  B2_ENTER_SENSE_DENOMINADOR: {
    nom: "Sumar un enter només al numerador",
    explicacio:
      "Un enter també és una fracció: $2 = \\frac{2b}{b}$. Per tant $2 + \\frac{a}{b} = \\frac{2b + a}{b}$.",
  },
  B2_OPERACIO_CONFOSA: {
    nom: "Confondre suma i producte",
    explicacio:
      "Has multiplicat quan calia sumar (o al revés). Torna a llegir quina operació demana l'enunciat.",
  },
  B2_DIVISIO_SENSE_INVERTIR: {
    nom: "Dividir sense invertir",
    explicacio:
      "Dividir per una fracció és multiplicar per la seva inversa: $\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} = \\frac{ad}{bc}$.",
  },
  B2_INVERTEIX_PRIMERA: {
    nom: "Invertir la fracció equivocada",
    explicacio: "S'inverteix la segona fracció (la que divideix), no la primera.",
  },
  B2_FRACCIO_DE_FRACCIO: {
    nom: "Fracció de fracció",
    explicacio:
      "$\\frac{a/b}{c} = \\frac{a}{b \\cdot c}$: el $c$ baixa al denominador. En canvi, $\\frac{a}{b/c} = \\frac{a \\cdot c}{b}$.",
  },
  B2_PRODUCTE_ENTER_A_TOT: {
    nom: "Multiplicar l'enter a dalt i a baix",
    explicacio:
      "Multiplicar una fracció per un enter només multiplica el numerador: $3 \\cdot \\frac{2}{5} = \\frac{6}{5}$. Si el multipliques a dalt i a baix, la fracció no canvia.",
  },
  B2_SIMPLIFICA_SUMA: {
    nom: "Simplificar dins d'una suma",
    explicacio:
      "Només es pot simplificar un factor que multiplica **tot** el numerador i **tot** el denominador. $\\frac{6 + 5}{6} = \\frac{11}{6}$: no pots tatxar el 6, perquè està sumant.",
  },

  // ── B3 · Potències i arrels ───────────────────────────────────────────────
  B3_QUADRAT_SUMA: {
    nom: "(a + b)² = a² + b²",
    explicacio:
      "Elevar al quadrat una suma no és elevar cada terme: $(a + b)^2 = (a + b)(a + b) = a^2 + 2ab + b^2$. Prova amb $a = b = 1$: $(1 + 1)^2 = 4$, però $1^2 + 1^2 = 2$.",
  },
  B3_COEF_NO_ELEVAT: {
    nom: "No elevar el número",
    explicacio:
      "L'exponent afecta tot el que hi ha dins el parèntesi, també el número: $(2x)^3 = 2^3 \\cdot x^3 = 8x^3$.",
  },
  B3_COEF_MULTIPLICAT: {
    nom: "Multiplicar per l'exponent",
    explicacio:
      "Elevar no és multiplicar per l'exponent: $2^3 = 2 \\cdot 2 \\cdot 2 = 8$, no $2 \\cdot 3 = 6$.",
  },
  B3_PRODUCTE_EXPONENTS: {
    nom: "Multiplicar exponents en un producte",
    explicacio:
      "En multiplicar potències de la mateixa base, els exponents se **sumen**: $x^2 \\cdot x^3 = x^5$.",
  },
  B3_POTENCIA_POTENCIA: {
    nom: "Sumar exponents en una potència de potència",
    explicacio:
      "En una potència d'una potència, els exponents es **multipliquen**: $(x^2)^3 = x^2 \\cdot x^2 \\cdot x^2 = x^6$.",
  },
  B3_QUOCIENT_EXPONENTS: {
    nom: "Exponents en una divisió",
    explicacio:
      "En dividir potències de la mateixa base, els exponents es **resten**: $\\frac{x^7}{x^3} = x^4$.",
  },
  B3_EXP_NEGATIU: {
    nom: "Exponent negatiu = negatiu",
    explicacio:
      "Un exponent negatiu vol dir **invers**, no negatiu: $x^{-2} = \\frac{1}{x^2}$, i $\\left(\\frac{2}{3}\\right)^{-1} = \\frac{3}{2}$.",
  },
  B3_EXP_ABAST: {
    nom: "A què afecta l'exponent",
    explicacio:
      "L'exponent només afecta el que té just a sota, o el parèntesi sencer: $2x^{-1} = \\frac{2}{x}$, però $(2x)^{-1} = \\frac{1}{2x}$. Igual amb $(x^2 y)^3 = x^6 y^3$: la $y$ també s'eleva.",
  },
  B3_SUMA_POTENCIES: {
    nom: "Ajuntar potències que se sumen",
    explicacio:
      "Les potències només es combinen quan es multipliquen o es divideixen. $x^2 + x^3$ no es pot simplificar; $x^2 + x^2 = 2x^2$.",
  },
  B3_ARREL_SUMA: {
    nom: "Arrel d'una suma",
    explicacio:
      "L'arrel d'una suma no és la suma de les arrels: $\\sqrt{9 + 16} = \\sqrt{25} = 5$, però $\\sqrt{9} + \\sqrt{16} = 7$.",
  },
  B3_EXP_FRACCIONARI: {
    nom: "Exponent fraccionari",
    explicacio:
      "Un exponent fraccionari és una arrel: $x^{1/2} = \\sqrt{x}$ i $x^{m/n} = \\sqrt[n]{x^m}$. El denominador és l'índex de l'arrel.",
  },
  B3_FRACCIO_POTENCIA: {
    nom: "Elevar només el numerador",
    explicacio:
      "L'exponent afecta el numerador i el denominador: $\\left(\\frac{2}{3}\\right)^2 = \\frac{4}{9}$.",
  },

  // ── B4 · Identitats notables i factorització ──────────────────────────────
  B4_DIF_QUADRATS: {
    nom: "Diferència de quadrats com a quadrat",
    explicacio:
      "La diferència de quadrats és suma per diferència: $a^2 - b^2 = (a + b)(a - b)$. En canvi, $(a - b)^2 = a^2 - 2ab + b^2$.",
  },
  B4_DOBLE_PRODUCTE: {
    nom: "Oblidar el 2 del doble producte",
    explicacio: "El terme del mig és el **doble** producte: $(a + b)^2 = a^2 + 2ab + b^2$.",
  },
  B4_SIGNE_QUADRAT: {
    nom: "Signe de b²",
    explicacio: "$b^2$ sempre és positiu: $(a - b)^2 = a^2 - 2ab + b^2$.",
  },
  B4_FACTOR_COMU_INCOMPLET: {
    nom: "Factor comú mal dividit",
    explicacio:
      "En treure factor comú, divideix **cada** terme pel factor: $2x^2 + 4x = 2x(x + 2)$, perquè $4x : 2x = 2$. Comprova-ho multiplicant.",
  },
  B4_FACTOR_COMU_UN: {
    nom: "Oblidar l'1 en treure factor comú",
    explicacio:
      "Quan un terme és exactament el factor comú, a dins hi queda un 1: $x^2 + x = x(x + 1)$.",
  },
  B4_FACTOR_COMU_EXPONENT: {
    nom: "Treure una x que no és a tots els termes",
    explicacio:
      "El factor comú ha d'estar a **tots** els termes. A $3x^2 - 12$, la $x$ no és al $-12$: el factor comú és només 3.",
  },
  B4_SUMA_QUADRATS: {
    nom: "Factoritzar una suma de quadrats",
    explicacio:
      "$x^2 + 9$ no es pot factoritzar amb nombres reals. Compte: $(x + 3)^2 = x^2 + 6x + 9$.",
  },
  B4_NO_RECONEIX: {
    nom: "No reconèixer una identitat",
    explicacio:
      "Si tens un quadrat menys un altre quadrat, sempre es pot factoritzar com a suma per diferència.",
  },

  // ── B5 · Simplificar fraccions algebraiques ───────────────────────────────
  B5_CANCELA_TERME: {
    nom: "Tatxar un terme que suma",
    explicacio:
      "El que has tatxat està sumant o restant, no multiplicant. Només es pot tatxar un factor comú a **tot** el numerador i **tot** el denominador. Exemple: $\\frac{x + 3}{x} = 1 + \\frac{3}{x}$, no 3.",
  },
  B5_CANCELA_TERMES_SEMBLANTS: {
    nom: "Tatxar les x de dalt i de baix",
    explicacio:
      "Has tatxat les $x$, però estan sumant. Prova amb $x = 1$: $\\frac{1 + 2}{1 + 5} = \\frac{3}{6} = \\frac{1}{2}$, i no $\\frac{2}{5}$.",
  },
  B5_CANCELA_EXPONENT: {
    nom: "Dividir només un terme",
    explicacio:
      "Si divideixes el numerador per $x$, cal dividir-ne **tots** els termes: $\\frac{x^2 + 1}{x} = x + \\frac{1}{x}$, no $x + 1$.",
  },
  B5_NUMERO_PARCIAL: {
    nom: "El número només divideix un terme",
    explicacio:
      "El denominador divideix tots els termes del numerador: $\\frac{2x + 6}{2} = x + 3$. O factoritza: $\\frac{2(x + 3)}{2}$.",
  },
  B5_NO_FACTORITZA: {
    nom: "Dir que no es pot sense factoritzar",
    explicacio:
      "Abans de dir que no es pot simplificar, prova de factoritzar el numerador i el denominador.",
  },
  B5_FACTOR_ERRONI: {
    nom: "Quedar-se amb el factor equivocat",
    explicacio:
      "Factoritza i mira quin factor és igual a dalt i a baix: $x^2 - 4 = (x + 2)(x - 2)$; si tatxes $(x - 2)$, queda $x + 2$.",
  },
  B5_SIGNE_OPOSAT: {
    nom: "a − x amb x − a",
    explicacio: "$a - x = -(x - a)$. Per tant $\\frac{a - x}{x - a} = -1$, no 1 ni 0.",
  },
  B5_SUMA_FRACCIONS: {
    nom: "Sumar fraccions algebraiques",
    explicacio:
      "Cal denominador comú, com amb els números: $\\frac{1}{x} + \\frac{1}{y} = \\frac{y + x}{x \\cdot y}$.",
  },
  B5_NO_TATXA_FACTOR: {
    nom: "Por de tatxar factors",
    explicacio:
      "Quan una $x$ (o un parèntesi) multiplica tot el numerador i tot el denominador, sí que es pot tatxar (si no val 0).",
  },

  // ── B6 · Equacions amb fraccions ──────────────────────────────────────────
  B6_MCM_PARCIAL: {
    nom: "Multiplicar només alguns termes",
    explicacio:
      "Has de multiplicar **tots** els termes pel m.c.m., també els que no tenen denominador: si multipliques per 6, un 2 es converteix en 12.",
  },
  B6_TREU_DENOMINADORS: {
    nom: "«Treure» els denominadors",
    explicacio:
      "Els denominadors no desapareixen sols: cal multiplicar cada terme pel m.c.m. i simplificar terme a terme.",
  },
  B6_NUMERADOR_SENSE_PARENTESI: {
    nom: "Numerador sense parèntesi",
    explicacio:
      "El numerador és un bloc. $-\\frac{x - 1}{3}$ multiplicat per 6 és $-2(x - 1) = -2x + 2$, no $-2x - 2$.",
  },
  B6_DESPEJA_MAL: {
    nom: "Aïllar la x malament",
    explicacio:
      "Si un número multiplica la $x$, passa a l'altre costat dividint: $3x = 12 \\Rightarrow x = \\frac{12}{3} = 4$. No restant, ni a l'inrevés ($\\frac{3}{12}$).",
  },
  B6_TRANSPOSICIO_SIGNE: {
    nom: "Signe en passar de costat",
    explicacio:
      "Quan un terme passa a l'altre costat sumant o restant, canvia de signe: $x + 5 = 2 \\Rightarrow x = 2 - 5$.",
  },
  B6_SOLUCIO_PROHIBIDA: {
    nom: "Solució que anul·la un denominador",
    explicacio:
      "Abans de donar la solució, comprova que no anul·la cap denominador de l'equació original. Si l'anul·la, no és solució.",
  },
  B6_CREU_AMB_SUMES: {
    nom: "Multiplicar en creu amb sumes",
    explicacio:
      "Només es pot multiplicar en creu quan cada costat és **una sola fracció**. Si hi ha més termes, primer agrupa o multiplica pel m.c.m.",
  },

  // ── B7 · Què es pot fer als dos costats d'una igualtat ───────────────────
  B7_DIVIDEIX_PER_X: {
    nom: "Dividir per x",
    explicacio:
      "Has dividit per $x$, i $x$ podria valer 0: així perds la solució $x = 0$. Passa-ho tot a un costat i treu factor comú: $x(x - 3) = 0$.",
  },
  B7_SOLUCIO_INCOMPLETA: {
    nom: "Quedar-se amb una sola solució",
    explicacio:
      "Un producte val 0 si **qualsevol** dels factors val 0: $x(x - k) = 0$ té dues solucions, $x = 0$ i $x = k$.",
  },
  B7_ARREL_SENSE_PM: {
    nom: "Oblidar el ±",
    explicacio:
      "$x^2 = 9$ té dues solucions: $x = 3$ i $x = -3$. En treure l'arrel als dos costats, posa $\\pm$.",
  },
  B7_UN_SOL_TERME: {
    nom: "Dividir només un terme",
    explicacio:
      "Si divideixes un costat per 2, has de dividir-ne **tots** els termes: $2x + 4 = 6 \\Rightarrow x + 2 = 3$.",
  },
  B7_TATXA_X_SUMA: {
    nom: "Tatxar una x que suma",
    explicacio:
      "Als dos costats pots restar el mateix terme ($x + 5 = 2x + 5 \\Rightarrow x = 2x$), però no pots «tatxar» una $x$ que suma com si multipliqués.",
  },
  B7_QUADRAT_TERME_A_TERME: {
    nom: "Elevar al quadrat terme a terme",
    explicacio:
      "En elevar al quadrat, s'eleva **tot** el costat: $(x - 3)^2 = x^2 - 6x + 9$, no $x^2 - 9$.",
  },
  B7_NO_COMPROVA_ARRELS: {
    nom: "No comprovar les solucions",
    explicacio:
      "En elevar al quadrat poden aparèixer solucions falses. Comprova cada solució a l'equació **original**.",
  },
  B7_INVERS_SUMA: {
    nom: "Invers d'una suma",
    explicacio:
      "$\\frac{1}{x} = \\frac{1}{2} + \\frac{1}{3}$ no vol dir $x = 2 + 3$. Primer suma les fraccions ($\\frac{5}{6}$) i després inverteix: $x = \\frac{6}{5}$.",
  },
  B7_CONFON_IDENTITAT: {
    nom: "Sense solució o infinites",
    explicacio:
      "Si en simplificar queda una cosa falsa com $0 = 5$, **no hi ha solució**. Si queda $0 = 0$, **qualsevol $x$** és solució. Que surti un 0 no vol dir que $x = 0$.",
  },
};

/** Bloc al qual pertany un tag (pel prefix), encara que aparegui en plantilles d'un altre bloc. */
export function blockOfTag(tag: string): string {
  return tag.slice(0, tag.indexOf("_"));
}

/** Textos de les plantilles del bloc B3 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B3_TEXTS = {
  "B3.T1": {
    explicacioCorrecta:
      "L'exponent $[[n]]$ afecta el $[[k]]$ i la $x^{[[a]]}$. $[[k]]^{[[n]]} = [[kn]]$ (multiplicant, no sumant ni multiplicant per $[[n]]$); $(x^{[[a]]})^{[[n]]} = x^{[[an]]}$ (els exponents es multipliquen).",
  },
  "B3.T2": {
    explicacioCorrecta:
      "Al numerador sumes els exponents: $x^{[[a]]} \\cdot x^{[[b]]} = x^{[[ab]]}$. En dividir, restes el del denominador: $[[ab]] - [[c]] = [[r]]$.",
  },
  "B3.T3": {
    explicacioCorrecta:
      "$([[a]]x [[s]] [[p]])^2 = ([[a]]x)^2 [[s]] 2 \\cdot [[a]]x \\cdot [[p]] + [[p]]^2 = [[a2]]x^2 [[s]] [[dp]]x + [[p2]]$. El terme del mig és el doble producte, i $[[p]]^2$ sempre és positiu.",
  },
  "B3.T4": {
    explicacioCorrecta:
      "L'exponent negatiu inverteix la fracció: $\\left(\\frac{[[a]]}{[[b]]}\\right)^{-[[n]]} = \\left(\\frac{[[b]]}{[[a]]}\\right)^{[[n]]} = \\frac{[[bn]]}{[[an]]}$.",
  },
  "B3.T5": {
    explicacioCorrectaValid: "La propietat s'ha aplicat bé.",
    explicacioCorrectaInvalid: "Aquesta «propietat» no existeix: mira la regla d'or del bloc.",
    pool: {
      quadratSuma: {
        valid:
          "Sí: $(x + [[k]])^2 = (x + [[k]])(x + [[k]])$, i en multiplicar surt el doble producte",
        noValid: "No: falta el doble producte $2 \\cdot [[k]] \\cdot x$",
        termeATerme: "Sí: el quadrat s'aplica a cada terme",
        coefNo: "No: el $[[k]]$ no s'havia d'elevar",
      },
      arrelSuma: {
        noValid: "No: l'arrel d'una suma no és la suma de les arrels",
        termeATerme: "Sí: l'arrel s'aplica a cada terme",
        meitat: "Sí: l'arrel quadrada divideix els exponents per 2",
      },
      arrelProducte: {
        valid: "Sí: l'arrel d'un producte és el producte de les arrels (amb $x \\geq 0$)",
        noSurt: "No: el $[[k]]^2$ no pot sortir de l'arrel",
        meitat: "No: hauria de quedar $[[k]]x^2$, perquè l'arrel només treu el quadrat del número",
      },
      sumaPotencies: {
        valid: "Sí: són termes semblants i se sumen els coeficients",
        noValid: "No: en sumar termes semblants se sumen els coeficients, no els exponents",
        sumaExp: "Sí: en sumar potències de la mateixa base se sumen els exponents",
        noEsPot: "No: $x^2 + x^2$ no es pot simplificar",
      },
      expFraccionari: {
        valid: "Sí: un exponent $\\frac{1}{2}$ és una arrel quadrada",
        noValid: "No: l'exponent $\\frac{1}{2}$ no vol dir dividir per 2, vol dir arrel quadrada",
        divideix: "Sí: elevar a $\\frac{1}{2}$ és dividir per 2",
        noExisteix: "No: els exponents han de ser enters",
      },
      expAbast: {
        valid: "Sí: l'exponent $-1$ només afecta la $x$, i $x^{-1} = \\frac{1}{x}$",
        noValid: "No: l'exponent $-1$ només afecta la $x$, no el $[[k]]$",
        tot: "Sí: l'exponent $-1$ inverteix tot el producte",
        negatiu: "No: hauria de quedar $-[[k]]x$",
      },
    },
  },
  "B3.T6": {
    explicacioCorrecta:
      "Primer eleva cada factor multiplicant exponents: $(x^{[[a]]} y^{[[b]]})^{[[n]]} = x^{[[an]]} y^{[[bn]]}$. Després divideix restant exponents de la mateixa base: $x^{[[an]] - [[c]]} y^{[[bn]] - [[d]]}$.",
  },
  "B3.T7": {
    explicacioCorrecta:
      "El denominador de l'exponent ($[[n]]$) és l'índex de l'arrel; el numerador ($[[m]]$), l'exponent de dins: $x^{\\frac{[[m]]}{[[n]]}} = \\sqrt[[[n]]]{x^{[[m]]}}$.",
  },
  "B3.T8": {
    enunciat: "Simplifica $\\frac{([[k]]x^{[[a]]})^{[[n]]} \\cdot x^{[[j]]}}{[[d]]x^{[[c]]}}$",
    explicacioCorrecta:
      "$([[k]]x^{[[a]]})^{[[n]]} = [[kn]]x^{[[an]]}$ (el número també s'eleva; els exponents es multipliquen). Multiplicant per $x^{[[j]]}$ se sumen exponents: $x^{[[anj]]}$. Dividint per $x^{[[c]]}$ es resten: $x^{[[r]]}$. I $[[kn]] : [[d]] = [[coef]]$.",
    explicacioSenseError:
      "Tots els passos són correctes: potència d'una potència (exponents multiplicats, número elevat), producte (exponents sumats) i quocient (exponents restats).",
  },
} as const;

/** Textos de les plantilles del bloc B6 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B6_TEXTS = {
  "B6.T1": {
    explicacioCorrecta:
      "Multiplica tots els termes per $[[L]]$: $[[La]]x + [[Lb]]x = [[Lc]]$. Ajunta les $x$: $[[coef]]x = [[Lc]]$, i divideix pel coeficient: $x = [[s]]$.",
    overrideSuma:
      "$\\frac{x}{[[a]]} + \\frac{x}{[[b]]}$ no és $\\frac{x}{[[ab]]}$: cal denominador comú.",
  },
  "B6.T2": {
    explicacioCorrecta:
      "El m.c.m. de $[[a]]$ i $[[b]]$ és $[[L]]$. Multiplica **cada** terme dels dos costats per $[[L]]$, amb els numeradors entre parèntesis: $[[La]](x + [[p]]) - [[Lb]](x - [[q]]) = [[Lc]]$.",
  },
  "B6.T3": {
    explicacioCorrecta:
      "Cada costat és una sola fracció: pots multiplicar en creu. $[[a]](x + [[d]]) = [[b]]x \\Rightarrow [[a]]x + [[ad]] = [[b]]x \\Rightarrow [[ad]] = [[ba]]x \\Rightarrow x = [[s]]$. Comprova que $x \\neq 0$ i $x \\neq [[md]]$.",
    overrideDistrib:
      "Has multiplicat $[[a]]$ només per la $x$: $[[a]](x + [[d]]) = [[a]]x + [[ad]]$.",
  },
  "B6.T4": {
    explicacioCorrecta:
      "Multiplicant per $(x - [[k]])$: $x + [[m]] = [[k]] + [[m]] \\Rightarrow x = [[k]]$. Però $x = [[k]]$ anul·la el denominador, així que no és solució. L'equació no en té cap.",
  },
  "B6.T5": {
    explicacioCorrectaValid:
      "El pas és correcte: l'equació nova té la mateixa solució que l'original.",
    explicacioCorrectaInvalid:
      "El pas no és correcte: l'equació nova no té la mateixa solució que l'original.",
    pool: {
      mcm: {
        valid: "Sí: he multiplicat **tots** els termes per $[[L]]$, també el $[[c]]$",
        noValid: "No: el $[[c]]$ també s'havia de multiplicar per $[[L]]$",
        nomesFraccions: "Sí: només cal multiplicar els termes que tenen denominador",
        treure: "Sí: els denominadors es treuen i prou",
      },
      parentesi: {
        valid: "Sí: $-[[Lq]](x - [[c]]) = -[[Lq]]x + [[Lqc]]$, el menys afecta els dos termes",
        noValid: "No: $-[[Lq]](x - [[c]]) = -[[Lq]]x + [[Lqc]]$, el menys afecta els dos termes",
        signe: "Sí: el $-[[c]]$ es queda negatiu",
        nomesX: "Sí: el $[[Lq]]$ només multiplica la $x$",
      },
      creu: {
        noValid: "No: només es pot multiplicar en creu si cada costat és una sola fracció",
        siCreu: "Sí: els numeradors es multipliquen en creu amb els denominadors",
        siSuma: "Sí: el $+1$ s'afegeix al numerador",
      },
      despeja: {
        valid: "Sí: el $[[a]]$ multiplica la $x$ i passa dividint",
        noValid: "No: el $[[a]]$ multiplica la $x$, així que passa dividint, no restant",
        resta: "Sí: el $[[a]]$ passa a l'altre costat restant",
        inversa: "Sí: $x = \\frac{[[a]]}{[[b]]}$",
      },
    },
  },
  "B6.T6": {
    enunciat: "Resol $\\frac{x}{[[a]]} - \\frac{x - [[p]]}{[[b]]} = [[c]]$",
    explicacioCorrecta:
      "Multiplica tots els termes per $[[L]]$: $[[La]]x - [[Lb]](x - [[p]]) = [[Lc]]$. Treu el parèntesi: $[[La]]x - [[Lb]]x + [[Lbp]] = [[Lc]]$. Passa el $[[Lbp]]$ restant: $[[coef]]x = [[rhs]]$. Divideix: $x = [[s]]$.",
    explicacioSenseError:
      "Tots els passos són correctes: m.c.m. a tots els termes, parèntesi ben tret, canvi de signe en passar de costat i divisió pel coeficient.",
  },
} as const;

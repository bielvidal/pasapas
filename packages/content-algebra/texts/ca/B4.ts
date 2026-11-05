/** Textos de les plantilles del bloc B4 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B4_TEXTS = {
  "B4.T1": {
    explicacioCorrecta:
      "El factor comú és $[[g]]x$. Divideix cada terme: $\\frac{[[gp]]x^2}{[[g]]x} = [[p]]x$ i $\\frac{[[gq]]x}{[[g]]x} = [[q]]$. Comprova-ho multiplicant.",
  },
  "B4.T2": {
    explicacioCorrecta:
      "$[[a2]]x^2 = ([[a]]x)^2$ i $[[k2]] = [[k]]^2$. Quadrat menys quadrat: suma per diferència, $([[a]]x + [[k]])([[a]]x - [[k]])$.",
  },
  "B4.T3": {
    explicacioCorrecta:
      "$x^2$ i $[[p2]] = [[p]]^2$ són quadrats, i el terme del mig és $2 \\cdot x \\cdot [[p]] = [[dp]]x$: és el quadrat d'una suma (o d'una diferència): $(x [[s]] [[p]])^2$.",
  },
  "B4.T4": {
    explicacioCorrectaValid:
      "La factorització és correcta: si la desenvolupes, tornes a l'expressió inicial.",
    explicacioCorrectaInvalid:
      "Desenvolupa el resultat i veuràs que no torna a l'expressió inicial.",
    pool: {
      sumaQuadrats: {
        noValid: "No: $(x + [[k]])^2 = x^2 + [[dk]]x + [[k2]]$, no $x^2 + [[k2]]$",
        siQuadrat: "Sí: els dos termes són quadrats, així que és un quadrat perfecte",
        siDiferencia: "Sí: és el mateix que $(x + [[k]])(x - [[k]])$",
      },
      difQuadrats: {
        valid: "Sí: quadrat menys quadrat és suma per diferència",
        noValid: "No: $(x - [[k]])^2$ té un terme del mig, $-[[dk]]x$, que aquí no hi és",
        siQuadrat: "Sí: $x^2 - [[k2]]$ és el quadrat de $x - [[k]]$",
        noEsPot: "No: una diferència no es pot factoritzar",
      },
      oposats: {
        valid: "Sí: $[[k]] - x = -(x - [[k]])$, i en elevar al quadrat el signe desapareix",
        ordre: "No: els termes estan en ordre diferent",
        ordreOverride:
          "L'ordre canvia el signe de dins, però el quadrat d'un número i el del seu oposat són iguals.",
        signe: "No: $([[k]] - x)^2 = -(x - [[k]])^2$",
      },
      factorComu: {
        valid: "Sí: $[[g]]x$ multiplica els dos termes, i dins queda el que sobra de cada un",
        noValid: "No: $[[gk]]x : [[g]]x = [[k]]$, no $[[gk]]$; comprova-ho multiplicant",
        siTot: "Sí: el $[[g]]$ es treu i el $[[gk]]$ es queda tal qual",
        noX: "No: la $x$ no es pot treure com a factor",
      },
    },
  },
  "B4.T5": {
    enunciat: "Factoritza completament $[[g]]x^3 - [[gk2]]x$",
    explicacioCorrecta:
      "Factor comú $[[g]]x$: $[[g]]x(x^2 - [[k2]])$ (comprova: $[[g]]x \\cdot [[k2]] = [[gk2]]x$). Després $x^2 - [[k2]]$ és una diferència de quadrats: $(x + [[k]])(x - [[k]])$.",
    explicacioSenseError:
      "Tots els passos són correctes: factor comú ben dividit i diferència de quadrats com a suma per diferència.",
  },
  "B4.T6": {
    explicacioCorrecta:
      "El factor comú als dos termes és $[[g]]$ (la $x$ no és al segon terme). Després, $x^2 - [[k2]]$ encara es pot factoritzar: $[[g]](x + [[k]])(x - [[k]])$.",
  },
} as const;

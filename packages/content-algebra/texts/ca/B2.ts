/** Textos de les plantilles del bloc B2 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B2_TEXTS = {
  "B2.T1": {
    explicacioCorrecta:
      "Denominador comú $[[L]]$. Amplifica cada fracció (numerador i denominador pel mateix número): $\\frac{[[a]]}{[[b]]} = \\frac{[[aL]]}{[[L]]}$ i $\\frac{[[c]]}{[[d]]} = \\frac{[[cL]]}{[[L]]}$. Suma els numeradors: $\\frac{[[n]]}{[[L]]}$, i simplifica si es pot.",
  },
  "B2.T2": {
    explicacioCorrecta:
      "Escriu $[[k]]$ com a fracció amb denominador $[[b]]$: $[[k]] = \\frac{[[kb]]}{[[b]]}$. Després suma els numeradors: $\\frac{[[kb]] + [[a]]}{[[b]]} = \\frac{[[n]]}{[[b]]}$.",
  },
  "B2.T3": {
    explicacioCorrecta:
      "Dividir per $\\frac{[[c]]}{[[d]]}$ és multiplicar per $\\frac{[[d]]}{[[c]]}$: $\\frac{[[a]]}{[[b]]} \\cdot \\frac{[[d]]}{[[c]]} = \\frac{[[ad]]}{[[bc]]}$.",
  },
  "B2.T4": {
    explicacioCorrecta:
      "Escriu el número sol com a fracció ($[[n]] = \\frac{[[n]]}{1}$) i fes la divisió multiplicant per la inversa de la fracció que divideix.",
  },
  "B2.T5": {
    explicacioCorrectaValid: "Es pot fer: la regla s'ha aplicat bé.",
    explicacioCorrectaInvalid: "No es pot fer així: mira la regla d'or del bloc.",
    pool: {
      sumaDividida: {
        valid: "Sí: cada terme del numerador es divideix pel denominador",
        tatxa: "Sí: la $[[a]]$ de dalt es tatxa amb la de baix",
        tatxaInvalid: "Sí: la $[[a]]$ de dalt es tatxa amb la de baix i queda el que sobra",
        noValid: "No: la $[[a]]$ de dalt està sumant, no es pot tatxar",
        enter: "No: s'hauria de multiplicar l'enter a dalt i a baix",
      },
      enterPerFraccio: {
        valid: "Sí: l'enter només multiplica el numerador",
        noValid: "No: l'enter només multiplica el numerador, no el denominador",
        dalt_i_baix: "Sí: l'enter es multiplica a dalt i a baix",
        tatxa: "No: primer s'hauria de tatxar el $[[k]]$ amb el denominador",
      },
    },
  },
  "B2.T6": {
    enunciat: "Calcula $\\left(\\frac{[[a]]}{[[b]]} + \\frac{[[c]]}{[[d]]}\\right) \\cdot [[k]]$",
    explicacioCorrecta:
      "Denominador comú $[[L]]$: $\\frac{[[aL]]}{[[L]]} + \\frac{[[cL]]}{[[L]]} = \\frac{[[n]]}{[[L]]}$. Multiplicar per $[[k]]$ només multiplica el numerador: $\\frac{[[nk]]}{[[L]]}$. Al final, simplifica si es pot.",
    explicacioSenseError:
      "Tots els passos són correctes: s'amplifica numerador i denominador, se sumen només els numeradors, l'enter multiplica només el numerador i es simplifica al final.",
  },
} as const;

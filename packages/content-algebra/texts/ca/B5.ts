/**
 * Textos de les plantilles del bloc B5 (català). Els paràmetres s'escriuen [[k]], [[m]]...
 * i el codi els substitueix pels números de l'ítem. Les matemàtiques van entre $...$.
 */
export const B5_TEXTS = {
  instruccions: {
    simplifica: "Simplifica",
    calcula: "Calcula",
    esValid: "És vàlid aquest pas?",
    perQue: "Per què?",
    onEsError: "On és l'error?",
    quinPas: "Quin és el pas següent correcte?",
  },
  /** Opcions de text pla. */
  opcions: {
    noEsPotSimplificar: "No es pot simplificar",
    totsCorrectes: "Tots els passos són correctes",
    si: "Sí, és vàlid",
    no: "No, no és vàlid",
  },
  plantilles: {
    "B5.T1": {
      explicacioCorrecta:
        "Treu factor comú [[k]] a dalt: $\\frac{[[k]](x + [[m]])}{[[k]]}$. Ara el [[k]] multiplica tot el numerador i es pot tatxar.",
    },
    "B5.T2": {
      explicacioCorrecta:
        "Ni la $x$ ni els números multipliquen tot el numerador i tot el denominador. No hi ha cap factor comú per tatxar.",
    },
    "B5.T3": {
      explicacioCorrecta:
        "$x^2 - [[k2]] = (x + [[k]])(x - [[k]])$. Tatxes el factor que coincideix amb el denominador (per a $x \\neq [[arrel]]$).",
    },
    "B5.T4": {
      explicacioCorrecta:
        "$x^2 + [[b]]x = x(x + [[b]])$. La $x$ multiplica tot el numerador: es tatxa amb la de baix (per a $x \\neq 0$).",
    },
    "B5.T5": {
      explicacioCorrecta:
        "$[[a]] - x = -(x - [[a]])$. Llavors $\\frac{-(x - [[a]])}{x - [[a]]} = -1$ (per a $x \\neq [[a]]$).",
    },
    "B5.T6": {
      explicacioCorrectaValid:
        "El que s'ha tatxat multiplica tot el numerador i tot el denominador.",
      explicacioCorrectaInvalid: "El que s'ha tatxat està sumant o restant, no multiplicant.",
      raonsValid: {
        correcta: "Sí: el que he tatxat multiplica tot el numerador i tot el denominador",
        noTatxaX: "No: mai es pot tatxar res que tingui $x$",
        noTatxaNomesNumeros: "No: només es pot tatxar si són números",
      },
      raonsInvalid: {
        correcta: "No: el que he tatxat està sumant",
        xAmbX: "Sí: $x$ es pot tatxar amb $x$",
        numerosSempre: "Sí: els números es poden simplificar sempre",
      },
    },
    "B5.T7": {
      explicacioCorrecta:
        "Numerador: $(x - [[p]])^2$. Denominador: $(x + [[p]])(x - [[p]])$. Tatxes un $(x - [[p]])$.",
    },
    "B5.T8": {
      explicacioCorrecta:
        "Denominador comú $x(x + [[k]])$. Amplifica: $\\frac{x + [[k]]}{x(x + [[k]])} + \\frac{x}{x(x + [[k]])}$. Suma els numeradors.",
    },
    "B5.T9": {
      enunciat: "Simplifica $\\frac{x^2 - [[k2]]}{x^2 + [[k]]x}$",
      explicacioCorrecta:
        "$x^2 - [[k2]] = (x + [[k]])(x - [[k]])$ i $x^2 + [[k]]x = x(x + [[k]])$. Es tatxa el factor $(x + [[k]])$ i queda $\\frac{x - [[k]]}{x}$, que ja no es pot simplificar més: la $x$ de dalt està restant.",
      explicacioSenseError:
        "Tots els passos són correctes: es factoritza bé, es tatxa un factor comú i el resultat ja no es pot simplificar.",
    },
    "B5.T10": {
      explicacioCorrecta:
        "Abans de tatxar res, factoritza: $x^2 + [[k]]x = x(x + [[k]])$ i $x^2 - [[k2]] = (x + [[k]])(x - [[k]])$. Ara sí que es veu el factor comú $(x + [[k]])$.",
    },
    "B5.T11": {
      enunciat: "Simplifica $\\frac{[[k]]x + [[k2]]}{x^2 + [[k]]x}$",
      explicacioCorrecta:
        "Numerador: $[[k]]x + [[k2]] = [[k]](x + [[k]])$. Denominador: $x^2 + [[k]]x = x(x + [[k]])$. Es tatxa el factor $(x + [[k]])$ i queda $\\frac{[[k]]}{x}$.",
      explicacioSenseError:
        "Tots els passos són correctes: factor comú a dalt i a baix, i es tatxa el factor que coincideix.",
    },
  },
} as const;

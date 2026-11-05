/** Textos de les plantilles del bloc B7 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B7_TEXTS = {
  "B7.T1": {
    explicacioCorrecta:
      "$x^2 - [[k]]x = 0 \\Rightarrow x(x - [[k]]) = 0$. Un producte val 0 si algun factor val 0: $x = 0$ o $x - [[k]] = 0$. Si divideixes per $x$, perds la solució $x = 0$.",
  },
  "B7.T2": {
    explicacioCorrecta:
      "Arrel als dos costats amb $\\pm$: $x [[sp]] = \\pm [[k]]$. Després passa el $[[p]]$ restant: $x = [[k]] [[mp]] = [[r1]]$ o $x = -[[k]] [[mp]] = [[r2]]$.",
  },
  "B7.T3": {
    explicacioCorrectaValid: "El pas és correcte: les dues equacions tenen les mateixes solucions.",
    explicacioCorrectaInvalid:
      "El pas no és correcte: les dues equacions no tenen les mateixes solucions.",
    pool: {
      unSolTerme: {
        valid: "Sí: he dividit **tots** els termes dels dos costats per $[[a]]$",
        noValid: "No: en dividir per $[[a]]$ cal dividir **tots** els termes, també el $[[b]]$",
        nomesX: "Sí: només cal dividir el terme que té la $x$",
        noEsPot: "No: no es pot dividir una equació",
      },
      tatxaX: {
        valid: "Sí: he restat $[[b]]$ als dos costats",
        noValid: "No: la $x$ està sumant, no es pot «tatxar» com si multipliqués",
        tatxa: "Sí: la $x$ es tatxa amb la $x$",
        resta: "Sí: he restat $[[b]]$ als dos costats i després he tatxat les $x$",
      },
      divideixX: {
        valid: "Sí: he passat tot a un costat i he tret factor comú $x$",
        noValid: "No: en dividir per $x$ es perd la solució $x = 0$",
        divideix: "Sí: he dividit els dos costats per $x$",
        resta: "Sí: he restat $x$ als dos costats",
      },
      senseSolucio: {
        valid: "Sí: he dividit els dos costats per $[[a]]$ (i cap de les dues té solució)",
        divideix: "No: $[[a]](x - [[t]])$ no es pot dividir per $[[a]]$",
        tatxa: "No: hauria de quedar $x - [[t]] = 0$",
      },
      multiplica: {
        valid: "Sí: he multiplicat els dos costats per $[[a]]$",
        divideix: "No: hauria de quedar $x = \\frac{[[t]]}{[[a]]}$",
        resta: "No: hauria de quedar $x = [[t]] - [[a]]$",
      },
      arrel: {
        valid: "Sí: l'arrel quadrada dona dues solucions, $[[k]]$ i $-[[k]]$",
        noValid: "No: falta la solució negativa, $x = -[[k]]$",
        nomesPositiva: "Sí: l'arrel quadrada sempre és positiva",
        cap: "No: $x^2 = [[k2]]$ no té solució",
      },
      inversSuma: {
        valid: "Sí: primer he sumat les fraccions i després he invertit",
        noValid:
          "No: cal sumar les fraccions abans d'invertir; $\\frac{1}{x} = \\frac{[[s]]}{[[pq]]}$ dona $x = \\frac{[[pq]]}{[[s]]}$",
        inverteix: "Sí: he invertit cada fracció",
        suma: "Sí: $x = [[p]] + [[q]]$",
      },
    },
  },
  "B7.T4": {
    explicacioCorrecta:
      "Resta $[[a]]x$ als dos costats. Si queda una igualtat falsa ($[[b]] = [[c]]$), no hi ha solució; si queda una de certa ($0 = 0$), qualsevol $x$ la compleix.",
  },
  "B7.T5": {
    explicacioCorrecta:
      "Per treure l'arrel, eleva al quadrat **els dos costats sencers**: $(\\sqrt{x + [[a]]})^2 = (x - [[b]])^2$, és a dir $x + [[a]] = (x - [[b]])^2$. Després caldrà comprovar les solucions a l'original.",
  },
  "B7.T6": {
    explicacioCorrecta:
      "Elevant al quadrat: $x + [[a]] = (x - [[b]])^2 \\Rightarrow x^2 - [[tb]]x + [[cst]] = 0$, amb solucions $[[r1]]$ i $[[r2]]$. Comprovant a l'original: $x = [[r1]]$ funciona ($\\sqrt{[[r1a]]} = [[r1b]]$); $x = [[r2]]$ fa que el costat dret sigui negatiu, i una arrel no pot ser negativa.",
    overrideCap: "Has descartat també la bona: comprova cada solució per separat.",
  },
  "B7.T7": {
    enunciat: "Resol $x^3 = [[k2]]x$",
    explicacioCorrecta:
      "Passa tot a un costat: $x^3 - [[k2]]x = 0$. Factor comú: $x(x^2 - [[k2]]) = 0$. Un producte val 0 si un factor val 0: $x = 0$ o $x^2 = [[k2]]$, i $x^2 = [[k2]]$ té dues solucions, $[[k]]$ i $-[[k]]$.",
    explicacioSenseError:
      "Tots els passos són correctes: no s'ha dividit per $x$ (es treu factor comú), i l'arrel quadrada dona les dues solucions.",
  },
} as const;

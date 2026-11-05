/** Textos de les plantilles del bloc B1 (català). Paràmetres [[k]]; matemàtiques entre $...$. */
export const B1_TEXTS = {
  "B1.T1": {
    explicacioCorrecta:
      "El menys canvia el signe dels dos termes: $-([[a]]x - [[b]]) = -[[a]]x + [[b]]$. Després ajuntes els números: $[[c]] + [[b]] = [[cb]]$.",
  },
  "B1.T2": {
    explicacioCorrecta:
      "$[[k]](x + [[p]]) = [[k]]x + [[kp]]$. $-[[m]](x - [[q]]) = -[[m]]x + [[mq]]$ (menys per menys, més). Ajuntant: $[[km]]x + [[kpmq]]$.",
  },
  "B1.T3": {
    explicacioCorrecta:
      "Primer la multiplicació: $[[b]] \\cdot [[c]] = [[bc]]$. Després, d'esquerra a dreta, la suma i la resta: $[[a]] + [[bc]] - [[d]] = [[r]]$.",
  },
  "B1.T4": {
    explicacioCorrecta:
      "L'exponent afecta només el $[[n]]$: $-[[n]]^2 = -([[n]] \\cdot [[n]]) = -[[n2]]$. Després hi sumes $[[m]]$: $[[m]] - [[n2]] = [[r]]$.",
  },
  "B1.T5": {
    explicacioCorrectaValid:
      "El menys canvia el signe de tots els termes del parèntesi: $-([[a]]x - [[b]]) = -[[a]]x + [[b]]$.",
    explicacioCorrectaInvalid:
      "El menys havia de canviar també el signe del $-[[b]]$: $-([[a]]x - [[b]]) = -[[a]]x + [[b]]$, no $-[[a]]x - [[b]]$.",
    raonsValid: {
      correcta: "Sí: el menys canvia el signe de tots els termes del parèntesi",
      nomesPrimer: "No: el menys només afecta el primer terme",
      noEsPotTreure: "No: un parèntesi no es pot treure si no saps quant val $x$",
      noEsPotTreureOverride: "Un parèntesi sempre es pot treure; només cal aplicar bé els signes.",
    },
    raonsInvalid: {
      correcta: "No: el menys havia de canviar també el signe del segon terme",
      nomesPrimer: "Sí: el menys només afecta el primer terme",
      talQual: "Sí: el parèntesi es treu tal qual, amb els signes de dins",
    },
  },
  "B1.T6": {
    enunciat: "Simplifica $[[k]](x - [[p]]) - (x - [[q]])$",
    explicacioCorrecta:
      "$[[k]](x - [[p]]) = [[k]]x - [[kp]]$ (el $[[k]]$ multiplica els dos termes) i $-(x - [[q]]) = -x + [[q]]$ (el menys canvia els dos signes). Ajuntant: $[[k1]]x + [[r]]$.",
    explicacioSenseError:
      "Tots els passos són correctes: es distribueix bé el $[[k]]$, el menys canvia els dos signes del segon parèntesi i s'ajunten els termes semblants.",
  },
} as const;

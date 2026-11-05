/** Textos de la interfície (català). Els textos de contingut viuen a @pasapas/content-algebra/texts/ca. */
export const UI = {
  app: "Pas a pas · Àlgebra",
  tagline: "Un pas cada vegada. Sense pressa.",
  nav: {
    inici: "Inici",
    progres: "El meu progrés",
    admin: "Administració",
    compte: "El meu compte",
  },
  errors: {
    xarxa: "No hi ha connexió amb el servidor. Torna-ho a provar.",
    sessio: "La sessió ha caducat. Torna a entrar.",
    offlineSenseSessio:
      "Per entrar per primera vegada en aquest dispositiu cal connexió. Quan en tinguis, torna-ho a provar.",
    reintentar: "Tornar-ho a provar",
  },
  entrar: {
    titol: "Entrar",
    explicacio:
      "Escriu el correu amb què t'han convidat i t'enviem un codi de 6 xifres (o el tutor te'l dicta). L'escrius aquí i llestos: aquest navegador et recordarà durant mesos. Sense contrasenyes.",
    email: "El teu correu",
    boto: "Envia'm el codi",
    enviat:
      "Si aquest correu està convidat, en un moment rebràs un codi de 6 xifres (mira també el correu brossa). Caduca en 10 minuts.",
    codi: "Codi",
    entrar: "Entrar",
    entrant: "Entrant…",
    altreCodi: "Demanar un altre codi",
    canviarCorreu: "Canviar el correu",
    error: "No s'ha pogut demanar el codi.",
    canjeant: "Entrant…",
    enllacMal: "L'enllaç no és vàlid o ha caducat. Demana'n un altre.",
    enllacUsatAjuda:
      "Els enllaços són d'un sol ús. Si ja havies entrat en aquest dispositiu, ves a l'inici; si no, demana'n un altre.",
    irInici: "Anar a l'inici",
    privacitat:
      "Què guardem: el teu correu (per entrar), un àlies i les respostes que fas a les preguntes. Res més. Sense anuncis ni analítica de tercers.",
  },
  compte: {
    titol: "El meu compte",
    alies: "Àlies (com vols que et vegin)",
    desar: "Desar",
    desat: "Desat",
    dispositius: "Dispositius amb sessió oberta",
    dispositiusSub:
      "Cada codi obre una sessió en un dispositiu. Si algun ja no el fas servir, tanca'l aquí.",
    aquest: "aquest dispositiu",
    tancar: "tancar",
    des: "des de",
    activitat: "activitat",
    sortir: "Sortir",
    esborrar: "Esborrar el meu compte i les meves dades",
    esborrarConfirma:
      "S'esborrarà el teu compte i tots els teus intents del servidor. No es pot desfer. Segur?",
    esborrarSi: "Sí, esborrar-ho tot",
    esborrarNo: "No",
    sync: "Sincronització",
    syncPendents: (n: number) =>
      n === 1 ? "1 intent pendent d'enviar" : `${n} intents pendents d'enviar`,
    syncAlDia: "Tot sincronitzat. Els teus intents es veuen des de qualsevol dispositiu.",
    syncAra: "Sincronitzar ara",
    aparenca: "Aparença",
  },
  admin: {
    titol: "Administració",
    tabs: { convidats: "Convidats", usuaris: "Usuaris" } as Record<string, string>,
    convidats: {
      intro:
        "Només poden entrar els correus d'aquesta llista (i el tutor). L'àlies és el nom que veurà a l'app.",
      email: "Correu",
      alies: "Àlies",
      boto: "Convidar",
      buit: "Encara no hi ha convidats.",
      haEntrat: "ha entrat",
      noHaEntrat: "encara no ha entrat",
      convidatPer: "convidat per",
      treure: "Treure",
      codi: "Genera un codi",
      codiExplica: (min: number) =>
        `Dicta-li aquest codi: val ${min} minuts i una sola vegada (com si l'hagués rebut per correu).`,
    },
    usuaris: {
      buit: "Encara no ha entrat ningú.",
      cols: ["Qui", "Rol", "Intents", "Últim intent", "Activitat", ""],
      veureProgres: "Veure el progrés",
      dispositius: "Dispositius",
      tancarSessio: "tancar",
      esborrar: "Esborrar l'usuari i les seves dades",
      esborrarConfirma: "S'esborraran el compte i tots els seus intents del servidor. Segur?",
      si: "Sí, esborrar",
      no: "No",
      tu: "tu",
    },
  },
  inici: {
    hola: (alias: string) => (alias ? `Hola, ${alias}` : "Hola"),
    blocs: "Blocs",
    repassa: "Repassa els meus errors",
    repassaN: (n: number) => (n === 1 ? "1 cosa per repassar" : `${n} coses per repassar`),
    aviat: "Aviat",
  },
  estat: {
    en_marxa: "En marxa",
    ho_vaig_agafant: "Ho vaig agafant",
    dominat: "Dominat",
  } as Record<string, string>,
  apren: {
    reglaOr: "Regla d'or",
    exemples: "Exemples",
    comenca: "Comença a practicar",
    tornar: "Tornar a l'inici",
  },
  pregunta: {
    de: (i: number, n: number) => `${i} de ${n}`,
    encaraNo: "Encara no ho sé",
    seguent: "Següent",
    acabar: "Veure el resum",
    perQueCorrecte: "Per què és correcte?",
    moltBe: "Molt bé!",
    aquiHasFet: "Aquí has fet:",
    capProblema: "Cap problema. Mira com es fa:",
    comEsFa: "Com es fa",
    siValid: "Sí, és vàlid",
    noValid: "No, no és vàlid",
    perQue: "Per què?",
    totsCorrectes: "Tots els passos són correctes",
    pas: (i: number) => `Pas ${i}`,
    quinPasFalla: "Toca el pas que falla",
    repas: "Repàs",
    nouNivell: "Nivell següent",
  },
  final: {
    titol: "Ronda acabada",
    resum: (ok: number, n: number) => `${ok} de ${n} ben resoltes`,
    jaNoEtPassa: "Ja no et passa",
    perRepassar: "Per repassar",
    resPerRepassar: "Res per repassar d'aquesta ronda. Endavant!",
    unaAltra: "Una altra ronda",
    inici: "Tornar a l'inici",
    saltades: (n: number) => (n === 1 ? "1 pregunta saltada" : `${n} preguntes saltades`),
  },
  repas: {
    titol: "Repassa els meus errors",
    buit: "Ara mateix no tens res pendent de repassar. Torna demà, o practica un bloc.",
  },
  progres: {
    titol: "El meu progrés",
    titolDe: (alias: string) => `El progrés de ${alias}`,
    subtitol: "Això és exactament el mateix que veu el tutor.",
    subtitolTutor: "Exactament el mateix que veu ella.",
    alumna: "Alumna",
    jo: "Jo",
    carregant: "Carregant els intents del servidor…",
    blocs: "Blocs",
    setmanes: "Les últimes 8 setmanes",
    errors: "Errors típics",
    errorsBuit: "Encara no hi ha dades. Fes una ronda!",
    actiu: "Actiu",
    superat: "Superat",
    diesActius: "Dies amb pràctica (últimes 4 setmanes)",
    intents: "intents",
    encerts: "encerts",
    vegades: (n: number) => (n === 1 ? "1 vegada" : `${n} vegades`),
    senseIntents: "Encara no hi ha cap ronda d'aquest bloc.",
  },
  aparenca: { titol: "Aparença", light: "Clar", dark: "Fosc", system: "Com el mòbil" },
  offline: "Sense connexió: tot funciona igual, es guarda al teu mòbil i s'enviarà després.",
  versio: (v: string) => `Versió ${v}`,
  carregant: "Carregant…",
  noExisteix: "Aquesta pàgina no existeix.",
} as const;

/** «fa 3 min», «fa 2 dies»… (null → «mai»). */
export function ago(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "mai";
  const s = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "ara mateix";
  const m = s / 60;
  if (m < 60) return `fa ${Math.floor(m)} min`;
  const h = m / 60;
  if (h < 24) return `fa ${Math.floor(h)} h`;
  const d = h / 24;
  if (d < 30) return d < 2 ? "fa 1 dia" : `fa ${Math.floor(d)} dies`;
  return new Date(iso).toLocaleDateString("ca-ES");
}

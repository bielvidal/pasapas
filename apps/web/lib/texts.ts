/** Textos de la interfície (català). Els textos de contingut viuen a @pasapas/content-algebra/texts/ca. */
export const UI = {
  app: "Pas a pas · Àlgebra",
  tagline: "Un pas cada vegada. Sense pressa.",
  nav: {
    inici: "Inici",
    progres: "El meu progrés",
    admin: "Administració",
    compte: "El meu compte",
    revisio: "Revisió",
  },
  revisio: {
    titol: "Revisió de plantilles",
    sub: "Cada plantilla amb exemples generats (llavors 1, 2, 3…). La correcta va marcada; els distractors porten el seu error.",
    mes: "Més exemples",
    llavor: (s: number) => `llavor ${s}`,
    valid: "vàlid",
    invalid: "invàlid",
    error: "error aquí",
    nivell: (n: number) => `nivell ${n}`,
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
    tabs: { convidats: "Convidats", usuaris: "Usuaris", textos: "Textos" } as Record<
      string,
      string
    >,
    textos: {
      intro:
        "Tots els textos que veu l'alumna. Un esborrany només el veus tu (també a Revisió); en aprovar-lo, ella el rep a la pròxima sincronització. «Torna a l'original» esborra l'edició.",
      grups: { tag: "Errors", bloc: "Blocs", template: "Plantilles" } as Record<string, string>,
      cerca: "Cerca…",
      editats: (n: number) => (n === 1 ? "1 text editat" : `${n} textos editats`),
      massa: "Hi ha més textos: afina la cerca.",
      buit: "Cap text coincideix.",
      estat: { esborrany: "esborrany", aprovat: "aprovat" } as Record<string, string>,
      original: "Original",
      ajuda:
        "Matemàtiques entre $…$ (LaTeX), negreta amb **…**. Els [[paràmetres]] s'han de conservar.",
      desaEsborrany: "Desa com a esborrany",
      aprova: "Aprova",
      tornaOriginal: "Torna a l'original",
    },
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
  dificultat: {
    titol: "Dificultat",
    auto: "Automàtica",
    autoDesc: "Comença pel nivell que toca i va pujant quan el domines.",
    nivells: {
      1: "Nivell 1 · un pas",
      2: "Nivell 2 · uns quants passos",
      3: "Nivell 3 · resolucions completes",
    } as Record<number, string>,
    curt: { auto: "Auto", 1: "Nivell 1", 2: "Nivell 2", 3: "Nivell 3" } as Record<string, string>,
    ara: (l: string) => `Ara: ${l}`,
    tipus: (t: string) => `Només: ${t}`,
  },
  tipus: {
    mc_result: "Resultat",
    next_step: "Pas següent",
    valid_step: "És vàlid?",
    find_error: "On és l'error?",
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
    reforc: "Per reforçar",
    confirmacio: "Comprovació",
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
  proposats: {
    titol: "Proposats per a tu",
    boto: "Proposats per a tu",
    botoSub: "Una ronda feta amb el que et convé reforçar",
    intro: "Aquesta ronda l'ha preparat l'app amb les teves respostes:",
    reforcar: (n: number) =>
      n === 1 ? "l'error que més et passa" : `els ${n} errors que més et passen`,
    cella: (b: string, l: number) => `el nivell ${l} de ${b}, que encara costa una mica`,
    repas: (n: number) => (n === 1 ? "1 repàs que tocava avui" : `${n} repassos que tocaven avui`),
    confirmar: "un error que ja havies superat, per confirmar-ho",
    buit: "Encara no hi ha prou respostes per proposar-te res. Fes alguna ronda d'un bloc i torna!",
    hemTreballat: "Hem treballat",
    jaNoEtPassa: "Ja no t'ha passat",
    encaraEtPassa: "Encara t'ha passat alguna vegada",
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
    finestra: "Finestra",
    setmanesN: (n: number) => `${n} setmanes`,
    resum: "En aquestes setmanes",
    resumLinia: (n: number, ok: number, skipped: number) =>
      n === 0
        ? "Cap intent en aquestes setmanes."
        : `${n} intents · ${ok} ben resolts${skipped ? ` · ${skipped} saltats` : ""}`,
    nivell: (n: number) => `Nivell ${n}`,
    nivellActual: "nivell actual",
    totsElsBlocs: "Tots els blocs",
    ultimCop: "últim cop",
    mapa: "Mapa de calor",
    mapaRecent: "Estat recent",
    mapaHistoric: "Històric",
    mapaPerNivell: "Per nivell",
    mapaPerTipus: "Per tipus de pregunta",
    mapaAjudaRecent:
      "Estat recent: cada plantilla compta sobretot pels últims intents (l'últim pesa la meitat, l'anterior un quart…). Els errors del principi es van diluint a mesura que encertes.",
    mapaAjudaHistoric: "Històric: encerts sobre el total d'intents des del principi.",
    mapaAjuda:
      "Sota cada percentatge, intents fets. Toca una cel·la per practicar justament això. Gris: encara sense dades.",
    total: "Total",
    llegenda: ["≥ 85 %", "70-84 %", "50-69 %", "< 50 %", "sense dades"],
    perReforcar: "Per reforçar",
    perReforcarBuit:
      "Encara no hi ha cap cel·la amb 3 intents o més per sota del 70 %. Bona feina!",
    practicar: "practicar",
    superatsRecent: "Superats en aquestes setmanes",
    capSuperat: "Encara cap; a mesura que els errors deixin de passar, apareixeran aquí.",
    mesFrequents: "Els que més es repeteixen",
    setmanes: "Setmana a setmana",
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

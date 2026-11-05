import type { Attempt, Session } from "@pasapas/engine";
import Dexie, { type EntityTable } from "dexie";

/**
 * Base de dades local (IndexedDB), una per usuari (`pasapas-u<id>`) perquè dos comptes al mateix
 * navegador no es barregin. Els intents es desen aquí primer amb `synced: 0`; la cua (`lib/sync.ts`)
 * els envia al servidor (idempotent per `id`) i els marca `synced: 1`. L'esquema d'`attempts` és
 * el de §6.
 */
export type LocalAttempt = Attempt & { synced: 0 | 1 };
export type LocalSession = Session & { synced: 0 | 1 };
export interface MetaRow {
  key: string;
  value: string;
}

export class PasapasDB extends Dexie {
  attempts!: EntityTable<LocalAttempt, "id">;
  sessions!: EntityTable<LocalSession, "id">;
  meta!: EntityTable<MetaRow, "key">;

  constructor(name = "pasapas") {
    super(name);
    this.version(1).stores({
      attempts: "id, sessionId, block, templateId, errorTag, clientCreatedAt",
      sessions: "id, startedAt",
    });
    this.version(2)
      .stores({
        attempts: "id, sessionId, block, templateId, errorTag, clientCreatedAt, synced",
        sessions: "id, startedAt, synced",
        meta: "key",
      })
      .upgrade(async (tx) => {
        // Intents de la fase 1 (abans del login): pendents d'enviar.
        await tx.table("attempts").toCollection().modify({ synced: 0 });
        await tx.table("sessions").toCollection().modify({ synced: 0 });
      });
  }
}

/** Nom de la BD de la fase 1 (sense usuari). Es migra a la de l'usuari la primera vegada. */
export const LEGACY_DB = "pasapas";
export const dbNameFor = (userId: number) => `pasapas-u${userId}`;

let currentUserId: number | null = null;
let instance: PasapasDB | null = null;

/** La fixa l'AuthGate abans de renderitzar res que toqui la BD. */
export function setCurrentUser(userId: number | null): void {
  if (userId === currentUserId) return;
  instance?.close();
  instance = null;
  currentUserId = userId;
}

export function db(): PasapasDB {
  if (currentUserId === null) throw new Error("db(): cap usuari actiu");
  if (!instance) instance = new PasapasDB(dbNameFor(currentUserId));
  return instance;
}

/**
 * Primera entrada en aquest navegador: el que l'alumna va fer a la fase 1 (BD `pasapas`) passa a la
 * seva BD d'usuari, pendent de sincronitzar, i la BD antiga s'esborra. Idempotent.
 */
export async function migrateLegacy(userId: number): Promise<number> {
  if (!(await Dexie.exists(LEGACY_DB))) return 0;
  const legacy = new PasapasDB(LEGACY_DB);
  const target = new PasapasDB(dbNameFor(userId));
  try {
    const attempts = await legacy.attempts.toArray();
    const sessions = await legacy.sessions.toArray();
    await target.attempts.bulkPut(attempts.map((a) => ({ ...a, synced: 0 as const })));
    await target.sessions.bulkPut(sessions.map((s) => ({ ...s, synced: 0 as const })));
    return attempts.length;
  } finally {
    legacy.close();
    target.close();
    await Dexie.delete(LEGACY_DB);
  }
}

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

import type { Attempt, Session } from "@pasapas/engine";
import Dexie, { type EntityTable } from "dexie";

/**
 * Base de dades local (IndexedDB). Els intents es guarden aquí primer; a la fase 2 una cua
 * els enviarà al servidor (idempotent per `id`). L'esquema d'`attempts` és el de §6.
 */
export class PasapasDB extends Dexie {
  attempts!: EntityTable<Attempt, "id">;
  sessions!: EntityTable<Session, "id">;

  constructor(name = "pasapas") {
    super(name);
    this.version(1).stores({
      attempts: "id, sessionId, block, templateId, errorTag, clientCreatedAt",
      sessions: "id, startedAt",
    });
  }
}

let instance: PasapasDB | null = null;
export function db(): PasapasDB {
  if (!instance) instance = new PasapasDB();
  return instance;
}

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

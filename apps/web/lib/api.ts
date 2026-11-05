/**
 * Client de l'API: mateix origen (/api/…), cookie de sessió httpOnly. Tots els errors de l'API tenen
 * la forma {error, message}; `message` ja ve en català i es pot ensenyar.
 */
import { UI } from "./texts";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
  /** 0 = sense xarxa (o el servidor no respon). */
  get offline() {
    return this.status === 0;
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
  } catch {
    throw new ApiError(0, "offline", UI.errors.xarxa);
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) {
    const message =
      data.error === "no_session" ? UI.errors.sessio : (data.message ?? UI.errors.xarxa);
    throw new ApiError(res.status, data.error ?? "error", message);
  }
  return data as T;
}

export const post = <T = unknown>(path: string, body: unknown = {}) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });
export const put = <T = unknown>(path: string, body: unknown) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const del = <T = unknown>(path: string) => api<T>(path, { method: "DELETE" });

// --- tipus que retorna l'API ---
export type Role = "tutor" | "student";
export interface Me {
  id: number;
  email: string;
  alias: string;
  role: Role;
}
export interface DeviceSession {
  id: number;
  device: string;
  created_at: string;
  last_activity: string | null;
  current: boolean;
}
export interface UserRow {
  id: number;
  email: string;
  alias: string;
  role: Role;
  created_at: string;
  last_activity: string | null;
  attempts: number;
  last_attempt: string | null;
}
export interface InvitationRow {
  email: string;
  alias: string;
  invited_by: string;
  created_at: string;
  has_entered: boolean;
  user_id: number | null;
}
export interface DictatedCode {
  email: string;
  code: string;
  expires_minutes: number;
}

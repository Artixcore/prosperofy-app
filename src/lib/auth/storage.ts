import type { AuthUser } from "@/lib/api/types";

const KEY = "prosperofy_session_v1";

export type StoredSession = {
  token: string;
  user: AuthUser;
};

export function loadSession(): StoredSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSessionStorage(): void {
  sessionStorage.removeItem(KEY);
}

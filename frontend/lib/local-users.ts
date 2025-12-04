export type LocalUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "creator" | "learner";
};

const STORAGE_KEY = "bite-sized-local-users";

export function getLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: LocalUser[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}



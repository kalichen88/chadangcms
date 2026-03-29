import { create } from "zustand";
import { authGetUser, authPasswordSignIn, authRefreshSession, type AuthSession } from "@/utils/supabaseRest";

type AuthState = {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  initFromStorage: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const STORAGE_KEY = "cms_session_v1";

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: false,
  error: null,
  initFromStorage: async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (!session?.access_token) return;
      set({ loading: true, error: null });
      try {
        await authGetUser(session.access_token);
        set({ session, loading: false });
      } catch {
        if (!session.refresh_token) throw new Error("no_refresh_token");
        const refreshed = await authRefreshSession(session.refresh_token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
        set({ session: refreshed, loading: false });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ session: null, loading: false });
    }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await authPasswordSignIn(email, password);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      set({ session, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "登录失败" });
    }
  },
  signOut: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ session: null, error: null });
  },
}));


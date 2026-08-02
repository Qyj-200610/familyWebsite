import { create } from "zustand";
import type { User } from "../api/types";

const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_REFRESH_KEY = "auth_refresh";

/** From storage to restore login session */
function loadPersistedAuth(): {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
} {
  // localStorage ("remember me") takes priority over sessionStorage
  const storedUser =
    localStorage.getItem(AUTH_USER_KEY) ||
    sessionStorage.getItem(AUTH_USER_KEY);
  const storedToken =
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(AUTH_TOKEN_KEY);
  const storedRefresh =
    localStorage.getItem(AUTH_REFRESH_KEY) ||
    sessionStorage.getItem(AUTH_REFRESH_KEY);

  if (storedUser && storedToken) {
    try {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        refreshToken: storedRefresh,
      };
    } catch {
      // Corrupted data — clear everything
      console.warn(
        "Failed to parse persisted auth data, clearing corrupted storage.",
      );
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_REFRESH_KEY);
    }
  }

  return { user: null, token: null, refreshToken: null };
}

function persistAuth(
  user: User,
  token: string,
  refreshToken: string,
  remember: boolean,
) {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_REFRESH_KEY, refreshToken);

  // Clear the other storage to avoid mode conflicts
  other.removeItem(AUTH_USER_KEY);
  other.removeItem(AUTH_TOKEN_KEY);
  other.removeItem(AUTH_REFRESH_KEY);
}

function clearPersistedAuth() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(AUTH_USER_KEY);
    s.removeItem(AUTH_TOKEN_KEY);
    s.removeItem(AUTH_REFRESH_KEY);
  });
}

// Exported so client.ts can update tokens after a silent refresh
export function updatePersistedTokens(token: string, refreshToken: string) {
  const storage =
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem(AUTH_REFRESH_KEY)
      ? localStorage
      : sessionStorage;
  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_REFRESH_KEY, refreshToken);
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (
    user: User,
    token: string,
    refreshToken: string,
    remember?: boolean,
  ) => void;
  updateUser: (user: User) => void;
  /** Called by client.ts after a successful silent refresh */
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const { user: initialUser, token: initialToken, refreshToken: initialRefresh } =
  loadPersistedAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  refreshToken: initialRefresh,
  isAuthenticated: !!initialToken,

  setAuth: (
    user: User,
    token: string,
    refreshToken: string,
    remember = true,
  ) => {
    persistAuth(user, token, refreshToken, remember);
    set({ user, token, refreshToken, isAuthenticated: true });
  },

  updateUser: (user: User) => {
    // Sync user data to whichever storage is active
    const storedToken =
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      const isLocal = !!localStorage.getItem(AUTH_TOKEN_KEY);
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },

  /** Called by the axios interceptor after a silent token refresh */
  setTokens: (token: string, refreshToken: string) => {
    updatePersistedTokens(token, refreshToken);
    set({ token, refreshToken });
  },

  logout: () => {
    clearPersistedAuth();
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));

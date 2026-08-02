import { create } from "zustand";
import type { User } from "../api/types";

const AUTH_USER_KEY = "auth_user";
const AUTH_TOKEN_KEY = "auth_token";

/** 从 storage 恢复登录态 */
function loadPersistedAuth(): { user: User | null; token: string | null } {
  // localStorage（记住我）优先，sessionStorage（仅本次会话）作为降级
  const storedUser =
    localStorage.getItem(AUTH_USER_KEY) ||
    sessionStorage.getItem(AUTH_USER_KEY);
  const storedToken =
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (storedUser && storedToken) {
    try {
      return { user: JSON.parse(storedUser), token: storedToken };
    } catch {
      // JSON 解析失败则清除脏数据
      console.warn("Failed to parse persisted auth data, clearing corrupted storage.");
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  return { user: null, token: null };
}

function persistAuth(user: User, token: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  const other =
    remember ? sessionStorage : localStorage;

  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  storage.setItem(AUTH_TOKEN_KEY, token);

  // 清除另一个 storage，避免两种模式冲突
  other.removeItem(AUTH_USER_KEY);
  other.removeItem(AUTH_TOKEN_KEY);
}

function clearPersistedAuth() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(AUTH_USER_KEY);
    s.removeItem(AUTH_TOKEN_KEY);
  });
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, remember?: boolean) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const { user: initialUser, token: initialToken } = loadPersistedAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,

  setAuth: (user: User, token: string, remember = true) => {
    persistAuth(user, token, remember);
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (user: User) => {
    // 同步更新 localStorage / sessionStorage 中的用户数据
    const storedToken =
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      // 判断是 localStorage 还是 sessionStorage
      const isLocal = !!localStorage.getItem(AUTH_TOKEN_KEY);
      const storage = isLocal ? localStorage : sessionStorage;
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    clearPersistedAuth();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

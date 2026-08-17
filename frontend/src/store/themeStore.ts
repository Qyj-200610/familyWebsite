import { create } from "zustand";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_KEY = "theme_preference";

/** 从 localStorage 恢复主题偏好 */
function loadPersistedTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function persistTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/** 解析系统主题 */
export function resolveSystem(): ResolvedTheme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

/** 应用主题到 <html> 元素 */
export function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}

interface ThemeState {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = loadPersistedTheme();
  const initialResolved: ResolvedTheme =
    initialTheme === "system" ? resolveSystem() : initialTheme;

  return {
    theme: initialTheme,
    resolved: initialResolved,

    setTheme: (theme: Theme) => {
      persistTheme(theme);
      const resolved: ResolvedTheme =
        theme === "system" ? resolveSystem() : theme;
      applyTheme(resolved);
      set({ theme, resolved });
    },
  };
});

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * 页面级认证守卫（双重保障）。
 *
 * 路由层已有 <AuthGuard> 拦截未登录访问；此处保留页面内再校验一次的行为
 * （见 CLAUDE.md「路由守卫」— 各页面内部保留 isAuthenticated 检查作为双重保障）。
 * 返回 isAuthenticated，供页面在未登录时提前返回 null 避免闪动。
 */
export function useRequireAuth(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}

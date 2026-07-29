import client from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "./types";

// ============================================================
// 认证 API
// ============================================================

export const authApi = {
  /** POST /api/auth/register — 注册（不自动登录） */
  register: (data: RegisterRequest) =>
    client.post<null>("/auth/register", data),

  /** POST /api/auth/login — 登录 */
  login: (data: LoginRequest) =>
    client.post<AuthResponse>("/auth/login", data),

  /** POST /api/auth/logout — 退出登录 */
  logout: () => client.post("/auth/logout"),

  /** POST /api/auth/reset-password — 重置密码 */
  resetPassword: (data: ResetPasswordRequest) =>
    client.post<null>("/auth/reset-password", data),
};

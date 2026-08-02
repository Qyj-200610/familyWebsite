import axios from "axios";
import client, { instance } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "./types";

// ============================================================
// 认证 API
// ============================================================

/** Raw axios instance WITHOUT the 401 interceptor — used for refresh calls
 *  to avoid infinite recursion when the refresh token itself is expired. */
const rawAxios = axios.create({
  baseURL: instance.defaults.baseURL,
  timeout: instance.defaults.timeout,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

export const authApi = {
  /** POST /api/auth/register — 注册（不自动登录，返回 null） */
  register: (data: RegisterRequest) =>
    client.post<null>("/auth/register", data),

  /** POST /api/auth/login — 登录 */
  login: (data: LoginRequest) =>
    client.post<AuthResponse>("/auth/login", data),

  /** POST /api/auth/logout — 退出登录 */
  logout: () => client.post<null>("/auth/logout"),

  /** POST /api/auth/reset-password — 重置密码 */
  resetPassword: (data: ResetPasswordRequest) =>
    client.post<null>("/auth/reset-password", data),

  /**
   * POST /api/auth/refresh — 用 refresh token 换取新的 access token。
   *
   * 使用原始 axios 实例而非 client，避免触发 401 拦截器的无限递归。
   * 返回 unwrapped 的 AxiosResponse，调用方自行提取 data。
   */
  refresh: (data: RefreshTokenRequest) =>
    rawAxios.post<AuthResponse>("/auth/refresh", data),
};

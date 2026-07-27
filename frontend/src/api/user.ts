import client from "./client";
import type { User, UpdateUserRequest } from "./types";

// ============================================================
// 用户 API
// ============================================================

export const userApi = {
  /** GET /api/user/me — 获取当前用户信息 */
  getMe: () => client.get<User>("/user/me"),

  /** PATCH /api/user/me — 更新当前用户信息 */
  updateMe: (data: UpdateUserRequest) =>
    client.patch<User>("/user/me", data),
};

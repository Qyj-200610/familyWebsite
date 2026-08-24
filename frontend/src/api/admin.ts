import client from "./client";
import type { User } from "./types";

// ============================================================
// 管理员 API
// ============================================================

export const adminApi = {
  /** GET /api/admin/users — 获取所有用户（仅管理员） */
  getUsers: () => client.get<User[]>("/admin/users"),
};

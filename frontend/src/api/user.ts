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

  /** POST /api/user/me/avatar — 上传头像（multipart/form-data） */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<User>("/user/me/avatar", formData);
  },
};

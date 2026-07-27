// ============================================================
// 前端 API 类型定义 — 与 docs/interface.md 保持一致
// ============================================================

// === 通用 ===

/** 后端统一响应包装 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// === 用户 ===

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  createdAt?: string;
}

// === 认证 ===

/** POST /api/auth/register */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 认证成功返回（登录 & 注册通用） */
export interface AuthResponse {
  user: User;
  token: string;
}

// === 用户操作 ===

/** PATCH /api/user/me */
export interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}

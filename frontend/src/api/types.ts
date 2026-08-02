// ============================================================
// 前端 API 类型定义 — 与 frontend/docs/interface.md 保持一致
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
  lastLoginAt?: string | null;
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

/** POST /api/auth/reset-password */
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

/** 认证成功返回（登录 & token 刷新通用） */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/** POST /api/auth/refresh */
export interface RefreshTokenRequest {
  refreshToken: string;
}

// === 用户操作 ===

/** PATCH /api/user/me */
export interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}

/** GET /api/user/me/stats */
export interface UserStats {
  photoCount: number;
  foodOrderCount: number;
  familyMemberCount: number;
}

// === 相册 ===

/** 照片上传者简要信息 */
export interface PhotoUploader {
  id: number;
  username: string;
}

/** 照片 */
export interface Photo {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  description: string | null;
  uploadedBy: number;
  uploader: PhotoUploader | null;
  albumId: number | null;
  createdAt: string;
}

// === 相册 ===

/** 相册 */
export interface Album {
  id: number;
  name: string;
  isPublic: boolean;
  createdBy: number;
  creator: PhotoUploader | null;
  photoCount: number;
  coverPhoto: Photo | null;
  createdAt: string;
}

/** 相册详情（含照片列表） */
export interface AlbumDetail extends Album {
  photos: Photo[];
}

/** POST /api/albums 创建相册 */
export interface AlbumCreateRequest {
  name: string;
  isPublic?: boolean;
}

// === 美食点单 ===

/** 订单中的单个菜品 */
export interface OrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
}

// === 家谱 ===

/** 家族成员在线状态 */
export interface FamilyMemberStatus {
  name: string;
  online: boolean;
  avatar: string | null;
}

/** GET /api/family/status */
export interface FamilyStatusResponse {
  members: FamilyMemberStatus[];
}

/** POST /api/food/orders */
export interface SubmitOrderRequest {
  items: OrderItem[];
  note?: string;
}

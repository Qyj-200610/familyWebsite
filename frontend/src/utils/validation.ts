// ============================================================
// 表单校验工具 — 与后端 schema 保持一致
// ============================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 密码规则与后端 PASSWORD_PATTERN 对齐：至少 8 位，含大小写字母和数字 */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_ERROR_MESSAGE = "密码至少 8 位，且必须包含大小写字母和数字";

/** 校验邮箱格式，返回是否合法 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * 校验密码强度。返回错误文案，合法（或为空）时返回 null。
 * 规则与后端 `schemas/user.py` 的 `PASSWORD_PATTERN` 保持一致，
 * 避免前端放行后后端再拒绝的割裂体验。空值交由调用方单独提示。
 */
export function getPasswordError(password: string): string | null {
  if (!password) return null;
  if (!PASSWORD_PATTERN.test(password)) return PASSWORD_ERROR_MESSAGE;
  return null;
}

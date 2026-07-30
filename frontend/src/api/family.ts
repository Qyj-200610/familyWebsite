import client from "./client";
import type { FamilyStatusResponse } from "./types";

// ============================================================
// 家谱 API
// ============================================================

export const familyApi = {
  /** GET /api/family/status — 获取家族成员在线状态 */
  getStatus: () => client.get<FamilyStatusResponse>("/family/status"),
};

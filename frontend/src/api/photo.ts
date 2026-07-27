import client from "./client";
import type { Photo } from "./types";

// ============================================================
// 相册 API
// ============================================================

export const photoApi = {
  /** GET /api/photos — 获取照片列表（分页） */
  getPhotos: (skip?: number, limit?: number) =>
    client.get<Photo[]>("/photos", { params: { skip, limit } }),

  /** POST /api/photos/upload — 上传照片（multipart/form-data） */
  uploadPhoto: (file: File, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }
    return client.post<Photo>("/photos/upload", formData);
  },

  /** DELETE /api/photos/{id} — 删除照片 */
  deletePhoto: (id: number) => client.delete<null>(`/photos/${id}`),
};

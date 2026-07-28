import client from "./client";
import type { Album, AlbumDetail, Photo } from "./types";

// ============================================================
// 相册 API
// ============================================================

export const albumApi = {
  /** POST /api/albums — 创建相册 */
  createAlbum: (name: string, isPublic: boolean) =>
    client.post<Album>("/albums", { name, isPublic }),

  /** GET /api/albums — 获取相册列表 */
  getAlbums: () => client.get<Album[]>("/albums"),

  /** GET /api/albums/{id} — 获取相册详情（含照片列表） */
  getAlbum: (id: number) => client.get<AlbumDetail>(`/albums/${id}`),

  /** DELETE /api/albums/{id} — 删除相册 */
  deleteAlbum: (id: number) => client.delete<null>(`/albums/${id}`),

  /** POST /api/albums/{id}/photos/upload — 上传照片到相册 */
  uploadPhoto: (albumId: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }
    return client.post<Photo>(`/albums/${albumId}/photos/upload`, formData);
  },
};

// ============================================================
// 照片 API
// ============================================================

export const photoApi = {
  /** GET /api/albums/{id}/photos — 获取相册内的照片列表（分页） */
  getAlbumPhotos: (albumId: number, skip?: number, limit?: number) =>
    client.get<Photo[]>(`/albums/${albumId}/photos`, { params: { skip, limit } }),

  /** DELETE /api/photos/{id} — 删除照片 */
  deletePhoto: (id: number) => client.delete<null>(`/photos/${id}`),
};

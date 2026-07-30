import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { albumApi, photoApi, uploadUrl } from "../../api";
import type { Album, AlbumDetail, Photo } from "../../api/types";
import PageNav from "../../components/PageNav/PageNav";

import "./photoAlbum.css";

// ============================================================
// 常量
// ============================================================

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ============================================================
// PhotoAlbum 页面组件
// ============================================================

type ViewMode = "list" | "detail";

function PhotoAlbum() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // ---------- 视图模式 ----------
  const [view, setView] = useState<ViewMode>("list");
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string>("");

  // ---------- 相册列表状态 ----------
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState<string | null>(null);

  // ---------- 相册详情状态 ----------
  const [albumDetail, setAlbumDetail] = useState<AlbumDetail | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);

  // ---------- 创建相册弹窗 ----------
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumIsPublic, setNewAlbumIsPublic] = useState(true);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [createAlbumError, setCreateAlbumError] = useState<string | null>(null);

  // ---------- 删除相册 ----------
  const [deleteAlbumTarget, setDeleteAlbumTarget] = useState<Album | null>(null);

  // ---------- 上传弹窗 ----------
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- 照片查看器 ----------
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

  // ---------- 删除照片 ----------
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<Photo | null>(null);

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ---------- 加载相册列表 ----------
  const fetchAlbums = useCallback(async () => {
    setAlbumsLoading(true);
    setAlbumsError(null);
    try {
      const data = await albumApi.getAlbums();
      setAlbums(data ?? []);
    } catch (err) {
      setAlbumsError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setAlbumsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => fetchAlbums());
    }
  }, [isAuthenticated, fetchAlbums]);

  // ---------- 加载相册详情 ----------
  const fetchAlbumDetail = useCallback(async (albumId: number) => {
    setPhotosLoading(true);
    setPhotosError(null);
    try {
      const data = await albumApi.getAlbum(albumId);
      setAlbumDetail(data);
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : "加载相册失败");
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  // ---------- 进入 / 返回 ----------
  const enterAlbum = (album: Album) => {
    setSelectedAlbumId(album.id);
    setSelectedAlbumName(album.name);
    setView("detail");
    fetchAlbumDetail(album.id);
  };

  const backToList = () => {
    setView("list");
    setSelectedAlbumId(null);
    setSelectedAlbumName("");
    setAlbumDetail(null);
    setPhotosError(null);
    fetchAlbums();
  };

  // ---------- 创建相册 ----------
  const handleCreateAlbum = async () => {
    const name = newAlbumName.trim();
    if (!name) { setCreateAlbumError("请输入相册名称"); return; }
    setCreatingAlbum(true);
    setCreateAlbumError(null);
    try {
      await albumApi.createAlbum(name, newAlbumIsPublic);
      setCreateAlbumOpen(false);
      setNewAlbumName("");
      setNewAlbumIsPublic(true);
      fetchAlbums();
    } catch (err) {
      setCreateAlbumError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreatingAlbum(false);
    }
  };

  const openCreateAlbumDialog = () => {
    setCreateAlbumOpen(true);
    setNewAlbumName("");
    setNewAlbumIsPublic(true);
    setCreateAlbumError(null);
  };

  // ---------- 删除相册 ----------
  const handleDeleteAlbum = async () => {
    if (!deleteAlbumTarget) return;
    try {
      await albumApi.deleteAlbum(deleteAlbumTarget.id);
      setAlbums((prev) => prev.filter((a) => a.id !== deleteAlbumTarget.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleteAlbumTarget(null);
    }
  };

  // ---------- 上传逻辑 ----------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setUploadError("仅支持 JPG、PNG、WebP 格式的图片");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("文件大小不能超过 10 MB");
      return;
    }
    setUploadError(null);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile || selectedAlbumId === null) return;
    setUploading(true);
    setUploadError(null);
    try {
      const newPhoto = await albumApi.uploadPhoto(selectedAlbumId, uploadFile, uploadDescription.trim() || undefined);
      if (newPhoto && albumDetail) {
        setAlbumDetail({ ...albumDetail, photos: [newPhoto, ...albumDetail.photos], photoCount: albumDetail.photoCount + 1 });
      }
      setUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadDescription("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const openUploadDialog = () => {
    setUploadOpen(true);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadDescription("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeUploadDialog = () => {
    if (uploading) return;
    setUploadOpen(false);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadDescription("");
    setUploadError(null);
  };

  // ---------- 删除照片 ----------
  const handleDeletePhoto = async () => {
    if (!deletePhotoTarget) return;
    try {
      await photoApi.deletePhoto(deletePhotoTarget.id);
      if (albumDetail) {
        setAlbumDetail({
          ...albumDetail,
          photos: albumDetail.photos.filter((p) => p.id !== deletePhotoTarget.id),
          photoCount: albumDetail.photoCount - 1,
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletePhotoTarget(null);
    }
  };

  // ---------- 查看器 ----------
  const openViewer = (photo: Photo) => { setViewerPhoto(photo); setViewerOpen(true); };
  const closeViewer = () => { setViewerOpen(false); setViewerPhoto(null); };

  const getPhotoUrl = (filename: string) => uploadUrl(`/uploads/photos/${filename}`);

  if (!isAuthenticated) return null;

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <div className="album">
      <div className="album__top-decor" />
      {/* ===== 导航栏 (共享组件) ===== */}
      <PageNav />

      {/* ===== 主内容区 ===== */}
      <main className="album__main">
        <div className="album__container">
          {/* ========== 相册列表视图 ========== */}
          {view === "list" && (
            <>
              <div className="album__header">
                <div>
                  <h2 className="album__title">📸 家庭相册</h2>
                  <p className="album__subtitle">
                    {albumsLoading ? "加载中..." : `${albums.length} 个相册`}
                  </p>
                </div>
                <button className="album__btn album__btn--primary" onClick={openCreateAlbumDialog}>
                  <span className="album__btn-icon">+</span>
                  创建相册
                </button>
              </div>

              {albumsError && (
                <div className="album__error">
                  <span>⚠️ {albumsError}</span>
                  <button onClick={fetchAlbums}>重试</button>
                </div>
              )}

              {albumsLoading ? (
                <div className="album__loading">
                  <div className="album__spinner" />
                  <p>正在加载相册...</p>
                </div>
              ) : albums.length === 0 ? (
                <div className="album__empty">
                  <span className="album__empty-icon">📸</span>
                  <h3>还没有相册</h3>
                  <p>点击上方「创建相册」按钮，创建你的第一个相册吧</p>
                  <button className="album__empty-btn" onClick={openCreateAlbumDialog}>创建第一个相册</button>
                </div>
              ) : (
                <div className="album__album-grid">
                  {albums.map((album) => (
                    <div key={album.id} className="album__album-card" onClick={() => enterAlbum(album)}>
                      <div className="album__album-cover">
                        {album.coverPhoto ? (
                          <img src={getPhotoUrl(album.coverPhoto.filename)} alt={album.name} loading="lazy" />
                        ) : (
                          <span className="album__album-cover-placeholder">📷</span>
                        )}
                      </div>
                      <div className="album__album-info">
                        <div className="album__album-name-row">
                          <h3 className="album__album-name">{album.name}</h3>
                          <span className={`album__album-badge ${album.isPublic ? "album__album-badge--public" : "album__album-badge--private"}`}>
                            {album.isPublic ? "公开" : "私有"}
                          </span>
                        </div>
                        <p className="album__album-meta">
                          <span>{album.photoCount} 张照片</span><span>·</span>
                          <span>{album.creator?.username || "未知"}</span><span>·</span>
                          <span>{formatDate(album.createdAt)}</span>
                        </p>
                      </div>
                      {album.createdBy === user?.id && (
                        <button className="album__album-card-delete" onClick={(e) => { e.stopPropagation(); setDeleteAlbumTarget(album); }} title="删除相册">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========== 相册详情视图 ========== */}
          {view === "detail" && (
            <>
              <div className="album__header">
                <div>
                  <button className="album__back-btn" onClick={backToList}>← 返回相册列表</button>
                  <h2 className="album__title">{selectedAlbumName}</h2>
                  <p className="album__subtitle">
                    {photosLoading ? "加载中..." : `${albumDetail?.photoCount ?? 0} 张照片`}
                  </p>
                </div>
                <button className="album__btn album__btn--primary" onClick={openUploadDialog}>
                  <span className="album__btn-icon">+</span>
                  上传照片
                </button>
              </div>

              {photosError && (
                <div className="album__error">
                  <span>⚠️ {photosError}</span>
                  <button onClick={() => selectedAlbumId && fetchAlbumDetail(selectedAlbumId)}>重试</button>
                </div>
              )}

              {photosLoading ? (
                <div className="album__loading">
                  <div className="album__spinner" />
                  <p>正在加载照片...</p>
                </div>
              ) : !albumDetail || albumDetail.photos.length === 0 ? (
                <div className="album__empty">
                  <span className="album__empty-icon">📷</span>
                  <h3>还没有照片</h3>
                  <p>在这个相册里上传照片，记录美好瞬间吧</p>
                  <button className="album__empty-btn" onClick={openUploadDialog}>上传第一张照片</button>
                </div>
              ) : (
                <div className="album__grid">
                  {albumDetail.photos.map((photo) => (
                    <div key={photo.id} className="album__card" onClick={() => openViewer(photo)}>
                      <div className="album__card-image">
                        <img src={getPhotoUrl(photo.filename)} alt={photo.description || photo.originalFilename} loading="lazy" />
                        <div className="album__card-overlay">
                          {photo.description && <p className="album__card-desc">{photo.description}</p>}
                          <span className="album__card-date">{formatDate(photo.createdAt)}</span>
                          <span className="album__card-uploader">{photo.uploader?.username || "未知"}</span>
                        </div>
                      </div>
                      {photo.uploadedBy === user?.id && (
                        <button className="album__card-delete" onClick={(e) => { e.stopPropagation(); setDeletePhotoTarget(photo); }} title="删除照片">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ===== 创建相册弹窗 ===== */}
      {createAlbumOpen && (
        <div className="album__modal-overlay" onClick={() => setCreateAlbumOpen(false)}>
          <div className="album__modal" onClick={(e) => e.stopPropagation()}>
            <div className="album__modal-header">
              <h3>创建相册</h3>
              <button className="album__modal-close" onClick={() => setCreateAlbumOpen(false)} disabled={creatingAlbum}>✕</button>
            </div>
            <div className="album__modal-body">
              <div className="album__form-group">
                <label className="album__form-label">相册名称</label>
                <input type="text" className="album__form-input" placeholder="给相册取个名字..." value={newAlbumName}
                  onChange={(e) => { setNewAlbumName(e.target.value); setCreateAlbumError(null); }}
                  maxLength={100} disabled={creatingAlbum} autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateAlbum(); }} />
              </div>
              <div className="album__form-group">
                <label className="album__form-label">相册权限</label>
                <div className="album__toggle-row">
                  <button type="button" className={`album__toggle-option ${newAlbumIsPublic ? "album__toggle-option--active" : ""}`}
                    onClick={() => setNewAlbumIsPublic(true)} disabled={creatingAlbum}>
                    <span className="album__toggle-icon">🌐</span>
                    <div><div className="album__toggle-label">公开</div><div className="album__toggle-hint">所有人都能看到</div></div>
                  </button>
                  <button type="button" className={`album__toggle-option ${!newAlbumIsPublic ? "album__toggle-option--active" : ""}`}
                    onClick={() => setNewAlbumIsPublic(false)} disabled={creatingAlbum}>
                    <span className="album__toggle-icon">🔒</span>
                    <div><div className="album__toggle-label">私有</div><div className="album__toggle-hint">仅自己可见</div></div>
                  </button>
                </div>
              </div>
              {createAlbumError && <div className="album__upload-error">⚠️ {createAlbumError}</div>}
            </div>
            <div className="album__modal-footer">
              <button className="album__modal-btn album__modal-btn--cancel" onClick={() => setCreateAlbumOpen(false)} disabled={creatingAlbum}>取消</button>
              <button className="album__modal-btn album__modal-btn--confirm" onClick={handleCreateAlbum} disabled={!newAlbumName.trim() || creatingAlbum}>
                {creatingAlbum ? "创建中..." : "创建相册"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 上传弹窗 ===== */}
      {uploadOpen && (
        <div className="album__modal-overlay" onClick={closeUploadDialog}>
          <div className="album__modal" onClick={(e) => e.stopPropagation()}>
            <div className="album__modal-header">
              <h3>上传照片</h3>
              <button className="album__modal-close" onClick={closeUploadDialog} disabled={uploading}>✕</button>
            </div>
            <div className="album__modal-body">
              {!uploadPreview ? (
                <div className="album__dropzone" onClick={() => fileInputRef.current?.click()}>
                  <span className="album__dropzone-icon">📁</span>
                  <p>点击选择图片，或将图片拖拽到此处</p>
                  <span className="album__dropzone-hint">支持 JPG、PNG、WebP，最大 10 MB</span>
                </div>
              ) : (
                <div className="album__preview">
                  <img src={uploadPreview} alt="预览" />
                  <button className="album__preview-change" onClick={() => {
                    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                    setUploadFile(null); setUploadPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }} disabled={uploading}>重新选择</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={handleFileSelect} hidden />
              {uploadFile && (
                <div className="album__file-info">
                  <span className="album__file-name">{uploadFile.name}</span>
                  <span className="album__file-size">{formatFileSize(uploadFile.size)}</span>
                </div>
              )}
              {uploadFile && (
                <textarea className="album__desc-input" placeholder="添加照片描述（可选）..." value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)} maxLength={200} rows={3} disabled={uploading} />
              )}
              {uploadError && <div className="album__upload-error">⚠️ {uploadError}</div>}
            </div>
            <div className="album__modal-footer">
              <button className="album__modal-btn album__modal-btn--cancel" onClick={closeUploadDialog} disabled={uploading}>取消</button>
              <button className="album__modal-btn album__modal-btn--confirm" onClick={handleUploadConfirm} disabled={!uploadFile || uploading}>
                {uploading ? "上传中..." : "确认上传"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 照片查看器 ===== */}
      {viewerOpen && viewerPhoto && (
        <div className="album__viewer-overlay" onClick={closeViewer}>
          <button className="album__viewer-close" onClick={closeViewer}>✕</button>
          <div className="album__viewer-content" onClick={(e) => e.stopPropagation()}>
            <img src={getPhotoUrl(viewerPhoto.filename)} alt={viewerPhoto.description || viewerPhoto.originalFilename} />
            <div className="album__viewer-info">
              {viewerPhoto.description && <p className="album__viewer-desc">{viewerPhoto.description}</p>}
              <p className="album__viewer-meta">
                <span>上传者：{viewerPhoto.uploader?.username || "未知"}</span>
                <span>上传时间：{formatDate(viewerPhoto.createdAt)}</span>
                <span>大小：{formatFileSize(viewerPhoto.fileSize)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 删除相册确认 ===== */}
      {deleteAlbumTarget && (
        <div className="album__modal-overlay" onClick={() => setDeleteAlbumTarget(null)}>
          <div className="album__modal album__modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="album__modal-header"><h3>确认删除相册</h3></div>
            <div className="album__modal-body">
              <p>确定要删除相册「{deleteAlbumTarget.name}」吗？</p>
              <p className="album__confirm-warning">相册内的照片不会被删除，你可以稍后重新整理。</p>
            </div>
            <div className="album__modal-footer">
              <button className="album__modal-btn album__modal-btn--cancel" onClick={() => setDeleteAlbumTarget(null)}>取消</button>
              <button className="album__modal-btn album__modal-btn--danger" onClick={handleDeleteAlbum}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 删除照片确认 ===== */}
      {deletePhotoTarget && (
        <div className="album__modal-overlay" onClick={() => setDeletePhotoTarget(null)}>
          <div className="album__modal album__modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="album__modal-header"><h3>确认删除</h3></div>
            <div className="album__modal-body">
              <p>确定要删除这张照片吗？{deletePhotoTarget.description && <span className="album__confirm-desc">「{deletePhotoTarget.description}」</span>}</p>
              <p className="album__confirm-warning">此操作不可撤销。</p>
            </div>
            <div className="album__modal-footer">
              <button className="album__modal-btn album__modal-btn--cancel" onClick={() => setDeletePhotoTarget(null)}>取消</button>
              <button className="album__modal-btn album__modal-btn--danger" onClick={handleDeletePhoto}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoAlbum;

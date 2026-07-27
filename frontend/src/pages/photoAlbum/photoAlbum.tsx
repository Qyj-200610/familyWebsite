import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi, photoApi } from "../../api";
import type { Photo } from "../../api/types";

import exitLoginIcon from "../../svg/exitLogin.svg";
import "./photoAlbum.css";

// ============================================================
// 常量
// ============================================================

const PHOTOS_PER_PAGE = 20;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/** 格式化文件大小为可读字符串 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 格式化日期为简洁格式 */
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

  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ============================================================
// PhotoAlbum 页面组件
// ============================================================

function PhotoAlbum() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // ---------- 导航栏状态 ----------
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---------- 照片列表状态 ----------
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---------- 上传弹窗状态 ----------
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- 照片查看器状态 ----------
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);

  // ---------- 删除确认状态 ----------
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 加载照片列表
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await photoApi.getPhotos(0, PHOTOS_PER_PAGE);
      setPhotos(data ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => fetchPhotos());
    }
  }, [isAuthenticated, fetchPhotos]);

  // ---------- 退出登录 ----------
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    navigate("/");
  };

  // ---------- 上传逻辑 ----------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 客户端预检
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];
    if (!ext || !allowedExts.includes(ext)) {
      setUploadError("仅支持 JPG、PNG、WebP 格式的图片");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("文件大小不能超过 10 MB");
      return;
    }

    setUploadError(null);
    setUploadFile(file);

    // 生成预览 URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const newPhoto = await photoApi.uploadPhoto(
        uploadFile,
        uploadDescription.trim() || undefined,
      );
      // 将新照片插入到列表最前面
      if (newPhoto) {
        setPhotos((prev) => [newPhoto, ...prev]);
      }
      // 重置上传状态
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
    // 重置 file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeUploadDialog = () => {
    if (uploading) return; // 上传中不允许关闭
    setUploadOpen(false);
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }
    setUploadFile(null);
    setUploadPreview(null);
    setUploadDescription("");
    setUploadError(null);
  };

  // ---------- 删除逻辑 ----------
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await photoApi.deletePhoto(deleteTarget.id);
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ---------- 查看器逻辑 ----------
  const openViewer = (photo: Photo) => {
    setViewerPhoto(photo);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerPhoto(null);
  };

  // ---------- 获取照片 URL ----------
  const getPhotoUrl = (filename: string) => `/uploads/photos/${filename}`;

  // ---------- 头像字母 ----------
  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="album">
      {/* ==================== 导航栏 ==================== */}
      <nav className="album__nav">
        <div className="container album__nav-inner">
          <Link to="/home" className="album__logo">
            🏠 我们的家
          </Link>

          <div className="album__user-area" ref={dropdownRef}>
            <button
              className="album__avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="album__avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="album__avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <span className="album__username">{user?.username || "用户"}</span>
              <span
                className={`album__dropdown-arrow ${
                  dropdownOpen ? "album__dropdown-arrow--open" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className="album__dropdown">
                <Link
                  to="/personal-center"
                  className="album__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="album__dropdown-icon">👤</span>
                  个人中心
                </Link>
                <Link
                  to="/setting"
                  className="album__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="album__dropdown-icon">⚙️</span>
                  设置
                </Link>
                <div className="album__dropdown-divider" />
                <button
                  className="album__dropdown-item album__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <img src={exitLoginIcon} alt="退出登录" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== 主内容区 ==================== */}
      <main className="album__main">
        <div className="container">
          {/* ---- 顶部标题栏 ---- */}
          <div className="album__header">
            <div>
              <h2 className="album__title">📸 家庭相册</h2>
              <p className="album__subtitle">
                {loading
                  ? "加载中..."
                  : `${photos.length} 张照片`}
              </p>
            </div>
            <button className="album__upload-btn" onClick={openUploadDialog}>
              <span className="album__upload-icon">+</span>
              上传照片
            </button>
          </div>

          {/* ---- 错误提示 ---- */}
          {loadError && (
            <div className="album__error">
              <span>⚠️ {loadError}</span>
              <button onClick={fetchPhotos}>重试</button>
            </div>
          )}

          {/* ---- 照片网格 ---- */}
          {loading ? (
            <div className="album__loading">
              <div className="album__spinner" />
              <p>正在加载照片...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="album__empty">
              <span className="album__empty-icon">📷</span>
              <h3>还没有照片</h3>
              <p>点击上方「上传照片」按钮，开始记录家庭的美好瞬间吧</p>
              <button className="album__empty-btn" onClick={openUploadDialog}>
                上传第一张照片
              </button>
            </div>
          ) : (
            <div className="album__grid">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="album__card"
                  onClick={() => openViewer(photo)}
                >
                  <div className="album__card-image">
                    <img
                      src={getPhotoUrl(photo.filename)}
                      alt={photo.description || photo.originalFilename}
                      loading="lazy"
                    />
                    <div className="album__card-overlay">
                      {photo.description && (
                        <p className="album__card-desc">{photo.description}</p>
                      )}
                      <span className="album__card-date">
                        {formatDate(photo.createdAt)}
                      </span>
                      <span className="album__card-uploader">
                        {photo.uploader?.username || "未知"}
                      </span>
                    </div>
                  </div>

                  {/* 删除按钮（仅上传者可见） */}
                  {photo.uploadedBy === user?.id && (
                    <button
                      className="album__card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(photo);
                      }}
                      title="删除照片"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ==================== 上传弹窗 ==================== */}
      {uploadOpen && (
        <div className="album__modal-overlay" onClick={closeUploadDialog}>
          <div
            className="album__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="album__modal-header">
              <h3>上传照片</h3>
              <button
                className="album__modal-close"
                onClick={closeUploadDialog}
                disabled={uploading}
              >
                ✕
              </button>
            </div>

            <div className="album__modal-body">
              {/* 文件选择区 */}
              {!uploadPreview ? (
                <div
                  className="album__dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="album__dropzone-icon">📁</span>
                  <p>点击选择图片，或将图片拖拽到此处</p>
                  <span className="album__dropzone-hint">
                    支持 JPG、PNG、WebP，最大 10 MB
                  </span>
                </div>
              ) : (
                <div className="album__preview">
                  <img src={uploadPreview} alt="预览" />
                  <button
                    className="album__preview-change"
                    onClick={() => {
                      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                      setUploadFile(null);
                      setUploadPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={uploading}
                  >
                    重新选择
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={handleFileSelect}
                hidden
              />

              {/* 文件信息 */}
              {uploadFile && (
                <div className="album__file-info">
                  <span className="album__file-name">{uploadFile.name}</span>
                  <span className="album__file-size">
                    {formatFileSize(uploadFile.size)}
                  </span>
                </div>
              )}

              {/* 描述输入 */}
              {uploadFile && (
                <textarea
                  className="album__desc-input"
                  placeholder="添加照片描述（可选）..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  disabled={uploading}
                />
              )}

              {/* 上传错误 */}
              {uploadError && (
                <div className="album__upload-error">⚠️ {uploadError}</div>
              )}
            </div>

            <div className="album__modal-footer">
              <button
                className="album__modal-btn album__modal-btn--cancel"
                onClick={closeUploadDialog}
                disabled={uploading}
              >
                取消
              </button>
              <button
                className="album__modal-btn album__modal-btn--confirm"
                onClick={handleUploadConfirm}
                disabled={!uploadFile || uploading}
              >
                {uploading ? "上传中..." : "确认上传"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 照片查看器 ==================== */}
      {viewerOpen && viewerPhoto && (
        <div className="album__viewer-overlay" onClick={closeViewer}>
          <button className="album__viewer-close" onClick={closeViewer}>
            ✕
          </button>
          <div className="album__viewer-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(viewerPhoto.filename)}
              alt={viewerPhoto.description || viewerPhoto.originalFilename}
            />
            <div className="album__viewer-info">
              {viewerPhoto.description && (
                <p className="album__viewer-desc">{viewerPhoto.description}</p>
              )}
              <p className="album__viewer-meta">
                <span>上传者：{viewerPhoto.uploader?.username || "未知"}</span>
                <span>上传时间：{formatDate(viewerPhoto.createdAt)}</span>
                <span>大小：{formatFileSize(viewerPhoto.fileSize)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 删除确认弹窗 ==================== */}
      {deleteTarget && (
        <div
          className="album__modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="album__modal album__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="album__modal-header">
              <h3>确认删除</h3>
            </div>
            <div className="album__modal-body">
              <p>
                确定要删除这张照片吗？
                {deleteTarget.description && (
                  <span className="album__confirm-desc">
                    「{deleteTarget.description}」
                  </span>
                )}
              </p>
              <p className="album__confirm-warning">此操作不可撤销。</p>
            </div>
            <div className="album__modal-footer">
              <button
                className="album__modal-btn album__modal-btn--cancel"
                onClick={() => setDeleteTarget(null)}
              >
                取消
              </button>
              <button
                className="album__modal-btn album__modal-btn--danger"
                onClick={handleDeleteConfirm}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoAlbum;

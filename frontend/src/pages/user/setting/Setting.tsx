import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi, userApi, uploadUrl } from "../../../api";
import "./Setting.css";

/** 允许的头像格式 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

function Setting() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 头像上传状态
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // 用户名编辑状态
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState(user?.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    logout();
    navigate("/");
  };

  /** 获取头像首字母 */
  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  /** 点击"更换头像"按钮 → 打开文件选择器 */
  const handleAvatarClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  /** 文件选择后：校验 + 上传 */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`不支持的文件格式：${ext}，仅允许 jpg、png、webp`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`不支持的文件类型，仅允许 jpg、png、webp`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setUploadError(`文件大小超出限制（最大 2 MB）`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const updatedUser = await userApi.uploadAvatar(file);
      updateUser(updatedUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "头像上传失败，请重试";
      setUploadError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /** 进入用户名编辑模式 */
  const handleEditUsername = () => {
    setUsernameValue(user?.username || "");
    setUsernameError("");
    setEditingUsername(true);
  };

  /** 取消编辑 */
  const handleCancelUsername = () => {
    setUsernameValue(user?.username || "");
    setUsernameError("");
    setEditingUsername(false);
  };

  /** 保存用户名 */
  const handleSaveUsername = async () => {
    const trimmed = usernameValue.trim();
    if (!trimmed) {
      setUsernameError("用户名不能为空");
      return;
    }
    if (trimmed === user?.username) {
      setEditingUsername(false);
      return;
    }
    setSavingUsername(true);
    setUsernameError("");
    try {
      const updatedUser = await userApi.updateMe({ username: trimmed });
      updateUser(updatedUser);
      setEditingUsername(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "保存失败，请重试";
      setUsernameError(message);
    } finally {
      setSavingUsername(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="setting">
      {/* 顶部装饰条 */}
      <div className="setting__top-decor" />

      {/* Nav */}
      <nav className="setting__nav">
        <div className="container setting__nav-inner">
          <div className="setting__nav-left">
            <Link to="/home" className="setting__logo">🏠 我们的家</Link>
          </div>

          {/* 头像 + 下拉菜单 */}
          <div className="setting__user-area" ref={dropdownRef}>
            <button
              className="setting__avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="setting__avatar">
                {user?.avatar ? (
                  <img src={uploadUrl(user.avatar)} alt={user.username} />
                ) : (
                  <span className="setting__avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <span className="setting__username">{user?.username || "用户"}</span>
              <span className={`setting__dropdown-arrow ${dropdownOpen ? "setting__dropdown-arrow--open" : ""}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="setting__dropdown">
                <Link
                  to="/personal-center"
                  className="setting__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="setting__dropdown-icon">👤</span>
                  个人中心
                </Link>
                <Link
                  to="/setting"
                  className="setting__dropdown-item setting__dropdown-item--active"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="setting__dropdown-icon">⚙️</span>
                  设置
                </Link>
                <div className="setting__dropdown-divider" />
                <button
                  className="setting__dropdown-item setting__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="setting__main">
        <div className="container setting__main-inner">
          {/* 侧边栏 */}
          <aside className="setting__sidebar">
            <div className="setting__sidebar-label">设置</div>
            <nav className="setting__sidebar-nav">
              <button
                className="setting__sidebar-link setting__sidebar-link--active"
                onClick={() => document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="setting__sidebar-icon">👤</span>
                个人资料
              </button>
              <button
                className="setting__sidebar-link"
                onClick={() => document.getElementById("appearance")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="setting__sidebar-icon">🎨</span>
                外观设置
              </button>
              <button
                className="setting__sidebar-link"
                onClick={() => document.getElementById("notification")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="setting__sidebar-icon">🔔</span>
                通知偏好
              </button>
            </nav>
          </aside>

          {/* 内容区 */}
          <div className="setting__content">
            <section id="profile" className="setting__section">
              <div className="setting__section-header">
                <h2 className="setting__section-title">个人资料</h2>
                <p className="setting__section-desc">管理你的个人信息和公开资料</p>
              </div>

              <div className="setting__card">
                <div className="setting__field">
                  <label className="setting__label">头像</label>
                  <div className="setting__avatar-edit">
                    <span className={`setting__avatar setting__avatar--lg ${uploading ? "setting__avatar--uploading" : ""}`}>
                      {user?.avatar ? (
                        <img src={uploadUrl(user.avatar)} alt={user.username} />
                      ) : (
                        <span className="setting__avatar-placeholder">{avatarLetter}</span>
                      )}
                      {uploading && (
                        <span className="setting__avatar-overlay">
                          <span className="setting__spinner" />
                        </span>
                      )}
                    </span>
                    <div className="setting__avatar-actions">
                      <button
                        className="setting__btn setting__btn--outline"
                        onClick={handleAvatarClick}
                        disabled={uploading}
                      >
                        {uploading ? "上传中..." : "更换头像"}
                      </button>
                      <p className="setting__avatar-hint">
                        支持 JPG、PNG、WebP 格式，最大 2 MB
                      </p>
                      {uploadError && (
                        <p className="setting__avatar-error">⚠️ {uploadError}</p>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="setting__field">
                  <label className="setting__label">用户名</label>
                  {editingUsername ? (
                    <div className="setting__field-edit">
                      <div className="setting__field-row">
                        <input
                          type="text"
                          className="setting__input"
                          value={usernameValue}
                          onChange={(e) => setUsernameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveUsername();
                            if (e.key === "Escape") handleCancelUsername();
                          }}
                          disabled={savingUsername}
                          autoFocus
                          minLength={2}
                          maxLength={50}
                        />
                        <button
                          className="setting__btn setting__btn--primary"
                          onClick={handleSaveUsername}
                          disabled={savingUsername}
                        >
                          {savingUsername ? "保存中..." : "保存"}
                        </button>
                        <button
                          className="setting__btn setting__btn--outline"
                          onClick={handleCancelUsername}
                          disabled={savingUsername}
                        >
                          取消
                        </button>
                      </div>
                      {usernameError && (
                        <p className="setting__field-error">⚠️ {usernameError}</p>
                      )}
                      <p className="setting__field-hint">
                        2–50 个字符，修改后即时生效
                      </p>
                    </div>
                  ) : (
                    <div className="setting__field-row">
                      <span className="setting__field-value">{user?.username || "用户"}</span>
                      <button
                        className="setting__btn setting__btn--outline"
                        onClick={handleEditUsername}
                      >
                        编辑
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </section>

            <section id="appearance" className="setting__section">
              <div className="setting__section-header">
                <h2 className="setting__section-title">外观设置</h2>
                <p className="setting__section-desc">自定义界面显示</p>
              </div>

              <div className="setting__card">
                <div className="setting__field">
                  <label className="setting__label">主题模式</label>
                  <p className="setting__field-desc">选择你喜欢的界面配色方案</p>
                  <div className="setting__theme-options">
                    <button className="setting__theme-btn setting__theme-btn--active" disabled>
                      <span className="setting__theme-icon">☀️</span>
                      浅色
                    </button>
                    <button className="setting__theme-btn" disabled>
                      <span className="setting__theme-icon">🌙</span>
                      深色
                    </button>
                    <button className="setting__theme-btn" disabled>
                      <span className="setting__theme-icon">💻</span>
                      跟随系统
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section id="notification" className="setting__section">
              <div className="setting__section-header">
                <h2 className="setting__section-title">通知偏好</h2>
                <p className="setting__section-desc">管理消息和邮件通知</p>
              </div>

              <div className="setting__card">
                <div className="setting__placeholder">
                  <div className="setting__placeholder-icon">✨</div>
                  <p>通知设置功能即将上线</p>
                  <p className="setting__placeholder-hint">敬请期待更多个性化选项</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Setting;

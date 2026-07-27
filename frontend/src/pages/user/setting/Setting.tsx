import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../../../api";

import exitLoginIcon from "../../../svg/exitLogin.svg"
import "./Setting.css";

function Setting() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    } catch {
      // 即使后端调用失败也清除本地状态
    }
    logout();
    navigate("/");
  };

  /** 获取头像首字母 */
  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="setting">
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
                  <img src={user.avatar} alt={user.username} />
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
                ><img src={exitLoginIcon} alt="exitLogin" />
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
            <nav className="setting__sidebar-nav">
              <a href="#profile" className="setting__sidebar-link setting__sidebar-link--active">
                <span className="setting__sidebar-icon">👤</span>
                个人资料
              </a>
              <a href="#account" className="setting__sidebar-link">
                <span className="setting__sidebar-icon">🔐</span>
                账户安全
              </a>
              <a href="#appearance" className="setting__sidebar-link">
                <span className="setting__sidebar-icon">🎨</span>
                外观设置
              </a>
              <a href="#notification" className="setting__sidebar-link">
                <span className="setting__sidebar-icon">🔔</span>
                通知偏好
              </a>
            </nav>
          </aside>

          {/* 内容区 */}
          <div className="setting__content">
            <section id="profile" className="setting__section">
              <h2 className="setting__section-title">个人资料</h2>
              <p className="setting__section-desc">管理你的个人信息和公开资料</p>

              <div className="setting__card">
                <div className="setting__field">
                  <label className="setting__label">头像</label>
                  <div className="setting__avatar-edit">
                    <span className="setting__avatar setting__avatar--lg">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <span className="setting__avatar-placeholder">{avatarLetter}</span>
                      )}
                    </span>
                    <button className="setting__btn setting__btn--outline" disabled>
                      更换头像
                    </button>
                  </div>
                </div>

                <div className="setting__field">
                  <label className="setting__label">用户名</label>
                  <div className="setting__field-row">
                    <input
                      type="text"
                      className="setting__input"
                      defaultValue={user?.username || ""}
                      disabled
                    />
                    <span className="setting__field-hint">功能开发中</span>
                  </div>
                </div>

                <div className="setting__field">
                  <label className="setting__label">邮箱</label>
                  <div className="setting__field-row">
                    <input
                      type="email"
                      className="setting__input"
                      defaultValue={user?.email || ""}
                      disabled
                    />
                    <span className="setting__field-hint">功能开发中</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="account" className="setting__section">
              <h2 className="setting__section-title">账户安全</h2>
              <p className="setting__section-desc">管理密码和安全设置</p>

              <div className="setting__card">
                <div className="setting__field">
                  <label className="setting__label">修改密码</label>
                  <p className="setting__field-text">定期更新密码可以保护你的账户安全</p>
                  <button className="setting__btn setting__btn--outline" disabled>
                    修改密码
                  </button>
                </div>
              </div>
            </section>

            <section id="appearance" className="setting__section">
              <h2 className="setting__section-title">外观设置</h2>
              <p className="setting__section-desc">自定义界面显示</p>

              <div className="setting__card">
                <div className="setting__field">
                  <label className="setting__label">主题模式</label>
                  <p className="setting__field-text">选择你喜欢的界面配色方案</p>
                  <div className="setting__theme-options">
                    <button className="setting__theme-btn setting__theme-btn--active" disabled>
                      ☀️ 浅色
                    </button>
                    <button className="setting__theme-btn" disabled>
                      🌙 深色
                    </button>
                    <button className="setting__theme-btn" disabled>
                      💻 跟随系统
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section id="notification" className="setting__section">
              <h2 className="setting__section-title">通知偏好</h2>
              <p className="setting__section-desc">管理消息和邮件通知</p>

              <div className="setting__card">
                <p className="setting__placeholder">通知设置功能即将上线 ✨</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Setting;

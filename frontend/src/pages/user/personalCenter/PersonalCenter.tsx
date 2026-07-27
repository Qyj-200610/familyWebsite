import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../../../api";
import "./PersonCenter.css";

function PersonalCenter() {
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

  /** 格式化日期 */
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pc">
      {/* Nav */}
      <nav className="pc__nav">
        <div className="container pc__nav-inner">
          <div className="pc__nav-left">
            <Link to="/home" className="pc__logo">🏠 我们的家</Link>
          </div>

          {/* 头像 + 下拉菜单 */}
          <div className="pc__user-area" ref={dropdownRef}>
            <button
              className="pc__avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="pc__avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="pc__avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <span className="pc__username">{user?.username || "用户"}</span>
              <span className={`pc__dropdown-arrow ${dropdownOpen ? "pc__dropdown-arrow--open" : ""}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="pc__dropdown">
                <Link
                  to="/personal-center"
                  className="pc__dropdown-item pc__dropdown-item--active"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="pc__dropdown-icon">👤</span>
                  个人中心
                </Link>
                <Link
                  to="/setting"
                  className="pc__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="pc__dropdown-icon">⚙️</span>
                  设置
                </Link>
                <div className="pc__dropdown-divider" />
                <button
                  className="pc__dropdown-item pc__dropdown-item--danger"
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
      <main className="pc__main">
        <div className="container">
          {/* 用户信息卡片 */}
          <div className="pc__profile-card">
            <div className="pc__profile-header">
              <span className="pc__profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="pc__profile-avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <div className="pc__profile-info">
                <h2 className="pc__profile-name">{user?.username || "用户"}</h2>
                <p className="pc__profile-email">{user?.email || ""}</p>
                <p className="pc__profile-meta">
                  加入于 {formatDate(user?.createdAt)}
                </p>
                <p className="pc__profile-meta">
                  最近登录 {formatDate(user?.lastLoginAt)}
                </p>
              </div>
              <Link to="/setting" className="pc__btn pc__btn--outline">
                编辑资料
              </Link>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="pc__stats">
            <div className="pc__stat-card">
              <span className="pc__stat-icon">📸</span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">照片</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon">🍽️</span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">点单</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon">💬</span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">留言</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon">👨‍👩‍👧‍👦</span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">家庭成员</span>
            </div>
          </div>

          {/* 最近活动 */}
          <section className="pc__section">
            <h3 className="pc__section-title">最近活动</h3>
            <div className="pc__card">
              <div className="pc__empty-state">
                <span className="pc__empty-icon">✨</span>
                <p>还没有活动记录</p>
                <p className="pc__empty-hint">开始使用家庭功能后，你的活动将显示在这里</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PersonalCenter;

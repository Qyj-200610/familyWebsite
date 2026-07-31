import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { uploadUrl } from "../../../api";
import PageNav from "../../../components/PageNav/PageNav";
import "./PersonalCenter.css";

function PersonalCenter() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      {/* 顶部装饰条 */}
      <div className="pc__top-decor" />

      {/* Nav */}
      <PageNav />

      {/* Main */}
      <main className="pc__main">
        <div className="container">
          {/* Hero Banner */}
          <div className="pc__hero">
            <div className="pc__hero-bg" />
            <div className="pc__hero-decorations">
              <span className="pc__hero-deco pc__hero-deco--1">🌸</span>
              <span className="pc__hero-deco pc__hero-deco--2">🍃</span>
              <span className="pc__hero-deco pc__hero-deco--3">✨</span>
              <span className="pc__hero-deco pc__hero-deco--4">🌿</span>
            </div>
            <div className="pc__hero-inner">
              <span className="pc__hero-avatar">
                {user?.avatar ? (
                  <img src={uploadUrl(user.avatar)} alt={user.username} />
                ) : (
                  <span className="pc__hero-avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <div className="pc__hero-info">
                <h2 className="pc__hero-name">{user?.username || "用户"}</h2>
                <p className="pc__hero-email">{user?.email || ""}</p>
                <div className="pc__hero-meta">
                  <span className="pc__hero-meta-item">
                    <span className="pc__hero-meta-icon">📅</span>
                    加入于 {formatDate(user?.createdAt)}
                  </span>
                  <span className="pc__hero-meta-item">
                    <span className="pc__hero-meta-icon">🕐</span>
                    最近登录 {formatDate(user?.lastLoginAt)}
                  </span>
                </div>
              </div>
              <div className="pc__hero-action">
                <Link to="/setting" className="pc__btn pc__btn--outline">
                  ✏️ 编辑资料
                </Link>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="pc__stats">
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--photos">
                <span className="pc__stat-icon">📸</span>
              </span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">照片</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--food">
                <span className="pc__stat-icon">🍽️</span>
              </span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">点单</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--messages">
                <span className="pc__stat-icon">💬</span>
              </span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">留言</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--family">
                <span className="pc__stat-icon">👨‍👩‍👧‍👦</span>
              </span>
              <span className="pc__stat-value">0</span>
              <span className="pc__stat-label">家庭成员</span>
            </div>
          </div>

          {/* 最近活动 */}
          <section className="pc__section">
            <div className="pc__section-header">
              <span className="pc__section-title-bar" />
              <h3 className="pc__section-title">最近活动</h3>
            </div>
            <div className="pc__card">
              <div className="pc__empty-state">
                <div className="pc__empty-illustration">
                  <span className="pc__empty-icon">✨</span>
                </div>
                <h4>还没有活动记录</h4>
                <p>开始使用家庭功能后，你的活动将显示在这里</p>
                <div className="pc__empty-hint">
                  <span className="pc__empty-hint-item">
                    <span className="pc__empty-hint-icon">📸</span>
                    上传照片
                  </span>
                  <span className="pc__empty-hint-item">
                    <span className="pc__empty-hint-icon">🍽️</span>
                    美食点单
                  </span>
                  <span className="pc__empty-hint-item">
                    <span className="pc__empty-hint-icon">💬</span>
                    留言互动
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PersonalCenter;

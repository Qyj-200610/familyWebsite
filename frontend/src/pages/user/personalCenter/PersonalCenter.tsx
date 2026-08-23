import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { uploadUrl, userApi } from "../../../api";
import type { UserStats } from "../../../api";
import PageNav from "../../../components/PageNav/PageNav";
import Page from "../../../components/Page/Page";
import Avatar from "../../../components/Avatar/Avatar";
import { formatDate } from "../../../utils/format";
import "./PersonalCenter.css";

function PersonalCenter() {
  const { user } = useAuthStore();
  const isAuthenticated = useRequireAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  // 获取用户统计数据
  useEffect(() => {
    if (!isAuthenticated) return;
    userApi.getMyStats().then((res) => {
      setStats(res);
    }).catch(() => {
      // 静默处理，stats 保持 null 时显示 "—"
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Page className="pc">
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
              <Avatar src={uploadUrl(user?.avatar)} name={user?.username} size={88} />
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
              <span className="pc__stat-value">{stats?.photoCount ?? "—"}</span>
              <span className="pc__stat-label">照片</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--food">
                <span className="pc__stat-icon">🍽️</span>
              </span>
              <span className="pc__stat-value">{stats?.foodOrderCount ?? "—"}</span>
              <span className="pc__stat-label">点单</span>
            </div>
            <div className="pc__stat-card">
              <span className="pc__stat-icon-wrap pc__stat-icon-wrap--family">
                <span className="pc__stat-icon">👨‍👩‍👧‍👦</span>
              </span>
              <span className="pc__stat-value">{stats?.familyMemberCount ?? "—"}</span>
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
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Page>
  );
}

export default PersonalCenter;

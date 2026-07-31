import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // 已登录用户自动重定向到 /home（避免闪现 Landing 页）
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="cover">
      {/* Nav */}
      <nav className="cover__nav">
        <div className="container cover__nav-inner">
          <h1 className="cover__logo">🏠 我们的家</h1>
          <div className="cover__nav-links">
            <Link to="/login" className="cover__nav-link">
              登录
            </Link>
            <Link to="/register" className="cover__btn cover__btn--primary">
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="cover__hero">
        <div className="container cover__hero-inner">
          <div className="cover__hero-text">
            <span className="cover__badge">家庭门户</span>
            <h2 className="cover__title">
              珍藏每一个
              <br />
              温暖的瞬间
            </h2>
            <p className="cover__desc">
              记录家庭生活的点滴美好 — 相册、美食、家谱，
              <br />
              与你最爱的人分享每一天。
            </p>
            <div className="cover__hero-actions">
              <Link to="/register" className="cover__btn cover__btn--primary cover__btn--lg">
                开始使用
              </Link>
              <Link to="/login" className="cover__btn cover__btn--outline cover__btn--lg">
                已有账号？登录
              </Link>
            </div>
          </div>
          <div className="cover__hero-visual">
            <div className="cover__hero-illustration">
              <div className="cover__illustration-circle cover__illustration-circle--lg">
                <span>👨‍👩‍👧‍👦</span>
              </div>
              <div className="cover__illustration-circle cover__illustration-circle--sm cover__illustration-circle--top-right">
                <span>📸</span>
              </div>
              <div className="cover__illustration-circle cover__illustration-circle--md cover__illustration-circle--bottom-left">
                <span>🍽️</span>
              </div>
              <div className="cover__illustration-circle cover__illustration-circle--xs cover__illustration-circle--bottom-right">
                <span>🌳</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="cover__wave" aria-hidden="true" />

      {/* Features */}
      <section className="cover__features">
        <div className="container">
          <h3 className="cover__section-title">功能一览</h3>
          <p className="cover__section-subtitle">探索我们的家庭空间，记录每一个珍贵时刻</p>
          <div className="cover__features-grid">
            <div className="cover__feature-card">
              <span className="cover__feature-icon">📸</span>
              <h4>家庭相册</h4>
              <p>上传和分享家庭照片，按时间线浏览美好回忆</p>
            </div>
            <div className="cover__feature-card">
              <span className="cover__feature-icon">🍽️</span>
              <h4>美食专栏</h4>
              <p>在线点菜，享受家庭美食时光</p>
            </div>
            <div className="cover__feature-card">
              <span className="cover__feature-icon">🌳</span>
              <h4>家谱图</h4>
              <p>查看家族谱系，了解根源与传承</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cover__footer">
        <p>© 2026 我们的家 · 家庭门户网站</p>
      </footer>
    </div>
  );
}

export default App;

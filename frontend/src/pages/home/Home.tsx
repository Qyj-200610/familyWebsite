import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api";
import DailyRoutine from "../dailyRoutine/dailyRoutine";

import exitLoginIcon from "../../svg/exitLogin.svg"

import "./Home.css";

function Home() {
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
    <div className="home">
      {/* Nav */}
      <nav className="home__nav">
        <div className="home__nav-inner">
          <h1 className="home__logo">🏠 我们的家</h1>

          {/* 头像 + 下拉菜单 */}
          <div className="home__user-area" ref={dropdownRef}>
            <button
              className="home__avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="home__avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="home__avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <span className="home__username">{user?.username || "用户"}</span>
              <span className={`home__dropdown-arrow ${dropdownOpen ? "home__dropdown-arrow--open" : ""}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="home__dropdown">
                <Link
                  to="/personal-center"
                  className="home__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="home__dropdown-icon">👤</span>
                  个人中心
                </Link>
                <Link
                  to="/setting"
                  className="home__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="home__dropdown-icon">⚙️</span>
                  设置
                </Link>
                <div className="home__dropdown-divider" />
                <button
                  className="home__dropdown-item home__dropdown-item--danger"
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
      <main className="home__main">
        {/* 左侧：日程侧边栏 */}
        <DailyRoutine />

        {/* 右侧：内容区 */}
        <div className="home__content">
          <div className="home__welcome">
            <span className="home__welcome-icon">🏡</span>
            <h2 className="home__welcome-title">欢迎来到我们的家</h2>
            <p className="home__welcome-desc">
              这里是你的家庭空间。功能正在建设中，敬请期待 ✨
            </p>
          </div>

          <div className="home__cards">
            <Link to="/photo-album" className="home__card">
              <span className="home__card-icon">📸</span>
              <h3>家庭相册</h3>
              <p>浏览和上传家庭照片</p>
            </Link>
            <Link to="/food-order" className="home__card">
              <span className="home__card-icon">🍽️</span>
              <h3>美食专栏</h3>
              <p>浏览菜品，提交点单</p>
            </Link>
            <div className="home__card home__card--disabled">
              <span className="home__card-icon">💬</span>
              <h3>家庭留言</h3>
              <p>即将上线</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;

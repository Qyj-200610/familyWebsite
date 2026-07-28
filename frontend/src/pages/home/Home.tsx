import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api";
import DailyRoutine from "../dailyRoutine/dailyRoutine";

import exitLoginIcon from "../../svg/exitLogin.svg";

import "./Home.css";

/** 时间段类型 */
type TimePeriod = "night" | "dawn" | "morning" | "noon" | "afternoon" | "evening";

/** 根据当前小时返回问候语 */
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 6) return { text: "夜深了", emoji: "🌙" };
  if (h < 9) return { text: "早上好", emoji: "☀️" };
  if (h < 12) return { text: "上午好", emoji: "🌤️" };
  if (h < 14) return { text: "中午好", emoji: "☀️" };
  if (h < 18) return { text: "下午好", emoji: "🌿" };
  if (h < 21) return { text: "晚上好", emoji: "🌆" };
  return { text: "夜深了", emoji: "🌙" };
}

/** 根据当前小时返回时间段 */
function getTimePeriod(): TimePeriod {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 7) return "dawn";
  if (h < 11) return "morning";
  if (h < 14) return "noon";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

/** 根据时间段返回 Hero 装饰 emoji */
function getHeroDecorations(period: TimePeriod): string[] {
  const decos: Record<TimePeriod, string[]> = {
    night: ["🌙", "✨", "⭐", "🌠"],
    dawn: ["🌅", "💮", "🌤️", "🌾"],
    morning: ["🌸", "🍃", "🌼", "🌿"],
    noon: ["☀️", "🌻", "🌼", "🌿"],
    afternoon: ["🌤️", "🌸", "🍃", "🌾"],
    evening: ["🌆", "🍁", "🌅", "🌾"],
  };
  return decos[period];
}

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const timePeriod = useMemo(() => getTimePeriod(), []);
  const heroDecorations = useMemo(() => getHeroDecorations(timePeriod), [timePeriod]);

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
      {/* 顶部装饰条 */}
      <div className="home__top-decor" />

      {/* Nav */}
      <nav className="home__nav">
        <div className="home__nav-inner">
          <div className="home__logo-wrap">
            <span className="home__logo-icon">🏠</span>
            <h1 className="home__logo">我们的家</h1>
          </div>

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
                >
                  <img src={exitLoginIcon} alt="exitLogin" />
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
          {/* Hero 欢迎横幅 */}
          <section className={`home__hero home__hero--${timePeriod}`}>
            <div className="home__hero-bg" />
            <div className="home__hero-inner">
              <span className="home__hero-emoji">{greeting.emoji}</span>
              <h2 className="home__hero-greeting">
                {greeting.text}，{user?.username || "家人"}
              </h2>
              <p className="home__hero-desc">
                每一个平凡的日子，都是生活馈赠的礼物 ✨
              </p>
              <div className="home__hero-decorations" aria-hidden="true">
                <span className="home__hero-deco home__hero-deco--1">{heroDecorations[0]}</span>
                <span className="home__hero-deco home__hero-deco--2">{heroDecorations[1]}</span>
                <span className="home__hero-deco home__hero-deco--3">{heroDecorations[2]}</span>
                <span className="home__hero-deco home__hero-deco--4">{heroDecorations[3]}</span>
              </div>
            </div>
          </section>

          {/* 快捷入口卡片 */}
          <section className="home__section">
            <h3 className="home__section-title">
              <span className="home__section-title-bar" />
              快捷入口
            </h3>
            <div className="home__cards">
              <Link to="/photo-album" className="home__card home__card--album">
                <span className="home__card-icon-wrap home__card-icon-wrap--album">
                  <span className="home__card-icon">📸</span>
                </span>
                <div className="home__card-body">
                  <h3>家庭相册</h3>
                  <p>记录美好瞬间，上传和浏览家庭照片</p>
                </div>
                <span className="home__card-arrow">→</span>
              </Link>

              <Link to="/food-order" className="home__card home__card--food">
                <span className="home__card-icon-wrap home__card-icon-wrap--food">
                  <span className="home__card-icon">🍽️</span>
                </span>
                <div className="home__card-body">
                  <h3>美食专栏</h3>
                  <p>浏览今日菜品，提交你的美食点单</p>
                </div>
                <span className="home__card-arrow">→</span>
              </Link>

              <div className="home__card home__card--disabled">
                <span className="home__card-icon-wrap home__card-icon-wrap--message">
                  <span className="home__card-icon">💬</span>
                </span>
                <div className="home__card-body">
                  <h3>家庭留言</h3>
                  <p>留下想说的话，即将上线</p>
                </div>
                <span className="home__card-badge">敬请期待</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;

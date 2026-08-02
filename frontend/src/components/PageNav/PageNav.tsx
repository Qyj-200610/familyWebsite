import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi, uploadUrl } from "../../api";
import exitLoginIcon from "../../svg/exitLogin.svg";
import "./PageNav.css";

interface PageNavProps {
  /** Logo 文字，默认 "我们的家" */
  logoText?: string;
  /** Logo emoji，默认 "🏠" */
  logoEmoji?: string;
  /** 返回链接，默认 "/home" */
  homePath?: string;
}

function PageNav({
  logoText = "我们的家",
  logoEmoji = "🏠",
  homePath = "/home",
}: PageNavProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    logout();
    // 直接导航到 /login，避免 auth guard 与 navigate("/") 竞争导致双重跳转
    navigate("/login", { replace: true });
  };

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="pagenav">
      <div className="pagenav__inner">
        <Link to={homePath} className="pagenav__logo">
          <span className="pagenav__logo-icon">{logoEmoji}</span>
          <span className="pagenav__logo-text">{logoText}</span>
        </Link>

        <div className="pagenav__user-area" ref={dropdownRef}>
          <button
            className="pagenav__avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="pagenav__avatar">
              {user?.avatar ? (
                <img
                  src={uploadUrl(user.avatar)}
                  alt={user.username}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="pagenav__avatar-placeholder"
                style={{ display: user?.avatar ? "none" : "flex" }}
              >
                {avatarLetter}
              </span>
            </span>
            <span className="pagenav__username">{user?.username || "用户"}</span>
            <span className={`pagenav__arrow ${dropdownOpen ? "pagenav__arrow--open" : ""}`}>▾</span>
          </button>

          {dropdownOpen && (
            <div className="pagenav__dropdown">
              <Link
                to="/personal-center"
                className="pagenav__dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span className="pagenav__dropdown-icon">👤</span>
                个人中心
              </Link>
              <Link
                to="/setting"
                className="pagenav__dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span className="pagenav__dropdown-icon">⚙️</span>
                设置
              </Link>
              <div className="pagenav__dropdown-divider" />
              <button
                className="pagenav__dropdown-item pagenav__dropdown-item--danger"
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
  );
}

export default PageNav;

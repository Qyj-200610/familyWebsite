import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import "./NotFound.css";

function NotFound() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // 已登录用户自动跳转到主页
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate("/home", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="notfound">
      <div className="notfound__content">
        <span className="notfound__emoji">🔍</span>
        <h1 className="notfound__code">404</h1>
        <h2 className="notfound__title">页面未找到</h2>
        <p className="notfound__desc">
          {isAuthenticated
            ? "该页面不存在，即将为你跳转回主页…"
            : "你访问的页面不存在，可能已被移除或地址输入有误。"}
        </p>
        <div className="notfound__actions">
          {isAuthenticated ? (
            <Link to="/home" className="notfound__btn">
              返回主页
            </Link>
          ) : (
            <>
              <Link to="/" className="notfound__btn">
                返回首页
              </Link>
              <Link to="/login" className="notfound__btn notfound__btn--outline">
                去登录
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotFound;

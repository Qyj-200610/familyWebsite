import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { adminApi } from "../../api";
import { ADMIN_EMAIL } from "../../utils/admin";
import ImageWithFallback from "../../components/ImageWithFallback/ImageWithFallback";
import type { User } from "../../api/types";
import "./Admin.css";

/** 将 ISO 时间字符串格式化为本地可读时间 */
function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("zh-CN", { hour12: false });
}

function Admin() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    adminApi
      .getUsers()
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载用户列表失败");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 仅管理员邮箱可访问；未登录或非管理员直接退回管理员登录页
  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="admin">
      <div className="admin__panel">
        <header className="admin__header">
          <div className="admin__title-group">
            <h1 className="admin__title">🛠️ 管理后台</h1>
            <p className="admin__subtitle">用户管理</p>
          </div>
          <div className="admin__header-actions">
            <span className="admin__account">{user.email}</span>
            <button type="button" className="admin__logout" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </header>

        <div className="admin__body">
          <div className="admin__meta">
            <span className="admin__count">共 {users.length} 位用户</span>
          </div>

          {loading && <div className="admin__status">加载中…</div>}

          {!loading && error && (
            <div className="admin__status admin__status--error">{error}</div>
          )}

          {!loading && !error && (
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>邮箱</th>
                    <th>注册时间</th>
                    <th>最后登录</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin__user-cell">
                          <ImageWithFallback
                            src={u.avatar}
                            alt={u.username}
                            className="admin__avatar"
                            fallback={
                              <span className="admin__avatar admin__avatar--fallback">
                                {u.username.charAt(0).toUpperCase()}
                              </span>
                            }
                          />
                          <span className="admin__username">{u.username}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>{formatDate(u.lastLoginAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;

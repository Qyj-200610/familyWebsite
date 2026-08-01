import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Auth from "../Auth";
import { authApi } from "../../../api";
import { useAuthStore } from "../../../store/authStore";
import emailIcon from "../../../svg/email.svg";
import passwordIcon from "../../../svg/password.svg";
import "./Login.css";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.email.trim()) {
      errs.email = "请输入邮箱地址";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!form.password) {
      errs.password = "请输入密码";
    } else if (form.password.length < 6) {
      errs.password = "密码至少 6 位";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await authApi.login({
        email: form.email,
        password: form.password,
      });
      useAuthStore.getState().setAuth(res.user, res.token, form.remember);
      navigate("/home", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "登录失败，请重试";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LoginForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Auth
      title="欢迎回来"
      subtitle="登录你的家庭账号"
      footerText="还没有账号？"
      footerLinkText="立即注册"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth__server-error" id="login-server-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            邮箱
          </label>
          <div className="form-input-wrapper">
            <input
              id="email"
              type="email"
              inputMode="email"
              className={`form-input form-input--with-icon ${errors.email ? "form-input--error" : ""}`}
              placeholder="请输入邮箱地址"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              autoFocus
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            <img
              className="form-input-icon"
              src={emailIcon}
              alt=""
              aria-hidden="true"
            />
          </div>
          {errors.email && (
            <span className="form-error" id="login-email-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            密码
          </label>
          <div className="form-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`form-input form-input--with-icon form-input--with-toggle ${errors.password ? "form-input--error" : ""}`}
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="current-password"
              aria-describedby={errors.password ? "login-password-error" : undefined}
            />
            <img
              className="form-input-icon"
              src={passwordIcon}
              alt=""
              aria-hidden="true"
            />
            <button
              type="button"
              className="form-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          {errors.password && (
            <span className="form-error" id="login-password-error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        <div className="login__row">
          <label className="login__remember">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => updateField("remember", e.target.checked)}
            />
            <span>记住我</span>
          </label>
          <Link to="/forget-password" className="login__forgot">
            忘记密码？
          </Link>
        </div>

        <button
          type="submit"
          className={`form-submit ${loading ? "form-submit--loading" : ""}`}
          disabled={loading}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

    </Auth>
  );
}

export default Login;

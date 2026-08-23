import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Auth from "../../../components/Auth/Auth";
import FormField from "../../../components/Auth/FormField";
import { authApi } from "../../../api";
import { useAuthStore } from "../../../store/authStore";
import { isValidEmail } from "../../../utils/validation";
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
    } else if (!isValidEmail(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    // 登录仅校验非空（与后端 LoginRequest 的 min_length=1 对齐，不强制复杂度）
    if (!form.password) {
      errs.password = "请输入密码";
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
      useAuthStore.getState().setAuth(res.user, res.token, res.refreshToken, form.remember);
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

        <FormField
          id="email"
          label="邮箱"
          icon={emailIcon}
          type="email"
          inputMode="email"
          placeholder="请输入邮箱地址"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          autoComplete="email"
          autoFocus
          error={errors.email}
        />

        <FormField
          id="password"
          label="密码"
          icon={passwordIcon}
          placeholder="请输入密码"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          autoComplete="current-password"
          error={errors.password}
          isPassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

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

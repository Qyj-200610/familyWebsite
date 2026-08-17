import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Auth from "../../../components/Auth/Auth";
import { authApi } from "../../../api";
import { getPasswordError, isValidEmail } from "../../../utils/validation";

import usernameIcon from "../../../svg/username.svg";
import emailIcon from "../../../svg/email.svg";
import passwordIcon from "../../../svg/password.svg";
import confirmPasswordIcon from "../../../svg/confirmPassword.svg";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.username.trim()) {
      errs.username = "请输入用户名";
    } else if (form.username.trim().length < 2) {
      errs.username = "用户名至少 2 个字符";
    }

    if (!form.email.trim()) {
      errs.email = "请输入邮箱";
    } else if (!isValidEmail(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!form.password) {
      errs.password = "请输入密码";
    } else {
      const passwordError = getPasswordError(form.password);
      if (passwordError) {
        errs.password = passwordError;
      }
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "请确认密码";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "两次密码不一致";
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
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      // 注册成功 → 跳转到成功提示页，不再自动登录
      navigate("/register-success", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "注册失败，请重试";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Auth
      title="创建账号"
      subtitle="加入你的家庭空间"
      footerText="已有账号？"
      footerLinkText="立即登录"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth__server-error" id="reg-server-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="reg-username">
            用户名
          </label>
          <div className="form-input-wrapper">
            <input
              id="reg-username"
              type="text"
              className={`form-input form-input--with-icon ${errors.username ? "form-input--error" : ""}`}
              placeholder="请输入用户名"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              autoComplete="username"
              autoFocus
              aria-describedby={errors.username ? "reg-username-error" : undefined}
            />
            <img
              className="form-input-icon"
              src={usernameIcon}
              alt=""
              aria-hidden="true"
            />
          </div>
          {errors.username && (
            <span className="form-error" id="reg-username-error" role="alert">
              {errors.username}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">
            邮箱
          </label>
          <div className="form-input-wrapper">
            <input
              id="reg-email"
              type="email"
              inputMode="email"
              className={`form-input form-input--with-icon ${errors.email ? "form-input--error" : ""}`}
              placeholder="请输入邮箱地址"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              aria-describedby={errors.email ? "reg-email-error" : undefined}
            />
            <img
              className="form-input-icon"
              src={emailIcon}
              alt=""
              aria-hidden="true"
            />
          </div>
          {errors.email && (
            <span className="form-error" id="reg-email-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">
            密码
          </label>
          <div className="form-input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              className={`form-input form-input--with-icon form-input--with-toggle ${errors.password ? "form-input--error" : ""}`}
              placeholder="至少 8 位，含大小写字母和数字"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.password ? "reg-password-error" : undefined}
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
            <span className="form-error" id="reg-password-error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm-password">
            确认密码
          </label>
          <div className="form-input-wrapper">
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className={`form-input form-input--with-icon form-input--with-toggle ${errors.confirmPassword ? "form-input--error" : ""}`}
              placeholder="再次输入密码"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              autoComplete="new-password"
              aria-describedby={errors.confirmPassword ? "reg-confirm-error" : undefined}
            />
            <img
              className="form-input-icon"
              src={confirmPasswordIcon}
              alt=""
              aria-hidden="true"
            />
            <button
              type="button"
              className="form-password-toggle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="form-error" id="reg-confirm-error" role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`form-submit ${loading ? "form-submit--loading" : ""}`}
          disabled={loading}
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
    </Auth>
  );
}

export default Register;

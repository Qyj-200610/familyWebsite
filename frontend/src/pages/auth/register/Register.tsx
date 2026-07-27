import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Auth from "../Auth";
import { authApi } from "../../../api";

import usernameIcon from "../../../svg/username.svg"
import emailIcon from "../../../svg/email.svg"
import passwordIcon from "../../../svg/password.svg"
import confirmPasswordIcon from "../../../svg/confirmPassword.svg"

import "./Register.css";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.username.trim()) {
      errs.username = "请输入用户名";
    } else if (form.username.trim().length < 2) {
      errs.username = "用户名至少 2 个字符";
    }

    if (!form.email.trim()) {
      errs.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!form.password) {
      errs.password = "请输入密码";
    } else if (form.password.length < 6) {
      errs.password = "密码至少 6 位";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "请确认密码";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "两次密码不一致";
    }

    if (!form.agreeTerms) {
      errs.agreeTerms = "请阅读并同意用户协议";
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

  const updateField = (field: keyof RegisterForm, value: string | boolean) => {
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
          <div className="register__server-error">{serverError}</div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="reg-username">
            <img src={usernameIcon} alt="username" />
          </label>
          <input
            id="reg-username"
            type="text"
            className={`form-input ${errors.username ? "form-input--error" : ""}`}
            placeholder="请输入用户名"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            autoComplete="username"
            autoFocus
          />
          {errors.username && <span className="form-error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">
            <img src={emailIcon} alt="email" />
          </label>
          <input
            id="reg-email"
            type="email"
            className={`form-input ${errors.email ? "form-input--error" : ""}`}
            placeholder="请输入邮箱地址"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">
            <img src={passwordIcon} alt="password" />
          </label>
          <input
            id="reg-password"
            type="password"
            className={`form-input ${errors.password ? "form-input--error" : ""}`}
            placeholder="至少 6 位密码"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            autoComplete="new-password"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm-password">
            <img src={confirmPasswordIcon} alt="confirmPassword" />
          </label>
          <input
            id="reg-confirm-password"
            type="password"
            className={`form-input ${errors.confirmPassword ? "form-input--error" : ""}`}
            placeholder="再次输入密码"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword}</span>
          )}
        </div>

        <label className="register__terms">
          <input
            type="checkbox"
            checked={form.agreeTerms}
            onChange={(e) => updateField("agreeTerms", e.target.checked)}
          />
          <span>
            我已阅读并同意{" "}
            <a href="#" className="register__terms-link">
              用户协议
            </a>{" "}
            和{" "}
            <a href="#" className="register__terms-link">
              隐私政策
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <span className="form-error" style={{ marginTop: -14 }}>
            {errors.agreeTerms}
          </span>
        )}

        <button
          type="submit"
          className="form-submit"
          disabled={loading}
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
    </Auth>
  );
}

export default Register;

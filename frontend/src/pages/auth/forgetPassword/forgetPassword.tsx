import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../Auth";
import { authApi } from "../../../api";
import emailIcon from "../../../svg/email.svg";
import passwordIcon from "../../../svg/password.svg";
import confirmPasswordIcon from "../../../svg/confirmPassword.svg";
import "./forgetPassword.css";

interface ResetForm {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function ForgetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ResetForm>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.email.trim()) {
      errs.email = "请输入邮箱地址";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!form.newPassword) {
      errs.newPassword = "请输入新密码";
    } else if (form.newPassword.length < 6) {
      errs.newPassword = "密码至少 6 位";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "请确认新密码";
    } else if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = "两次密码不一致";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: form.email,
        newPassword: form.newPassword,
      });
      setServerSuccess("密码已重置成功！");
      redirectTimerRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "密码重置失败，请重试";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ResetForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Auth
      title="忘记密码"
      subtitle="输入邮箱和新密码即可重置"
      footerText="想起密码了？"
      footerLinkText="返回登录"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="forget__server-error">{serverError}</div>
        )}
        {serverSuccess && (
          <div className="forget__server-success">{serverSuccess}</div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="forget-email">
            邮箱地址
          </label>
          <div className="form-input-wrapper">
            <input
              id="forget-email"
              type="email"
              className={`form-input form-input--with-icon ${errors.email ? "form-input--error" : ""}`}
              placeholder="请输入注册邮箱"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              autoComplete="email"
              autoFocus
            />
            <img
              className="form-input-icon"
              src={emailIcon}
              alt=""
              aria-hidden="true"
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="forget-new-password">
            新密码
          </label>
          <div className="form-input-wrapper">
            <input
              id="forget-new-password"
              type={showNewPassword ? "text" : "password"}
              className={`form-input form-input--with-icon form-input--with-toggle ${errors.newPassword ? "form-input--error" : ""}`}
              placeholder="至少 6 位密码"
              value={form.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              autoComplete="new-password"
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
              onClick={() => setShowNewPassword((v) => !v)}
              tabIndex={0}
              aria-label={showNewPassword ? "隐藏新密码" : "显示新密码"}
            >
              {showNewPassword ? "🙈" : "👁"}
            </button>
          </div>
          {errors.newPassword && (
            <span className="form-error">{errors.newPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="forget-confirm-password">
            确认新密码
          </label>
          <div className="form-input-wrapper">
            <input
              id="forget-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className={`form-input form-input--with-icon form-input--with-toggle ${errors.confirmPassword ? "form-input--error" : ""}`}
              placeholder="再次输入新密码"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              autoComplete="new-password"
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
              tabIndex={0}
              aria-label={showConfirmPassword ? "隐藏确认新密码" : "显示确认新密码"}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={`form-submit ${loading ? "form-submit--loading" : ""}`}
          disabled={loading}
        >
          {loading ? "重置中..." : "重置密码"}
        </button>
      </form>
    </Auth>
  );
}

export default ForgetPassword;

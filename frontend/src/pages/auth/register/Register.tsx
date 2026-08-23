import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Auth from "../../../components/Auth/Auth";
import FormField from "../../../components/Auth/FormField";
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

        <FormField
          id="reg-username"
          label="用户名"
          icon={usernameIcon}
          placeholder="请输入用户名"
          value={form.username}
          onChange={(v) => updateField("username", v)}
          autoComplete="username"
          autoFocus
          error={errors.username}
        />

        <FormField
          id="reg-email"
          label="邮箱"
          icon={emailIcon}
          type="email"
          inputMode="email"
          placeholder="请输入邮箱地址"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          autoComplete="email"
          error={errors.email}
        />

        <FormField
          id="reg-password"
          label="密码"
          icon={passwordIcon}
          placeholder="至少 8 位，含大小写字母和数字"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          autoComplete="new-password"
          error={errors.password}
          isPassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

        <FormField
          id="reg-confirm-password"
          label="确认密码"
          icon={confirmPasswordIcon}
          placeholder="再次输入密码"
          value={form.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          autoComplete="new-password"
          error={errors.confirmPassword}
          isPassword
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((v) => !v)}
          toggleLabel="确认密码"
        />

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

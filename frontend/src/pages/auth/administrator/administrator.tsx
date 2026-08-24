import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../../../components/Auth/Auth";
import FormField from "../../../components/Auth/FormField";
import { authApi } from "../../../api";
import { useAuthStore } from "../../../store/authStore";
import { ADMIN_EMAIL } from "../../../utils/admin";
import emailIcon from "../../../svg/email.svg";
import passwordIcon from "../../../svg/password.svg";

interface AdminForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function Administrator() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AdminForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.email.trim()) {
      errs.email = "请输入管理员邮箱";
    } else if (form.email.trim() !== ADMIN_EMAIL) {
      errs.email = "无管理员权限";
    }

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
        email: form.email.trim(),
        password: form.password,
      });

      // 双重校验：返回用户必须为管理员邮箱，防止任何异常情况
      if (res.user.email !== ADMIN_EMAIL) {
        useAuthStore.getState().logout();
        setServerError("无管理员权限");
        return;
      }

      // 管理员会话使用 sessionStorage（不持久化到 localStorage）
      useAuthStore.getState().setAuth(res.user, res.token, res.refreshToken, false);
      navigate("/admin/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "登录失败，请重试";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AdminForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Auth title="管理员登录" subtitle="仅限管理员访问">
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth__server-error" id="admin-server-error" role="alert">
            {serverError}
          </div>
        )}

        <FormField
          id="email"
          label="管理员邮箱"
          icon={emailIcon}
          type="email"
          inputMode="email"
          placeholder="请输入管理员邮箱"
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

export default Administrator;

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../../../components/Auth/Auth";
import FormField from "../../../components/Auth/FormField";
import { authApi } from "../../../api";
import { getPasswordError, isValidEmail } from "../../../utils/validation";
import emailIcon from "../../../svg/email.svg";
import passwordIcon from "../../../svg/password.svg";
import confirmPasswordIcon from "../../../svg/confirmPassword.svg";

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
    } else if (!isValidEmail(form.email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!form.newPassword) {
      errs.newPassword = "请输入新密码";
    } else {
      const passwordError = getPasswordError(form.newPassword);
      if (passwordError) {
        errs.newPassword = passwordError;
      }
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
          <div className="auth__server-error" id="forget-server-error" role="alert">
            {serverError}
          </div>
        )}
        {serverSuccess && (
          <div className="auth__server-success" id="forget-server-success" role="status">
            {serverSuccess}
          </div>
        )}

        <FormField
          id="forget-email"
          label="邮箱地址"
          icon={emailIcon}
          type="email"
          inputMode="email"
          placeholder="请输入注册邮箱"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          autoComplete="email"
          autoFocus
          error={errors.email}
        />

        <FormField
          id="forget-new-password"
          label="新密码"
          icon={passwordIcon}
          placeholder="至少 8 位，含大小写字母和数字"
          value={form.newPassword}
          onChange={(v) => updateField("newPassword", v)}
          autoComplete="new-password"
          error={errors.newPassword}
          isPassword
          showPassword={showNewPassword}
          onTogglePassword={() => setShowNewPassword((v) => !v)}
          toggleLabel="新密码"
        />

        <FormField
          id="forget-confirm-password"
          label="确认新密码"
          icon={confirmPasswordIcon}
          placeholder="再次输入新密码"
          value={form.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          autoComplete="new-password"
          error={errors.confirmPassword}
          isPassword
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((v) => !v)}
          toggleLabel="确认新密码"
        />

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

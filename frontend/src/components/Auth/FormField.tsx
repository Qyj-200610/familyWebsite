interface FormFieldProps {
  id: string;
  label: string;
  /** 前缀图标 SVG 地址 */
  icon: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  /** 密码字段：启用显示/隐藏切换 */
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  /** 密码切换按钮 aria-label 中的字段名，如「确认密码」；默认「密码」 */
  toggleLabel?: string;
}

/**
 * 认证表单字段：label + 图标 + input + （可选）密码切换 + 错误提示。
 * 复用 Auth.css 中已有的 `.form-group` / `.form-input` 等样式。
 */
function FormField({
  id,
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
  inputMode,
  error,
  isPassword,
  showPassword,
  onTogglePassword,
  toggleLabel = "密码",
}: FormFieldProps) {
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const classes = [
    "form-input",
    icon ? "form-input--with-icon" : "",
    isPassword ? "form-input--with-toggle" : "",
    error ? "form-input--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="form-input-wrapper">
        <input
          id={id}
          type={inputType}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputMode={inputMode}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {icon && (
          <img className="form-input-icon" src={icon} alt="" aria-hidden="true" />
        )}
        {isPassword && (
          <button
            type="button"
            className="form-password-toggle"
            onClick={onTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? `隐藏${toggleLabel}` : `显示${toggleLabel}`}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && (
        <span className="form-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;

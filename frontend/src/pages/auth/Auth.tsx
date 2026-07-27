import { Link } from "react-router-dom";
import "./Auth.css";

interface AuthProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
}

function Auth({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthProps) {
  return (
    <div className="auth">
      <div className="auth__container">
        {/* Left: decorative panel */}
        <div className="auth__panel">
          <Link to="/" className="auth__panel-logo">
            🏠 我们的家
          </Link>
          <div className="auth__panel-illustration">
            <div className="auth__panel-circle auth__panel-circle--lg">
              <span>👨‍👩‍👧‍👦</span>
            </div>
            <div className="auth__panel-circle auth__panel-circle--sm auth__panel-circle--float-1">
              <span>📸</span>
            </div>
            <div className="auth__panel-circle auth__panel-circle--sm auth__panel-circle--float-2">
              <span>💬</span>
            </div>
          </div>
          <p className="auth__panel-tagline">珍藏每一个温暖的瞬间</p>
        </div>

        {/* Right: form */}
        <div className="auth__form-side">
          <div className="auth__form-wrapper">
            <h2 className="auth__title">{title}</h2>
            {subtitle && <p className="auth__subtitle">{subtitle}</p>}
            <div className="auth__form">{children}</div>
            {footerText && footerLinkText && footerLinkTo && (
              <p className="auth__footer">
                {footerText}{" "}
                <Link to={footerLinkTo} className="auth__footer-link">
                  {footerLinkText}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../Auth";
import "./RegisterSuccess.css";

const COUNTDOWN_SECONDS = 5;

function RegisterSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Navigate when countdown reaches 0 (separate effect — no side effects in state updater)
  useEffect(() => {
    if (countdown <= 0 && !navigatedRef.current) {
      navigatedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      navigate("/login", { replace: true });
    }
  }, [countdown, navigate]);

  return (
    <Auth
      title="注册成功 🎉"
      subtitle="您的家庭账号已创建，请前往登录"
    >
      <div className="register-success">
        {/* Confetti particles */}
        <div className="register-success__confetti" aria-hidden="true">
          <span className="register-success__confetti-dot register-success__confetti-dot--1" />
          <span className="register-success__confetti-dot register-success__confetti-dot--2" />
          <span className="register-success__confetti-dot register-success__confetti-dot--3" />
          <span className="register-success__confetti-dot register-success__confetti-dot--4" />
          <span className="register-success__confetti-dot register-success__confetti-dot--5" />
          <span className="register-success__confetti-dot register-success__confetti-dot--6" />
        </div>

        <div className="register-success__icon">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="3" />
            <path
              d="M24 40L35 51L56 29"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="register-success__message">
          感谢您的注册，现在可以使用账号登录了
        </p>

        <button
          className="register-success__btn"
          onClick={() => navigate("/login", { replace: true })}
        >
          前往登录
        </button>

        <p className="register-success__auto-hint">
          页面将在 <span className="register-success__countdown">{countdown}</span> 秒后自动跳转
        </p>
      </div>
    </Auth>
  );
}

export default RegisterSuccess;

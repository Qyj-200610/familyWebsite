import "./Spinner.css";

interface SpinnerProps {
  /** 直径（px），默认 40 */
  size?: number;
  /** 追加修饰类（如 `spinner--light` 用于深色背景） */
  className?: string;
}

/** 旋转加载指示器 */
function Spinner({ size = 40, className }: SpinnerProps) {
  const style = size
    ? { width: size, height: size, borderWidth: Math.max(2, Math.round(size / 13)) }
    : undefined;

  return <span className={`spinner ${className ?? ""}`.trim()} style={style} />;
}

interface LoadingProps {
  text: string;
  /** 传给内部 Spinner 的尺寸 */
  spinnerSize?: number;
}

/** 居中加载态：Spinner + 文案 */
function Loading({ text, spinnerSize }: LoadingProps) {
  return (
    <div className="loading">
      <Spinner size={spinnerSize} />
      <p>{text}</p>
    </div>
  );
}

export { Spinner, Loading };
export default Spinner;

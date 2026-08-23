import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import "./Avatar.css";

interface AvatarProps {
  /** 头像图片地址；为空时渲染首字母兜底 */
  src?: string | null;
  /** 首字母兜底来源（取首字符） */
  name?: string;
  /** 直径（px），默认 40 */
  size?: number;
  /** 追加装饰类 */
  className?: string;
  alt?: string;
}

/** 圆形头像：图片加载失败或缺失时回退为用户名首字母 */
function Avatar({ src, name, size = 40, className, alt }: AvatarProps) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.42);

  return (
    <span
      className={`avatar ${className ?? ""}`.trim()}
      style={{ width: size, height: size }}
    >
      <ImageWithFallback
        src={src}
        alt={alt ?? name}
        fallback={
          <span className="avatar__initial" style={{ fontSize }}>
            {initial}
          </span>
        }
      />
    </span>
  );
}

export default Avatar;

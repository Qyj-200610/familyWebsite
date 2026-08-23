import { useState } from "react";

interface ImageWithFallbackProps {
  /** 图片地址；为空字符串 / null / undefined 时直接渲染回退内容 */
  src: string | null | undefined;
  alt?: string;
  /** 传给 <img> 的类名（沿用各调用点的 CSS 类名） */
  className?: string;
  loading?: "lazy" | "eager";
  /** 图片缺失或加载失败时渲染的回退内容（由调用方提供完整节点） */
  fallback: React.ReactNode;
}

/**
 * 带加载失败回退的图片组件。
 *
 * 用 React state 替代原先散落各处的 `onError + nextElementSibling` DOM 操作，
 * 统一处理「无图片」与「图片加载失败」两种情况。src 变化时自动重置错误态，
 * 修复了旧实现下切换图片后错误态残留的问题（例如相册查看器切换照片）。
 */
function ImageWithFallback({
  src,
  alt = "",
  className,
  loading,
  fallback,
}: ImageWithFallbackProps) {
  // 记录「加载失败的图片地址」而非布尔值：用 `erroredSrc === src` 派生错误态，
  // src 变化时错误态自动重置，既修复切换图片后失败状态残留的问题，
  // 也避免在 effect 中同步 setState（react-hooks/set-state-in-effect）。
  const [erroredSrc, setErroredSrc] = useState<string | null | undefined>(null);
  const errored = erroredSrc === src;

  if (!src || errored) {
    return <>{fallback}</>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErroredSrc(src)}
    />
  );
}

export default ImageWithFallback;

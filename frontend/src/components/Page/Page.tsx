import "./Page.css";

interface PageProps {
  /** 页面专属类名（如 `home`），叠加在共享 `.page` 上 */
  className?: string;
  children: React.ReactNode;
}

/**
 * 认证后页面的统一外壳：页面背景 + 顶部装饰条。
 * 内部页面用 `<Page className="X">` 包裹，保留各自的 `X__main` 等选择器。
 */
function Page({ className, children }: PageProps) {
  return (
    <div className={`page ${className ?? ""}`.trim()}>
      <div className="page__top-decor" />
      {children}
    </div>
  );
}

export default Page;

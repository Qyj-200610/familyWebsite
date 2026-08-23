import "./EmptyState.css";

interface EmptyStateProps {
  /** 图标（emoji 或节点） */
  icon: React.ReactNode;
  title?: string;
  description?: string;
  /** 动作按钮 / 补充提示等 */
  children?: React.ReactNode;
  className?: string;
}

/** 居中空态：图标 + 标题 + 描述 + 自定义子内容 */
function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className ?? ""}`.trim()}>
      <span className="empty-state__icon">{icon}</span>
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__desc">{description}</p>}
      {children}
    </div>
  );
}

export default EmptyState;

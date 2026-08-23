import { useEffect } from "react";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  /** 点击遮罩 / 关闭按钮 / ESC 时调用 */
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** 底部按钮区，由调用方传入（配合 `.modal__btn` 系列类） */
  footer?: React.ReactNode;
  /** 弹窗最大宽度（px），默认 520 */
  maxWidth?: number;
  /** 关闭按钮 / ESC 是否禁用（提交中禁止关闭） */
  closeDisabled?: boolean;
  /** 隐藏标题栏的关闭按钮（纯确认框用） */
  hideClose?: boolean;
}

function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 520,
  closeDisabled = false,
  hideClose = false,
}: ModalProps) {
  // ESC 关闭（提交中禁用）
  useEffect(() => {
    if (!open || closeDisabled) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closeDisabled, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="modal__header">
            {title && <h3 className="modal__title">{title}</h3>}
            {!hideClose && (
              <button
                className="modal__close"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="关闭"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;

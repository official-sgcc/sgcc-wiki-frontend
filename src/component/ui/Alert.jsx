import { useEffect } from "react";
import "./Alert.css";

export default function AlertModal({
  type = "alert",
  color = "red", // red | yellow | green, 기본값: red
  title = "알림",
  content = "",
  onConfirm = () => {},
  onClose = () => {},
  confirmText = "확인",
  cancelText = "취소",
}) {
  const isLoading = type === "loading";
  const isConfirm = type === "confirm";

  useEffect(() => {
    if (isLoading) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, onClose]);

  if (!title && !content) return null;

  return (
    <div
      className="alert-overlay"
      role="presentation"
      onClick={isLoading ? undefined : onClose}
    >
      <section
        className={`alert-modal alert-modal--${color} ${
          isLoading ? "loading" : ""
        }`}
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {!isLoading && (
          <button
            type="button"
            className="alert-close"
            aria-label="모달 닫기"
            onClick={onClose}
          >
            ×
          </button>
        )}

        {isLoading && <div className="alert-spinner" />}

        <h2 className="alert-title">{title}</h2>

        {content && <p className="alert-message">{content}</p>}

        {!isLoading && (
          <div className="alert-buttons">
            {isConfirm && (
              <button
                type="button"
                className="alert-cancel"
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              className="alert-confirm"
              onClick={onConfirm}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

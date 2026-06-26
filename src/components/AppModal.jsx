import { useEffect, useRef } from "react";

export function AppModal({ modal, onInputChange, onConfirm, onCancel }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!modal || modal.type !== "prompt") return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    }, 60);

    return () => window.clearTimeout(focusTimer);
  }, [modal]);

  if (!modal) return null;

  const isPrompt = modal.type === "prompt";
  const showCancel = modal.type === "confirm" || isPrompt;
  const messageLines = String(modal.message || "").split("\n");

  return (
    <div
      className={`app-modal-backdrop app-modal-${modal.tone || "info"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && modal.closeOnBackdrop !== false) {
          onCancel();
        }
      }}
    >
      <form
        className="app-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(isPrompt ? modal.inputValue || "" : true);
        }}
      >
        <div className="app-modal-content">
          {modal.title && (
            <h3 id="app-modal-title">{modal.title}</h3>
          )}

          {messageLines.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}

          {isPrompt && (
            modal.multiline ? (
              <textarea
                ref={inputRef}
                className="app-modal-input app-modal-textarea"
                value={modal.inputValue || ""}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={modal.placeholder || ""}
              />
            ) : (
              <input
                ref={inputRef}
                className="app-modal-input"
                value={modal.inputValue || ""}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={modal.placeholder || ""}
              />
            )
          )}
        </div>

        <div className="app-modal-actions">
          {showCancel && (
            <button type="button" className="secondary-button app-modal-cancel" onClick={onCancel}>
              {modal.cancelText || "Vazgeç"}
            </button>
          )}
          <button type="submit" className={modal.tone === "danger" ? "main-button app-modal-danger-button" : "main-button"}>
            {modal.confirmText || "Tamam"}
          </button>
        </div>
      </form>
    </div>
  );
}

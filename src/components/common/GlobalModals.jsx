import React from "react";

export function GlobalModals({
  customAlert,
  setCustomAlert,
  customConfirm,
  setCustomConfirm,
  customPrompt,
  setCustomPrompt,
  t
}) {
  return (
    <>
      {/* Özel Alert Zırhlı Modal */}
      {customAlert && (
        <div
          onClick={() => { customAlert.resolve(true); setCustomAlert(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "400px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customAlert.title}
            </h3>
            <p style={{ fontSize: "17px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customAlert.message}
            </p>
            <button type="button" className="main-button" onClick={() => { customAlert.resolve(true); setCustomAlert(null); }} style={{ margin: 0, minWidth: "140px" }}>
              {t('ui.ok')}
            </button>
          </div>
        </div>
      )}

      {/* Özel Confirm Zırhlı Modal */}
      {customConfirm && (
        <div
          onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "400px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0 0 12px", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customConfirm.title}
            </h3>
            <p style={{ fontSize: "17px", lineHeight: "1.6", color: "var(--text, #55303b)", marginBottom: "24px", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customConfirm.message}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" className="main-button" onClick={() => { customConfirm.resolve(true); setCustomConfirm(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {t('ui.yes')}
              </button>
              <button type="button" className="secondary-button" onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {t('ui.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Özel Prompt Zırhlı Modal */}
      {customPrompt && (
        <div
          onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); customPrompt.resolve(customPrompt.value); setCustomPrompt(null); }}
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "90%", maxWidth: "440px", textAlign: "center", padding: "34px 24px", border: "2px solid #b56c83", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3 style={{ color: "var(--rose-dark, #9f4f68)", margin: "0", fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: "800" }}>
              {customPrompt.title}
            </h3>
            <p style={{ fontSize: "16px", margin: "0", color: "var(--text, #55303b)", fontFamily: "Playfair Display, serif", fontWeight: "600" }}>
              {customPrompt.label}
            </p>
            {customPrompt.multiline ? (
              <textarea
                autoFocus
                value={customPrompt.value}
                onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })}
                style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1.5px solid #d98ca1", outline: "none", minHeight: "100px", fontFamily: "Playfair Display, serif", fontSize: "16px" }}
              />
            ) : (
              <input
                autoFocus
                value={customPrompt.value}
                onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })}
                style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1.5px solid #d98ca1", outline: "none", fontFamily: "Playfair Display, serif", fontSize: "16px" }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
              <button type="submit" className="main-button" style={{ margin: 0, minWidth: "120px" }}>
                {t('ui.save')}
              </button>
              <button type="button" className="secondary-button" onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }} style={{ margin: 0, minWidth: "120px" }}>
                {t('ui.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
import React from "react";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { Dropdown } from "../../common/UIComponents";
import { THEMES } from "../../../config/constants";

export function ThemeTab({ adminDraft, updateDraftObject, handleThemeChange, saveSiteContent, isEn }) {
  return (
    <AdminSection title={isEn ? "Theme & Publishing Settings" : "Tema ve Yayın Ayarları"} onSave={saveSiteContent}>
      <p className="admin-help-text">
        {isEn ? "When the theme changes, buttons, cards, text colors adjust accordingly." : "Tema değiştiğinde butonlar, kartlar, yazı renkleri aynı temaya göre değişir."}
      </p>
      <div className="theme-picker-grid">
        {THEMES.map((theme) => (
          <button type="button" key={theme.value} className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"} data-theme-preview={theme.value} onClick={() => handleThemeChange(theme.value)}>
            <span className="theme-swatch" aria-hidden="true"></span>
            <strong>{theme.label}</strong>
            <small>{adminDraft.settings.theme === theme.value ? (isEn ? "Selected theme" : "Seçili tema") : (isEn ? "Use this theme" : "Bu temayı kullan")}</small>
          </button>
        ))}
      </div>
      <div className="admin-theme-check-row">
        <AdminCheckbox checked={adminDraft.settings.requireWishApproval} label={isEn ? "Guestbook messages require admin approval" : "Anı defteri mesajları admin onayından sonra yayınlansın"} onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)} />
      </div>
      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
        <h4 style={{ marginBottom: "12px", color: "var(--rose-dark)" }}>{isEn ? "Default Theme (For Reset)" : "Varsayılan Tema (Sıfırlama İçin)"}</h4>
        <Dropdown value={adminDraft.settings.defaultTheme || "lavanta"} onChange={(value) => updateDraftObject("settings", "defaultTheme", value)} options={THEMES} />
      </div>
    </AdminSection>
  );
}
import React from "react";
import { useTranslation } from "react-i18next";

export function AdminSection({ title, children, onSave }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="admin-editor-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {onSave && (
          <button 
            type="button" 
            className="secondary-button small-admin-button" 
            onClick={onSave}
          >
            {isEn ? "Save 💾" : "Kaydet 💾"}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function AdminActionButtons({ onSave, onDelete, onMoveUp, onMoveDown, isEn }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", alignSelf: "flex-end" }}>
      {onMoveUp && (
        <button type="button" className="secondary-button small-admin-button" onClick={onMoveUp} title={isEn ? "Move Up" : "Yukarı Taşı"}>↑</button>
      )}
      {onMoveDown && (
        <button type="button" className="secondary-button small-admin-button" onClick={onMoveDown} title={isEn ? "Move Down" : "Aşağı Taşı"}>↓</button>
      )}
      {onSave && (
        <button type="button" className="secondary-button small-admin-button" onClick={onSave}>{isEn ? "Save 💾" : "Kaydet 💾"}</button>
      )}
      {onDelete && (
        <button type="button" className="secondary-button danger-button small-admin-button" onClick={onDelete}>{isEn ? "Delete 🗑️" : "Sil 🗑️"}</button>
      )}
    </div>
  );
}
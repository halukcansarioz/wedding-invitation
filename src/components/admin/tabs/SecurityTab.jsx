import React from "react";
import { AdminSection, AdminField } from "../../AdminUI";

export function SecurityTab({ saveSiteContent, adminCurrentPassword, setAdminCurrentPassword, adminNewPassword, setAdminNewPassword, adminNewPasswordAgain, setAdminNewPasswordAgain, changeAdminPassword, adminPasswordMessage, isEn }) {
  return (
    <AdminSection title={isEn ? "Admin Password" : "Admin Şifresi"} onSave={saveSiteContent}>
      <div className="admin-edit-grid">
        <AdminField label={isEn ? "Current Password" : "Mevcut Şifre"} onChange={setAdminCurrentPassword} value={adminCurrentPassword} type="password" />
        <AdminField label={isEn ? "New Password" : "Yeni Şifre"} onChange={setAdminNewPassword} value={adminNewPassword} type="password" />
        <AdminField label={isEn ? "New Password Again" : "Yeni Şifre Tekrar"} onChange={setAdminNewPasswordAgain} value={adminNewPasswordAgain} type="password" />
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button type="button" className="main-button" onClick={changeAdminPassword}>{isEn ? "Change Password 🔐" : "Şifreyi Değiştir 🔐"}</button>
      </div>
      {adminPasswordMessage && <p className="admin-help-text">{adminPasswordMessage}</p>}
    </AdminSection>
  );
}
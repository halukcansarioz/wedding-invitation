import React from "react";
import { AdminSection } from "../../AdminUI";

export function QrTab({ saveSiteContent, qrImageUrl, downloadQrCode, currentShareLink, copyAdminLink, isEn }) {
  return (
    <AdminSection title={isEn ? "QR Code and Share" : "QR Kod ve Paylaşım"} onSave={saveSiteContent}>
      <p className="admin-help-text">{isEn ? "Download the QR code or copy the link." : "QR kodu indirebilir veya linki kopyalayabilirsiniz."}</p>
      <div className="admin-qr-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "var(--paper-soft)", padding: "32px 24px", borderRadius: "22px", border: "1px solid var(--border)" }}>
          <img src={qrImageUrl} alt="QR Code" style={{ width: "180px", height: "180px", objectFit: "contain", borderRadius: "16px", margin: "0 auto 20px", background: "#fff", padding: "12px", border: "1px solid var(--border)" }} />
          <button type="button" className="main-button" onClick={downloadQrCode} style={{ minWidth: "220px", margin: 0 }}>{isEn ? "Download QR 📥" : "QR İndir 📥"}</button>
        </div>
        <div className="admin-link-preview-box" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--paper-soft)", padding: "24px", borderRadius: "22px", border: "1px solid var(--border)" }}>
          <div>
            <span style={{ fontWeight: 800, color: "var(--rose-dark)", display: "block", marginBottom: "8px", fontSize: "16px" }}>{isEn ? "General Invitation Link" : "Genel Davetiye Linki"}</span>
            <input value={currentShareLink} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px solid rgba(159, 79, 104, 0.46)", background: "#fff", fontWeight: "700", color: "var(--text)", outline: "none" }} />
          </div>
          <button type="button" className="secondary-button" onClick={() => copyAdminLink(currentShareLink, isEn ? "Invitation link copied!" : "Davetiye linki kopyalandı!")} style={{ alignSelf: "flex-start", margin: 0 }}>{isEn ? "Copy Link 🔗" : "Linki Kopyala 🔗"}</button>
        </div>
      </div>
    </AdminSection>
  );
}
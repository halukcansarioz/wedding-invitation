import React from "react";
import { AdminSection } from "../../AdminUI";

export function QrTab({ saveSiteContent, qrImageUrl, downloadQrCode, currentShareLink, copyAdminLink, isEn }) {
  return (
    <AdminSection title={isEn ? "QR Code and Share" : "QR Kod ve Paylaşım"} onSave={saveSiteContent}>
      <p className="admin-help-text">{isEn ? "Download the QR code or copy the link." : "QR kodu indirebilir veya linki kopyalayabilirsiniz."}</p>
      <div className="admin-qr-panel admin-panel-grid">
        <div className="admin-qr-box">
          <img src={qrImageUrl} alt="QR Code" className="admin-qr-image" />
          <button type="button" className="main-button admin-qr-btn" onClick={downloadQrCode}>
            {isEn ? "Download QR 📥" : "QR İndir 📥"}
          </button>
        </div>
        <div className="admin-link-preview-box">
          <div>
            <span className="admin-link-preview-label">{isEn ? "General Invitation Link" : "Genel Davetiye Linki"}</span>
            <input value={currentShareLink} readOnly className="admin-link-preview-input" />
          </div>
          <button type="button" className="secondary-button admin-link-copy-btn" onClick={() => copyAdminLink(currentShareLink, isEn ? "Invitation link copied!" : "Davetiye linki kopyalandı!")}>
            {isEn ? "Copy Link 🔗" : "Linki Kopyala 🔗"}
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
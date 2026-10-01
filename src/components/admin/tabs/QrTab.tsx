import React from "react";
import { AdminSection, AdminField } from "../../AdminUI";
import { useAdminQr } from "../../../hooks/useAdminQr";

interface QrTabProps {
  saveSiteContent: (isEn: boolean) => void;
  qrImageUrl: string;
  downloadQrCode: () => void;
  currentShareLink: string;
  copyAdminLink: (link: string, msg: string) => void;
  isEn: boolean;
}

export function QrTab({ saveSiteContent, qrImageUrl, downloadQrCode, currentShareLink, copyAdminLink, isEn }: QrTabProps) {
  const { tableCount, setTableCount, printTableCards } = useAdminQr(currentShareLink, isEn);

  return (
    <AdminSection title={isEn ? "QR Code and Share" : "QR Kod ve Paylaşım"} onSave={() => saveSiteContent(isEn)}>
      <p className="admin-help-text">
        {isEn 
          ? "Download your general QR code or generate printable QR cards for each table." 
          : "Genel QR kodunuzu indirebilir veya masalara koymak için toplu QR kartları yazdırabilirsiniz."}
      </p>
      
      <div className="admin-qr-panel admin-panel-grid" style={{ marginBottom: "32px" }}>
        <div className="admin-qr-box">
          <img src={qrImageUrl} alt="QR Code" className="admin-qr-image" />
          <button type="button" className="main-button admin-qr-btn" onClick={downloadQrCode}>
            {isEn ? "Download General QR 📥" : "Genel QR İndir 📥"}
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

      <div style={{ padding: "24px", background: "var(--paper-soft)", borderRadius: "16px", border: "1px solid var(--admin-border-color)" }}>
        <h4 style={{ color: "var(--rose-deep)", marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>
          {isEn ? "Print Table QR Cards" : "Masa QR Kartlarını Yazdır"}
        </h4>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
          {isEn 
            ? "Generate a beautiful PDF with table-specific QR codes. Guests who scan these will automatically have their table number filled in." 
            : "Misafirlerinizin masalarındaki QR kodları okutarak doğrudan barkovizyona (canlı ekrana) fotoğraf atabilmesi için masa kartları oluşturun."}
        </p>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <AdminField 
              type="number" 
              label={isEn ? "Number of Tables" : "Toplam Masa Sayısı"} 
              value={tableCount.toString()} 
              onChange={(v: string) => setTableCount(Number(v))} 
            />
          </div>
          <button type="button" className="main-button" onClick={printTableCards} style={{ marginBottom: "14px" }}>
            {isEn ? "🖨️ Generate & Print Cards" : "🖨️ Kartları Oluştur ve Yazdır"}
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
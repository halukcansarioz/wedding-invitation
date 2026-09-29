import React, { useState } from "react";
import { AdminSection, AdminField } from "../../AdminUI";
import { buildPersonalLink, getQrImageUrl } from "../../../utils/helpers";

export function QrTab({ saveSiteContent, qrImageUrl, downloadQrCode, currentShareLink, copyAdminLink, isEn }) {
  const [tableCount, setTableCount] = useState(15);

  const printTableCards = () => {
    const printWindow = window.open('', '_blank');
    let html = `
      <html>
        <head>
          <title>${isEn ? 'Table QR Cards' : 'Masa QR Kartları'}</title>
          <style>
            body { font-family: "Playfair Display", serif; text-align: center; background: #fff; margin: 0; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
            .card { 
              border: 3px solid #9f4f68; 
              padding: 30px; 
              border-radius: 20px; 
              page-break-inside: avoid;
              background: #fffafb;
            }
            img { width: 220px; height: 220px; margin-bottom: 10px; border-radius: 12px; }
            h2 { color: #9f4f68; margin: 0 0 10px 0; font-size: 32px; }
            p { color: #55303b; font-size: 18px; margin: 0; font-family: sans-serif; }
            @media print {
              body { padding: 0; }
              .grid { gap: 20px; }
              .card { border: 2px solid #9f4f68; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
    `;

    for (let i = 1; i <= tableCount; i++) {
      const tableLink = buildPersonalLink(currentShareLink, "", i);
      const tableQr = getQrImageUrl(tableLink);
      html += `
        <div class="card">
          <h2>${isEn ? 'Table' : 'Masa'} ${i}</h2>
          <img src="${tableQr}" alt="QR Code" crossorigin="anonymous" />
          <p>${isEn ? 'Scan to send photos to the Live Projector!' : 'Canlı ekrana fotoğraf göndermek için okutun!'}</p>
        </div>
      `;
    }

    html += `
          </div>
          <script>
            setTimeout(() => { window.print(); }, 1500);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <AdminSection title={isEn ? "QR Code and Share" : "QR Kod ve Paylaşım"} onSave={saveSiteContent}>
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
              value={tableCount} 
              onChange={(v) => setTableCount(Number(v))} 
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
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminSection, AdminField } from "../../AdminUI";
import { buildPersonalLink } from "../../../utils/helpers";

export function PersonalLinkPanel({ currentShareLink, copyAdminLink, personalLinkName, setPersonalLinkName }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");
  const [tableNumber, setTableNumber] = useState("");
  
  const generatedLink = buildPersonalLink(currentShareLink, personalLinkName, tableNumber);
  
  const openWhatsAppShare = () => {
    if (!personalLinkName.trim()) return;
    const tableMsg = tableNumber.trim() ? (isEn ? `\n🍽️ Your Reserved Table: ${tableNumber}` : `\n🍽️ Sizin İçin Ayrılan Masa: ${tableNumber}`) : "";
    const text = isEn
      ? `Dear ${personalLinkName}, our wedding invitation is ready! 💍${tableMsg}\n\nYou can view it here:\n${generatedLink}`
      : `Sevgili ${personalLinkName}, düğün davetiyemiz sana özel olarak hazırlandı! 💍${tableMsg}\n\nDavetiyemizi aşağıdaki linkten inceleyebilirsin:\n${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AdminSection title={isEn ? "Personal Link Generator" : "Kişiye Özel Akıllı Link Üretici"}>
      <div className="admin-personal-link-box personal-link-standalone admin-panel-grid">
        <p className="admin-help-text" style={{ margin: 0 }}>
          {isEn ? "Generate a special invitation link by typing a guest's name and optional table number." : "Davetli adı ve isteğe bağlı masa numarası girerek özel akıllı link oluşturabilirsiniz."}
        </p>
        <div className="admin-edit-grid admin-panel-grid-half">
          <AdminField label={isEn ? "Guest Name" : "Davetli Adı Soyadı"} onChange={setPersonalLinkName} placeholder={isEn ? "Ex: John Doe" : "Örn: Ahmet Yılmaz"} value={personalLinkName} />
          <AdminField label={isEn ? "Table Number (Optional)" : "Masa Numarası (İsteğe Bağlı)"} onChange={setTableNumber} placeholder={isEn ? "Ex: 12" : "Örn: 12"} value={tableNumber} />
        </div>
        <div>
          <span className="admin-link-result-label">
            {isEn ? "Generated Link:" : "Üretilen Akıllı Link:"}
          </span>
          <input value={generatedLink} readOnly className="admin-link-result-input" />
        </div>
        <div className="admin-button-group">
          <button type="button" className="main-button admin-button-flex" onClick={() => copyAdminLink(generatedLink, isEn ? "Link copied!" : "Akıllı davetiye linki kopyalandı!")}>
            {isEn ? "🔗 Copy Link" : "🔗 Linki Kopyala"}
          </button>
          <button 
            type="button" 
            className="secondary-button admin-button-flex admin-whatsapp-btn" 
            onClick={() => { if (!personalLinkName.trim()) { alert(isEn ? "Please enter a name first!" : "Lütfen önce bir davetli adı yazın!"); return; } openWhatsAppShare(); }} 
            style={{ opacity: personalLinkName.trim() ? 1 : 0.6, cursor: personalLinkName.trim() ? "pointer" : "not-allowed" }}
          >
            {isEn ? "💬 Send via WhatsApp" : "💬 WhatsApp ile Gönder"}
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
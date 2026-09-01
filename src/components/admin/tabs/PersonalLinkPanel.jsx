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
      <div className="admin-personal-link-box personal-link-standalone" style={{ display: "grid", gap: "18px" }}>
        <p className="admin-help-text" style={{ margin: 0 }}>
          {isEn ? "Generate a special invitation link by typing a guest's name and optional table number." : "Davetli adı ve isteğe bağlı masa numarası girerek özel akıllı link oluşturabilirsiniz."}
        </p>
        <div className="admin-edit-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <AdminField label={isEn ? "Guest Name" : "Davetli Adı Soyadı"} onChange={setPersonalLinkName} placeholder={isEn ? "Ex: John Doe" : "Örn: Ahmet Yılmaz"} value={personalLinkName} />
          <AdminField label={isEn ? "Table Number (Optional)" : "Masa Numarası (İsteğe Bağlı)"} onChange={setTableNumber} placeholder={isEn ? "Ex: 12" : "Örn: 12"} value={tableNumber} />
        </div>
        <div style={{ marginTop: "4px" }}>
          <span style={{ display: "block", marginBottom: "6px", fontWeight: "700", color: "var(--rose-dark)" }}>
            {isEn ? "Generated Link:" : "Üretilen Akıllı Link:"}
          </span>
          <input value={generatedLink} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1.5px dashed var(--rose-dark)", background: "var(--paper-soft)", fontWeight: "700", color: "var(--text)" }} />
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px" }}>
          <button type="button" className="main-button" onClick={() => copyAdminLink(generatedLink, isEn ? "Link copied!" : "Akıllı davetiye linki kopyalandı!")} style={{ flex: "1", minWidth: "180px", margin: 0 }}>
            {isEn ? "🔗 Copy Link" : "🔗 Linki Kopyala"}
          </button>
          <button type="button" className="secondary-button" onClick={() => { if (!personalLinkName.trim()) { alert(isEn ? "Please enter a name first!" : "Lütfen önce bir davetli adı yazın!"); return; } openWhatsAppShare(); }} style={{ flex: "1", minWidth: "180px", margin: 0, backgroundColor: "#25D366", color: "#fff", borderColor: "#25D366", opacity: personalLinkName.trim() ? 1 : 0.6, cursor: personalLinkName.trim() ? "pointer" : "not-allowed" }}>
            {isEn ? "💬 Send via WhatsApp" : "💬 WhatsApp ile Gönder"}
          </button>
        </div>
      </div>
    </AdminSection>
  );
}
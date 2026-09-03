import React from "react";
import { AdminSection, AdminTextarea } from "../../AdminUI";

export function DataTab({ saveSiteContent, exportAllDataJson, dataImportText, setDataImportText, importAllDataJson, isEn }) {
  return (
    <AdminSection title={isEn ? "Data Backup" : "Veri Yedeği"} onSave={saveSiteContent}>
      <div className="admin-export-grid">
        <div className="admin-export-card">
          <strong>{isEn ? "Backup (Export)" : "Yedek Al (Dışa Aktar)"}</strong>
          <span>{isEn ? "Downloads the entire system as a JSON file." : "Tüm sistemi JSON formatında bilgisayarınıza indirir."}</span>
          <button type="button" className="main-button" onClick={exportAllDataJson}>{isEn ? "Download JSON ⬇️" : "JSON İndir ⬇️"}</button>
        </div>
        <div className="admin-import-box" style={{ margin: 0 }}>
          <strong style={{ display: "block", marginBottom: "8px", color: "var(--rose-deep)" }}>{isEn ? "Restore Backup (Import)" : "Yedeği Geri Yükle (İçe Aktar)"}</strong>
          <AdminTextarea label="" value={dataImportText} onChange={setDataImportText} placeholder={isEn ? "Paste downloaded JSON file content here..." : "JSON içeriğini buraya yapıştırın..."} />
          <button type="button" className="secondary-button danger-button" style={{ marginTop: "12px", width: "100%" }} onClick={importAllDataJson}>{isEn ? "Import Backup ⬆️" : "Yedeği İçe Aktar ⬆️"}</button>
        </div>
      </div>
    </AdminSection>
  );
}

const updateSiteContent = async (lang, newContent) => {
  const { error } = await supabase
    .from('site_content')
    .update({ 
      hero_title: newContent.title, 
      story_text: newContent.story,
      ceremony_time: newContent.time,
      rsvp_button_text: newContent.btnText
    })
    .eq('lang_code', lang);

  if (!error) {
    alert("İçerik başarıyla güncellendi, web sitesine anında yansıdı!");
  }
};
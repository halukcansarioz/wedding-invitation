import React, { useState } from "react";
import { AdminSection, AdminTextarea } from "../../AdminUI";
import { syncFailedDeletes } from "../../../services/database";

export function DataTab({ saveSiteContent, exportAllDataJson, dataImportText, setDataImportText, importAllDataJson, isEn }) {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  const handleGarbageCollection = async () => {
    setIsCleaning(true);
    setCleanupResult(null);
    try {
      const { successCount, failCount } = await syncFailedDeletes();
      setCleanupResult(
        isEn 
          ? `Cleanup complete: ${successCount} files deleted. ${failCount} files still pending.` 
          : `Temizlik tamamlandı: ${successCount} yetim dosya silindi. ${failCount} dosya beklemede.`
      );
    } catch (error) {
      setCleanupResult(isEn ? "An error occurred during cleanup." : "Temizlik sırasında bir hata oluştu.");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <AdminSection title={isEn ? "Data & Storage Management" : "Veri ve Depolama Yönetimi"} onSave={saveSiteContent}>
      <p className="admin-help-text" style={{ marginBottom: "24px" }}>
        {isEn 
          ? "Manage your system backups and optimize storage by cleaning up orphaned media files." 
          : "Sistem yedeklerinizi yönetin ve silinmemiş medya dosyalarını temizleyerek depolama alanınızı optimize edin."}
      </p>

      <div className="admin-export-grid" style={{ marginBottom: "32px" }}>
        <div className="admin-export-card">
          <strong style={{ color: "var(--rose-deep)" }}>{isEn ? "Backup (Export)" : "Yedek Al (Dışa Aktar)"}</strong>
          <span>{isEn ? "Downloads the entire system as a JSON file." : "Tüm sistemi JSON formatında bilgisayarınıza indirir."}</span>
          <button type="button" className="main-button" onClick={exportAllDataJson}>{isEn ? "Download JSON ⬇️" : "JSON İndir ⬇️"}</button>
        </div>
        <div className="admin-import-box admin-import-container">
          <strong className="admin-import-label" style={{ color: "var(--rose-deep)" }}>{isEn ? "Restore Backup (Import)" : "Yedeği Geri Yükle (İçe Aktar)"}</strong>
          <AdminTextarea label="" value={dataImportText} onChange={setDataImportText} placeholder={isEn ? "Paste downloaded JSON file content here..." : "JSON içeriğini buraya yapıştırın..."} />
          <button type="button" className="secondary-button danger-button admin-import-btn" onClick={importAllDataJson}>
            {isEn ? "Import Backup ⬆️" : "Yedeği İçe Aktar ⬆️"}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px", background: "var(--paper-soft)", borderRadius: "12px", border: "1px solid var(--admin-border-color)" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "var(--rose-deep)" }}>
          {isEn ? "Storage Optimization (Garbage Collection)" : "Depolama Optimizasyonu (Çöp Temizliği)"}
        </h4>
        <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--text-muted)" }}>
          {isEn 
            ? "Sometimes deleted photos remain on the server due to connection drops. Use this tool to permanently erase them from Supabase and free up space." 
            : "Bazen bağlantı kopmaları nedeniyle silinen fotoğraflar sunucuda (Supabase) asılı kalabilir. Bu araç, yetim kalan dosyaları kalıcı olarak temizler ve yer açar."}
        </p>
        
        <button 
          type="button" 
          className="secondary-button" 
          onClick={handleGarbageCollection}
          disabled={isCleaning}
          style={{ borderColor: "#d35400", color: "#d35400" }}
        >
          {isCleaning 
            ? (isEn ? "Cleaning..." : "Temizleniyor...") 
            : (isEn ? "Run Storage Cleanup 🧹" : "Depolama Temizliğini Başlat 🧹")}
        </button>

        {cleanupResult && (
          <p style={{ margin: "12px 0 0 0", fontSize: "14px", fontWeight: "bold", color: "#27ae60" }}>
            {cleanupResult}
          </p>
        )}
      </div>
    </AdminSection>
  );
}
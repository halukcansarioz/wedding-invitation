import React from "react";
import { useTranslation } from "react-i18next";
import { AdminSection, AdminCheckbox } from "../../AdminUI";
import { Dropdown } from "../../common/UIComponents";

export function WishesAdminPanel({ wishes, filteredWishes, adminWishSearch, setAdminWishSearch, adminWishStatusFilter, setAdminWishStatusFilter, exportWishesExcel, exportWishesCsv, toggleWishApproval, editWish, deleteWish, clearWishes, isEn, adminDraft, updateDraftObject }) {
  const { t } = useTranslation();
  return (
    <AdminSection title={isEn ? "Guestbook Messages" : "Anı Defteri Mesajları"}>
      <div className="admin-theme-check-row" style={{ marginBottom: "24px" }}>
        <AdminCheckbox checked={adminDraft.settings.visibility?.wishes ?? true} label={t('visibility.wishes')} onChange={(v) => updateDraftObject("settings", "visibility", { ...adminDraft.settings.visibility, wishes: v })} />
      </div>
      <div className="admin-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        <input style={{ flex: "1", minWidth: "160px", margin: 0 }} value={adminWishSearch} onChange={(e) => setAdminWishSearch(e.target.value)} placeholder={isEn ? "Search messages..." : "Mesajlarda ara..."} />
        <div style={{ minWidth: "160px", margin: 0 }}>
          <Dropdown value={adminWishStatusFilter} onChange={setAdminWishStatusFilter} options={[{ value: "all", label: isEn ? "All Status" : "Tümü" }, { value: "approved", label: isEn ? "Published" : "Yayında" }, { value: "pending", label: isEn ? "Pending" : "Onay Bekliyor" }]} />
        </div>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportWishesExcel}>{isEn ? "Excel 📊" : "Excel İndir 📊"}</button>
        <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={exportWishesCsv}>{isEn ? "CSV 📄" : "CSV İndir 📄"}</button>
        <button type="button" className="secondary-button danger-button" style={{ margin: 0 }} onClick={clearWishes}>{isEn ? "Clear All 🚨" : "Tümünü Sil 🚨"}</button>
      </div>
      <div className="admin-list admin-list-full">
        {filteredWishes.length === 0 ? (
          <p className="empty-text">{isEn ? "No matching messages found." : "Mesaj bulunamadı."}</p>
        ) : (
          filteredWishes.map((wish) => (
            <div className="admin-row" key={wish.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{wish.name}</strong>
                <span style={{ fontSize: "13px", padding: "4px 8px", borderRadius: "8px", background: wish.approved ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.2)", color: wish.approved ? "#27ae60" : "#d35400", fontWeight: "bold" }}>
                  {wish.approved ? (isEn ? "Published" : "Yayında") : (isEn ? "Pending" : "Onay Bekliyor")}
                </span>
              </div>
              <p style={{ margin: "8px 0", fontStyle: "italic", fontSize: "16px" }}>"{wish.message}"</p>
              <div className="admin-row-actions">
                <button type="button" className="secondary-button small-admin-button" onClick={() => toggleWishApproval(wish.id)}>
                  {wish.approved ? (isEn ? "Hide 🙈" : "Yayından Kaldır 🙈") : (isEn ? "Publish 👁️" : "Yayınla 👁️")}
                </button>
                <button type="button" className="secondary-button small-admin-button" onClick={() => editWish(wish.id)}>{isEn ? "Edit ✏️" : "Düzenle ✏️"}</button>
                <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteWish(wish.id)}>{isEn ? "Delete 🗑️" : "Sil 🗑️"}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminSection>
  );
}
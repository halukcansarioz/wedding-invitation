import { useEffect, useRef, useState } from "react";
import { Dropdown } from "./common/UIComponents";

export function AdminField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminTextarea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminSelect({ label, value, options, onChange }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Dropdown onChange={onChange} options={options} value={value} />
    </label>
  );
}

export function AdminCheckbox({ label, checked, onChange }) {
  return (
    <label className="admin-check-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function AdminImageField({ label, value, onFileSelect, onClear }) {
  return (
    <div className="admin-image-field admin-field-wide">
      <div className="admin-image-header">
        <span>{label}</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            Görseli Kaldır
          </button>
        )}
      </div>

      {value ? (
        <img className="admin-image-preview" src={value} alt={`${label} önizleme`} />
      ) : (
        <div className="admin-image-empty">Henüz görsel seçilmedi.</div>
      )}

      <label className="admin-upload-button">
        Bilgisayardan Görsel Seç
        <input type="file" accept="image/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        Görsel otomatik küçültülür ve bu tarayıcıda saklanır. Büyük fotoğraf yüklerken kaydettikten sonra kontrol et.
      </small>
    </div>
  );
}

export function AdminMusicField({ value, fileName, onFileSelect, onClear }) {
  return (
    <div className="admin-music-field admin-field-wide">
      <div className="admin-image-header">
        <span>Davetiyede çalacak müzik</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            Müziği Kaldır
          </button>
        )}
      </div>

      {value ? (
        <div className="admin-music-preview">
          <strong>{fileName || "Yüklenen müzik"}</strong>
          <audio controls src={value}></audio>
        </div>
      ) : (
        <div className="admin-image-empty">
          Henüz özel müzik seçilmedi. Müzik seçmezsen varsayılan evlilik müziği çalar.
        </div>
      )}

      <label className="admin-upload-button">
        Bilgisayardan Müzik Seç
        <input type="file" accept="audio/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        MP3/M4A gibi kısa ve 4 MB altı bir dosya seç. Kaydettikten sonra davetiyede bu müzik çalar.
      </small>
    </div>
  );
}

export function AdminSection({ title, children, onSave }) {
  return (
    <div className="admin-editor-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {onSave && (
          <button 
            type="button" 
            className="secondary-button small-admin-button" 
            onClick={onSave}
          >
            Kaydet
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Ortaklaştırılmış admin aksiyon butonları
export function AdminActionButtons({ onSave, onDelete, isEn }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", alignSelf: "flex-end" }}>
      <button type="button" className="secondary-button small-admin-button" onClick={onSave}>
        {isEn ? "Save" : "Kaydet"}
      </button>
      <button type="button" className="secondary-button danger-button small-admin-button" onClick={onDelete}>
        {isEn ? "Delete" : "Sil"}
      </button>
    </div>
  );
}
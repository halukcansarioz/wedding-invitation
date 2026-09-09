import React from "react";
import { useTranslation } from "react-i18next";

export function AdminImageField({ label, value, onFileSelect, onClear }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="admin-image-field admin-field-wide">
      <div className="admin-image-header">
        <span>{label}</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            {isEn ? "Remove Image 🗑️" : "Görseli Kaldır 🗑️"}
          </button>
        )}
      </div>

      {value ? (
        <img className="admin-image-preview" src={value} alt={`${label} preview`} />
      ) : (
        <div className="admin-image-empty">{isEn ? "No image selected." : "Henüz görsel seçilmedi."}</div>
      )}

      <label className="admin-upload-button">
        {isEn ? "Select Image from PC 🖼️" : "Bilgisayardan Görsel Seç 🖼️"}
        <input type="file" accept="image/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        {isEn 
          ? "Images are auto-compressed and stored in your browser. Check live site after uploading large photos." 
          : "Görsel otomatik küçültülür ve bu tarayıcıda saklanır. Büyük fotoğraf yüklerken kaydettikten sonra kontrol et."}
      </small>
    </div>
  );
}

export function AdminMusicField({ value, fileName, onFileSelect, onClear }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="admin-music-field admin-field-wide">
      <div className="admin-image-header">
        <span>{isEn ? "Invitation Background Music" : "Davetiyede çalacak müzik"}</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            {isEn ? "Remove Music 🗑️" : "Müziği Kaldır 🗑️"}
          </button>
        )}
      </div>

      {value ? (
        <div className="admin-music-preview">
          <strong>{fileName || (isEn ? "Uploaded music" : "Yüklenen müzik")}</strong>
          <audio controls src={value}></audio>
        </div>
      ) : (
        <div className="admin-image-empty">
          {isEn 
            ? "No custom music selected. Default wedding music will play." 
            : "Henüz özel müzik seçilmedi. Müzik seçmezsen varsayılan evlilik müziği çalar."}
        </div>
      )}

      <label className="admin-upload-button">
        {isEn ? "Select Music from PC 🎵" : "Bilgisayardan Müzik Seç 🎵"}
        <input type="file" accept="audio/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        {isEn 
          ? "Select a short MP3/M4A file under 4 MB. It will play automatically on the invitation." 
          : "MP3/M4A gibi kısa ve 4 MB altı bir dosya seç. Kaydettikten sonra davetiyede bu müzik çalar."}
      </small>
    </div>
  );
}

export function AdminVideoField({ label, value, onFileSelect, onClear }) {
  const { i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  return (
    <div className="admin-image-field admin-field-wide">
      <div className="admin-image-header">
        <span>{label}</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            {isEn ? "Remove Video 🗑️" : "Videoyu Kaldır 🗑️"}
          </button>
        )}
      </div>

      {value ? (
        <video className="admin-image-preview" src={value} controls playsInline style={{ maxHeight: '280px', width: '100%', borderRadius: '14px', marginTop: '10px' }} />
      ) : (
        <div className="admin-image-empty">{isEn ? "No video selected." : "Henüz video seçilmedi."}</div>
      )}

      <label className="admin-upload-button">
        {isEn ? "Select Video from PC 🎥" : "Bilgisayardan Video Seç 🎥"}
        <input type="file" accept="video/mp4,video/webm" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        {isEn
          ? "Select an MP4/WEBM file. It will play silently in the background of the hero section."
          : "MP4/WEBM dosyası seç. Ana giriş ekranının arkasında sessiz ve otomatik olarak oynatılacaktır."}
      </small>
    </div>
  );
}
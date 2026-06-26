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
          Henüz müzik seçilmedi. Müzik seçmezsen tarayıcı melodisi çalar.
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

import { useEffect, useRef, useState } from "react";

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

export function AdminDropdown({ value, options, onChange, placeholder = "Seçiniz" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, [isOpen]);

  return (
    <div className={`admin-custom-select ${isOpen ? "open" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        className="admin-custom-select-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className="admin-custom-select-arrow">⌄</span>
      </button>

      {isOpen && (
        <div className="admin-custom-select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={
                String(option.value) === String(value)
                  ? "admin-custom-select-option selected"
                  : "admin-custom-select-option"
              }
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSelect({ label, value, options, onChange }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <AdminDropdown onChange={onChange} options={options} value={value} />
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

export function AdminSection({ title, children }) {
  return (
    <div className="admin-editor-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

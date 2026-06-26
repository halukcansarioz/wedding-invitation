import { useEffect, useRef, useState } from "react";

export function OptionGroup({ value, options, onChange, disabled = false }) {
  return (
    <div className={disabled ? "option-group disabled" : "option-group"}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          disabled={disabled}
          className={String(value) === String(option.value) ? "option-button active" : "option-button"}
          onClick={() => {
            if (disabled) return;
            onChange(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

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
      <AdminDropdown value={value} options={options} onChange={onChange} />
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


export function AdminSection({ title, children }) {
  return (
    <div className="admin-editor-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
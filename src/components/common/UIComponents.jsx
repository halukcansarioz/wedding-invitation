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

export function Dropdown({ value, options, onChange, placeholder = "Seçiniz" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className={`admin-custom-select ${isOpen ? "open" : ""}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <div className="admin-custom-select-button" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption?.label || placeholder}</span>
        <div className="admin-custom-select-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="admin-custom-select-menu" role="listbox">
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              className={`admin-custom-select-option ${value === option.value ? "selected" : ""} ${focusedIndex === index ? "focused" : ""}`}
              style={focusedIndex === index ? { backgroundColor: 'var(--theme-hero-mid)' } : {}}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setFocusedIndex(-1);
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
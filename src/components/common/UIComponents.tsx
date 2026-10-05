import React, { useEffect, useRef, useState, useId } from "react";

// --- YENİ EKLENEN MODERN SPINNER ---
export function Spinner({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
// -----------------------------------

interface Option {
  label: string;
  value: string | number;
}

interface OptionGroupProps {
  value: string | number;
  options: Option[];
  onChange: (val: string | number) => void;
  disabled?: boolean;
}

export function OptionGroup({ value, options, onChange, disabled = false }: OptionGroupProps) {
  return (
    <div className={disabled ? "option-group disabled" : "option-group"} role="radiogroup">
      {options.map((option) => (
        <button
          type="button"
          role="radio"
          aria-checked={String(value) === String(option.value)}
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

interface DropdownProps {
  value: string | number;
  options: Option[];
  onChange: (val: string | number) => void;
  placeholder?: string;
  id?: string;
}

export function Dropdown({ value, options, onChange, placeholder = "Seçiniz", id }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const activeDescendantId = focusedIndex >= 0 ? `${listboxId}-opt-${focusedIndex}` : undefined;

  return (
    <div 
      id={id}
      className={`admin-custom-select ${isOpen ? "open" : ""}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={isOpen ? listboxId : undefined}
      aria-activedescendant={activeDescendantId}
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
        <div id={listboxId} className="admin-custom-select-menu" role="listbox">
          {options.map((option, index) => (
            <button
              type="button"
              id={`${listboxId}-opt-${index}`}
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
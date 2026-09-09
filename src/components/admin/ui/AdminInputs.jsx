import React from "react";
import { Dropdown } from "../../common/UIComponents";

export function AdminField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
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
        value={value ?? ""}
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
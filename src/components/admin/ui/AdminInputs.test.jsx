import React from "react";
import { Dropdown, Option } from "../../common/UIComponents";

interface AdminFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export function AdminField({ label, value, onChange, type = "text", placeholder = "" }: AdminFieldProps) {
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

interface AdminTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AdminTextarea({ label, value, onChange, placeholder = "" }: AdminTextareaProps) {
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

interface AdminSelectProps {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
}

export function AdminSelect({ label, value, options, onChange }: AdminSelectProps) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Dropdown onChange={onChange} options={options} value={value} />
    </label>
  );
}

interface AdminCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AdminCheckbox({ label, checked, onChange }: AdminCheckboxProps) {
  return (
    <label className="admin-check-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
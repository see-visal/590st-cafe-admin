"use client";

import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function FilterInput({
  label,
  placeholder,
  value = "",
  onChange,
  error,
  disabled = false,
}: FilterInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`h-9 ${error ? "border-red-500" : ""}`}
        aria-label={label}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p id={`${label}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

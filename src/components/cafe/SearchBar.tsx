"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  debounceMs?: number;
}

export function SearchBar({
  placeholder = "Search",
  value = "",
  onChange,
  onSearch,
  disabled = false,
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange?.(localValue);
        onSearch?.(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, onSearch, debounceMs]);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative w-full">
      <Input
        className="h-9 pr-10"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        disabled={disabled}
        aria-label={placeholder}
      />
      <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

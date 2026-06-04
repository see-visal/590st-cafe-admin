"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSelectProps {
  label: string;
  placeholder?: string;
  options: string[];
}

export function FilterSelect({ label, placeholder, options }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Select>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

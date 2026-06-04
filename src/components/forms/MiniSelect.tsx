"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MiniSelectProps {
  options: string[];
}

export function MiniSelect({ options }: MiniSelectProps) {
  return (
    <Select>
      <SelectTrigger className="h-7 w-16 text-xs">
        <SelectValue placeholder={options[0]} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

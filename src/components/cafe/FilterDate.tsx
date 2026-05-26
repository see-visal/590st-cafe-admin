"use client";

import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterDateProps {
  label: string;
  placeholder?: string;
}

export function FilterDate({ label, placeholder }: FilterDateProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="relative">
        <Input placeholder={placeholder} className="h-9 pr-10" />
        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

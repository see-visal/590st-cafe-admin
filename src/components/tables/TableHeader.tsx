"use client";

interface TableHeaderProps {
  title: string;
  subtitle?: string;
}

export function TableHeader({ title, subtitle }: TableHeaderProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

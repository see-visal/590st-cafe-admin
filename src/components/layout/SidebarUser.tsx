"use client";

interface SidebarUserProps {
  name: string;
  role: string;
}

export function SidebarUser({ name, role }: SidebarUserProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-white/65">{role}</p>
      </div>
    </div>
  );
}

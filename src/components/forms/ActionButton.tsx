"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "light" | "dark" | "outline";
}

export function ActionButton({
  children,
  icon,
  variant = "outline",
}: ActionButtonProps) {
  const className =
    variant === "dark"
      ? "bg-black text-white hover:bg-black/90"
      : variant === "light"
      ? "bg-lime-300 text-black hover:bg-lime-200"
      : "border-gray-200 text-gray-700 hover:bg-gray-50";

  return (
    <Button type="button" variant={variant === "outline" ? "outline" : "default"} className={className}>
      {icon}
      {children}
    </Button>
  );
}

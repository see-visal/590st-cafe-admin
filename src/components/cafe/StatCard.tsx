"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  accent?: "green" | "orange" | "red" | "blue" | "gray";
  icon?: ReactNode;
}

const accentStyles: Record<NonNullable<StatCardProps["accent"]>, string> = {
  green: "text-lime-600",
  orange: "text-orange-500",
  red: "text-red-500",
  blue: "text-blue-500",
  gray: "text-gray-600",
};

export function StatCard({ title, value, accent = "gray", icon }: StatCardProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className={cn("mt-2 text-2xl font-semibold", accentStyles[accent])}>
              {value}
            </p>
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { ReactNode } from "react";

interface ActionRowProps {
  left?: ReactNode;
  right?: ReactNode;
}

export function ActionRow({ left, right }: ActionRowProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}

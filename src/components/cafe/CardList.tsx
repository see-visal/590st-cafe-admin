"use client";

import { ReactNode } from "react";

interface CardListProps {
  children: ReactNode;
}

export function CardList({ children }: CardListProps) {
  return <div className="space-y-3">{children}</div>;
}

"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Inventory() {
  return (
    <PageShell>
      <PageHeader
        title="Inventory"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Inventory" }]}
      />
      <EmptyState title="Inventory" description="Manage your inventory here" />
    </PageShell>
  );
}

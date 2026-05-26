"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Categories() {
  return (
    <PageShell>
      <PageHeader
        title="Categories"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />
      <EmptyState title="Categories" description="Manage product categories here" />
    </PageShell>
  );
}

"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Products() {
  return (
    <PageShell>
      <PageHeader
        title="Products"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />
      <EmptyState title="Products" description="Manage your products here" />
    </PageShell>
  );
}

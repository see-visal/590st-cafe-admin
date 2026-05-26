"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Orders() {
  return (
    <PageShell>
      <PageHeader
        title="Orders"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Orders" }]}
      />
      <EmptyState title="Orders" description="Manage your orders here" />
    </PageShell>
  );
}

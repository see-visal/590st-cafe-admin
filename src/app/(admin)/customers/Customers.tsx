"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Customers() {
  return (
    <PageShell>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Customers" }]}
      />
      <EmptyState title="Customers" description="Manage your customers here" />
    </PageShell>
  );
}

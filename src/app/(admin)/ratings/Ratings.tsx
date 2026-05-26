"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Ratings() {
  return (
    <PageShell>
      <PageHeader
        title="Ratings"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Ratings" }]}
      />
      <EmptyState title="Ratings" description="View customer ratings here" />
    </PageShell>
  );
}

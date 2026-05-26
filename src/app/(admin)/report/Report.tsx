"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Report() {
  return (
    <PageShell>
      <PageHeader
        title="Report"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Report" }]}
      />
      <EmptyState title="Report" description="View reports and analytics here" />
    </PageShell>
  );
}

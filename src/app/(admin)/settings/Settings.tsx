"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Settings() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
      />
      <EmptyState title="Settings" description="Configure your settings here" />
    </PageShell>
  );
}

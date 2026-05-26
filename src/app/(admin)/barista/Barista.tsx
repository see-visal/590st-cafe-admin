"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { EmptyState } from "@/components/cafe/EmptyState";

export default function Barista() {
  return (
    <PageShell>
      <PageHeader
        title="Barista"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Barista" }]}
      />
      <EmptyState title="Barista" description="Manage barista staff here" />
    </PageShell>
  );
}

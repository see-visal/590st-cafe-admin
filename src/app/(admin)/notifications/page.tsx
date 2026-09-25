"use client";
import { useEffect } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions } from "@/components/common/AdminKit";
import { OperationalAlertsContent, useOperationalAlerts } from "@/components/common/OperationalAlerts";
import { ContactInbox } from "@/features/notification/ContactInbox";

export default function Page() {
  const alerts = useOperationalAlerts();
  // Reading the full list is the same as opening the panel: nothing here is unseen afterwards.
  const { markSeen, count } = alerts;
  useEffect(() => {
    if (count !== undefined) markSeen();
  }, [count, markSeen]);
  return <PageShell>
    <PageHeader title="Current alerts" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Current alerts" }]} rightSlot={<AdminTopActions />} />
    <OperationalAlertsContent alerts={alerts} />
    <ContactInbox />
  </PageShell>;
}

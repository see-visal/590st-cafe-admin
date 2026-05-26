"use client";

import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { CardGrid } from "@/components/cafe/CardGrid";
import { StatCard } from "@/components/cafe/StatCard";
import { TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Home", href: "/" }]}
      />
      
      <CardGrid>
        <StatCard
          title="Total Orders"
          value="1,234"
          accent="blue"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Total Revenue"
          value="$45,678"
          accent="green"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Total Customers"
          value="567"
          accent="orange"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Active Products"
          value="89"
          accent="red"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </CardGrid>
    </PageShell>
  );
}

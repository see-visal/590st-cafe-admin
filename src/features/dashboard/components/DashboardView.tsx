"use client";

import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, StatTile } from "@/components/common/AdminKit";
import { Check, Circle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const sales = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 112 },
  { day: "Wed", value: 156 },
  { day: "Thu", value: 102 },
  { day: "Fri", value: 206 },
  { day: "Sat", value: 216 },
  { day: "Sun", value: 145 },
];

export default function DashboardView() {
  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Home", href: "/" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Order Today" value="1,000" tone="green" />
        <StatTile title="Waiting Payment" value="2" tone="yellow" />
        <StatTile title="Drinks In Prep" value="41" tone="orange" />
        <StatTile title="Low Stock Items" value="6" tone="red" />
      </div>

      <section className="grid grid-cols-1 gap-6 rounded-lg bg-white p-5 shadow-sm xl:grid-cols-2">
        <div>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Daily Sale</h2>
              <p className="mt-2 text-sm text-gray-400">
                Metric showcasing shop sales per day for the last 7 days
              </p>
            </div>
            <button className="h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold">
              7 Days
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[0, 300]} />
                <Tooltip cursor={{ fill: "rgba(190, 254, 53, 0.08)" }} />
                <Bar dataKey="value" fill="#befe35" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="h-3 w-3 rounded bg-[#befe35]" />
            2026
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Daily Sale</h2>
              <p className="mt-2 text-sm text-gray-400">
                Metrics will show you after you make any sale
              </p>
            </div>
            <button className="h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold">
              7 Days
            </button>
          </div>
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.map((item) => ({ ...item, value: 0 }))}>
                <CartesianGrid stroke="#e8e8e8" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[0, 300]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-lg font-semibold">No metrics yet</p>
                <p className="mt-2 text-sm text-gray-400">
                  Metrics will show after you make a sale
                </p>
                <button className="mt-5 rounded-md bg-[#befe35] px-4 py-2 text-sm font-semibold">
                  Make Order
                </button>
                <p className="mt-4 text-sm text-gray-400">Learn more</p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="h-3 w-3 rounded bg-[#befe35]" />
            2026
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Now Preparing</h2>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-md bg-gray-200" />
            ))}
          </div>
        </section>
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Onboarding Guide</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#befe35]">
                <Check className="h-5 w-5" />
              </span>
              <span className="font-medium">Step 1</span>
            </div>
            <div className="flex items-center gap-4 rounded-md bg-indigo-600 px-4 py-3 text-white">
              <Circle className="h-5 w-5 fill-[#befe35] text-[#befe35]" />
              <span className="font-medium">Step 2</span>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

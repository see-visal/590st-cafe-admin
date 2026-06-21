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
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Home", href: "/" }]} rightSlot={<AdminTopActions />} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Order Today" value="1,000" tone="green" />
        <StatTile title="Waiting Payment" value="2" tone="yellow" />
        <StatTile title="Drinks In Prep" value="41" tone="orange" />
        <StatTile title="Low Stock Items" value="6" tone="red" />
      </div>

    {/* Outer structural layout wrapper uses Tailwind Grid */}
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="chart_card">
        <div className="section_header">
          <div className="header_text_group">
            <h2 className="header_title">Daily Sale</h2>
            <p className="header_subtitle">
              Metric showcasing shop sales per day for the last 7 days
            </p>
          </div>
          <button className="header_filter_btn">
            7 Days
          </button>
        </div>
        
        <div className="chart_container">
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

        <div className="chart_legend">
          <span className="legend_badge" />
          2026
        </div>
      </div>

      {/* Place your next 50% width component right here */}
    </section>
    </PageShell>
  );
}

{/* <div className="chart_empty_overlay">
              <div className="chart_empty_content">
                <p className="empty_title">No metrics yet</p>
                <p className="empty_subtitle">
                  Metrics will show after you make a sale
                </p>
                <button className="empty_action_btn">
                  Make Order
                </button>
                <p className="empty_link">Learn more</p>
              </div>
            </div> */}

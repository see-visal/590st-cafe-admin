"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { AdminTopActions, StatTile } from "@/components/shared/admin-kit";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";
import { STATIC_INVENTORY_ROWS } from "@/features/inventory/constants/inventory.mock";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  Coffee,
  PackagePlus,
  ReceiptText,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FLOW_ICON = "grid size-9 place-items-center rounded-lg [&_svg]:size-[17px]";
const FLOW_ICON_TONE: Record<string, string> = {
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  success: "bg-green-100 text-green-700",
};

const ORDER_STATUS =
  "inline-flex min-w-[72px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold";
const ORDER_STATUS_TONE: Record<string, string> = {
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
};

const PANEL =
  "min-w-0 rounded-lg bg-white p-5 shadow-[0px_19px_38px_0px_rgba(32,33,36,0.04)]";
const PANEL_HEADER = "mb-5 flex items-start justify-between gap-4";
const PANEL_H2 = "text-[length:var(--text-section-title)] font-semibold leading-[1.3] text-[#1E1E1E]";
const PANEL_SUB = "mt-1 text-sm leading-normal text-[#777777]";
const PANEL_LINK =
  "inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#333333] hover:text-black [&_svg]:size-3.5 [&_svg]:text-[#b1ed2f]";

const sales = [
  { day: "Mon", revenue: 620, orders: 41 },
  { day: "Tue", revenue: 1120, orders: 68 },
  { day: "Wed", revenue: 1560, orders: 89 },
  { day: "Thu", revenue: 1020, orders: 64 },
  { day: "Fri", revenue: 2060, orders: 118 },
  { day: "Sat", revenue: 2160, orders: 126 },
  { day: "Sun", revenue: 1450, orders: 87 },
];

const paymentMix = [
  { name: "Cash", value: 46, color: "#befe35" },
  { name: "Digital", value: 39, color: "#111111" },
  { name: "Card", value: 15, color: "#9ca3af" },
];

const orderFlow = [
  { label: "Waiting payment", value: 2, icon: Clock3, tone: "warning" },
  { label: "Confirmed", value: 8, icon: ReceiptText, tone: "info" },
  { label: "In preparation", value: 4, icon: Coffee, tone: "orange" },
  { label: "Ready to serve", value: 3, icon: CheckCircle2, tone: "success" },
] as const;

const topProducts = [
  { name: "Caffe Latte", category: "Coffee", orders: 86, revenue: "$430.00" },
  { name: "Matcha Green Tea", category: "Tea", orders: 64, revenue: "$320.00" },
  { name: "Butter Croissant", category: "Pastry", orders: 52, revenue: "$182.00" },
];

const recentOrders = [
  { id: "#57CB59E0", customer: "Visal Soeurn", total: "$15.00", status: "Preparing" },
  { id: "#2F494045", customer: "Walk-in", total: "$8.50", status: "Ready" },
  { id: "#8A31C902", customer: "Delivery · Toul Kork", total: "$22.00", status: "Confirmed" },
];

function currency(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardView() {
  const { summary } = useDashboardSummary();
  const lowStockItems = STATIC_INVENTORY_ROWS.filter(
    (item) => item.status === "Low Stock"
  );
  const dailySales = summary?.dailySales ?? 1_245;
  const totalOrders = summary?.totalOrders ?? 87;
  const customers = summary?.totalCustomers ?? 42;
  const lowStockCount = summary?.lowStockAlerts ?? lowStockItems.length;

  return (
    <PageShell>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Home", href: "/" }]} rightSlot={<AdminTopActions />} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Revenue Today" value={currency(dailySales)} hint="+12.4% from yesterday" tone="green" />
        <StatTile title="Orders Today" value={String(totalOrders)} hint="Peak hour: 11 AM–1 PM" tone="gray" />
        <StatTile title="Customers Today" value={String(customers)} hint="18 returning customers" tone="gray" />
        <StatTile title="Low Stock Items" value={String(lowStockCount)} hint="Needs attention today" tone="red" />
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <div className="chart_card min-w-0 [&_.section_header]:items-start">
          <div className="section_header">
            <div className="header_text_group">
              <h2 className="header_title">Sales Performance</h2>
              <p className="header_subtitle">
                Revenue and order volume for the last 7 days
              </p>
            </div>
            <Link href="/reports" className="header_filter_btn inline-flex items-center gap-2 no-underline [&_svg]:size-[15px] [&_svg]:text-[#78a516]">
              View Report
              <ArrowRight />
            </Link>
          </div>

          <div className="mb-2 flex flex-wrap gap-6 [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&_span]:text-sm [&_span]:text-[#777777] [&_strong]:text-base [&_strong]:font-bold [&_strong]:text-[#1E1E1E]">
            <div>
              <span>7-day revenue</span>
              <strong>$9,990.00</strong>
            </div>
            <div>
              <span>Average daily orders</span>
              <strong>85</strong>
            </div>
          </div>

          <div className="chart_container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales} margin={{ left: -12, right: 8, top: 12 }}>
                <CartesianGrid stroke="#e8e8e8" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "rgba(190, 254, 53, 0.08)" }}
                  formatter={(value, name) => [
                    name === "revenue" ? currency(Number(value)) : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Bar dataKey="revenue" fill="#befe35" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart_legend">
            <span className="legend_badge" />
            Revenue · USD
          </div>
        </div>

        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Order Flow</h2>
              <p className={PANEL_SUB}>Live operational workload</p>
            </div>
            <Link href="/barista-queue" className={PANEL_LINK}>Open Queue <ArrowRight /></Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {orderFlow.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#EDEDED] bg-[#FAFAFA] px-3 py-2.5 [&_strong]:text-base [&_strong]:text-[#1E1E1E]">
                <span className={cn(FLOW_ICON, FLOW_ICON_TONE[tone])}><Icon /></span>
                <span className="text-sm font-medium text-[#333333]">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#EDEDED] pt-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&_span]:text-sm [&_span]:text-[#777777] [&_strong]:text-base [&_strong]:text-[#1E1E1E]">
            <div>
              <span>Avg. preparation</span>
              <strong>8m 24s</strong>
            </div>
            <div>
              <span>Served today</span>
              <strong>73</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Payment Mix</h2>
              <p className={PANEL_SUB}>Today&apos;s settled revenue</p>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-3 min-[421px]:grid-cols-[150px_minmax(0,1fr)]">
            <div className="relative h-[156px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMix} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={3}>
                    {paymentMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center [&_strong]:text-base [&_strong]:text-[#1E1E1E] [&_span]:mt-0.5 [&_span]:text-sm [&_span]:text-[#777777]">
                <strong>$1.2K</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-3 [&_strong]:text-[length:var(--text-body-sm)] [&_strong]:text-[#1E1E1E]">
              {paymentMix.map((item) => (
                <div key={item.name}>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-500 [&_i]:block [&_i]:size-[9px] [&_i]:rounded-[3px]">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Top Products</h2>
              <p className={PANEL_SUB}>Best sellers by order count</p>
            </div>
            <Link href="/products" className={PANEL_LINK}>All Products <ArrowRight /></Link>
          </div>
          <div className="flex flex-col">
            {topProducts.map((product, index) => (
              <div key={product.name} className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#EDEDED] py-3 last:border-b-0 [&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-[3px] [&>div_strong]:truncate [&>div_strong]:text-sm [&>div_strong]:text-[#1E1E1E] [&>div_span]:text-xs [&>div_span]:text-[#777777] [&>b]:text-sm [&>b]:text-green-700">
                <span className="grid size-7 place-items-center rounded-[7px] bg-[#111111] text-xs font-bold text-[#befe35]">{index + 1}</span>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} · {product.orders} orders</span>
                </div>
                <b>{product.revenue}</b>
              </div>
            ))}
          </div>
        </div>

        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Needs Attention</h2>
              <p className={PANEL_SUB}>Issues that can affect service</p>
            </div>
            <span className="grid h-7 min-w-7 place-items-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-600">{lowStockItems.length}</span>
          </div>
          <div className="flex flex-col gap-2 [&>a]:grid [&>a]:grid-cols-[36px_minmax(0,1fr)_16px] [&>a]:items-center [&>a]:gap-2.5 [&>a]:rounded-lg [&>a]:border [&>a]:border-red-100 [&>a]:bg-[#fffafa] [&>a]:px-3 [&>a]:py-2.5 [&>a>span:nth-child(2)]:flex [&>a>span:nth-child(2)]:min-w-0 [&>a>span:nth-child(2)]:flex-col [&>a>span:nth-child(2)]:gap-[3px] [&_strong]:truncate [&_strong]:text-sm [&_strong]:text-[#1E1E1E] [&_small]:text-xs [&_small]:text-gray-500 [&>a>svg]:size-3.5 [&>a>svg]:text-gray-400">
            {lowStockItems.map((item) => (
              <Link key={item.id} href={`/inventory/${item.productId}`}>
                <span className="grid size-[34px] place-items-center rounded-lg bg-red-100 text-red-600 [&_svg]:size-4"><AlertTriangle /></span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.stock} {item.unit} left · Reorder at {item.reorderLevel}</small>
                </span>
                <ArrowRight />
              </Link>
            ))}
          </div>
          <Link href="/inventory" className="mt-3.5 inline-flex items-center gap-[7px] text-sm font-semibold text-[#1E1E1E] [&_svg]:size-3.5 [&_svg]:text-[#b1ed2f]">
            Review Inventory <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Recent Orders</h2>
              <p className={PANEL_SUB}>Latest activity across all channels</p>
            </div>
            <Link href="/orders" className={PANEL_LINK}>View Orders <ArrowRight /></Link>
          </div>
          <div className="flex flex-col">
            {recentOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#EDEDED] py-3 last:border-b-0 sm:grid-cols-[38px_minmax(0,1fr)_auto_auto] [&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:gap-[3px] [&>div_strong]:text-sm [&>div_strong]:text-[#1E1E1E] [&>div_span]:truncate [&>div_span]:text-xs [&>div_span]:text-[#777777] [&>b]:text-sm [&>b]:text-[#1E1E1E]">
                <span className="grid size-9 place-items-center rounded-lg bg-[#F4F4F4] text-[#1E1E1E] [&_svg]:size-[17px]"><ShoppingBag /></span>
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <b>{order.total}</b>
                <span className={cn(ORDER_STATUS, ORDER_STATUS_TONE[order.status.toLowerCase()])}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={PANEL}>
          <div className={PANEL_HEADER}>
            <div>
              <h2 className={PANEL_H2}>Quick Access</h2>
              <p className={PANEL_SUB}>Common admin tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 [&>a]:flex [&>a]:min-h-[86px] [&>a]:flex-col [&>a]:items-start [&>a]:justify-between [&>a]:rounded-lg [&>a]:border [&>a]:border-[#EDEDED] [&>a]:bg-[#FAFAFA] [&>a]:p-3 [&>a]:transition-all [&>a:hover]:-translate-y-px [&>a:hover]:border-[#befe35] [&>a:hover]:bg-[#fbfff2] [&_svg]:size-[19px] [&_svg]:text-[#78a516] [&_span]:text-sm [&_span]:font-semibold [&_span]:text-[#1E1E1E]">
            <Link href="/orders"><ReceiptText /><span>Review Orders</span></Link>
            <Link href="/inventory"><PackagePlus /><span>Adjust Stock</span></Link>
            <Link href="/promotions"><BadgePercent /><span>Create Promotion</span></Link>
            <Link href="/customers"><UsersRound /><span>Customers</span></Link>
            <Link href="/reports"><Banknote /><span>Settlement</span></Link>
            <Link href="/products"><Boxes /><span>Manage Menu</span></Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

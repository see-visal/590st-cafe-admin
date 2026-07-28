"use client";

import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, StatTile } from "@/components/common/AdminKit";
import { useDashboardSummary } from "@/hooks/useAdmin";
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

      <section className="dashboard_primary_grid">
        <div className="chart_card dashboard_sales_card">
          <div className="section_header">
            <div className="header_text_group">
              <h2 className="header_title">Sales Performance</h2>
              <p className="header_subtitle">
                Revenue and order volume for the last 7 days
              </p>
            </div>
            <Link href="/reports" className="header_filter_btn dashboard_header_link">
              View Report
              <ArrowRight />
            </Link>
          </div>

          <div className="dashboard_chart_totals">
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

        <div className="dashboard_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Order Flow</h2>
              <p>Live operational workload</p>
            </div>
            <Link href="/barista-queue">Open Queue <ArrowRight /></Link>
          </div>
          <div className="dashboard_flow_list">
            {orderFlow.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="dashboard_flow_item">
                <span className={`dashboard_flow_icon is_${tone}`}><Icon /></span>
                <span className="dashboard_flow_label">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="dashboard_flow_summary">
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

      <section className="dashboard_business_grid">
        <div className="dashboard_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Payment Mix</h2>
              <p>Today&apos;s settled revenue</p>
            </div>
          </div>
          <div className="dashboard_payment_content">
            <div className="dashboard_donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMix} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={3}>
                    {paymentMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dashboard_donut_center">
                <strong>$1.2K</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="dashboard_payment_legend">
              {paymentMix.map((item) => (
                <div key={item.name}>
                  <span className="dashboard_payment_name">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Top Products</h2>
              <p>Best sellers by order count</p>
            </div>
            <Link href="/products">All Products <ArrowRight /></Link>
          </div>
          <div className="dashboard_rank_list">
            {topProducts.map((product, index) => (
              <div key={product.name} className="dashboard_rank_item">
                <span className="dashboard_rank_number">{index + 1}</span>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} · {product.orders} orders</span>
                </div>
                <b>{product.revenue}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard_panel dashboard_attention_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Needs Attention</h2>
              <p>Issues that can affect service</p>
            </div>
            <span className="dashboard_attention_count">{lowStockItems.length}</span>
          </div>
          <div className="dashboard_attention_list">
            {lowStockItems.map((item) => (
              <Link key={item.id} href={`/inventory/${item.productId}`}>
                <span className="dashboard_attention_icon"><AlertTriangle /></span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.stock} {item.unit} left · Reorder at {item.reorderLevel}</small>
                </span>
                <ArrowRight />
              </Link>
            ))}
          </div>
          <Link href="/inventory" className="dashboard_panel_footer_link">
            Review Inventory <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="dashboard_bottom_grid">
        <div className="dashboard_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest activity across all channels</p>
            </div>
            <Link href="/orders">View Orders <ArrowRight /></Link>
          </div>
          <div className="dashboard_recent_orders">
            {recentOrders.map((order) => (
              <div key={order.id} className="dashboard_recent_order">
                <span className="dashboard_order_icon"><ShoppingBag /></span>
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <b>{order.total}</b>
                <span className={`dashboard_order_status is_${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard_panel">
          <div className="dashboard_panel_header">
            <div>
              <h2>Quick Access</h2>
              <p>Common admin tasks</p>
            </div>
          </div>
          <div className="dashboard_quick_grid">
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

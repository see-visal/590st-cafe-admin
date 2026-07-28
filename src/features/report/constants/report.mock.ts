export type SettlementStatus = "Pending" | "Settled" | "Discrepancy";

export type SettlementRow = {
  id: string;
  date: string;
  grossRevenue: number;
  discounts: number;
  refunds: number;
  netRevenue: number;
  cash: number;
  digital: number;
  orders: number;
  avgOrder: number;
  settledBy: string;
  status: SettlementStatus;
};

export const SETTLEMENT_SUMMARY = {
  grossRevenue: 0,
  cashRevenue: 0,
  digitalRevenue: 0,
  netRevenue: 0,
  settleOrders: 0,
};

export const SETTLEMENT_HISTORY: SettlementRow[] = [
  {
    id: "1",
    date: "22-Jan-2025",
    grossRevenue: 4850,
    discounts: 385,
    refunds: 65,
    netRevenue: 4400,
    cash: 2200,
    digital: 2200,
    orders: 58,
    avgOrder: 75.86,
    settledBy: "Ream Chan",
    status: "Settled",
  },
  {
    id: "2",
    date: "21-Jan-2025",
    grossRevenue: 3920,
    discounts: 210,
    refunds: 40,
    netRevenue: 3670,
    cash: 1840,
    digital: 1830,
    orders: 49,
    avgOrder: 74.9,
    settledBy: "Visal Soeurn",
    status: "Settled",
  },
  {
    id: "3",
    date: "20-Jan-2025",
    grossRevenue: 5100,
    discounts: 420,
    refunds: 120,
    netRevenue: 4560,
    cash: 2500,
    digital: 2060,
    orders: 62,
    avgOrder: 73.55,
    settledBy: "Ream Chan",
    status: "Discrepancy",
  },
  {
    id: "4",
    date: "19-Jan-2025",
    grossRevenue: 3650,
    discounts: 180,
    refunds: 0,
    netRevenue: 3470,
    cash: 1700,
    digital: 1770,
    orders: 44,
    avgOrder: 78.86,
    settledBy: "System",
    status: "Pending",
  },
  {
    id: "5",
    date: "18-Jan-2025",
    grossRevenue: 4280,
    discounts: 260,
    refunds: 55,
    netRevenue: 3965,
    cash: 2100,
    digital: 1865,
    orders: 53,
    avgOrder: 74.81,
    settledBy: "Ream Chan",
    status: "Settled",
  },
  {
    id: "6",
    date: "17-Jan-2025",
    grossRevenue: 3010,
    discounts: 150,
    refunds: 25,
    netRevenue: 2835,
    cash: 1400,
    digital: 1435,
    orders: 38,
    avgOrder: 74.61,
    settledBy: "Visal Soeurn",
    status: "Settled",
  },
  {
    id: "7",
    date: "16-Jan-2025",
    grossRevenue: 2760,
    discounts: 120,
    refunds: 30,
    netRevenue: 2610,
    cash: 1300,
    digital: 1310,
    orders: 35,
    avgOrder: 74.57,
    settledBy: "System",
    status: "Pending",
  },
];

export function formatUsd(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

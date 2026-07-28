export type PointProgramStatus = "Active" | "Paused";
export type PointRewardScope = "All Drinks" | "Selected Categories";
export type PointRewardStatus = "Collecting" | "Ready" | "Redeemed";
export type PointHistoryType = "Earned" | "Redeemed" | "Adjusted" | "Expired";

export type PointProgramConfig = {
  stampsRequired: number;
  rewardTitle: string;
  rewardScope: PointRewardScope;
  eligibleCategories: string[];
  resetAfterRedeem: boolean;
  status: PointProgramStatus;
  terms: string;
};

export type PointHistoryRow = {
  id: string;
  type: PointHistoryType;
  date: string;
  description: string;
  staff: string;
  stampChange: string;
};

export type PointCardRow = {
  id: string;
  cardNo: string;
  customerName: string;
  phone: string;
  email: string;
  currentStamps: number;
  lifetimeStamps: number;
  lifetimeRedemptions: number;
  rewardStatus: PointRewardStatus;
  lastActivity: string;
  joinedDate: string;
  history: PointHistoryRow[];
};

export const DEFAULT_POINT_PROGRAM: PointProgramConfig = {
  stampsRequired: 5,
  rewardTitle: "1 Free Drink of Choice",
  rewardScope: "All Drinks",
  eligibleCategories: ["Drinks"],
  resetAfterRedeem: true,
  status: "Active",
  terms: "One stamp per qualifying drink purchase. Reward must be redeemed within 30 days once ready.",
};

export const POINT_SUMMARY = {
  activeCards: 128,
  readyToRedeem: 14,
  redeemedThisMonth: 36,
  stampsIssuedToday: 42,
};

export const STATIC_POINT_ROWS: PointCardRow[] = [
  {
    id: "pc1",
    cardNo: "SC-1024",
    customerName: "Sreymom Chan",
    phone: "+855 12 345 678",
    email: "sreymom@email.com",
    currentStamps: 4,
    lifetimeStamps: 19,
    lifetimeRedemptions: 3,
    rewardStatus: "Collecting",
    lastActivity: "22-Jan-2025 14:10",
    joinedDate: "12-Aug-2024",
    history: [
      {
        id: "h1",
        type: "Earned",
        date: "22-Jan-2025 14:10",
        description: "Stamp added from order #ORD-1042 (Iced Latte)",
        staff: "Sok Rath",
        stampChange: "+1",
      },
      {
        id: "h2",
        type: "Earned",
        date: "20-Jan-2025 09:42",
        description: "Stamp added from order #ORD-1038 (Matcha Latte)",
        staff: "Sok Rath",
        stampChange: "+1",
      },
    ],
  },
  {
    id: "pc2",
    cardNo: "SC-1023",
    customerName: "Vannak Lim",
    phone: "+855 98 765 432",
    email: "vannak.lim@email.com",
    currentStamps: 5,
    lifetimeStamps: 25,
    lifetimeRedemptions: 4,
    rewardStatus: "Ready",
    lastActivity: "22-Jan-2025 13:55",
    joinedDate: "03-Jun-2024",
    history: [
      {
        id: "h3",
        type: "Earned",
        date: "22-Jan-2025 13:55",
        description: "Stamp added from order #ORD-1040 (Americano)",
        staff: "POS Terminal 02",
        stampChange: "+1",
      },
    ],
  },
  {
    id: "pc3",
    cardNo: "SC-1022",
    customerName: "Dara Sok",
    phone: "+855 77 112 233",
    email: "dara.sok@email.com",
    currentStamps: 0,
    lifetimeStamps: 15,
    lifetimeRedemptions: 3,
    rewardStatus: "Redeemed",
    lastActivity: "21-Jan-2025 18:20",
    joinedDate: "15-Sep-2024",
    history: [
      {
        id: "h4",
        type: "Redeemed",
        date: "21-Jan-2025 18:20",
        description: "Redeemed free drink reward (Caramel Macchiato)",
        staff: "Ream Chan",
        stampChange: "-5",
      },
    ],
  },
  {
    id: "pc4",
    cardNo: "SC-1021",
    customerName: "Pich Sophea",
    phone: "+855 15 889 900",
    email: "pich.sophea@email.com",
    currentStamps: 2,
    lifetimeStamps: 8,
    lifetimeRedemptions: 1,
    rewardStatus: "Collecting",
    lastActivity: "21-Jan-2025 11:05",
    joinedDate: "02-Nov-2024",
    history: [
      {
        id: "h5",
        type: "Earned",
        date: "21-Jan-2025 11:05",
        description: "Stamp added from order #ORD-1031 (Hot Chocolate)",
        staff: "Sok Rath",
        stampChange: "+1",
      },
    ],
  },
  {
    id: "pc5",
    cardNo: "SC-1020",
    customerName: "Ream Chan",
    phone: "+855 92 334 556",
    email: "ream.chan@email.com",
    currentStamps: 5,
    lifetimeStamps: 30,
    lifetimeRedemptions: 5,
    rewardStatus: "Ready",
    lastActivity: "20-Jan-2025 16:48",
    joinedDate: "10-Jan-2024",
    history: [
      {
        id: "h6",
        type: "Adjusted",
        date: "19-Jan-2025 10:12",
        description: "Manual stamp correction by admin",
        staff: "Admin Shop",
        stampChange: "+1",
      },
    ],
  },
  {
    id: "pc6",
    cardNo: "SC-1019",
    customerName: "Heng Molika",
    phone: "+855 88 667 788",
    email: "molika@email.com",
    currentStamps: 1,
    lifetimeStamps: 6,
    lifetimeRedemptions: 1,
    rewardStatus: "Collecting",
    lastActivity: "19-Jan-2025 08:33",
    joinedDate: "28-Dec-2024",
    history: [
      {
        id: "h7",
        type: "Earned",
        date: "19-Jan-2025 08:33",
        description: "Stamp added from order #ORD-1024 (Cappuccino)",
        staff: "POS Terminal 01",
        stampChange: "+1",
      },
    ],
  },
];

export const POINT_TOTAL_COUNT = 128;

export function getRewardStatus(
  currentStamps: number,
  stampsRequired: number,
  explicit?: PointRewardStatus
): PointRewardStatus {
  if (explicit === "Redeemed" && currentStamps === 0) {
    return "Redeemed";
  }
  if (currentStamps >= stampsRequired) {
    return "Ready";
  }
  return "Collecting";
}

export function formatProgramRule(config: PointProgramConfig) {
  return `Collect ${config.stampsRequired} stamps to earn ${config.rewardTitle.toLowerCase()}.`;
}

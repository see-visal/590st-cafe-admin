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

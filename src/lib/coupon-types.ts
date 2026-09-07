export type Coupon = {
  id: string;
  code: string;
  label: string;
  percent: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
};
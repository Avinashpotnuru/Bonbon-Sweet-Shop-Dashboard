export type CustomerStatus = "Active" | "VIP" | "Inactive";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status: CustomerStatus;
  totalSpent: number;
  ordersCount: number;
  joinedAt: string;
};

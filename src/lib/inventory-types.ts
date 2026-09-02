export type StockLevel = "in" | "low" | "out";

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  level: StockLevel;
};

export type InventorySummary = {
  productCount: number;
  totalUnits: number;
  totalValue: number;
  lowCount: number;
  outCount: number;
};

export type StockMovementItem = {
  id: string;
  sku: string;
  productName: string;
  type: "in" | "out";
  change: number;
  notes?: string;
  createdAt: string;
};

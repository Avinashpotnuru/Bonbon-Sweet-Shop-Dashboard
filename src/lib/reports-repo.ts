import "server-only";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import type { OrderDoc } from "@/lib/orders-repo";
import type { CustomerDoc } from "@/lib/customers-repo";
import type { ExpenseDoc } from "@/lib/expenses-repo";
import { ORDER_STATUSES } from "@/lib/order-schemas";
import { EXPENSE_CATEGORIES } from "@/lib/expense-schemas";

type Metrics = {
  revenue: number;
  orders: number;
  avgOrderValue: number;
  expenses: number;
  netProfit: number;
  customers: number;
  activeCustomers: number;
  vips: number;
  products: number;
  lowStock: number;
  outOfStock: number;
};

export type TrendPoint = { label: string; revenue: number; orders: number };
export type GroupTotal = { name: string; value: number; count: number };
export type TopCustomer = { name: string; totalSpent: number; ordersCount: number };
export type LowStockProduct = { name: string; sku: string; stock: number; status: string };

export type ReportsPayload = {
  metrics: Metrics;
  revenueTrend: TrendPoint[];
  salesByStatus: GroupTotal[];
  topCustomers: TopCustomer[];
  expensesByCategory: GroupTotal[];
  lowStockProducts: LowStockProduct[];
};

type OrderStatus = (typeof ORDER_STATUSES)[number];
type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export async function getReports(): Promise<ReportsPayload> {
  const db = getDb();

  const [orders, customers, expenses, products] = await Promise.all([
    db.collection<OrderDoc>(COLLECTIONS.orders).find({}).toArray(),
    db.collection<CustomerDoc>(COLLECTIONS.customers).find({}).toArray(),
    db.collection<ExpenseDoc>(COLLECTIONS.expenses).find({}).toArray(),
    db
      .collection(COLLECTIONS.products)
      .find({}, { projection: { name: 1, sku: 1, stock: 1, status: 1 } })
      .toArray(),
  ]);

  const cancelled: OrderStatus = "Cancelled";
  const sellableOrders = orders.filter((o) => o.status !== cancelled);
  const revenue = sellableOrders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const metrics: Metrics = {
    revenue,
    orders: sellableOrders.length,
    avgOrderValue: sellableOrders.length ? revenue / sellableOrders.length : 0,
    expenses: totalExpenses,
    netProfit: revenue - totalExpenses,
    customers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    vips: customers.filter((c) => c.status === "VIP").length,
    products: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const trendMap = new Map<string, TrendPoint>();
  for (const o of sellableOrders) {
    const key = `${o.placedAt.getUTCFullYear()}-${String(o.placedAt.getUTCMonth() + 1).padStart(2, "0")}`;
    const point = trendMap.get(key) ?? { label: key, revenue: 0, orders: 0 };
    point.revenue += o.total;
    point.orders += 1;
    trendMap.set(key, point);
  }
  const revenueTrend = [...trendMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const statusMap = new Map<OrderStatus, GroupTotal>();
  for (const o of orders) {
    const entry = statusMap.get(o.status) ?? { name: o.status, value: 0, count: 0 };
    entry.value += o.total;
    entry.count += 1;
    statusMap.set(o.status, entry);
  }
  const salesByStatus = [...statusMap.values()];

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((c) => ({ name: c.name, totalSpent: c.totalSpent, ordersCount: c.ordersCount }));

  const categoryMap = new Map<ExpenseCategory, GroupTotal>();
  for (const e of expenses) {
    const entry = categoryMap.get(e.category) ?? {
      name: e.category,
      value: 0,
      count: 0,
    };
    entry.value += e.amount;
    entry.count += 1;
    categoryMap.set(e.category, entry);
  }
  const expensesByCategory = [...categoryMap.values()].sort((a, b) => b.value - a.value);

  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((p) => ({
      name: p.name as string,
      sku: p.sku as string,
      stock: p.stock as number,
      status: p.status as string,
    }));

  return {
    metrics,
    revenueTrend,
    salesByStatus,
    topCustomers,
    expensesByCategory,
    lowStockProducts,
  };
}

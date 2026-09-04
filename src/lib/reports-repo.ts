import "server-only";

import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { ORDER_STATUSES } from "@/lib/order-schemas";

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

export async function getReports(): Promise<ReportsPayload> {
  const db = getDb();

  const cancelled: OrderStatus = "Cancelled";

  const [
    sellable,
    trendDocs,
    statusDocs,
    expenseTotal,
    expenseGroup,
    customerCount,
    activeCount,
    vipCount,
    topCustomers,
    productCount,
    lowStockCount,
    outOfStockCount,
    lowStockProducts,
  ] = await Promise.all([
    db
      .collection(COLLECTIONS.orders)
      .aggregate<{ revenue: number; orders: number }>([
        { $match: { status: { $ne: cancelled } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection(COLLECTIONS.orders)
      .aggregate<TrendPoint & { _id: string }>([
        { $match: { status: { $ne: cancelled } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$placedAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    db
      .collection(COLLECTIONS.orders)
      .aggregate<GroupTotal & { _id: OrderStatus }>([
        { $group: { _id: "$status", value: { $sum: "$total" }, count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection(COLLECTIONS.expenses)
      .aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    db
      .collection(COLLECTIONS.expenses)
      .aggregate<GroupTotal & { _id: string }>([
        { $group: { _id: "$category", value: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ])
      .toArray(),
    db.collection(COLLECTIONS.customers).countDocuments(),
    db.collection(COLLECTIONS.customers).countDocuments({ status: "Active" }),
    db.collection(COLLECTIONS.customers).countDocuments({ status: "VIP" }),
    db
      .collection(COLLECTIONS.customers)
      .aggregate<TopCustomer & { _id: unknown }>([
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: 1, totalSpent: 1, ordersCount: 1 } },
      ])
      .toArray(),
    db.collection(COLLECTIONS.products).countDocuments(),
    db
      .collection(COLLECTIONS.products)
      .countDocuments({ stock: { $gt: 0, $lte: 10 } }),
    db.collection(COLLECTIONS.products).countDocuments({ stock: 0 }),
    db
      .collection(COLLECTIONS.products)
      .aggregate<LowStockProduct & { _id: unknown }>([
        { $match: { stock: { $gt: 0, $lte: 10 } } },
        { $sort: { stock: 1 } },
        { $limit: 8 },
        { $project: { _id: 0, name: 1, sku: 1, stock: 1, status: 1 } },
      ])
      .toArray(),
  ]);

  const revenue = sellable[0]?.revenue ?? 0;
  const orderTotal = sellable[0]?.orders ?? 0;
  const totalExpenses = expenseTotal[0]?.total ?? 0;

  const metrics: Metrics = {
    revenue,
    orders: orderTotal,
    avgOrderValue: orderTotal ? revenue / orderTotal : 0,
    expenses: totalExpenses,
    netProfit: revenue - totalExpenses,
    customers: customerCount,
    activeCustomers: activeCount,
    vips: vipCount,
    products: productCount,
    lowStock: lowStockCount,
    outOfStock: outOfStockCount,
  };

  const revenueTrend = trendDocs.map((d) => ({
    label: d._id,
    revenue: d.revenue,
    orders: d.orders,
  }));

  const salesByStatus = statusDocs.map((d) => ({
    name: d._id,
    value: d.value,
    count: d.count,
  }));

  const expensesByCategory = expenseGroup.map((d) => ({
    name: d._id,
    value: d.value,
    count: d.count,
  }));

  const topCustomersList = topCustomers.map((c) => ({
    name: c.name,
    totalSpent: c.totalSpent,
    ordersCount: c.ordersCount,
  }));

  const lowStockList = lowStockProducts.map((p) => ({
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    status: p.status,
  }));

  return {
    metrics,
    revenueTrend,
    salesByStatus,
    topCustomers: topCustomersList,
    expensesByCategory,
    lowStockProducts: lowStockList,
  };
}

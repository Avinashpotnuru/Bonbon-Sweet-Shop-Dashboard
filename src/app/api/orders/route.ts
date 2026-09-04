import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { orderCreateSchema, orderListSchema } from "@/lib/order-schemas";
import { createOrder, listOrders } from "@/lib/orders-repo";

export async function GET(request: Request) {
  try {
    await connectDb();
    const url = new URL(request.url);
    const parsed = orderListSchema.parse({
      search: url.searchParams.get("search") ?? "",
      status: url.searchParams.get("status") ?? "all",
      sortField: url.searchParams.get("sortField") ?? "placedAt",
      sortDirection: url.searchParams.get("sortDirection") ?? "desc",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "8",
    });
    const result = await listOrders(parsed);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["orders.create"]);
    await connectDb();
    const body = await request.json();
    const data = orderCreateSchema.parse(body);
    const order = await createOrder(data);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

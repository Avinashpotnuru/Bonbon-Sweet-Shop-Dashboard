import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { orderUpdateSchema } from "@/lib/order-schemas";
import { deleteOrder, updateOrder } from "@/lib/orders-repo";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["orders.update"]);
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = orderUpdateSchema.parse(body);
    const order = await updateOrder(id, data);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["orders.delete"]);
    await connectDb();
    const { id } = await params;
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { stockAdjustSchema } from "@/lib/inventory-schemas";
import { adjustStock } from "@/lib/inventory-repo";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = stockAdjustSchema.parse(body);
    const result = await adjustStock(id, {
      type: data.type,
      change: data.change,
      notes: data.notes,
    });
    if (!result) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

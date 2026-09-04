import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { inventoryListSchema } from "@/lib/inventory-schemas";
import { listInventory, listRecentMovements } from "@/lib/inventory-repo";

export async function GET(request: Request) {
  try {
    await requireApiAuth();
    await connectDb();
    const url = new URL(request.url);
    const parsed = inventoryListSchema.parse({
      search: url.searchParams.get("search") ?? "",
      level: url.searchParams.get("level") ?? "all",
      sortField: url.searchParams.get("sortField") ?? "name",
      sortDirection: url.searchParams.get("sortDirection") ?? "asc",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "8",
    });
    const includeMovements = url.searchParams.get("movements") === "true";
    const [result, movements] = await Promise.all([
      listInventory(parsed),
      includeMovements ? listRecentMovements(6) : Promise.resolve([]),
    ]);
    return NextResponse.json({ ...result, movements });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import {
  customerCreateSchema,
  customerListSchema,
} from "@/lib/customer-schemas";
import { createCustomer, listCustomers } from "@/lib/customers-repo";

export async function GET(request: Request) {
  try {
    await connectDb();
    const session = await requireApiAuth();
    requireApiPermission(session, ["customers.view"]);
    const url = new URL(request.url);
    const parsed = customerListSchema.parse({
      search: url.searchParams.get("search") ?? "",
      status: url.searchParams.get("status") ?? "all",
      sortField: url.searchParams.get("sortField") ?? "name",
      sortDirection: url.searchParams.get("sortDirection") ?? "asc",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "8",
    });
    const result = await listCustomers(parsed);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["customers.create"]);
    await connectDb();
    const body = await request.json();
    const data = customerCreateSchema.parse(body);
    const customer = await createCustomer(data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

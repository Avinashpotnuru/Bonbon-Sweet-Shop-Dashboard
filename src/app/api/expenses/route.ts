import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { expenseCreateSchema, expenseListSchema } from "@/lib/expense-schemas";
import { createExpense, listExpenses } from "@/lib/expenses-repo";

export async function GET(request: Request) {
  try {
    await connectDb();
    const url = new URL(request.url);
    const parsed = expenseListSchema.parse({
      search: url.searchParams.get("search") ?? "",
      category: url.searchParams.get("category") ?? "all",
      sortField: url.searchParams.get("sortField") ?? "date",
      sortDirection: url.searchParams.get("sortDirection") ?? "desc",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "8",
    });
    const result = await listExpenses(parsed);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();
    const body = await request.json();
    const data = expenseCreateSchema.parse(body);
    const expense = await createExpense(data);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

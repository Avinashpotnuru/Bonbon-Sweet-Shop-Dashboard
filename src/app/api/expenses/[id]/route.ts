import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { expenseUpdateSchema } from "@/lib/expense-schemas";
import { deleteExpense, updateExpense } from "@/lib/expenses-repo";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = expenseUpdateSchema.parse(body);
    const expense = await updateExpense(id, data);
    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const deleted = await deleteExpense(id);
    if (!deleted) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

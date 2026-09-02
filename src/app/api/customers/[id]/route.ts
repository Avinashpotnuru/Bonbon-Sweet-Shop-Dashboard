import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { customerUpdateSchema } from "@/lib/customer-schemas";
import { deleteCustomer, updateCustomer } from "@/lib/customers-repo";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = customerUpdateSchema.parse(body);
    const customer = await updateCustomer(id, data);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

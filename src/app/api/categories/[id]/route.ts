import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import {
  deleteCategory,
  updateCategory,
} from "@/lib/categories-repo";
import { connectDb } from "@/lib/mongodb";
import { categoryUpdateSchema } from "@/lib/category-schemas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);
    const category = await updateCategory(id, data);
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const result = await deleteCategory(id);
    if (result === "not-found") {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }
    if (result === "in-use") {
      return NextResponse.json(
        {
          error: "This category is in use by one or more products and cannot be deleted.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

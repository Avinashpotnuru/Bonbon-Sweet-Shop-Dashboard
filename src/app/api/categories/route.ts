import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { listCategories, createCategory } from "@/lib/categories-repo";
import { connectDb } from "@/lib/mongodb";
import {
  categoryCreateSchema,
  categoryListSchema,
} from "@/lib/category-schemas";

export async function GET(request: Request) {
  try {
    await connectDb();
    const url = new URL(request.url);
    const parsed = categoryListSchema.parse({
      search: url.searchParams.get("search") ?? "",
    });
    const categories = await listCategories(parsed.search);
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();
    const body = await request.json();
    const data = categoryCreateSchema.parse(body);
    const category = await createCategory(data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

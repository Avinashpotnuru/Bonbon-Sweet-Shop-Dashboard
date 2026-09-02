import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import {
  categoryExists,
} from "@/lib/categories-repo";
import { connectDb } from "@/lib/mongodb";
import { productCreateSchema, productListSchema } from "@/lib/product-schemas";
import { createProduct, fetchProducts, generateSku } from "@/lib/products-repo";

export async function GET(request: Request) {
  try {
    await connectDb();
    const url = new URL(request.url);
    const parsed = productListSchema.parse({
      search: url.searchParams.get("search") ?? "",
      category: url.searchParams.get("category") ?? "all",
      status: url.searchParams.get("status") ?? "all",
      sortField: url.searchParams.get("sortField") ?? "name",
      sortDirection: url.searchParams.get("sortDirection") ?? "asc",
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("pageSize") ?? "8",
    });

    const result = await fetchProducts(parsed);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();
    const body = await request.json();
    const data = productCreateSchema.parse(body);

    const validCategory = await categoryExists(data.category);
    if (!validCategory) {
      return NextResponse.json(
        { error: "Invalid category selected.", fields: { category: ["Please select a valid category."] } },
        { status: 400 },
      );
    }

    const sku = await generateSku(data.name);
    const product = await createProduct(data, sku);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

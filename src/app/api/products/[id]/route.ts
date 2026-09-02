import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { categoryExists } from "@/lib/categories-repo";
import { connectDb } from "@/lib/mongodb";
import { productUpdateSchema } from "@/lib/product-schemas";
import {
  deleteProduct,
  fetchProductById,
  updateProduct,
} from "@/lib/products-repo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    if (data.category) {
      const validCategory = await categoryExists(data.category);
      if (!validCategory) {
        return NextResponse.json(
          { error: "Invalid category selected.", fields: { category: ["Please select a valid category."] } },
          { status: 400 },
        );
      }
    }

    const product = await updateProduct(id, data);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await connectDb();
    const { id } = await params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

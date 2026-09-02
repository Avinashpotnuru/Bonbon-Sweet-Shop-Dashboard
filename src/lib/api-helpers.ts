import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error && error.message === "DUPLICATE_SKU") {
    return NextResponse.json(
      { error: "A product with this SKU already exists." },
      { status: 409 },
    );
  }

  if (error instanceof Error && error.message === "DUPLICATE_NAME") {
    return NextResponse.json(
      {
        error: "A record with this name already exists.",
        fields: { name: ["This name is already in use."] },
      },
      { status: 409 },
    );
  }

  if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
    return NextResponse.json(
      {
        error: "A record with this slug already exists.",
        fields: { name: ["This name results in a slug that is already in use."] },
      },
      { status: 409 },
    );
  }

  if (error instanceof Error && error.message === "DUPLICATE_EMAIL") {
    return NextResponse.json(
      {
        error: "A customer with this email already exists.",
        fields: { email: ["This email is already in use."] },
      },
      { status: 409 },
    );
  }

  console.error("[api] internal error:", error);
  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
}

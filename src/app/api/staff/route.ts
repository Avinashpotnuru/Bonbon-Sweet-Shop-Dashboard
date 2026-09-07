import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { staffCreateSchema } from "@/lib/auth-schemas";
import { createUser, listStaffUsers } from "@/lib/auth-repo";
import { connectDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["users.manage"]);
    await connectDb();
    const users = await listStaffUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["users.manage"]);
    await connectDb();
    const body = await request.json();
    const data = staffCreateSchema.parse(body);
    const user = await createUser(data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_EMAIL") {
      return NextResponse.json(
        {
          error: "A user with this email already exists.",
          fields: { email: ["This email is already in use."] },
        },
        { status: 409 },
      );
    }
    return handleApiError(error);
  }
}
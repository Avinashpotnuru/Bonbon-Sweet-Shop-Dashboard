import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { staffUpdateSchema } from "@/lib/auth-schemas";
import { updateUser } from "@/lib/auth-repo";
import { connectDb } from "@/lib/mongodb";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["users.manage"]);
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = staffUpdateSchema.parse(body);
    const user = await updateUser(id, data);
    if (!user) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }
    return NextResponse.json({ user });
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
import { NextResponse } from "next/server";

import { registerSchema } from "@/lib/auth-schemas";
import { createUser } from "@/lib/auth-repo";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["users.manage"]);

    await connectDb();
    const body = await request.json();
    const data = registerSchema.parse(body);
    const user = await createUser(data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

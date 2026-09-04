import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { getReports } from "@/lib/reports-repo";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["reports.view"]);

    await connectDb();
    const payload = await getReports();
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { getReports } from "@/lib/reports-repo";

export async function GET() {
  try {
    await connectDb();
    const payload = await getReports();
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

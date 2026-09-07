import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import { listActiveCoupons } from "@/lib/coupon-repo";

/**
 * Public, unauthenticated endpoint that returns the currently redeemable
 * coupons so storefront customers can discover and apply offers.
 */
export async function GET() {
  try {
    await connectDb();
    const coupons = await listActiveCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}
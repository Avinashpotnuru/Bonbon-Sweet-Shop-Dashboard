import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { couponCreateSchema } from "@/lib/coupon-schemas";
import { listCoupons, createCoupon } from "@/lib/coupon-repo";

export async function GET() {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["coupons.view"]);
    await connectDb();
    const coupons = await listCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["coupons.manage"]);
    await connectDb();
    const body = await request.json();
    const data = couponCreateSchema.parse(body);
    const coupon = await createCoupon(data);
    if ("error" in coupon) {
      return NextResponse.json({ error: coupon.error }, { status: 409 });
    }
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
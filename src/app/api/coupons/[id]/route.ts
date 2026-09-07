import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-helpers";
import { requireApiAuth, requireApiPermission } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { couponUpdateSchema } from "@/lib/coupon-schemas";
import { deleteCoupon, updateCoupon } from "@/lib/coupon-repo";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["coupons.manage"]);
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const data = couponUpdateSchema.parse(body);
    const coupon = await updateCoupon(id, data);
    if (coupon === null) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }
    if ("error" in coupon) {
      return NextResponse.json({ error: coupon.error }, { status: 409 });
    }
    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireApiAuth();
    requireApiPermission(session, ["coupons.manage"]);
    await connectDb();
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
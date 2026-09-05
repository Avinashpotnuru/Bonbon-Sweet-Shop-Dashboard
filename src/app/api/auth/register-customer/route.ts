import { NextResponse } from "next/server";

import { customerRegisterSchema } from "@/lib/customer-auth-schemas";
import { createUser } from "@/lib/auth-repo";
import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";

/**
 * Public self-service registration for storefront customers.
 * Unlike the dashboard `/api/auth/register` (admin-only), this endpoint is
 * intentionally unauthenticated so shoppers can create their own account.
 * Accounts are created with the `customer` role, which holds zero dashboard
 * permissions and therefore can never access the Admin Dashboard.
 */
export async function POST(request: Request) {
  try {
    await connectDb();
    const body = await request.json();
    const data = customerRegisterSchema.parse(body);
    const user = await createUser({
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: "customer",
    });
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

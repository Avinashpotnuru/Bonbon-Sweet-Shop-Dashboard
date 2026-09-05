import { handleLoginRequest } from "@/lib/api-login";

/**
 * Staff-only sign-in for the Admin Dashboard login (/admin/login). Reuses the
 * shared authentication logic but only ever creates a session for admin,
 * manager and staff accounts — customers are rejected server-side without a
 * session and pointed at the storefront login (/login).
 */
export async function POST(request: Request) {
  return handleLoginRequest(request, {
    rejectRole: (role) => role === "customer",
    rejectMessage:
      "This login is for staff and admins only. Customers sign in from the storefront login.",
  });
}
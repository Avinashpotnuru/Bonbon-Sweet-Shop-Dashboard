import { handleLoginRequest } from "@/lib/api-login";

/**
 * Customer-only sign-in for the storefront /login page. Reuses the shared
 * authentication logic but only ever creates a session for `customer` accounts
 * — admins, managers and staff are rejected server-side without a session and
 * pointed at the Admin Dashboard login (/admin/login).
 */
export async function POST(request: Request) {
  return handleLoginRequest(request, {
    rejectRole: (role) => role !== "customer",
    rejectMessage:
      "This sign-in is for customers only. Staff and admins use the Admin Dashboard login.",
  });
}
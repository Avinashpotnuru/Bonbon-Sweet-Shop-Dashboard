import "server-only";

import { redirect } from "next/navigation";

import { getSession, type SessionPayload } from "@/lib/auth";

const CUSTOMER_LOGIN = "/account/login";

/**
 * Server-side guard for customer account pages. Redirects to the customer
 * sign-in page when there is no valid `customer` session (anonymous visitors
 * and admin/staff users are both redirected away). Pass `nextPath` to send
 * the customer back to where they were headed after signing in. This mirrors
 * how the dashboard guards its pages, keeping customer and admin areas fully
 * separated.
 */
export async function requireCustomerSession(
  nextPath?: string,
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect(
      nextPath
        ? `${CUSTOMER_LOGIN}?next=${encodeURIComponent(nextPath)}`
        : CUSTOMER_LOGIN,
    );
  }
  return session;
}

/**
 * API guard for customer account endpoints. Throws tagged errors that
 * `handleApiError` maps to 401 (anonymous) or 403 (non-customer).
 */
export async function requireCustomerApi(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.role !== "customer") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

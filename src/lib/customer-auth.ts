import "server-only";

import { redirect } from "next/navigation";

import { getSession, type SessionPayload } from "@/lib/auth";

const CUSTOMER_LOGIN = "/login";

/**
 * Server-side guard for customer account pages.
 *  · Logged-out visitors → the customer sign-in page (with `next` back-link).
 *  · Admin/manager/staff sessions → the dashboard (they have no customer access).
 * Customers pass through and the session is returned. This mirrors how the
 * dashboard guards its pages, keeping customer and admin areas fully separated.
 */
export async function requireCustomerSession(
  nextPath?: string,
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect(
      nextPath
        ? `${CUSTOMER_LOGIN}?next=${encodeURIComponent(nextPath)}`
        : CUSTOMER_LOGIN,
    );
  }
  if (session.role !== "customer") {
    redirect("/dashboard");
  }
  return session;
}

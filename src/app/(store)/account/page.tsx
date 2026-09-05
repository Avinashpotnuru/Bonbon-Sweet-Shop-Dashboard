import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

/**
 * Storefront account index. Routes by who is browsing:
 *  · guests → customer sign-in
 *  · customers → their account area
 *  · staff/admins → the dashboard they belong on
 */
export default async function AccountIndexPage() {
  const session = await getSession();
  if (!session) {
    redirect("/account/login");
  }
  if (session.role !== "customer") {
    redirect("/dashboard");
  }
  redirect("/account/profile");
}
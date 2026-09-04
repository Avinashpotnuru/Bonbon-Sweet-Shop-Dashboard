import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import type { Permission, Role } from "./auth-types";
import { roleHasAny, ROLE_PERMISSIONS } from "./auth-types";

const COOKIE_NAME = "bonbon_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: Role;
};

export async function createSession(
  userId: string,
  role: Role,
): Promise<void> {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    const role = payload.role as Role;
    if (!ROLE_PERMISSIONS[role]) return null;
    return { userId: payload.sub, role };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * Guard for page/layout components. Redirects to /login when there is no
 * valid session. Returns the session payload on success.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Guard for owner/staff-restricted pages. Redirects a signed-in user with an
 * unauthorized role back to the dashboard.
 */
export async function requirePageRole(
  allowed: Role[],
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Permission-based page guard. Requires a valid session that holds at least one
 * of the given permissions, otherwise it redirects back to the dashboard.
 * This is the preferred guard for restricted pages.
 */
export async function requirePagePermission(
  permissions: Permission[],
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roleHasAny(session.role, permissions)) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Guard for API route handlers. Throws a tagged error that
 * `handleApiError` maps to a 401 response.
 */
export async function requireApiAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Role guard for API handlers. Must be called after (or together with)
 * `requireApiAuth`. Throws 403 when the session role is not allowed.
 */
export function requireApiRole(
  session: SessionPayload,
  allowed: Role[],
): void {
  if (!allowed.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Permission-based guard for API handlers. Must be called after (or together
 * with) `requireApiAuth`. Throws 403 when the session lacks every permission.
 * This is the preferred guard for restricting API reads and mutations.
 */
export function requireApiPermission(
  session: SessionPayload,
  permissions: Permission[],
): void {
  if (!roleHasAny(session.role, permissions)) {
    throw new Error("FORBIDDEN");
  }
}

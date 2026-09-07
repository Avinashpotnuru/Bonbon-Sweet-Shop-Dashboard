import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/auth-schemas";
import { findUserByEmail, verifyPassword } from "@/lib/auth-repo";
import { createSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { connectDb } from "@/lib/mongodb";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
} from "@/lib/rate-limit";

const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_ATTEMPTS = 20;
const EMAIL_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_MAX_ATTEMPTS = 5;

type LoginRoleRules = {
  rejectRole: (role: string) => boolean;
  rejectMessage: string;
};

export async function handleLoginRequest(
  request: Request,
  rules: LoginRoleRules,
) {
  try {
    await connectDb();

    const ip = getClientIp(request);
    const ipKey = `ip:${ip ?? "unknown"}`;
    const ipCheck = checkRateLimit(ipKey, IP_MAX_ATTEMPTS, IP_WINDOW_MS);
    if (ipCheck.limited) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSec) } },
      );
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    const user = await findUserByEmail(email.toLowerCase());
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      const emailCheck = checkRateLimit(
        `email:${email.toLowerCase()}`,
        EMAIL_MAX_ATTEMPTS,
        EMAIL_WINDOW_MS,
      );
      if (emailCheck.limited) {
        return NextResponse.json(
          { error: "Too many attempts for this account. Please try again later." },
          { status: 429, headers: { "Retry-After": String(emailCheck.retryAfterSec) } },
        );
      }
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

if (user.status === "inactive") {
      return NextResponse.json(
        {
          error:
            "This account has been deactivated. Contact an administrator for help.",
        },
        { status: 403 },
      );
    }

    if (rules.rejectRole(user.role)) {
      return NextResponse.json(
        { error: rules.rejectMessage },
        { status: 403 },
      );
    }

    resetRateLimit(`email:${email.toLowerCase()}`);
    await createSession(user.id, user.role);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "bonbon_session";
const ADMIN_LOGIN = "/admin/login";
const CUSTOMER_LOGIN = "/login";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

async function getSessionRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || AUTH_SECRET.length === 0) return null;
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return (payload.role as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = CUSTOMER_LOGIN;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const isAdminZone =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isAdminZone) {
    if (pathname === ADMIN_LOGIN) {
      return NextResponse.next();
    }
    const role = await getSessionRole(request);
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN;
      return NextResponse.redirect(url);
    }
    if (role === "customer") {
      const url = request.nextUrl.clone();
      url.pathname = "/account/profile";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*"],
};
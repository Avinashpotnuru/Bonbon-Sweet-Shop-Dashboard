import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "bonbon_session";

const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/register"];

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
    if (PUBLIC_ACCOUNT_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const role = await getSessionRole(request);

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";

  if (!role) {
    return NextResponse.redirect(loginUrl);
  }

  // Storefront customers are never allowed into the admin dashboard.
  if (role === "customer") {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/account/profile";
    return NextResponse.redirect(accountUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
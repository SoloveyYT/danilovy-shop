import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/constants";

const protectedPrefixes = ["/checkout", "/account"];
const adminPrefix = "/admin";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecretKey();

  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  const needsAdmin = pathname.startsWith(adminPrefix);

  if (!needsAuth && !needsAdmin) {
    return NextResponse.next();
  }

  if (!token || !secret) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;
    if (needsAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/checkout/:path*", "/account/:path*", "/admin", "/admin/:path*"],
};

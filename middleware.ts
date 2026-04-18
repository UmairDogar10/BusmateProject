import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/** Must match `JWT_SECRET` used in `lib/auth.ts` (jsonwebtoken sign) and API routes. */
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function verifyToken(token?: string) {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const role = payload.role;
    if (typeof role === "string") {
      return { role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const payload = await verifyToken(token);

  if (pathname === "/login" || pathname === "/signup") {
    if (payload && payload.role) {
      return NextResponse.redirect(new URL(`/${payload.role}`, request.url));
    }
    return NextResponse.next();
  }

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/driver") && payload.role !== "driver") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/student") && payload.role !== "student") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/driver/:path*",
    "/student/:path*",
    "/login",
    "/signup",
  ],
};

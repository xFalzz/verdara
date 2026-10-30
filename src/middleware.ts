import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * VERDARA EDGE SECURITY MIDDLEWARE
 * Enforces defense-in-depth HTTP security headers (OWASP ASVS Level 2):
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: camera=(self), geolocation=(self), microphone=()
 * - X-XSS-Protection: 1; mode=block
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), geolocation=(self), microphone=()"
  );
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Verdara-Security-Shield", "Active-v3.2");

  // Protect mutating API endpoints against cross-site origin spoofing
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    request.method === "POST"
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { error: "CSRF Origin Mismatch Blocked by Verdara Security Shield" },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};

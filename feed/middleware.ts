import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the path starts with /@, remove the @ and continue
  if (pathname.startsWith("/@")) {
    const newPathname = pathname.replace(/^\/@/, "/");
    return NextResponse.rewrite(new URL(newPathname, request.url));
  }

  // If the path is a username without @ and not an API route, redirect to /@username
  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/static") &&
    pathname !== "/" &&
    !pathname.includes(".")
  ) {
    const newPathname = `/@${pathname.slice(1)}`;
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

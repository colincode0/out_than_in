import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Handle @leaderboard redirect
  if (pathname === "/@leaderboard") {
    url.pathname = "/explore/leaderboard";
    return NextResponse.redirect(url);
  }

  // Remove @ from URLs
  if (pathname.startsWith("/@")) {
    // Don't modify the URL if it's a reserved path
    const reservedPaths = ["/@explore", "/@feed"];
    if (reservedPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // Remove @ from the URL
    url.pathname = pathname.replace("/@", "/");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths that start with @
    "/@:path*",
    // Match specific paths that need redirecting
    "/@leaderboard",
  ],
};

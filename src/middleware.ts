import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("kat-access-token")?.value;

  if (!token) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("expired", "1");
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

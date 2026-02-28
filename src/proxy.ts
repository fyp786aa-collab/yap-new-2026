import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async function middleware(req: NextRequest) {
  // Let NextAuth handle its own routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/api/auth/:path*"],
};

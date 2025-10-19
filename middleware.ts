import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER;
const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS;

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
  });
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!ADMIN_BASIC_USER || !ADMIN_BASIC_PASS) {
    console.warn("ADMIN_BASIC_USER or ADMIN_BASIC_PASS is not set. Skipping admin auth.");
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  const credentials = Buffer.from(authorization.slice(6), "base64").toString();
  const separatorIndex = credentials.indexOf(":");
  if (separatorIndex === -1) {
    return unauthorized();
  }

  const username = credentials.slice(0, separatorIndex);
  const password = credentials.slice(separatorIndex + 1);

  if (username !== ADMIN_BASIC_USER || password !== ADMIN_BASIC_PASS) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

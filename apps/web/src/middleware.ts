import { NextResponse, type NextRequest } from "next/server";
import {
  decideAccess,
  ROLE_COOKIE,
  TOKEN_COOKIE,
} from "./modules/auth/frontend/services/route-access";

// Las pantallas privadas nunca deben guardarse en la caché del navegador (CA-05.1 y CA-05.6)
const NO_STORE = "no-store, no-cache, must-revalidate, max-age=0";

export function middleware(request: NextRequest) {
  const decision = decideAccess(
    request.nextUrl.pathname,
    request.cookies.get(TOKEN_COOKIE)?.value,
    request.cookies.get(ROLE_COOKIE)?.value,
  );

  const response = decision.allowed
    ? NextResponse.next()
    : NextResponse.redirect(new URL(decision.redirectTo, request.url));
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}

export const config = {
  matcher: ["/login", "/applications/:path*", "/me/:path*"],
};
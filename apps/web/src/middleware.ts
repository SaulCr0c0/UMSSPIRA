import { NextResponse, type NextRequest } from "next/server";
import {
  decideAccess,
  LOGIN_PATH,
  TOKEN_COOKIE,
} from "./modules/auth/frontend/services/route-access";

const VALID_ROLES = new Set(["administrador", "empresa", "titulado"]);

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;
  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  if (!token || !API_URL) return redirect(LOGIN_PATH);

  try {
    const response = await fetch(`${API_URL.replace(/\/$/, "")}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return redirect(LOGIN_PATH);
    const body: unknown = await response.json();
    const payload = body as { data?: { role?: unknown } } | null;
    const role = payload?.data?.role;
    if (typeof role !== "string" || !VALID_ROLES.has(role)) {
      return redirect(LOGIN_PATH);
    }

    const decision = decideAccess(pathname, token, role);
    return decision.allowed ? NextResponse.next() : redirect(decision.redirectTo);
  } catch {
    return redirect(LOGIN_PATH);
  }
}

export const config = {
  matcher: [
    "/applications/:path*",
    "/me/:path*",
    "/afinidad",
    "/afinidad/:path*",
    "/empresa/postulantes",
    "/empresa/postulantes/:path*",
    "/postulantes",
    "/postulantes/:path*",
  ],
};

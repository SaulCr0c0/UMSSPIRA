import { NextResponse, type NextRequest } from 'next/server';
import { decideAccess, LOGIN_PATH } from './modules/auth/frontend/services/route-access';

const VALID_ROLES = new Set(['administrador', 'empresa', 'titulado']);
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function middleware(request: NextRequest) {
  const refresh = request.cookies.get('umsspira_refresh')?.value;
  const redirect = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!refresh) return redirect(LOGIN_PATH);
  try {
    // Consultar la sesión sin rotarla permite navegaciones paralelas.
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/v1/auth/session`, {
      headers: { Cookie: `umsspira_refresh=${encodeURIComponent(refresh)}` },
      cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) {
      // La sesión ya no es válida: eliminar cookies de autenticación, no solo redirigir.
      const expired = redirect(LOGIN_PATH);
      for (const name of ['umsspira_token', 'umsspira_refresh', 'umsspira_csrf', 'umsspira_role']) {
        expired.cookies.delete(name);
      }
      expired.headers.set('Cache-Control', 'no-store');
      return expired;
    }
    if (!response.ok) throw new Error('Servicio no disponible');
    const body = await response.json() as { data?: { role?: unknown } };
    const role = body.data?.role;
    if (typeof role !== 'string' || !VALID_ROLES.has(role)) return redirect(LOGIN_PATH);
    const decision = decideAccess(request.nextUrl.pathname, 'sesion-verificada', role);
    const result = decision.allowed ? NextResponse.next() : redirect(decision.redirectTo);
    result.headers.set('Cache-Control', 'no-store');
    return result;
  } catch {
    return new NextResponse('No se pudo verificar la sesión. Inténtalo nuevamente.', {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
}

export const config = { matcher: [
  '/applications/:path*', '/reports/:path*', '/me/:path*', '/afinidad', '/afinidad/:path*',
  '/empresa/postulantes', '/empresa/postulantes/:path*', '/postulantes', '/postulantes/:path*',
] };

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const MAX_TOKEN_LENGTH = 8192;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'La sesión no es válida.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'La sesión no es válida.' }, { status: 400 });
  }

  const { token, role, remember } = body as Record<string, unknown>;
  if (
    typeof token !== 'string' ||
    !token.trim() ||
    token.length > MAX_TOKEN_LENGTH ||
    (role !== 'administrador' && role !== 'titulado') ||
    (remember !== undefined && typeof remember !== 'boolean')
  ) {
    return NextResponse.json({ message: 'La sesión no es válida.' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const maxAge = remember ? { maxAge: 7 * 24 * 60 * 60 } : {};
  response.cookies.set('umsspira_token', token, { ...COOKIE_OPTIONS, ...maxAge });
  response.cookies.set('umsspira_role', role, { ...COOKIE_OPTIONS, ...maxAge });
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('umsspira_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('umsspira_role', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

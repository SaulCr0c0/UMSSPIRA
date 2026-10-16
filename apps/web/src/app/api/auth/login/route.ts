import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const LOGIN_ERROR_MESSAGE = 'Correo electr\u00f3nico o contrase\u00f1a incorrectos';
const SERVER_ERROR_MESSAGE = 'No fue posible iniciar sesi\u00f3n. Intenta nuevamente m\u00e1s tarde.';
const MAX_TOKEN_LENGTH = 8192;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

function isLoginPayload(value: unknown): value is LoginPayload {
  return !!value && typeof value === 'object'
    && 'email' in value && typeof value.email === 'string' && !!value.email.trim()
    && 'password' in value && typeof value.password === 'string' && !!value.password
    && (!('remember' in value) || typeof value.remember === 'boolean');
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: LOGIN_ERROR_MESSAGE }, { status: 400 });
  }

  if (!isLoginPayload(body)) {
    return NextResponse.json({ message: LOGIN_ERROR_MESSAGE }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(API_URL + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('No se pudo conectar con el servicio de autenticaci\u00f3n.', error);
    return NextResponse.json({ message: SERVER_ERROR_MESSAGE }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { message: upstream.status >= 500 ? SERVER_ERROR_MESSAGE : LOGIN_ERROR_MESSAGE },
      { status: upstream.status >= 500 ? 502 : upstream.status },
    );
  }

  let result: unknown;
  try {
    result = await upstream.json();
  } catch {
    return NextResponse.json({ message: SERVER_ERROR_MESSAGE }, { status: 502 });
  }

  if (!result || typeof result !== 'object' || !('data' in result)
    || !result.data || typeof result.data !== 'object'
    || !('accessToken' in result.data) || typeof result.data.accessToken !== 'string'
    || !result.data.accessToken.trim() || result.data.accessToken.length > MAX_TOKEN_LENGTH
    || !('role' in result.data)
    || (result.data.role !== 'administrador' && result.data.role !== 'titulado')) {
    return NextResponse.json({ message: SERVER_ERROR_MESSAGE }, { status: 502 });
  }

  const { accessToken, role } = result.data;
  const response = NextResponse.json({ data: { accessToken, role } });
  const maxAge = body.remember ? { maxAge: 7 * 24 * 60 * 60 } : {};
  response.cookies.set('umsspira_token', accessToken, { ...COOKIE_OPTIONS, ...maxAge });
  response.cookies.set('umsspira_role', role, { ...COOKIE_OPTIONS, ...maxAge });
  return response;
}

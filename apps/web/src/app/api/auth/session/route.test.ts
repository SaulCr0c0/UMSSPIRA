/** @jest-environment node */

import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/auth/session', () => {
  it('crea cookies HttpOnly para el token y el rol', async () => {
    const request = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'access-token', role: 'administrador', remember: true }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    for (const name of ['umsspira_token', 'umsspira_role']) {
      const cookie = response.cookies.get(name);
      expect(cookie?.httpOnly).toBe(true);
      expect(cookie?.sameSite).toBe('lax');
      expect(cookie?.path).toBe('/');
      expect(cookie?.maxAge).toBe(7 * 24 * 60 * 60);
    }
  });

  it('rechaza un rol no soportado y no emite cookies', async () => {
    const request = new NextRequest('http://localhost/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'access-token', role: 'superadmin' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.cookies.getAll()).toHaveLength(0);
  });
});

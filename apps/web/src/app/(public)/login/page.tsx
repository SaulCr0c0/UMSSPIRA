'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/shared/services/auth-session';

// /login ya no muestra una pantalla intermedia; conserva el acceso de prueba local.
const LOCAL_MENTOR_TEST_TOKEN = 'umsspira-local-mentor-test-only';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setAccessToken(LOCAL_MENTOR_TEST_TOKEN);
      router.replace('/mentorias/perfil/areas');
      return;
    }
    router.replace('/mentorias/perfil');
  }, [router]);

  return null;
}

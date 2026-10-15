'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { UserRole } from '../services/auth.service';

const AuthenticatedUserContext = createContext<string | null>(null);
const AuthenticatedUserRoleContext = createContext<UserRole | null>(null);

export function AuthenticatedUserProvider({
  userId,
  role,
  children,
}: {
  userId: string;
  role?: UserRole;
  children: ReactNode;
}) {
  return (
    <AuthenticatedUserRoleContext.Provider value={role ?? null}>
      <AuthenticatedUserContext.Provider value={userId}>
        {children}
      </AuthenticatedUserContext.Provider>
    </AuthenticatedUserRoleContext.Provider>
  );
}

export function useAuthenticatedUserId(): string | undefined {
  return useContext(AuthenticatedUserContext) ?? undefined;
}

export function useAuthenticatedUserRole(): UserRole | undefined {
  return useContext(AuthenticatedUserRoleContext) ?? undefined;
}

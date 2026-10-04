// packages/shared-types/src/auth.ts

export type UserRole = "administrador" | "titulado";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  role: UserRole;
};
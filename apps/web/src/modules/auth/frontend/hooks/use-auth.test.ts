/// <reference types="jest" />

import { act, renderHook } from "@testing-library/react";
import { authStore } from "../store";
import { LOGIN_ERROR_MESSAGE } from "../services";
import { useAuth } from "./use-auth";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("useAuth", () => {
  beforeEach(() => {
    mockPush.mockClear();
    authStore.reset();
  });

  it("inicia sesión como administrador y redirige a /applications", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ email: "admin@umss.edu.bo", password: "admin1234" });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.role).toBe("administrador");
    expect(result.current.accessToken).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith("/applications");
  });

  it("inicia sesión como titulado y redirige a /me", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ email: "titulado@umss.edu.bo", password: "titulado1234" });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.role).toBe("titulado");
    expect(mockPush).toHaveBeenCalledWith("/me");
  });

  it("guarda el mensaje genérico cuando las credenciales son incorrectas", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ email: "nadie@umss.edu.bo", password: "incorrecta" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe(LOGIN_ERROR_MESSAGE);
    expect(result.current.accessToken).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
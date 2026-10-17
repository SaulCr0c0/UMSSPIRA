/// <reference types="jest" />
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { authStore } from "../store";
import { LogoutButton } from "./logout-button";

const mockPush = jest.fn();
const originalFetch = global.fetch;
const mockHardRedirect = jest.fn();

// El botón ya no usa el router: hace una navegación completa para limpiar la caché de Next
jest.mock("../services/navigation", () => ({
  hardRedirect: (path: string) => mockHardRedirect(path),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    authStore.reset();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("descarta la sesión y vuelve al login (CA-05.6)", async () => {
    authStore.setState({ status: "authenticated", role: "administrador", accessToken: "token" });
    mockHardRedirect.mockClear();
    saveSession("token-abc", "titulado", false);
    authStore.setState({ status: "authenticated", role: "titulado", accessToken: "token-abc" });
  });

  it("descarta la sesión y vuelve al login (CA-05.6)", () => {
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
      expect(authStore.getState().status).toBe("idle");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
    expect(document.cookie).not.toContain("umsspira_token");
    expect(authStore.getState().status).toBe("idle");
    expect(mockHardRedirect).toHaveBeenCalledWith("/login");
  });
});
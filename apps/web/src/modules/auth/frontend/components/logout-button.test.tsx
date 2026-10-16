/// <reference types="jest" />
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { authStore } from "../store";
import { LogoutButton } from "./logout-button";

const mockPush = jest.fn();
const originalFetch = global.fetch;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
      expect(authStore.getState().status).toBe("idle");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
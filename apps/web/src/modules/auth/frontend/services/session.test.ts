/// <reference types="jest" />
import { clearSession, saveSession } from "./session";

describe("sesión segura", () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;
  });

  afterEach(async () => {
    await clearSession();
    global.fetch = originalFetch;
  });

  it("envía el token y rol al servidor para guardarlos como cookies HttpOnly", async () => {
    await saveSession("token-de-prueba", "administrador", false);

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ token: "token-de-prueba", role: "administrador", remember: false }),
    }));
    expect(document.cookie).not.toContain("umsspira_token");
    expect(document.cookie).not.toContain("umsspira_role");
  });

  it("solicita al servidor borrar las cookies HttpOnly al cerrar sesión", async () => {
    await clearSession();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
  });
});
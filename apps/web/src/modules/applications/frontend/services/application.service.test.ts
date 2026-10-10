/// <reference types="jest" />
import {
  fetchApplications,
  isOverdue,
  shortCareer,
  type Application,
  type ApplicationsQuery,
} from "./application.service";

const HOUR = 3_600_000;
const NOW = Date.now();

function makeApplication(status: Application["status"], hoursAgo: number): Application {
  return {
    id: "prueba",
    code: "EGR-2025-000001",
    fullName: "Ana Prueba",
    email: "ana.prueba@gmail.com",
    ci: "1234567",
    issuedIn: "CB",
    sisCode: "201600001",
    career: "Ingeniería de Sistemas",
    status,
    submittedAt: new Date(NOW - hoursAgo * HOUR).toISOString(),
  };
}

const baseQuery: ApplicationsQuery = { page: 1, career: "", status: "", search: "" };

describe("isOverdue (alerta de 48 horas, CA-04.1)", () => {
  it("marca una solicitud pendiente de más de 48 horas", () => {
    expect(isOverdue(makeApplication("pendiente", 60), NOW)).toBe(true);
  });

  it("no marca una pendiente dentro del plazo", () => {
    expect(isOverdue(makeApplication("pendiente", 10), NOW)).toBe(false);
  });

  it("no marca las solicitudes que ya tienen dictamen", () => {
    expect(isOverdue(makeApplication("aprobado", 100), NOW)).toBe(false);
    expect(isOverdue(makeApplication("rechazado", 100), NOW)).toBe(false);
  });
});

describe("shortCareer", () => {
  it("abrevia el nombre de la carrera", () => {
    expect(shortCareer("Ingeniería de Sistemas")).toBe("Ing. de Sistemas");
  });
});

describe("fetchApplications", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    document.cookie = "umsspira_token=; path=/; max-age=0";
  });

  function mockFetch(response: { ok: boolean; status?: number; body?: unknown }) {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? 200,
      json: async () => response.body,
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it("pide la página con los filtros y envía el token", async () => {
    document.cookie = "umsspira_token=token-de-prueba; path=/";
    const fetchMock = mockFetch({ ok: true, body: { data: { items: [], total: 0 } } });

    await fetchApplications({ page: 2, career: "Ingeniería de Sistemas", status: "pendiente", search: " ana " });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/applications?");
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=15");
    expect(url).toContain("career=");
    expect(url).toContain("status=pendiente");
    expect(url).toContain("search=ana");
    expect(options.headers.Authorization).toBe("Bearer token-de-prueba");
  });

  it("omite los filtros vacíos", async () => {
    const fetchMock = mockFetch({ ok: true, body: { data: { items: [], total: 0 } } });

    await fetchApplications(baseQuery);

    const [url] = fetchMock.mock.calls[0];
    expect(url).not.toContain("career=");
    expect(url).not.toContain("status=");
    expect(url).not.toContain("search=");
  });

  it("devuelve las solicitudes y el total que entrega la API", async () => {
    const application = makeApplication("pendiente", 60);
    mockFetch({ ok: true, body: { data: { items: [application], total: 42 } } });

    const result = await fetchApplications(baseQuery);

    expect(result.total).toBe(42);
    expect(result.items).toEqual([application]);
  });

  it("falla cuando la API responde con error", async () => {
    mockFetch({ ok: false, status: 401, body: {} });

    await expect(fetchApplications(baseQuery)).rejects.toThrow("401");
  });
});